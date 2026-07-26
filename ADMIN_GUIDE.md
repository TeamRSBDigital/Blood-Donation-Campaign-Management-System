# 👨‍💼 Administrator Guide - PBDA System

## 1. Introduction
This guide covers day-to-day administrative operations for PBDA System Administrators (`ADMIN` role).

---

## 2. Managing Donor Registrations

### 2.1 Reviewing Pending Donors
1. Open the Admin Panel (`/admin`) and navigate to **"রক্তদাতা ব্যবস্থাপনা"** (Donor Management).
2. Filter by status: **"অপেক্ষমান"** (Pending).
3. Inspect donor details: National ID / Birth Reg #, Father's Name, Mobile Number, and Last Donation Date.
4. Click **"যাচাই করুন"** (Verify) to assign the Verified badge or **"বাতিল"** (Reject).

### 2.2 Updating Donor Availability
If a donor contacts PBDA stating they are currently unwell or relocated:
1. Search donor by phone or name.
2. Click **"সম্পাদনা"** (Edit).
3. Toggle **"প্রস্তুত আছেন"** (Available) to `FALSE`.

---

## 3. Emergency Blood Request Pipeline

1. Navigate to **"রক্তের আবেদন তালিকা"** (Blood Requests).
2. For new incoming requests:
   * Review priority (`CRITICAL` requests appear with a flashing red badge).
   * Click **"ডোনার ম্যাচিং"** (Find Matching Donors).
   * Contact available donors via the instant call/WhatsApp buttons.
3. Update request status as donors respond:
   * `SEARCHING`: Donors are being contacted.
   * `MATCHED`: A donor has agreed and is traveling to the hospital.
   * `FULFILLED`: Donation completed successfully.

---

## 4. Reports & Data Export
1. Navigate to **"রিপোর্ট ও এক্সপোর্ট"** (Reports & Export).
2. Select report type: **Donor Directory** or **Blood Requests Log**.
3. Apply date range and location filters.
4. Export in your desired format:
   * **Excel (`.xlsx`)**: Ideal for spreadsheet manipulation and statistical analysis.
   * **CSV**: Lightweight data transfer format.
   * **PDF**: Printable report with official PBDA headers.
