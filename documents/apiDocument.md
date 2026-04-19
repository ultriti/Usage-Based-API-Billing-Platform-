# ---> User API Reference
---
This document describes the user-related HTTP endpoints implemented in the backend and how to call them: request/response shapes, authentication behavior, example requests, and recommended production changes.

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

### POST /userRegister

- Purpose: create a user and set an auth cookie.
- Public: no authentication required.

Request body (JSON): `username`, `email`, `password` (required).

Example request:

```json
{
  "username": "alice",
  "email": "alice@example.com",
  "password": "P@ssw0rd!"
}
```

Successful response (implemented): `201 Created` with the created user (the controller currently removes `password` before returning but verify schema transforms).

Errors: `400` for missing fields or existing user, `500` for server errors.

---

### POST /userLogin

- Purpose: authenticate a user, set `apiProviderToken` cookie and return user details.
- Public: no authentication required.

Request body: `{ "email": string, "password": string }`.

Notes: the controller currently uses a `comparePassword` method; ensure passwords are stored hashed and compared securely.

---

### GET /userLogout

- Purpose: clear the `apiProviderToken` cookie and end session.

Successful response: `200 OK` with a logout confirmation.

---

### GET /userDetail

- Purpose: return the authenticated user's profile.
- Protected: `isAunthenticate` required (must set `req.id`).

Successful response: `200 OK` (controller currently returns `201`).

---

### PUT /userUpdate

- Purpose: update profile fields for the authenticated user.
- Request body may include `username`, `profileUrl`, `ProfileImgId` (only provided fields are updated).

Successful response: `200 OK` with updated `userDetail`.

---

### GET /codegen — Verification code generation

- Path: `/codegen`
- Auth: protected — requires `isAunthenticate` and a valid session cookie.

Behavior (current implementation):

- The controller generates a 6-digit numeric code using `crypto.randomInt(100000, 999999)`, saves that value to `user.verificationCode.email`, and currently returns the code in the JSON response (for debugging).

Recommended production behavior:

1. Generate a time-limited verification code (store either a hashed code and expiry or the code with an expiry timestamp).
2. Send the code to the user's email address using a transactional email provider (SendGrid, SES, Mailgun, SMTP via Nodemailer).
3. Return an acknowledgement response `200 OK` or `202 Accepted` (do not include the code in the API response).

Example safe flow (recommended):

1. Client calls `GET /codegen` (authenticated).
2. Server generates code, sends email to `user.email`, stores hash + expiry on the user record, and returns:

```json
{ "message": "Verification code sent to the registered email address", "success": true }
```

If you currently rely on the controller's debug response, remove that before shipping.

Sample email template (suggestion):

```
Subject: Your verification code

Hi {username},

Use the following code to verify your email: 123456

This code expires in 15 minutes.

If you did not request this, ignore this email.
```

---

### GET /promoteUser/:userId

- Path currently implemented as `GET /promoteUser/:userId` (protected).
- Intended purpose: promote the authenticated user to a provider/seller (membership flag or role change).

Implementation issues observed:

- The controller compares `req.params.userId` to `req.id` and returns a 404 on mismatch (use `403 Forbidden` instead).
- The code calls `userDetail.membership(true)` which is a bug — it should set `userDetail.membership = true` or update `role`.
- Use a state-changing verb (`PUT` or `POST`) for this operation instead of `GET`.

---

### DELETE /userDelete

- Path: `/userDelete` (protected). Purpose: permanently delete the authenticated user's account after verification.
- Accepted verification methods (as implemented): `password` or `emailCode` (from `/codegen`).

Implementation notes:

- If neither `password` nor `emailCode` is provided the controller returns `201` with an error message — this should be `400 Bad Request`.
- The controller compares plaintext `password` to stored `user.password` — this is insecure. Use hashed password verification.
- When `emailCode` verification is used, clear the code and proceed to deletion; in production prefer a soft-delete pattern or retention policy.

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

---
# ---> Provider API Reference
---

This document describes the provider-related HTTP endpoints implemented in the backend and how to call them: request/response shapes, authentication behavior, example requests, and recommended production changes.

Source code: [backend/router/provider.route.js](backend/router/provider.route.js) and [backend/controller/provider.controller.js](backend/controller/provider.controller.js)

## Authentication

- The app issues a JWT in an HTTP-only cookie named `apiProviderToken` on successful register/login. Cookie properties set in code: `httpOnly: true`, `sameSite: 'none'`, `secure: true`, expires ~30 days.
- Protected endpoints use the `isProviderAuthenticate` middleware. The middleware is expected to validate the cookie/JWT and populate `req.id` with the authenticated provider's id.

Note: the current implementation contains several insecure patterns (returning verification codes). See the Recommendations section for remediation steps.

---

## Conventions

- Requests: `Content-Type: application/json` for JSON bodies.
- Responses: success responses include `message` and `success: true`. Error responses include `message` and `success: false` and may include `error` for diagnostics.
- Use consistent HTTP status codes: `200` for OK, `201` for creation, `400` for bad request, `401/403` for auth issues, `404` for not found, `500` for server error.

---

## Routes (summary)

