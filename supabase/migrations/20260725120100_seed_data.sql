-- ==============================================================================
-- Blood Donation Campaign Management System - Supabase PostgreSQL Seed Data
-- Organization: পাংশা ব্লাড ডোনার্স এসোসিয়েশন (Pangsha Blood Donors Association)
-- Migration: 20260725120100_seed_data.sql
-- ==============================================================================

-- 1. SEED BLOOD GROUPS WITH COMPATIBILITY MATRICES
INSERT INTO blood_groups (id, code, name, can_donate_to, can_receive_from) VALUES
('b0000000-0000-0000-0000-000000000001', 'A+', 'A Positive', ARRAY['A+', 'AB+'], ARRAY['A+', 'A-', 'O+', 'O-']),
('b0000000-0000-0000-0000-000000000002', 'A-', 'A Negative', ARRAY['A+', 'A-', 'AB+', 'AB-'], ARRAY['A-', 'O-']),
('b0000000-0000-0000-0000-000000000003', 'B+', 'B Positive', ARRAY['B+', 'AB+'], ARRAY['B+', 'B-', 'O+', 'O-']),
('b0000000-0000-0000-0000-000000000004', 'B-', 'B Negative', ARRAY['B+', 'B-', 'AB+', 'AB-'], ARRAY['B-', 'O-']),
('b0000000-0000-0000-0000-000000000005', 'AB+', 'AB Positive (Universal Recipient)', ARRAY['AB+'], ARRAY['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']),
('b0000000-0000-0000-0000-000000000006', 'AB-', 'AB Negative', ARRAY['AB+', 'AB-'], ARRAY['AB-', 'A-', 'B-', 'O-']),
('b0000000-0000-0000-0000-000000000007', 'O+', 'O Positive', ARRAY['O+', 'A+', 'B+', 'AB+'], ARRAY['O+', 'O-']),
('b0000000-0000-0000-0000-000000000008', 'O-', 'O Negative (Universal Donor)', ARRAY['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'], ARRAY['O-'])
ON CONFLICT (code) DO NOTHING;


-- 2. SEED ROLES & PERMISSIONS
INSERT INTO roles (id, name, display_name, description) VALUES
('r0000000-0000-0000-0000-000000000001', 'SUPER_ADMIN', 'সুপার এডমিন (Super Admin)', 'সম্পূর্ণ সিস্টেমের নিয়ন্ত্রণ ও সেটিংস পরিচালনার অধিকার'),
('r0000000-0000-0000-0000-000000000002', 'ADMIN', 'এডমিন (Admin)', 'রক্তদাতা, আবেদন ও ক্যাম্পেইন ব্যবস্থাপনা অধিকার'),
('r0000000-0000-0000-0000-000000000003', 'VOLUNTEER', 'ভলান্টিয়ার (Volunteer)', 'রক্তদাতা তালিকা ও আবেদন যাচাইকরণের অধিকার'),
('r0000000-0000-0000-0000-000000000004', 'MEMBER', 'সদস্য/সাধারণ ব্যবহারকারী', 'পাবলিক রক্তদাতা ও তথ্য অনুসন্ধানের অধিকার')
ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (id, code, name, description, category) VALUES
('p0000000-0000-0000-0000-000000000001', 'donors.read', 'View Donors', 'রক্তদাতাদের তালিকা দেখার ক্ষমতা', 'DONORS'),
('p0000000-0000-0000-0000-000000000002', 'donors.write', 'Manage Donors', 'রক্তদাতা যোগ ও এডিট করার ক্ষমতা', 'DONORS'),
('p0000000-0000-0000-0000-000000000003', 'donors.delete', 'Delete Donors', 'রক্তদাতা তথ্য মুছে ফেলার ক্ষমতা', 'DONORS'),
('p0000000-0000-0000-0000-000000000004', 'requests.manage', 'Manage Requests', 'রক্তের আবেদন ব্যবস্থাপনা', 'REQUESTS'),
('p0000000-0000-0000-0000-000000000005', 'settings.manage', 'System Settings', 'সিস্টেম কনফিগারেশন পরিবর্তন', 'SYSTEM')
ON CONFLICT (code) DO NOTHING;


-- 3. SEED GEOGRAPHY (DIVISIONS, DISTRICTS, UPAZILAS, UNIONS, VILLAGES)

-- Division: Dhaka
INSERT INTO divisions (id, name_en, name_bn, code) VALUES
('d0000000-0000-0000-0000-000000000001', 'Dhaka', 'ঢাকা', 'DHAKA')
ON CONFLICT (code) DO NOTHING;

