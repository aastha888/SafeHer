import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, Linking } from 'react-native';
import colors from '../constants/colors';
import Button from '../components/Button';
import LocationMap from '../components/LocationMap';
import { getCurrentLocation } from '../services/LocationService';
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
    <View style={styles.screen}>
      <View style={styles.mapArea}>
        <LocationMap location={location} />
      </View>

      <View style={styles.panel}>
        <Text style={styles.status}>Server: {syncStatus}</Text>
        <View style={styles.row}>
          <View style={styles.rowItem}>
            <Button title="Refresh" onPress={loadLocation} />
          </View>
          <View style={{ width: 12 }} />
          <View style={styles.rowItem}>
            <Button title="Google Maps" onPress={openInGoogleMaps} />
          </View>
        </View>
        <View style={{ height: 12 }} />
        <Button title="Back" onPress={() => navigation.goBack()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.background,
  },
  mapArea: {
    flex: 1,
  },
  panel: {
    padding: 16,
    paddingBottom: 32,
    backgroundColor: colors.background,
  },
  status: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 12,
    color: colors.textLight,
  },
  row: {
    flexDirection: 'row',
  },
  rowItem: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.background,
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