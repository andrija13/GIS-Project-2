// Leaflet map
var map;

// Layers
var education;
var hospital;
var gas;
var sport;
var pharmacy;
var forest;
var river;
var railway;

//Layers styles
var educationStyle = { "color": "#684013", "weight": 4, "opacity": 0.7 };
var hospitalStyle = { "color": "#d4030ab3", "weight": 4,"opacity": 0.7 };
var sportStyle = { "color": "#f7bd07b3", "weight": 4, "opacity": 0.7 };

//Feature type
const line = "planet_osm_line";
const point = "planet_osm_point";
const poly = "planet_osm_polygon";

//Layer group
var layerGroup = new L.LayerGroup();

$(document).ready(function () {
    map = L.map('map').setView([43.323, 21.894700], 14);

    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
    }).addTo(map);

    layerGroup.addTo(map);
});


$('#educationCheck').change(function () {
    if (this.checked) {
        var filter = "amenity IN ('kindergarten', 'school', 'college', 'university','language_school') OR office='educational_institution'";
        callWFSService(education, educationStyle, poly, filter).then((res) => {
            education = res;
        });
    }
    else {
        layerGroup.removeLayer(education);
    }
});

$('#hospitalCheck').change(function () {
    if (this.checked) {
        var filter = "amenity IN ('hospital')";
        callWFSService(hospital, hospitalStyle, poly, filter).then((res) => {
            hospital = res;
        });
    }
    else {
        layerGroup.removeLayer(hospital);
    }
});

$('#gasCheck').change(function () {
    if (this.checked) {
        var filter = "amenity IN ('fuel')";
        callWFSService(gas, null, point, filter).then((res) => {
            gas = res;
        });
    }
    else {
        layerGroup.removeLayer(gas);
    }
});

$('#sportCheck').change(function () {
    if (this.checked) {
        var filter = "leisure IN ('pitch','sports_centre','sports_hall','stadium')";
        callWFSService(sport, sportStyle, poly, filter).then((res) => {
            sport = res;
        });
    }
    else {
        layerGroup.removeLayer(sport);
    }
});

$('#pharmacyCheck').change(function () {
    if (this.checked) {
        var filter = "amenity IN ('pharmacy')";
        callWFSService(pharmacy, null, point, filter).then((res) => {
            pharmacy = res;
        });
    }
    else {
        layerGroup.removeLayer(pharmacy);
    }
});

$('#forestCheck').change(function () {
    if (this.checked) {
        var filter = "landuse IN ('forest') OR natural IN ('wood')";
        forest = callWMSService(forest, "ForestStyle", poly, filter)
    }
    else {
        layerGroup.removeLayer(forest);
    }
});

$('#riverCheck').change(function () {
    if (this.checked) {
        var filter = "waterway IN ('river')";
        river = callWMSService(river, 'line', line, filter)
    }
    else {
        layerGroup.removeLayer(river);
    }
});

$('#railwayCheck').change(function () {
    if (this.checked) {
        var filter = "railway IS NOT NULL";
        railway = callWMSService(railway, 'RailwaysStyle', line, filter)
    }
    else {
        layerGroup.removeLayer(railway);
    }
});

// Ajax call WFS service - GetFeature request
function callWFSService(layer, style, type, filter) {
    return new Promise((resolve, reject) => {
        $.ajax({
            url: "http://localhost:8080/geoserver/GIS/wfs",
            data: {
                service: "WFS",
                version: "1.0.0",
                request: "GetFeature",
                typeName: type,
                cql_filter: filter,
                outputFormat: "application/json",
                srsName: "epsg:4326",
            },
            dataType: "json",
            success: function (response) {
                layer = L.geoJSON(response, {
                    style: style,
                    pointToLayer: createCustomMarker,
                    onEachFeature: addPopup
                });
                layerGroup.addLayer(layer);
                resolve(layer);
            },
            error: function (error) {
                reject(error)
            }
        })
    })
}

// Leaflet call WMS service - GetMap request
function callWMSService(layer, style, type, filter) {
    var layer = new L.tileLayer.wms(
        'http://localhost:8080/geoserver/GIS/wms',
        {
            layers: type,
            format: 'image/png',
            styles: style,
            transparent: true,
            cql_filter: filter
        }
    )
    layerGroup.addLayer(layer);
    return layer;
}

// Add popup to layer
function addPopup(feature, layer) {
    if (feature.properties != null) {
        var infoText = '';
        for (const [key, value] of Object.entries(feature.properties)) {
            if (key != 'osm_id' && key != 'z_order' && key != 'way_area' && value != null) {
                infoText += `${key}: ${value}, `;
            }
        }
        layer.bindPopup(infoText);
    }
}

// Custom marker to layer
function createCustomMarker(feature, latlng) {
    if (feature.properties != null && feature.properties.amenity != null && feature.properties.amenity == 'pharmacy') {
        var myIcon = L.icon({
            iconUrl: 'marker-red.png',
            iconSize: [20, 35],
            iconAnchor: [10, 35],
            popupAnchor: [0, -35],
        })
        return L.marker(latlng, { icon: myIcon });
    }
    else {
        var myIcon = L.icon({
            iconUrl: 'marker-default.png',
            iconSize: [20, 35],
            iconAnchor: [10, 35],
            popupAnchor: [0, -35],
        })
        return L.marker(latlng, { icon: myIcon });
    }
}