- POST `/providerRegister` — register a new provider (public)
- POST `/providerLogin` — authenticate and set session cookie (public)
- GET `/providerLogout` — clear session cookie (public)
- GET `/providerDetail` — get authenticated provider details (protected)
- PUT `/providerUpdate` — update authenticated provider profile (protected)
- GET `/providerCodegen` — generate verification code (protected)
- DELETE `/providerDelete` — delete authenticated provider after verification (protected)

Detailed descriptions follow.

---

### POST /providerRegister

- Purpose: create a provider and set an auth cookie. If a user with the same email exists and is verified, promote to provider.
- Public: no authentication required.

Request body (JSON): `username`, `email`, `password` (required). Username optional if user exists.

Example request:

```json
{
  "username": "bob",
  "email": "bob@example.com",
  "password": "P@ssw0rd!"
}
```

Successful response (implemented): `201 Created` with the created provider.

Errors: `400` for missing fields or existing provider, `500` for server errors.

---

### POST /providerLogin

- Purpose: authenticate a provider, set `apiProviderToken` cookie and return provider details.
- Public: no authentication required.

Request body: `{ "email": string, "password": string }`.

Notes: uses `comparePassword` method; passwords are hashed.

---

### GET /providerLogout

- Purpose: clear the `apiProviderToken` cookie and end session.

Successful response: `200 OK` with a logout confirmation.

---

### GET /providerDetail

- Purpose: return the authenticated provider's profile.
- Protected: `isProviderAuthenticate` required (must set `req.id`).

Successful response: `201 OK` (should be `200`).

---

### PUT /providerUpdate

- Purpose: update profile fields for the authenticated provider.
- Request body may include `username`, `profileUrl`, `ProfileImgId` (only provided fields are updated).

Successful response: `200 OK` with updated `providerDetail`.

---

### GET /providerCodegen — Verification code generation

- Path: `/providerCodegen`
- Auth: protected — requires `isProviderAuthenticate` and a valid session cookie.

Behavior (current implementation):

- The controller generates a 6-digit numeric code using `crypto.randomInt(100000, 999999)`, saves that value to `provider.verificationCode.email`, and currently returns the code in the JSON response (for debugging).

Recommended production behavior: same as user, send via email.

---

### DELETE /providerDelete

- Path: `/providerDelete` (protected). Purpose: permanently delete the authenticated provider's account after verification.
- Accepted verification methods (as implemented): `password` or `emailCode` (from `/providerCodegen`).

Implementation notes:

- If neither `password` nor `emailCode` is provided the controller returns `201` with an error message — this should be `400 Bad Request`.
- The controller compares plaintext `password` to stored `provider.password` — this is insecure. Use hashed password verification.
- When `emailCode` verification is used, clear the code and proceed to deletion; in production prefer a soft-delete pattern or retention policy.

---

## Email verification flow (recommended)

Same as user.

---

## Model notes

- `profilePicture`: `{ url: String, imageId: String }`
- `verificationCode`: `{ email: Number|null, phone: Number|null }` — store codes and expiry metadata.
- `membership`: Boolean — indicates provider status.
- `subscriptionPlan`: enum ['free', 'pro', 'enterprise']
- `apiCreated`: array of { apiId: ObjectId, purchased: Boolean }
- `activityLogs`: array of { action: String, timestamp: Date }

---

## Implementation issues & recommended fixes

1. Remove verification codes from API responses; send them by email and store a hashed code + expiry.
2. Standardize HTTP status codes across controllers (use `200`/`201`/`400`/`401`/`403`/`404`/`500`).
3. Add request validation (Joi, express-validator) and more precise error messages.
4. Consider a soft-delete strategy for `DELETE /providerDelete` and require re-authentication for destructive actions.

---

## Provider schema updates (from `provider.model.js`)

Current fields of interest:

- `profilePicture` (object) — `{ url: String, imageId: String }` — stores a public URL and external image id.
- `verificationCode` (object) — `{ email: Number|null, phone: Number|null }` — stores one-time numeric codes for verification workflows.
- `verificationCodeExpires` (object) — `{ email: Date|null, phone: Date|null }` — expiry timestamps.
- `membership` (Boolean) — flags provider membership status.
- `subscriptionPlan` (String) — enum ['free', 'pro', 'enterprise']
- `apiCreated` (array) — array of `{ apiId: ObjectId, purchased: Boolean }` references.
- `activityLogs` (array) — array of `{ action: String, timestamp: Date }`
- `role` enum includes `'provider'` as default.

Stored document example (partial):

```json
{
  "_id": "645b1f...",
  "username": "bob",
  "email": "bob@example.com",
  "profilePicture": { "url": "", "imageId": "" },
  "verificationCode": { "email": 123456, "phone": null },
  "membership": false,
  "role": "provider"
}
```

Sanitized API response recommendation: exclude `password` and any raw verification codes. Use `toJSON` transforms to map `_id` to `id`, drop `__v`, and remove secrets.

---

## Implementation issues observed (action items)

1. `providerCodegen` currently returns the verification code in the response — send codes via email/SMS and never echo them to API clients.
2. `providerDelete` compares plaintext passwords. Use hashed password verification.
3. Status codes are inconsistent (many 201 responses for non-creation actions). Standardize to `200`/`204`/`400`/`401`/`403`/`404`/`500` as appropriate.

---

If you want, I can implement these fixes (remove verification codes from responses, add validation, and update status codes). Tell me which items to prioritize and I will update the code and tests.

