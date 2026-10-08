import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Switch } from 'react-native';

import Modal from './Modal';
import InputField from './InputField';
import Button from './Button';
import colors from '../constants/colors';
import typography from '../constants/typography';
import { validateContactName, validateContactPhone } from '../utils/validation';

const QUICK_RELATIONSHIPS = ['Mother', 'Father', 'Sister', 'Brother', 'Friend', 'Spouse'];

const EMPTY_FORM = { name: '', phone: '', relationship: '', is_primary: false };

export default function AddContactModal({
  visible,
  onClose,
  onSubmit,
  editingContact,
  submitting,
  submitError,
}) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({ name: '', phone: '' });

  // Pre-fill when editing, reset when adding a new one
  useEffect(() => {
    if (visible) {
      if (editingContact) {
        setForm({
          name: editingContact.name || '',
          phone: editingContact.phone || '',
          relationship: editingContact.relationship || '',
          is_primary: !!editingContact.is_primary,
        });
      } else {
        setForm(EMPTY_FORM);
      }
      setErrors({ name: '', phone: '' });
    }
  }, [visible, editingContact]);

  const handleChange = (field, value) => {
    const updated = { ...form, [field]: value };
    setForm(updated);
    if (errors[field]) {
      if (field === 'name') setErrors({ ...errors, name: validateContactName(value) });
      if (field === 'phone') setErrors({ ...errors, phone: validateContactPhone(value) });
    }
  };

  const handleSubmit = () => {
    const nameError = validateContactName(form.name);
    const phoneError = validateContactPhone(form.phone);
    setErrors({ name: nameError, phone: phoneError });
    if (nameError || phoneError) return;

    onSubmit({
      name: form.name.trim(),
      phone: form.phone.trim(),
      relationship: form.relationship.trim(),
      is_primary: form.is_primary,
    });
  };

  return (
    <Modal
      visible={visible}
      onClose={onClose}
      title={editingContact ? 'Edit Contact' : 'Add Contact'}
    >
      <InputField
        label="Name"
        placeholder="Contact's full name"
        value={form.name}
        onChangeText={(t) => handleChange('name', t)}
        autoCapitalize="words"
        error={errors.name}
      />

      <InputField
        label="Phone"
        placeholder="e.g. 9876543210"
        value={form.phone}
        onChangeText={(t) => handleChange('phone', t)}
        keyboardType="phone-pad"
        error={errors.phone}
      />

      <InputField
        label="Relationship (optional)"
        placeholder="e.g. Mother, Friend"
        value={form.relationship}
        onChangeText={(t) => handleChange('relationship', t)}
        autoCapitalize="words"
      />

      {/* Quick-pick chips so the user doesn't have to type a common relationship */}
      <View style={styles.chipRow}>
        {QUICK_RELATIONSHIPS.map((r) => (
          <TouchableOpacity
            key={r}
            style={[styles.chip, form.relationship === r && styles.chipActive]}
            onPress={() => handleChange('relationship', r)}
          >
            <Text style={[styles.chipText, form.relationship === r && styles.chipTextActive]}>
              {r}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.switchRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.switchLabel}>Set as primary contact</Text>
          <Text style={styles.switchHint}>Primary contacts are notified first during SOS</Text>
        </View>
        <Switch
          value={form.is_primary}
          onValueChange={(v) => handleChange('is_primary', v)}
          trackColor={{ false: colors.border, true: colors.primaryLight }}
          thumbColor={form.is_primary ? colors.primary : '#f4f3f4'}
        />
      </View>

      {submitError ? <Text style={styles.submitError}>{submitError}</Text> : null}

      <View style={{ height: 8 }} />
      <Button
        title={editingContact ? 'Save Changes' : 'Add Contact'}
        onPress={handleSubmit}
        loading={submitting}
      />
      <View style={{ height: 10 }} />
      <Button title="Cancel" variant="secondary" onPress={onClose} disabled={submitting} />
    </Modal>
  );
}

const styles = StyleSheet.create({
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: -8, marginBottom: 16 },
  chip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginTop: 8,
  },
  chipActive: { backgroundColor: colors.primaryLight, borderColor: colors.primary },
  chipText: { ...typography.small, color: colors.textLight },
  chipTextActive: { color: colors.primary, fontWeight: '600' },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  switchLabel: { ...typography.body, color: colors.text, fontWeight: '600' },
  switchHint: { ...typography.small, color: colors.textLight, marginTop: 2 },
  submitError: { ...typography.body, color: colors.error, marginBottom: 12, textAlign: 'center' },
});