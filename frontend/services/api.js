import axios from 'axios';
import { API_BASE_URL } from '../constants/config';
import { getToken } from '../utils/storage';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Automatically attach the JWT token to every request (used from Week 2 onwards)
api.interceptors.request.use(async (config) => {
  const token = await getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Turns any axios error into a readable message
const getErrorMessage = (error) => {
  console.log('API ERROR:', error.message, error.code, error.config?.baseURL, error.config?.url);
  if (error.response) {
    // Server replied with an error status (400, 401, 500...)
    return (
      error.response.data?.message ||
      error.response.data?.error ||
      'Something went wrong. Please try again.'
    );
  }
  if (error.request) {
    // Request was sent but no reply came back
    return 'Cannot reach the server. Check your internet and backend IP.';
  }
  return error.message || 'Unexpected error occurred.';
};

// Every function returns { success, data, error }
export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    return { success: true, data: response.data, error: '' };
  } catch (error) {
    return { success: false, data: null, error: getErrorMessage(error) };
  }
};

export const register = async (email, password, phone, full_name) => {
  try {
    const response = await api.post('/auth/register', {
      email,
      password,
      phone,
      full_name, // <-- confirm this field name with Person A
    });
    return { success: true, data: response.data, error: '' };
  } catch (error) {
    return { success: false, data: null, error: getErrorMessage(error) };
  }
};

export default api;