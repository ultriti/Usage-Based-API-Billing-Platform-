# Model Reference — backend/model

Last updated: 2026-05-12

## Purpose

This document summarizes the current Mongoose schemas used by the backend, highlights key fields, and records security and operational guidance for verification flows, API keys, and usage logging.

- Audience: backend developers and integrators.
- Primary sources:
  - [backend/model/user.model.js](backend/model/user.model.js)
  - [backend/model/provider.model.js](backend/model/provider.model.js)
  - [backend/model/admin.model.js](backend/model/admin.model.js)
  - [backend/model/api.model.js](backend/model/api.model.js)
  - [backend/model/transaction.model.js](backend/model/transaction.model.js)

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
- `api` — array of subdocuments:
  - `apiId` (ObjectId, ref `API`, required)
  - `url` (String, default: "")
  - `Subscription`:
    - `subscriptionPurchased` (Boolean, default: false)
    - `ammount` (Number, default: 0)
    - `requests` (Number, default: 0)
    - `maxRequests` (Number, default: 500)
    - `type` (String, enum: [`partialpayment`,`monthlypayment`,`annualpayment`], default: `partialpayment`)
  - `partialPayment` (Boolean, default: false)
  - `keyCode` (String, default: "")
  - `keyPassword` (String, default: "")
  - `usage` (Number, default: 0)
  - `apiBill` (Number, default: 0)
- `cart` — array of `{ apiId: ObjectId(ref: 'Api'), required: true }`
- `wishlist` — array of `{ apiId: ObjectId(ref: 'Api'), required: true }`
- `subscriptionPlan` — enum: `['free','pro','enterprise']`, default: `free`
- `subscriptionExpires` — `Date | null`
- `verificationCode` — `{ email: Number | null, phone: Number | null }`
- `verificationCodeExpires` — `{ email: Date | null, phone: Date | null }`

Schema options: `{ timestamps: true }` adds `createdAt` and `updatedAt`.

### Helper methods

- `userSchema.methods.hashPassword(password)` — bcrypt hash helper
- `userSchema.methods.comparePassword(candidate, hashed)` — bcrypt compare helper

### Current model notes

- The user API subdocument now includes a nested `Subscription` object instead of a flat `purchased` boolean.
- Raw credential fields `keyCode` and `keyPassword` are persisted on user API entries; this is a sensitive area and should be migrated to hashed or one-time token storage.
- `cart` and `wishlist` both reference `Api` and are required by schema.

### Verification codes & expiry

- Store verification codes for short TTLs only.
- Avoid returning `verificationCode` or `verificationCodeExpires` in API responses.
- Consider hashing codes before storing, or use them as one-time values.

### Example sanitized user document

```json
{
  "_id": "645b1f...",
  "username": "alice",
  "email": "alice@example.com",
  "role": "user",
  "api": [
    {
      "apiId": "646c2f...",
      "url": "https://provider.example/api",
      "Subscription": {
        "subscriptionPurchased": true,
        "ammount": 49,
        "requests": 10,
        "maxRequests": 500,
        "type": "partialpayment"
      },
      "partialPayment": true,
      "keyCode": "MASKED",
      "keyPassword": "MASKED",
      "usage": 120,
      "apiBill": 30
    }
  ],
  "subscriptionPlan": "free",
  "createdAt": "2026-04-19T12:34:56.000Z"
}
```

Do not return `password`, `verificationCode`, or `verificationCodeExpires` in responses.

---

## Provider model

Source: [backend/model/provider.model.js](backend/model/provider.model.js)

### Schema overview

- `username`, `email`, `password` (`select: false`)
- `profilePicture` — `{ url, imageId }`
- `isVerified` — `{ email, phone }`
- `role` — enum: `['user','admin','provider']`, default: `provider`
- `apiCreated` — array of `{ apiId: ObjectId(ref: 'API'), purchased: Boolean }`
- `membership` — Boolean
- `subscriptionPlan` — enum: `['free','pro','enterprise']`, default: `free`
- `subscriptionExpires` — `Date | null`
- `paymentPrending` — enum: `['pending','paid','settling']`, default: `pending`
- `verificationCode` — `{ email: Number | null, phone: Number | null }`
- `verificationCodeExpires` — `{ email: Date | null, phone: Date | null }`
- `activityLogs` — array of `{ action: String, timestamp: Date }`

### Helper methods

- `providerSchema.methods.hashPassword(password)` — bcrypt hash helper
- `providerSchema.methods.comparePassword(candidate, hashed)` — bcrypt compare helper

### Current model notes

- `apiCreated` tracks provider-created APIs and defaults `purchased` to `true`.
- `paymentPrending` appears to capture billing workflow state and is spelled exactly as in current code.

### Export issue

`provider.model.js` currently exports the model twice. Keep a single export to avoid ambiguous module behavior.

Example correct export:

```js
const Provider = mongoose.model('Provider', providerSchema);
module.exports = Provider;
```

---

## Admin model

Source: [backend/model/admin.model.js](backend/model/admin.model.js)

### Schema overview

- `username`, `email`, `adminToken`, `password` (`select: false`)
- `profilePicture` — `{ url, imageId }`
- `isVerified` — `{ email, phone }`
- `role` — enum: `['user','admin','provider']`, default: `admin`
- `membership` — Boolean
- `subscriptionPlan` — enum: `['free','pro','enterprise']`, default: `free`
- `subscriptionExpires` — `Date | null`
- `verificationCode` — `{ email: Number | null, phone: Number | null }`
- `verificationCodeExpires` — `{ email: Date | null, phone: Date | null }`
- `activityLogs` — array of `{ action: String, timestamp: Date }`

