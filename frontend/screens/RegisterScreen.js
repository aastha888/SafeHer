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
import {
  validateName,
  validateEmail,
  validatePhone,
  validatePassword,
  validateConfirmPassword,
} from '../utils/validation';

import { register, login } from '../services/api';
import { saveToken } from '../utils/storage';

const EMPTY_ERRORS = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  confirmPassword: '',
};

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({
    fullName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState(EMPTY_ERRORS);
  const [formError, setFormError] = useState('');
  const [loading, setLoading] = useState(false);

  // Runs the right validator for a given field
  const validateField = (field, value, currentForm) => {
    switch (field) {
      case 'fullName':
        return validateName(value);
      case 'email':
        return validateEmail(value);
      case 'phone':
        return validatePhone(value);
      case 'password':
        return validatePassword(value);
      case 'confirmPassword':
        return validateConfirmPassword(currentForm.password, value);
      default:
        return '';
    }
  };

  const handleChange = (field, value) => {
    const updatedForm = { ...form, [field]: value };
    setForm(updatedForm);
    setFormError('');

    // Only re-validate live if this field already showed an error
    if (errors[field]) {
      setErrors({ ...errors, [field]: validateField(field, value, updatedForm) });
    }
    // If password changes while confirm password has an error, re-check it too
    if (field === 'password' && errors.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: validateConfirmPassword(value, updatedForm.confirmPassword),
      }));
    }
  };

    const handleRegister = async () => {
    const newErrors = {
      fullName: validateName(form.fullName),
      email: validateEmail(form.email),
      phone: validatePhone(form.phone),
      password: validatePassword(form.password),
      confirmPassword: validateConfirmPassword(form.password, form.confirmPassword),
    };
    setErrors(newErrors);
    setFormError('');

    const hasErrors = Object.values(newErrors).some((e) => e !== '');
    if (hasErrors) return;

    setLoading(true);

    const result = await register(
      form.email.trim(),
      form.password,
      form.phone.trim(),
      form.fullName.trim()
    );

    if (!result.success) {
      setLoading(false);
      setFormError(result.error);
      return;
    }

    // Registration worked, now log in automatically
    const loginResult = await login(form.email.trim(), form.password);
    setLoading(false);

    if (!loginResult.success) {
      // Account exists, so send them to Login to sign in manually
      navigation.navigate('Login');
      return;
    }

    const token = loginResult.data?.token || loginResult.data?.data?.token;
    if (token) {
      await saveToken(token);
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
    } else {
      navigation.navigate('Login');
    }
  };

  return (
        <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View style={styles.header}>
          <Text style={styles.logo}>SafeHer</Text>
          <Text style={styles.tagline}>Create your account</Text>
        </View>

        <InputField
          label="Full Name"
          placeholder="Enter your full name"
          value={form.fullName}
          onChangeText={(t) => handleChange('fullName', t)}
          autoCapitalize="words"
          error={errors.fullName}
        />

        <InputField
          label="Email"
          placeholder="Enter your email"
          value={form.email}
          onChangeText={(t) => handleChange('email', t)}
          keyboardType="email-address"
          error={errors.email}
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
          label="Password"
          placeholder="At least 8 characters"
          value={form.password}
          onChangeText={(t) => handleChange('password', t)}
          secureTextEntry
          error={errors.password}
        />

        <InputField
          label="Confirm Password"
          placeholder="Re-enter your password"
          value={form.confirmPassword}
          onChangeText={(t) => handleChange('confirmPassword', t)}
          secureTextEntry
          error={errors.confirmPassword}
        />

        {formError ? <Text style={styles.formError}>{formError}</Text> : null}

        <Button title="Register" onPress={handleRegister} loading={loading} />

        <View style={styles.footer}>
          <Text style={styles.footerText}>Already have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.link}>Login</Text>
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
    alignItems: 'center',
    padding: 24,
    paddingTop: 60,
    paddingBottom: 120,
  },
  header: { alignItems: 'center', marginBottom: 32 },
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