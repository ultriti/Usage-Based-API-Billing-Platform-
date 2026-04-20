# ---> User API Reference
---

### API Provider — Router & Controller (implemented changes)

Source code: [backend/router/apiProvider.route.js](backend/router/apiProvider.route.js) and [backend/controller/apiProvider.controller.js](backend/controller/apiProvider.controller.js)

#### Router (as implemented)
- Mounted prefix: `/api/apiGen` (router exported at [backend/router/apiProvider.route.js](backend/router/apiProvider.route.js))
- Routes (implemented mapping):
  - `POST /createApi` — middleware: `isProviderAuthenticate` — handler: `createApi`
  - `POST /getProviderInfo` — middleware: `isProviderAuthenticate` — handler: `getProviderStats`
  - `POST /getApi` — middleware: `isAunthenticate` — handler: `createApi`  (NOTE: router maps `/getApi` to `createApi` in code — likely bug; see "Router inconsistencies" below)
  - `GET /setApi/:consumerId` — middleware: `isAunthenticate` — handler: `setApiKey`
  - `POST /partialPayApi/:consumerId` — middleware: `isAunthenticate` — handler: `apiPartialPayment`
  - `POST /apiRequest/:endpoint` — middleware: `isAunthenticate` — handler: `requestApiRoute`

#### POST /api/apiGen/getProviderInfo
- Purpose: return provider usage status & latency metrics from InfluxDB (controller: `getProviderStats`).
- Availability: Protected — `isProviderAuthenticate`.
- Method: `POST`
- Request: none
- Success Response (200):

```json
{
  "resultsStatus": [
    { "time": "2026-04-20T15:00:00Z", "status": 200 },
    { "time": "2026-04-20T15:05:00Z", "status": 500 }
  ],
  "resultsLatency": [
    { "time": "2026-04-20T15:00:00Z", "latency": 120.4 },
    { "time": "2026-04-20T15:05:00Z", "latency": 350.2 }
  ]
}
```
- Notes:
  - Controller queries InfluxDB using:

```flux
from(bucket: "api_logs")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "api_usage")
```
  - Requires env `INFLUXDB_TOKEN`. Response format is `resultsStatus` and `resultsLatency` arrays.

#### POST /api/apiGen/partialPayApi/:consumerId
- Purpose: consumer pays a pending partial payment (controller: `apiPartialPayment`).
- Availability: Protected — `isAunthenticate`.
- HTTP Method: `POST`
- Request Body:

```json
{ "apiId": "645c3f4c5d6e7f8g9h0i1j2k" }
```
- Success Response (201):

```json
{ "message": "payment done sucessfully", "success": true }
```
- Behavior:
  - Finds consumer `userDetail` by `req.id` and `api` by `apiId`.
  - If `userApi.partialPayment` already true, returns 400.
  - If `userApi.usage % 100 === 99` it applies `api.billing.amount += userApi.apiBill`, sets `userApi.partialPayment = true`, zeroes `userApi.apiBill`, saves.

#### GET /api/apiGen/setApi/:consumerId — (setApiKey) implementation notes
- Purpose: Generate one-time credentials for a consumer to access an API (controller: `setApiKey`).
- Availability: Protected — `isAunthenticate`.
- Method: `GET` (note: modifies state — consider POST)
- Request: path param `consumerId` (must match `req.id`) and body:

```json
{ "providerApiId": "645c3f4c5d6e7f8g9h0i1j2k" }
```
- Generated credentials:
  - `apiKey`: 25-character secure string
  - `apiPassword`: 12-character secure string
- Storage behavior (current implementation):
  - `api.apiKeys.push({ consumerId, key: apiKey, apiPassword: <hashedPassword>, status: 'active' })`
  - `userDetail.api.push({ apiId, url, purchased: false, keyCode: apiKey, keyPassword: apiPassword })` — note: this currently stores raw key/password in the user record.
- Success Response (201):

```json
{
  "message": "API purchased successfully",
  "success": true,
  "apiKey": "ABCD1234EFGH5678IJKL9012MN",
  "apiPassword": "XyZ123!@#"
}
```
- Security notes:
  - `apiPassword` is hashed before storage (bcrypt via `apiModel.prototype.hashKeys`).
  - `apiKey` is currently stored in plaintext on the API document for lookup — consider hashing or encrypting at rest.
  - Do not persist raw `apiPassword`/`apiKey` on user records; return them once and store only hashes.

#### POST /api/apiGen/apiRequest/:endpoint — implementation details (controller: `requestApiRoute`)
- Authentication:
  - Headers required: `api_provide_key` and `api_provide_password`.
  - Lookup: `apiModel.findOne({ "apiKeys.key": apiKey, "apiKeys.status": "active" })`
  - Password check: `bcrypt.compare(apiPassword, keyObj.apiPassword)`
- Proxy behavior:
  - Constructs `providerUrl = api.baseUrl + endpoint`.
  - Forwards request to provider via `axios.get(providerUrl, { params: req.query })` (current implementation forwards only query params).
  - Captures latency: `Date.now() - startTime`.
- Metrics (InfluxDB):
  - Writes `api_usage` point with tags `apiId`, `endpoint` and fields `status_code`, `latency_ms`.
  - Bucket: `api_logs`, org: `MeterFlow`.
- Usage & Billing (summary of implemented logic):
  - `userApi.usage` increments per request.
  - Free tier: first 500 requests per consumer per API are considered free.
  - After 500 requests, consumers who have not purchased (`userApi.purchased === false`) are billed per-request (implementation uses complex partial-payment rules).
  - `userApi.partialPayment` flags are used to track periodic partial payments (controller sets `partialPayment` to true when `usage % 100 === 99` and requires `/partialPayApi` to settle).
  - `api.billing.totalRequests` is incremented for charged requests and `userApi.apiBill` accumulates monetary charge (controller uses increments of `0.2`).
- Implementation caveats & recommendations:
  - The current billing logic is complex and hard to reason about; recommend simplifying to:
    - Track `totalRequests` per consumer and compute charges by formula on invoice generation.
    - Use a single `usageLogs` array of objects (timestamp, status, latency) instead of parallel arrays.
    - Use atomic updates (`$inc`) to avoid race conditions under concurrency.

#### Key generation & storage (utility & security)
- Utility: `generateSecureCode(length)` creates secure random strings using `crypto.randomInt` and a wide `charset`. Used to create API keys and API passwords.
- Recommendations:
  - Return credentials to the consumer only once (one-time display) and store only hashes in the DB.
  - Consider using `crypto.randomBytes` + base64/url-safe encoding for keys.
  - Store API keys in a separate `api_keys` collection if you need to rotate or revoke keys without modifying API documents.

#### InfluxDB integration (write & query)
- Write (controller uses):
```javascript
const point = new Point('api_usage')
  .tag('apiId', api._id.toString())
  .tag('endpoint', providerUrl)
  .intField('status_code', res.statusCode)
  .floatField('latency_ms', Number(latency))
  .timestamp(new Date(startTime))

writeClient.writePoint(point)
writeClient.flush().catch(err => { console.error('Influx flush error', err) })
```
- Read (getProviderStats query):
```flux
from(bucket: "api_logs")
  |> range(start: -1h)
  |> filter(fn: (r) => r._measurement == "api_usage")
```
- Env: `INFLUXDB_TOKEN` must be set for the client to authenticate.

#### Router inconsistencies (observed in files) — recommended fixes
- `router.post('/getApi', isAunthenticate, createApi)` — in code `/getApi` is mapped to `createApi`. This is likely a bug; `/getApi` should be mapped to a read/list handler.
- `GET /setApi/:consumerId` modifies state (creates credentials) — consider changing to `POST`.
- `POST /getProviderInfo` returns metrics — consider using `GET` and allow optional query params (time range).
- Avoid storing raw `apiKey`/`apiPassword` on user documents — return once and store hashes.
- Standardize status codes (many endpoints return `201` where `200` or `204` is appropriate).

#### Model fields & helper methods relevant to these endpoints
- `api.model.js` changes used by controller:
  - `providerId` (ObjectId) — owner of API
  - `apiKeys` entries — `{ consumerId, key, apiPassword (hashed), status }`
  - helper methods: `hashKeys()`, `compareKeys()` (bcrypt wrappers)
  - `usageLogs` currently uses arrays for status/latency/timestamp; recommend changing to `[{ status, latency, timestamp }]`
