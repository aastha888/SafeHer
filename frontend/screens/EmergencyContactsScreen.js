import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import NetInfo from '@react-native-community/netinfo';

import ContactCard from '../components/ContactCard';
import LoadingSpinner from '../components/LoadingSpinner';
import Button from '../components/Button';
import AddContactModal from '../components/AddContactModal';
import colors from '../constants/colors';
import typography from '../constants/typography';
import { getContacts, addContact, updateContact, deleteContact } from '../services/ContactService';
import { getCachedContacts, saveContacts } from '../utils/caching';

export default function EmergencyContactsScreen({ navigation }) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState('');
  const [syncStatus, setSyncStatus] = useState(''); // '', 'cached', 'syncing', 'synced'

  const [modalVisible, setModalVisible] = useState(false);
  const [editingContact, setEditingContact] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const loadContacts = useCallback(async (isRefresh = false) => {
    // Step 1: show cached data immediately (only on first load, not pull-to-refresh)
    if (!isRefresh) {
      const cached = await getCachedContacts();
      if (cached.length > 0) {
        setContacts(cached);
        setSyncStatus('cached');
        setLoading(false);
      } else {
        setLoading(true);
      }
    } else {
      setRefreshing(true);
    }

    // Step 2: check connectivity before hitting the API
    const netState = await NetInfo.fetch();
    if (!netState.isConnected) {
      setError('You are offline. Showing cached data.');
      setSyncStatus('cached');
      setLoading(false);
      setRefreshing(false);
      return;
    }

    // Step 3: fetch fresh data from the API
    setSyncStatus('syncing');
    setError('');
    const result = await getContacts();

    if (result.success) {
      setContacts(result.data);
      setSyncStatus('synced');
    } else {
      // API failed even though we're "online" (e.g. backend is down)
      const cached = await getCachedContacts();
      if (cached.length > 0) {
        setContacts(cached);
        setSyncStatus('cached');
        setError(`${result.error} Showing cached data.`);
      } else {
        setError(result.error);
        setSyncStatus('');
      }
    }

    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const handleAdd = () => {
    setEditingContact(null);
    setSubmitError('');
    setModalVisible(true);
  };

  const handleEdit = (contact) => {
    setEditingContact(contact);
    setSubmitError('');
    setModalVisible(true);
  };

  const handleDelete = (contact) => {
    Alert.alert(
      'Delete Contact',
      `Remove ${contact.name} from your emergency contacts?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            const result = await deleteContact(contact._id);
            if (result.success) {
              setContacts((prev) => {
                const updated = prev.filter((c) => c._id !== contact._id);
                saveContacts(updated);
                return updated;
              });
            } else {
              Alert.alert('Error', result.error);
            }
          },
        },
      ]
    );
  };

  const handleModalSubmit = async (formData) => {
    setSubmitting(true);
    setSubmitError('');

    const result = editingContact
      ? await updateContact(editingContact._id, formData)
      : await addContact(formData);

    setSubmitting(false);

    if (!result.success) {
      setSubmitError(result.error);
      return;
    }

    if (editingContact) {
      setContacts((prev) => {
        const updated = prev.map((c) => (c._id === editingContact._id ? result.data : c));
        saveContacts(updated);
        return updated;
      });
    } else {
      setContacts((prev) => {
        const updated = [...prev, result.data];
        saveContacts(updated);
        return updated;
      });
    }

    setModalVisible(false);
  };

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

      {syncStatus ? (
        <View style={styles.syncBar}>
          <Text style={styles.syncText}>
            {syncStatus === 'cached' && '📦 Showing cached data'}
            {syncStatus === 'syncing' && '🔄 Syncing...'}
            {syncStatus === 'synced' && '✅ Up to date'}
          </Text>
        </View>
      ) : null}

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

      <AddContactModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSubmit={handleModalSubmit}
        editingContact={editingContact}
        submitting={submitting}
        submitError={submitError}
      />
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
  syncBar: { paddingHorizontal: 16, paddingTop: 10 },
  syncText: { ...typography.small, color: colors.textLight },
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