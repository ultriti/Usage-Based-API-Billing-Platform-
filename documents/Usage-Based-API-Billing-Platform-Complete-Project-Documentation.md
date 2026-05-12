# Usage-Based API Billing Platform

## Project Overview

The Usage-Based API Billing Platform is a full-stack application that enables API providers to publish and monetize APIs on a usage-based billing model while giving end users a secure way to discover, subscribe, and consume those APIs.

This project combines:

- A React + Vite frontend for user/provider/admin interfaces.
- An Express backend with REST APIs and JWT cookie authentication.
- MongoDB/Mongoose for persistence.
- Razorpay for payment integration.

## Introduction

The platform is designed to democratize API commerce. Providers can define pricing tiers and grant access keys, while consumers can purchase usage-based subscriptions or partial payments. Admins can manage providers, APIs, and transaction records.

The architecture emphasizes role-based access control, secure credential delivery, and real-time billing analytics for provider-owned APIs.

## Use Cases

1. API provider onboarding
   - Register provider accounts
   - Create APIs with pricing plans and categories
   - Monitor usage and billing data

2. Consumer API access
   - Register as users
   - Browse API marketplace by category
   - Purchase API access and receive credentials
   - Perform API requests via the proxy layer with usage tracking

3. Administrative control
   - Approve and manage providers and APIs
   - View transaction history
   - Delete suspicious or invalid provider accounts

4. Payment workflows
   - Create Razorpay orders
   - Verify payments securely
   - Record successful transactions for auditing

## Industry Value

This solution is valuable for industries that need metered API delivery, including:

- Fintech services
- Healthcare data providers
- SaaS analytics platforms
- IoT data streams
- Developer marketplaces

By operating on usage-based billing, it empowers API providers to monetize per-request usage and gives consumers more predictable cost control.

## Roles and Stakeholders

- **Admin**
  - Manages provider accounts and APIs
  - Monitors transaction history
  - Deletes unauthorized provider accounts

- **Provider**
  - Registers and logs in
  - Creates and manages APIs
  - Reviews consumer billing and usage data

- **User / Consumer**
  - Registers and logs in
  - Browses available APIs
  - Purchases API access
  - Uses credentials to invoke APIs through the platform

## Tech Stack

- Frontend
  - React 19
  - Vite
  - CSS modules and component-based UI

- Backend
  - Express 5
  - Node.js
  - MongoDB with Mongoose
  - JWT authentication
  - Cookie parsing and CORS

- Payments
  - Razorpay order creation and signature verification

- Hosting / Deployment
  - Typical deployment can use Node servers for backend and static hosting for frontend
  - Database hosted on MongoDB Atlas or a self-managed MongoDB instance

## Architectural Relationships

- `backend/server.js` initializes Express, configures middleware, and mounts all route groups.
- `middleware/auth.middleware.js` enforces user/provider/admin access based on JWT tokens.
- `models` define Mongoose schemas for `User`, `Provider`, `Admin`, `API`, and `Transaction`.
- `controllers` contain the business logic for authentication, API generation, billing, and transactions.
- `router` exposes the REST surface across users, providers, admins, Razorpay payments, transactions, and API management.
- Frontend pages consume backend endpoints and render role-specific dashboards.

## Frontend Summary

The frontend combines several role-specific flows:

- Public authentication pages for login and registration
- User dashboard for API subscriptions and usage
- Provider dashboard for API creation and billing analytics
- Admin dashboard for provider/API oversight
- Payment pages for Razorpay checkout and verification

The code structure under `frontend/src` includes:

- `components/` for reusable UI pieces
- `context/` for authentication wrappers
- `pages/` for route views and dashboards
- `redux/` for state management and auth slices

## Backend Summary

The backend is split into clear domains:

- `controller/` handles CRUD flows and business validation
- `router/` defines express routes and path conventions
- `model/` stores schema definitions and relationships
- `middleware/` protects routes and handles payment verification
- `config/` contains DB connection utilities

Key features:

- Provider API creation and lifecycle management
- User API purchase and usage tracking
- Role-based authentication and authorization
- Payment order creation and verification
- Admin-level provider and API management

## Screenshot Placeholders

Use these placeholders to capture app state during demos or reports:

- ![Screenshot: User Dashboard](screenshots/user-dashboard.png)
- ![Screenshot: Provider Dashboard](screenshots/provider-dashboard.png)
- ![Screenshot: Admin Dashboard](screenshots/admin-dashboard.png)
- ![Screenshot: API Marketplace](screenshots/api-marketplace.png)
- ![Screenshot: Razorpay Checkout](screenshots/razorpay-checkout.png)

> Replace placeholder paths with actual screenshot filenames after capture.

## Full API Documentation

Below is the complete API documentation content for the backend, inserted in full from `documents/apiDocumentation.md`.

---

# backend/server.js

## Overview

- Initializes Express app.
- Applies CORS with credentials support.
- Parses JSON and cookies.
- Connects routes to user, provider, admin, API provider, transaction, and Razorpay route modules.

---

# backend/router/user.route.js

## /userRegister

- Method: POST
- Path: `/api/user/userRegister`
- Description: Register a new user and issue an authentication token cookie.
- Authentication: none

### Input

```json
{
  "username": "john.doe",
  "email": "john@example.com",
  "password": "secretPassword",
  "role": "user"
}
```

### Output JSON

```json
{
  "message": "user registered successfully",
  "success": true,
  "user": { ... }
}
```

### Error Handling

- Missing required fields
  ```json
  { "message": "All fields are required", "success": false }
  ```
- Duplicate email
  ```json
  { "message": "user already exists", "success": false }
  ```
- Invalid role
  ```json
  { "message": "Invalid role", "success": false }
  ```
- Server error
  ```json
  { "message": "internal server error", "error": "...", "success": false }
  ```

### Frontend Response

- On success: store authentication cookie and redirect to the user dashboard.
- On failure: display form validation and duplicate account errors.

## /userLogin

- Method: POST
- Path: `/api/user/userLogin`
- Description: Authenticate a user and issue a JWT cookie.
- Authentication: none

### Input

```json
{
  "email": "john@example.com",
  "password": "secretPassword"
}
```