- `user.model.js` (consumer-side):
  - `api` subdocument now tracks `{ apiId, url, purchased, keyCode?, keyPassword?, usage, apiBill, partialPayment }` — controller currently pushes `keyCode` and `keyPassword` raw values (insecure).
- `provider.model.js` remains the provider profile; `getProviderStats` reads InfluxDB rather than provider DB for real-time metrics.

---

## Model Schemas
Source code: [backend/router/user.router.js](backend/router/user.router.js) and [backend/controller/user.controller.js](backend/controller/user.controller.js)

## Authentication

- The app issues a JWT in an HTTP-only cookie named `apiProviderToken` on successful register/login. Cookie properties set in code: `httpOnly: true`, `sameSite: 'none'`, `secure: true`, expires ~30 days.
- Protected endpoints use the `isAunthenticate` middleware. The middleware is expected to validate the cookie/JWT and populate `req.id` with the authenticated user's id.

Note: the current implementation contains several insecure patterns (plaintext password comparisons, returning verification codes). See the Recommendations section for remediation steps.

---

## Conventions

- Requests: `Content-Type: application/json` for JSON bodies.
- Responses: success responses include `message` and `success: true`. Error responses include `message` and `success: false` and may include `error` for diagnostics.
- Use consistent HTTP status codes: `200` for OK, `201` for creation, `400` for bad request, `401/403` for auth issues, `404` for not found, `500` for server error.

---

## Routes (summary)

- POST `/userRegister` — register a new user (public)
- POST `/userLogin` — authenticate and set session cookie (public)
- GET  `/userLogout` — clear session cookie (public)
- GET  `/userDetail` — get authenticated user details (protected)
- PUT  `/userUpdate` — update authenticated user profile (protected)
- GET  `/codegen` — generate verification code (protected)
- GET  `/promoteUser/:userId` — (buggy) promote user to provider (protected)
- DELETE `/userDelete` — delete authenticated user after verification (protected)

Detailed descriptions follow.

---

### User Router — Router (as implemented)

Source code: [backend/router/user.route.js](backend/router/user.route.js)

- Mounted prefix: `/api/user` (router exported at [backend/router/user.route.js](backend/router/user.route.js))
- Routes (implemented mapping):
  - `POST /userRegister` — middleware: none — handler: `userRegister`
  - `POST /userLogin` — middleware: none — handler: `userLogin`
  - `GET /userLogout` — middleware: none — handler: `userLogout`
  - `DELETE /userDelete` — middleware: `isAunthenticate` — handler: `deleteUser`
  - `GET /promoteUser/:userId` — middleware: `isAunthenticate` — handler: `promoteUser`
  - `GET /userDetail` — middleware: `isAunthenticate` — handler: `getUserDetail`
  - `PUT /userUpdate` — middleware: `isAunthenticate` — handler: `updateUserDetail`
  - `GET /codegen` — middleware: `isAunthenticate` — handler: `codeGen`

### POST /api/user/userRegister

- **Purpose**: Create a new user account and set an HTTP-only authentication cookie.
- **Availability**: Public — no authentication required.
- **HTTP Method**: `POST`
- **Content-Type**: `application/json`

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `username` | string | Yes | Unique username for the account (2-50 characters) |
| `email` | string | Yes | Valid email address (must be unique) |
| `password` | string | Yes | Account password (min 8 characters, bcrypt hashed on server) |

#### Request Example

```json
{
  "username": "alice",
  "email": "alice@example.com",
  "password": "P@ssw0rd!"
}
```

#### Success Response

**Status Code**: `201 Created`

```json
{
  "message": "User registered successfully",
  "success": true,
  "user": {
    "_id": "645a1f2c3d5e6f7g8h9i0j1k",
    "username": "alice",
    "email": "alice@example.com",
    "role": "user",
    "membership": false,
    "profilePicture": {
      "url": "",
      "imageId": ""
    },
    "verificationCode": {
      "email": null,
      "phone": null
    },
    "cart": [],
    "wishlist": [],
    "api": [],
    "createdAt": "2026-04-20T10:30:00Z",
    "updatedAt": "2026-04-20T10:30:00Z"
  }
}
```

**Cookie Set**: `apiProviderToken` (HTTP-only, secure, sameSite: none, expires in 30 days)

#### Error Responses

**Status Code**: `400 Bad Request` — Missing fields

```json
{
  "message": "All fields are required",
  "success": false
}
```

**Status Code**: `400 Bad Request` — User already exists

```json
{
  "message": "User already exists",
  "success": false
}
```

**Status Code**: `500 Internal Server Error`

```json
{
  "message": "internal server error",
  "error": "Database connection failed",
  "success": false
}
```

---

### POST /api/user/userLogin

- **Purpose**: Authenticate a user and establish a session via JWT cookie.
- **Availability**: Public — no authentication required.
- **HTTP Method**: `POST`
- **Content-Type**: `application/json`

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | User's registered email address |
| `password` | string | Yes | User's account password |

#### Request Example

```json
{
  "email": "alice@example.com",
  "password": "P@ssw0rd!"
}
```

#### Success Response

**Status Code**: `200 OK`

```json
{
  "message": "User logged in successfully",
  "success": true,
  "user": {
    "_id": "645a1f2c3d5e6f7g8h9i0j1k",
    "username": "alice",
    "email": "alice@example.com",
    "role": "user",
    "membership": false,
    "profilePicture": {
      "url": "",
      "imageId": ""
    },
    "verificationCode": {
      "email": null,
      "phone": null
    },
    "createdAt": "2026-04-20T10:30:00Z",
    "updatedAt": "2026-04-20T10:30:00Z"
  }
}
```

**Cookie Set**: `apiProviderToken` (JWT token containing `userId` and `email`, HTTP-only, secure, sameSite: none, expires in 30 days)

#### Error Responses

**Status Code**: `400 Bad Request` — User not found

```json
{
  "message": "User not found",
  "success": false
}
```

**Status Code**: `400 Bad Request` — Invalid credentials

```json
{
  "message": "Invalid credentials",
  "success": false
}
```

**Status Code**: `500 Internal Server Error`

```json
{
  "message": "internal server error",
  "error": "Database connection failed",
  "success": false
}
```

#### Notes

- Passwords are hashed using bcrypt before storage. Server uses `comparePassword()` method for verification.
- JWT token includes `userId`, `email`, and `role` in the payload.
- Cookie is automatically sent with subsequent requests for authentication.

---

### GET /api/user/userLogout

- **Purpose**: Terminate user session by clearing authentication cookie.
- **Availability**: Public — no authentication required.
- **HTTP Method**: `GET`

#### Request

No request body required.

#### Success Response

**Status Code**: `200 OK`

```json
{
  "msg": "Logged out successfully"
}
```

#### Error Response

**Status Code**: `400 Bad Request`

```json
{
  "msg": "user cant logout"
}
```

#### Notes

- The `apiProviderToken` cookie is cleared from the client.
- No further authenticated requests can be made until user logs in again.

---

### GET /api/user/userDetail

- **Purpose**: Retrieve the authenticated user's complete profile information.
- **Availability**: Protected — requires `isAunthenticate` middleware and valid JWT cookie.
- **HTTP Method**: `GET`

#### Request

No request body required. Authentication via cookie header.

#### Success Response

**Status Code**: `200 OK` (Note: current implementation returns `201`)

```json
{
  "message": "user found",
  "success": true,
  "userDetail": {
    "_id": "645a1f2c3d5e6f7g8h9i0j1k",
    "username": "alice",
    "email": "alice@example.com",
    "role": "user",
    "membership": false,
    "profilePicture": {
      "url": "https://example.com/profile.jpg",
      "imageId": "img_12345"
    },
    "verificationCode": {
      "email": null,
      "phone": null
    },
    "cart": [
      {
        "apiId": "645b2f3c4d5e6f7g8h9i0j1k"
      }
    ],
    "wishlist": [
      {
        "apiId": "645c3f4c5d6e7f8g9h0i1j2k"
      }
    ],
    "api": [
      {
        "apiId": "645d4f5c6d7e8f9g0h1i2j3k",
        "url": "https://api.example.com",
        "purchased": true
      }
    ],
    "createdAt": "2026-04-20T10:30:00Z",
    "updatedAt": "2026-04-20T11:45:00Z"
  }
}
```

