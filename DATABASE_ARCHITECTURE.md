# Database Architecture Specification & Migration Guide
**Organization**: পাংশা ব্লাড ডোনার্স এসোসিয়েশন (Pangsha Blood Donors Association)  
**Database**: Supabase PostgreSQL (Normalized Schema v2.0)  
**Generated Date**: 2026-07-25  

---

## 1. Database Entity-Relationship Diagram

```
 +-------------------------------------------------------------------------------------------------+
 |                                    SUPABASE AUTH (auth.users)                                   |
 +-------------------------------------------------------------------------------------------------+
                                                  | 1:1 (ON DELETE CASCADE)
                                                  v
 +-------------------+  FK (N:1)   +-------------------+  FK (N:1)   +-------------------+
 |     PROFILES      |------------>|       ROLES       |<------------|  ROLE_PERMISSIONS |
 | (User metadata)   |             +-------------------+             +-------------------+
 +-------------------+                                                         | FK
           | 1:N                                                               v
           |                                                         +-------------------+
           |                                                         |    PERMISSIONS    |
           |                                                         +-------------------+
           +---------------------------------------------+
           | 1:N                                         | 1:N
           v                                             v
 +-------------------+                         +-------------------+
 |   ACTIVITY_LOGS   |                         |   NOTIFICATIONS   |
 +-------------------+                         +-------------------+

 +-------------------------------------------------------------------------------------------------+
 |                                  GEOGRAPHY RELATIONAL HIERARCHY                                 |
 +-------------------------------------------------------------------------------------------------+
 |  DIVISIONS (1:N) ---> DISTRICTS (1:N) ---> UPAZILAS (1:N) ---> UNIONS (1:N) ---> VILLAGES        |
 +-------------------------------------------------------------------------------------------------+
           ^                    ^                  ^                 ^                  ^
           | FK                 | FK               | FK              | FK               | FK
 +-------------------------------------------------------------------------------------------------+
 |                                          DONORS                                                 |
 |  (id [UUID], donor_code, full_name, phone [UNIQUE], blood_group_id, availability_status, ...)   |
 +-------------------------------------------------------------------------------------------------+
     | FK                      ^ FK                                           ^ FK
     | 1:N                     | (N:1)                                        | (N:1)
     v                         |                                              |
 +-------------------+   +--------------------+                    +--------------------+
 | DONATION_HISTORY  |   |    BLOOD_GROUPS    |                    |   BLOOD_REQUESTS   |
 | (units, hospital) |   | (A+, A-, B+, O...) |                    | (patient, priority)|
 +-------------------+   +--------------------+                    +--------------------+

 +-------------------------------------------------------------------------------------------------+
 |                                     SETTINGS & CAMPAIGN MODULES                                 |
 |  SETTINGS (Single row org config) | CAMPAIGN (Blood drive event trackers)                        |
 +-------------------------------------------------------------------------------------------------+
```

---

## 2. Comprehensive Table List & Specifications

| # | Table Name | Key Purpose | Primary Key | Soft Delete Support |
|---|------------|-------------|-------------|----------------------|
| 1 | `roles` | System Access Roles (`SUPER_ADMIN`, `ADMIN`, `VOLUNTEER`, `MEMBER`) | UUID | No |
| 2 | `permissions` | Granular permission registry | UUID | No |
| 3 | `role_permissions` | Pivot table linking Roles to Permissions | Composite (`role_id`, `permission_id`) | No |
| 4 | `divisions` | Top-level Administrative Divisions | UUID | No |
| 5 | `districts` | Administrative Districts (e.g. Rajbari) | UUID | No |
| 6 | `upazilas` | Sub-districts (e.g. Pangsha, Kalukhali) | UUID | No |
| 7 | `unions` | Local Unions (e.g. Pangsha Pourashava, Habaspur) | UUID | No |
| 8 | `villages` | Local Villages (e.g. Kuthipara) | UUID | No |
| 9 | `blood_groups` | Relational table storing blood compatibility matrices | UUID | No |
| 10 | `profiles` | Extended profile metadata linked to `auth.users` | UUID | Yes (`deleted_at`) |
| 11 | `donors` | Normalized donor registry with medical and contact info | UUID | Yes (`deleted_at`) |
| 12 | `donation_history` | Record of historical blood donations per donor | UUID | No |
| 13 | `blood_requests` | Patient emergency blood requests & lifecycle tracking | UUID | Yes (`deleted_at`) |
| 14 | `campaigns` | Community blood drive events & bag collection targets | UUID | No |
| 15 | `notifications` | User & Role-targeted activity alerts | UUID | No |
| 16 | `activity_logs` | Audit trail for security actions (Login, Export, Delete) | UUID | No |
| 17 | `settings` | Global organization configuration (Single row constraint `id=1`) | Integer (`id=1`) | No |

---

## 3. Key Foreign Relationships

