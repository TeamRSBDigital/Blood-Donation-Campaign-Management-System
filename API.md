# 📡 REST API Documentation - PBDA Blood Donation System

## 1. Overview
All API endpoints follow RESTful conventions under the `/api` route namespace.

---

## 2. Authentication & Authorization Headers
Protected endpoints require a JWT Bearer Token passed in the `Authorization` header:
```http
Authorization: Bearer <YOUR_JWT_TOKEN>
```

---

## 3. Public API Endpoints

### 3.1 `GET /api/health`
- **Description**: Returns system health status, memory usage, and operational diagnostics.
- **Authentication**: None.
- **Response**:
  ```json
  {
    "status": "healthy",
    "timestamp": "2026-07-26T10:00:00.000Z",
    "uptime": 120.45,
    "database": { "status": "operational", "donorCount": 420 },
    "cache": { "keys": 12 }
  }
  ```

---

### 3.2 `GET /api/stats`
- **Description**: Cached aggregate counts of total donors, total requests, fulfilled requests, and emergency counts.
- **Authentication**: None.
- **Response**:
  ```json
  {
    "totalDonors": 420,
    "totalRequests": 142,
    "fulfilledRequests": 128,
    "urgentRequests": 2
  }
  ```

---

### 3.3 `GET /api/donors/public`
- **Description**: Public query endpoint for searching available blood donors with privacy masking on contact details unless filtered.
- **Authentication**: None.
- **Query Parameters**:
  - `bloodGroup` (e.g., `A+`, `O-`)
  - `upazila` (e.g., `Pangsha`)
  - `search` (Search query string)
- **Response**: Array of donor objects.

---

### 3.4 `POST /api/donors/public-register`
- **Description**: Public registration form for new blood donors. Sets status to `PENDING`.
- **Authentication**: None.
- **Request Body**:
  ```json
  {
    "name": "আব্দুল করিম",
    "phone": "01812999000",
    "bloodGroup": "O+",
    "division": "ঢাকা",
    "district": "রাজবাড়ী",
    "upazila": "পাংশা",
    "union": "বাবুপাড়া",
    "lastDonationDate": "2025-10-15"
  }
  ```

---

### 3.5 `POST /api/requests/public`
- **Description**: Public form to submit an emergency blood request. Automatically triggers Telegram bot broadcast if urgency is `CRITICAL` or `URGENT`.
- **Authentication**: None.
- **Request Body**:
  ```json
  {
    "patientName": "রহিম চৌধুরী",
    "bloodGroup": "A+",
    "bagsRequired": 2,
    "hospitalName": "পাংশা উপজেলা স্বাস্থ্য কমপ্লেক্স",
    "district": "রাজবাড়ী",
    "upazila": "পাংশা",
    "urgency": "CRITICAL",
    "contactName": "করিম চৌধুরী",
    "contactPhone": "01711000111"
  }
  ```

---

## 4. Protected Administrative APIs

### 4.1 `POST /api/auth/login`
- **Description**: Authenticates admin/volunteer users and returns a signed JWT token.
- **Request Body**:
  ```json
  {
    "email": "admin@pbda.org",
    "password": "Password123!"
  }
  ```
- **Response**:
  ```json
  {
    "token": "eyJhbGciOiJIUzI1NiIsInR5...",
    "user": {
      "id": "u1",
      "name": "Super Admin",
      "email": "admin@pbda.org",
      "role": "SUPER_ADMIN"
    }
  }
  ```

---

### 4.2 `POST /api/auth/logout`
- **Description**: Blacklists the current JWT Bearer Token on the server to prevent replay attacks.
- **Authentication**: Required (`SUPER_ADMIN`, `ADMIN`, `VOLUNTEER`).

---

### 4.3 `GET /api/donors`
- **Description**: Returns complete list of blood donors with unmasked contact numbers and audit info.
- **Authentication**: Required (`SUPER_ADMIN`, `ADMIN`, `VOLUNTEER`).

---

### 4.4 `PUT /api/donors/:id/verify`
- **Description**: Updates donor verification badge (`VERIFIED`, `REJECTED`, `ELITE`).
- **Authentication**: Required (`SUPER_ADMIN`, `ADMIN`).

---

### 4.5 `POST /api/backup/create`
- **Description**: Triggers snapshot generation and returns full JSON database export.
- **Authentication**: Required (`SUPER_ADMIN`).

---

### 4.6 `POST /api/backup/restore`
- **Description**: Restores database state from uploaded JSON snapshot.
- **Authentication**: Required (`SUPER_ADMIN`).
