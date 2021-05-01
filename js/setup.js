var mapOpts = {
    center:[29.86045, -95.36978], // set map centered around Houston
    zoom: 10,
    zoomControl: false
};

var map = L.map('map', mapOpts);
map.initialBounds = map.getBounds(); // record the initial bounds mapped

L.control.zoom({
    position: 'bottomright'
}).addTo(map);

var tileOpts = {
    attribution: 'Map tiles by <a href="http://stamen.com">Stamen Design</a>, <a href="http://creativecommons.org/licenses/by/3.0">CC BY 3.0</a> &mdash; Map data &copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    subdomains: 'abcd',
    minZoom: 0,
    maxZoom: 20,
    ext: 'png'
};

var Stamen_TonerLite = L.tileLayer('http://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png', tileOpts).addTo(map);
