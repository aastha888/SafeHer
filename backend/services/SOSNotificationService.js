const SOSAlert = require('../models/SOSAlert');
const User = require('../models/User');
const { sendSMS, templates } = require('./SmsService');
const { notifyContactsByPhone } = require('./PushService');


const DEFAULT_COUNTRY_CODE = process.env.DEFAULT_COUNTRY_CODE || '+91';

// 9876543210 -> +919876543210 ; +14155550123 stays as is
const toInternational = (phone) => {
  const cleaned = String(phone).replace(/[\s-]/g, '');
  if (cleaned.startsWith('+')) return cleaned;
  if (cleaned.startsWith('00')) return `+${cleaned.slice(2)}`;
  return `${DEFAULT_COUNTRY_CODE}${cleaned.replace(/^0+/, '')}`;
};

const buildMapLink = (latitude, longitude) =>
  `https://www.google.com/maps?q=${latitude},${longitude}`;

// Saves one contact's result onto the alert (only that array entry is touched)
const saveResult = (alertId, contactId, fields) =>
  SOSAlert.updateOne(
    { _id: alertId, 'notifications.contact_id': contactId },
    {
      $set: {
        'notifications.$.status': fields.status,
        'notifications.$.provider_id': fields.provider_id || null,
        'notifications.$.error': fields.error || null,
        'notifications.$.sent_at': fields.status === 'sent' ? new Date() : null,
      },
    }
  );

/**
 * Text every contact on the alert. Never throws for a single failed SMS.
 * Set SMS_DRY_RUN=true in .env to test without calling Twilio.
 */
async function notifyContacts(alertId) {
  const alert = await SOSAlert.findById(alertId);
  if (!alert || alert.status !== 'active' || alert.notifications.length === 0) return;

  const user = await User.findById(alert.user_id);
  const userName = user ? user.full_name : 'A SafeHer user';
  const mapLink = buildMapLink(alert.location.latitude, alert.location.longitude);

  // Push runs alongside SMS (not awaited), so it fires even if SMS fails
  notifyContactsByPhone(
    alert.notifications.map((n) => toInternational(n.phone)),
    {
      title: `SOS from ${userName}`,
      body: 'Needs help. Tap to see their live location.',
      data: { alert_id: String(alertId), map_link: mapLink },
    },
    { type: 'sos', sentBy: alert.user_id }
  ).catch((err) => console.error('Push error:', err.message));

  let text = templates.emergencySOS(userName, mapLink);
  if (alert.message) text += ` Note: ${alert.message}`;

  const dryRun = process.env.SMS_DRY_RUN === 'true';
  let sent = 0;
  let failed = 0;

  await Promise.all(
    alert.notifications
      .filter((n) => n.channel === 'sms')
      .map(async (n) => {
        try {
          let result;
          if (dryRun) {
            result = { success: true, messageSid: 'dry-run', error: null };
          } else {
            result = await sendSMS(toInternational(n.phone), text);
          }

          if (result.success) {
            sent += 1;
            await saveResult(alertId, n.contact_id, { status: 'sent', provider_id: result.messageSid });
          } else {
            failed += 1;
            await saveResult(alertId, n.contact_id, { status: 'failed', error: result.error });
          }
        } catch (err) {
          failed += 1;
          await saveResult(alertId, n.contact_id, { status: 'failed', error: err.message });
        }
      })
  );

  console.log(`SOS ${alertId}: ${sent} SMS sent, ${failed} failed${dryRun ? ' (dry run)' : ''}`);
}

module.exports = { notifyContacts, toInternational, buildMapLink };