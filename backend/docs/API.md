# SafeHer Backend API Documentation

Base URL (local development): `http://localhost:5000/api`

---

## Authentication

### Register a new user

**POST** `/auth/register`

**Description:** Creates a new user account and returns a JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "phone": "1234567890",
  "full_name": "Jane Doe"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": "6aae65cb88a0f4e4fb256143",
    "email": "user@example.com",
    "phone": "1234567890",
    "full_name": "Jane Doe",
    "role": "user",
    "profile_photo_url": "",
    "created_at": "2026-09-19T10:36:59.053Z"
  }
}
```

**Error Responses:**
| Status | Condition |
|--------|-----------|
| 400 | Missing required fields, invalid email format, or password < 8 characters |
| 409 | Email already registered |
| 500 | Server error |

**Example cURL:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123","phone":"1234567890","full_name":"Jane Doe"}'
```

---

### Login

**POST** `/auth/login`

**Description:** Authenticates an existing user and returns a JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Success Response (200):** Same shape as register response.

**Error Responses:**
| Status | Condition |
|--------|-----------|
| 400 | Missing email or password |
| 401 | Invalid email or password |
| 500 | Server error |

**Example cURL:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

---

## Authentication Middleware

Protected routes require this header:
```
Authorization: Bearer <token>
```

If missing/invalid, returns:
```json
{ "success": false, "message": "No token provided. Authorization denied." }
```
or
```json
{ "success": false, "message": "Invalid or expired token." }
```

---

## User Profile

All routes below require the header:
```
Authorization: Bearer <token>
```

### Get profile

**GET** `/users/profile`

**Success Response (200):**
```json
{
  "success": true,
  "user": {
    "id": "6aafb3c4...",
    "email": "user@example.com",
    "phone": "1234567890",
    "full_name": "Jane Doe",
    "role": "user",
    "profile_photo_url": "",
    "created_at": "2026-09-19T10:36:59.053Z"
  }
}
```

**Error Responses:**
| Status | Condition |
|--------|-----------|
| 401 | Missing/invalid token |
| 404 | User not found |
| 500 | Server error |

---

### Update profile

**PUT** `/users/profile`

**Description:** Updates `full_name`, `phone`, `profile_photo_url`, and/or `dob`. Email cannot be changed via this endpoint.

**Request Body (any subset of these fields):**
```json
{
  "full_name": "New Name",
  "phone": "9998887777",
  "profile_photo_url": "https://...",
  "dob": "1998-05-10"
}
```

**Success Response (200):** Same shape as GET profile, with updated fields.

**Error Responses:**
| Status | Condition |
|--------|-----------|
| 401 | Missing/invalid token |
| 404 | User not found |
| 500 | Server error |

---

### Delete account

**DELETE** `/users/account`

**Description:** Permanently deletes the user account and all their emergency contacts.

**Success Response (200):**
```json
{ "success": true, "message": "Account and all related data deleted successfully" }
```

---

## Emergency Contacts

All routes below require `Authorization: Bearer <token>`.

### List contacts

**GET** `/contacts`

**Success Response (200):**
```json
{
  "success": true,
  "contacts": [
    {
      "_id": "6aafb3e2...",
      "user_id": "6aafb3c4...",
      "name": "Mom",
      "phone": "9876543210",
      "relationship": "Mother",
      "is_primary": true,
      "created_at": "2026-09-20T10:22:26.377Z",
      "updated_at": "2026-09-20T10:22:26.377Z"
    }
  ]
}
```

---

### Add contact

**POST** `/contacts`

**Request Body:**
```json
{
  "name": "Mom",
  "phone": "9876543210",
  "relationship": "Mother",
  "is_primary": true
}
```
`relationship` and `is_primary` are optional. Setting `is_primary: true` automatically un-marks any previous primary contact.

**Success Response (201):** Returns the created `contact` object.

**Error Responses:**
| Status | Condition |
|--------|-----------|
| 400 | Missing name or phone |
| 401 | Missing/invalid token |
| 500 | Server error |

---

### Update contact

**PUT** `/contacts/:id`

**Request Body (any subset):**
```json
{
  "name": "Mom Updated",
  "phone": "9876543210",
  "relationship": "Mother",
  "is_primary": true
}
```

**Success Response (200):** Returns the updated `contact` object.

