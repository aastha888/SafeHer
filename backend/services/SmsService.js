const twilio = require('twilio');

let client = null;

function getClient() {
  if (!client) {
    const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN } = process.env;
    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN) {
      throw new Error('TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN must be set in .env');
    }
    client = twilio(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
  }
  return client;
}

const MAX_SMS_LENGTH = 600;

const templates = {
  emergencySOS: (userName, mapLink) =>
    `EMERGENCY: ${userName} has triggered an SOS on SafeHer and needs help. Live location: ${mapLink}`,
  verification: (code) =>
    `Your SafeHer verification code is ${code}. It expires in 10 minutes. Do not share it with anyone.`,
  alert: (message) => `SafeHer Alert: ${message}`,
};

/**
 * Send an SMS.
 * @param {string} toPhoneNumber - Recipient in international format, e.g. +919876543210
 * @param {string} message - Text to send
 * @returns {Promise<{success: boolean, messageSid: string|null, error: string|null}>}
 */
async function sendSMS(toPhoneNumber, message) {
  if (!toPhoneNumber || !message) {
    return { success: false, messageSid: null, error: 'toPhoneNumber and message are required' };
  }
  if (!/^\+\d{8,15}$/.test(toPhoneNumber)) {
    return { success: false, messageSid: null, error: 'Phone number must be in international format, like +919876543210' };
  }
  if (message.length > MAX_SMS_LENGTH) {
    return { success: false, messageSid: null, error: `Message too long (max ${MAX_SMS_LENGTH} characters)` };
  }

  try {
    const from = process.env.TWILIO_PHONE_NUMBER;
    if (!from) {
      throw new Error('TWILIO_PHONE_NUMBER is not set in .env');
    }
    const result = await getClient().messages.create({
      to: toPhoneNumber,
      from,
      body: message,
    });
    return { success: true, messageSid: result.sid, error: null };
  } catch (err) {
    return { success: false, messageSid: null, error: err.message };
  }
}

module.exports = { sendSMS, templates };