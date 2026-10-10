# Database Documentation

Maintained by Developer A. Database: MongoDB (Atlas), accessed with Mongoose. Models live in `backend/models/`.

## Collections overview

| Collection | Model file | Purpose |
|------------|-----------|---------|
| `users` | `User.js` | Accounts and login details |
| `emergencycontacts` | `EmergencyContact.js` | People notified during an SOS |
| `locations` | `Location.js` | GPS history (auto-deleted after 30 days) |
| `sosalerts` | `SOSAlert.js` | SOS alerts with location trail and SMS results |

## Relationships

```
users 1 ──< emergencycontacts   (user_id)
users 1 ──< locations           (user_id)
users 1 ──< sosalerts           (user_id)
emergencycontacts 1 ──< sosalerts.notifications[]   (contact_id, copied as a snapshot)
```

## users

| Field | Type | Notes |
|-------|------|-------|
| email | String | required, unique, lowercase |
| phone | String | required, indexed |
| password_hash | String | required, bcrypt hash (never returned by the API) |
| full_name | String | required |
| dob | Date | optional |
| role | String | `user` or `admin`, default `user` |
| profile_photo_url | String | optional |
| created_at, updated_at | Date | automatic timestamps |

## emergencycontacts

| Field | Type | Notes |
|-------|------|-------|
| user_id | ObjectId (ref User) | required |
| name | String | required |
| phone | String | required, 8 to 15 digits with optional leading `+` (spaces and dashes are removed on save) |
| relationship | String | optional |
| is_primary | Boolean | default false; only one primary per user |
| created_at, updated_at | Date | automatic timestamps |

**Rules:** at most 5 contacts per user (checked in the controller). **Indexes:** unique `{ user_id, phone }` (no duplicate numbers per user).

## locations

| Field | Type | Notes |
|-------|------|-------|
| user_id | ObjectId (ref User) | required, indexed |
| latitude | Number | required |
| longitude | Number | required |
| accuracy | Number | meters, optional |
| timestamp | Date | when the phone read the location (defaults to now) |

**Indexes:** `user_id`; TTL index on `timestamp` (documents are deleted automatically 30 days after their timestamp).

## sosalerts

| Field | Type | Notes |
|-------|------|-------|
| user_id | ObjectId (ref User) | required, indexed |
| status | String | `active`, `cancelled`, `resolved`, `false_alarm`; default `active` |
| trigger_type | String | `button`, `voice`, `shake`, `auto`; default `button` |
| location | Object | `latitude` (-90 to 90), `longitude` (-180 to 180), `accuracy`; position when triggered |
| location_trail | Array | live points: `latitude`, `longitude`, `accuracy`, `recorded_at` (latest 500 kept) |
| message | String | optional note, max 300 characters |
| notifications | Array | one entry per contact (see below) |
| triggered_at | Date | default now |
| cancelled_at, resolved_at | Date | set when the alert is closed |
| created_at, updated_at | Date | automatic timestamps |

**notifications[] entry:** `contact_id`, `name`, `phone` (a snapshot taken when the alert was created), `channel` (`sms` or `push`), `status` (`pending`, `sent`, `failed`), `provider_id` (SMS provider message id), `error`, `sent_at`.

**Indexes:**
- `{ user_id, triggered_at: -1 }` for history queries
- Unique partial index on `user_id` where `status = "active"`, so the database itself guarantees **one active alert per user**