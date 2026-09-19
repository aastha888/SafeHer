import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from 'react-native';

import InputField from '../components/InputField';
import Button from '../components/Button';
import colors from '../constants/colors';
import typography from '../constants/typography';
import { validateEmail, validatePassword } from '../utils/validation';
import { login } from '../services/api';
import { saveToken } from '../utils/storage';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({ email: '', password: '' });
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEmailChange = (text) => {
    setEmail(text);
    setFormError('');
    if (errors.email) setErrors({ ...errors, email: validateEmail(text) });
  };

  const handlePasswordChange = (text) => {
    setPassword(text);
    setFormError('');
    if (errors.password) setErrors({ ...errors, password: validatePassword(text) });
  };

    const handleLogin = async () => {
    const emailError = validateEmail(email);
    const passwordError = validatePassword(password);
    setErrors({ email: emailError, password: passwordError });
    setFormError('');

    if (emailError || passwordError) return;

    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);

    if (!result.success) {
      setFormError(result.error);
      return;
    }

    // Token might be at data.token or data.data.token depending on Person A's response
    const token = result.data?.token || result.data?.data?.token;
    if (!token) {
      setFormError('Login succeeded but no token was received.');
      return;
    }

    await saveToken(token);
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  };

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.logo}>SafeHer</Text>
          <Text style={styles.tagline}>Your safety, always with you</Text>
        </View>

        <InputField
          label="Email"
          placeholder="Enter your email"
          value={email}
          onChangeText={handleEmailChange}
          keyboardType="email-address"
          error={errors.email}
        />

        <InputField
          label="Password"
          placeholder="Enter your password"
          value={password}
          onChangeText={handlePasswordChange}
          secureTextEntry
          error={errors.password}
        />

        {formError ? <Text style={styles.formError}>{formError}</Text> : null}

        <Button title="Login" onPress={handleLogin} loading={loading} />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.link}>Register</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    paddingBottom: 120,
  },
  header: { alignItems: 'center', marginBottom: 40 },
  logo: { fontSize: 36, fontWeight: '800', color: colors.primary },
  tagline: { ...typography.body, color: colors.textLight, marginTop: 6 },
  formError: {
    ...typography.body,
    color: colors.error,
    marginBottom: 12,
    textAlign: 'center',
  },
  footer: { flexDirection: 'row', marginTop: 24 },
  footerText: { ...typography.body, color: colors.textLight },
  link: { ...typography.body, color: colors.primary, fontWeight: '700' },
});