-- District: Rajbari
INSERT INTO districts (id, division_id, name_en, name_bn, lat, lng) VALUES
('dt000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'Rajbari', 'রাজবাড়ী', 23.757000, 89.650000)
ON CONFLICT DO NOTHING;

-- Upazilas of Rajbari District
INSERT INTO upazilas (id, district_id, name_en, name_bn) VALUES
('u0000000-0000-0000-0000-000000000001', 'dt000000-0000-0000-0000-000000000001', 'Pangsha', 'পাংশা'),
('u0000000-0000-0000-0000-000000000002', 'dt000000-0000-0000-0000-000000000001', 'Kalukhali', 'কালুখালী'),
('u0000000-0000-0000-0000-000000000003', 'dt000000-0000-0000-0000-000000000001', 'Baliakandi', 'বালিয়াকান্দি'),
('u0000000-0000-0000-0000-000000000004', 'dt000000-0000-0000-0000-000000000001', 'Rajbari Sadar', 'রাজবাড়ী সদর'),
('u0000000-0000-0000-0000-000000000005', 'dt000000-0000-0000-0000-000000000001', 'Goalandu', 'গোয়ালন্দ')
ON CONFLICT DO NOTHING;

-- Unions of Pangsha Upazila
INSERT INTO unions (id, upazila_id, name_en, name_bn) VALUES
('un000000-0000-0000-0000-000000000001', 'u0000000-0000-0000-0000-000000000001', 'Pangsha Pourashava', 'পাংশা পৌরসভা'),
('un000000-0000-0000-0000-000000000002', 'u0000000-0000-0000-0000-000000000001', 'Habaspur', 'হাবাসপুর'),
('un000000-0000-0000-0000-000000000003', 'u0000000-0000-0000-0000-000000000001', 'Bahadurpur', 'বাহাদুরপুর'),
('un000000-0000-0000-0000-000000000004', 'u0000000-0000-0000-0000-000000000001', 'Babupara', 'বাবুপাড়া'),
('un000000-0000-0000-0000-000000000005', 'u0000000-0000-0000-0000-000000000001', 'Machhpara', 'মাছপাড়া'),
('un000000-0000-0000-0000-000000000006', 'u0000000-0000-0000-0000-000000000001', 'Sarisha', 'সরিষা'),
('un000000-0000-0000-0000-000000000007', 'u0000000-0000-0000-0000-000000000001', 'Kallayanpur', 'কৈজুরী'),
('un000000-0000-0000-0000-000000000008', 'u0000000-0000-0000-0000-000000000001', 'Kasba Majail', 'কসবা মাজাইল'),
('un000000-0000-0000-0000-000000000009', 'u0000000-0000-0000-0000-000000000001', 'Chandana', 'চন্দনা'),
('un000000-0000-0000-0000-000000000010', 'u0000000-0000-0000-0000-000000000001', 'Paturia', 'পাটুরিয়া')
ON CONFLICT DO NOTHING;

-- Villages of Pangsha Pourashava & Habaspur Unions
INSERT INTO villages (id, union_id, name_en, name_bn) VALUES
('v0000000-0000-0000-0000-000000000001', 'un000000-0000-0000-0000-000000000001', 'Kuthipara', 'কুঠিপাড়া'),
('v0000000-0000-0000-0000-000000000002', 'un000000-0000-0000-0000-000000000001', 'Pangsha Bazar', 'পাংশা বাজার'),
('v0000000-0000-0000-0000-000000000003', 'un000000-0000-0000-0000-000000000002', 'Habaspur Bazar', 'হাবাসপুর বাজার'),
('v0000000-0000-0000-0000-000000000004', 'un000000-0000-0000-0000-000000000004', 'Babupara Village', 'বাবুপাড়া গ্রাম'),
('v0000000-0000-0000-0000-000000000005', 'un000000-0000-0000-0000-000000000005', 'Machhpara Stand', 'মাছপাড়া বাসস্ট্যান্ড')
ON CONFLICT DO NOTHING;


-- 4. SEED DEFAULT SYSTEM SETTINGS
INSERT INTO settings (
    id,
    org_name_bn,
    org_name_en,
    motto_bn,
    motto_en,
    primary_phone,
    emergency_number,
    email,
    address_bn,
    address_en,
    facebook_url,
    eligibility_interval_days,
    enable_telegram_notify,
    enable_public_request_posting
) VALUES (
    1,
    'পাংশা ব্লাড ডোনার্স এসোসিয়েশন',
    'Pangsha Blood Donors Association',
    'রক্ত দিন, জীবন বাঁচান - মানব সেবায় আমরা সদা প্রস্তুত',
    'Donate Blood, Save Lives - Ready to Serve Humanity',
    '+8801712000000',
    '+8801812999888',
    'info@pbdabangladesh.org',
    'পাংশা মডেল থানা রোড, পাংশা পৌরসভা, রাজবাড়ী',
    'Pangsha Model Thana Road, Pangsha Pourashava, Rajbari',
    'https://facebook.com/pangshablooddonors',
    90,
    FALSE,
    TRUE
)
ON CONFLICT (id) DO UPDATE SET
    org_name_bn = EXCLUDED.org_name_bn,
    org_name_en = EXCLUDED.org_name_en,
    updated_at = NOW();


-- 5. SEED INITIAL SAMPLE DONORS
INSERT INTO donors (
    id,
    donor_code,
    full_name,
    full_name_en,
    gender,
    age,
    blood_group_id,
    weight,
    occupation,
    phone,
    whatsapp,
    division_id,
    district_id,
    upazila_id,
    union_id,
    village,
    last_donation_date,
    total_donations,
    hemoglobin,
    bp_notes,
    availability_status,
    medical_notes,
    verified,
    can_donate,
    created_at
) VALUES
(
    'dn000000-0000-0000-0000-000000000101',
    'PBD-2025-00101',
    'মোঃ হাফিজুর রহমান',
    'Hafizur Rahman',
    'MALE',
    26,
    'b0000000-0000-0000-0000-000000000003', -- B+
    68.0,
    'ব্যবসায়ী',
    '01711223344',
    '01711223344',
    'd0000000-0000-0000-0000-000000000001',
    'dt000000-0000-0000-0000-000000000001',
    'u0000000-0000-0000-0000-000000000001',
    'un000000-0000-0000-0000-000000000001',
    'কুঠিপাড়া',
    '2025-11-10',
    7,
    '14.2 g/dL',
    '120/80 mmHg',
    'AVAILABLE',
    'নিয়মিত রক্তদাতা, শারীরিক সুস্থতা চমৎকার',
    TRUE,
    TRUE,
    NOW() - INTERVAL '120 days'
),
(
    'dn000000-0000-0000-0000-000000000102',
    'PBD-2025-00102',
    'এস এম আশরাফুল আলম',
    'SM Ashraful Alam',
    'MALE',
    29,
    'b0000000-0000-0000-0000-000000000007', -- O+
    72.0,
    'শিক্ষক',
    '01722334455',
    '01722334455',
    'd0000000-0000-0000-0000-000000000001',
    'dt000000-0000-0000-0000-000000000001',
    'u0000000-0000-0000-0000-000000000001',
    'un000000-0000-0000-0000-000000000002',
    'হাবাসপুর বাজার',
    '2026-01-05',
    12,
    '13.8 g/dL',
    '118/78 mmHg',
    'RESTRICTED',
    'হাবাসপুর ইউনিয়নের ব্লাড টিম কোঅর্ডিনেটর',
    TRUE,
    FALSE,
    NOW() - INTERVAL '100 days'
)
ON CONFLICT (donor_code) DO NOTHING;


-- 6. SEED SAMPLE BLOOD REQUESTS
INSERT INTO blood_requests (
    id,
    request_code,
    patient_name,
    blood_group_id,
    hospital,
    district_id,
    upazila_id,
    union_id,
    units_needed,
    contact_person,
    contact_number,
    required_date,
    priority,
    status,
    disease_reason,
    notes,
    created_at
) VALUES
(
    'req00000-0000-0000-0000-000000000001',
    'REQ-2026-0001',
    'মোছা: রাবেয়া খাতুন',
    'b0000000-0000-0000-0000-000000000007', -- O+
    'পাংশা উপজেলা স্বাস্থ্য কমপ্লেক্স',
    'dt000000-0000-0000-0000-000000000001',
    'u0000000-0000-0000-0000-000000000001',
    'un000000-0000-0000-0000-000000000001',
    2,
    'মোঃ রফিকুল ইসলাম',
    '01733445566',
    CURRENT_DATE + INTERVAL '1 day',
    'CRITICAL',
    'APPROVED',
    'জরুরী সিজারিয়ান অপারেশন',
    'অবিলম্বে O+ পজিটিভ ২ ব্যাগ রক্তের প্রয়োজন।',
    NOW()
)
ON CONFLICT (request_code) DO NOTHING;


-- 7. SEED INITIAL ACTIVITY LOG
INSERT INTO activity_logs (
    user_id,
    actor_name,
    actor_role,
    action,
    entity_type,
    entity_id,
    details
) VALUES (
    NULL,
    'System Migration',
    'SUPER_ADMIN',
    'Create',
    'DatabaseSchema',
    'schema_v1',
    '{"message": "Supabase Normalized Database Schema & Seed Data successfully initialized"}'::jsonb
);
