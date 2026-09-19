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