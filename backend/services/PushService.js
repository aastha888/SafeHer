const DeviceToken = require('../models/DeviceToken');
const NotificationLog = require('../models/NotificationLog');
const { sendPushNotification } = require('./NotificationService');
const User = require('../models/User');

// Hide the middle of a device token, e.g. abcd...wxyz
function maskToken(token) {
  if (!token || token.length < 12) {
    return '****';
  }
  return token.slice(0, 4) + '...' + token.slice(-4);
}

// True when Firebase says this token can never receive messages again.
// "invalid-argument" is also used for other mistakes, so it only counts
// when the message is about the registration token.
function isDeadTokenError(result) {
  if (result.code === 'messaging/registration-token-not-registered') return true;
  if (result.code === 'messaging/invalid-registration-token') return true;
  return (
    result.code === 'messaging/invalid-argument' &&
    /registration token/i.test(result.error || '')
  );
}

// Firebase only accepts text values in "data"
function stringifyData(data) {
  const out = {};
  Object.keys(data || {}).forEach((key) => {
    out[key] = String(data[key]);
  });
  return out;
}

/**
 * Send a push notification to every phone registered for one user.
 * Logs each attempt and removes tokens that are no longer valid. Never throws.
 * @param {string} userId - SafeHer user to notify
 * @param {{title: string, body: string, data?: object}} message
 * @param {{type?: string, sentBy?: string}} options - type: 'sos' | 'test' | 'other'
 * @returns {Promise<{devices: number, sent: number, failed: number, removed: number}>}
 */
async function sendPushToUser(userId, message, options = {}) {
  const summary = { devices: 0, sent: 0, failed: 0, removed: 0 };

  try {
    const devices = await DeviceToken.find({ user_id: userId });
    summary.devices = devices.length;

    await Promise.all(
      devices.map(async (device) => {
        const result = await sendPushNotification(
          device.token,
          message.title,
          message.body,
          stringifyData(message.data)
        );

        if (result.success) {
          summary.sent += 1;
        } else {
          summary.failed += 1;
          if (isDeadTokenError(result)) {
            await DeviceToken.deleteOne({ _id: device._id });
            summary.removed += 1;
          }
        }

        // A logging problem must never stop the alert
        try {
          await NotificationLog.create({
            user_id: userId,
            sent_by: options.sentBy,
            channel: 'push',
            type: options.type || 'other',
            recipient: maskToken(device.token),
            status: result.success ? 'sent' : 'failed',
            error: result.error || undefined,
            provider_id: result.messageId || undefined,
          });
        } catch (logError) {
          console.error('Notification log error:', logError.message);
        }
      })
    );
  } catch (err) {
    console.error('Send push error:', err.message);
  }

  return summary;
}

const digitsOnly = (phone) => String(phone || '').replace(/\D/g, '');
const lastTenDigits = (phone) => digitsOnly(phone).slice(-10);

// Find SafeHer users whose phone matches any of the given numbers.
// Numbers are compared by their last 10 digits, so +91 98203 75667,
// 09820375667 and 9820375667 all match each other.
async function findUserIdsByPhones(phones) {
  const wanted = new Set(
    (phones || []).map(lastTenDigits).filter((d) => d.length === 10)
  );
  if (wanted.size === 0) {
    return [];
  }

  // Narrow the search by the last 4 digits, then compare the full 10 digits
  const suffixes = [...new Set([...wanted].map((d) => d.slice(-4)))];
  const candidates = await User.find({
    phone: { $regex: `(${suffixes.join('|')})$` },
  }).select('_id phone');

  return candidates
    .filter((u) => wanted.has(lastTenDigits(u.phone)))
    .map((u) => u._id);
}

/**
 * Push a message to every SafeHer user whose phone matches one of the numbers,
 * for example the emergency contacts of an SOS alert. Never throws.
 * @returns {Promise<{users: number, devices: number, sent: number, failed: number, removed: number}>}
 */
async function notifyContactsByPhone(phones, message, options = {}) {
  const total = { users: 0, devices: 0, sent: 0, failed: 0, removed: 0 };

  try {
    const userIds = await findUserIdsByPhones(phones);
    total.users = userIds.length;

    const results = await Promise.all(
      userIds.map((id) => sendPushToUser(id, message, options))
    );
    results.forEach((r) => {
      total.devices += r.devices;
      total.sent += r.sent;
      total.failed += r.failed;
      total.removed += r.removed;
    });
  } catch (err) {
    console.error('Notify contacts by phone error:', err.message);
  }

  return total;
}

module.exports = {
  sendPushToUser,
  notifyContactsByPhone,
  findUserIdsByPhones,
  isDeadTokenError,
  maskToken,
};