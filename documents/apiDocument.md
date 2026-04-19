# User API Reference

This document describes the user-related HTTP endpoints implemented in the backend and how to call them: request shape, required fields, success and error responses, authentication behavior, example requests and example JSON responses.

Source code: [backend/router/user.router.js](backend/router/user.router.js) and [backend/controller/user.controller.js](backend/controller/user.controller.js)

## Authentication (how the API currently handles it)

- The app issues a JWT in an HTTP-only cookie named `apiProviderToken` on successful register/login. Cookie properties set in code: `httpOnly: true`, `sameSite: 'none'`, `secure: true`, expires ~30 days.
- Endpoints that require authentication use the middleware named `isAunthenticate` (see router). The middleware is expected to read the cookie, verify the JWT and populate `req.id` with the authenticated user id.

Note: the code stores and compares passwords in plaintext — this is insecure. See "Recommendations" at the end for fixes.

---

## Common request/response conventions

- Content-Type: `application/json` for request bodies.
- Successful responses typically include `message` and `success: true`. User objects are returned under `user` or `userDetail`. Error responses include `message`, `success: false` and sometimes `error`.
- Recommendation: Use consistent HTTP status codes (200 for OK, 201 for created, 400 for client errors, 401/403 for auth issues, 404 for not found, 500 for server errors).

---

## Endpoints

### POST /userRegister

- Purpose: Register a new user and set a session JWT cookie.
- Public: No authentication required.

Request body (JSON):

- `username` (string, required) — unique username.
- `email` (string, required) — unique email address.
- `password` (string, required) — plain password in current implementation (must be hashed in production).
- `role` (string, optional) — ignored by controller; controller sets `role` to `consumer` on creation.

Example request:

```json
POST /userRegister
Content-Type: application/json

{
  "username": "alice",
  "email": "alice@example.com",
  "password": "P@ssw0rd!"
}
```

Successful response (implemented):

HTTP 201 Created

```json
{
  "message": "User registered successfully",
  "success": true,
  "user": {
    "_id": "645b1f...",
    "username": "alice",
    "email": "alice@example.com",
    "profilePicture": { "url": "", "imageId": "" },
    "isVerified": { "email": false, "phone": false },
    "role": "consumer",
    "api": [],
    "cart": [],
    "wishlist": [],
    "membership": false,
    "createdAt": "2026-04-19T12:34:56.000Z",
    "updatedAt": "2026-04-19T12:34:56.000Z"
  }
}
```

Behavior note: The controller sets a cookie `apiProviderToken` (JWT) in the response. The current controller returns the created user document directly — in production you must remove `password` before returning.

Error responses:

- HTTP 400 — missing fields:

```json
{ "message": "All fields are required", "success": false }
```

- HTTP 400 — user exists:

```json
{ "message": "User already exists", "success": false }
```

- HTTP 500 — internal server error (example):

```json
{ "message": "internal server error", "error": "<error message>", "success": false }
```

---

### POST /userLogin

- Purpose: Authenticate a user, set JWT cookie and return the user.
- Public: No authentication required.

Request body (JSON):

- `email` (string, required)
- `password` (string, required)

Example request:

```json
POST /userLogin
Content-Type: application/json

{
  "email": "alice@example.com",
  "password": "P@ssw0rd!"
}
```

Successful response (implemented):

HTTP 200 OK

```json
{
  "message": "User logged in successfully",
  "success": true,
  "user": {
    "_id": "645b1f...",
    "username": "alice",
    "email": "alice@example.com",
    "role": "consumer",
    "isVerified": { "email": false, "phone": false },
    "createdAt": "2026-04-19T12:34:56.000Z"
  }
}
```

Behavior note: The controller compares `user.password` to provided `password` as plain text; this must be replaced with secure hashed password verification. A cookie `apiProviderToken` (JWT) is set on success.

Error responses:

- HTTP 400 — user not found:

```json
{ "message": "User not found", "success": false }
```

- HTTP 400 — invalid credentials:

```json
{ "message": "Invalid credentials", "success": false }
```

---

### GET /userLogout

- Purpose: Clear the auth cookie and log the user out.
- Public: No authentication required to call; it clears the cookie server-side.

Example request:

```
GET /userLogout
```

Successful response:

HTTP 200 OK

```json
{ "msg": "Logged out successfully" }
```

Error response (implemented):

HTTP 400

```json
{ "msg": "user cant logout " }
```

---

### GET /userDetail

- Purpose: Return details for the authenticated user.
- Protected: Requires authentication via `isAunthenticate` middleware which must set `req.id`.

Request: no body. The middleware must provide `req.id`.

Successful response (implemented):

HTTP 201 (controller uses 201; recommended to return 200)

```json
{
  "message": "user found",
  "success": true,
  "userDetail": {
    "_id": "645b1f...",
    "username": "alice",
    "email": "alice@example.com",
    "profilePicture": { "url": "", "imageId": "" },
    "role": "consumer",
    "isVerified": { "email": false, "phone": false }
  }
}
```

Error responses:

- HTTP 404 — user not found:

```json
{ "messgae": "user not found! ", "success": false }
```

- HTTP 500 — internal server error.

---

### PUT /userUpdate

- Purpose: Update authenticated user's profile fields.
- Protected: Requires authentication.

Request body (JSON) — all fields optional, only provided fields are updated:

- `username` (string) — new username
- `profileUrl` (string) — new `profilePicture.url`
- `ProfileImgId` (string) — new `profilePicture.imageId`

