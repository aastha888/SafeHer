import AsyncStorage from '@react-native-async-storage/async-storage';
import { sendLocation } from './BackendLocationService';

const QUEUE_KEY = 'safeher_location_queue';
const MAX_QUEUE_SIZE = 500; // keep the newest 500 so storage never grows forever

// Read the saved list from the phone.
async function readQueue() {
  try {
    const raw = await AsyncStorage.getItem(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    return [];
  }
}

// Write the list back to the phone.
async function writeQueue(list) {
  try {
    await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(list));
  } catch (err) {
    // If saving fails there is nothing more we can do here.
  }
}

// Save one location that could not be sent.
export async function addToQueue(location) {
  const list = await readQueue();
  list.push({
    latitude: location.latitude,
    longitude: location.longitude,
    accuracy: location.accuracy,
    timestamp: location.timestamp,
  });
  // Keep only the newest MAX_QUEUE_SIZE items.
  const trimmed = list.slice(-MAX_QUEUE_SIZE);
  await writeQueue(trimmed);
}

// How many locations are waiting to be sent.
export async function getQueueSize() {
  const list = await readQueue();
  return list.length;
}

// Try to send every saved location, oldest first.
// Stops at the first failure and keeps the rest for next time.
// Returns { sent, remaining }.
export async function flushQueue() {
  const list = await readQueue();
  let sent = 0;

  while (list.length > 0) {
    const result = await sendLocation(list[0]);
    if (!result.success) {
      break;
    }
    list.shift();
    sent += 1;
  }

  await writeQueue(list);
  return { sent, remaining: list.length };
}