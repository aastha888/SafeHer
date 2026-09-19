# SafeHer

SafeHer is a women's safety mobile application built as a college major project. It provides real-time location sharing, emergency SOS alerts to guardians, community safety reports, and offline-friendly emergency features.

## Team

| Role | Responsibility |
|------|----------------|
| Developer A | Backend and database (Node.js, Express, MongoDB) |
| Developer B | Mobile app and UI (React Native, Expo) |
| Developer C | Integrations and DevOps (Firebase, Twilio, maps, documentation) |

## Tech Stack

- **Mobile app:** React Native with Expo
- **Backend:** Node.js, Express, MongoDB with Mongoose, JWT authentication
- **Push notifications:** Firebase Cloud Messaging
- **SMS:** Twilio
- **Maps and location:** Google Maps, device GPS

## Project Structure

```
SafeHer/
├── backend/      Node.js API server
├── frontend/     React Native (Expo) mobile app
├── docs/         Project documentation
└── CONTRIBUTING.md
```

## Getting Started

1. Read [docs/SETUP.md](docs/SETUP.md) to run the project locally.
2. Read [docs/INTEGRATIONS.md](docs/INTEGRATIONS.md) to set up Firebase and Twilio.
3. Read [CONTRIBUTING.md](CONTRIBUTING.md) before making your first commit.

## Documentation

- [Setup guide](docs/SETUP.md)
- [Integrations guide](docs/INTEGRATIONS.md)
- [API reference](backend/docs/API.md)
- [Contributing guide](CONTRIBUTING.md)

## Security

Never commit `.env` files, Firebase key files, or any credentials. Use `backend/.env.example` as the template for your own `.env`.