**Error Responses:**
| Status | Condition |
|--------|-----------|
| 404 | Contact not found (or doesn't belong to this user) |
| 500 | Server error |

---

### Delete contact

**DELETE** `/contacts/:id`

**Success Response (200):**
```json
{ "success": true, "message": "Contact deleted successfully" }
```

**Error Responses:**
| Status | Condition |
|--------|-----------|
| 404 | Contact not found (or doesn't belong to this user) |
| 500 | Server error |

---

## Location Tracking

All routes below require `Authorization: Bearer <token>`. Location data is automatically deleted 30 days after it's recorded.

### Save current location

**POST** `/locations`

**Request Body:**
```json
{
    "latitude": 19.0760,
  "longitude": 72.8777,
  "accuracy": 10,
  "timestamp": 1760000000000
}
```
`accuracy` (meters) is optional. `timestamp` is optional too: the time the position was read, as milliseconds since 1970 or an ISO date string. It lets a phone that was offline upload old positions with their real time. If it is missing, invalid, or more than 5 minutes in the future, the server uses its own current time.

**Success Response (201):** Returns the created `location` object.

**Error Responses:**
| Status | Condition |
|--------|-----------|
| 400 | Missing latitude or longitude |
| 500 | Server error |

---

### Get latest location

**GET** `/locations/latest`

**Success Response (200):** Returns the most recent `location` object.

**Error Responses:**
| Status | Condition |
|--------|-----------|
| 404 | No location data found for this user |
| 500 | Server error |

---

### Get location history

**GET** `/locations/history?hours=24&page=1`

**Query params:**
| Param | Default | Description |
|-------|---------|--------------|
| `hours` | 24 | How far back to look |
| `page` | 1 | Page number (20 results per page) |

**Success Response (200):**
```json
{
  "success": true,
  "locations": [ /* array of location objects, newest first */ ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 3,
    "totalPages": 1
  }
}
```

---

## SOS Emergency

All SOS endpoints require `Authorization: Bearer <token>`.

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/sos/trigger` | Create an SOS alert and notify emergency contacts |
| POST | `/sos/:id/location` | Add a live location point to an active alert |
| POST | `/sos/:id/cancel` | Cancel an active alert (accidental trigger) |
| POST | `/sos/:id/resolve` | Close an active alert as `resolved` or `false_alarm` |
| GET | `/sos/active` | Get the current active alert (or `null`) |
| GET | `/sos/history` | List past alerts, newest first (paginated) |
| GET | `/sos/:id` | Get one alert with its location trail and SMS results |

**Alert statuses:** `active`, `cancelled`, `resolved`, `false_alarm`.
A user can have only **one active alert** at a time.

### Trigger an SOS

**POST** `/sos/trigger`

**Request Body:**
```json
{
  "latitude": 28.6139,
  "longitude": 77.2090,
  "accuracy": 12,
  "trigger_type": "button",
  "message": "Followed by a stranger"
}
```
`latitude` and `longitude` are required. `accuracy`, `trigger_type` (`button`, `voice`, `shake`, `auto`; default `button`) and `message` (max 300 characters) are optional.

**Success Response (201):**
```json
{
  "success": true,
  "already_active": false,
  "message": "SOS alert created",
  "contacts_to_notify": 1,
  "alert": {
    "_id": "6ac88edade58f8f1134045c8",
    "status": "active",
    "trigger_type": "button",
    "location": { "latitude": 28.6139, "longitude": 77.209 },
    "notifications": [
      { "contact_id": "...", "name": "Me", "phone": "9876543210", "channel": "sms", "status": "pending" }
    ],
    "triggered_at": "2026-10-09T06:18:12.033Z"
  }
}
```

**If an alert is already active (200):** returns the existing alert with `"already_active": true`. No new alert and no new SMS are created.

SMS messages are sent in the background. The response shows each notification as `pending`; read `GET /sos/:id` afterwards to see `sent` or `failed` for each contact. If the user has no contacts, the alert is still created and `contacts_to_notify` is `0`.

**Errors:**

| Code | Meaning |
|------|---------|
| 400 | Missing or out-of-range coordinates, or invalid `trigger_type` |
| 401 | Missing or invalid token |
| 500 | Server error |

### Add a location update

**POST** `/sos/:id/location`

**Request Body:** `{ "latitude": 28.6150, "longitude": 77.2100, "accuracy": 8 }`

**Success Response (200):**
```json
{ "success": true, "trail_points": 2, "latest": { "latitude": 28.615, "longitude": 77.21, "accuracy": 8, "recorded_at": "..." } }
```
The trail keeps the latest 500 points per alert.

**Errors:** `400` invalid coordinates, `404` alert not found (or not yours), `409` alert is no longer active.

### Cancel an alert

**POST** `/sos/:id/cancel` (no body)

**Success Response (200):** `{ "success": true, "message": "SOS alert cancelled", "alert": { "status": "cancelled", "cancelled_at": "..." } }`

**Errors:** `404` alert not found (or not yours), `409` alert is no longer active.

### Resolve an alert

**POST** `/sos/:id/resolve`

**Request Body:** `{ "outcome": "false_alarm" }` where `outcome` is `resolved` (default) or `false_alarm`.

**Success Response (200):** `{ "success": true, "message": "SOS alert marked as false_alarm", "alert": { "status": "false_alarm", "resolved_at": "..." } }`

**Errors:** `400` invalid outcome, `404` alert not found (or not yours), `409` alert is no longer active.

### Get the active alert

**GET** `/sos/active`

**Success Response (200):** `{ "success": true, "alert": { ... } }`, or `"alert": null` when there is no active alert.

### SOS history

**GET** `/sos/history?page=1&limit=10&status=resolved`

All query parameters are optional. `limit` is at most 50. The location trail is left out of list results (use `GET /sos/:id`).

**Success Response (200):**
```json
{
  "success": true,
  "alerts": [ { "_id": "...", "status": "cancelled", "triggered_at": "..." } ],
  "pagination": { "page": 1, "limit": 10, "total": 3, "totalPages": 1 }
}
```

**Errors:** `400` invalid `status` filter.

### Get one alert

**GET** `/sos/:id`

**Success Response (200):** `{ "success": true, "alert": { ...full alert including location_trail and notifications } }`

**Errors:** `404` alert not found (or not yours).

### Example (cURL)

```bash
curl -X POST http://localhost:5000/api/sos/trigger \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"latitude":28.6139,"longitude":77.2090}'
```