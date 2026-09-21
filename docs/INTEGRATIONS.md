# Integrations Guide

How SafeHer connects to third-party services. Each developer sets these up on their own machine using their own credentials.

## Rules for credentials

- Never commit `.env`, `firebase-key.json`, or any key, token, or password.
- Real values live only in your local `backend/.env` and key files, which Git ignores.
- `backend/.env.example` holds placeholders only.
- If a credential is ever committed or shared by mistake, rotate it immediately (generate a new one and revoke the old one). Deleting it from the file is not enough because it stays in Git history.

## Firebase Cloud Messaging (push notifications)

Code: `backend/config/firebase.js`, `backend/services/NotificationService.js`

### Setup

1. Go to the Firebase Console and open the SafeHer project.
2. Open **Project settings** and then the **Cloud Messaging** tab. Confirm **Firebase Cloud Messaging API (V1)** is Enabled.
3. Open the **Service accounts** tab, select **Node.js**, and click **Generate new private key**.
4. Save the downloaded file as `backend/firebase-key.json`.
5. Add this line to your `backend/.env`:

```
FIREBASE_SERVICE_ACCOUNT=./firebase-key.json
```

`firebase-key.json` is already listed in `.gitignore`. Check with `git status` that it does not appear.

### Usage

```javascript
const { sendPushNotification } = require('./services/NotificationService');

const result = await sendPushNotification(deviceToken, 'Title', 'Message body', { key: 'value' });
// { success: true, messageId: '...', error: null }
```

The function never throws. It returns `{ success: false, error: '...' }` on failure so the caller can fall back to SMS.

### Testing

A real test needs a device token from the mobile app. Without one, sending to a fake token should return `success: false` with the error `The registration token is not a valid FCM registration token`. That result confirms your credentials work.

## Twilio (SMS)

Code: `backend/services/SmsService.js`

### Setup

1. Create a Twilio account and verify your own phone number.
2. From the Twilio Console home page, copy the **Account SID** and **Auth Token**.
3. Get a Twilio phone number. On a trial account, open the **Send an SMS** tutorial from the Console home page, which assigns a trial number.
4. Add these lines to your `backend/.env`:

```
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_PHONE_NUMBER=+1XXXXXXXXXX
```

`TWILIO_PHONE_NUMBER` is the Twilio number messages are sent from, in international format.

### Usage

```javascript
const { sendSMS, templates } = require('./services/SmsService');

const result = await sendSMS('+919876543210', templates.alert('Message text'));
// { success: true, messageSid: '...', error: null }
```

Available templates: `emergencySOS(userName, mapLink)`, `verification(code)`, `alert(message)`.

The function checks the phone number format (international, starting with `+`) and message length before calling Twilio, and never throws.

### Trial account limits

- SMS can only be sent to numbers verified in the Twilio Console.
- **Trial accounts can only send predefined templates.** Sending custom text through the API fails with `Invalid template name. Trial accounts can only use predefined SMS templates.` A trial call must use a template name, for example `sms_appointment_reminders`.
- Custom emergency messages (such as the `emergencySOS` template) need a paid Twilio account or a different SMS provider.

## Maps and location

Code: `frontend/services/LocationService.js`, `frontend/services/BackendLocationService.js`, `frontend/services/TrackingService.js`, `frontend/services/LocationQueue.js`, `frontend/screens/MapScreen.js`, `frontend/components/LocationMap.js`

### Location permissions

- **Android:** `ACCESS_COARSE_LOCATION` and `ACCESS_FINE_LOCATION` are declared in `frontend/app.json` under `android.permissions`.
- **iPhone:** the `expo-location` plugin in `app.json` sets the permission message. An `ios.infoPlist` entry (`NSLocationWhenInUseUsageDescription`) still has to be added before an iPhone build.
- The app only asks for location **while it is in use**. Background tracking is not enabled.
- Test on a real device. GPS does not work properly in an emulator or simulator.

### GPS (no key needed)

`expo-location` reads the phone's GPS and needs no API key. It works in Expo Go on an Android phone.

### Map display and the Google Maps key

- `LocationMap.js` draws a real map (marker, accuracy circle, Center and Satellite buttons) using `react-native-maps`.
- On Android, Google Maps needs an **API key** to download map tiles. Without one the map area stays blank, even though the location itself is correct.
- Because no key has been set up yet, the Map screen currently shows the coordinates, accuracy, time and an **Open in Google Maps** button, and does not use `LocationMap.js`.
- To use the real map later: create a Google Cloud project with billing enabled, enable **Maps SDK for Android**, create an API key, restrict it to the app, and add it to `app.json` under `android.config.googleMaps.apiKey`. Then switch `MapScreen.js` to render `LocationMap`.
- Always restrict the key in Google Cloud (to the Android app and to the Maps SDK only). A key placed in `app.json` ends up inside the built app, so a restriction is what stops others from using it.

### Sending location to the backend

- The app sends `latitude`, `longitude` and `accuracy` to `POST /api/locations` with the login token (added automatically by `frontend/services/api.js`).
- Tracking runs every 30 seconds while the Map screen is open and skips sending when the phone has moved less than 10 metres.
- Locations that cannot be sent are saved on the phone (up to 500) and uploaded, oldest first, when the server can be reached again.
- Known limit: the backend stores its own time for each record, so locations uploaded after being offline show the upload time, not the time they were read.

## How to test your setup

Run each check from the `backend` folder.

1. Environment variables are found (prints `set` or `MISSING`, never the value):

```bash
node -e "require('dotenv').config(); ['TWILIO_ACCOUNT_SID','TWILIO_AUTH_TOKEN','TWILIO_PHONE_NUMBER','FIREBASE_SERVICE_ACCOUNT'].forEach(k => console.log(k, process.env[k] ? 'set' : 'MISSING'))"
```

2. Firebase accepts your credentials: send to a fake token and expect the invalid-token error described above.
3. Twilio accepts your credentials: send a trial template to your own verified number.

Delete any test script that contains a phone number before committing.