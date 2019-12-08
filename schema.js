var palette, loop;

var dark = [];
var light = [];

var custom = 0;

Array.prototype.stanDeviate = function(){
   var i,j,total = 0, mean = 0, diffSqredArr = [];
   for(i=0;i<this.length;i+=1){
       total+=this[i];
   }
   mean = total/this.length;
   for(j=0;j<this.length;j+=1){
       diffSqredArr.push(Math.pow((this[j]-mean),2));
   }
   return (Math.sqrt(diffSqredArr.reduce(function(firstEl, nextEl){
            return firstEl + nextEl;
          })/this.length));
}

function hexToRgba(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
        a: 1
    } : null;
}

function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function inGrid(array, cell){
  for(var i = 0; i < array.length; i++){
    for(var j = 0; j < array[i].length; j++){
      if(Object.is(cell, array[i][j])){
        return true;
      }
    }
  }
  return false;
}

function duplicate(array, color){
  for(var i = 0; i < array.length; i++){
      if(array[i] == color){
         return true;
      }
  }
  return false;
}

function fillShades(){
  var sorted = [];
  for(var i = 0; i < grid.length; i++){
    for(var j = 0; j < grid[i].length; j++){
      var c = hexToRgba(grid[i][j].color);
      var score = Math.round(Math.sqrt((c.r**2+c.g**2+c.b**2)));
      sorted.push(score);
    }
  }
  sorted = sorted.sort(function(a, b){return a-b});
  var stdv = sorted.stanDeviate()*2;

  var scrambled = [];
  for (i = 0; i < grid.length; i++) { //scramble to increase diversity
    scrambled.push(new Array());
    for (j = 0; j < grid[i].length; j++) {
      var rand = grid[Math.round(Math.random()*(grid.length-1))][Math.round(Math.random()*(WIDTH/cellSize-1))];
      while(inGrid(scrambled, rand)){
        rand = grid[Math.round(Math.random()*(grid.length-1))][Math.round(Math.random()*(WIDTH/cellSize-1))];
      }
      scrambled[i].push(rand);
    }
  }

  var lightAnchor = sorted[Math.min(Math.round((0.85+((0.5-Math.random())/2.5))*sorted.length),sorted.length-1)];
  var exit = false, counter = 0;
  while(!exit || counter < cellSize**2-light.length){
    var i = Math.round(Math.random()*(scrambled.length-1));
    var j = Math.round(Math.random()*(WIDTH/cellSize-1));

    var c = hexToRgba(scrambled[i][j].color);
    var score = Math.round(Math.sqrt((c.r**2+c.g**2+c.b**2)));
    if(!duplicate(light, scrambled[i][j].color) && (score <= lightAnchor+stdv && score >= lightAnchor-stdv)){
      if(light.length >= 5){
        exit = true;
      } else {
        light.push(scrambled[i][j].color);
      }
    }
    counter++;
  }


  var darkAnchor = sorted[Math.max(Math.round((0.15+((0.5-Math.random())/2.5))*sorted.length), 0)];
  exit = false, counter = 0;
  while(!exit || counter < cellSize**2-light.length){
    var i = Math.round(Math.random()*(scrambled.length-1));
    var j = Math.round(Math.random()*(WIDTH/cellSize-1));

    var c = hexToRgba(scrambled[i][j].color);
    var score = Math.round(Math.sqrt((c.r**2+c.g**2+c.b**2)));
    if(!duplicate(dark, scrambled[i][j].color) && (score <= darkAnchor+stdv && score >= darkAnchor-stdv)){
      if(dark.length >= 5){
        exit = true;
      } else {
        dark.push(scrambled[i][j].color);
      }
    }
    counter++;
  }

  addShadesToDom();
}