### Output JSON

```json
{
  "message": "user logged in successfully",
  "success": true,
  "user": { ... }
}
```

### Error Handling

- Missing fields
  ```json
  { "message": "All fields are required", "success": false }
  ```
- Invalid credentials
  ```json
  { "message": "Invalid credentials", "success": false }
  ```
- Server error
  ```json
  { "message": "internal server error", "error": "...", "success": false }
  ```

### Frontend Response

- On success: set auth cookie and navigate to user-protected routes.
- On failure: show invalid login toast.

## /userLogout

- Method: GET
- Path: `/api/user/userLogout`
- Description: Clear the user authentication cookie.
- Authentication: none required by route.

### Output JSON

```json
{ "msg": "Logged out successfully" }
```

### Error Handling

- Logout failure
  ```json
  { "msg": "user cant logout " }
  ```

### Frontend Response

- On success: clear session and redirect to login.

## /user/delete

- Method: DELETE
- Path: `/api/user/user/delete`
- Description: Delete an authenticated user account with password or email code verification.
- Authentication: `isAunthenticate`

### Input

```json
{ "password": "secretPassword" }
```

or

```json
{ "emailCode": "123456" }
```

### Output JSON

```json
{ "message": "user deleted sucessfully !", "success": true }
```

### Error Handling

- Missing credentials
  ```json
  { "message": "fill all the credentails", "success": false }
  ```
- Invalid credentials
  ```json
  { "message": "invalid credentails", "success": false }
  ```
- Server error
  ```json
  { "message": "internal server error", "error": "...", "success": false }
  ```

### Frontend Response

- On success: redirect to signup/login page.
- On failure: show validation message.

## /userDetail

- Method: GET
- Path: `/api/user/userDetail`
- Description: Retrieve the authenticated user profile.
- Authentication: `isAunthenticate`

### Output JSON

```json
{
  "message": "user found",
  "success": true,
  "userDetail": {
    "_id": "...",
    "username": "john.doe",
    "email": "john@example.com",
    "role": "user",
    "profilePicture": { "url": "", "imageId": "" },
    "isVerified": { "email": false, "phone": false },
    "subscriptionPlan": "free"
  }
}
```

### Error Handling

- User missing
  ```json
  { "messgae": "user not found! ", "success": false }
  ```
- Server error
  ```json
  { "message": "internal server error", "error": "...", "success": false }
  ```

### Frontend Response

- On success: populate user profile and authenticated layout.
- On failure: show session expiration message or redirect to login.

## /userUpdate

- Method: PUT
- Path: `/api/user/userUpdate`
- Description: Update the authenticated user's username and profile image metadata.
- Authentication: `isAunthenticate`

### Input

```json
{
  "username": "john.new",
  "profileUrl": "https://example.com/avatar.png",
  "ProfileImgId": "img_123"
}
```

### Output JSON

```json
{
  "message": "user detail updated successfully",
  "success": true,
  "userDetail": { ... }
}
```

### Error Handling

- User not found
  ```json
  { "messgae": "user not found! ", "success": false }
  ```
- Server error
  ```json
  { "message": "internal server error", "error": "...", "success": false }
  ```

### Frontend Response

- On success: update displayed profile data immediately.
- On failure: show profile update error alert.

## /getUserUsingApis

- Method: GET
- Path: `/api/user/getUserUsingApis`
- Description: Fetch all APIs linked to the authenticated user, including subscription and API metadata.
- Authentication: `isAunthenticate`

### Output JSON

```json
{
  "message": "User APIs fetched successfully",
  "success": true,
  "user": {
    "username": "john.doe",
    "email": "john@example.com",
    "role": "user",
    "subscriptionPlan": "free",
    "profilePicture": { ... }
  },
  "apis": [
    {
      "apiId": "...",
      "url": "https://provider-api.com",
      "keyCode": "...",
      "keyPassword": "...",
      "usage": 0,
      "apiBill": 0,
      "fullApiDoc": { ... }
    }
  ]
}
```

### Error Handling

- User not found
  ```json
  { "message": "User account not found!", "success": false }
  ```
- Server error
  ```json
  { "message": "Server error fetching user APIs", "success": false }
  ```

### Frontend Response

- On success: display subscribed APIs, API access keys, and usage/billing details.
- On failure: show an error notification and possibly retry.

## /codegen

- Method: GET
- Path: `/api/user/codegen`
- Description: Generate a numeric verification code for the authenticated user.
- Authentication: `isAunthenticate`

### Output JSON

```json
{ "message": "code gen", "code": "123456" }
```

### Error Handling

- Server error
  ```json
  { "message": "internal server error", "error": "...", "success": false }
  ```

### Frontend Response

- On success: display the generated code or use it in email verification / confirmation flows.

---

# backend/router/provider.route.js

## /providerRegister

- Method: POST
- Path: `/api/provider/providerRegister`
- Description: Register a provider account with optional email verification linkage and issue a provider token.
- Authentication: none

### Input

```json
{
  "username": "provider1",
  "email": "seller@example.com",
  "password": "ProviderPass123",
  "role": "provider"
}
```

### Output JSON

```json
{
  "message": "provider registered successfully",
  "success": true,
  "Provider": { ... }
}
```

### Error Handling

- Validation error: missing `email` or `password`
  ```json
  { "message": "All fields are required", "success": false }
  ```
- Duplicate provider error
  ```json
  { "message": "provider already exists", "success": false }
  ```
- Email not verified for existing user record
  ```json
  { "message": "email not verified !", "sucess": false }
  ```
- Server error
  ```json
  { "message": "internal server error", "error": "...", "success": false }
  ```

### Frontend Response

- On success: provider authentication cookie set, route to provider dashboard.
- On failure: display registration error and prompts for missing fields.

## /providerLogin

- Method: POST
- Path: `/api/provider/providerLogin`
- Description: Authenticate a provider and issue a provider JWT cookie.
- Authentication: none

### Input

```json
{
  "email": "seller@example.com",
  "password": "ProviderPass123"
}
```

### Output JSON

```json
{
  "message": "provider logged in successfully",
  "success": true,
  "providerDetail": { ... }
}
```

### Error Handling

