var input = document.getElementById('user-upload');
var cover = document.getElementById('cover');
input.onchange = function(evt){
    var tgt = evt.target || window.event.srcElement,
        files = tgt.files;

    if (FileReader && files && files.length) {
        var fr = new FileReader();
        fr.readAsDataURL(files[0]);
        fr.onload = function(){
          cover.src = fr.result;
          reload() //load the canvas and color schemes again
        }
    }
}

function reload(){
  document.getElementById("grid").style.display = "none";
  loading.style.display = "block";

  grid = new Array();
  dark = new Array();
  light = new Array();

  //clear the color scheme divs
  document.getElementById("dark").innerHTML = '';
  document.getElementById("light").innerHTML = '';
  customCon.innerHTML = '';

  for(var i = 0; i < 8; i++){
    var block = document.createElement('div');
    block.className = "block" + " unselectable";
    block.id = "block" + i;
    block.style.backgroundColor = "#fff";
    block.innerHTML = "custom";
    customCon.appendChild(block);
  }

  window.clearInterval(loop);

  palette = new Image();
  palette.src = cover.src;
  palette.onload = function(){
    init();
  }

  loop = window.setInterval(function(){
    draw();
    update(); //we only need mouse detection
  }, 30);
}