### Helper methods

- `AdminSchema.methods.hashPassword(password)` — bcrypt hash helper
- `AdminSchema.methods.comparePassword(candidate, hashed)` — bcrypt compare helper

### Current model notes

- `adminToken` is required by the schema and must be supplied during admin registration and login.
- Admins share the same role enum as other user types, but default to `admin`.

---

## API model

Source: [backend/model/api.model.js](backend/model/api.model.js)

### Schema overview

- `providerId` (ObjectId, ref `Provider`, required)
- `description` (String, default: "")
- `name` (String, required)
- `baseUrl` (String, required)
- `platformUrl` (String, required, default: `import.meta.env.BACKEND_URL_RD/`)
- `status` — enum: `['active','revoked']`, default: `active`

### Subscription plan

- `subscriptionPlan.subscriptionType` — enum:
  - `basic`
  - `pro`
  - `Model`
  - `Heavy Model`
  - `Ultra Heavy`
  - `custom`
- `subscriptionPlan.price.partialpayment` — `{ amount: Number, requestLimit: Number, timeLimit: Date }`
- `subscriptionPlan.price.monthlypayment` — same structure
- `subscriptionPlan.price.annualpayment` — same structure

### API keys

- `apiKeys` — array of subdocuments:
  - `consumerId` (ObjectId, ref `User`)
  - `key` (String, required, unique)
  - `status` — enum: `['active','revoked']`, default: `active`
  - `createdAt` — Date, default: `Date.now`

### Usage logs

- `usageLogs` — array of subdocuments:
  - `apiKey` (String)
  - `endpoint` (String)
  - `timestamp` — array of Date
  - `status` — array of Number
  - `latency` — array of Number

### Categories

- `categories` — enum:
  - `development`
  - `LLM Model`
  - `character`
  - `design`
  - `testing`
  - `documentation`
  - `analytics`
  - `security`
  - `billing`
  - `support`
  - `marketing`
  - `operations`
- default: `development`

### Billing info

- `billing.totalRequests` — Number, default `0`
- `billing.totalAmount` — Number, default `0`
- `billing.amount` — Number, default `0`
- `billing.status` — enum: `['pending','paid']`, default: `pending`
- `billing.invoiceDate` — Date, default: `Date.now`
- `billing.consumerDetail` — array of:
  - `customerId` — ObjectId
  - `ammountPaid` — Number, default `0`
  - `paidAt` — Date, default: `Date.now`
  - `status` — enum: `['pending','paid']`, default: `pending`

- `createdAt` — Date, default: `Date.now`

### Helper methods

- `apiSchema.methods.hashKeys(keyId)` — bcrypt hash helper
- `apiSchema.methods.compareKeys(keys, consumerKeys)` — bcrypt compare helper

### Current model notes

- `apiKeys.key` is unique and therefore treated as a sensitive lookup key.
- `usageLogs` currently stores parallel arrays for `timestamp`, `status`, and `latency`; this structure is error-prone and should be refactored to per-event objects.
- `platformUrl` default is currently a placeholder-like string and may require real runtime configuration.

---

## Transaction model

Source: [backend/model/transaction.model.js](backend/model/transaction.model.js)

### Schema overview

- `providerId` — ObjectId(ref `Provider`, required)
- `apiId` — ObjectId(ref `API`, required)
- `amount` — Number, required
- `currency` — String, default: `INR`
- `status` — enum: `['pending','settling','paid']`, default: `pending`
- `paymentMethod` — enum: `['razorpay','stripe','paypal','manual']`, default: `razorpay`
- `transactionRef` — String
- `invoiceDate` — Date, default: `Date.now`
- `settledAt` — Date
- `consumerDetail` — object:
  - `customerId` — ObjectId(ref `User`)
  - `ammountPaid` — Number, default: `0`
  - `paidAt` — Date
  - `status` — enum: `['pending','paid']`, default: `pending`

Schema options: `{ timestamps: true }` adds `createdAt` and `updatedAt`.

---

## Controller integration notes

- Hash passwords before saving and never return raw password fields.
- Authenticate using `select('+password')` and `comparePassword()`.
- Use hashed verification and deletion flows rather than plain-text checks.
- Avoid persisting raw API secrets after initial delivery; use masked previews when possible.

---

## Security & operational recommendations

- Passwords: use `bcrypt` or `argon2`.
- Verification codes: short TTLs, hash if possible, do not include in responses.
- Rate-limit auth and `codegen` endpoints.
- API keys: store hashed keys and avoid raw secret persistence.
- Usage logs: move large/time-series data to a dedicated store when needed.
- Cookies: use `httpOnly`, `secure`, and `sameSite` in production.
- HTTP status codes: `201` for creations, `200` for success, `204` for no-content, and appropriate `4xx` responses.

---

## Known issues & current updates

1. `provider.model.js` has duplicate model exports.
2. `api.model.js` stores `usageLogs` as parallel arrays; refactor to event objects.
3. `user.model.js` persists raw `keyCode`/`keyPassword` inside user API docs; this should be migrated to hash storage or one-time reveal only.
4. `admin.model.js` is now documented and includes `adminToken` support.
5. `transaction.model.js` is now included as a current backend model for payment records.

---

## Migration & developer notes

- Normalize documents when enums change or when adding `verificationCodeExpires` fields.
- Add unit tests for password helpers, key hashing, and verification flows.
- If raw API secrets already exist, plan a migration to rotate and hash them.
- Runtime dependency: `bcryptjs` (or `bcrypt` / `argon2`).

---

Updated: 2026-05-12
