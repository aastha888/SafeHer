import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../constants/colors';
import typography from '../constants/typography';
import InputField from '../components/InputField';
import Button from '../components/Button';

export default function HomeScreen({ navigation }) {
  const [email, setEmail] = useState('');

  return (
    <View style={styles.container}>
      <Text style={[typography.heading, { color: colors.primary, marginBottom: 24 }]}>
        Home Screen
      </Text>

      <InputField
        label="Email"
        placeholder="Enter email"
        value={email}
        onChangeText={setEmail}
        error={email.length > 0 && !email.includes('@') ? 'Invalid email' : ''}
      />
      <Button title="Test Button" onPress={() => alert('Clicked')} />
      <View style={{ height: 12 }} />
      <Button title="Loading Button" loading={true} />
      <View style={{ height: 12 }} />
      <Button title="Back to Login" onPress={() => navigation.navigate('Login')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: colors.background,
  },
});