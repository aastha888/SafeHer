// Same shape as ContactService.js: { success, data, error }
// TODO (once Person A's SOS backend route is live): replace the simulated
// setTimeout below with a real api.post('/sos/trigger', { location }) call,
// same pattern as ContactService.addContact(). No other file needs to change
// when you do this swap — HomeScreen just calls triggerSOS(location).

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

// Simulated SOS trigger — swap for real API call in Week 3-4 merge point with Person A
export const triggerSOS = async (location) => {
  try {
    // --- STUB: remove this block once backend /sos/trigger route exists ---
    await new Promise((resolve) => setTimeout(resolve, 1200));
    console.log('[SOSService] Simulated SOS trigger with location:', location);
    return {
      success: true,
      data: {
        id: `local-sos-${Date.now()}`, // real id will come from backend later
        triggeredAt: new Date().toISOString(),
        location,
      },
      error: '',
    };
    // --- END STUB ---

    // --- REAL VERSION (uncomment when backend ready) ---
    // const response = await api.post('/sos/trigger', { location });
    // return { success: true, data: response.data.sos, error: '' };
  } catch (error) {
    return { success: false, data: null, error: getErrorMessage(error) };
  }
};

// Cancel an active SOS (e.g. user pressed SOS by mistake and wants to stand down)
export const cancelSOS = async (sosId) => {
  try {
    // --- STUB ---
    await new Promise((resolve) => setTimeout(resolve, 600));
    console.log('[SOSService] Simulated SOS cancel for id:', sosId);
    return { success: true, data: null, error: '' };
    // --- END STUB ---

    // --- REAL VERSION ---
    // const response = await api.put(`/sos/${sosId}/cancel`);
    // return { success: true, data: response.data, error: '' };
  } catch (error) {
    return { success: false, data: null, error: getErrorMessage(error) };
  }
};