#### Error Responses

**Status Code**: `404 Not Found`

```json
{
  "message": "user not found!",
  "success": false
}
```

**Status Code**: `401 Unauthorized` — Invalid or missing authentication

```json
{
  "message": "Authentication required",
  "success": false
}
```

**Status Code**: `500 Internal Server Error`

```json
{
  "message": "internal server error",
  "error": "Database query failed",
  "success": false
}
```

---

### PUT /api/user/userUpdate

- **Purpose**: Update one or more profile fields for the authenticated user.
- **Availability**: Protected — requires `isAunthenticate` middleware and valid JWT cookie.
- **HTTP Method**: `PUT`
- **Content-Type**: `application/json`

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `username` | string | No | New username (2-50 characters) |
| `profileUrl` | string | No | URL to profile picture |
| `ProfileImgId` | string | No | External image ID for profile picture |

#### Request Example

```json
{
  "username": "alice_updated",
  "profileUrl": "https://example.com/alice-new.jpg",
  "ProfileImgId": "img_new_12345"
}
```

#### Success Response

**Status Code**: `200 OK`

```json
{
  "message": "user detail updated successfully",
  "success": true,
  "userDetail": {
    "_id": "645a1f2c3d5e6f7g8h9i0j1k",
    "username": "alice_updated",
    "email": "alice@example.com",
    "role": "user",
    "membership": false,
    "profilePicture": {
      "url": "https://example.com/alice-new.jpg",
      "imageId": "img_new_12345"
    },
    "verificationCode": {
      "email": null,
      "phone": null
    },
    "updatedAt": "2026-04-20T12:00:00Z"
  }
}
```

#### Error Responses

**Status Code**: `404 Not Found`

```json
{
  "message": "user not found!",
  "success": false
}
```

**Status Code**: `500 Internal Server Error`

```json
{
  "message": "internal server error",
  "error": "Database update failed",
  "success": false
}
```

#### Notes

- Only provided fields are updated (partial update supported).
- Other user properties remain unchanged.
- Update is saved immediately to the database.

---

### GET /api/user/codegen

- **Path**: `/codegen`
- **Purpose**: Generate a verification code for email-based account actions (deletion, sensitive operations).
- **Availability**: Protected — requires `isAunthenticate` middleware and valid JWT cookie.
- **HTTP Method**: `GET`

#### Request

No request body required. Authentication via cookie header.

#### Success Response

**Status Code**: `201 Created` (Note: should be `200 OK`)

```json
{
  "message": "code gen",
  "code": "123456"
}
```

#### Current Behavior

- Server generates a 6-digit numeric code using `crypto.randomInt(100000, 999999)`.
- Code is saved to `user.verificationCode.email`.
- Code is **currently returned in the response** (for debugging purposes).

#### Recommended Production Behavior

1. Generate a time-limited verification code (valid for 15 minutes).
2. Send code to user's email via transactional email provider (SendGrid, SES, Mailgun, etc.).
3. Store hashed code + expiry timestamp on user record.
4. Return acknowledgement without exposing the code.

#### Recommended Response (Production)

**Status Code**: `200 OK`

```json
{
  "message": "Verification code sent to your registered email address",
  "success": true
}
```

#### Error Responses

**Status Code**: `401 Unauthorized`

```json
{
  "message": "Authentication required",
  "success": false
}
```

**Status Code**: `500 Internal Server Error`

```json
{
  "message": "internal server error",
  "error": "Failed to generate code",
  "success": false
}
```

#### Security Recommendations

- ⚠️ **CRITICAL**: Never return verification codes in API responses in production.
- Store codes hashed (bcrypt/argon2) with expiry timestamps.
- Rate-limit `/codegen` requests to prevent abuse (e.g., 1 request per minute per user).
- Implement cooldown periods between code generation attempts.
- Consider using time-based OTP (TOTP) instead of random codes for enhanced security.

---

### GET /api/user/promoteUser/:userId

- **Path**: `/promoteUser/:userId`
- **Purpose**: Promote a user to provider/seller membership status.
- **Availability**: Protected — requires `isAunthenticate` middleware and valid JWT cookie.
- **HTTP Method**: `GET` (Note: should be `PUT` or `POST` for state-changing operation)

#### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `userId` | string (ObjectId) | Yes | The user ID to promote (must match authenticated user's ID) |

#### Request Example

```
GET /api/user/promoteUser/645a1f2c3d5e6f7g8h9i0j1k
```

#### Success Response

**Status Code**: `201 Created` (Note: should be `200 OK`)

```json
{
  "message": "you are promoted to provider/seller",
  "success": true,
  "userDetail": {
    "_id": "645a1f2c3d5e6f7g8h9i0j1k",
    "username": "alice",
    "email": "alice@example.com",
    "role": "user",
    "membership": true,
    "profilePicture": {
      "url": "",
      "imageId": ""
    },
    "updatedAt": "2026-04-20T13:15:00Z"
  }
}
```

#### Error Responses

**Status Code**: `404 Not Found` — User not found OR unauthorized

```json
{
  "message": "you are not authorized",
  "success": false
}
```

**Status Code**: `404 Not Found` — User does not exist

```json
{
  "message": "user not found!",
  "success": false
}
```

**Status Code**: `500 Internal Server Error`

```json
{
  "message": "internal server error",
  "error": "Failed to update user",
  "success": false
}
```

#### Current Implementation Issues

1. ⚠️ **HTTP Verb Issue**: Uses `GET` for a state-changing operation. Should use `PUT` or `POST`.
2. ⚠️ **Authorization Issue**: Returns `404` on mismatch instead of `403 Forbidden`.
3. ⚠️ **Code Bug**: Calls `userDetail.membership(true)` (incorrect method call). Should be `userDetail.membership = true` (property assignment).
4. ⚠️ **Status Code Issue**: Returns `201` for non-creation action. Should return `200 OK`.

#### Recommended Changes

```javascript
// Change to PUT verb
PUT /api/user/promoteUser/:userId

// Fix the membership assignment
userDetail.membership = true;

// Return 200 OK instead of 201
res.status(200).json({...})
```

#### Recommended Response (Fixed)

**Status Code**: `200 OK`

```json
{
  "message": "User successfully promoted to provider",
  "success": true,
  "userDetail": {
    "_id": "645a1f2c3d5e6f7g8h9i0j1k",
    "membership": true
  }
}
```

---

### DELETE /api/user/userDelete

- **Path**: `/userDelete`
- **Purpose**: Permanently delete the authenticated user's account after verification.
- **Availability**: Protected — requires `isAunthenticate` middleware and valid JWT cookie.
- **HTTP Method**: `DELETE`
- **Content-Type**: `application/json`

#### Request Body

Provide ONE of the following verification methods:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `password` | string | Conditional | User's account password (plaintext comparison — **INSECURE**) |
| `emailCode` | string | Conditional | Verification code from `/codegen` endpoint (6 digits) |

#### Request Example (Password Verification)

```json
{
  "password": "P@ssw0rd!"
}
```

#### Request Example (Email Code Verification)

```json
{
  "emailCode": "123456"
}
```

#### Success Response

**Status Code**: `201 Created` (Note: should be `204 No Content` or `200 OK` for deletion)

```json
{
  "message": "user deleted successfully!",
  "success": true
}
```

#### Error Responses

**Status Code**: `400 Bad Request` — Missing both verification methods

```json
{
  "message": "fill all the credentials",
  "success": false
}
```

**Status Code**: `400 Bad Request` — Invalid password

```json
{
  "message": "invalid credentials",
  "success": false
}
```

**Status Code**: `400 Bad Request` — Invalid email code

```json
{
  "message": "invalid credentials",
  "success": false
}
```

**Status Code**: `500 Internal Server Error`

```json
{
  "message": "internal server error",
  "error": "Database deletion failed",
  "success": false
}
```

#### Current Implementation Issues

1. ⚠️ **CRITICAL - Security**: Compares plaintext `password` to stored `user.password`. Passwords must be hashed with bcrypt/argon2.
2. ⚠️ **Status Code Issue**: Returns `201` for non-creation action. Should return `204 No Content` or `200 OK`.
3. ⚠️ **Validation Issue**: Returns `201` for validation error (should be `400 Bad Request`).
4. ⚠️ **Data Handling**: Performs immediate hard delete. Consider soft-delete or retention policies.
5. ⚠️ **Authorization**: Should require re-authentication or additional confirmation for destructive actions.

