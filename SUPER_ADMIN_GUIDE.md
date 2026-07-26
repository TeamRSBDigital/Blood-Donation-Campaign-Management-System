# 👑 Super Administrator Guide - PBDA System

## 1. Overview
The `SUPER_ADMIN` role holds top-level authority over the PBDA Management System, including access control, user management, global configuration, system backups, and security auditing.

---

## 2. Staff & User Access Management
1. Navigate to **"এডমিন ও ভলান্টিয়ার নিয়ন্ত্রণ"** (User Management).
2. **Creating Staff Accounts**:
   * Click **"নতুন ব্যবহারকারী যোগ করুন"** (Add User).
   * Set Name, Email, Temporary Password, Role (`ADMIN` or `VOLUNTEER`), and assigned Upazila scope.
3. **Revoking Access**:
   * To deactivate a staff member, click **"মুছে ফেলুন"** (Delete). The account will be soft-deleted and their active JWT sessions invalidated immediately.

---

## 3. System Configuration & Integrations

### 3.1 Telegram Group Bot Settings
1. Navigate to **"কমিউনিকেশন সেটিংস"** (Communication Settings).
2. Enter `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID`.
3. Click **"সংযোগ পরীক্ষা করুন"** (Test Connection). A test broadcast message will be dispatched to the target Telegram group chat.

### 3.2 WhatsApp Provider Gateway
1. Navigate to **"হোয়াটসঅ্যাপ সার্ভিস"** (WhatsApp Service).
2. Choose provider mode: `Internal QR Code Web Session` or `External HTTP Gateway`.
3. If using QR Code mode, scan the displayed QR code with the official PBDA WhatsApp smartphone app.

---

## 4. Backup & Disaster Recovery Operations

### 4.1 Creating Manual Snapshots
1. Navigate to **"ব্যাকআপ ও রিস্টোর"** (Backup & Restore).
2. Click **"নতুন ব্যাকআপ তৈরি করুন"** (Create Backup).
3. Download the generated `.json` snapshot file and store it in a secure location.

### 4.2 Restoring from Snapshot
1. In the **"ব্যাকআপ ও রিস্টোর"** screen, select **"ফাইল আপলোড করুন"** (Upload Snapshot File).
2. Select a verified PBDA `.json` snapshot file.
3. Click **"রিস্টোর করুন"** (Restore). All database entities (donors, requests, users, activity logs) will be restored instantly.

---

## 5. Security & System Diagnostics
1. Navigate to **"সিস্টেম হেলথ ও ডায়াগনস্টিকস"** (System Health & Diagnostics).
2. Review real-time metrics: HTTP response latencies, active memory usage, failed login attempt counters, and IP rate-limiting logs.
