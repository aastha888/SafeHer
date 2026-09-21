import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import colors from '../constants/colors';
import typography from '../constants/typography';

export default function LoadingSpinner({ text = 'Loading...' }) {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.text}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    zIndex: 10,
  },
  text: { ...typography.body, color: colors.textLight, marginTop: 12 },
});