- Provider not found
  ```json
  {
    "message": "provider not found",
    "success": false,
    "errors": [{ "msg": "provider not found" }]
  }
  ```
- Invalid credentials
  ```json
  { "message": "Invalid credentials", "success": false }
  ```
- Server error
  ```json
  { "message": "internal server error", "error": "...", "success": false }
  ```

### Frontend Response

- On success: save token cookie, redirect to provider panel.
- On failure: show login error.

## /providerLogout

- Method: GET
- Path: `/api/provider/providerLogout`
- Description: Clear the provider authentication cookie.
- Authentication: none required by route.

### Output JSON

```json
{ "msg": "Logged out successfully" }
```

### Error Handling

- Logout failure
  ```json
  { "msg": "user cant logout " }
  ```

### Frontend Response

- On success: clear provider session and redirect to login.

## /getProviderApi

- Method: GET
- Path: `/api/provider/getProviderApi`
- Description: Fetch provider-owned APIs and flattened consumer billing data.
- Authentication: `isProviderAuthenticate`

### Output JSON

```json
{
  "message": "provider api fetch!",
  "success": true,
  "providerApi": [ ... ],
  "billingData": [
    {
      "username": "john.doe",
      "email": "john@example.com",
      "totalRequest": 123,
      "totalAmount": 45.0
    }
  ]
}
```

### Error Handling

- Provider not found
  ```json
  { "message": "provider account not found!", "success": false }
  ```
- No APIs found
  ```json
  { "message": "error fetching the api's!", "success": false }
  ```
- Server error
  ```json
  { "message": "server error fetching provider api", "success": false }
  ```

### Frontend Response

- On success: populate provider API list, billing panel, and usage analytics.
- On failure: show error page or retry option.

## /getApiBilling

- Method: GET
- Path: `/api/provider/getApiBilling`
- Description: Alias for `/getProviderApi`; returns provider API documents.
- Authentication: `isProviderAuthenticate`

### Output JSON

Same as `/getProviderApi`.

## /providerDelete

- Method: DELETE
- Path: `/api/provider/providerDelete`
- Description: Delete the authenticated provider account after verifying password or email code.
- Authentication: `isProviderAuthenticate`

### Input

```json
{ "password": "ProviderPass123" }
```

or

```json
{ "emailCode": "123456" }
```

### Output JSON

```json
{ "message": "provider deleted sucessfully !", "success": true }
```

### Error Handling

- Missing credentials
  ```json
  { "message": "fill all the credentails", "success": false }
  ```
- Invalid credentials
  ```json
  { "message": "invalid credentails", "success": false }
  ```
- Server error
  ```json
  { "message": "internal server error", "error": "...", "success": false }
  ```

### Frontend Response

- On success: clear auth and return to provider signup/login.
- On failure: show credential validation error.

## /providerDetail

- Method: GET
- Path: `/api/provider/providerDetail`
- Description: Retrieve the authenticated provider profile.
- Authentication: `isProviderAuthenticate`

### Output JSON

```json
{
  "message": "provider found",
  "success": true,
  "providerDetail": { ... }
}
```

### Error Handling

- Not found
  ```json
  { "messgae": "provider not found! ", "success": false }
  ```
- Server error
  ```json
  { "message": "internal server error", "error": "...", "success": false }
  ```

### Frontend Response

- On success: display provider profile data in dashboard.

## /providerUpdate

- Method: PUT
- Path: `/api/provider/providerUpdate`
- Description: Update authenticated provider profile fields.
- Authentication: `isProviderAuthenticate`

### Input

```json
{
  "username": "provider.new",
  "profileUrl": "https://example.com/provider.png",
  "ProfileImgId": "img_456"
}
```

### Output JSON

```json
{
  "message": "provider detail updated successfully",
  "success": true,
  "providerDetail": { ... }
}
```

### Error Handling

- Not found
  ```json
  { "messgae": "provider not found! ", "success": false }
  ```
- Server error
  ```json
  { "message": "internal server error", "error": "...", "success": false }
  ```

### Frontend Response

- On success: update provider profile UI immediately.

## /providerCodegen

- Method: GET
- Path: `/api/provider/providerCodegen`
- Description: Generate a numeric verification code for a provider.
- Authentication: `isProviderAuthenticate`

### Output JSON

```json
{ "message": "code gen", "code": "123456" }
```

### Frontend Response

- On success: use generated code for verification workflows.

---

# backend/router/admin.route.js

## /createAdmin

- Method: POST
- Path: `/api/admin/createAdmin`
- Description: Register a new admin user with an admin secret token.
- Authentication: none

### Input

```json
{
  "username": "admin.user",
  "email": "admin@example.com",
  "password": "AdminPass123",
  "adminToken": "SECRET_KEY_ADMIN_TOKEN"
}
```

### Output JSON

```json
{
  "message": "Admin registered successfully",
  "success": true,
  "Admin": { ... }
}
```

### Error Handling

- Missing fields
  ```json
  { "message": "All fields are required", "success": false }
  ```
- Missing or invalid admin token
  ```json
  { "message": "sorry you are not authorized to continue!" }
  ```
  or
  ```json
  { "message": "wrong token you are not authorized to continue!" }
  ```
- Duplicate admin
  ```json
  { "message": "Admin already exists", "success": false }
  ```
- Server error
  ```json
  { "message": "Internal server error", "error": "...", "success": false }
  ```

### Frontend Response

- On success: set `apiAdminToken`, route to admin dashboard.
- On failure: display authorization message.

## /loginAdmin

- Method: POST
- Path: `/api/admin/loginAdmin`
- Description: Authenticate an admin and issue an admin JWT cookie.
- Authentication: none

### Input

```json
{
  "email": "admin@example.com",
  "password": "AdminPass123",
  "adminToken": "SECRET_KEY_ADMIN_TOKEN"
}
```

### Output JSON

