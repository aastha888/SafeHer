import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, StyleSheet } from 'react-native';
import colors from '../constants/colors';
import typography from '../constants/typography';

export default function Button({
  title,
  onPress,
  disabled = false,
  loading = false,
  variant = 'primary', // 'primary' | 'secondary' | 'danger'
  style,
}) {
  const isDisabled = disabled || loading;
  const isSecondary = variant === 'secondary';

  return (
    <TouchableOpacity
      style={[styles.button, variantStyles[variant], isDisabled && styles.disabled, style]}
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.8}
    >
      {loading ? (
        <ActivityIndicator color={isSecondary ? colors.primary : '#FFFFFF'} />
      ) : (
        <Text style={[styles.text, isSecondary && styles.textSecondary]}>{title}</Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  disabled: { opacity: 0.6 },
  text: { ...typography.title, color: '#FFFFFF' },
  textSecondary: { color: colors.primary },
});

const variantStyles = StyleSheet.create({
  primary: { backgroundColor: colors.primary },
  secondary: {
    backgroundColor: colors.primaryLight,
    borderWidth: 1,
    borderColor: colors.primary,
  },
  danger: { backgroundColor: colors.error },
});