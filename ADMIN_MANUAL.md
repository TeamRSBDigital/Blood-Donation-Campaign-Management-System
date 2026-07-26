# 👨‍💼 Admin Manual - Pangsha Blood Donors Association (PBDA)

Welcome to the **PBDA Blood Donation Management System Admin Guide**. This manual details administrative workflows for Super Admins and Admins.

---

## 1. 🔑 System Access & Login
1. Click the **"এডমিন প্যানেল"** (Admin Panel) button in the top navigation header.
2. Enter your administrator email and password.
3. Upon successful authentication, a JWT Bearer Token will be assigned to your session.

---

## 2. 👥 Admin & Volunteer User Management (Super Admin Only)
1. Navigate to **"এডমিন কন্ট্রোল"** (Admin Control) from the Admin Sidebar.
2. **Add New Staff/Volunteer**:
   * Click **"নতুন এডমিন যোগ করুন"** (Add New Admin).
   * Specify Name, Email, Password, Role (`SUPER_ADMIN`, `ADMIN`, or `VOLUNTEER`), Upazila designation, and Phone.
3. **Role Capabilities**:
   * **Super Admin**: Full unrestricted access, user creation, settings configuration, backup/restore.
   * **Admin**: Donor verification, request management, broadcast messaging, analytics exports.
   * **Volunteer**: Donor registration, basic requests entry, search and list viewing.

---

## 3. 🩸 Donor Verification Workflow
1. Navigate to **"রক্তদাতা তালিকা"** (Donor List).
2. Filter by **"যাচাইকরণের অবস্থা: অপেক্ষমান"** (Verification Status: Pending).
3. Click a donor card to view full profile details (NID/Birth Certificate, Father/Spouse Name, Last Donation Date).
4. Select **"অনুমোদন করুন"** (Approve) to assign the Verified badge or **"বাতিল করুন"** (Reject).

---

## 4. 🆘 Emergency Blood Requests & Matchmaking
1. Navigate to **"রক্তের আবেদন"** (Blood Requests).
2. When a new emergency request arrives:
   * View patient details, hospital location, bags required, and urgency level.
   * Click **"উপযুক্ত রক্তদাতা খুঁজুন"** (Find Matching Donors) to invoke the automated compatibility engine.
   * Direct contact numbers for matching available donors will be displayed with 1-click call/WhatsApp actions.
   * Update request status to **"পুরণ হয়েছে"** (Fulfilled) once donation is completed.

---

## 5. 📢 Broadcasts & Communication Center
1. Navigate to **"কমিউনিকেশন সেন্টার"** (Communication Center).
2. Select message template or type custom broadcast.
3. Filter target audience by Blood Group, District, or Upazila.
4. Trigger automated Telegram Group broadcast or WhatsApp batch notification.

---

## 6. 🗄️ Backup & Data Recovery
1. Navigate to **"সিস্টেম ব্যাকআপ"** (System Backup).
2. Click **"নতুন ব্যাকআপ তৈরি করুন"** (Create New Backup) to download a JSON/SQL snapshot.
3. In case of data corruption, upload a previous snapshot file and click **"রিস্টোর করুন"** (Restore).