Example request:

```json
PUT /userUpdate
Content-Type: application/json

{
  "username": "alice_w",
  "profileUrl": "https://cdn.example.com/alice.jpg",
  "ProfileImgId": "img-123456"
}
```

Successful response (implemented):

HTTP 200 OK

```json
{
  "message": "user detail updated successfully",
  "success": true,
  "userDetail": {
    "_id": "645b1f...",
    "username": "alice_w",
    "email": "alice@example.com",
    "profilePicture": { "url": "https://cdn.example.com/alice.jpg", "imageId": "img-123456" }
  }
}
```

Error responses:

- HTTP 404 — user not found:

```json
{ "messgae": "user not found! ", "success": false }
```

- HTTP 500 — internal server error.

---

## Example curl flows

Register and store cookie (curl will save cookies into `cookies.txt`):

```bash
curl -c cookies.txt -H "Content-Type: application/json" -d '{"username":"alice","email":"alice@example.com","password":"P@ssw0rd!"}' http://localhost:3000/userRegister
```

Login and reuse cookie:

```bash
curl -c cookies.txt -b cookies.txt -H "Content-Type: application/json" -d '{"email":"alice@example.com","password":"P@ssw0rd!"}' http://localhost:3000/userLogin

curl -b cookies.txt http://localhost:3000/userDetail
```

Logout:

```bash
curl -b cookies.txt http://localhost:3000/userLogout
```

---

## Recommendations & To-Do (important)

- Hash and salt passwords (bcrypt or argon2). Never store or compare plaintext passwords.
- Do not return the `password` field in API responses. Use schema transforms to remove it.
- Normalize and validate `email` and `username` inputs (format, length, character set).
- Standardize HTTP status codes (use 200 for OK, 201 for created, 401/403 for auth issues, etc.).
- Use consistent endpoint naming (`/users`, `/auth/login`, `/auth/register`) and REST conventions.
- Make the auth middleware robust: check cookie, verify token, set `req.id` and `req.user` and return 401 when invalid.
- Add request body validation (Joi, express-validator) to produce clear client errors.

---

If you want, I can implement the recommended fixes: hash passwords, remove password from responses, add validation, and add consistent status codes. Also I can convert these routes to more RESTful paths and add unit tests.

---

## Additions from recent code changes (2026-04-19)

The codebase was updated to add /modify several user routes in [backend/router/user.router.js](backend/router/user.router.js) and [backend/controller/user.controller.js]. The documentation below reflects the endpoints as implemented, notes known issues, and gives production recommendations.

### GET /codegen

- Path: `GET /codegen`
- Auth: Protected — requires the `apiProviderToken` cookie and `isAunthenticate` middleware.
- Purpose: Generate a 6-digit numeric verification code, persist it to the authenticated user's `verificationCode.email` field, and (currently) return the code in the response.

Behavior (implemented):
- The controller function uses `crypto.randomInt(100000, 999999)` to generate a numeric string, saves it as `userDetail.verificationCode.email`, and returns HTTP 201 with the code.

Example request (curl):

```bash
curl -b cookies.txt http://localhost:3000/codegen
```

Example implemented response:

HTTP 201

```json
{ "message": "code gen", "code": "123456" }
```

Security note (recommended):
- Do NOT return verification codes in API responses in production. Instead, send the code to the user's email or phone and return an acknowledgement (200/202). Store codes with an expiry and/or hashed form to avoid disclosure if the DB is leaked.

---

### GET /promoteUser/:userId

- Path: `GET /promoteUser/:userId`
- Auth: Protected — requires `isAunthenticate` and the auth cookie.
- Purpose: Promote the authenticated user to a provider/seller membership.

Behavior (implemented):
- The controller compares `req.params.userId` with `req.id` (the authenticated id); if they differ, it returns an error. If they match, it attempts to set the user's membership and save the document. The current implementation calls `userDetail.membership(true)` which is a bug — it should assign `userDetail.membership = true` (or update a `role` field).

Example request (curl):

```bash
curl -b cookies.txt http://localhost:3000/promoteUser/645b1f...
```

Example implemented response (current):

HTTP 201

```json
{
  "messgae": "you are promoted to provider/seller",
  "success": true,
  "userDetail": { /* user document */ }
}
```

Recommendations:
- Use `PUT` or `POST` rather than `GET` for state changes.
- Fix the assignment to `userDetail.membership = true` and/or set `userDetail.role = 'provider'` depending on intended semantics.
- Return `403 Forbidden` for unauthorized attempts (instead of 404), and `200/204` on successful update.

---

### DELETE /userDelete

- Path: `DELETE /userDelete`
- Auth: Protected — requires `isAunthenticate`.
- Purpose: Permanently delete the authenticated user's account after verifying ownership via password or a previously generated email verification code.

Request body (JSON): provide at least one of the following:

- `password` (string) — the user's password (in current implementation compared as plain text).
- `emailCode` (string) — the 6-digit email verification code previously generated by `/codegen`.

Behavior (implemented):
- If neither `password` nor `emailCode` is provided the controller returns HTTP 201 with a message to provide credentials (this should be 400 in production).
- If `password` is provided the controller compares it directly to the stored `userDetail.password` (insecure if passwords are not hashed).
- If `emailCode` is provided the controller checks `userDetail.verificationCode.email` and, on match, clears it and proceeds.
- The current flow saves the user document (clearing code if used) then calls `userModel.findByIdAndDelete(id)` and returns HTTP 201 with success message.

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

