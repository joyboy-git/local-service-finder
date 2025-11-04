// -------- Minimal Map Init --------
var map = L.map("map").setView([13.0827, 80.2707], 13);

L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
  attribution: '&copy; OpenStreetMap contributors & CARTO',
  subdomains: "abcd",
  maxZoom: 50
}).addTo(map);

var userMarker = null;
var routeLayer = null;
var selectedServiceCoords = null;

// -------- Custom Icons --------
var icons = {
  hospital: L.icon({ iconUrl: "icons/hospital.png", iconSize: [35, 35] }),
  pharmacy: L.icon({ iconUrl: "icons/pharmacy.png", iconSize: [35, 35] }),
  police: L.icon({ iconUrl: "icons/police.png", iconSize: [35, 35] }),
  ambulance: L.icon({ iconUrl: "icons/ambulance.png", iconSize: [35, 35] }),
  fuel: L.icon({ iconUrl: "icons/gas-station.png", iconSize: [35, 35] })
};

// -------- Example Local Services --------
var services = [
  { name: "City Hospital", coords: [13.0805, 80.2722], icon: icons.hospital },
  { name: "Alpha Pharmacy", coords: [13.0829, 80.2826], icon: icons.pharmacy },
  { name: "Police Station", coords: [13.0829, 80.2921], icon: icons.police },
  { name: "Ambulance", coords: [13.0839, 80.2711], icon: icons.ambulance },
  { name: "Fuel Station", coords: [13.0851, 80.2781], icon: icons.fuel }
];

// -------- Add Service Markers --------
var markers = [];
services.forEach(service => {
  var marker = L.marker(service.coords, { icon: service.icon }).addTo(map)
    .bindPopup(service.name);
  marker.on('click', () => {
    if (!userMarker) {
      alert("Please click 'Find Me' first.");
      return;
    }
    drawRoute(userMarker.getLatLng(), service.coords);
  });
  markers.push({ name: service.name.toLowerCase(), marker: marker });
});

// -------- User Location --------
document.getElementById("findMeBtn").addEventListener("click", () => {
  map.locate({ setView: true, maxZoom: 16 });
});

map.on("locationfound", function (e) {
  if (!userMarker) {
    userMarker = L.marker(e.latlng).addTo(map)
      .bindPopup("📍 You are here!").openPopup();
  } else {
    userMarker.setLatLng(e.latlng);
  }

  if (selectedServiceCoords) {
    drawRoute(e.latlng, selectedServiceCoords);
  }
});

// -------- Draw Route Using OpenRouteService API --------
async function drawRoute(userLatLng, serviceCoords) {
  if (routeLayer) map.removeLayer(routeLayer);

  const API_KEY = "eyJvcmciOiI1YjNjZTM1OTc4NTExMTAwMDFjZjYyNDgiLCJpZCI6ImFkN2I0NmE0MjJlYzQ4ZGI4YWEzZjc3MGJlZTk0ZmY3IiwiaCI6Im11cm11cjY0In0="; // Replace this safely later
  const url = `https://api.openrouteservice.org/v2/directions/foot-walking?api_key=${API_KEY}&start=${userLatLng.lng},${userLatLng.lat}&end=${serviceCoords[1]},${serviceCoords[0]}`;

  try {
    const res = await fetch(url);
    const data = await res.json();

    const summary = data.features[0].properties.summary;
    const distanceKm = (summary.distance / 1000).toFixed(2);
    const timeMin = (summary.duration / 60).toFixed(1);

    document.getElementById("routeInfo").textContent = 
      `🛣️ Distance: ${distanceKm} km | ⏱️ ETA: ${timeMin} min`;

    const coords = data.features[0].geometry.coordinates.map(c => [c[1], c[0]]);
    routeLayer = L.polyline(coords, { color: 'blue', weight: 5 }).addTo(map);
    map.fitBounds(routeLayer.getBounds(), { padding: [50, 50] });

  } catch (err) {
    console.error("Route error:", err);
    document.getElementById("routeInfo").textContent = "⚠️ Could not calculate route.";
  }
}

// -------- Search Function --------
function searchLocation(inputText = null) {
  const input = inputText ? inputText.toLowerCase() : document.getElementById("searchBox").value.toLowerCase();
  let found = false;

  markers.forEach(item => {
    if (item.name.includes(input)) {
      map.setView(item.marker.getLatLng(), 16);
      item.marker.openPopup();
      found = true;
    }
  });

  if (!found && input.trim() !== "") {
    fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${input}`)
      .then(res => res.json())
      .then(data => {
        if (data.length > 0) {
          const place = data[0];
          const tempMarker = L.marker([place.lat, place.lon]).addTo(map)
            .bindPopup(place.display_name).openPopup();
          map.setView([place.lat, place.lon], 16);
        } else {
          alert("⚠️ No matching place found!");
        }
      });
  }
}

// -------- Quick Shortcut Buttons --------
const emergencyServices = [
  { name: "⛽ Fuel", query: "fuel" },
  { name: "🚑 Ambulance", query: "ambulance" },
  { name: "🏥 Hospital", query: "hospital" },
  { name: "💊 Pharmacy", query: "pharmacy" },
  { name: "🚓 Police Station", query: "police" }
];

const container = document.getElementById("quickServices");
emergencyServices.forEach(service => {
  const btn = document.createElement("button");
  btn.textContent = service.name;
  btn.onclick = () => searchLocation(service.query);
  container.appendChild(btn);
});
