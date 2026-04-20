# Model Reference — backend/model

Last updated: 2026-04-19 (revisions applied)

## Purpose

This document summarizes the Mongoose schemas used by the backend, highlights important fields and helper methods, and records security and operational guidance for verification flows, API keys, and usage logging.

- Audience: backend developers and integrators.
- Primary sources: [backend/model/user.model.js](backend/model/user.model.js), [backend/model/provider.model.js](backend/model/provider.model.js), [backend/model/api.model.js](backend/model/api.model.js).

---

## Quick type mapping (Mongoose → MongoDB → JSON)

- `String` → `String` → JSON string
- `Number` → `Number` → JSON number
- `Boolean` → `Boolean` → JSON boolean
- `Date` → `ISODate` → JSON ISO 8601 string (example: "2026-04-19T12:34:56.000Z")
- `Schema.Types.ObjectId` → `ObjectId` → JSON hex string
- Arrays / subdocuments → JSON arrays/objects

Note: prefer storing monetary values as integer cents to avoid floating-point rounding issues.

---

## User model

Source: [backend/model/user.model.js](backend/model/user.model.js)

### Schema overview

- `_id` (ObjectId)
- `username` (String, required, unique)
- `email` (String, required, unique)
- `password` (String, required, `select: false`) — hashed; not returned by default
- `profilePicture` — `{ url: String, imageId: String }`
- `isVerified` — `{ email: Boolean, phone: Boolean }`
- `role` — enum: `['user','admin','provider']`, default: `'user'`
- `api` — array of subdocuments: `{ apiId: ObjectId(ref: 'API'), url: String(required), purchased: Boolean, usage: Number, apiBill: Number }`
- `cart`, `wishlist` — arrays of `{ apiId: ObjectId }`
- `subscriptionPlan` — enum: `['free','pro','enterprise']`, default: `'free'`
- `subscriptionExpires` — `Date | null`
- `verificationCode` / `verificationCodeExpires` — `{ email, phone }` pairs for code + expiry

Schema options: `{ timestamps: true }` adds `createdAt` and `updatedAt`.

### Helper methods (password)

- `userSchema.methods.hashPassword(password)` — returns a bcrypt hash.
- `userSchema.methods.comparePassword(candidate, hashed)` — returns a boolean.

Recommended usage patterns:

Registration (recommended):

```js
const hashed = await bcrypt.hash(password, 10);
const user = await User.create({ username, email, password: hashed });
```

Alternatively add a static helper on the model:

```js
userSchema.statics.hashPassword = function (password) {
  return bcrypt.hash(password, 10);
};
```

Login (recommended):

```js
const user = await User.findOne({ email }).select('+password');
if (!user) return res.status(404).json({ message: 'Not found' });
if (!await user.comparePassword(password, user.password)) return res.status(401).json({ message: 'Invalid credentials' });
```

### Verification codes & expiry

- Store codes only for short TTLs (e.g., 10 minutes) and avoid returning them in API responses.
- Consider hashing codes before persisting or treat them as one-time tokens.
- Rate-limit `codegen` endpoints by IP and account.

### Example storage (sanitized)

```json
{
  "_id": "645b1f...",
  "username": "alice",
  "email": "alice@example.com",
  "role": "user",
  "api": [ { "apiId": "646c2f...", "url": "https://provider.example/api", "purchased": true, "usage": 120 } ],
  "subscriptionPlan": "free",
  "createdAt": "2026-04-19T12:34:56.000Z"
}
```

Do not return `password`, `verificationCode`, or `verificationCodeExpires` in API responses.

---

## Provider model

Source: [backend/model/provider.model.js](backend/model/provider.model.js)

### Schema overview

- `username`, `email`, `password` (`select: false`)
- `profilePicture` — `{ url, imageId }`
- `isVerified` — `{ email, phone }`
- `role` — default `'provider'`
- `apiCreated` — array `{ apiId: ObjectId(ref: 'API'), purchased: Boolean }`
- `membership` — `Boolean`
- `subscriptionPlan`, `subscriptionExpires`
- `verificationCode` / `verificationCodeExpires`
- `activityLogs` — `{ action: String, timestamp: Date }[]`

