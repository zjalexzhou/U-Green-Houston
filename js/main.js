/* =====================
Leaflet Configuration
===================== */

let mapOpts = {
  center:[29.86045, -95.36978], // set map centered around Houston
  zoom: 10,
  zoomControl: false
};

let map = L.map('map', mapOpts);

L.control.zoom({
  position: 'bottomright'
}).addTo(map);

let tileOpts = {
  attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
  subdomains: 'abcd',
  minZoom: 0,
  maxZoom: 20,
  ext: 'png'
};

let Stamen_TonerLite = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', tileOpts).addTo(map);

/* ===============================
Global Variables
=============================== */

// Data path (hosted on Github Gist)
let parkPath = "https://gist.githubusercontent.com/zjalexzhou/98a3cb5960a333c3a73556bb4cfa54eb/raw/ff2425cbca1a764c8c79bc0cc1b8ad5ea02d423b/houstonParksPoint.geojson";
let parkServePath = "https://gist.githubusercontent.com/zjalexzhou/7f937f2d8d358238a00a312626e290f6/raw/e7221e9fc4e23d0779d39dae4a8bc39097e606e1/houstonParkServe.geojson";
let parkSectorsPath = "https://gist.githubusercontent.com/zjalexzhou/7f937f2d8d358238a00a312626e290f6/raw/e7221e9fc4e23d0779d39dae4a8bc39097e606e1/houstonParkSectorData.geojson";
let superNhoodsPath = "https://gist.githubusercontent.com/zjalexzhou/9c9dad4e0520820598e0ffbb24aec660/raw/79b307598123826edcc90cf24b3d5081d855e7e1/superNhoodDataNARemoved.geojson";
let tractsPath = "https://gist.githubusercontent.com/zjalexzhou/b3ac91352a22d127ad80635a84f49c04/raw/37db082cd4f779f067b5591eea2e89574ceda1aa/houstonTractsCleanedPPI.geojson";

// For Data Storage
let park;
let parkServe;
let parkSectors;
let superNeighborhoods;
let tracts;

var ctx1 = document.getElementById('chart1').getContext('2d');
var myChart1 = new Chart(ctx1);
var ctx2 = document.getElementById('chart2').getContext('2d');
var myChart2 = new Chart(ctx2);

let featureGroupId = [];
let featureGroup = [];
let markers = [];
let jenk_class=[];
map.initialBounds = map.getBounds(); // record the initial bounds mapped

/* ===============================
Operation Control Configuration
=============================== */

