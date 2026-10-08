import React, { useRef, useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, StatusBar } from 'react-native';
import { WebView } from 'react-native-webview';
import colors from '../constants/colors';

// Builds a small web page that shows an OpenStreetMap map (using Leaflet)
// with a pin and an accuracy circle at the given position.
const buildHtml = (lat, lng, acc) => `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.css" />
  <style>html, body, #map { height: 100%; margin: 0; padding: 0; }</style>
</head>
<body>
  <div id="map"></div>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.js"></script>
  <script>
    var map = L.map('map', { zoomControl: false }).setView([${lat}, ${lng}], 17);
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
    var marker = L.marker([${lat}, ${lng}]).addTo(map);
    var circle = L.circle([${lat}, ${lng}], {
      radius: ${acc},
      color: '#007AFF',
      weight: 1,
      fillColor: '#007AFF',
      fillOpacity: 0.15
    }).addTo(map);

    function updateLocation(lat, lng, acc) {
      var p = [lat, lng];
      marker.setLatLng(p);
      circle.setLatLng(p);
      circle.setRadius(acc);
    }

    function centerOnUser() {
      map.setView(marker.getLatLng(), 17);
    }
  </script>
</body>
</html>`;

// Shows a map centred on the given location.
// location: { latitude, longitude, accuracy, timestamp }
export default function LocationMap({ location }) {
  const webRef = useRef(null);
  const [loadError, setLoadError] = useState(false);

  // Build the page once. Later position changes are sent in without reloading it.
  const [html] = useState(() =>
    buildHtml(location.latitude, location.longitude, location.accuracy || 0)
  );

  useEffect(() => {
    if (webRef.current) {
      webRef.current.injectJavaScript(
        'if (typeof updateLocation === "function") { updateLocation(' +
          location.latitude + ', ' + location.longitude + ', ' + (location.accuracy || 0) +
          '); } true;'
      );
    }
  }, [location.latitude, location.longitude, location.accuracy]);

  const centerOnUser = () => {
    if (webRef.current) {
      webRef.current.injectJavaScript('if (typeof centerOnUser === "function") { centerOnUser(); } true;');
    }
  };

  const timeText = new Date(location.timestamp).toLocaleTimeString();
  const topOffset = (StatusBar.currentHeight || 0) + 12;

  return (
    <View style={styles.container}>
      <WebView
        ref={webRef}
        style={styles.map}
        originWhitelist={['*']}
        source={{ html, baseUrl: 'https://github.com/aastha888/SafeHer' }}
        javaScriptEnabled
        onError={() => setLoadError(true)}
        onHttpError={() => setLoadError(true)}
      />

      <View style={[styles.buttons, { top: topOffset }]}>
        <TouchableOpacity style={styles.button} onPress={centerOnUser}>
          <Text style={styles.buttonText}>Center</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.info}>
        <Text style={styles.infoText}>
          Accuracy: {Math.round(location.accuracy || 0)} m
        </Text>
        <Text style={styles.infoText}>Updated: {timeText}</Text>
        {loadError ? <Text style={styles.errorText}>Map could not load</Text> : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  buttons: {
    position: 'absolute',
    right: 16,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '600' },
  info: {
    position: 'absolute',
    bottom: 28,
    left: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 10,
    borderRadius: 8,
  },
  infoText: { fontSize: 13 },
  errorText: { fontSize: 13, color: colors.error, marginTop: 4 },
});