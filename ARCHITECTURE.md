# 🏗️ Technical Architecture & System Flow Diagrams - PBDA System

## 1. High-Level Architecture
The PBDA Blood Donation Management System is built on a modular Node.js Express server with a React 18 frontend, operating behind security middlewares with an in-memory data cache and local file snapshot store.

```
                    ┌────────────────────────────────┐
                    │     HTTP Client (Web / PWA)    │
                    └───────────────┬────────────────┘
                                    │ HTTPS Request
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        Express API Middleware Layer                    │
│ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────────────┐ │
│ │ Security Headers │ │  Rate Limiting   │ │ JWT Bearer Auth Guard    │ │
│ └──────────────────┘ └──────────────────┘ └──────────────────────────┘ │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ Validated Request
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                          Core Business Logic                           │
│ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────────────┐ │
│ │  Donor Services  │ │ Request Matcher  │ │  Notification Engine     │ │
│ └──────────────────┘ └──────────────────┘ └──────────────────────────┘ │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ State Operations
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                          Data & Cache Tier                             │
│ ┌──────────────────┐ ┌──────────────────┐ ┌──────────────────────────┐ │
│ │  In-Memory State │ │ Tagged App Cache │ │ JSON Persistence Snapshot│ │
│ └──────────────────┘ └──────────────────┘ └──────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Authentication Sequence Diagram

```
User (Client)                     Express Server                  Security/JWT Engine
     │                                   │                                 │
     ├─── 1. POST /api/auth/login ──────>│                                 │
     │    (email, password)              │                                 │
     │                                   ├─── 2. Validate Credentials ────>│
     │                                   │    (Compare bcrypt hash)        │
     │                                   │<── 3. Hash Valid ───────────────┤
     │                                   │                                 │
     │                                   ├─── 4. Sign JWT Token ──────────>│
     │                                   │<── 5. Signed JWT Bearer Token ──┤
     │<── 6. 200 OK (Token, User) ───────┤                                 │
     │                                   │                                 │
     ├─── 7. GET /api/donors ───────────>│                                 │
     │    (Header: Bearer Token)         ├─── 8. Verify Token & Blacklist ─>│
     │                                   │<── 9. Token Valid ──────────────┤
     │<── 10. 200 OK (Donor Data) ──────┤                                 │
```

---

## 3. Donor Registration & Eligibility Flow

```
[ New Donor Form ]
       │
       ▼
[ Validate Phone & Required Fields ]
       │
       ▼
[ Calculate Days Since Last Donation ]
       │
 ┌─────┴───────────────────────────────┐
 ▼                                     ▼
[ Days >= 90 ]                       [ Days < 90 ]
 │                                     │
 ▼                                     ▼
Set Status: AVAILABLE                Set Status: DONATED_RECENTLY
 │                                     │
 └──────────────────┬──────────────────┘
                    │
                    ▼
          [ Save Record to DB ]
                    │
                    ▼
     [ Set Verification: PENDING ]
                    │
                    ▼
      [ Trigger Volunteer Notification ]
```

---

## 4. Emergency Blood Request Matching Flow

```
[ Urgent Blood Request Received ]
               │
               ▼
   [ Extract Blood Group & Location ]
               │
               ▼
[ Match Compatible Blood Groups ]
(e.g., O- matches A+, B+, AB+, O+)
               │
               ▼
[ Filter Donors: Available & verified ]
               │
               ▼
[ Sort by Proximity (Upazila -> District) ]
               │
               ▼
┌──────────────┴──────────────┐
▼                             ▼
[ Display Matched Donors UI ]  [ Auto-Broadcast Telegram Group ]
```