#### Recommended Changes

```javascript
// 1. Use bcrypt compare for password verification
const isPasswordValid = await bcrypt.compare(password, userDetail.password);

// 2. Return 204 No Content for successful deletion
res.status(204).send();

// 3. Implement soft delete
userDetail.isDeleted = true;
userDetail.deletedAt = new Date();
await userDetail.save();

// 4. Add re-authentication requirement
// Verify JWT is recent (less than 5 minutes old)
```

#### Recommended Response (Fixed)

**Status Code**: `204 No Content`

```
(No content in response body)
```

#### Security Recommendations

- ⚠️ **Password Verification**: Use `bcrypt.compare()` instead of plaintext comparison.
- ⚠️ **Code Verification**: Validate email codes against hashed values stored on user record.
- ⚠️ **Rate Limiting**: Limit deletion attempts to prevent abuse.
- ⚠️ **Grace Period**: Implement soft-delete with 30-day grace period before permanent removal.
- ⚠️ **Audit Trail**: Log deletion requests with timestamps and IP addresses.
- ⚠️ **Re-authentication**: Require fresh authentication for account deletion (token age < 5 min).

---

## Email verification flow (recommended)

1. User requests a verification code via `/codegen` (authenticated).
2. Server generates a 6-digit code, stores a hashed version with an expiry (e.g., 15 minutes).
3. Server sends the plaintext code to the user's email address via an email provider.
4. Client submits the code to a verification endpoint (not currently implemented) or includes it where required (e.g., account deletion).

Security considerations:

- Never echo verification codes in API responses in production.
- Store codes hashed where possible and associate an expiry timestamp.
- Rate-limit requests to `/codegen` and verification endpoints to prevent abuse.

---

## Model notes

- `profilePicture`: `{ url: String, imageId: String }`
- `verificationCode`: `{ email: Number|null, phone: Number|null }` — store codes and expiry metadata.
- `membership`: Boolean — indicates provider/seller status.

---

## Implementation issues & recommended fixes

1. Hash passwords (bcrypt or argon2) and use secure compare helpers.
2. Remove verification codes from API responses; send them by email and store a hashed code + expiry.
3. Fix `promoteUser` to use assignment (`userDetail.membership = true`) and a safer HTTP verb (`PUT`/`POST`).
4. Standardize HTTP status codes across controllers (use `200`/`201`/`400`/`401`/`403`/`404`/`500`).
5. Add request validation (Joi, express-validator) and more precise error messages.
6. Consider a soft-delete strategy for `DELETE /userDelete` and require re-authentication for destructive actions.

---

If you'd like, I can implement the recommended fixes (hash passwords, remove verification codes from responses, fix the `promoteUser` bug, add validation, and update status codes). Tell me which items to prioritize and I will update the code and tests.

Example request:

```json
DELETE /userDelete
Content-Type: application/json

{ "password": "P@ssw0rd!" }
```

Example implemented response:

HTTP 201

```json
{ "message": "user deleted sucessfully !", "success": true }
```

Recommendations:
- Use `400 Bad Request` for missing parameters.
- Require re-authentication or stronger verification for destructive actions.
- Do not compare plaintext passwords — always use hashed password verification (bcrypt/argon2).
- Consider soft-delete or retention policies instead of immediate permanent deletion.

---

## User schema updates (from `user.model.js`)

Recent model changes introduce additional fields used by the above endpoints. Current fields of interest:

- `profilePicture` (object) — `{ url: String, imageId: String }` — stores a public URL and external image id.
- `verificationCode` (object) — `{ email: Number|null, phone: Number|null }` — stores one-time numeric codes for verification workflows.
- `cart` (array) — array of `{ apiId: ObjectId }` references.
- `wishlist` (array) — array of `{ apiId: ObjectId }` references.
- `membership` (Boolean) — flags provider/seller membership status.
- `role` enum now includes `'user'` as a valid default value.

Important: the `api` subdocument still uses `require : true` in the schema for `url` which appears to be a typo and should be `required: true` if the field is mandatory.

Stored document example (partial):

```json
{
  "_id": "645b1f...",
  "username": "alice",
  "email": "alice@example.com",
  "profilePicture": { "url": "", "imageId": "" },
  "verificationCode": { "email": 123456, "phone": null },
  "membership": false,
  "role": "user"
}
```

Sanitized API response recommendation: exclude `password` and any raw verification codes. Use `toJSON` transforms to map `_id` to `id`, drop `__v`, and remove secrets.

---

## Implementation issues observed (action items)

1. `codegen` currently returns the verification code in the response — send codes via email/SMS and never echo them to API clients.
2. `promoteUser` uses `GET` for a state change and contains a bug: `userDetail.membership(true)` — should be an assignment.
3. `deleteUser` and other flows compare plaintext passwords. Move to hashed passwords and use secure compare.
4. Status codes are inconsistent (many 201 responses for non-creation actions). Standardize to `200`/`204`/`400`/`401`/`403`/`404`/`500` as appropriate.

---

If you want, I can implement these fixes (hash passwords, remove verification codes from responses, correct `promoteUser`, add input validation, and adjust status codes). Tell me which items to prioritize and I will update the code and tests.

---

## User Workflows & Use Cases

### User Registration and Authentication Flow

```
1. User calls POST /api/user/userRegister
   → Server validates input
   → Server hashes password with bcrypt
   → Server creates user document
   → Server sets apiProviderToken cookie
   → Returns user profile (password excluded)

2. Subsequent requests use apiProviderToken cookie
   → auth.middleware validates JWT
   → req.id populated with userId
   → Authenticated endpoint proceeds
```

### User Account Management Flow

```
1. User calls GET /api/user/userDetail (authenticated)
   → Returns complete user profile

2. User calls PUT /api/user/userUpdate (authenticated)
   → Updates profile fields (username, picture)
   → Changes persisted to database

3. User calls GET /api/user/codegen (authenticated)
   → Server generates 6-digit verification code
   → Code sent to registered email (recommended)
   → Code saved to user.verificationCode.email

4. User calls DELETE /api/user/userDelete (authenticated)
   → Requires verification: password or emailCode
   → Account deleted permanently
   → Session terminated
```

### User to Provider Promotion

```
1. User calls GET /api/user/promoteUser/:userId (authenticated)
   → Validates user owns the userId
   → Sets membership = true
   → User can now create and manage APIs
```

---

## API Provider Routes (Detailed)
---

### Provider Router — Router (as implemented)

Source code: [backend/router/provider.route.js](backend/router/provider.route.js)

- Mounted prefix: `/api/provider` (router exported at [backend/router/provider.route.js](backend/router/provider.route.js))
- Routes (implemented mapping):
  - `POST /providerRegister` — middleware: none — handler: `providerRegister`
  - `POST /providerLogin` — middleware: none — handler: `providerLogin`
  - `GET /providerLogout` — middleware: none — handler: `providerLogout`
  - `DELETE /providerDelete` — middleware: `isProviderAuthenticate` — handler: `deleteProvider`
  - `GET /providerDetail` — middleware: `isProviderAuthenticate` — handler: `getProviderDetail`
  - `PUT /providerUpdate` — middleware: `isProviderAuthenticate` — handler: `updateProviderDetail`
  - `GET /providerCodegen` — middleware: `isProviderAuthenticate` — handler: `codeGen`

### POST /api/provider/providerRegister

- **Purpose**: Create a new provider account or promote verified user to provider.
- **Availability**: Public — no authentication required.
- **HTTP Method**: `POST`
- **Content-Type**: `application/json`

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `username` | string | Conditional | Provider username (required if new registration, optional if promoting user) |
| `email` | string | Yes | Provider email (must be unique) |
| `password` | string | Yes | Provider password (min 8 characters, bcrypt hashed) |

#### Request Example

```json
{
  "username": "bob_provider",
  "email": "bob@provider.com",
  "password": "SecurePass123!"
}
```

#### Success Response

**Status Code**: `201 Created`

