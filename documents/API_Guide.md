# API Guide - User & Provider Documentation

This document describes all the HTTP endpoints for the API Platform, including user authentication, provider management, and API marketplace features.

---

## Getting Started

The API uses JWT tokens stored in HTTP-only cookies for authentication. When you register or login, you'll receive an `apiProviderToken` cookie that's automatically sent with subsequent requests.

Key things to know:
- Content-Type: application/json
- Success responses include `message` and `success: true`
- Error responses include `message` and `success: false`
- HTTP status codes: 200 (OK), 201 (Created), 400 (Bad Request), 401 (Unauthorized), 404 (Not Found), 500 (Server Error)

---

# USER ENDPOINTS

## Register a New User

POST /api/user/userRegister

Public endpoint (no authentication needed).

Request:
```json
{
  "username": "alice",
  "email": "alice@example.com",
  "password": "P@ssw0rd!"
}
```

Success Response (201 Created):
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
    "profilePicture": {"url": "", "imageId": ""},
    "verificationCode": {"email": null, "phone": null},
    "cart": [],
    "wishlist": [],
    "api": [],
    "createdAt": "2026-04-20T10:30:00Z",
    "updatedAt": "2026-04-20T10:30:00Z"
  }
}
```

Cookie: apiProviderToken (HTTP-only, expires 30 days)

Errors:
- 400: "All fields are required" (missing username, email, or password)
- 400: "User already exists" (email already registered)
- 500: Database or server error

---

## Login User

POST /api/user/userLogin

Public endpoint.

Request:
```json
{
  "email": "alice@example.com",
  "password": "P@ssw0rd!"
}
```

Success Response (200 OK):
```json
{
  "message": "User logged in successfully",
  "success": true,
  "user": {
    "_id": "645a1f2c3d5e6f7g8h9i0j1k",
    "username": "alice",
    "email": "alice@example.com",
    "role": "user",
    "membership": false
  }
}
```

Errors:
- 400: "User not found"
- 400: "Invalid credentials"
- 500: Server error

Note: Passwords are hashed with bcrypt. JWT token includes userId, email, and role.

---

## Logout User

GET /api/user/userLogout

Public endpoint.

Success Response (200 OK):
```json
{
  "msg": "Logged out successfully"
}
```

The apiProviderToken cookie is cleared.

---

## Get User Profile

GET /api/user/userDetail

Protected endpoint (authentication required).

Response (200 OK):
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
    "profilePicture": {"url": "https://example.com/profile.jpg", "imageId": "img_12345"},
    "verificationCode": {"email": null, "phone": null},
    "cart": [],
    "wishlist": [],
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

Errors:
- 404: "user not found!"
- 401: Authentication required
- 500: Server error

---

## Update User Profile

PUT /api/user/userUpdate

Protected endpoint.

Request:
```json
{
  "username": "alice_updated",
  "profileUrl": "https://example.com/alice-new.jpg",
  "ProfileImgId": "img_new_12345"
}
```

All fields are optional. Only provided fields are updated.

Success Response (200 OK):
```json
{
  "message": "user detail updated successfully",
  "success": true,
  "userDetail": {
    "_id": "645a1f2c3d5e6f7g8h9i0j1k",
    "username": "alice_updated",
    "email": "alice@example.com",
    "profilePicture": {
      "url": "https://example.com/alice-new.jpg",
      "imageId": "img_new_12345"
    },
    "updatedAt": "2026-04-20T12:00:00Z"
  }
}
```

Errors:
- 404: "user not found!"
- 500: Server error

---

## Generate Verification Code

GET /api/user/codegen

Protected endpoint.

Current Response (201 Created):
```json
{
  "message": "code gen",
  "code": "123456"
}
```

How it works:
- Generates a 6-digit code (e.g., 100000-999999)
- Saves it to user.verificationCode.email
- Currently returns the code in response (for testing)

Production recommendation:
- Send code via email instead of returning it
- Hash the code before storage
- Add 15-minute expiry timestamp
- Return only acknowledgement message

```json
{
  "message": "Verification code sent to your registered email address",
  "success": true
}
```

Errors:
- 401: Authentication required
- 500: Server error

Security note: Verification codes should never be returned in API responses in production. They should be sent via email only.

---

## Promote User to Provider

GET /api/user/promoteUser/:userId

Protected endpoint.

Parameter:
- userId (must match authenticated user's ID)

Example: GET /api/user/promoteUser/645a1f2c3d5e6f7g8h9i0j1k

Success Response (201 Created):
```json
{
  "message": "you are promoted to provider/seller",
  "success": true,
  "userDetail": {
    "_id": "645a1f2c3d5e6f7g8h9i0j1k",
    "username": "alice",
    "membership": true,
    "updatedAt": "2026-04-20T13:15:00Z"
  }
}
```

Errors:
- 404: "you are not authorized" (userId doesn't match authenticated user)
- 404: "user not found!"
- 500: Server error

Note: This should use PUT/POST instead of GET for state-changing operations.

---

## Delete User Account

DELETE /api/user/userDelete

Protected endpoint.

Request (password verification):
```json
{
  "password": "P@ssw0rd!"
}
```

Or (email code verification):
```json
{
  "emailCode": "123456"
}
```

Provide either password or emailCode.

Success Response (201 Created):
```json
{
  "message": "user deleted successfully!",
  "success": true
}
```

Errors:
- 400: "fill all the credentials" (neither password nor emailCode provided)
- 400: "invalid credentials" (wrong password or wrong code)
- 500: Server error

Security issues to fix:
- Currently compares plaintext password to stored value (should use bcrypt.compare)
- Should return 204 No Content for deletion, not 201
- Should implement soft-delete with 30-day grace period
- Should require fresh authentication for destructive operations

---

# PROVIDER ENDPOINTS

## Register Provider

POST /api/provider/providerRegister

Public endpoint.

Request:
```json
{
  "username": "bob_provider",
  "email": "bob@provider.com",
  "password": "SecurePass123!"
}
```

Success Response (201 Created):
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
    "subscriptionPlan": "free",
    "apiCreated": [],
    "createdAt": "2026-04-20T10:30:00Z"
  }
}
```

