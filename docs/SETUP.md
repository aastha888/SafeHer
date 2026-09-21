# Setup Guide

How to run SafeHer on your own machine.

## Prerequisites

- Node.js 18 or higher (`node --version`)
- npm (`npm --version`)
- Git (`git --version`)
- A code editor such as VS Code
- The Expo Go app on your phone (for the mobile app)

## 1. Clone the repository

```bash
git clone https://github.com/aastha888/SafeHer.git
cd SafeHer
git checkout develop
```

Create your own feature branch from `develop` before you start work. See [CONTRIBUTING.md](../CONTRIBUTING.md).

## 2. Backend setup

```bash
cd backend
npm install
```

Create your local environment file:

```bash
copy .env.example .env      # Windows (PowerShell / CMD)
cp .env.example .env        # macOS / Linux
```

Open `.env` and replace each placeholder with a real value.

### Environment variables

| Variable | What it is | Where to get it |
|----------|-----------|-----------------|
| `NODE_ENV` | `development` or `production` | Leave as `development` locally |
| `PORT` | Port the API listens on | Default `5000` |
| `MONGODB_URI` | MongoDB connection string | Ask Developer A (never commit it) |
| `JWT_SECRET` | Secret used to sign login tokens | Any long random string |
| `FIREBASE_SERVICE_ACCOUNT` | Path to the Firebase key file | See [INTEGRATIONS.md](INTEGRATIONS.md) |
| `TWILIO_ACCOUNT_SID` | Twilio account identifier | Twilio Console home page |
| `TWILIO_AUTH_TOKEN` | Twilio secret token | Twilio Console home page |
| `TWILIO_PHONE_NUMBER` | Twilio number SMS is sent from | Twilio Console |
| `GOOGLE_MAPS_API_KEY` | Google Maps key (from Week 2) | Google Cloud Console |
| `FRONTEND_URL` | Address of the mobile app dev server | Default `http://localhost:8081` |

`backend/config/env.js` checks that the required variables exist and stops the server with a clear message if any are missing.

### Run the backend

```bash
npm run dev
```

You should see `Server running on port 5000`.

## 3. Mobile app setup

```bash
cd frontend
npm install
npm start
```

Scan the QR code with the Expo Go app on your phone. Your phone and computer must be on the same Wi-Fi network.

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `Missing required environment variables` | Copy `.env.example` to `.env` and fill in every value |
| `Cannot find module` | Run `npm install` in the folder you are working in |
| Firebase error about the key file | Check `FIREBASE_SERVICE_ACCOUNT` points to your `firebase-key.json` |
| Port already in use | Change `PORT` in `.env` or stop the other process |
| App cannot reach the backend | Use your computer's IP address, not `localhost`, when testing on a phone |
| MongoDB connection fails | Check the connection string and that your IP is allowed in MongoDB Atlas |

## Location Services

SafeHer reads the phone's GPS position, shows it on the Map screen, and sends it to the backend every 30 seconds while the Map screen is open.

### What you need

- A **real phone**. GPS does not work properly in an emulator or simulator.
- **Expo Go** installed on the phone.
- The phone and your computer on the **same Wi-Fi**, with the backend running (see the backend setup above).
- A logged-in account, because every location request needs a login token.

### Turn on GPS

**Android:** pull down the quick settings from the top of the screen and turn on **Location**. For best accuracy, use **Settings > Location > Google Location Accuracy** and switch on **Improve Location Accuracy**.

**iPhone:** open **Settings > Privacy & Security > Location Services** and turn it on.

### Allow the app to use your location

The first time the Map screen opens, the phone asks whether to allow location access.

- **Android:** choose **While using the app**, and **Precise** if it asks about precise or approximate location.
- **iPhone:** choose **Allow While Using App**.

If you tapped **Deny** by mistake, open the phone's **Settings > Apps > Expo Go > Permissions > Location** (Android) or **Settings > Expo Go > Location** (iPhone) and allow it.

### Android and iPhone differences

| | Android | iPhone |
|---|---|---|
| Permission text | Declared in `app.json` (`ACCESS_COARSE_LOCATION`, `ACCESS_FINE_LOCATION`) | Set through the `expo-location` plugin in `app.json`. An `ios.infoPlist` entry is still to be added before an iPhone build |
| Permission popup | Offers Precise or Approximate | Offers Allow While Using App |
| Testing | Tested on an Android phone | Not yet tested on an iPhone |

### How location tracking works

- Opening the **Map** screen reads the phone's position and shows the coordinates, accuracy and time.
- While the screen stays open, the app checks the position every 30 seconds and sends it to the backend (`POST /api/locations`).
- If the phone has moved less than 10 metres since the last send, the check is skipped and the status line shows how far it moved.
- Leaving the screen stops the tracking. Tracking does not continue in the background yet.
- If a send fails (for example no internet), the location is saved on the phone. The saved locations are uploaded, oldest first, on the next check that can reach the server.

### Testing location with the backend on your computer

1. Start the backend: `cd backend`, then `npm run dev`.
2. Find your computer's address with `ipconfig` (look for **IPv4 Address** under Wi-Fi).
3. Set `API_BASE_URL` in `frontend/constants/config.js` to `http://<your-address>:5000/api`. Do not commit this change.
4. Open `http://<your-address>:5000/` in the phone's browser. It should show `{"message":"SafeHer backend is running"}`.
5. Start the app with `npx expo start`, log in, and open the Map screen.

### Location troubleshooting

| Problem | Fix |
|---------|-----|
| Permission popup never appears, or "Location permission was denied" | Allow location for Expo Go in the phone's settings, then tap **Try Again** |
| "Location is turned off" | Turn on GPS in the phone's quick settings |
| Coordinates are far off or accuracy is over 50 m | Go near a window or outside and wait a few seconds. Accuracy is often 15 to 80 m indoors |
| Map area is blank on Android | The Google Maps tiles need an API key. The Map screen shows coordinates and an **Open in Google Maps** button instead |
| Status says "Not sent: Cannot reach the server" | Check the phone and computer are on the same Wi-Fi, the backend is running, and `API_BASE_URL` has your current address |
| Status says "No movement (moved X m, needs 10 m)" | Normal while standing still. Move more than 10 m and wait for the next check |
| Status says "Offline: saved N location(s)" | The server could not be reached. The locations upload automatically once it can |
| Uploaded offline locations show the upload time | The backend stores its own time for each record. This is a known limit |
| Location stops updating | Tracking only runs while the Map screen is open. Keep the screen on and do not press Back |