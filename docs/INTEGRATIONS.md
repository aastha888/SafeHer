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

### Push to users (`PushService`)

Code: `backend/services/PushService.js`

The push service sends to SafeHer users, not to raw tokens. It looks up the phones a user registered, sends through `sendPushNotification`, writes one row per attempt in the notification log, and deletes tokens that Firebase says are dead. It never throws, so a push problem cannot block an alert.

```javascript
const { sendPushToUser, notifyContactsByPhone } = require('./services/PushService');

// One user (all their registered phones)
await sendPushToUser(userId, { title: 'Title', body: 'Text', data: { key: 'value' } }, { type: 'sos', sentBy: senderId });
// { devices: 1, sent: 1, failed: 0, removed: 0 }

// Several people by phone number, for example the contacts of an SOS alert
await notifyContactsByPhone(['+919876543210'], { title: 'Title', body: 'Text' }, { type: 'sos', sentBy: senderId });
// { users: 1, devices: 1, sent: 1, failed: 0, removed: 0 }
```

- `data` values are converted to text, because Firebase only accepts text values.
- `type` is `sos`, `test` or `other`.
- Phone numbers are matched by their **last 10 digits**, so `+91 98203 75667`, `09820375667` and `9820375667` all match the same user.
- A token is deleted only when Firebase says it can never work again: `registration-token-not-registered`, `invalid-registration-token`, or `invalid-argument` with a message about the registration token. Other errors keep the token.
- The SOS flow (`SOSNotificationService.js`) calls `notifyContactsByPhone` next to the SMS, without waiting for it, so push still goes out if SMS fails.

### Registering devices and the notification log

- The app registers its token with `POST /api/devices` (see `backend/docs/API.md`). Tokens are stored in the `DeviceToken` collection, one record per token.
- Every push attempt is stored in the `NotificationLog` collection with the channel, type, status, error and Firebase's message ID. The recipient token is masked (for example `abcd...wxyz`), the message text is not stored, and entries are deleted after 90 days.

### Testing push without a phone

- Sending to a fake token returns `success: false` and the code `messaging/invalid-argument`. That proves the key works.
- With a fake token registered for your own account, trigger an SOS to a contact whose phone is yours. The push is tried, Firebase refuses the token, the token is removed and a `failed` row appears in `NotificationLog`.

### Known limit: Expo Go

From Expo SDK 53, Expo Go on Android cannot receive remote push notifications. Real delivery to a phone needs a **development build**, plus the `google-services.json` of the Firebase project. Until then, only the backend side (above) can be tested.

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

### Test mode (no Twilio needed)

Set `SMS_MODE=log` in `backend/.env`, or only in the PowerShell window you start the backend from (`$env:SMS_MODE='log'`). `sendSMS` then prints the message in the console, with the phone number masked (`+91******5667`), and returns `{ success: true, messageSid: 'test-mode', error: null }`. The number format and message length checks still run, so validation errors still show. The server refuses to start with `SMS_MODE=log` when `NODE_ENV=production`.

### Trial account limits

- SMS can only be sent to numbers verified in the Twilio Console.
- **Trial accounts can only send predefined templates.** Sending custom text through the API fails with `Invalid template name. Trial accounts can only use predefined SMS templates.` A trial call must use a template name, for example `sms_appointment_reminders`.
- Custom emergency messages (such as the `emergencySOS` template) need a paid Twilio account or a different SMS provider.
- Confirmed by a real test: an SOS trigger created the alert, the SMS was rejected with the error above, and the error was saved on the alert's notification entry. Nothing was delivered.
- The trial lasts 30 days and includes about 100 free messages.
- Verified recipients: in our account the Verified Caller IDs page redirected to an upgrade page. Numbers were added from **Try out SMS**: open the **To** dropdown and choose **Add a verified tester**.
- **Decision:** the SMS code stays as it is. Demos use `SMS_MODE=log` and push notifications. A live SMS needs a paid Twilio account or another provider, which the team decides together.

## Maps and location

Code: `frontend/services/LocationService.js`, `frontend/services/BackendLocationService.js`, `frontend/services/TrackingService.js`, `frontend/services/LocationQueue.js`, `frontend/screens/MapScreen.js`, `frontend/components/LocationMap.js`

### Location permissions

- **Android:** `ACCESS_COARSE_LOCATION` and `ACCESS_FINE_LOCATION` are declared in `frontend/app.json` under `android.permissions`.
- **iPhone:** the `expo-location` plugin in `app.json` sets the permission message. An `ios.infoPlist` entry (`NSLocationWhenInUseUsageDescription`) still has to be added before an iPhone build.
- The app only asks for location **while it is in use**. Background tracking is not enabled.
- Test on a real device. GPS does not work properly in an emulator or simulator.

### GPS (no key needed)

`expo-location` reads the phone's GPS and needs no API key. It works in Expo Go on an Android phone.

### Map display

- `LocationMap.js` shows a map inside a `WebView` (package `react-native-webview`) using **Leaflet** with **OpenStreetMap** tiles. It draws a pin, an accuracy circle and a **Center** button, and moves the pin when a new position arrives.
- It needs **no API key and no billing**, and works in Expo Go. `MapScreen.js` shows this map above the sync status and the **Refresh**, **Google Maps** and **Back** buttons.
- Why not a Google map: with `react-native-maps` in Expo Go on Android, the map area stayed black on the test phone (the Google logo appeared but there were no tiles and no pin), even when OpenStreetMap tiles were drawn on top. A Google map would need a Google Cloud API key (billing enabled) and a custom development build.
- The map needs an internet connection, because Leaflet and the tiles are loaded from the web. Without it the map area stays empty.
- OpenStreetMap's public tile server is meant for light use. The credit "© OpenStreetMap contributors" is shown on the map and must stay. For heavy use or final deployment, switch to a tile provider that allows it.
- There is no satellite view.
- `react-native-maps` is still listed in `package.json` but is no longer used. It can be removed later.
- Possible later upgrade: Google Maps through a development build. That needs the API key in `app.json` under `android.config.googleMaps.apiKey`, restricted in Google Cloud to the Android app and the Maps SDK only.

### Sending location to the backend

- The app sends `latitude`, `longitude`, `accuracy` and `timestamp` (the time the phone read the position) to `POST /api/locations` with the login token (added automatically by `frontend/services/api.js`).
- Tracking runs every 30 seconds while the Map screen is open and skips sending when the phone has moved less than 10 metres.
- Locations that cannot be sent are saved on the phone (up to 500) and uploaded, oldest first, when the server can be reached again.
- The app sends `latitude`, `longitude`, `accuracy` and `timestamp` (the time the phone read the position) to `POST /api/locations` with the login token (added automatically by `frontend/services/api.js`).

## How to test your setup

Run each check from the `backend` folder.

1. Environment variables are found (prints `set` or `MISSING`, never the value):

```bash
node -e "require('dotenv').config(); ['TWILIO_ACCOUNT_SID','TWILIO_AUTH_TOKEN','TWILIO_PHONE_NUMBER','FIREBASE_SERVICE_ACCOUNT'].forEach(k => console.log(k, process.env[k] ? 'set' : 'MISSING'))"
```

2. Firebase accepts your credentials: send to a fake token and expect the invalid-token error described above.
3. Twilio accepts your credentials: send a trial template to your own verified number.

Delete any test script that contains a phone number before committing.