Errors:
- 400: "All fields are required"
- 400: "provider already exists"
- 400: "email not verified!" (if promoting from user account)
- 500: Server error

Note: If email matches a verified user, that user is promoted to provider. Otherwise, a new provider account is created.

---

## Login Provider

POST /api/provider/providerLogin

Public endpoint.

Request:
```json
{
  "email": "bob@provider.com",
  "password": "SecurePass123!"
}
```

Success Response (200 OK):
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
    "subscriptionPlan": "pro",
    "apiCreated": [
      {"apiId": "645c3f4c5d6e7f8g9h0i1j2k", "purchased": true}
    ],
    "createdAt": "2026-04-20T10:30:00Z"
  }
}
```

Errors:
- 400: "provider not found"
- 400: "Invalid credentials"
- 500: Server error

---

## Logout Provider

GET /api/provider/providerLogout

Public endpoint.

Response (200 OK):
```json
{
  "msg": "Logged out successfully"
}
```

---

## Get Provider Profile

GET /api/provider/providerDetail

Protected endpoint (provider authentication required).

Response (200 OK):
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
    "profilePicture": {"url": "https://example.com/bob.jpg", "imageId": "img_bob_123"},
    "subscriptionPlan": "pro",
    "apiCreated": [
      {"apiId": "645c3f4c5d6e7f8g9h0i1j2k", "purchased": true}
    ],
    "activityLogs": [
      {"action": "API_CREATED", "timestamp": "2026-04-20T14:30:00Z"},
      {"action": "PROFILE_UPDATED", "timestamp": "2026-04-20T12:15:00Z"}
    ],
    "createdAt": "2026-04-15T08:00:00Z"
  }
}
```

Errors:
- 404: "provider not found!"
- 401: Authentication required
- 500: Server error

---

## Update Provider Profile

PUT /api/provider/providerUpdate

Protected endpoint.

Request:
```json
{
  "username": "bob_provider_updated",
  "profileUrl": "https://example.com/bob-updated.png",
  "ProfileImgId": "img_bob_new_456"
}
```

All fields are optional.

Success Response (200 OK):
```json
{
  "message": "provider detail updated successfully",
  "success": true,
  "providerDetail": {
    "_id": "645b2f3c4d5e6f7g8h9i0j1k",
    "username": "bob_provider_updated",
    "profilePicture": {
      "url": "https://example.com/bob-updated.png",
      "imageId": "img_bob_new_456"
    },
    "updatedAt": "2026-04-20T16:00:00Z"
  }
}
```

