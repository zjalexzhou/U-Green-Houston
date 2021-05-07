
let parkPath = 'https://gist.githubusercontent.com/zjalexzhou/dd0479c7dfe1430f936dd4baefa2ba71/raw/3b0f4c049b80d4d137ba4a0f72d8162c4d582447/houstonPark.geojson'
let parkServePath = 'https://gist.githubusercontent.com/zjalexzhou/dd0479c7dfe1430f936dd4baefa2ba71/raw/3b0f4c049b80d4d137ba4a0f72d8162c4d582447/houstonParkServe.geojson'
let parkSectorsPath = 'https://gist.githubusercontent.com/zjalexzhou/aee1963342e86e0fa2228eb48bd6ac72/raw/32511c920fba4228f073da3aafa3a3d73d018ceb/houstonParkSectorData.geojson'
let superNhoodsPath = 'https://gist.githubusercontent.com/zjalexzhou/aee1963342e86e0fa2228eb48bd6ac72/raw/32511c920fba4228f073da3aafa3a3d73d018ceb/houstonSuperNhoodsData.geojson'
let tractsPath = 'https://gist.githubusercontent.com/zjalexzhou/aee1963342e86e0fa2228eb48bd6ac72/raw/32511c920fba4228f073da3aafa3a3d73d018ceb/houstonTractsData.geojson'
let tractsScorePath = 'https://gist.githubusercontent.com/zjalexzhou/caa133df63cb1f9d315dfcd2ac8630a9/raw/c1731847d7a9238966e6a4e0e42ea29b78b2c1e6/houstonPriorityOGS.json'

let pathGroup = [
  [parkPath, "parks"],
  [parkServePath, "parkServiceArea"] ,
  [parkSectorsPath, "parkSectors"],
  [superNhoodsPath, "superNhoods"],
  [tractsPath, "tracts"],
  [tractsScorePath, "tractsScore"]
];

let dataBank = [];

/* ===============================
Operation Control Configuration
=============================== */

let menuControl = function(){
    let a = document.getElementById("content");
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

/*Open Modal on Load*/
$(window).on('load',function(){
  $('#model-about').modal('show');
});

// or on click the help button
$('#infoButton').on('click', function(){
  $('#model-about').modal('show');
})

let modelHide = function(){
  modalToClose = document.getElementsByClassName("modal fade");
  modalToClose.modal('hide')
}


  /* ===========================
Event Functions Configuration
============================= */




  /* ========
Main Call
========== */
$(document).ready(function(){
  let ind = 0;
  _.each(pathGroup, function(e){
    $.ajax(e[0]).done(function(json){
      dataBank[e[1]] = JSON.parse(json);
      ind += 1;
    })
  })
  // _.each(dataBank.tracts.features, function(tract){
  //   geoid = tract.properties.GEOID
  //   console.log(geoid)
  // })
})