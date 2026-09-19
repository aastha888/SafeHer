export const validateEmail = (email) => {
  if (!email.trim()) return 'Email is required';
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) return 'Enter a valid email address';
  return '';
};

export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  return '';
};

export const validateName = (name) => {
  if (!name.trim()) return 'Full name is required';
  if (name.trim().length < 2) return 'Name must be at least 2 characters';
  return '';
};

export const validatePhone = (phone) => {
  if (!phone.trim()) return 'Phone number is required';
  // Accepts 10 digits, optionally with a + country code prefix (e.g. +919876543210)
  const phoneRegex = /^\+?[0-9]{10,13}$/;
  if (!phoneRegex.test(phone.trim())) return 'Enter a valid phone number (10-13 digits)';
  return '';
};

export const validateConfirmPassword = (password, confirmPassword) => {
  if (!confirmPassword) return 'Please confirm your password';
  if (password !== confirmPassword) return 'Passwords do not match';
  return '';
};