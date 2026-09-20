import * as Location from 'expo-location';

// Ask the user for permission to use the location.
// Returns { granted: true } or { granted: false, error: '...' }
export async function requestLocationPermission() {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return {
        granted: false,
        error: 'Location permission was denied. SafeHer needs it to share your location with your emergency contacts.',
      };
    }
    return { granted: true };
  } catch (err) {
    return { granted: false, error: err.message };
  }
}

// Get the phone's current position once.
// Returns { success: true, location: { latitude, longitude, accuracy, timestamp } }
// or { success: false, error: '...' }
export async function getCurrentLocation() {
  const permission = await requestLocationPermission();
  if (!permission.granted) {
    return { success: false, error: permission.error };
  }

  try {
    const enabled = await Location.hasServicesEnabledAsync();
    if (!enabled) {
      return { success: false, error: 'Location is turned off. Please turn on GPS in your phone settings.' };
    }

    const position = await Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.High,
    });

    return {
      success: true,
      location: {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp,
      },
    };
  } catch (err) {
    return { success: false, error: err.message };
  }
}

// Keep tracking the location as the phone moves.
// onUpdate is called with { latitude, longitude, accuracy, timestamp } every time.
// Returns { success: true, stop } where stop() ends the tracking, or { success: false, error }.
export async function startWatching(onUpdate) {
  const permission = await requestLocationPermission();
  if (!permission.granted) {
    return { success: false, error: permission.error };
  }

  try {
    const subscription = await Location.watchPositionAsync(
      {
        accuracy: Location.Accuracy.High,
        timeInterval: 30000, // every 30 seconds
        distanceInterval: 10, // or when the phone moves 10 metres
      },
      (position) => {
        onUpdate({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        });
      }
    );

    return { success: true, stop: () => subscription.remove() };
  } catch (err) {
    return { success: false, error: err.message };
  }
}