const { initFirebase } = require('../config/firebase');

/**
 * Send a push notification to one device.
 * @param {string} deviceToken - FCM registration token of the device
 * @param {string} title - Notification title
 * @param {string} body - Notification body text
 * @param {object} data - Optional key/value data (values must be strings)
 * @returns {Promise<{success: boolean, messageId: string|null, error: string|null}>}
 */
async function sendPushNotification(deviceToken, title, body, data = {}) {
  if (!deviceToken || !title || !body) {
    return { success: false, messageId: null, error: 'deviceToken, title and body are required' };
  }

  try {
    const messaging = initFirebase();
    const messageId = await messaging.send({
      token: deviceToken,
      notification: { title, body },
      data,
      android: { priority: 'high' },
    });
    return { success: true, messageId, error: null };
  } catch (err) {
    return { success: false, messageId: null, error: err.message };
  }
}

module.exports = { sendPushNotification };