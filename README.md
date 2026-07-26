# 🩸 Pangsha Blood Donors Association (PBDA) - Blood Donation Campaign Management System

![Version](https://img.shields.io/badge/version-1.0.0-rose.svg)
![Build Status](https://img.shields.io/badge/build-passing-emerald.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 📌 Overview
The **Pangsha Blood Donors Association (PBDA)** Management System is an enterprise-grade, localized, real-time blood donation and campaign management platform built for Pangsha Upazila, Rajbari District, and surrounding regions in Bangladesh.

It provides end-to-end automation for blood donor management, emergency blood requests, real-time donor eligibility tracking, multi-channel automated notifications (Telegram & WhatsApp), role-based access control (RBAC), backup/restore operations, and real-time public stats.

---

## ✨ Key Capabilities & Modules

### 1. 🩸 Donor Management System
* **Search & Multi-Filter Engine**: Instant live filtering by Blood Group, Division, District, Upazila, Union, Verification Status, and Availability.
* **Smart Eligibility Calculator**: Auto-calculates 90-day minimum gap since last donation date in Bengali locale.
* **Verification Workflow**: Badge-based multi-tier verification (Unverified, Pending, Verified, Elite).
* **Trash & Soft Delete**: Full soft-delete and instant 1-click restoration engine for deleted donor records.

### 2. 🆘 Emergency Blood Requests
* **Priority Matching**: CRITICAL, URGENT, and NORMAL request priority tags with dynamic matching algorithms.
* **Status Pipeline**: Searching -> Matched -> Fulfilled -> Cancelled with full audit trails.
* **Donor-Request Auto Match**: Algorithmic suggestion of compatible available donors based on blood group compatibility matrix and geolocation proximity.

### 3. 🔐 Enterprise Security & RBAC
* **Role Hierarchy**: Super Admin, Admin, Volunteer, and Public Visitor permissions.
* **Automated Security Audit**: Built-in vulnerability scanner for SQL injection defense, XSS sanitization, CSRF token validation, and JWT token revocation blacklisting.
* **Rate Limiting**: Sliding-window rate limiters protecting authentication, public searches, blood requests, and export endpoints.

### 4. 📢 Automated Multi-Channel Communication
* **Telegram Group Bot**: Instant automated broadcasts for urgent blood requests to PBDA volunteer groups.
* **WhatsApp Provider Integration**: QR-based or HTTP Gateway session management for direct SMS/WhatsApp donor alerts.
* **Broadcast Campaign Studio**: Templated messaging engine with custom variables (`{DONOR_NAME}`, `{BLOOD_GROUP}`, `{HOSPITAL_NAME}`, `{CONTACT_NUMBER}`).

### 5. 📊 Analytics, Export & Backups
* **Real-time Dashboard**: Live counter cards, blood inventory charts (Recharts), and regional density heatmaps.
* **Multi-Format Export**: One-click download of filtered reports in Excel (`.xlsx`), CSV, and styled PDF formats.
* **Data Integrity**: In-memory DB snapshotting, local file backups, and Supabase cloud persistence synchronization.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Tailwind CSS v4, Lucide React, Recharts, Motion |
| **Backend** | Express.js (Node.js CJS/ESM), TypeScript, ESBuild, TSX |
| **Database & Cache** | In-Memory Object Store with JSON Persistence + Supabase PostgreSQL Engine + Tagged In-Memory Cache |
| **Authentication** | JSON Web Tokens (JWT) with server-side revocation blacklist & bcryptjs hashing |
| **Notification APIs** | Telegram Bot API, WhatsApp QR Gateway Service |

---

## 🚀 Quick Start (Local Development)

```bash
# 1. Clone Repository
git clone https://github.com/pbda/blood-donation-system.git
cd blood-donation-system

# 2. Install Dependencies
npm install

# 3. Configure Environment Variables
cp .env.example .env

# 4. Start Development Server
npm run dev
```

The application will be accessible at `http://localhost:3000`.

---

## 📄 Documentation Index
* 📖 [Deployment Guide](./DEPLOYMENT.md)
* 🔐 [Environment Variable Reference](./ENVIRONMENT_VARIABLES.md)
* 👨‍💼 [Admin Manual](./ADMIN_MANUAL.md)
* 🤝 [Volunteer Manual](./VOLUNTEER_MANUAL.md)
* 📦 [Release Notes v1.0.0](./RELEASE_NOTES_v1.0.0.md)
* 📜 [Changelog](./CHANGELOG.md)

---

## 🛡️ License
Copyright © 2026 Pangsha Blood Donors Association (PBDA). All rights reserved.
