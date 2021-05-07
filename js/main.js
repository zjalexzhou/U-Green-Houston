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
let superNhoodsPath = "https://gist.githubusercontent.com/zjalexzhou/7f937f2d8d358238a00a312626e290f6/raw/e7221e9fc4e23d0779d39dae4a8bc39097e606e1/houstonSuperNhoodsData.geojson";
let tractsPath = "https://gist.githubusercontent.com/zjalexzhou/b3ac91352a22d127ad80635a84f49c04/raw/37db082cd4f779f067b5591eea2e89574ceda1aa/houstonTractsCleanedPPI.geojson";

// For Data Storage
let park;
let parkServe;
let parkSectors;
let superNeighborhoods;
let tracts;

let featureGroupId = [];
let featureGroup = [];
let markers = [];
map.initialBounds = map.getBounds(); // record the initial bounds mapped

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
  // remove all plotted data in prep for building the page with new filters etc
  map.removeLayer(featureGroup)
}

let buildPage = function(pageDefinition, data){
    // build up a "slide" given a page definition

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

    $('#'+pageDefinition.legendId).show()
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

// getDesSats(dataset, property)
// This function generates 3 types of descriptive statistics (min, median, and max) 
// for a particular property of the input dataset.
// Return:
// An array of min, median, and max values for the specified property as well as the number of NA values for that property
let getDesStats = function(dataset, property){
  let tmpDesStats = [];
  let numOfNAs = 0;
  _.each(dataset, function(e){
    if(e[property] >= 0){
      tmpDesStats.push(e[property])
    } else {
      numOfNAs += 1;
    }
  })
  minVal = math.min(tmpDesStats)
  medVal = math.median(tmpDesStats)
  maxVal= math.max(tmpDesStats)
  return [minVal, medVal, maxVal, numOfNAs]
}

// getChromeColorRamp(data, min, median, max)

var getChromeColorRamp = function(data, min, median, max){
  startColor = '#000000'
  medColor = '#ffff00'
  endColor = '#0000ff'
  colorRamp = chroma.scale([startColor, medColor, endColor]).domain([min, median, max]);
  return colorRamp(data).hex();
} 

var getLegendContent = function(data){
  var s = '';
  var dom = d.domain ? d.domain() : [0,1],
      dmin = Math.min(dom[0], dom[dom.length-1]),
      dmax = Math.max(dom[dom.length-1], dom[0]);
  for (var i=0;i<=100;i++) {
      s += '<span class="grad-step" style="background-color:'+d(dmin + i/100 * (dmax - dmin))+'"></span>';
  }
  s += '<span class="domain-min">'+dmin+'</span>';
  s += '<span class="domain-med">'+((dmin + dmax)*0.5)+'</span>';
  s += '<span class="domain-max">'+dmax+'</span>';
  return '<div class="gradient">'+s+'</div>';
}


let currentPage = 0;


let greenParkStyle = function(){
  return {color: 'Green'}
}

let blueServiceAreaStyle = function(){
  return {color: 'Blue'}
}

var parkAccess = {
  title: "Park Access",
  content: "\"In these challenging times, access to the outdoors is more important than ever. And yet, across the country, more than 100 million people don't have a park within a 10-minute walk of home.\"\n\nThe first map presents the percentage of area covered by the 10-minute-walk service areas of parks for each census tract in Houston, TX.",
  dataForViz: tracts,//[park, parkServe],
  style: [greenParkStyle(), blueServiceAreaStyle()],
}

var PPIPageDef = {
  title: "Park Priority Index",
  content: "A measurement of park demand for each census tract to prioritz certain tracts for parkland planning and funding allocation.",
  style: function(feature){
      PPI = feature.properties.final_score;
      $('#jk1').text(math.round(PPI_jenk_class[0],1))
      $('#jk2').text(math.round(PPI_jenk_class[1],1))
      $('#jk3').text(math.round(PPI_jenk_class[2],1))
      $('#jk4').text(math.round(PPI_jenk_class[3],1))
      $('#jk5').text(math.round(PPI_jenk_class[4],1))
      $('#jk6').text(math.round(PPI_jenk_class[5],1))
      if (PPI >= PPI_jenk_class[0] & PPI < PPI_jenk_class[1]){
        feature.properties['priority'] = 'Well Below Average'
        return{color: "#A4D4B4"};
      }
      else if (PPI >= PPI_jenk_class[1] & PPI < PPI_jenk_class[2]){
        feature.properties['priority'] = 'Below Average'
        return{color:"#FFCF9C"};
      }
      else if (PPI >= PPI_jenk_class[2] & PPI < PPI_jenk_class[3]){
        feature.properties['priority'] = 'Average'
        return{color:"#B96D40"}
      }
      else if (PPI >= PPI_jenk_class[3] & PPI < PPI_jenk_class[4]){
        feature.properties['priority'] = 'Above Average'
        return{color:"#CA054D"}
      }
      else if (PPI >= PPI_jenk_class[4]){
        feature.properties['priority'] = 'Well Above Average'
        return{color:"#3B1C32"}
      }
    },
  legendId: 'initial-legend'
}

slides = [parkAccess]
PPI_jenk_class=[];

let eachFeatureFunction = function(layer) {
  layer.bindTooltip("Park Priority: "+ layer.feature.properties.priority + '<br>\n' + layer.feature.properties.NAME)
  layer.on('click', function (event) {
    console.log(layer)
    map.fitBounds(event.target.getBounds());
    _.each(park.features, function(e){
      // console.log(e)
      markers.push(L.marker([e.geometry.coordinates[1], e.geometry.coordinates[0]], {icon: parkIcon}).addTo(map))
    })
  })
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
              PPI_jenk_class = turf.jenks(tracts, "final_score", 5)
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
