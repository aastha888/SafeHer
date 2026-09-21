import { getCurrentLocation } from './LocationService';
import { sendLocation } from './BackendLocationService';

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
    const result = await getCurrentLocation();
    if (!result.success) {
      onStatus('Location error: ' + result.error);
      return;
    }

    const current = result.location;

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

    const sync = await sendLocation(current);
    if (sync.success) {
      lastSent = current;
      onStatus('Sent to server at ' + new Date().toLocaleTimeString());
    } else {
      onStatus('Not sent: ' + sync.error);
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