function addShadesToDom(){
  var dc = document.getElementById('dark');
  var lc = document.getElementById('light');
  function dom(c, text, i){
    var div = document.createElement('div');
    div.className = "color";
    div.innerText = c;

    div.style.color = text;
    div.style.backgroundColor = c;

    if(i == 0){
      div.style.borderRadius = "7px 7px 0px 0px";
    } else if(i == 4){
      div.style.borderRadius = "0px 0px 7px 7px";
    }

    return div;
  }

  for(var i = 0; i < light.length; i++){
    lc.appendChild(dom(light[i].toUpperCase(), "rgba(33, 33, 33, 0.75)", i));
  }
  for(var i = 0; i < dark.length; i++){
    dc.appendChild(dom(dark[i].toUpperCase(), "rgba(255, 255, 255, 0.75)", i));
  }
}

function getColor(x, y){
  // var characters = ['A', 'B', 'C', 'D', 'E', 'F', 1, 2, 3, 4, 5, 6, 7, 8, 9, 0];

  var total = {r: 0, g: 0, b: 0};

  for(var i = 0; i < cellSize; i++){
    for(var j = 0; j < cellSize; j++){
        total.r += Math.pow(ctx.getImageData(x+j, y+i, 1, 1).data[0], 2);
        total.g += Math.pow(ctx.getImageData(x+j, y+i, 1, 1).data[1], 2);
        total.b += Math.pow(ctx.getImageData(x+j, y+i, 1, 1).data[2], 2);
    }
  }

  total.r = Math.round(Math.sqrt(total.r/cellSize/cellSize));
  total.g = Math.round(Math.sqrt(total.g/cellSize/cellSize));
  total.b = Math.round(Math.sqrt(total.b/cellSize/cellSize));

  var color = rgbToHex(total.r, total.g, total.b);

  return color;
}

function main(){
  canvas = document.getElementById("board");
  ctx = canvas.getContext('2d');

  canvas.width = WIDTH;
  canvas.height = HEIGHT;

  canvas.onmousemove = function(evt){
    if(!md){
      mouse.x = evt.offsetX;
      mouse.y = evt.offsetY;
    }
  }

  window.onmouseup = function(){
    md = false;
  }
  canvas.onmousedown = function(){
    md = true;
  }

  palette = new Image();
  //palette.crossOrigin = "Anonymous";
  palette.src = document.getElementById("cover").src;

  init();

  loop = window.setInterval(function(){
    draw();
    update(); //we only need mouse detection
  }, 30);

}

function init(){
  //draw image off canvas
  ctx.drawImage(palette, 0, 0, WIDTH, HEIGHT);

  //create grid
  for(var i = 0; i < HEIGHT/cellSize; i++){
    grid.push(new Array());
    for(var j = 0; j < WIDTH/cellSize; j++){
      var cell = {
        x: j*cellSize,
        y: i*cellSize,
        width: cellSize,
        height: cellSize,
        selected: false,
        color: getColor(j*cellSize, i*cellSize),
        update: function(){
          if(click(this.x, this.y, this.width, this.height)){
            this.selected = true;
          } else {
            this.selected = false;
          }

          if(this.selected && md){
            //console.log(this.color);

            var personal = document.getElementById("block" + custom);
            personal.style.backgroundColor = this.color;
            personal.className = "block";

            var copy = personal.cloneNode();
            copy.innerHTML = this.color.toUpperCase();
            customCon.removeChild(personal);
            customCon.insertBefore(copy, document.getElementsByClassName("block")[0]);

            custom++;
            if(custom > 7){
              custom = 0;
            }

            this.md = false;
            mouse.x = -1, mouse.y = -1;
            this.selected = false;
          }
        },
        draw: function(){
          ctx.fillStyle = (md && this.selected) ? "#fff" : this.color;
          //console.log(this.color);
          ctx.fillRect(this.x, this.y, this.width, this.height);
        }
      }
      grid[i].push(cell);
    }
  }

  fillShades();
  document.getElementById("grid").style.display = "inline-flex";
  loading.style.display = "none";
}

function update(){
  for(var i = 0; i < grid.length; i++){
    for(var j = 0; j < grid[i].length; j++){
      grid[i][j].update();
    }
  }
}

function draw(){
  //draw grid
  for(var i = 0; i < grid.length; i++){
    for(var j = 0; j < grid[i].length; j++){
      grid[i][j].draw();
    }
  }
}

window.onload = function(){
  window.setTimeout(main, 30);
}
