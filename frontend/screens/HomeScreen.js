import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import colors from '../constants/colors';
import typography from '../constants/typography';
import Button from '../components/Button';
import ContactCard from '../components/ContactCard';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';

const TEST_CONTACT = {
  name: 'Priya Sharma',
  phone: '9876543210',
  relationship: 'family',
  is_verified: true,
};

export default function HomeScreen({ navigation }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const showSpinner = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 2000);
  };

  return (
    <View style={styles.flex}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={[typography.heading, { color: colors.primary, marginBottom: 20 }]}>
          Component Test
        </Text>

        <ContactCard
          contact={TEST_CONTACT}
          onEdit={() => alert('Edit pressed')}
          onDelete={() => alert('Delete pressed')}
        />
        <ContactCard contact={{ ...TEST_CONTACT, name: 'Rahul', is_verified: false }} />

        <View style={styles.gap}><Button title="Primary" onPress={() => {}} /></View>
        <View style={styles.gap}><Button title="Secondary" variant="secondary" onPress={() => {}} /></View>
        <View style={styles.gap}><Button title="Danger" variant="danger" onPress={() => {}} /></View>
        <View style={styles.gap}><Button title="Open Modal" onPress={() => setModalVisible(true)} /></View>
        <View style={styles.gap}><Button title="Show Spinner (2s)" onPress={showSpinner} /></View>
        <View style={styles.gap}>
          <Button title="Back to Login" variant="secondary" onPress={() => navigation.navigate('Login')} />
        </View>
      </ScrollView>

      <Modal visible={modalVisible} onClose={() => setModalVisible(false)} title="Test Modal">
        <Text style={typography.body}>This is the modal content.</Text>
        <View style={{ height: 16 }} />
        <Button title="Close" onPress={() => setModalVisible(false)} />
      </Modal>

      {loading ? <LoadingSpinner /> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: { padding: 24, paddingTop: 60 },
  gap: { marginBottom: 12 },
});