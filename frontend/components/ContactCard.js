import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Button from './Button';
import colors from '../constants/colors';
import typography from '../constants/typography';

export default function ContactCard({ contact, onEdit, onDelete }) {
  const { name, phone, relationship, is_verified } = contact;

  return (
    <View style={styles.card}>
      <View style={styles.topRow}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{name ? name.charAt(0).toUpperCase() : '?'}</Text>
        </View>

        <View style={styles.info}>
          <View style={styles.nameRow}>
            <Text style={styles.name} numberOfLines={1}>{name}</Text>
            {is_verified ? (
              <View style={styles.badge}>
                <Text style={styles.badgeText}>✓ Verified</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.phone}>{phone}</Text>
          {relationship ? <Text style={styles.relationship}>{relationship}</Text> : null}
        </View>
      </View>

      <View style={styles.actions}>
        <Button
          title="Edit"
          variant="secondary"
          onPress={() => onEdit && onEdit(contact)}
          style={styles.actionButton}
        />
        <Button
          title="Delete"
          variant="danger"
          onPress={() => onDelete && onDelete(contact)}
          style={styles.actionButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.background,
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: colors.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  topRow: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  avatarText: { ...typography.title, color: colors.primary },
  info: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center' },
  name: { ...typography.title, color: colors.text, flexShrink: 1 },
  badge: {
    backgroundColor: '#E6F4EA',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 2,
    marginLeft: 8,
  },
  badgeText: { ...typography.small, color: colors.success, fontWeight: '600' },
  phone: { ...typography.body, color: colors.textLight, marginTop: 2 },
  relationship: {
    ...typography.small,
    color: colors.primary,
    marginTop: 2,
    textTransform: 'capitalize',
  },
  actions: { flexDirection: 'row', marginTop: 14 },
  actionButton: { flex: 1, width: undefined, paddingVertical: 10, marginRight: 8 },
});