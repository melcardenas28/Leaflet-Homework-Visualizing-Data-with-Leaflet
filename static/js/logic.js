var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
});

var myMap = L.map("map", {
    center: [
        40.7, -94.5
    ],
    zoom: 3,
    layers: [street, topo]
});

//  baseMaps object.
var baseMaps = {
    "Street Map": street,
    "Topographic Map": topo
};


function onEachFeature(feature, layer) {
    layer.bindPopup(
        `<h3>${feature.properties.title}</h3><hr>
        <p><strong>Date of Occurrence:</strong>${new Date(feature.properties.time)}</p>
        <p><strong>Depth in km:</strong>${(feature.geometry.coordinates[2])}</p>`);
};

var queryUrl = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/2.5_day.geojson";

d3.json(queryUrl).then(function (data) {
    // GJSON layer
    const MaxDepth = Math.max(...data.features.map(x => x.geometry.coordinates[2]));
    const MaxRadius = Math.max(...data.features.map(x => x.properties.mag))

    function getColor(d) {
        return d > 90? '#ea2c2c' :
               d > 70  ? '#ea822c' :
               d > 50  ? '#ee9c00' :
               d > 30 ? '##eecc00' :
               d > 10 ? '#d4ee00' :
                          '#98ee00';
    };

    var geolayer = L.geoJSON(data, {
        onEachFeature: onEachFeature,
        pointToLayer: function (feature, latlng) {
            var geojsonMarkerOptions = {
                color: "black",
                weight: 1,
                fillColor: getColor(feature.geometry.coordinates[2]),
                fillOpacity: 1,
                radius: Math.log(feature.properties.mag)*10
            };
            return L.circleMarker(latlng, geojsonMarkerOptions);
        }
    });

    geolayer.addTo(myMap);


var legend = L.control({position: 'bottomright'});
legend.onAdd = function (myMap) {
    var div = L.DomUtil.create('div', 'info legend');
    labels = ['<strong>Earthquake Depth Indicator<br>(in km)</strong></br>'],
    categories = ['-10','10','30','50','70','90'];    
        for (var i = 0; i < categories.length; i++) {
        
                div.innerHTML += 
                labels.push(
                    '<i style="background:' + getColor(categories[i]) + '"></i> ' +
                    categories[i] + (categories[i + 1] ? '&ndash;' + categories[i + 1] : '+'));
        
            }
            div.innerHTML = labels.join('<br>');
        return div;
        };
    legend.addTo(myMap);


    var overlayMaps = {Locations: geolayer};
    L.control.layers(baseMaps, overlayMaps, legend, {
        collapsed: false
    }).addTo(myMap);

});
