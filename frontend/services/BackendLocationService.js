import api from './api';

// Turns any axios error into a readable message
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

// Send the phone's current location to the backend.
// location: { latitude, longitude, accuracy }
// Returns { success, data, error }
export const sendLocation = async (location) => {
  try {
    const response = await api.post('/locations', {
      latitude: location.latitude,
      longitude: location.longitude,
      accuracy: location.accuracy,
    });
    return { success: true, data: response.data, error: '' };
  } catch (error) {
    return { success: false, data: null, error: getErrorMessage(error) };
  }
};

// Get the most recent location saved for the logged-in user.
export const getLatestLocation = async () => {
  try {
    const response = await api.get('/locations/latest');
    return { success: true, data: response.data, error: '' };
  } catch (error) {
    return { success: false, data: null, error: getErrorMessage(error) };
  }
};

// Get past locations. hours defaults to 24, page to 1.
export const getLocationHistory = async (hours = 24, page = 1) => {
  try {
    const response = await api.get('/locations/history', {
      params: { hours, page },
    });
    return { success: true, data: response.data, error: '' };
  } catch (error) {
    return { success: false, data: null, error: getErrorMessage(error) };
  }
};