Errors:
- 404: "provider not found!"
- 500: Server error

---

## Generate Provider Verification Code

GET /api/provider/providerCodegen

Protected endpoint.

Current Response (201 Created):
```json
{
  "message": "code gen",
  "code": "654321"
}
```

Same as user codegen - generates a 6-digit code.

Production response should be:
```json
{
  "message": "Verification code sent to your registered email",
  "success": true
}
```

Errors:
- 401: Authentication required
- 500: Server error

---

## Delete Provider Account

DELETE /api/provider/providerDelete

Protected endpoint.

Request (password):
```json
{
  "password": "SecurePass123!"
}
```

Or (email code):
```json
{
  "emailCode": "654321"
}
```

Success Response (201 Created):
```json
{
  "message": "provider deleted successfully!",
  "success": true
}
```

Errors:
- 400: "fill all the credentials"
- 400: "invalid credentials"
- 500: Server error

Security notes: Same issues as user deletion. Use bcrypt.compare for password verification, return 204 instead of 201, implement soft-delete.

---

# API MARKETPLACE ENDPOINTS

## Create API

POST /api/apiGen/createApi

Protected endpoint (provider authentication required).

Request:
```json
{
  "providerId": "645b2f3c4d5e6f7g8h9i0j1k",
  "name": "Real-time Weather API",
  "baseUrl": "https://api.weather.example.com"
}
```

