import { getCurrentLocation } from './LocationService';
import { sendLocation } from './BackendLocationService';
import { addToQueue, flushQueue, getQueueSize } from './LocationQueue';

const SEND_INTERVAL_MS = 30000; // 30 seconds
const MIN_MOVE_METERS = 10; // don't send if moved less than this

let timerId = null;
let lastSent = null;
let busy = false;

// Distance in metres between two points (Haversine formula)
function distanceInMeters(a, b) {
  const R = 6371000;
  const toRad = (deg) => (deg * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

// Read the location once and send it to the server (if the phone moved).
// onStatus is called with a short message so the screen can show it.
async function trackOnce(onStatus) {
  if (busy) return;
  busy = true;
  try {
    // 1. Send anything saved while the network was down.
    const waiting = await getQueueSize();
    if (waiting > 0) {
      onStatus('Syncing ' + waiting + ' saved location(s)...');
      const flushed = await flushQueue();
      if (flushed.remaining > 0) {
        onStatus('Offline: ' + flushed.remaining + ' location(s) waiting to sync');
      }
    }

    // 2. Read the current location.
    const result = await getCurrentLocation();
    if (!result.success) {
      onStatus('Location error: ' + result.error);
      return;
    }

    const current = result.location;

    // 3. Skip if the phone has not moved enough.
    if (lastSent) {
      const moved = distanceInMeters(lastSent, current);
      if (moved < MIN_MOVE_METERS) {
        onStatus(
          'No movement (moved ' + Math.round(moved) + ' m, needs ' + MIN_MOVE_METERS +
          ' m) at ' + new Date().toLocaleTimeString()
        );
        return;
      }
    }

    // 4. Send it. If it fails, save it for later.
    const sync = await sendLocation(current);
    if (sync.success) {
      lastSent = current;
      onStatus('Sent to server at ' + new Date().toLocaleTimeString());
    } else {
      await addToQueue(current);
      lastSent = current;
      const size = await getQueueSize();
      onStatus('Offline: saved ' + size + ' location(s) to send later');
    }
  } finally {
    busy = false;
  }
}
// Start sending automatically. Returns { success: true } or { success: false, error }.
export function startTracking(onStatus) {
  if (timerId) {
    return { success: false, error: 'Tracking is already running.' };
  }
  lastSent = null;
  trackOnce(onStatus);
  timerId = setInterval(() => trackOnce(onStatus), SEND_INTERVAL_MS);
  return { success: true };
}

// Stop sending. Safe to call even if tracking is not running.
export function stopTracking() {
  if (timerId) {
    clearInterval(timerId);
    timerId = null;
  }
  lastSent = null;
}

export function isTracking() {
  return timerId !== null;
}