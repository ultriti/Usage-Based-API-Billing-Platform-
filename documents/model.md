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

If you want, I can:

- Fix the `provider.model.js` duplicate export and open a PR.
- Update `deleteUser` and `promoteUser` controllers to use `comparePassword()` and correct update semantics.
- Replace `User.prototype.hashPassword` usage with a static helper or `pre('save')` hook and add tests.

Find the models here:
- [backend/model/user.model.js](backend/model/user.model.js)
- [backend/model/provider.model.js](backend/model/provider.model.js)
- [backend/model/api.model.js](backend/model/api.model.js)

---

End of document.
