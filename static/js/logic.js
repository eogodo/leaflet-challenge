// Create map function
function createMap(earthquakes) {
  // Add satellite tile layer
  var satellite = L.tileLayer(
    "https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}",
    {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 8,
      id: "mapbox.streets-satellite",
      accessToken: API_KEY,
    }
  );

  // Add grayscale tile layer
  var grayscale = L.tileLayer(
    "https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}",
    {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 8,
      id: "mapbox.light",
      accessToken: API_KEY,
    }
  );

  // Add outdoors tile layer
  var outdoors = L.tileLayer(
    "https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}",
    {
      attribution:
        'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 8,
      id: "mapbox.outdoors",
      //id: "mapbox.streets-satellite",
      accessToken: API_KEY,
    }
  );

  // Add faults layer group
  var faults = L.layerGroup();

  d3.json("./static/data/data.json", (data) => {
    var faultlineLayer = L.geoJson(data, {
      style: {
        weight: 2,
        color: "orange",
        fillOpacity: 0,
      },
    });
    faults.addLayer(faultlineLayer);
  });

  // Add base maps
  var baseMaps = {
    Satellite: satellite,
    Grayscale: grayscale,
    Outdoors: outdoors,
  };

  // Add overlay maps
  var overlayMaps = {
    "Fault Lines": faults,
    Earthquakes: earthquakes,
  };

  // Create map object
  var myMap = L.map("map", {
    center: [40.76078, -111.89105],
    zoom: 5,
    layers: [satellite, earthquakes],
  });

  // Add control selection
  L.control
    .layers(baseMaps, overlayMaps, {
      collapsed: false,
    })
    .addTo(myMap);

  // Create legend
  var legend = L.control({ position: "bottomright" });

  legend.onAdd = () => {
    var div = L.DomUtil.create("div", "info legend");
    var buckets = ["0-1", "1-2", "2-3", "3-4", "4-5", "5+"];
    var colors = [
      "#8ddc20",
      "#afc200",
      "#c8a500",
      "#da8600",
      "#e66100",
      "#ea3313",
    ];

    var labels = [];

    buckets.forEach((value, index) => {
      labels.push(
        '<li><div class="legend-color-element" style="background-color:' +
          colors[index] +
          '"></div><div class="legend-element">' +
          value +
          "</div></li>"
      );
    });

    div.innerHTML += "<ul>" + labels.join("") + "</ul>";
    return div;
  };
  legend.addTo(myMap);
}

// Link to geojson data
var link =
  "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson";

// Pulling geojson data
d3.json(link, function (data) {
  // Create a geoJSON layer with the retrieved data
  var earthquakes = L.geoJson(data, {
    pointToLayer: function (feature, latlng) {
      var circleColor;
      var magnitude = feature.properties.mag;

      // Magnitude colors
      switch (true) {
        case magnitude > 5:
          circleColor = "#ea3313";
          break;
        case magnitude > 4:
          circleColor = "#e66100";
          break;
        case magnitude > 3:
          circleColor = "#da8600";
          break;
        case magnitude > 2:
          circleColor = "#c8a500";
          break;
        case magnitude > 1:
          circleColor = "#afc200";
          break;
        default:
          circleColor = "#8ddc20";
          break;
      }

      // Create circles
      return L.circle(latlng, {
        radius: magnitude * 20000,
        fillOpacity: 0.85,
        fillColor: circleColor,
        stroke: false,
      });
    },

    // Bind popups
    onEachFeature: function (feature, layer) {
      layer.bindPopup(
        "<h3>" +
          feature.properties.place +
          "</h3><hr>" +
          "<p>Magnitude: " +
          feature.properties.mag +
          "</br>URL: " +
          feature.properties.url +
          "</p>"
      );
    },
  });

  // Initiate map
  createMap(earthquakes);
});
