# 🚑 Disaster Recovery & Maintenance Plan - PBDA System

This document outlines contingency procedures, database recovery protocols, and routine maintenance schedules for the PBDA platform.

---

## 1. Routine Maintenance Schedule

| Frequency | Task | Procedure |
| :--- | :--- | :--- |
| **Daily** | Automated DB Snapshot | System auto-saves state to `pbda_data.json`. Download a copy from `/admin/backup`. |
| **Weekly** | Health Diagnostic Audit | Run `/api/health` diagnostic check and verify log error rates. |
| **Monthly** | Security Audit & User Review | Audit admin/volunteer account lists and revoke access for inactive staff. |
| **Quarterly**| Recovery Test Run | Perform a test database restore on a staging environment to verify snapshot integrity. |

---

## 2. Disaster Recovery Scenarios & Procedures

### Scenario A: Server Crash or Container Loss
1. Provision a new server/container using `DEPLOYMENT.md` instructions.
2. Clone repository and install dependencies (`npm install`).
3. Place the latest `pbda_data.json` snapshot into the project root directory.
4. Launch server (`npm run build && npm run start`).
5. Verify `/api/health` reports status `healthy` and full donor records.

---

### Scenario B: Database Corruption or Accidental Mass Deletion
1. Log in to PBDA Admin Panel as Super Admin.
2. Go to **"ব্যাকআপ ও রিস্টোর"** (Backup & Restore).
3. If data was soft-deleted, open **"ট্র্যাশ / ডিলিট রেকর্ডস"** and click **"পুনরুদ্ধার করুন"** (Restore All).
4. If hard corruption occurred:
   * Click **"ফাইল আপলোড করুন"** (Upload Snapshot).
   * Select the most recent uncorrupted `.json` snapshot file.
   * Confirm restore.

---

### Scenario C: Telegram / WhatsApp Bot Disruption
If automated notifications fail:
1. Verify internet connectivity on the server.
2. Check if Telegram Bot Token or WhatsApp session has expired.
3. System will queue outgoing messages in the fallback memory queue and retry automatically once connectivity is restored.
4. Emergency blood request matching remains 100% operational in the web app regardless of notification service status.

---

## 3. Application Rollback Procedure
If a code deployment causes unexpected errors in production:
```bash
# 1. Checkout previous stable release git tag
git checkout tags/v1.0.0

# 2. Recompile application bundle
npm run build

# 3. Restart process runner
pm2 restart pbda-app || NODE_ENV=production npm run start
```
