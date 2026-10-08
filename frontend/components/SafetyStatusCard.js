import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../constants/colors';
import typography from '../constants/typography';

// Returns a color + label based on score (0-100). Thresholds are a placeholder
// until Person A's real safety score algorithm (Week 5-6) replaces this logic.
const getStatus = (score) => {
  if (score >= 70) return { color: colors.success, label: 'Safe', bg: '#E6F4EA' };
  if (score >= 40) return { color: colors.warning, label: 'Caution', bg: '#FEF7E0' };
  return { color: colors.error, label: 'Unsafe', bg: '#FDECEA' };
};

export default function SafetyStatusCard({ score = 75 }) {
  const status = getStatus(score);

  return (
    <View style={[styles.card, { backgroundColor: status.bg }]}>
      <View style={styles.row}>
        <View>
          <Text style={styles.label}>Your current safety status</Text>
          <Text style={[styles.statusLabel, { color: status.color }]}>{status.label}</Text>
        </View>
        <View style={[styles.scoreCircle, { borderColor: status.color }]}>
          <Text style={[styles.scoreText, { color: status.color }]}>{score}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderRadius: 16, padding: 18, marginBottom: 14 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  label: { ...typography.body, color: colors.textLight },
  statusLabel: { ...typography.heading, marginTop: 4 },
  scoreCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 3,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
  scoreText: { ...typography.title, fontWeight: '800' },
});