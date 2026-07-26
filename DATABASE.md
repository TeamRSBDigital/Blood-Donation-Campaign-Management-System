# 🗄️ Database Documentation - PBDA System

## 1. Schema Overview
The PBDA Blood Donation Management System uses a high-performance in-memory state engine synced with local JSON persistence (`pbda_data.json`) and compatible with Supabase PostgreSQL.

---

## 2. Table Specifications

### 2.1 `donors`
Stores all registered blood donor profiles.

| Column Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | `PRIMARY KEY` | Unique UUID string. |
| `name` | `VARCHAR(255)` | `NOT NULL` | Full name of donor in Bangla/English. |
| `bloodGroup` | `VARCHAR(5)` | `NOT NULL` | Blood group (`A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`). |
| `phone` | `VARCHAR(20)` | `NOT NULL, UNIQUE` | Mobile contact number. |
| `altPhone` | `VARCHAR(20)` | `NULLABLE` | Secondary emergency contact number. |
| `division` | `VARCHAR(100)` | `NOT NULL` | Bangladesh Division (e.g., `ঢাকা`). |
| `district` | `VARCHAR(100)` | `NOT NULL` | Bangladesh District (e.g., `রাজবাড়ী`). |
| `upazila` | `VARCHAR(100)` | `NOT NULL` | Bangladesh Upazila (e.g., `পাংশা`). |
| `union` | `VARCHAR(100)` | `NOT NULL` | Bangladesh Union / Ward. |
| `lastDonationDate` | `DATE` | `NULLABLE` | Date of last blood donation (`YYYY-MM-DD`). |
| `totalDonations` | `INTEGER` | `DEFAULT 0` | Total lifetime donation count. |
| `isAvailable` | `BOOLEAN` | `DEFAULT true` | Donor willingness toggle. |
| `verificationStatus`| `VARCHAR(20)` | `DEFAULT 'PENDING'` | `UNVERIFIED`, `PENDING`, `VERIFIED`, `ELITE`. |
| `is_deleted` | `BOOLEAN` | `DEFAULT false` | Soft-delete flag. |
| `createdAt` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Record creation timestamp. |

---

### 2.2 `blood_requests`
Stores emergency blood requests submitted by public users or volunteers.

| Column Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | `PRIMARY KEY` | Unique request UUID. |
| `patientName` | `VARCHAR(255)` | `NOT NULL` | Patient's full name. |
| `bloodGroup` | `VARCHAR(5)` | `NOT NULL` | Requested blood group. |
| `bagsRequired` | `INTEGER` | `DEFAULT 1` | Total blood bags needed. |
| `hospitalName` | `VARCHAR(255)` | `NOT NULL` | Hospital name & location. |
| `district` | `VARCHAR(100)` | `NOT NULL` | District. |
| `upazila` | `VARCHAR(100)` | `NOT NULL` | Upazila. |
| `urgency` | `VARCHAR(20)` | `DEFAULT 'URGENT'` | `CRITICAL`, `URGENT`, `NORMAL`. |
| `status` | `VARCHAR(20)` | `DEFAULT 'PENDING'` | `PENDING`, `SEARCHING`, `MATCHED`, `FULFILLED`, `CANCELLED`. |
| `contactName` | `VARCHAR(255)` | `NOT NULL` | Contact person name. |
| `contactPhone` | `VARCHAR(20)` | `NOT NULL` | Contact person mobile number. |
| `is_deleted` | `BOOLEAN` | `DEFAULT false` | Soft-delete flag. |
| `createdAt` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Creation timestamp. |

---

### 2.3 `users`
Stores administrative and volunteer access credentials.

| Column Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | `PRIMARY KEY` | Unique user UUID. |
| `name` | `VARCHAR(255)` | `NOT NULL` | Full name of staff member. |
| `email` | `VARCHAR(255)` | `NOT NULL, UNIQUE` | Login email address. |
| `passwordHash` | `VARCHAR(255)` | `NOT NULL` | bcryptjs hashed password string. |
| `role` | `VARCHAR(20)` | `NOT NULL` | `SUPER_ADMIN`, `ADMIN`, `VOLUNTEER`. |
| `upazila` | `VARCHAR(100)` | `NULLABLE` | Assigned Upazila scope. |
| `is_deleted` | `BOOLEAN` | `DEFAULT false` | Soft-delete flag. |
| `createdAt` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Account creation timestamp. |

---

### 2.4 `activity_logs`
Audit trails recording system events and user actions.

| Column Name | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `VARCHAR(36)` | `PRIMARY KEY` | Log entry UUID. |
| `userId` | `VARCHAR(36)` | `NULLABLE` | Performing user ID. |
| `userName` | `VARCHAR(255)` | `NOT NULL` | Performing user name. |
| `action` | `VARCHAR(100)` | `NOT NULL` | Action code (e.g., `DONOR_CREATED`, `REQUEST_FULFILLED`). |
| `details` | `TEXT` | `NULLABLE` | JSON or textual detail payload. |
| `timestamp` | `TIMESTAMP` | `DEFAULT CURRENT_TIMESTAMP` | Log timestamp. |

---

## 3. Database Indexes & Performance Optimization
When migrating to Supabase PostgreSQL, the following indexes are configured:
```sql
CREATE INDEX idx_donors_blood_upazila ON donors(bloodGroup, upazila) WHERE is_deleted = false;
CREATE INDEX idx_donors_verification ON donors(verificationStatus) WHERE is_deleted = false;
CREATE INDEX idx_requests_status ON blood_requests(status, urgency) WHERE is_deleted = false;
CREATE INDEX idx_logs_timestamp ON activity_logs(timestamp DESC);
```

---

## 4. Soft Delete Strategy
No data is permanently purged during standard application usage. All delete actions trigger soft deletion (`is_deleted = true`). Admins can view and restore soft-deleted items from the **Trash Engine** interface.
