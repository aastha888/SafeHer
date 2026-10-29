import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import colors from '../constants/colors';
import typography from '../constants/typography';

// Shows "Xs ago" / "Xm ago" based on the ISO timestamp SOSService returned
function getElapsedLabel(triggeredAt) {
  const seconds = Math.floor((Date.now() - new Date(triggeredAt).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ago`;
}

export default function ActiveSOSBanner({ triggeredAt, onCancel, cancelling }) {
  const [elapsed, setElapsed] = useState(getElapsedLabel(triggeredAt));

  // Re-render every second so "Xs ago" stays live
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(getElapsedLabel(triggeredAt));
    }, 1000);
    return () => clearInterval(interval);
  }, [triggeredAt]);

  return (
    <View style={styles.banner}>
      <View style={styles.textBlock}>
        <Text style={styles.title}>🆘 SOS Active</Text>
        <Text style={styles.subtitle}>Contacts notified · {elapsed}</Text>
      </View>

      <TouchableOpacity
        style={styles.cancelButton}
        onPress={onCancel}
        disabled={cancelling}
        activeOpacity={0.8}
      >
        <Text style={styles.cancelText}>
          {cancelling ? 'Cancelling...' : 'Cancel SOS'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.error,
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  textBlock: { flex: 1, marginRight: 12 },
  title: { ...typography.title, color: '#FFFFFF', fontWeight: '800' },
  subtitle: { ...typography.small, color: '#FFFFFF', opacity: 0.9, marginTop: 2 },
  cancelButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  cancelText: { ...typography.small, color: colors.error, fontWeight: '700' },
});