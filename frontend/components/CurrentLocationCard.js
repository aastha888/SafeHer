import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Button from './Button';
import colors from '../constants/colors';
import typography from '../constants/typography';

// Formats "2 minutes ago" from a timestamp
const formatTimeAgo = (timestamp) => {
  if (!timestamp) return '—';
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  return `${hours} hr ago`;
};

export default function CurrentLocationCard({
  location, // { latitude, longitude, accuracy, timestamp } or null
  loading,
  error,
  onShareLocation,
  onViewMap,
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>📍 Current Location</Text>

      {loading ? (
        <Text style={styles.address}>Getting your location...</Text>
      ) : error ? (
        <Text style={[styles.address, { color: colors.error }]}>{error}</Text>
      ) : location ? (
        <>
          <Text style={styles.address}>
            {location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.metaText}>Accuracy: ±{Math.round(location.accuracy)}m</Text>
            <Text style={styles.metaText}>Updated: {formatTimeAgo(location.timestamp)}</Text>
          </View>
        </>
      ) : (
        <Text style={styles.address}>Location not available yet</Text>
      )}

      <View style={styles.buttonRow}>
        <View style={styles.buttonItem}>
          <Button title="View Map" variant="secondary" onPress={onViewMap} />
        </View>
        <View style={{ width: 10 }} />
        <View style={styles.buttonItem}>
          <Button title="Share Location" variant="secondary" onPress={onShareLocation} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: 16,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: { ...typography.title, color: colors.text, marginBottom: 8 },
  address: { ...typography.body, color: colors.text },
  metaRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10 },
  metaText: { ...typography.small, color: colors.textLight },
  buttonRow: { flexDirection: 'row', marginTop: 12 },
  buttonItem: { flex: 1 },
});