### Helper methods

- `hashPassword(password)` — bcrypt hash helper
- `comparePassword(candidate, hashed)` — bcrypt comparison

### Implementation note (exports)

The current implementation contains a duplicated export at the end of `provider.model.js` (two `module.exports` lines). Keep a single export. Example fix — replace the duplicate block with one of the following:

```js
// simplest
module.exports = mongoose.model('Provider', providerSchema);

// or, if you prefer a named constant
const Provider = mongoose.model('Provider', providerSchema);
module.exports = Provider;
```

---

## API model

Source: [backend/model/api.model.js](backend/model/api.model.js)

### Overview

- `userId` (ObjectId, ref `User`) — owner
- `name`, `baseUrl`
- `apiKeys[]` — `{ key, status, createdAt }` (sensitive)
- `usageLogs[]` — per-request entries
- `billing` — `{ totalRequests, amount, status, invoiceDate }`

Recommendations:

- Store API keys hashed or HMACed and show only masked previews in the UI.
- For high-volume usage logs, store events in a separate collection or external metrics system rather than embedding them in the API document.

---

## Controller integration notes

- Registration: hash passwords before calling `User.create()`; prefer a static helper or explicit `bcrypt.hash()` in controllers.
- Login: always request `select('+password')` when validating credentials and call `comparePassword()`.
- Delete account: require password verification (select `+password` and use `comparePassword()`), or require a valid deletion code issued via verified email.
- Code generation: send verification codes out-of-band (email/SMS) and return a 202/204 response; do not include codes in JSON responses.

---

## Security & operational recommendations

- Passwords: use `bcrypt` or `argon2` with appropriate cost factors.
- Verification codes: short TTLs, hashing where feasible, do not return codes in responses.
- Rate-limit code generation and authentication endpoints.
- API keys: store hashed keys; provide masked previews (e.g., last 4 characters) for UI.
- Usage logs: push large/time-series logs to a dedicated store to avoid unbounded document growth.
- Cookies: use `httpOnly`, `secure`, and `sameSite` in production.
- HTTP status codes: `201` for creation, `200` for success, `204` for no-content, appropriate `4xx` for client errors.

---

## Known issues & recommended fixes

1. `provider.model.js` duplicates the model export. Remove the duplicate and export a single instance.
2. `promoteUser` controller uses `userDetail.membership(true)` — change to `userDetail.membership = true` or update `role = 'provider'`. Use `POST`/`PUT` semantics for updates.
3. `codegen` returns verification codes in responses. Send codes via email/SMS and return `202 Accepted` (do not include codes in JSON responses).
4. `deleteUser` may compare plaintext passwords. Ensure controllers `select('+password')` and call `comparePassword()`.
5. Consider migrating `api.usage` and `usageLogs` to a separate timeseries collection if request volume increases.

---

## Migration & developer notes

- When adding `verificationCodeExpires` or changing enums, include a migration that normalizes existing documents.
- Add unit tests for password helpers, code generation TTL, and account deletion flows.
- Runtime dependency: `npm install bcryptjs` (or `bcrypt` / `argon2`). Include tests in CI.

---

If you'd like, I can:

- Fix the `provider.model.js` duplicate export and open a PR.
- Update `deleteUser` and `promoteUser` controllers to use `comparePassword()` and correct update semantics.
- Replace `User.prototype.hashPassword` usage with a static helper or `pre('save')` hook and add tests.

Find the models here:
- [backend/model/user.model.js](backend/model/user.model.js)
- [backend/model/provider.model.js](backend/model/provider.model.js)
- [backend/model/api.model.js](backend/model/api.model.js)

---

## Recent Modified Code & Endpoint Examples (2026-04-21)

This section concisely documents the actual code changes applied to models and controllers and shows concrete request/response examples (success and error status codes) for the endpoints that directly interact with these models.

