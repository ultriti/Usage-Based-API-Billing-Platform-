# Model Reference — backend/model

Last updated: 2026-04-19

## Purpose

This document describes the Mongoose schemas implemented in this folder and how their data is stored, validated, and exposed by the API. It covers:

- Field-by-field descriptions (type, required, defaults, constraints)
- How data is represented in MongoDB (raw document shape)
- Recommended JSON output (sanitized API responses)
- Indexes, relations, scaling and security recommendations

Scope: `user.model.js` and `api.model.js` in this directory.

---

## Quick data type mapping (Mongoose -> MongoDB -> JSON)

- `String` -> `String` -> JSON string
- `Number` -> `Number` -> JSON number
- `Boolean` -> `Boolean` -> JSON boolean
- `Date` -> `ISODate` -> JSON ISO 8601 string (example: "2026-04-19T12:34:56.000Z")
- `Schema.Types.ObjectId` -> ObjectId -> JSON hex string (commonly serialized as `id`)
- `Array` / subdocuments -> embedded arrays/objects -> JSON arrays/objects

Note: For monetary values prefer integer cents (Number) to avoid floating point issues.

---

## User model

Source: [backend/model/user.model.js](backend/model/user.model.js)

### Schema overview

- `_id` (ObjectId) — MongoDB primary key, auto-generated.
- `username` (String) — required, unique. User handle/login.
- `email` (String) — required, unique. Contact/login email.
- `password` (String) — required. Must be stored hashed (bcrypt / argon2). Never return plaintext.
- `isVerified` (Object) — subdocument:
  - `email` (Boolean) — default: `false` — whether email verified
  - `phone` (Boolean) — default: `false` — whether phone verified
- `role` (String) — enum: ['consumer', 'admin', 'provider'] per current schema; default currently set to `'user'` in code. This is a mismatch: `'user'` is not listed in the enum and will cause validation errors on save. Recommended fix: change default to `'consumer'` or add `'user'` to the enum.
- `api` (Array of subdocuments) — each with:
  - `url` (String) — code uses `require : true` (typo). Should be `required: true` if intended.
  - `purchased` (Boolean) — default: `false`

Schema options: `{ timestamps: true }` — Mongoose will add `createdAt` and `updatedAt`.

### Required fields

- `username`, `email`, `password` are required.
- The `api.url` `require` property appears to be a typo; if `url` is expected to be mandatory, change `require` to `required` in schema.

### Example MongoDB document (stored form)

```json
{
  "_id": {"$oid": "645b1f..."},
  "username": "alice",
  "email": "alice@example.com",
  "password": "$2b$10$...hashed...",
  "isVerified": { "email": false, "phone": false },
  "role": "consumer",
  "api": [ { "url": "https://provider.example/api", "purchased": true } ],
  "createdAt": {"$date":"2026-04-19T12:34:56.000Z"},
  "updatedAt": {"$date":"2026-04-19T12:34:56.000Z"}
}
```

### Recommended API JSON response (sanitized)

Always remove secrets before returning documents to clients. Example sanitized output:

```json
{
  "id": "645b1f...",
  "username": "alice",
  "email": "alice@example.com",
  "isVerified": { "email": false, "phone": false },
  "role": "consumer",
  "api": [ { "url": "https://provider.example/api", "purchased": true } ],
  "createdAt": "2026-04-19T12:34:56.000Z",
  "updatedAt": "2026-04-19T12:34:56.000Z"
}
```

Do not include `password` in responses. Use schema `toJSON`/`toObject` transforms to map `_id` -> `id`, drop `__v` and remove `password`.

Example transform to attach to the schema:

```js
userSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    delete ret.password;
    return ret;
  }
});
```

### Indexes & uniqueness

- Ensure unique indexes exist at the DB level for `email` and `username`:

```js
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true });
```

Note: Mongoose's `unique: true` is a helper for index creation but does not validate uniqueness itself; rely on a DB-level unique index and handle duplicate-key errors.

### Security & recommendations (User)

- Always store passwords hashed (bcrypt/argon2) with appropriate salt rounds.
- Add rate-limiting and account lockouts for failed logins.
- Consider email normalization and validation.
- Do not store additional PII unless necessary; follow privacy principles and retention policies.

---

## API model

Source: [backend/model/api.model.js](backend/model/api.model.js)

### Schema overview

- `_id` (ObjectId)
- `userId` (ObjectId) — `ref: 'User'`, required: true. Links API metadata to a user account.
- `name` (String) — required: a human-friendly API name.
- `baseUrl` (String) — required: the root endpoint for this API.
- `apiKeys` (Array of subdocuments):
  - `key` (String) — stored API key value (sensitive). Schema sets `unique: true` here but: see notes below.
  - `status` (String) — enum [`active`, `revoked`], default `active`.
  - `createdAt` (Date) — default `Date.now`.
- `usageLogs` (Array of subdocuments):
  - `apiKey` (String) — key identifier used by the request (avoid storing raw key if not required)
  - `endpoint` (String)
  - `timestamp` (Date) — default `Date.now`
  - `status` (Number) — response HTTP status code
  - `latency` (Number) — ms
