# 📖 Full Project Documentation - PBDA Blood Donation System

## 1. Executive Overview
The **Pangsha Blood Donors Association (PBDA)** Management System is an end-to-end digital platform designed to solve emergency blood scarcity in Pangsha Upazila, Rajbari District, and nearby areas in Bangladesh. It bridges blood donors, patients, volunteers, and campaign administrators into a unified, secure, real-time web application.

---

## 2. Architecture Overview
The system follows a full-stack, single-repository architecture combining a React 18 frontend powered by Vite with an Express.js Node.js server. 

```
                                 ┌─────────────────────────┐
                                 │   Browser / Mobile UI   │
                                 │ (React 18 + Tailwind v4)│
                                 └────────────┬────────────┘
                                              │ HTTP / JSON
                                              ▼
                                 ┌─────────────────────────┐
                                 │  Express API Server     │
                                 │  (Security, Auth, RBAC) │
                                 └──────┬──────────┬───────┘
                                        │          │
                     ┌──────────────────┘          └──────────────────┐
                     ▼                                                ▼
       ┌───────────────────────────┐                    ┌───────────────────────────┐
       │ In-Memory DB & Cache Engine│                    │ External Broadcast Services│
       │  (JSON File Snapshot Sync)│                    │  (Telegram Bot, WhatsApp) │
       └───────────────────────────┘                    └───────────────────────────┘
```

---

## 3. Technology Stack Breakdown

| Technology | Role | Purpose |
| :--- | :--- | :--- |
| **React 18** | Frontend Framework | Single Page Application UI rendering |
| **TypeScript 5** | Programming Language | Static type checks and strict interface safety |
| **Tailwind CSS v4** | Styling | Responsive, high-contrast, utility-first UI design |
| **Lucide React** | Icons | SVG icon suite for interface elements |
| **Recharts** | Data Visualization | Analytics charts for blood group inventory |
| **Express.js** | Backend API Framework | REST API endpoint handlers and routing |
| **ESBuild / TSX** | Compiler / Runner | Server bundling into executable CommonJS (`dist/server.cjs`) |
| **JWT (jsonwebtoken)** | Authentication | Stateless bearer token session management |
| **bcryptjs** | Password Security | One-way password hashing for admin credentials |

---

## 4. Module Specifications

### 4.1 Donor Management Module
* **Search & Filters**: Search by donor name, phone, blood group (`A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`), division, district, upazila, union, and verification status.
* **Eligibility Rules**: Donors must maintain a minimum 90-day interval between donations. The system calculates eligibility dynamically:
  $$\text{Eligibility Status} = \begin{cases} \text{AVAILABLE} & \text{if } \text{days\_since\_last\_donation} \ge 90 \\ \text{DONATED\_RECENTLY} & \text{otherwise} \end{cases}$$
* **Verification Triage**: Unverified -> Pending -> Verified -> Elite.

### 4.2 Blood Request Module
* **Urgency Classification**: `CRITICAL` (Instant alert), `URGENT` (Priority match), `NORMAL` (Standard queue).
* **Compatibility Engine**: Auto-suggests compatible donor groups according to medical standard matrix (e.g. O- universal donors match all types).
* **Status Pipeline**: `PENDING` -> `SEARCHING` -> `MATCHED` -> `FULFILLED` -> `CANCELLED`.

### 4.3 Multi-Channel Communication
* **Telegram Group Bot**: Broadcasts urgent blood requests directly to designated PBDA volunteer group chats with patient location, required bags, and contact numbers.
* **WhatsApp Provider**: Connects via HTTP API or QR Code session to dispatch direct SMS/WhatsApp notifications to matched donors.

### 4.4 Backup, Restore & Data Integrity
* **JSON File Storage**: System state automatically syncs to `pbda_data.json`.
* **Manual & Auto Backup**: Admin can export full JSON DB snapshots at any time or restore from saved files.
* **Soft Delete Engine**: All entity deletions (donors, requests, users) mark records as `is_deleted = true` in trash, allowing 1-click restoration.

---

## 5. Directory & File Manifest

- `/src/components/`: Modular React components (`Header.tsx`, `Footer.tsx`, `DonorCard.tsx`, `DonorModal.tsx`, `RequestModal.tsx`, `ErrorBoundary.tsx`).
- `/src/layouts/`: Public layout (`PublicLayout.tsx`), Admin layout (`AdminLayout.tsx`), Volunteer layout (`VolunteerLayout.tsx`).
- `/src/server/`: Backend service modules (`security.ts`, `cacheService.ts`, `notificationService.ts`, `whatsappQrService.ts`, `db.ts`).
- `/server.ts`: Complete Express server implementation containing API endpoints and Vite dev middleware integration.
- `/pbda_data.json`: Core JSON data store containing donors, requests, users, activity logs, and settings.
