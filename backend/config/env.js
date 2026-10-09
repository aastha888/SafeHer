require('dotenv').config();

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

// The server cannot work at all without these.
const coreVars = ['MONGODB_URI', 'JWT_SECRET'];

// Third-party services: required in production, only a warning in development.
const serviceVars = [
  'FIREBASE_SERVICE_ACCOUNT',
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_PHONE_NUMBER',
];

const missingCore = coreVars.filter((key) => !process.env[key]);
if (missingCore.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingCore.join(', ')}. ` +
    'Copy .env.example to .env and fill in the values.'
  );
}

const missingServices = serviceVars.filter((key) => !process.env[key]);
if (missingServices.length > 0) {
  const message =
    `Missing service variables: ${missingServices.join(', ')}. ` +
    'Push notifications and SMS will not work.';
  if (isProduction) {
    throw new Error(message);
  }
  console.warn(`Warning: ${message}`);
}


// Test mode would silently skip real SMS, so it must never run in production.
if (isProduction && process.env.SMS_MODE === 'log') {
  throw new Error('SMS_MODE=log is for testing only and must not be set in production.');
}

module.exports = {
  nodeEnv,
  isProduction,
  port: process.env.PORT || 5000,
  mongodbUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  firebaseServiceAccount: process.env.FIREBASE_SERVICE_ACCOUNT,
  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    phoneNumber: process.env.TWILIO_PHONE_NUMBER,
  },
  googleMapsApiKey: process.env.GOOGLE_MAPS_API_KEY || null,
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:8081',
};