### Model method examples (current code)
- `userSchema.methods.hashPassword(password)` — bcrypt hash helper. Example use (controller):

```js
const hashed = await user.hashPassword(rawPassword);
user.password = hashed;
await user.save();
```

- `userSchema.methods.comparePassword(candidate, stored)` — bcrypt compare. Example (login):

```js
const user = await User.findOne({ email }).select('+password');
if (!user) return res.status(400).json({ message: 'User not found', success: false });
const ok = await user.comparePassword(password, user.password);
if (!ok) return res.status(400).json({ message: 'Invalid credentials', success: false });
// success -> issue cookie
```

### Endpoint: POST /api/user/userRegister
- Purpose: create user and set auth cookie
- Request: `Content-Type: application/json`

Request body example:
```json
{ "username":"alice","email":"alice@example.com","password":"P@ssw0rd!" }
```
- Success (201 Created):

```json
{ "message":"User registered successfully","success":true,"user":{ "_id":"...","username":"alice","email":"alice@example.com" } }
```
- Error (400 Bad Request): missing fields or user exists

```json
{ "message":"All fields are required","success":false }
```

Implementation note: controller must call `await user.hashPassword(password)` and save; `password` field must not be returned.

### Endpoint: POST /api/user/userLogin
- Purpose: authenticate user
- Request example:

```json
{ "email":"alice@example.com","password":"P@ssw0rd!" }
```
- Success (200 OK): sets `apiProviderToken` cookie and returns sanitized user

```json
{ "message":"User logged in successfully","success":true,"user":{ "_id":"...","email":"alice@example.com" } }
```
- Error (400 Bad Request): invalid credentials or not found

```json
{ "message":"Invalid credentials","success":false }
```

### Endpoint: DELETE /api/user/userDelete
- Purpose: delete authenticated user (requires verification)
- Request body: provide either `password` or `emailCode`.

Request example (password):
```json
{ "password": "P@ssw0rd!" }
```
- Behavior (implementation):
  - `const user = await User.findById(req.id).select('+password')`
  - If password provided -> `await user.comparePassword(password, user.password)`
  - If emailCode provided -> compare hashed code and check expiry
  - On success: prefer soft-delete (set `isDeleted=true`, `deletedAt=Date.now()`)

- Success (204 No Content) — recommended; current code returns 201 in places.
- Errors:
  - 400: missing credentials
  - 400: invalid credentials / invalid code

Example error payload:
```json
{ "message":"invalid credentials","success":false }
```

### Endpoint: GET /api/provider/providerCodegen (current behavior)
- Purpose: generate a 6-digit code and store `provider.verificationCode.email` (currently returned in response for debugging)
- Success (201 Created) current (temporary):

```json
{ "message":"code gen","code":"654321" }
```
- Recommended (production):

Response (200 OK):
```json
{ "message":"Verification code sent to your registered email","success":true }
```

Security: store only hashed code + expiry in provider record. Do not return plaintext code.

### Endpoint: POST /api/apiGen/setApi/:consumerId (current implementation)
- Purpose: generate one-time `apiKey` and `apiPassword` for a consumer and attach to `api.apiKeys` and `user.api`.
- Request body:

```json
{ "providerApiId": "645c3f..." }
```
- Success (201 Created): returns credentials once:

```json
{ "message":"API purchased successfully","success":true,"apiKey":"ABCD...","apiPassword":"XyZ..." }
```
- Error (400): API not found / already purchased / user not found

Implementation notes / security fixes applied:
- `api.apiKeys.push({ consumerId, key: apiKey, apiPassword: hashedPassword, status:'active' })` (note: stored hashed password)
- `userDetail.api.push({ apiId, url, purchased:false, keyCode: apiKey, keyPassword: apiPassword })` — current code stores raw key/password on user; recommended: remove raw storage and return only once. If raw values exist in DB, plan migration to hashed values.