Success Response (201 Created):
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
    "billing": {"amount": 0, "totalRequests": 0},
    "createdAt": "2026-04-20T10:30:00Z"
  }
}
```

Errors:
- 400: "All fields are required"
- 400: "provider already exists"
- 401: Authentication required
- 500: Server error

Only providers can create APIs.

---

## Discover APIs

POST /api/apiGen/getApi

Protected endpoint (any authenticated user).

Request (optional filters):
```json
{
  "status": "active"
}
```

You can filter by providerId, category, or status.

Success Response (201 Created - should be 200):
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

Errors:
- 401: Authentication required
- 500: Server error

---

## Purchase API Access

GET /api/apiGen/setApi/:consumerId

Protected endpoint.

Parameter: consumerId (your user ID)

Request body:
```json
{
  "providerApiId": "645c3f4c5d6e7f8g9h0i1j2k"
}
```

Success Response (201 Created):
```json
{
  "message": "API purchased successfully",
  "success": true,
  "apiKey": "ABCD1234EFGH5678IJKL9012MN",
  "apiPassword": "XyZ123!@#"
}
```

This returns a 25-character API key and 12-character password. Save these - you'll need them to use the API.

Errors:
- 400: "API not found!"
- 400: "API already purchased!"
- 400: "User not found!"
- 500: Server error

Security note: Password is hashed with bcrypt before storage. The key is stored in plaintext for lookup.

---

## Use API Through Marketplace

POST /api/apiGen/apiRequest/:endpoint

Protected endpoint (authenticated consumer with valid credentials).

Parameter: endpoint (e.g., "/weather/current", "/payment/charge")

Headers required:
- api_provide_key: (from /setApi response)
- api_provide_password: (from /setApi response)

Example:
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

Success Response (201 Created):
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

Errors:
- 401: "please provide the authentication keys!"
- 401: "user not found!"
- 401: "Invalid API key"
- 401: "API key not active"
- 400: "invalid api key credential!"
- 500: Upstream API error

How it works:
1. Validates your API key and password
2. Finds the API associated with the key
3. Constructs request URL: baseUrl + endpoint + query params
4. Forwards request to provider's API
5. Captures response time (latency) and status code
6. Logs metrics to InfluxDB
7. Tracks billing (free tier: 500 requests, then $0.20 per request)
8. Returns provider's response to you

Usage Tracking:
- Each request is logged to InfluxDB with apiId, endpoint, status code, and latency
- Billing accumulates if usage exceeds 500 requests per month
- Only non-paying customers (purchased: false) are charged

---

# WORKFLOWS

## User Registration & Login Flow

1. Call POST /api/user/userRegister with username, email, password
2. Get back user profile and apiProviderToken cookie
3. Cookie is automatically sent with future requests
4. To login later: POST /api/user/userLogin with email and password
5. To logout: GET /api/user/userLogout

## Using an API

1. Register or login as user
2. Call POST /api/apiGen/getApi to discover available APIs
3. Call GET /api/apiGen/setApi/:userId to purchase API access
4. You'll get apiKey and apiPassword
5. Use POST /api/apiGen/apiRequest/:endpoint to call the API
6. Include api_provide_key and api_provide_password headers

## Provider Flow

1. Register as provider via POST /api/provider/providerRegister
2. Create APIs via POST /api/apiGen/createApi
3. Users can discover and purchase access to your APIs
4. Track usage and billing in your provider profile
5. View activity logs and analytics

---

# EMAIL VERIFICATION (RECOMMENDED)

Current implementation returns verification codes in API responses. This should be improved:

How it should work:
1. User calls /codegen
2. Server generates 6-digit code
3. Server hashes the code with bcrypt
4. Server stores hashed code + 15-minute expiry on user record
5. Server sends plaintext code to user's email
6. Server returns only acknowledgement (no code exposed)
7. User receives code via email
8. User provides code when deleting account or during sensitive operations
9. Server compares provided code against stored hash

This prevents codes from being exposed in API responses or network requests.

---

# DATABASE SCHEMAS

User Schema:
- _id: Unique identifier
- username: Display name
- email: Unique email address
- password: Bcrypt hashed
- role: 'user' or 'provider'
- membership: Boolean (provider status)
- profilePicture: {url, imageId}
- verificationCode: {email, phone}
- cart: Array of API IDs
- wishlist: Array of API IDs
- api: Array of purchased APIs with usage tracking
- createdAt, updatedAt: Timestamps

Provider Schema:
- _id: Unique identifier
- username: Company/provider name
- email: Unique email
- password: Bcrypt hashed
- role: 'provider'
- membership: Boolean
- profilePicture: {url, imageId}
- verificationCode: {email, phone}
- subscriptionPlan: 'free', 'pro', or 'enterprise'
- apiCreated: Array of created API IDs
- activityLogs: Array of {action, timestamp}
- isVerified: {email, phone}
- createdAt, updatedAt: Timestamps

API Schema:
- _id: Unique identifier
- providerId: Reference to provider
- name: API name
- baseUrl: Provider's API base URL
- status: 'active' or 'inactive'
- apiKeys: Array of {consumerId, key, apiPassword, status}
- usageLogs: Array of {apiKey, endpoint, status, latency, timestamp}
- billing: {amount, totalRequests}
- createdAt, updatedAt: Timestamps

---

# IMPROVEMENTS NEEDED

Security (High Priority):
- Use bcrypt.compare() for all password verifications
- Hash verification codes before storage, add expiry timestamps
- Add rate limiting to auth and codegen endpoints
- Validate all input with Joi or express-validator
- Implement HTTPS only in production
- Restrict CORS to trusted domains

Status Codes (Medium Priority):
- GET /userDetail should return 200, not 201
- GET /providerDetail should return 200, not 201
- DELETE endpoints should return 204 No Content, not 201
- Bad requests should return 400, not 201
- Unauthorized should return 403, not 404

Features (Medium Priority):
- Implement soft-delete with 30-day grace period
- Send verification codes via email, not API
- Create API usage dashboard endpoint
- Implement subscription tiers for providers
- Add analytics and usage reports
- Add webhook support for events

Testing:
- Unit tests for all controllers
- Integration tests for full workflows
- Security tests for auth bypass and injection attacks
- Load tests for concurrent requests

---

# QUICK START EXAMPLES

Register and Login:
```
POST /api/user/userRegister
{
  "username": "john",
  "email": "john@example.com",
  "password": "SecurePass123"
}

POST /api/user/userLogin
{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

View Your Profile:
```
GET /api/user/userDetail
(Cookie: apiProviderToken)
```

Discover and Use an API:
```
POST /api/apiGen/getApi
{}

GET /api/apiGen/setApi/{YOUR_USER_ID}
{
  "providerApiId": "{API_ID}"
}

POST /api/apiGen/apiRequest/some/endpoint
Headers: {
  "api_provide_key": "{KEY_FROM_SETUP}",
  "api_provide_password": "{PASSWORD_FROM_SETUP}"
}
```

Create an API (as Provider):
```
POST /api/apiGen/createApi
{
  "providerId": "{YOUR_PROVIDER_ID}",
  "name": "My API",
  "baseUrl": "https://my-api.com"
}
```

---

That's it! This documentation covers all the endpoints and how to use them. For questions or issues, check the error messages returned - they usually explain what went wrong.
