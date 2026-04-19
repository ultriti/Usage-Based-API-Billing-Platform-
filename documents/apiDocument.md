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
