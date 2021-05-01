
parkPath = 'https://gist.githubusercontent.com/zjalexzhou/U-Green-Houston/main/data/houstonParkServe.geojson'
parkServePath = 'https://gist.githubusercontent.com/zjalexzhou/U-Green-Houston/main/data/houstonParkServe.geojson'


/* ===============================
Operation Control Configuration
=============================== */

let menuControl = function(){
    var a = document.getElementById("content");
    //if sidebar is open
    if (a.style.marginLeft == "300px") {
      //change left margin of content
      a.style.marginLeft= "0";
      $('#menuButton').text('Show Menu')
    } else {
      //change left margin of content
      a.style.marginLeft= "300px";
      $('#menuButton').text('Hide Menu')
    }
}


  /* ===========================
Event Functions Configuration
============================= */