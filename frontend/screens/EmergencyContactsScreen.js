import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';

import ContactCard from '../components/ContactCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Button from '../components/Button';
import colors from '../constants/colors';
import typography from '../constants/typography';
import { getContacts } from '../services/ContactService';

export default function EmergencyContactsScreen({ navigation }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');

  const loadContacts = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError('');

    const result = await getContacts();

    if (result.success) {
      setContacts(result.data);
    } else {
      setError(result.error);
    }

    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  // Placeholders: wired to the real modal and API tomorrow (Day 9)
  const handleAdd = () => alert('Add Contact form comes tomorrow (Day 9)');
  const handleEdit = (contact) => alert(`Edit form for ${contact.name} comes tomorrow (Day 9)`);
  const handleDelete = (contact) => alert(`Delete for ${contact.name} comes tomorrow (Day 9)`);

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyBox}>
        <Text style={styles.emptyIcon}>👥</Text>
        <Text style={styles.emptyTitle}>No contacts yet</Text>
        <Text style={styles.emptyText}>
          Add people who should be alerted when you need help.
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.back}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Emergency Contacts</Text>
        <View style={{ width: 50 }} />
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>{error}</Text>
          <Text style={styles.retry} onPress={() => loadContacts()}>
            Tap to retry
          </Text>
        </View>
      ) : null}

      <FlatList
        data={contacts}
        keyExtractor={(item, index) => String(item._id || index)}
        renderItem={({ item }) => (
          <ContactCard contact={item} onEdit={handleEdit} onDelete={handleDelete} />
        )}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.list}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => loadContacts(true)}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      />

      <View style={styles.footer}>
        <Button title="+ Add Contact" onPress={handleAdd} />
      </View>

      {loading ? <LoadingSpinner text="Loading contacts..." /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.secondary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 56,
    paddingBottom: 14,
    backgroundColor: colors.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  back: { ...typography.body, color: colors.primary, fontWeight: '600' },
  title: { ...typography.title, color: colors.text },
  list: { padding: 16, paddingBottom: 100, flexGrow: 1 },
  errorBox: {
    backgroundColor: '#FDECEA',
    margin: 16,
    marginBottom: 0,
    padding: 12,
    borderRadius: 10,
  },
  errorText: { ...typography.body, color: colors.error },
  retry: { ...typography.body, color: colors.primary, fontWeight: '700', marginTop: 6 },
  emptyBox: { alignItems: 'center', marginTop: 80, paddingHorizontal: 30 },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { ...typography.title, color: colors.text, marginBottom: 6 },
  emptyText: { ...typography.body, color: colors.textLight, textAlign: 'center' },
  footer: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    padding: 16,
    backgroundColor: colors.background,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});