```json
{
  "message": "provider registered successfully",
  "success": true,
  "user": {
    "_id": "645b2f3c4d5e6f7g8h9i0j1k",
    "username": "bob_provider",
    "email": "bob@provider.com",
    "role": "provider",
    "membership": true,
    "profilePicture": {
      "url": "",
      "imageId": ""
    },
    "subscriptionPlan": "free",
    "apiCreated": [],
    "createdAt": "2026-04-20T10:30:00Z"
  }
}
```

**Cookie Set**: `apiProviderToken` (JWT with `userId`, `email`, `role`, HTTP-only, secure, expires 30 days)

#### Error Responses

**Status Code**: `400 Bad Request` — Missing required fields

```json
{
  "message": "All fields are required",
  "success": false
}
```

**Status Code**: `400 Bad Request` — Provider already exists

```json
{
  "message": "provider already exists",
  "success": false
}
```

**Status Code**: `400 Bad Request` — Email verification required (for user promotion)

```json
{
  "message": "email not verified!",
  "success": false
}
```

**Status Code**: `500 Internal Server Error`

```json
{
  "message": "internal server error",
  "error": "Database operation failed",
  "success": false
}
```

#### Provider Creation Logic

- **New Provider**: Creates provider account directly with provided credentials.
- **User Promotion**: If email matches a verified user, promotes that user to provider status.
- Requires user's email to be marked as `isVerified.email = true`.

---

### POST /api/provider/providerLogin

- **Purpose**: Authenticate a provider and establish a session via JWT cookie.
- **Availability**: Public — no authentication required.
- **HTTP Method**: `POST`
- **Content-Type**: `application/json`

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `email` | string | Yes | Provider's registered email address |
| `password` | string | Yes | Provider's account password |

#### Request Example

```json
{
  "email": "bob@provider.com",
  "password": "SecurePass123!"
}
```

#### Success Response

**Status Code**: `200 OK`

```json
{
  "message": "provider logged in successfully",
  "success": true,
  "providerDetail": {
    "_id": "645b2f3c4d5e6f7g8h9i0j1k",
    "username": "bob_provider",
    "email": "bob@provider.com",
    "role": "provider",
    "membership": true,
    "profilePicture": {
      "url": "https://example.com/bob.jpg",
      "imageId": "img_bob_123"
    },
    "subscriptionPlan": "pro",
    "apiCreated": [
      {
        "apiId": "645c3f4c5d6e7f8g9h0i1j2k",
        "purchased": true
      }
    ],
    "createdAt": "2026-04-20T10:30:00Z",
    "updatedAt": "2026-04-20T15:45:00Z"
  }
}
```

**Cookie Set**: `apiProviderToken` (JWT containing `userId`, `email`, `role`, HTTP-only, secure, sameSite: none, expires 30 days)

#### Error Responses

**Status Code**: `400 Bad Request` — Provider not found

```json
{
  "message": "provider not found",
  "success": false
}
```

**Status Code**: `400 Bad Request` — Invalid credentials

```json
{
  "message": "Invalid credentials",
  "success": false
}
```

**Status Code**: `500 Internal Server Error`

```json
{
  "message": "internal server error",
  "error": "Database query failed",
  "success": false
}
```

#### Notes

- Passwords are hashed using bcrypt. Server uses `comparePassword()` for verification.
- JWT token includes `userId`, `email`, and `role` (provider) in the payload.

---

### GET /api/provider/providerLogout

- **Purpose**: Terminate provider session by clearing authentication cookie.
- **Availability**: Public — no authentication required.
- **HTTP Method**: `GET`

#### Request

No request body required.

#### Success Response

**Status Code**: `200 OK`

```json
{
  "msg": "Logged out successfully"
}
```

#### Error Response

**Status Code**: `400 Bad Request`

```json
{
  "msg": "user cant logout"
}
```

#### Notes

- The `apiProviderToken` cookie is cleared from the client.
- Provider must authenticate again to access protected endpoints.

---

### GET /api/provider/providerDetail

- **Purpose**: Retrieve the authenticated provider's complete profile and business information.
- **Availability**: Protected — requires `isProviderAuthenticate` middleware and valid JWT cookie.
- **HTTP Method**: `GET`

#### Request

No request body required. Authentication via cookie header.

#### Success Response

**Status Code**: `200 OK` (Note: current implementation returns `201`)

```json
{
  "message": "provider found",
  "success": true,
  "providerDetail": {
    "_id": "645b2f3c4d5e6f7g8h9i0j1k",
    "username": "bob_provider",
    "email": "bob@provider.com",
    "role": "provider",
    "membership": true,
    "profilePicture": {
      "url": "https://example.com/bob.jpg",
      "imageId": "img_bob_123"
    },
    "verificationCode": {
      "email": null,
      "phone": null
    },
    "subscriptionPlan": "pro",
    "apiCreated": [
      {
        "apiId": "645c3f4c5d6e7f8g9h0i1j2k",
        "purchased": true
      },
      {
        "apiId": "645d4f5c6d7e8f9g0h1i2j3k",
        "purchased": false
      }
    ],
    "activityLogs": [
      {
        "action": "API_CREATED",
        "timestamp": "2026-04-20T14:30:00Z"
      },
      {
        "action": "PROFILE_UPDATED",
        "timestamp": "2026-04-20T12:15:00Z"
      }
    ],
    "createdAt": "2026-04-15T08:00:00Z",
    "updatedAt": "2026-04-20T15:45:00Z"
  }
}
```

#### Error Responses

**Status Code**: `404 Not Found`

```json
{
  "message": "provider not found!",
  "success": false
}
```

**Status Code**: `401 Unauthorized`

```json
{
  "message": "Authentication required",
  "success": false
}
```

**Status Code**: `500 Internal Server Error`

```json
{
  "message": "internal server error",
  "error": "Database query failed",
  "success": false
}
```

---

### PUT /api/provider/providerUpdate

- **Purpose**: Update provider profile and business information.
- **Availability**: Protected — requires `isProviderAuthenticate` middleware and valid JWT cookie.
- **HTTP Method**: `PUT`
- **Content-Type**: `application/json`

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `username` | string | No | Provider company/business name |
| `profileUrl` | string | No | URL to provider profile/logo image |
| `ProfileImgId` | string | No | External image ID for provider profile |

#### Request Example

```json
{
  "username": "bob_provider_updated",
  "profileUrl": "https://example.com/bob-updated.png",
  "ProfileImgId": "img_bob_new_456"
}
```

#### Success Response

**Status Code**: `200 OK`

```json
{
  "message": "provider detail updated successfully",
  "success": true,
  "providerDetail": {
    "_id": "645b2f3c4d5e6f7g8h9i0j1k",
    "username": "bob_provider_updated",
    "email": "bob@provider.com",
    "role": "provider",
    "membership": true,
    "profilePicture": {
      "url": "https://example.com/bob-updated.png",
      "imageId": "img_bob_new_456"
    },
    "updatedAt": "2026-04-20T16:00:00Z"
  }
}
```

#### Error Responses

**Status Code**: `404 Not Found`

```json
{
  "message": "provider not found!",
  "success": false
}
```

**Status Code**: `500 Internal Server Error`

```json
{
  "message": "internal server error",
  "error": "Database update failed",
  "success": false
}
```

#### Notes

- Only provided fields are updated (partial update supported).
- Other provider properties remain unchanged.

---

### GET /api/provider/providerCodegen

- **Path**: `/providerCodegen`
- **Purpose**: Generate a verification code for provider account actions (sensitive operations, account deletion).
- **Availability**: Protected — requires `isProviderAuthenticate` middleware and valid JWT cookie.
- **HTTP Method**: `GET`

#### Request

No request body required. Authentication via cookie header.

#### Success Response

**Status Code**: `201 Created` (Note: should be `200 OK`)

```json
{
  "message": "code gen",
  "code": "654321"
}
```

#### Current Behavior

- Server generates a 6-digit numeric code using `crypto.randomInt(100000, 999999)`.
- Code is saved to `provider.verificationCode.email`.
- Code is **currently returned in the response** (for debugging).

#### Recommended Production Behavior

1. Generate time-limited verification code (valid for 15 minutes).
2. Send code to provider's registered email via transactional email service.
3. Store hashed code + expiry timestamp on provider record.
4. Return acknowledgement without exposing code.

#### Recommended Response (Production)

**Status Code**: `200 OK`

```json
{
  "message": "Verification code sent to your registered email",
  "success": true
}
```

#### Error Responses

