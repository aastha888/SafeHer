require('dotenv').config();

const required = [
  'MONGODB_URI',
  'JWT_SECRET',
  'FIREBASE_SERVICE_ACCOUNT',
  'TWILIO_ACCOUNT_SID',
  'TWILIO_AUTH_TOKEN',
  'TWILIO_PHONE_NUMBER',
];

const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missing.join(', ')}. ` +
    'Copy .env.example to .env and fill in the values.'
  );
}

module.exports = {
  nodeEnv: process.env.NODE_ENV || 'development',
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