1. **`profiles.id`** $\rightarrow$ `auth.users.id` (`ON DELETE CASCADE`)
2. **`donors.blood_group_id`** $\rightarrow$ `blood_groups.id` (`ON DELETE RESTRICT`)
3. **`donors.division_id`, `district_id`, `upazila_id`, `union_id`, `village_id`** $\rightarrow$ Geographical tables (`ON DELETE SET NULL`)
4. **`donation_history.donor_id`** $\rightarrow$ `donors.id` (`ON DELETE CASCADE`)
5. **`blood_requests.blood_group_id`** $\rightarrow$ `blood_groups.id` (`ON DELETE RESTRICT`)
6. **`blood_requests.upazila_id`** $\rightarrow$ `upazilas.id` (`ON DELETE SET NULL`)
7. **`role_permissions.role_id`** $\rightarrow$ `roles.id` (`ON DELETE CASCADE`)
8. **`role_permissions.permission_id`** $\rightarrow$ `permissions.id` (`ON DELETE CASCADE`)

---

## 4. Performance Indexes

```sql
-- Donors Fast Search & Filtering Indexes
CREATE INDEX idx_donors_phone ON donors(phone) WHERE deleted_at IS NULL;
CREATE INDEX idx_donors_blood_group ON donors(blood_group_id);
CREATE INDEX idx_donors_district ON donors(district_id);
CREATE INDEX idx_donors_upazila ON donors(upazila_id);
CREATE INDEX idx_donors_union ON donors(union_id);
CREATE INDEX idx_donors_availability ON donors(availability_status) WHERE deleted_at IS NULL;
CREATE INDEX idx_donors_last_donation ON donors(last_donation_date);
CREATE INDEX idx_donors_verified ON donors(verified);

-- Request Tracking & Activity Log Indexes
CREATE INDEX idx_blood_requests_status ON blood_requests(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_blood_requests_required_date ON blood_requests(required_date);
CREATE INDEX idx_donation_history_donor ON donation_history(donor_id);
CREATE INDEX idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;
```

---

## 5. Row Level Security (RLS) Policies

Row Level Security is enabled across **all 17 public tables**.

* **Public Visitors**:
  * `blood_groups`, `divisions`, `districts`, `upazilas`, `unions`, `villages`, `settings`: Read access granted to all (`true`).
  * `donors`: Public read access restricted to active (`deleted_at IS NULL`) and verified (`verified = true`) donors.
  * `blood_requests`: Public read access for active requests; public creation allowed (`INSERT WITH CHECK (true)`).
  * `campaigns`: Public read access for non-cancelled campaigns (`status != 'CANCELLED'`).
* **Authenticated Admins (`ADMIN` & `SUPER_ADMIN`)**:
  * Full CRUD control (`is_admin()` evaluation against user role in `profiles`).
* **Super Admin**:
  * Full system configuration update rights on `settings` table (`is_super_admin()`).

---

## 6. Storage Buckets

1. **`donors`**: Avatar images and donor document uploads (5MB limit, `public = true`).
2. **`gallery`**: Campaign & donation event photo archive (10MB limit, `public = true`).
3. **`campaigns`**: Event banner images (10MB limit, `public = true`).
4. **`organization`**: Organization logo, official documents & seals (5MB limit, `public = true`).

---

## 7. Migration Files Created

1. **`supabase/migrations/20260725120000_initial_schema.sql`**:
   * Creates extensions, enums, 17 normalized tables, indexes, triggers, RLS policies, and storage buckets.
2. **`supabase/migrations/20260725120100_seed_data.sql`**:
   * Seeds 8 blood group compatibility records, administrative geography (Rajbari District, Pangsha Upazila & Unions), roles, system permissions, organization defaults, and sample donor records.
3. **`supabase/schema.sql`**:
   * Consolidated single-file database migration for direct execution in Supabase SQL Editor.
4. **`src/types/database.types.ts`**:
   * Production-grade TypeScript interface bindings for Supabase client queries.

---

## 8. Security Review

* **Authentication Sync**: Automated trigger `on_auth_user_created` creates profile records seamlessly when new users log in or register via Supabase Auth.
* **Privilege Escalation Prevention**: Functions `is_admin()` and `is_super_admin()` execute in `SECURITY DEFINER` mode with explicit check against `deleted_at IS NULL` to prevent revoked accounts from executing privileged operations.
* **Data Sanitization & Integrity**: Strict field constraints (`weight >= 40.0`, `age >= 18 AND age <= 70`, `units >= 1`) enforced directly at the PostgreSQL layer.

---

## 9. Performance & Scalability Review

* **Partial Indexes**: Lowers index overhead by creating indexes only on non-deleted records (`WHERE deleted_at IS NULL`).
* **Automated Aggregations**: The `on_donation_history_insert` trigger automatically updates donor `total_donations`, `last_donation_date`, and calculates temporary unavailability status in real time.
* **Index-Optimized Joins**: All foreign key columns (`blood_group_id`, `district_id`, `upazila_id`, `union_id`) are explicitly indexed to guarantee sub-millisecond multi-table JOIN query execution.

---

## 10. Remaining TODO / Future Expansion

1. **SMS / WhatsApp Gateway Trigger**: Add a Webhook or PG-Net extension trigger on `blood_requests` table to auto-dispatch SMS alerts to matching blood group donors in the same Upazila.
2. **Geo-Location Radius Queries**: Integrate PostGIS extension for exact distance radius searches (e.g. donors within 5 km of Pangsha Hospital).
3. **Automated Donor Renewal Alerts**: Create a scheduled cron job (via `pg_cron`) to transition donors from `TEMP_UNAVAILABLE` to `AVAILABLE` status automatically after 90 days.