**Status Code**: `401 Unauthorized`

```json
{
  "message": "Authentication required",
  "success": false
}
```

**Status Code**: `500 Internal Server Error`

```json
{
  "message": "internal server error",
  "error": "Failed to generate code",
  "success": false
}
```

#### Security Recommendations

- ⚠️ **CRITICAL**: Never return verification codes in API responses in production.
- Store codes hashed (bcrypt/argon2) with expiry timestamps.
- Rate-limit `/providerCodegen` requests (1 per minute per provider).
- Implement cooldown between code requests.
- Consider TOTP instead of random codes for enhanced security.

---

### DELETE /api/provider/providerDelete

- **Path**: `/providerDelete`
- **Purpose**: Permanently delete the authenticated provider's account and associated data after verification.
- **Availability**: Protected — requires `isProviderAuthenticate` middleware and valid JWT cookie.
- **HTTP Method**: `DELETE`
- **Content-Type**: `application/json`

#### Request Body

Provide ONE of the following verification methods:

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `password` | string | Conditional | Provider's account password (plaintext — **INSECURE**) |
| `emailCode` | string | Conditional | Verification code from `/providerCodegen` (6 digits) |

#### Request Example (Password Verification)

```json
{
  "password": "SecurePass123!"
}
```

#### Request Example (Email Code Verification)

```json
{
  "emailCode": "654321"
}
```

#### Success Response

**Status Code**: `201 Created` (Note: should be `204 No Content`)

```json
{
  "message": "provider deleted successfully!",
  "success": true
}
```

#### Error Responses

**Status Code**: `400 Bad Request` — Missing verification

```json
{
  "message": "fill all the credentials",
  "success": false
}
```

**Status Code**: `400 Bad Request` — Invalid password

```json
{
  "message": "invalid credentials",
  "success": false
}
```

**Status Code**: `400 Bad Request` — Invalid email code

```json
{
  "message": "invalid credentials",
  "success": false
}
```

**Status Code**: `500 Internal Server Error`

```json
{
  "message": "internal server error",
  "error": "Database deletion failed",
  "success": false
}
```

#### Current Implementation Issues

1. ⚠️ **CRITICAL - Security**: Compares plaintext password to stored value. Must use bcrypt/argon2.
2. ⚠️ **Status Code Issue**: Returns `201` for non-creation action (should be `204 No Content`).
3. ⚠️ **Validation Issue**: Returns `201` for validation error (should be `400 Bad Request`).
4. ⚠️ **Data Handling**: Performs hard delete. Consider soft-delete with grace period.
5. ⚠️ **Authorization**: Should require re-authentication for destructive operations.

#### Recommended Changes

```javascript
// 1. Use bcrypt compare
const isPasswordValid = await bcrypt.compare(password, providerDetail.password);

// 2. Return 204 No Content
res.status(204).send();

// 3. Implement soft delete (30-day grace period)
providerDetail.isDeleted = true;
providerDetail.deletedAt = new Date();
await providerDetail.save();

// 4. Validate re-authentication
// Ensure token issued recently (< 5 minutes)
```

#### Recommended Response (Fixed)

**Status Code**: `204 No Content`

```
(No content in response body)
```

#### Security Recommendations

- ⚠️ **Password Verification**: Use `bcrypt.compare()` for password validation.
- ⚠️ **Email Code Verification**: Compare against hashed codes stored on provider record.
- ⚠️ **Rate Limiting**: Limit deletion attempts to prevent abuse/DoS.
- ⚠️ **Grace Period**: Implement 30-day soft-delete before permanent removal.
- ⚠️ **Audit Trail**: Log all deletion requests with timestamp, IP address, and method.
- ⚠️ **Re-authentication**: Require fresh token (< 5 minutes old) for account deletion.
- ⚠️ **Backup**: Notify provider that data will be permanently removed after grace period.

---

---

## Provider Workflows & Use Cases

### Provider Registration and Authentication Flow

```
1. Provider calls POST /api/provider/providerRegister
   → Check if email already registered as provider
   → If email matches verified user, promote user to provider
   → Otherwise create new provider account
   → Server hashes password with bcrypt
   → Server sets apiProviderToken cookie
   → Returns provider profile

2. Existing provider calls POST /api/provider/providerLogin
   → Server validates email & password
   → Server generates JWT token
   → Sets apiProviderToken cookie
   → Returns provider details + subscription info
```

### Provider Profile Management Flow

```
1. Provider calls GET /api/provider/providerDetail (authenticated)
   → Returns complete provider profile
   → Includes APIs created, subscription plan, activity logs

2. Provider calls PUT /api/provider/providerUpdate (authenticated)
   → Updates profile name, logo/image
   → Changes persisted to database

3. Provider calls GET /api/provider/providerCodegen (authenticated)
   → Generates 6-digit verification code
   → Code sent to provider email (recommended)
   → Code saved to provider.verificationCode.email

4. Provider calls DELETE /api/provider/providerDelete (authenticated)
   → Requires verification: password or emailCode
   → Account deleted permanently (recommended: 30-day soft delete)
   → All associated APIs and customer data handled per policy
   → Session terminated
```

### Provider API Creation and Management

```
1. Provider calls POST /api/apiGen/createApi (authenticated, isProviderAuthenticate)
   → Provider submits API details (name, baseUrl)
   → Server creates API document in database
   → Returns created API with apiId
   
2. API Consumers:
   → Can discover APIs via GET /api/apiGen/getApi (authenticated)
   → Request access/purchase via GET /api/apiGen/setApi/:consumerId
   → Receive API key & password for authentication
   
3. Consumers use API:
   → Call POST /api/apiGen/apiRequest/:endpoint (authenticated)
   → Include api_provide_key & api_provide_password headers
   → Server proxies request to provider's API baseUrl
   → Logs usage metrics to InfluxDB (latency, status codes)
   → Tracks billing if usage exceeds free tier limits
```

---

## Email Verification Flow (Recommended for Both User & Provider)

### Implementation Steps

1. **User/Provider requests verification**:
   - Calls `GET /codegen` (user) or `GET /providerCodegen` (provider)
   - Server generates 6-digit numeric code

2. **Code handling (CURRENT - INSECURE)**:
   - ⚠️ Code returned in API response
   - ⚠️ Stored in plaintext on user/provider record
   - ⚠️ No expiry timestamp

3. **Code handling (RECOMMENDED - SECURE)**:
   ```javascript
   // Generate code
   const code = crypto.randomInt(100000, 999999).toString();
   
   // Hash the code
   const hashedCode = await bcrypt.hash(code, 10);
   
   // Store hash + expiry
   user.verificationCode.email = hashedCode;
   user.verificationCodeExpires.email = Date.now() + (15 * 60 * 1000); // 15 min
   await user.save();
   
   // Send via email (NOT returned in response)
   await emailProvider.send({
     to: user.email,
     subject: "Your Verification Code",
     html: `<p>Your code: ${code}</p><p>Expires in 15 minutes</p>`
   });
   
   // Return only acknowledgement
   res.json({ 
     message: "Code sent to your email", 
     success: true 
   });
   ```

4. **Verification process**:
   - User/Provider submits code in endpoint body
   - Server compares against hashed value
   - Verify code has not expired
   - Clear code from record after successful verification

### Recommended Email Templates

**Verification Code Email**:
```
Subject: Your Verification Code - API Provider

Hi {username},

You requested a verification code. Use this code for your account action:

    CODE: 123456

This code expires in 15 minutes.

If you did not request this code, ignore this email and your account remains secure.

---
API Provider Platform
```

**Account Deletion Confirmation**:
```
Subject: Account Deletion Request

Hi {username},

Your account deletion request is in progress. Your account and associated data will be 
permanently deleted in 30 days unless you cancel this request.

To cancel deletion, log in and navigate to Account Settings before the 30-day grace period ends.

---
API Provider Platform
```

---

## API Provider (API Marketplace) Routes
---

This section documents the API creation, discovery, and consumption endpoints. These routes enable providers to publish APIs and consumers to discover, purchase, and use those APIs.

Source code: [backend/router/apiProvider.route.js](backend/router/apiProvider.route.js) and [backend/controller/apiProvider.controller.js](backend/controller/apiProvider.controller.js)

### POST /api/apiGen/createApi

