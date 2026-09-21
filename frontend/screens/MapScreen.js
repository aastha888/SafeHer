import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Linking } from 'react-native';
import colors from '../constants/colors';
import Button from '../components/Button';
import { getCurrentLocation } from '../services/LocationService';
import { sendLocation } from '../services/BackendLocationService';
import { startTracking, stopTracking } from '../services/TrackingService';

export default function MapScreen({ navigation }) {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');  
    const [syncStatus, setSyncStatus] = useState('Not sent yet');

    const loadLocation = async () => {
    setLoading(true);
    setError('');
    const result = await getCurrentLocation();
    if (result.success) {
      setLocation(result.location);
    } else {
      setError(result.error);
    }
    setLoading(false);
  };
  useEffect(() => {
    loadLocation();
  }, []);
  
  useEffect(() => {
    startTracking((message) => setSyncStatus(message));
    return () => stopTracking();
  }, []);

  const openInGoogleMaps = () => {
    const { latitude, longitude } = location;
    Linking.openURL('https://www.google.com/maps/search/?api=1&query=' + latitude + ',' + longitude);
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.message}>Getting your location...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>{error}</Text>
        <Button title="Try Again" onPress={loadLocation} />
        <View style={{ height: 12 }} />
        <Button title="Back" onPress={() => navigation.goBack()} />
      </View>
    );
  }

  return (
    <View style={styles.centered}>
      <Text style={styles.title}>Your Location</Text>
      <Text style={styles.value}>Latitude: {location.latitude.toFixed(5)}</Text>
      <Text style={styles.value}>Longitude: {location.longitude.toFixed(5)}</Text>
      <Text style={styles.value}>Accuracy: {Math.round(location.accuracy || 0)} m</Text>
      <Text style={styles.value}>
        Updated: {new Date(location.timestamp).toLocaleTimeString()}
      </Text>
            <Text style={styles.value}>Server: {syncStatus}</Text>
      <View style={{ height: 24 }} />
      <Button title="Open in Google Maps" onPress={openInGoogleMaps} />
      <View style={{ height: 12 }} />
      <Button title="Refresh Location" onPress={loadLocation} />
      <View style={{ height: 12 }} />
      <Button title="Back" onPress={() => navigation.goBack()} />
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.background,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    color: colors.primary,
  },
  value: {
    fontSize: 16,
    marginBottom: 6,
  },
  message: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },
  error: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#B00020',
  },
});