```json
{
  "message": "Admin login successful",
  "success": true,
  "Admin": {
    "_id": "...",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

### Error Handling

- Missing fields
  ```json
  { "message": "All fields are required", "success": false }
  ```
- Missing or invalid admin token
  ```json
  { "message": "sorry you are not authorized to continue!" }
  ```
- Invalid credentials
  ```json
  { "message": "Invalid credentials", "success": false }
  ```
- Server error
  ```json
  { "message": "Internal server error", "error": "...", "success": false }
  ```

### Frontend Response

- On success: store admin auth cookie and grant admin interface access.

## /provider/delete

- Method: DELETE
- Path: `/api/admin/provider/delete`
- Description: Delete a provider by ID. Protected admin action.
- Authentication: `isAdminAuthenticate`

### Query / Path Parameters

- `id` is expected in `req.params`, but the route currently uses parameter path `/provider/delete` and controller reads `req.params.id`. This suggests the route should be called as `/api/admin/provider/delete?id=...` or updated to `/provider/delete/:id`.

### Output JSON

```json
{
  "message": "Provider deleted successfully",
  "success": true,
  "deletedProvider": { ... }
}
```

### Error Handling

- Missing provider ID
  ```json
  { "message": "Provider ID is required", "success": false }
  ```
- Provider not found
  ```json
  { "message": "Provider not found", "success": false }
  ```
- Server error
  ```json
  { "message": "Internal server error", "error": "...", "success": false }
  ```

### Frontend Response

- On success: remove provider from admin list and display confirmation.
- On failure: display error and preserve admin review state.

## /getAllProviders

- Method: GET
- Path: `/api/admin/getAllProviders`
- Description: Fetch providers, optionally filtered by name, with populated API billing data.
- Authentication: `isAdminAuthenticate`

### Query Parameters

- `name` (optional): partial provider username filter

### Output JSON

```json
{
  "message": "Providers fetched successfully",
  "success": true,
  "count": 1,
  "providers": [
    {
      "_id": "...",
      "username": "provider1",
      "email": "seller@example.com",
      "profilePicture": { ... },
      "isVerified": { ... },
      "subscriptionPlan": "free",
      "apis": [ ... ],
      "totalAmount": 123.45
    }
  ]
}
```

### Error Handling

- No providers found
  ```json
  { "message": "No providers found", "success": false }
  ```
- Server error
  ```json
  { "message": "Internal server error", "error": "...", "success": false }
  ```

### Frontend Response

- On success: display provider table with revenue and API data.

## /getAllApis

- Method: GET
- Path: `/api/admin/getAllApis`
- Description: Fetch all API records, optionally filtered by name.
- Authentication: `isAdminAuthenticate`

### Query Parameters

- `name` (optional): search term for API names

### Output JSON

```json
{
  "message": "APIs fetched successfully",
  "success": true,
  "count": 10,
  "apis": [ ... ]
}
```

### Error Handling

- No APIs found
  ```json
  { "message": "No APIs found", "success": false }
  ```
- Server error
  ```json
  { "message": "Internal server error", "error": "...", "success": false }
  ```

### Frontend Response

- On success: display API inventory for admin oversight.

---

# backend/router/apiProvider.route.js

## /createApi

- Method: POST
- Path: `/api/apiGen/createApi`
- Description: Create a new API entry for the authenticated provider.
- Authentication: `isProviderAuthenticate`

### Input

```json
{
  "baseUrl": "https://provider-service.com/api",
  "name": "Example API",
  "categories": "development",
  "description": "A usage-based API",
  "subscriptionPlan": "basic",
  "custom": {
    "partialpayment": { "amount": 30, "requestLimit": 1000 },
    "monthlypayment": { "amount": 199, "requestLimit": 8000 },
    "annualpayment": { "amount": 1999, "requestLimit": 120000 }
  }
}
```

### Output JSON

```json
{
  "message": "api created successfullly",
  "success": true,
  "createdApi": { ... }
}
```

### Error Handling

- Missing required fields
  ```json
  { "message": "All fields are required", "success": false }
  ```
- Duplicate baseUrl
  ```json
  { "message": "api areldy exists with provide api", "success": false }
  ```
- Provider not found
  ```json
  { "message": "provider already exists", "success": false }
  ```
- Server error
  ```json
  { "message": "internal server error", "error": "...", "success": false }
  ```

### Frontend Response

- On success: show created API card and link to manage API.
- On error: surface validation errors in creation form.

## /getProviderInfo

- Method: POST
- Path: `/api/apiGen/getProviderInfo`
- Description: Return provider API metrics and latency/status logs.
- Authentication: `isProviderAuthenticate`

### Query Parameters

- `time` (optional): human-readable time window, e.g. `2h`
- `apiId` (required): ID of the API to query

### Output JSON

```json
{
  "resultsLatency": [{ "time": "...", "latency": 120 }],
  "resultsStatus": [{ "time": "...", "status": 200 }],
  "request": 123
}
```

### Error Handling

- API not found
  ```json
  { "message": "API not found" }
  ```
- Server error
  ```json
  { "message": "Server error" }
  ```

### Frontend Response

- On success: populate analytics charts and KPI cards.

## /updateApiStatus/:apiId

- Method: PUT
- Path: `/api/apiGen/updateApiStatus/:apiId`
- Description: Toggle an API between `active` and `revoked`.
- Authentication: `isProviderAuthenticate`

### Path Parameters

- `apiId` (string): ID of the API to update

### Input

```json
{ "status": "active" }
```

### Output JSON

```json
{ "message": "api status updated!", "success": true, "status": "revoked" }
```

### Error Handling

- Unauthorized provider
  ```json
  { "message": "you are not the provider of this api!", "success": false }
  ```
- Server error
  ```json
  { "message": "internal server error", "error": "...", "success": false }
  ```

### Frontend Response

- On success: update API status badge in management UI.

## /deleteApi/:apiId

- Method: DELETE
- Path: `/api/apiGen/deleteApi/:apiId`
- Description: Delete an API owned by the authenticated provider.
- Authentication: `isProviderAuthenticate`

### Path Parameters

- `apiId` (string): ID of the API to delete

### Output JSON

```json
{ "message": "api deleted !", "success": true }
```

### Error Handling

- API or provider not found
  ```json
  { "message": "api not found !", "sucess": false }
  ```
  or
  ```json
  { "message": "provider not found !", "sucess": false }
  ```
- Unauthorized access
  ```json
  { "message": "you are not owner of this api !", "sucess": false }
  ```
- Server error
  ```json
  { "message": "internal server error", "error": "...", "success": false }
  ```

### Frontend Response

- On success: remove API from provider list and confirm deletion.

## /getAllApi

- Method: GET
- Path: `/api/apiGen/getAllApi`
- Description: Retrieve all APIs or filter by category for authenticated consumers.
- Authentication: `isAunthenticate`

### Query Parameters

- `category` (optional): filter APIs by category

### Output JSON

```json
{ "message": "api deleted !", "success": true, "allApi": [ ... ] }
```

### Error Handling

- User not registered
  ```json
  { "message": "user not registired in !", "success": false }
  ```
- Server error
  ```json
  { "message": "internal server error", "error": "...", "success": false }
  ```

### Frontend Response

- On success: show API marketplace list or category-filtered results.

## /getApi/:apiId

- Method: GET
- Path: `/api/apiGen/getApi/:apiId`
- Description: Retrieve API details and user-specific credential entries if purchased.
- Authentication: `isAunthenticate`

### Output JSON

Success when API entry exists:

```json
{
  "message": "api deleted !",
  "success": true,
  "api": { ... },
  "apiEntry": { ... },
  "userDetail": { ... },
  "credentailKey": { "key": "...", "keyPassword": "..." }
}
```

Success when no API entry exists for user:

```json
{
  "message": "api not deleted !",
  "success": true,
  "api": null,
  "apiEntry": null,
  "userDetail": { ... },
  "credentailKey": null
}
```

### Error Handling

- User not registered
  ```json
  { "message": "user not registired in !", "success": false }
  ```
- Server error
  ```json
  { "message": "internal server error", "error": "...", "success": false }
  ```

### Frontend Response

- On success: show API details and the user's purchased credentials when available.

## /apiRequest

- Method: GET
- Path: `/api/apiGen/apiRequest`
- Description: Proxy an authenticated API request to the provider endpoint and apply usage/billing logic.
- Authentication: `isAunthenticate`

### Query Parameters

- `endpoint` (optional): endpoint path appended to the provider base URL
- `apiName` (required): API name to match provider API

### Headers

- `api_provide_key`: API key string
- `api_provide_password`: API password string

### Output JSON

```json
{
  "messgae": "got the response",
  "data": { ... },
  "success": true,
  "status": 200
}
```

### Error Handling

- Missing API credentials
  ```json
  {
    "message": "please provide the authhontication keys! ",
    "success": false,
    "error": "API key and password required"
  }
  ```
- Invalid or inactive API key
  ```json
  { "message": "Invalid API key", "success": false }
  ```
  or
  ```json
  { "message": "API key not active" }
  ```
- Invalid API password
  ```json
  { "message": "Invalid API password" }
  ```
- User or API not found
  ```json
  { "message": "user not found!", "success": false }
  ```
  or
  ```json
  { "message": "API key not valid" }
  ```
- Subscription limit exceeded
  ```json
  { "messgae": "free limit has been crosed ! ", "sucess": false }
  ```
  or
  ```json
  {
    "messgae": "monthly subscription limit has been crosed ! ",
    "sucess": false
  }
  ```
  or
  ```json
  { "messgae": "annual subscription limit has been crosed ! ", "sucess": false }
  ```
- Server error
  ```json
  { "message": "internal server error", "error": "...", "success": false }
  ```

### Frontend Response

- On success: return provider response payload to the API consumer frontend.
- On limit or auth failure: surface billing or credential error messages.

## /setApi/:consumerId

- Method: POST
- Path: `/api/apiGen/setApi/:consumerId`
- Description: Assign a new API key/password to an authenticated consumer and record it on both API and user documents.
- Authentication: `isAunthenticate`

### Path Parameters

- `consumerId` (string): should match authenticated user ID via token

### Input

```json
{ "providerApiId": "..." }
```

### Output JSON

```json
{
  "message": "API purchased successfully",
  "success": true,
  "apiKey": "...",
  "apiPassword": "...",
  "credentailKey": { "key": "...", "keyPassword": "..." }
}
```

### Error Handling

- API not found
  ```json
  { "message": "API not found!", "success": false }
  ```
- Duplicate purchase
  ```json
  { "message": "API already purchased!", "success": false }
  ```
- User not found
  ```json
  { "message": "User not found!", "success": false }
  ```
- Server error
  ```json
  { "message": "Internal server error", "error": "...", "success": false }
  ```

### Frontend Response

- On success: display API credentials to the user and update purchased API list.

## /partialPayApi/:consumerId

- Method: POST
- Path: `/api/apiGen/partialPayApi/:consumerId`
- Description: Process a consumer partial payment or subscription purchase for an API.
- Authentication: `isAunthenticate`

### Path Parameters

- `consumerId` (string): ID of the consumer performing payment

### Input

```json
{
  "apiId": "...",
  "amount": 49,
  "type": "partialpayment"
}
```

### Output JSON

```json
{ "message": "payment done sucessfully", "success": true }
```

### Error Handling

- Missing API or user information
  ```json
  {
    "message": "Api or user not found ! ",
    "success": false,
    "error": "error fetching he user detail"
  }
  ```
- Already paid
  ```json
  { "message": "payment alredy done ( 20)", "success": false }
  ```
- Server error
  ```json
  { "message": "internal server error", "error": "...", "success": false }
  ```

### Frontend Response

- On success: confirm payment and enable API access or subscription status.
- On failure: show payment processing or billing errors.

---

# backend/router/transaction.route.js

## /creatTansaction

- Method: POST
- Path: `/api/transaction/creatTansaction`
- Description: Create a transaction record for a provider/service and a consumer.
- Authentication: none

### Input

```json
{
  "providerId": "...",
  "apiId": "...",
  "amount": 200,
  "consumerId": "..."
}
```

### Output JSON

```json
{
  "message": "Transaction created",
  "success": true,
  "transaction": { ... }
}
```

### Error Handling

- Server error
  ```json
  { "message": "Internal server error", "success": false, "error": "..." }
  ```

### Frontend Response

- On success: record transaction locally and update billing history.

## /updateTansaction

- Method: POST
- Path: `/api/transaction/updateTansaction`
- Description: Update transaction status and optionally set reference IDs.
- Authentication: none

### Input

```json
{
  "txnId": "...",
  "status": "paid",
  "transactionRef": "razorpay_payment_id"
}
```

### Output JSON

```json
{
  "message": "Transaction updated",
  "success": true,
  "transaction": { ... }
}
```

### Error Handling

- Transaction missing
  ```json
  { "message": "Transaction not found" }
  ```
- Server error
  ```json
  { "message": "Internal server error", "success": false, "error": "..." }
  ```

### Frontend Response

- On success: show success state and update transaction list.

## /transactions

- Method: GET
- Path: `/api/transaction/transactions`
- Description: Fetch paginated transaction history for admins.
- Authentication: `isAdminAuthenticate`

### Query Parameters

- `limit` (optional, default `20`)
- `page` (optional, default `1`)

### Output JSON

```json
{
  "message": "Transactions fetched successfully",
  "success": true,
  "count": 20,
  "transactions": [ ... ]
}
```

### Error Handling

- Server error
  ```json
  { "message": "Internal server error", "success": false, "error": "..." }
  ```

### Frontend Response

- On success: render paginated transaction dashboard.

## /transactions/provider

- Method: GET
- Path: `/api/transaction/transactions/provider`
- Description: Fetch transactions for the authenticated provider.
- Authentication: `isProviderAuthenticate`

### Output JSON

```json
{
  "message": "Provider transactions fetched successfully",
  "success": true,
  "count": 12,
  "transactions": [ ... ]
}
```

### Error Handling

- Provider ID missing
  ```json
  { "message": "Provider ID is required", "success": false }
  ```
- Server error
  ```json
  { "message": "Internal server error", "success": false, "error": "..." }
  ```

### Frontend Response

- On success: display provider transaction ledger.

---

# backend/router/razorpay.route.js

## /create-order

- Method: POST
- Path: `/api/ultriti/payment/create-order`
- Description: Create a Razorpay order for client-side payment.
- Authentication: none

### Input

```json
{ "amount": 300 }
```

### Output JSON

- Native Razorpay order object

### Error Handling

- Server error
  ```json
  { "error": "Order creation failed" }
  ```

### Frontend Response

- On success: proceed with Razorpay checkout using returned order details.

## /verify-payment

- Method: POST
- Path: `/api/ultriti/payment/verify-payment`
- Description: Verify Razorpay payment signature.
- Authentication: none

### Input

```json
{
  "razorpay_order_id": "...",
  "razorpay_payment_id": "...",
  "razorpay_signature": "..."
}
```

### Output JSON

```json
{ "success": true }
```

### Frontend Response

- On success: confirm payment completion.

---

# backend/middleware/auth.middleware.js

## isAunthenticate

- Purpose: Protect user/consumer routes.
- Mechanism: verify JWT from cookie or header `apiProviderToken`.
- Sets: `req.id`, `req.email`

### Failure Responses

- Missing token
  ```json
  { "error": "You are not authenticated" }
  ```
- Invalid token
  ```json
  { "err": "jwt error message" }
  ```

## isProviderAuthenticate

- Purpose: Protect provider-only routes.
- Mechanism: verify JWT from cookie or header `apiProviderToken`.
- Requires `decoded.role === "provider"`.

### Failure Responses

- Missing token
  ```json
  { "error": "You are not authenticated" }
  ```
- Invalid token
  ```json
  { "message": "unauthorized, token is invalid" }
  ```
- Wrong role
  ```json
  { "message": "you are not autherized ! -" }
  ```

## isAdminAuthenticate

- Purpose: Protect admin-only routes.
- Mechanism: verify JWT from cookie or header `apiAdminToken`.
- Requires `decoded.role === "admin"`.

### Failure Responses

- Missing token
  ```json
  { "error": "You are not authenticated" }
  ```
- Invalid token
  ```json
  { "message": "unauthorized, token is invalid" }
  ```
- Wrong role
  ```json
  { "message": "you are not autherized ! -" }
  ```

---

# backend/middleware/razorpay.payment.js

## createOrder(amount)

- Purpose: Create Razorpay order using configured credentials.
- Input: `amount` number (INR amount)
- Output: Razorpay order object

## verifyPayment(payload)

- Purpose: Confirm Razorpay signature.
- Input: `{ razorpay_order_id, razorpay_payment_id, razorpay_signature }`
- Output: `true | false`

---

# backend/model/admin.model.js

## Schema fields

| Field                           | Type    | Constraints                      | Default | Notes                                   |
| ------------------------------- | ------- | -------------------------------- | ------- | --------------------------------------- |
| `username`                      | String  | required, unique                 | —       | admin display name                      |
| `email`                         | String  | required, unique                 | —       | login identity                          |
| `adminToken`                    | String  | required                         | —       | must equal env `SECRET_KEY_ADMIN_TOKEN` |
| `password`                      | String  | required, select:false           | —       | hashed admin password                   |
| `profilePicture.url`            | String  | —                                | `""`    | profile avatar URL                      |
| `profilePicture.imageId`        | String  | —                                | `""`    | storage ID                              |
| `isVerified.email`              | Boolean | —                                | `false` | email verification state                |
| `isVerified.phone`              | Boolean | —                                | `false` | phone verification state                |
| `role`                          | String  | enum [`user`,`admin`,`provider`] | `admin` | always admin for this model             |
| `membership`                    | Boolean | —                                | `false` | membership status                       |
| `subscriptionPlan`              | String  | enum [`free`,`pro`,`enterprise`] | `free`  | plan tier                               |
| `subscriptionExpires`           | Date    | —                                | `null`  | subscription end date                   |
| `verificationCode.email`        | Number  | —                                | `null`  | email OTP                               |
| `verificationCode.phone`        | Number  | —                                | `null`  | phone OTP                               |
| `verificationCodeExpires.email` | Date    | —                                | `null`  | email OTP expiry                        |
| `verificationCodeExpires.phone` | Date    | —                                | `null`  | phone OTP expiry                        |
| `activityLogs`                  | Array   | —                                | `[]`    | audit trail                             |

## Methods

- `hashPassword(password)` — bcrypt hash
- `comparePassword(password, userPassword)` — bcrypt compare

## Usage

- Used by `admin.controller.js` for admin registration, login, and provider deletion validation.

---

# backend/model/provider.model.js

## Schema fields

| Field                           | Type    | Constraints                        | Default    | Notes                                  |
| ------------------------------- | ------- | ---------------------------------- | ---------- | -------------------------------------- |
| `username`                      | String  | required, unique                   | —          | provider display name                  |
| `email`                         | String  | required, unique                   | —          | provider login email                   |
| `password`                      | String  | required, select:false             | —          | hashed provider password               |
| `profilePicture.url`            | String  | —                                  | `""`       |
| `profilePicture.imageId`        | String  | —                                  | `""`       |
| `isVerified.email`              | Boolean | —                                  | `false`    |
| `isVerified.phone`              | Boolean | —                                  | `false`    |
| `role`                          | String  | enum [`user`,`admin`,`provider`]   | `provider` |
| `apiCreated`                    | Array   | —                                  | `[]`       | linked provider-created API references |
| `membership`                    | Boolean | —                                  | `false`    |
| `subscriptionPlan`              | String  | enum [`free`,`pro`,`enterprise`]   | `free`     |
| `subscriptionExpires`           | Date    | —                                  | `null`     |
| `paymentPrending`               | String  | enum [`pending`,`paid`,`settling`] | `pending`  | billing lifecycle status               |
| `verificationCode.email`        | Number  | —                                  | `null`     |
| `verificationCode.phone`        | Number  | —                                  | `null`     |
| `verificationCodeExpires.email` | Date    | —                                  | `null`     |
| `verificationCodeExpires.phone` | Date    | —                                  | `null`     |
| `activityLogs`                  | Array   | —                                  | `[]`       |                                        |

## Relationships

- `apiCreated.apiId` references `API` documents.

## Methods

- `hashPassword(password)` — bcrypt hash
- `comparePassword(password, userPassword)` — bcrypt compare

## Usage

- Used by `provider.controller.js`, `apiProvider.controller.js`, and `admin.controller.js`.
- Provider authentication uses `role: provider` in JWT.

---

# backend/model/user.model.js

## Schema fields

| Field                           | Type    | Constraints                      | Default | Notes                                        |
| ------------------------------- | ------- | -------------------------------- | ------- | -------------------------------------------- |
| `username`                      | String  | required, unique                 | —       |                                              |
| `email`                         | String  | required, unique                 | —       |                                              |
| `password`                      | String  | required, select:false           | —       |                                              |
| `profilePicture.url`            | String  | —                                | `""`    |                                              |
| `profilePicture.imageId`        | String  | —                                | `""`    |                                              |
| `isVerified.email`              | Boolean | —                                | `false` |                                              |
| `isVerified.phone`              | Boolean | —                                | `false` |                                              |
| `role`                          | String  | enum [`user`,`admin`,`provider`] | `user`  |                                              |
| `api`                           | Array   | —                                | `[]`    | user-owned API subscriptions and credentials |
| `cart`                          | Array   | —                                | `[]`    | wishlist/cart API references                 |
| `wishlist`                      | Array   | —                                | `[]`    |                                              |
| `subscriptionPlan`              | String  | enum [`free`,`pro`,`enterprise`] | `free`  |                                              |
| `subscriptionExpires`           | Date    | —                                | `null`  |                                              |
| `verificationCode.email`        | Number  | —                                | `null`  |                                              |
| `verificationCode.phone`        | Number  | —                                | `null`  |                                              |
| `verificationCodeExpires.email` | Date    | —                                | `null`  |                                              |
| `verificationCodeExpires.phone` | Date    | —                                | `null`  |                                              |

## Embedded `api` schema fields

| Field                                | Type     | Default                                                  | Notes                     |
| ------------------------------------ | -------- | -------------------------------------------------------- | ------------------------- |
| `apiId`                              | ObjectId | required                                                 | references `API`          |
| `url`                                | String   | `""`                                                     | base endpoint by provider |
| `Subscription.subscriptionPurchased` | Boolean  | `false`                                                  |
| `Subscription.ammount`               | Number   | `0`                                                      |
| `Subscription.requests`              | Number   | `0`                                                      |
| `Subscription.maxRequests`           | Number   | `500`                                                    |
| `Subscription.type`                  | String   | enum [`partialpayment`,`monthlypayment`,`annualpayment`] | `partialpayment`          |
| `partialPayment`                     | Boolean  | `false`                                                  |
| `keyCode`                            | String   | `""`                                                     |
| `keyPassword`                        | String   | `""`                                                     |
| `usage`                              | Number   | `0`                                                      |
| `apiBill`                            | Number   | `0`                                                      |

## Methods

- `hashPassword(password)` — bcrypt hash
- `comparePassword(password, userpassword)` — bcrypt compare

## Usage

- Used by `user.controller.js`, `provider.controller.js`, `apiProvider.controller.js`, and `transaction.controller.js`.
- Tracks purchased APIs, user-specific credentials, usage, and billing state.

---

# backend/model/api.model.js

## Schema fields

| Field                               | Type     | Constraints                                                       | Default         | Notes                          |
| ----------------------------------- | -------- | ----------------------------------------------------------------- | --------------- | ------------------------------ |
| `providerId`                        | ObjectId | required                                                          | —               | references provider owner      |
| `description`                       | String   | —                                                                 | `""`            |                                |
| `name`                              | String   | required                                                          | —               |                                |
| `baseUrl`                           | String   | required                                                          | —               |                                |
| `platformUrl`                       | String   | required                                                          | default env URL |                                |
| `status`                            | String   | enum [`active`,`revoked`]                                         | `active`        |                                |
| `subscriptionPlan.subscriptionType` | String   | enum [`basic`,`pro`,`Model`,`Heavy Model`,`Ultra Heavy`,`custom`] | `basic`         |                                |
| `subscriptionPlan.price.*`          | Object   | —                                                                 | default values  | pricing tiers and request caps |
| `apiKeys`                           | Array    | —                                                                 | `[]`            | consumer access keys           |
| `usageLogs`                         | Array    | —                                                                 | `[]`            | per-key usage and latency logs |
| `categories`                        | String   | enum [multiple]                                                   | `development`   |                                |
| `billing.totalRequests`             | Number   | —                                                                 | `0`             |                                |
| `billing.totalAmount`               | Number   | —                                                                 | `0`             |                                |
| `billing.amount`                    | Number   | —                                                                 | `0`             |                                |
| `billing.status`                    | String   | enum [`pending`,`paid`]                                           | `pending`       |                                |
| `billing.invoiceDate`               | Date     | —                                                                 | `Date.now`      |                                |
| `billing.consumerDetail`            | Array    | —                                                                 | `[]`            | payment history records        |
| `createdAt`                         | Date     | —                                                                 | `Date.now`      |                                |

## Embedded `apiKeys` fields

| Field        | Type     | Required                  | Notes                  |
| ------------ | -------- | ------------------------- | ---------------------- |
| `consumerId` | ObjectId | no                        | references `User`      |
| `key`        | String   | yes                       | API access key, unique |
| `status`     | String   | enum [`active`,`revoked`] | `active`               |
| `createdAt`  | Date     | —                         | timestamp              |

## Embedded `usageLogs` fields

| Field       | Type          | Notes                 |
| ----------- | ------------- | --------------------- |
| `apiKey`    | String        | key used for request  |
| `endpoint`  | String        | provider endpoint URL |
| `timestamp` | Array<Date>   | request timestamps    |
| `status`    | Array<Number> | HTTP status codes     |
| `latency`   | Array<Number> | latency values in ms  |

## Billing `consumerDetail`

| Field         | Type     | Default                 | Notes                   |
| ------------- | -------- | ----------------------- | ----------------------- |
| `customerId`  | ObjectId | —                       | references `User`       |
| `ammountPaid` | Number   | `0`                     | amount paid by consumer |
| `paidAt`      | Date     | `Date.now`              |
| `status`      | String   | enum [`pending`,`paid`] | `pending`               |

## Methods

- `hashKeys(keyId)` — bcrypt hash of API key/password
- `compareKeys(keys, consumerKeys)` — bcrypt compare

## Usage

- Used by `apiProvider.controller.js`, `admin.controller.js`, and `user.controller.js` for API creation, purchase, usage logging, and billing.

---

# backend/model/transaction.model.js

## Schema fields

| Field                        | Type     | Constraints                                  | Default                    | Notes                 |
| ---------------------------- | -------- | -------------------------------------------- | -------------------------- | --------------------- |
| `providerId`                 | ObjectId | required                                     | —                          | references `Provider` |
| `apiId`                      | ObjectId | required                                     | —                          | references `API`      |
| `amount`                     | Number   | required                                     | —                          | transaction amount    |
| `currency`                   | String   | —                                            | `INR`                      |
| `status`                     | String   | enum [`pending`,`settling`,`paid`]           | `pending`                  |
| `paymentMethod`              | String   | enum [`razorpay`,`stripe`,`paypal`,`manual`] | `razorpay`                 |
| `transactionRef`             | String   | —                                            | payment provider reference |
| `invoiceDate`                | Date     | —                                            | `Date.now`                 |
| `settledAt`                  | Date     | —                                            | —                          |
| `consumerDetail.customerId`  | ObjectId | —                                            | references `User`          |
| `consumerDetail.ammountPaid` | Number   | —                                            | `0`                        |
| `consumerDetail.paidAt`      | Date     | —                                            | —                          |
| `consumerDetail.status`      | String   | enum [`pending`,`paid`]                      | `pending`                  |

## Usage

- Used by `transaction.controller.js` to create and update payment records.
- Populated for admin and provider transaction reports.

---

# Common Error Taxonomy

## Validation errors

- Missing required body fields: `400`
- Duplicate unique values: `400`
- Incorrect route payload format: `400`

Example:

```json
{ "message": "All fields are required", "success": false }
```

## Authentication / authorization errors

- Missing token: `401`
- Invalid token: `404` in current middleware implementation
- Role mismatch for provider/admin: `404`

Example:

```json
{ "error": "You are not authenticated" }
```

or

```json
{ "message": "you are not autherized ! -" }
```

## Database errors

- Missing resource: `404`
- Query failure or missing reference: `400` or `500`

Example:

```json
{ "message": "Provider not found", "success": false }
```

## Server errors

- Unexpected exceptions: `500`
- Internal runtime or third-party failure

Example:

```json
{ "message": "internal server error", "error": "...", "success": false }
```

---

# Notes for frontend integration

- Authentication flow uses secure cookies. Include `credentials: true` in fetch/XHR requests.
- For protected routes, provide JWT cookie automatically or pass the token in header `apiProviderToken` / `apiAdminToken`.
- API access requests rely on headers `api_provide_key` and `api_provide_password` for `/api/apiGen/apiRequest`.
- Many endpoints return `success: true/false` and `message`; use these fields for toast notifications.
- Because some routes return nonstandard messages (for example `"api deleted !"` in `getAllApi`), the frontend should rely on `success` and HTTP status when possible.

---

# Implementation caveats

- `admin.route.js` currently defines `DELETE /provider/delete` but controller expects `req.params.id`. The route should be refactored to accept `/:id` or query parameter.
- `apiProvider.controller.js` uses the message `"api deleted !"` for success responses in product-listing routes; this appears inconsistent with actual semantics.
- `transaction.route.js` contains typos in route paths (`creatTansaction`, `updateTansaction`). Frontend must call the exact path strings as defined.
- Several routes use `status: 201` for success fetching operations; this is acceptable in current implementation but not conventional. Use frontend guard logic on `success: true` as well as status code.

---

# Recommended request patterns

- Use `POST` for create and modify actions, `GET` for retrieval, `PUT` for updates, and `DELETE` for removal.
- Always include `Content-Type: application/json` for JSON bodies.
- Use `credentials: 'include'` and CORS with `origin` allowed domains from `server.js`.
- For authenticated calls, set cookies on login/register and keep them in browser requests.

## Conclusion

This combined document provides both the overview of the Usage-Based API Billing Platform and the complete backend API documentation.

Use the sections above to understand the application structure, stakeholders, and integration requirements. The appended API documentation includes all route definitions, request/response expectations, error conditions, and implementation notes for the backend.