- **Purpose**: Create and publish a new API for consumption by other users.
- **Availability**: Protected — requires `isProviderAuthenticate` middleware (provider role only).
- **HTTP Method**: `POST`
- **Content-Type**: `application/json`

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `providerId` | string (ObjectId) | Yes | Provider's ID (must match authenticated user ID) |
| `name` | string | Yes | API name/title (e.g., "Weather API", "Payment Processor") |
| `baseUrl` | string | Yes | Base URL of the provider's API (e.g., "https://api.weather.com") |

#### Request Example

```json
{
  "providerId": "645b2f3c4d5e6f7g8h9i0j1k",
  "name": "Real-time Weather API",
  "baseUrl": "https://api.weather.example.com"
}
```

#### Success Response

**Status Code**: `201 Created`

```json
{
  "message": "api created successfully",
  "success": true,
  "createdApi": {
    "_id": "645c3f4c5d6e7f8g9h0i1j2k",
    "providerId": "645b2f3c4d5e6f7g8h9i0j1k",
    "name": "Real-time Weather API",
    "baseUrl": "https://api.weather.example.com",
    "status": "active",
    "apiKeys": [],
    "usageLogs": [],
    "billing": {
      "amount": 0,
      "totalRequests": 0
    },
    "createdAt": "2026-04-20T10:30:00Z",
    "updatedAt": "2026-04-20T10:30:00Z"
  }
}
```

#### Error Responses

**Status Code**: `400 Bad Request` — Missing required fields

```json
{
  "message": "All fields are required",
  "success": false
}
```

**Status Code**: `400 Bad Request` — Provider not found

```json
{
  "message": "provider already exists",
  "success": false
}
```

**Status Code**: `401 Unauthorized` — Not authenticated as provider

```json
{
  "message": "Authentication required",
  "success": false
}
```

**Status Code**: `500 Internal Server Error`

```json
{
  "message": "internal server error",
  "error": "Database creation failed",
  "success": false
}
```

#### Notes

- Only providers (users with `role: 'provider'`) can create APIs.
- Each API is associated with exactly one provider.
- The `baseUrl` will be used as the base for all API requests proxied through the marketplace.

---

### POST /api/apiGen/getApi

- **Purpose**: Retrieve a list of available APIs for consumption (discover APIs).
- **Availability**: Protected — requires `isAunthenticate` middleware (any authenticated user).
- **HTTP Method**: `POST`
- **Content-Type**: `application/json`

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| (Optional) `providerId` | string | No | Filter by specific provider ID |
| (Optional) `category` | string | No | Filter by API category |
| (Optional) `status` | string | No | Filter by status (active, inactive) |

#### Request Example

```json
{
  "status": "active"
}
```

#### Success Response

**Status Code**: `201 Created` (Note: should be `200 OK`)

```json
{
  "message": "apis retrieved",
  "success": true,
  "apis": [
    {
      "_id": "645c3f4c5d6e7f8g9h0i1j2k",
      "providerId": "645b2f3c4d5e6f7g8h9i0j1k",
      "name": "Real-time Weather API",
      "baseUrl": "https://api.weather.example.com",
      "status": "active",
      "description": "Get real-time weather data",
      "category": "weather",
      "rating": 4.5,
      "usage": 1250,
      "createdAt": "2026-04-15T08:00:00Z"
    },
    {
      "_id": "645d4f5c6d7e8f9g0h1i2j3k",
      "providerId": "645c3f4c5d6e7f8g9h0i1j2k",
      "name": "Payment Processing API",
      "baseUrl": "https://api.payment.example.com",
      "status": "active",
      "description": "Secure payment processing",
      "category": "payments",
      "rating": 4.8,
      "usage": 5200,
      "createdAt": "2026-04-10T08:00:00Z"
    }
  ]
}
```

#### Error Responses

**Status Code**: `401 Unauthorized`

```json
{
  "message": "Authentication required",
  "success": false
}
```

**Status Code**: `500 Internal Server Error`

```json
{
  "message": "internal server error",
  "error": "Database query failed",
  "success": false
}
```

---

### GET /api/apiGen/setApi/:consumerId

- **Purpose**: Purchase or register access to an API (consumer gets API key & password).
- **Availability**: Protected — requires `isAunthenticate` middleware.
- **HTTP Method**: `GET`
- **Content-Type**: `application/json`

#### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `consumerId` | string (ObjectId) | Yes | Consumer's user ID (must match authenticated user) |

#### Request Body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `providerApiId` | string (ObjectId) | Yes | The API ID to purchase/register |

#### Request Example

```
GET /api/apiGen/setApi/645a1f2c3d5e6f7g8h9i0j1k
Content-Type: application/json

{
  "providerApiId": "645c3f4c5d6e7f8g9h0i1j2k"
}
```

#### Success Response

**Status Code**: `201 Created`

```json
{
  "message": "API purchased successfully",
  "success": true,
  "apiKey": "ABCD1234EFGH5678IJKL9012MN",
  "apiPassword": "XyZ123!@#"
}
```

#### Error Responses

**Status Code**: `400 Bad Request` — API not found

```json
{
  "message": "API not found!",
  "success": false
}
```

**Status Code**: `400 Bad Request` — Already purchased

```json
{
  "message": "API already purchased!",
  "success": false
}
```

**Status Code**: `400 Bad Request` — User not found

```json
{
  "message": "User not found!",
  "success": false
}
```

**Status Code**: `500 Internal Server Error`

```json
{
  "message": "Internal server error",
  "error": "Database operation failed",
  "success": false
}
```

#### Notes

