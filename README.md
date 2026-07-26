# 🩸 Pangsha Blood Donors Association (PBDA) - Management System

![Version](https://img.shields.io/badge/version-1.0.0-rose.svg)
![Build Status](https://img.shields.io/badge/build-passing-emerald.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Locale](https://img.shields.io/badge/locale-bn--BD-red.svg)

## 📌 Project Description
The **Pangsha Blood Donors Association (PBDA)** Management System is a full-stack, enterprise-grade, localized blood donation and campaign management application. Designed for Pangsha Upazila, Rajbari District, and surrounding regions in Bangladesh, it automates blood donor registration, emergency blood request matching, multi-channel messaging (Telegram Bot & WhatsApp Gateway), role-based access control (RBAC), and automated data backups.

---

## ✨ Key Features

- **🩸 Smart Blood Donor Directory**: Multi-criteria search by Blood Group, Division, District, Upazila, Union, Verification Badge, and Availability. Auto-calculates 90-day minimum donation gap with Bengali localized dates.
- **🆘 Emergency Request & Compatibility Matcher**: Prioritized blood request pipeline (`CRITICAL`, `URGENT`, `NORMAL`) with automatic blood group compatibility matching (e.g. O- universal donors) and distance/upazila sorting.
- **🔐 Enterprise Security & RBAC**: JWT Authentication with server-side token revocation blacklist, sliding-window rate limiters, recursive XSS sanitization, and CSRF token verification.
- **📢 Multi-Channel Notification Engine**: Telegram Group Bot integration for auto-broadcasting urgent requests, and WhatsApp QR Gateway Service for SMS/WhatsApp donor outreach.
- **📊 Real-time Dashboard & Recharts**: Live inventory metrics, blood group distribution charts, and regional density visualization.
- **📁 Data Export & Reports**: Custom report generator exporting filtered donor datasets to Excel (`.xlsx`), CSV, and PDF formats.
- **🗄️ In-Memory & Supabase Sync**: Local JSON DB snapshot engine with full Supabase PostgreSQL database synchronization and 1-click restore capabilities.
- **🗑️ Soft Delete & Trash Management**: 1-click restoration for soft-deleted donors, requests, and administrative user records.

---

## 🖼️ Application Screenshots & Interface

```
+-----------------------------------------------------------------------+
|  🩸 পাংশা ব্ল্যাড ডোনার্স অ্যাসোসিয়েশন (PBDA)          [জরুরী রক্ত চান] [এডমিন]  |
+-----------------------------------------------------------------------+
|  [ 🔍 রক্তদাতা খুঁজুন ]  [ 🆘 রক্তের আবেদন ]  [ 📊 ড্যাশবোর্ড ]  [ 📢 নোটিশ ]   |
+-----------------------------------------------------------------------+
|                                                                       |
|   মোট রক্তদাতা     আজকের আবেদন     সফল রক্তদান     জরুরী আবেদন         |
|      ৪২০ জন          ১২ টি           ৩৫৮ টি          ২ টি             |
|                                                                       |
|   +---------------------------------------------------------------+   |
|   | 🩸 রক্তদাতা ফিল্টার: [ গ্রুপ: A+ ] [ উপজেলা: পাংশা ] [ প্রস্তুত ]|   |
|   +---------------------------------------------------------------+   |
|   | 👤 মোঃ রফিকুল ইসলাম | A+ | পাংশা, রাজবাড়ী | 📞 01812XXXXXX      |   |
|   | 🏷️ যাচাইকৃত ডোনার  | প্রস্তুত (সর্বশেষ দান: ২০ জানুয়ারি ২০২৬) |   |
|   +---------------------------------------------------------------+   |
+-----------------------------------------------------------------------+
```

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS v4, Lucide React, Recharts, Motion.
- **Backend**: Express.js (Node.js runtime), TypeScript, TSX, ESBuild compiler.
- **Database**: In-Memory JavaScript State with JSON file persistence & Supabase PostgreSQL support.
- **Auth**: JWT (JSON Web Tokens) with server-side revocation blacklist, bcryptjs password hashing.
- **Messaging**: Telegram Bot API, WhatsApp QR/Provider HTTP Gateway.

---

## 🚀 Installation & Local Development Setup

### Prerequisites
- Node.js v18.x or v20.x installed.
- Git installed.

### Step-by-Step Installation

1. **Clone the Repository**:
   ```bash
   git clone https://github.com/pbda/blood-donation-system.git
   cd blood-donation-system
   ```

2. **Install Dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the project root (see `.env.example`):
   ```env
   NODE_ENV=development
   PORT=3000
   JWT_SECRET=pbda_pangsha_blood_donors_secret_key_2026
   TELEGRAM_BOT_TOKEN=123456789:ABCdefGHIjklMNOpqrsTUVwxyZ
   TELEGRAM_CHAT_ID=-100123456789
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your web browser.

---

## ⚙️ Environment Variables Summary

| Variable | Required | Description |
| :--- | :---: | :--- |
| `NODE_ENV` | Yes | `development` or `production`. |
| `PORT` | No | Server HTTP port (default: `3000`). |
| `JWT_SECRET` | Yes | Secret key for JWT signing & authentication. |
| `TELEGRAM_BOT_TOKEN` | No | Bot token from @BotFather for group broadcasts. |
| `TELEGRAM_CHAT_ID` | No | Telegram group/channel ID for request notifications. |
| `SUPABASE_URL` | No | Supabase PostgreSQL project URL. |
| `SUPABASE_ANON_KEY` | No | Supabase public API key. |

---

## 📁 Folder Structure

```
.
├── .env.example             # Environment variable template
├── index.html               # Main HTML entry point
├── metadata.json            # Application name and metadata
├── package.json             # NPM package dependencies and build scripts
├── pbda_data.json           # Local JSON database file
├── README.md                # Project documentation
├── server.ts                # Express backend server with API endpoints
├── src/                     # React frontend source code
│   ├── App.tsx              # Main React Application component
│   ├── components/          # Reusable UI components (Header, Footer, Modals, Cards)
│   ├── layouts/             # Public, Admin, and Volunteer layout wrappers
│   ├── server/              # Server-side security, caching, & notification modules
│   │   ├── cacheService.ts
│   │   ├── db.ts
│   │   ├── notificationService.ts
│   │   ├── security.ts
│   │   └── whatsappQrService.ts
│   ├── types.ts             # Global TypeScript interfaces & data models
│   └── data/                # Geographic Bangladesh address datasets
├── public/                  # Public static assets (manifest.json, robots.txt, sitemap.xml)
└── supabase/                # Database migrations and RLS policy scripts
```

---

## 🚀 Production Deployment

To compile and launch for production:

```bash
# 1. Run Linter
npm run lint

# 2. Build Production Bundle (Vite frontend + ESBuild backend server)
npm run build

# 3. Start Production Server
npm run start
```

For detailed deployment guides (Vercel, Docker, Cloud Run, Supabase), read [`DEPLOYMENT.md`](./DEPLOYMENT.md).

---

## 🔧 Troubleshooting

- **Server fails to start on Port 3000**: Ensure no other application is listening on port 3000, or modify the `PORT` variable.
- **Telegram notifications not sending**: Verify that `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` are set correctly, and that the bot has administrative privileges in the target group.
- **Login invalid token error**: Ensure `JWT_SECRET` matches across restarts and clear browser local storage if JWT keys were rotated.

---

## 🤝 Contribution Guide

1. Fork the repository.
2. Create a feature branch (`git checkout -b feature/AmazingFeature`).
3. Commit your changes (`git commit -m 'Add AmazingFeature'`).
4. Push to the branch (`git push origin feature/AmazingFeature`).
5. Open a Pull Request.

---

## 📜 License
Distributed under the MIT License. Copyright © 2026 **Pangsha Blood Donors Association (PBDA)**. All rights reserved.