### Endpoint: POST /api/apiGen/apiRequest/:endpoint
- Purpose: consumer calls a subscribed API through gateway.
- Authentication: headers `api_provide_key` and `api_provide_password` required.
- Flow:
  1. Lookup: `api = await Api.findOne({ 'apiKeys.key': apiKey, 'apiKeys.status':'active' })`
  2. Validate password: `bcrypt.compare(apiPassword, keyObj.apiPassword)`
  3. Build provider URL: `providerUrl = api.baseUrl + endpoint`
  4. Proxy via `axios` and capture response and latency
  5. Write metrics to InfluxDB and update `api.usageLogs` (recommended: use object entries)
  6. Update `user.api.usage` and billing according to rules

- Success (201 Created or upstream status):
```json
{ "message":"got the response","success":true,"status":200,"data":{ /* provider data */ } }
```
- Errors:
  - 401: missing credentials
  - 401: user not found
  - 401: invalid api key or inactive key
  - 400: invalid key credential (password mismatch)
  - 500: upstream API failure

Example error payload:
```json
{ "message":"please provide the authentication keys!","success":false,"error":"API key and password required" }
```

### Migration note — re-hash raw API secrets
- If your DB contains raw `keyPassword`/`keyCode` in `user.api` or `api.apiKeys`, run a migration:

1. For each `api` doc with `apiKeys` containing raw `apiPassword`:
   - generate new secret or require rotation, or
   - replace stored raw secret with `await bcrypt.hash(rawSecret, 10)` and mark as rotated.

2. For each `user.api` entry storing raw keys, remove raw fields after delivering to user once, and store only masked preview and usage/billing metadata.

### Quick checklist of implemented modifications
- `user.model.js`: added `hashPassword` and `comparePassword` methods (bcrypt). `password` field is `select:false`.
- `provider.model.js`: add `hashPassword`/`comparePassword`; remove duplicate exports if present.
- `api.model.js`: `providerId` used for ownership; `apiKeys` now include `consumerId`, `key`, `apiPassword`(hashed); helper `hashKeys()`/`compareKeys()` added; `usageLogs` recommended to be object-array.

---

If you want, I can now:
- implement a migration script to hash any raw stored secrets, or
- change controllers to stop persisting raw credentials and rotate existing ones.
Tell me which action to take next and I will prepare the code patch and tests.

---

End of document.

- New/changed fields (in `api` subdocument):
  - `apiId` (ObjectId, ref: `API`) — reference to the purchased API.
  - `url` (String, required) — provider API base URL.
  - `purchased` (Boolean) — purchase flag.
  - `keyCode` (String) — consumer-facing key identifier (mask before showing in UI).
  - `keyPassword` (String) — API secret/password (must be stored hashed).
  - `usage` (Number) — per-API usage counter.
  - `apiBill` (Number) — per-API billing amount (store in cents).

- Subscription and verification fields:
  - `subscriptionPlan`: enum `['free','pro','enterprise']`, default `'free'`.
  - `subscriptionExpires`: Date | null.
  - `verificationCode` and `verificationCodeExpires` for `email`/`phone` (short TTL recommended).

- Helper methods added:
  - `hashPassword(password)` — returns bcrypt hash.
  - `comparePassword(candidate, hashed)` — bcrypt compare boolean.

Developer guidance:

- Password handling: the model exposes `hashPassword()` and `comparePassword()` helpers. Controllers must either:
  - explicitly call `await user.hashPassword(password)` before creating/saving, or
  - (preferred) add a `pre('save')` hook to the schema to always hash when `password` is modified.

- API keys/secrets: Do NOT store or return raw `keyPassword`/`keyCode`. Hash secrets with bcrypt/HMAC and return only a masked preview (e.g., `****abcd`). Consider moving keys to a dedicated `api_keys` collection for easier rotation and indexing.

Example (safe creation pattern):