- Generates a unique 25-character alphanumeric API key.
- Generates a 12-character password.
- Password is hashed using bcrypt before storage.
- Consumer receives both key and password (only time they're shown).
- Key is stored in plaintext on API document for lookup.
- Password must be stored hashed for security.

---

### POST /api/apiGen/apiRequest/:endpoint

- **Purpose**: Make a request to a consumer-subscribed API through the marketplace gateway.
- **Availability**: Protected — requires `isAunthenticate` middleware (consumer with valid API credentials).
- **HTTP Method**: `POST`
- **Content-Type**: Matches upstream API, typically `application/json`

#### Request Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `endpoint` | string | Yes | API endpoint path (e.g., "/weather/current", "/payment/charge") |

#### Request Headers

| Header | Type | Required | Description |
|--------|------|----------|-------------|
| `api_provide_key` | string | Yes | API key received from `/setApi` |
| `api_provide_password` | string | Yes | API password received from `/setApi` |
| `Content-Type` | string | Conditional | Should match upstream API requirements |

#### Request Example

```
POST /api/apiGen/apiRequest/weather/current?city=London&units=metric
Content-Type: application/json
api_provide_key: ABCD1234EFGH5678IJKL9012MN
api_provide_password: XyZ123!@#

{
  "latitude": 51.5074,
  "longitude": -0.1278
}
```

#### Success Response

**Status Code**: `201 Created` (Note: should match upstream API status)

```json
{
  "message": "got the response",
  "success": true,
  "status": 200,
  "data": {
    "temperature": 15.2,
    "conditions": "Cloudy",
    "humidity": 72,
    "windSpeed": 10.5
  }
}
```

#### Error Responses

**Status Code**: `401 Unauthorized` — Missing credentials

```json
{
  "message": "please provide the authentication keys!",
  "success": false,
  "error": "API key and password required"
}
```

**Status Code**: `401 Unauthorized` — User not found

```json
{
  "message": "user not found!",
  "success": false
}
```

**Status Code**: `401 Unauthorized` — Invalid API key

```json
{
  "message": "Invalid API key",
  "success": false
}
```

**Status Code**: `401 Unauthorized` — API key not active

```json
{
  "message": "API key not active",
  "success": false
}
```

**Status Code**: `400 Bad Request` — Invalid password

```json
{
  "message": "invalid api key credential!",
  "success": false
}
```

**Status Code**: `500 Internal Server Error` — Upstream API failure

```json
{
  "message": "internal server error",
  "error": "Upstream API returned error",
  "success": false
}
```

#### Processing Flow

1. **Authentication**: Validates API key and password.
2. **Lookup**: Finds API document associated with the key.
3. **Authorization**: Verifies consumer has access to the API.
4. **Request Forwarding**: Constructs URL = `baseUrl + endpoint + queryParams`.
5. **Proxy**: Forwards request to provider's API via axios.
6. **Response Capture**: Captures latency (ms) and HTTP status code.
7. **Metrics Logging**: Writes to InfluxDB for analytics.
8. **Billing**: Increments usage counter; charges if over free tier (500 requests).
9. **Response Return**: Returns provider's response data to consumer.

#### Usage Tracking

Each request logs metrics to InfluxDB under bucket `api_logs`:

```
measurement: api_usage
tags: {
  apiId: "{providerId}",
  endpoint: "{full_request_url}"
}
fields: {
  status_code: {http_status},
  latency_ms: {response_time_in_ms}
}
timestamp: {request_timestamp}
```

#### Billing Logic

- **Free Tier**: First 500 requests per API per consumer per month are free.
- **Overage Charge**: After 500 requests: $0.20 per additional request.
- **Tracking**: Charges accumulate in `api.billing.amount`.
- **Conditions**: Only charges if `userApi.purchased == false` (non-paying customer).

#### Error Handling

- **Invalid credentials**: Returns 401 Unauthorized.
- **Upstream API failure**: Returns 500 with upstream error message.
- **Network timeout**: Returns 500 with timeout message.
- **Invalid endpoint**: Returns 500 if upstream returns 404/400.

---

## Model Schemas

### User Schema Fields

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Unique user identifier |
| `username` | String | User's display name |
| `email` | String | Unique email address |
| `password` | String | Bcrypt hashed password |
| `role` | Enum | 'user' (default) or 'provider' |
| `membership` | Boolean | Indicates provider/seller status |
| `profilePicture` | Object | `{url: String, imageId: String}` |
| `verificationCode` | Object | `{email: String|null, phone: String|null}` |
| `verificationCodeExpires` | Object | `{email: Date|null, phone: Date|null}` |
| `cart` | Array | Array of `{apiId: ObjectId}` |
| `wishlist` | Array | Array of `{apiId: ObjectId}` |
| `api` | Array | Array of `{apiId: ObjectId, url: String, purchased: Boolean}` |
| `createdAt` | Date | Account creation timestamp |
| `updatedAt` | Date | Last update timestamp |

### Provider Schema Fields

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Unique provider identifier |
| `username` | String | Provider/company name |
| `email` | String | Unique email address |
| `password` | String | Bcrypt hashed password |
| `role` | Enum | 'provider' (default) |
| `membership` | Boolean | Provider status flag |
| `profilePicture` | Object | `{url: String, imageId: String}` |
| `verificationCode` | Object | `{email: String|null, phone: String|null}` |
| `verificationCodeExpires` | Object | `{email: Date|null, phone: Date|null}` |
| `subscriptionPlan` | String | 'free', 'pro', or 'enterprise' |
| `apiCreated` | Array | Array of `{apiId: ObjectId, purchased: Boolean}` |
| `activityLogs` | Array | Array of `{action: String, timestamp: Date}` |
| `isVerified` | Object | `{email: Boolean, phone: Boolean}` |
| `createdAt` | Date | Account creation timestamp |
| `updatedAt` | Date | Last update timestamp |

### API Schema Fields

| Field | Type | Description |
|-------|------|-------------|
| `_id` | ObjectId | Unique API identifier |
| `providerId` | ObjectId | Reference to provider |
| `name` | String | API name/title |
| `baseUrl` | String | Provider's API base URL |
| `status` | String | 'active' or 'inactive' |
| `apiKeys` | Array | Array of `{consumerId, key, apiPassword, status}` |
| `usageLogs` | Array | Array of `{apiKey, endpoint, status[], latency[], timestamp[]}` |
| `billing` | Object | `{amount: Number, totalRequests: Number}` |
| `createdAt` | Date | API creation timestamp |
| `updatedAt` | Date | Last update timestamp |

---

## Implementation Checklist

### Security Improvements (HIGH PRIORITY)

- [ ] **Password Hashing**: Ensure all passwords use bcrypt (already done).
- [ ] **API Key Storage**: Consider encrypting API keys at rest.
- [ ] **Password Verification**: Use bcrypt.compare() for all password checks.
- [ ] **Verification Codes**: Hash verification codes before storage, add expiry.
- [ ] **Rate Limiting**: Add rate limiting to auth endpoints (login, codegen).
- [ ] **HTTPS Only**: Ensure all endpoints use HTTPS in production.
- [ ] **CORS Configuration**: Restrict CORS origins to trusted domains.
- [ ] **Input Validation**: Add Joi/express-validator to all endpoints.

### Status Code Standardization (MEDIUM PRIORITY)

- [ ] `GET /userDetail`: Change from 201 to 200
- [ ] `GET /providerDetail`: Change from 201 to 200
- [ ] `GET /codegen`: Change from 201 to 200
- [ ] `GET /providerCodegen`: Change from 201 to 200
- [ ] `DELETE /userDelete`: Change from 201 to 204
- [ ] `DELETE /providerDelete`: Change from 201 to 204
- [ ] Invalid requests returning 201: Change to 400
- [ ] Unauthorized access: Use 403 Forbidden instead of 404

### Feature Enhancements (MEDIUM PRIORITY)

- [ ] **Soft Delete**: Implement 30-day grace period for account deletion.
- [ ] **Email Verification**: Send verification codes via email, don't return in API.
- [ ] **API Usage Dashboard**: Create endpoint to view API usage statistics.
- [ ] **Subscription Plans**: Implement tiered subscription models for providers.
- [ ] **API Documentation**: Auto-generate API docs from OpenAPI/Swagger.
- [ ] **Webhook Support**: Allow providers to register webhooks for events.
- [ ] **Analytics**: Dashboard showing request trends, peak usage times, etc.

### Testing (MEDIUM PRIORITY)

- [ ] **Unit Tests**: Write tests for all controller methods.
- [ ] **Integration Tests**: Test full workflows (register → login → use API).
- [ ] **Security Tests**: Test rate limiting, auth bypass attempts, injection attacks.
- [ ] **Load Tests**: Test system under high concurrent load.

---

## Example Complete User Journey

### Journey: User Registers, Discovers API, Uses It

```
1. User Registration:
   POST /api/user/userRegister
   { username: "alice", email: "alice@example.com", password: "SecurePass!" }
   ↓
   Response: 201 Created, apiProviderToken cookie set

2. User Discovers APIs:
   POST /api/apiGen/getApi (with auth cookie)
   { status: "active" }
   ↓
   Response: List of available APIs from various providers

3. User Purchases API Access:
   GET /api/apiGen/setApi/645a1f2c3d5e6f7g8h9i0j1k
   { providerApiId: "645c3f4c5d6e7f8g9h0i1j2k" }
   ↓
   Response: { apiKey: "ABC...MN", apiPassword: "XyZ..." }

4. User Calls API Through Marketplace:
   POST /api/apiGen/apiRequest/weather/current?city=London
   Headers: {
     api_provide_key: "ABC...MN",
     api_provide_password: "XyZ..."
   }
   ↓
   Response: Weather data from provider's API

5. Usage is Tracked:
   - Logged to InfluxDB
   - Billing tracked if over 500 requests
   - Provider can view analytics
```

---

## Security Considerations

### Current Vulnerabilities

1. **Plaintext Password Comparison**: Some endpoints compare plaintext passwords.
2. **Verification Codes Exposed**: Codes returned in API responses.
3. **No Rate Limiting**: Endpoints can be brute-forced.
4. **Insufficient Input Validation**: Missing field validation.
5. **Hard Deletes**: No recovery for deleted data.

### Recommended Mitigations

1. Use bcrypt.compare() for all password verification.
2. Send codes via email, store hashed versions with expiry.
3. Implement rate limiting using express-rate-limit.
4. Add comprehensive input validation with Joi/validator.
5. Implement soft deletes with 30-day grace periods.
6. Add HTTPS, secure cookies, CSRF protection.
7. Implement request signing for API requests.
8. Add IP whitelisting for sensitive operations.

---

## Rate Limiting Recommendations

```javascript
// Auth endpoints: max 5 attempts per 15 minutes per IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5
});

// Codegen endpoints: max 3 attempts per hour per user
const codegenLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 3,
  keyGenerator: (req) => req.id
});

// API request endpoints: max 1000 per hour per key
const apiRequestLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 1000,
  keyGenerator: (req) => req.headers['api_provide_key']
});
```

---

