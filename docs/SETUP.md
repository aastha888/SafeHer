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