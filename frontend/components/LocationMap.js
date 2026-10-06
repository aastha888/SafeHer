import React, { useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import colors from '../constants/colors';

// Shows a map centred on the given location.
// location: { latitude, longitude, accuracy, timestamp }
export default function LocationMap({ location }) {
  const mapRef = useRef(null);
  const [mapType, setMapType] = React.useState('standard');

  const region = {
    latitude: location.latitude,
    longitude: location.longitude,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  };

  const centerOnUser = () => {
    if (mapRef.current) {
      mapRef.current.animateToRegion(region, 500);
    }
  };

  const toggleMapType = () => {
    setMapType(mapType === 'standard' ? 'satellite' : 'standard');
  };

  const timeText = new Date(location.timestamp).toLocaleTimeString();

  
  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={region}
        mapType={mapType}
      >
        <Marker
          coordinate={{ latitude: location.latitude, longitude: location.longitude }}
          title="You are here"
        />
        <Circle
          center={{ latitude: location.latitude, longitude: location.longitude }}
          radius={location.accuracy || 0}
          strokeColor="rgba(0, 122, 255, 0.6)"
          fillColor="rgba(0, 122, 255, 0.15)"
        />
      </MapView>

      <View style={styles.buttons}>
        <TouchableOpacity style={styles.button} onPress={centerOnUser}>
          <Text style={styles.buttonText}>Center</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={toggleMapType}>
          <Text style={styles.buttonText}>
            {mapType === 'standard' ? 'Satellite' : 'Standard'}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.info}>
        <Text style={styles.infoText}>
          Accuracy: {Math.round(location.accuracy || 0)} m
        </Text>
        <Text style={styles.infoText}>Updated: {timeText}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  buttons: {
    position: 'absolute',
    top: 16,
    right: 16,
  },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 8,
    marginBottom: 8,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '600' },
  info: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: 'rgba(255,255,255,0.9)',
    padding: 10,
    borderRadius: 8,
  },
  infoText: { fontSize: 13 },
});