- `billing` (Object):
  - `totalRequests` (Number) — default: 0
  - `amount` (Number) — default: 0 (recommend storing cents as integer)
  - `status` (String) — enum [`pending`, `paid`], default `pending`
  - `invoiceDate` (Date) — default `Date.now`
- `createdAt` (Date) — default `Date.now`

### Important notes on apiKeys & uniqueness

- `unique: true` inside array subdocuments does not reliably create a unique index across nested array elements. For strong uniqueness guarantees you should:
  - create a top-level index using the full path, for example: `apiSchema.index({ 'apiKeys.key': 1 }, { unique: true, sparse: true })`, OR
  - extract API keys into their own collection (`api_keys`) with a `key` field and a reference to the API document — this simplifies queries and uniqueness enforcement.

### Usage logs & scaling

- Embedded `usageLogs` arrays can grow without bound and will cause document growth and performance issues. For high-volume usage logging, use a separate `api_usage_logs` collection with an index on `apiId` or `apiKey`, or stream logs to analytics/metrics infra (Elasticsearch, ClickHouse, TimescaleDB, etc.).

### Example MongoDB document (stored form)

```json
{
  "_id": {"$oid": "646c2f..."},
  "userId": {"$oid":"645b1f..."},
  "name": "Weather API",
  "baseUrl": "https://api.example.com/v1",
  "apiKeys": [
    { "key": "abcd1234efgh", "status": "active", "createdAt": {"$date":"2026-04-01T10:00:00Z"} }
  ],
  "usageLogs": [
    { "apiKey": "abcd1234efgh", "endpoint": "/forecast", "timestamp": {"$date":"2026-04-19T12:00:00Z"}, "status": 200, "latency": 123 }
  ],
  "billing": { "totalRequests": 1024, "amount": 1050, "status": "paid", "invoiceDate": {"$date":"2026-04-05T00:00:00Z"} },
  "createdAt": {"$date":"2026-04-01T10:00:00Z"}
}
```

### Recommended sanitized JSON response

Never return raw API key values in responses. Provide key metadata and a short preview if needed (last 4 chars).

```json
{
  "id": "646c2f...",
  "userId": "645b1f...",
  "name": "Weather API",
  "baseUrl": "https://api.example.com/v1",
  "apiKeys": [ { "id": "...,", "preview": "****efgh", "status": "active", "createdAt": "2026-04-01T10:00:00Z" } ],
  "billing": { "totalRequests": 1024, "amountCents": 1050, "status": "paid", "invoiceDate": "2026-04-05T00:00:00Z" },
  "createdAt": "2026-04-01T10:00:00Z"
}
```

### Indexes & example Mongoose index definitions

```js
// user
userSchema.index({ email: 1 }, { unique: true });
userSchema.index({ username: 1 }, { unique: true });

// api
apiSchema.index({ userId: 1 });
apiSchema.index({ 'apiKeys.key': 1 }, { unique: true, sparse: true });
```

---

## Security & operational recommendations

- Hash passwords and never log them.
- Treat API keys as secrets. Store a hashed form of keys (HMAC/sha256 with salt) and a readable preview for display.
- On verification of incoming API key, hash the incoming key with the same salt and compare to stored hash.
- Move high-volume time-series data (usage logs) to a separate collection or metrics pipeline to avoid document growth.
- Use sparse/partial and compound indexes to optimize common queries (by `userId`, `createdAt`, `apiKeys.key`).
- Use TTL indexes or retention policies for raw logs if older logs can be pruned or summarized.

## Validation & error handling notes

- Mongoose validation errors return `ValidationError`. Handle these and return clear client messages for missing/invalid fields.
- For unique index violations, catch duplicate-key errors (Mongo error code 11000) and translate to a user-friendly error.

## Known issues & recommended fixes (action items)

1. `user.model.js` — `role` default is `'user'` but enum does not include `'user'`. Fix: either add `'user'` to enum or change default to one of the enum values (e.g., `'consumer'`).
2. `user.model.js` — `api.url` uses `require : true` (typo). Replace with `required: true` if the field must be mandatory.
3. `api.model.js` — `apiKeys.key` marked `unique: true` inside an array: create a proper index or extract keys into their own collection for reliable uniqueness.
4. Consider storing `billing.amount` as integer cents and renaming to `amountCents` for clarity and to avoid rounding errors.

## Migration & versioning advice

- When changing enums or default values, provide a migration plan for existing documents to avoid validation errors.
- Use a migration tool (migrate-mongo, Mongration, or a scripted job) to update existing records safely.

---

If you'd like, I can:

- apply the recommended code fixes (fix the `role` default, correct `require` → `required`),
- add the suggested indexes in the schema files, or
- move usage logs or API keys into separate collections and provide migrations.

Find the models here:
- [backend/model/user.model.js](backend/model/user.model.js)
- [backend/model/api.model.js](backend/model/api.model.js)

---

End of document.