let downloadLink = function(){
  if (confirm("A pop-up window will direct you to Gist. Continue? (Please enable pop-ups from this site in your browser. Thanks :)")){
    window.open('https://gist.github.com/zjalexzhou/7f937f2d8d358238a00a312626e290f6')
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

  /* ===========================
Event Functions Configuration
============================= */

let tearDown = function(){
  // remove all plotted data in prep for building the page with new data/styling etc
  _.each(featureGroup, function(e){
    map.removeLayer(e);
  });
}

let buildPage = function(pageDefinition, data){
    // build up a "slide" given a page definition
    switch(pageDefinition.pgCode){
      case 0:
        jenk_class = turf.jenks(tracts, "final_score", 5)
        $('#legend-title-show').text('Park Priority Index (0~100)')
        $('#colorRamp2').hide()
        $('#colorRamp1').show()
        break;
      case 1:
        jenk_class = turf.jenks(superNeighborhoods, "AreaServedRatio", 5)
        $('#legend-title-show').text('Park Service Area Coverage (0~1)')
        $('#colorRamp1').hide()
        $('#colorRamp2').show()
        break;
      case 2:
        jenk_class = turf.jenks(parkSectors, "AreaServedRatio", 5)
        $('#legend-title-show').text('Park Service Area Coverage (0~1)')
        $('#colorRamp1').hide()
        $('#colorRamp2').show()
        break;
    }
    if(pageDefinition.filter === undefined){
        theFilter = function() {return true};
    } else {
        theFilter = pageDefinition.filter;
    }
    tmpFeatureGroup = L.geoJson(data, {
      style: pageDefinition.style,
      filter: theFilter
    }).addTo(map);
    // console.log(tmpFeatureGroup)
    tmpFeatureGroup.eachLayer(eachFeatureFunction);
    featureGroupId.push(tmpFeatureGroup._leaflet_id);
    featureGroup.push(tmpFeatureGroup);
    // $('#'+pageDefinition.legendId).show()
    // featureGroup.eachLayer(eachFeatureFunction);
}

let removeMarkers = function(){
  _.each(markers, function(e){
    map.removeLayer(e)
  })
}

let fullExtent = function(){
  removeMarkers();
  map.fitBounds(map.initialBounds);
}

  /* =================
Pages Configuration
=================== */

var parkIcon = L.icon({
      iconUrl: 'icon/park.png',
      iconSize:     [45, 45],
      shadowSize:   [50, 64],
      iconAnchor:   [22, 94],
      popupAnchor:  [-3, -76]
});

var PPIPageDef = {
  pgCode: 0,
  title: "Park Priority Index",
  content: "A measurement of park demand for each census tract to prioritz certain tracts for parkland planning and funding allocation.",
  style: function(feature){
      PPI = feature.properties.final_score;
      $('p[name="jk1"]').text(math.round(jenk_class[0],1))
      $('p[name="jk2"]').text(math.round(jenk_class[1],1))
      $('p[name="jk3"]').text(math.round(jenk_class[2],1))
      $('p[name="jk4"]').text(math.round(jenk_class[3],1))
      $('p[name="jk5"]').text(math.round(jenk_class[4],1))
      $('p[name="jk6"]').text(math.round(jenk_class[5],1))
      if (PPI >= jenk_class[0] & PPI < jenk_class[1]){
        feature.properties['priority'] = '<Strong style="color:green;">Well Below Average</strong>'
        return{color: "green"};
      }
      else if (PPI >= jenk_class[1] & PPI < jenk_class[2]){
        feature.properties['priority'] = '<Strong style="color:#045664;">Below Average</strong>'
        return{color:"#045664"};
      }
      else if (PPI >= jenk_class[2] & PPI < jenk_class[3]){
        feature.properties['priority'] = '<Strong style="color:#B96D40;">Average</strong>'
        return{color:"#B96D40"}
      }
      else if (PPI >= jenk_class[3] & PPI < jenk_class[4]){
        feature.properties['priority'] = '<Strong style="color:#CA054D;">Above Average</strong>'
        return{color:"#CA054D"}
      }
      else if (PPI >= jenk_class[4]){
        feature.properties['priority'] = '<Strong style="color:#3B1C32;">Well Above Average</strong>'
        return{color:"#3B1C32"}
      }
    },
}

let SuperNhoodsServe = {
  pgCode: 1,
  title: "Park Service Area Coverage for each Super Neighborhood ",
  content: "",
  style: function(feature){
    ASR = feature.properties.AreaServedRatio;
    $('p[name="jk1"]').text(math.round(jenk_class[0],1))
    $('p[name="jk2"]').text(math.round(jenk_class[1],1))
    $('p[name="jk3"]').text(math.round(jenk_class[2],1))
    $('p[name="jk4"]').text(math.round(jenk_class[3],1))
    $('p[name="jk5"]').text(math.round(jenk_class[4],1))
    $('p[name="jk6"]').text(math.round(jenk_class[5],1))
    if (ASR >= jenk_class[0] & ASR < jenk_class[1]){
      feature.properties['coverage'] = '<Strong style="color:darkgoldenrod;">Well Below Average</strong>'
      return{color: "darkgoldenrod"};
    }
    else if (ASR >= jenk_class[1] & ASR < jenk_class[2]){
      feature.properties['coverage'] = '<Strong style="color:orange;">Below Average</strong>'
      return{color:"orange"};
    }
    else if (ASR >= jenk_class[2] & ASR < jenk_class[3]){
      feature.properties['coverage'] = '<Strong style="color:#41b6c4;">Average</strong>'
      return{color:"#41b6c4"}
    }
    else if (ASR >= jenk_class[3] & ASR < jenk_class[4]){
      feature.properties['coverage'] = '<Strong style="color:#2c7fb8;">Above Average</strong>'
      return{color:"#2c7fb8"}
    }
    else if (ASR >= jenk_class[4]){
      feature.properties['coverage'] = '<Strong style="color:darkgreen;">Well Above Average</strong>'
      return{color:"darkgreen"}
    }
  },
}

let ParkSectorServe = {
  pgCode: 2,
  title: "Park Service Area Coverage for each Park Sector ",
  content: "",
  style: function(feature){
    ASR = feature.properties.AreaServedRatio;
    $('p[name="jk1"]').text(math.round(jenk_class[0],1))
    $('p[name="jk2"]').text(math.round(jenk_class[1],1))
    $('p[name="jk3"]').text(math.round(jenk_class[2],1))
    $('p[name="jk4"]').text(math.round(jenk_class[3],1))
    $('p[name="jk5"]').text(math.round(jenk_class[4],1))
    $('p[name="jk6"]').text(math.round(jenk_class[5],1))
    if (ASR >= jenk_class[0] & ASR < jenk_class[1]){
      feature.properties['coverage'] = '<Strong style="color:darkgoldenrod;">Well Below Average</strong>'
      return{color: "darkgoldenrod"};
    }
    else if (ASR >= jenk_class[1] & ASR < jenk_class[2]){
      feature.properties['coverage'] = '<Strong style="color:orange;">Below Average</strong>'
      return{color:"orange"};
    }
    else if (ASR >= jenk_class[2] & ASR < jenk_class[3]){
      feature.properties['coverage'] = '<Strong style="color:#41b6c4;">Average</strong>'
      return{color:"#41b6c4"}
    }
    else if (ASR >= jenk_class[3] & ASR < jenk_class[4]){
      feature.properties['coverage'] = '<Strong style="color:#2c7fb8;">Above Average</strong>'
      return{color:"#2c7fb8"}
    }
    else if (ASR >= jenk_class[4]){
      feature.properties['coverage'] = '<Strong style="color:darkgreen;">Well Above Average</strong>'
      return{color:"darkgreen"}
    }
  },
}

let eachFeatureFunction = function(layer) {
  if(layer.feature.properties.final_score >= 0){
    layer.bindTooltip("Park Priority: "+ layer.feature.properties.priority + '<br>\n' + layer.feature.properties.NAME)
  } 
  else if(layer.feature.properties.coverage) {
    if(layer.feature.properties.SNBNAME)
      layer.bindTooltip("Park Coverage: "+ layer.feature.properties.coverage + '<br>\n' + layer.feature.properties.SNBNAME)
    else if(layer.feature.properties.SECTOR) {
      layer.bindTooltip("Park Coverage: "+ layer.feature.properties.coverage + '<br>\n Park Sector ' + 
      layer.feature.properties.SECTOR + " - " + layer.feature.properties.NAME)
    }
  }
  layer.on('click', function (event) {
    console.log(layer)
    console.log(layer.feature.properties.coverage)
    map.fitBounds(event.target.getBounds());
    console.log(layer.feature.properties)
    
    if(layer.feature.properties.SNBNAME){
      $('#modal-spn-label').text(layer.feature.properties.SNBNAME)
      $('#spn-size').text(math.round(layer.feature.properties.ACRES, 2) + " Acres")
      $('#spn-bd').text(layer.feature.properties.BuildingsPerAcre)
      $('#spn-nd').text(layer.feature.properties.Join_Count)
    } else if (layer.feature.properties.rank_final) {
      $('#modal-spn-label').text(layer.feature.properties.NAME)
      $('#spn-size').text(math.round(layer.feature.properties.AreaInAcre, 2) + " Acres")
      $('#spn-bd').text(layer.feature.properties.BuildingsPerAcre)
      $('#spn-nd').text(layer.feature.properties.Join_Count)
    } else if (layer.feature.properties.SECTOR){
      $('#modal-spn-label').text("Park Sector "+layer.feature.properties.SECTOR + " - "+ layer.feature.properties.NAME)
      $('#spn-size').text(math.round(layer.feature.properties.ACRES, 2) + " Acres")
      $('#spn-bd').text(layer.feature.properties.BuildingsPerAcre)
      $('#spn-nd').text(layer.feature.properties.Join_Count)
    }

    $('#modal-spn').modal('show');
    landCoverChart(layer.feature)

    _.each(park.features, function(e){
      // console.log(e)
      parkMarker = L.marker([e.geometry.coordinates[1], e.geometry.coordinates[0]], {icon: parkIcon}).addTo(map)
      // console.log(parkMarker)
      parkMarker['properties'] = e.properties
      parkMarker.properties['SUMOTHERP'] = parkMarker.properties.SUM_TOTPOP - (parkMarker.properties.SUM_SENIOR+parkMarker.properties.SUM_YOUNGP)
      eachParkMarkerFunction(parkMarker)
      markers.push(parkMarker)
    })
  })
}

let eachParkMarkerFunction = function(layer){
  layer.on('click', function (event) {
    console.log(layer)
    
    $('#modal-park-label').text(layer.properties.Park_Name + " "+"- TX "+layer.properties.Park_Urb_1)
    $('#park-size').text(math.round(layer.properties.Park_Size_, 2) + " Acres")
    $('#park-program').text(layer.properties.Park_Local)
    $('#park-hh').text(layer.properties.SUM_TOTHHS)
    $('#park-sp').text(layer.properties.SUM_TOTPOP)
    $('#modal-park').modal('show');

    parkChart(layer.properties)
  })
}

assignClickListener("myRadio1", onRadioClick);
assignClickListener("myRadio2", onRadioClick);
assignClickListener("myRadio3", onRadioClick);

function assignClickListener(id, listener) {
  document.getElementById(id).addEventListener("click", listener);
}

function onRadioClick(event) {
  var target = event.currentTarget,
    selectedIndex = target.id;
    tearDown();
    console.log(selectedIndex)
  switch (selectedIndex) {
    case "myRadio1":
      buildPage(PPIPageDef, tracts)
      break;
    case "myRadio2":
      buildPage(SuperNhoodsServe, superNeighborhoods)
      break;
    case "myRadio3":
      buildPage(ParkSectorServe, parkSectors)
      break;
  };
}

var parkChart = function(data){
  myChart1.destroy()
  myChart1 = new Chart(ctx1, {
      type: 'doughnut',
      data: {
          labels: ['Senior Population', 'Young Population', 'In-between'],
          datasets: [{
              data: [data.SUM_SENIOR, data.SUM_YOUNGP, data.SUMOTHERP],
              backgroundColor: [
                  'rgba(54, 162, 235, 0.2)',
                  'rgba(255, 206, 86, 0.2)',
                  'rgba(255, 99, 132, 0.2)',
                  // 'rgba(75, 192, 192, 0.2)',
                  // 'rgba(153, 102, 255, 0.2)',
                  // 'rgba(255, 159, 64, 0.2)'
              ],
              borderColor: [
                  'rgba(54, 162, 235, 1)',
                  'rgba(255, 206, 86, 1)',
                  'rgba(255, 99, 132, 1)',
                  // 'rgba(75, 192, 192, 1)',
                  // 'rgba(153, 102, 255, 1)',
                  // 'rgba(255, 159, 64, 1)'
              ],
              hoverOffset: 10
          }]
      },
  });
}

var landCoverChart = function(data){
  myChart2.destroy()
  myChart2 = new Chart(ctx2, {
      type: 'doughnut',
      data: {
          labels: ['Barren Lands', 'Cultivated Crops', 'Developed High Intensity',
        "Developed Medium Intensity", "Developed Low Intensity", "Developed Open Space", 
        "Forest Shrubs", "Open Water", "Wetlands"],
          datasets: [{
              data: [data.RATIO_BARREN_LANDS, 
                data.RATIO_CULTIVATED_CROPS, 
                data.RATIO_DEVELOPED_HIGH, 
                data.RATIO_DEVELOPED_LOW, 
                data.RATIO_DEVELOPED_MEDIUM,
                data.RATIO_DEVELOPED_OPEN_SPACE,
                data.RATIO_FOREST_SHRUBS,
                data.RATIO_OPEN_WATER,
                data.RATIO_PASTURE_GRASSLANDS,
                data.RATIO_WETLANDS],
              backgroundColor: [
                'rgba(54, 162, 235, 1)',
                'rgba(255, 206, 86, 1)',
                'rgba(255, 99, 132, 1)',
                'rgba(75, 192, 192, 1)',
                'rgba(153, 102, 255, 1)',
                'rgba(255, 19, 164, 1)',
                'rgba(75, 122, 132, 1)',
                'rgba(153, 12, 25, 1)',
                'rgba(251, 159, 64, 1)',
                'rgba(151, 159, 164, 1)'
              ],
              borderColor: [
                  'rgba(54, 162, 235, 1)',
                  'rgba(255, 206, 86, 1)',
                  'rgba(255, 99, 132, 1)',
                  'rgba(75, 192, 192, 1)',
                  'rgba(153, 102, 255, 1)',
                  'rgba(255, 19, 164, 1)',
                  'rgba(75, 122, 132, 1)',
                  'rgba(153, 12, 25, 1)',
                  'rgba(251, 159, 64, 1)',
                  'rgba(151, 159, 164, 1)'
              ],
              hoverOffset: 10
          }]
      },
  });
}

  /* ========
Main Calls
========== */
$(document).ready(function(){
    $.ajax(parkPath).done(function(json){
      park = JSON.parse(json);
      $.ajax(parkServePath).done(function(json){
        parkServe = JSON.parse(json);
        $.ajax(parkSectorsPath).done(function(json){
          parkSectors = JSON.parse(json);
          $.ajax(superNhoodsPath).done(function(json){
            superNeighborhoods = JSON.parse(json);
            $.ajax(tractsPath).done(function(json){
              tracts = JSON.parse(json);
              buildPage(PPIPageDef, tracts)
              // parkViz = L.geoJson(park).addTo(map)
            });
          });
        });
      });
    });
    // _.each(park.features, function(e){
    //   console.log(e)
    //   L.marker([e.geometry.coordinates[1], e.geometry.coordinates[0]], {icon: parkIcon}).addTo(map)
    // })
});


// buildPage(slides[currentPage]);
  // parkServe = JSON.parse(json);}
  // parkSectors = JSON.parse(json);}
  // superNeighborhoods = JSON.parse(json);}
  // let pathGroup = [, parkServePath, parkSectorsPath, superNhoodsPath, tractsPath];

  // _.each(dataBank.tracts.features, function(tract){
  //   geoid = tract.properties.GEOID
  //   console.log(geoid)
  // })
