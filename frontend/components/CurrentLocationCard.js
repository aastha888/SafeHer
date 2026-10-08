import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Button from './Button';
import colors from '../constants/colors';
import typography from '../constants/typography';

export default function CurrentLocationCard({
  address = 'Location not available yet',
  accuracy = '—',
  lastUpdated = '—',
  onShareLocation,
}) {
  return (
    <View style={styles.card}>
      <Text style={styles.title}>📍 Current Location</Text>
      <Text style={styles.address}>{address}</Text>

      <View style={styles.metaRow}>
        <Text style={styles.metaText}>Accuracy: {accuracy}</Text>
        <Text style={styles.metaText}>Updated: {lastUpdated}</Text>
      </View>

      <Button
        title="Share Location"
        variant="secondary"
        onPress={onShareLocation}
        style={{ marginTop: 12 }}
      />
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
});