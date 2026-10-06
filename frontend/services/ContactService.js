import api from './api';

// Same return shape as login/register: { success, data, error }
const getErrorMessage = (error) => {
  if (error.response) {
    return (
      error.response.data?.message ||
      error.response.data?.error ||
      'Something went wrong. Please try again.'
    );
  }
  if (error.request) {
    return 'Cannot reach the server. Check your internet and backend IP.';
  }
  return error.message || 'Unexpected error occurred.';
};

// GET /contacts  ->  { success, contacts: [...] }
export const getContacts = async () => {
  try {
    const response = await api.get('/contacts');
    return { success: true, data: response.data.contacts || [], error: '' };
  } catch (error) {
    return { success: false, data: [], error: getErrorMessage(error) };
  }
};

// POST /contacts  ->  { success, contact: {...} }
export const addContact = async (contactData) => {
  try {
    const response = await api.post('/contacts', contactData);
    return { success: true, data: response.data.contact, error: '' };
  } catch (error) {
    return { success: false, data: null, error: getErrorMessage(error) };
  }
};

// PUT /contacts/:id  ->  { success, contact: {...} }
export const updateContact = async (id, contactData) => {
  try {
    const response = await api.put(`/contacts/${id}`, contactData);
    return { success: true, data: response.data.contact, error: '' };
  } catch (error) {
    return { success: false, data: null, error: getErrorMessage(error) };
  }
};

// DELETE /contacts/:id
export const deleteContact = async (id) => {
  try {
    const response = await api.delete(`/contacts/${id}`);
    return { success: true, data: response.data, error: '' };
  } catch (error) {
    return { success: false, data: null, error: getErrorMessage(error) };
  }
};