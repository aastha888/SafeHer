import React, { useState, useEffect } from 'react';
import { Linking } from 'react-native';
import { getCurrentLocation } from '../services/LocationService';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';

import colors from '../constants/colors';
import typography from '../constants/typography';
import SafetyStatusCard from '../components/SafetyStatusCard';
import CurrentLocationCard from '../components/CurrentLocationCard';
import SOSConfirmModal from '../components/SOSConfirmModal';
import Button from '../components/Button';
import { removeToken } from '../utils/storage';
import { triggerSOS } from '../services/SOSService';

export default function HomeScreen({ navigation }) {
  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(true);
  const [locationError, setLocationError] = useState('');

  const [sosModalVisible, setSosModalVisible] = useState(false);
  const [sosSending, setSosSending] = useState(false);

  useEffect(() => {
    (async () => {
      setLocationLoading(true);
      const result = await getCurrentLocation();
      if (result.success) {
        setLocation(result.location);
        setLocationError('');
      } else {
        setLocationError(result.error);
      }
      setLocationLoading(false);
    })();
  }, []);

  const handleSOS = () => {
    setSosModalVisible(true);
  };

  const handleSOSConfirm = async () => {
    setSosSending(true);
    const result = await triggerSOS(location);
    setSosSending(false);
    setSosModalVisible(false);

    if (result.success) {
      Alert.alert('SOS Sent', 'Your emergency contacts have been notified.');
    } else {
      Alert.alert('SOS Failed', result.error || 'Could not send SOS. Please try again.');
    }
  };

  const handleSOSCancel = () => {
    if (sosSending) return; // don't allow closing mid-send
    setSosModalVisible(false);
  };

  const handleShareLocation = () => {
    if (!location) {
      Alert.alert('Location not available', 'Please wait for your location to load.');
      return;
    }
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${location.latitude},${location.longitude}`;
    Linking.openURL(mapsUrl);
  };

  return (
    <ScrollView style={styles.flex} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.greeting}>Hi there 👋</Text>
        <Text style={styles.logo}>SafeHer</Text>
      </View>

      <SafetyStatusCard score={75} />

      <CurrentLocationCard
        location={location}
        loading={locationLoading}
        error={locationError}
        onShareLocation={handleShareLocation}
        onViewMap={() => navigation.navigate('Map')}
      />

      <Text style={styles.sectionTitle}>Quick Actions</Text>

      <TouchableOpacity style={styles.sosButton} onPress={handleSOS} activeOpacity={0.85}>
        <Text style={styles.sosText}>🆘 SOS</Text>
        <Text style={styles.sosSubtext}>Tap to alert your emergency contacts</Text>
      </TouchableOpacity>

      <View style={styles.gap}>
        <Button
          title="Emergency Contacts"
          variant="secondary"
          onPress={() => navigation.navigate('EmergencyContacts')}
        />
      </View>

      <View style={styles.gap}>
        <Button
          title="Settings"
          variant="secondary"
          onPress={() => Alert.alert('Settings', 'Coming soon')}
        />
      </View>

      <View style={styles.gap}>
        <Button
          title="Log Out"
          variant="danger"
          onPress={async () => {
            await removeToken();
            navigation.reset({ index: 0, routes: [{ name: 'Login' }] });
          }}
        />
      </View>

      <SOSConfirmModal
        visible={sosModalVisible}
        onConfirm={handleSOSConfirm}
        onCancel={handleSOSCancel}
        sending={sosSending}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.secondary },
  container: { padding: 20, paddingTop: 56, paddingBottom: 40 },
  header: { marginBottom: 20 },
  greeting: { ...typography.body, color: colors.textLight },
  logo: { fontSize: 28, fontWeight: '800', color: colors.primary, marginTop: 2 },
  sectionTitle: { ...typography.title, color: colors.text, marginTop: 8, marginBottom: 12 },
  sosButton: {
    backgroundColor: colors.error,
    borderRadius: 18,
    paddingVertical: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  sosText: { fontSize: 28, fontWeight: '800', color: '#FFFFFF' },
  sosSubtext: { ...typography.small, color: '#FFFFFF', marginTop: 6, opacity: 0.9 },
  gap: { marginBottom: 12 },
});