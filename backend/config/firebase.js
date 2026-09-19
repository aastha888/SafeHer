const { initializeApp, cert, getApps } = require('firebase-admin/app');
const { getMessaging } = require('firebase-admin/messaging');
const path = require('path');

function initFirebase() {
  if (getApps().length === 0) {
    const keyPath = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (!keyPath) {
      throw new Error('FIREBASE_SERVICE_ACCOUNT is not set in .env');
    }

    const serviceAccount = require(path.resolve(keyPath));

    initializeApp({
      credential: cert(serviceAccount),
    });
  }

  return getMessaging();
}

module.exports = { initFirebase };