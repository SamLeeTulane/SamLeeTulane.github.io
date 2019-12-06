var WIDTH = 480, HEIGHT = 480, canvas, ctx, grid = [], cellSize = 60, palette;

var mouse = {
  x: null,
  y: null
}

function collision(ax, ay, aw, ah, bx, by, bw, bh){
  return ax < bx+bw && ay < by+bh && bx < ax+aw && by < ay+ah
}

function click(x, y, w, h){
  return collision(x, y, w, h, mouse.x, mouse.y, 1, 1)
}

var md = false;

var customCon = document.getElementById('custom');
var loading = document.getElementById("loading");
function load(){
  var time = 0;
  var asynchronous = window.setInterval(function(){
    time++;

    var dots = "";
    for(var i = 0; i < time; i++){
      dots += ".";
    }
    loading.innerText = "Analyzing" + dots.substring(dots.length%5);

    if(grid.length**2 < (WIDTH*HEIGHT)/cellSize**2){
      console.log("Loading...");
    } else {
      window.clearInterval(asynchronous);
      console.log("The canvas has loaded.");
      document.getElementById("loading").style.display = "none";
      document.getElementById("custom").style.display = "block";
    }
  }, 1);

  for(var i = 0; i < 8; i++){
    var block = document.createElement('div');
    block.className = "block" + " unselectable";
    block.id = "block" + i;
    block.style.backgroundColor = "#fff";
    block.innerHTML = "custom";
    customCon.appendChild(block);
  }
}
load();