```js
const hashed = await bcrypt.hash(password, 10);
const user = await User.create({ username, email, password: hashed });

const rawKey = generateApiKey();
const hashedKey = await bcrypt.hash(rawKey, 10);
user.api.push({ apiId, url, purchased: true, keyCode: maskKey(rawKey), keyPassword: hashedKey });
await user.save();
// deliver rawKey to consumer out-of-band once
```

### Provider model updates

- New/changed fields:
  - `apiCreated` — array of `{ apiId: ObjectId(ref: 'API'), purchased: Boolean }` indicating APIs the provider created.
  - `membership` (Boolean), `subscriptionPlan`, `subscriptionExpires`.
  - `verificationCode` / `verificationCodeExpires` fields.
  - `activityLogs` — `{ action: String, timestamp: Date }[]` for audit trails.

- Helper methods:
  - `hashPassword(password)` and `comparePassword(candidate, hashed)` using bcrypt.

Developer note: `provider.model.js` contains a duplicated `module.exports` in the current file. Keep a single export, for example:

```js
const Provider = mongoose.model('Provider', providerSchema);
module.exports = Provider;
```

### API model updates

- Ownership: model now uses `providerId: ObjectId(ref: 'Provider')` to associate APIs with providers.

- `apiKeys` subdocument changed to include:
  - `consumerId` (ObjectId, ref `User`) — optional consumer reference.
  - `key` (String) — identifier; treat carefully (hash if secret).
  - `apiPassword` (String) — secret/password for API key (must be hashed).
  - `status`, `createdAt`.

- New helper methods:
  - `hashKeys(raw)` — returns bcrypt hash for keys or secrets.
  - `compareKeys(raw, storedHash)` — validates incoming keys/secrets.

- Usage logs: current schema uses array-wrapped fields (arrays for `timestamp`, `status`, `latency`) which results in parallel arrays and is error-prone. Recommended schema:

```js
usageLogs: [{ apiKey: String, endpoint: String, timestamp: Date, status: Number, latency: Number }]
```

Security & operational guidance (API keys):

- Always hash API secrets (`apiPassword`) and consider hashing `key` if it is secret. Use `hashKeys()` when creating keys and `compareKeys()` for authentication.
- Avoid `unique: true` inside nested arrays without creating an appropriate top-level index; prefer a separate `api_keys` collection with a unique index on `hashedKey`.
- Do not return raw keys in API responses — return masked previews only.

Example (create API key safely):

```js
const rawKey = generateApiKey();
const rawSecret = generateSecret();
const hashedKey = await api.hashKeys(rawKey);
const hashedSecret = await api.hashKeys(rawSecret);
apiDoc.apiKeys.push({ consumerId, key: hashedKey, apiPassword: hashedSecret });
await apiDoc.save();
// deliver rawKey/rawSecret to the consumer out-of-band once
```

### Controller integration checklist

- Registration `/userRegister`: hash password before saving (or add `pre('save')` hook). Never return `password` or verification codes in responses.
- Login `/userLogin`: query with `.select('+password')` and use `await user.comparePassword(password, user.password)`.
- Delete `/userDelete`: require `.select('+password')` + `comparePassword` or validated `verificationCode` + expiry check; prefer soft-delete or retention policy.
- Code generation `/codegen`: persist code with expiry (`verificationCodeExpires`) and send via email/SMS; return `202 Accepted` without the code in JSON.
- API key verification: look up hashed key (or use a keys collection) and use `compareKeys()` to validate incoming key and secret.

### Migration & testing notes

- Migration tasks:
  - Add `verificationCodeExpires` fields with `null` defaults for existing users/providers.
  - Migrate any stored raw API keys to hashed values and rotate keys where necessary.

- Tests to add:
  - `hashPassword` / `comparePassword` unit tests.
  - `hashKeys` / `compareKeys` unit tests.
  - `codegen` TTL, delivery, and deletion flows.

---

If you'd like, I can implement the controller changes (hashing in registration, secure login/delete flows, codegen behavior), fix the provider model export, and prepare migration scripts. Tell me which item to prioritize and I will prepare the code patch and tests.

---

End of document.
