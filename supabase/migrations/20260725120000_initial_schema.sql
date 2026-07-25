-- ==============================================================================
-- Blood Donation Campaign Management System - Supabase PostgreSQL Schema
-- Organization: পাংশা ব্লাড ডোনার্স এসোসিয়েশন (Pangsha Blood Donors Association)
-- Migration: 20260725120000_initial_schema.sql
-- ==============================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. CUSTOM ENUMS
DO $$ BEGIN
    CREATE TYPE user_role_enum AS ENUM ('SUPER_ADMIN', 'ADMIN', 'VOLUNTEER', 'MEMBER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE gender_enum AS ENUM ('MALE', 'FEMALE', 'OTHER');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE availability_status_enum AS ENUM ('AVAILABLE', 'UNAVAILABLE', 'TEMP_UNAVAILABLE', 'RESTRICTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE request_priority_enum AS ENUM ('NORMAL', 'URGENT', 'CRITICAL');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE request_status_enum AS ENUM ('PENDING', 'APPROVED', 'FULFILLED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE notification_type_enum AS ENUM ('BLOOD_REQUEST', 'CAMPAIGN', 'DONOR_ALERT', 'SYSTEM');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE campaign_status_enum AS ENUM ('UPCOMING', 'ONGOING', 'COMPLETED', 'CANCELLED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. TABLES DEFINITION

-- 3.1 ROLES TABLE
CREATE TABLE IF NOT EXISTS roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.2 PERMISSIONS TABLE
CREATE TABLE IF NOT EXISTS permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL DEFAULT 'GENERAL',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.3 ROLE PERMISSIONS LINK TABLE
CREATE TABLE IF NOT EXISTS role_permissions (
    role_id UUID REFERENCES roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES permissions(id) ON DELETE CASCADE,
    PRIMARY KEY (role_id, permission_id)
);

-- 3.4 GEOGRAPHY - DIVISIONS
CREATE TABLE IF NOT EXISTS divisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name_en VARCHAR(100) NOT NULL,
    name_bn VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.5 GEOGRAPHY - DISTRICTS
CREATE TABLE IF NOT EXISTS districts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    division_id UUID REFERENCES divisions(id) ON DELETE CASCADE,
    name_en VARCHAR(100) NOT NULL,
    name_bn VARCHAR(100) NOT NULL,
    lat NUMERIC(9,6),
    lng NUMERIC(9,6),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.6 GEOGRAPHY - UPAZILAS
CREATE TABLE IF NOT EXISTS upazilas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    district_id UUID REFERENCES districts(id) ON DELETE CASCADE,
    name_en VARCHAR(100) NOT NULL,
    name_bn VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.7 GEOGRAPHY - UNIONS
CREATE TABLE IF NOT EXISTS unions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    upazila_id UUID REFERENCES upazilas(id) ON DELETE CASCADE,
    name_en VARCHAR(100) NOT NULL,
    name_bn VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.8 GEOGRAPHY - VILLAGES
CREATE TABLE IF NOT EXISTS villages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    union_id UUID REFERENCES unions(id) ON DELETE CASCADE,
    name_en VARCHAR(100),
    name_bn VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.9 BLOOD GROUPS RELATIONAL TABLE
CREATE TABLE IF NOT EXISTS blood_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code VARCHAR(5) UNIQUE NOT NULL, -- e.g. 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'
    name VARCHAR(20) NOT NULL,
    can_donate_to TEXT[] DEFAULT '{}',
    can_receive_from TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.10 USERS PROFILES TABLE (Linked with Supabase Auth)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name VARCHAR(255) NOT NULL,
    full_name_en VARCHAR(255),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    avatar_url TEXT,
    role_id UUID REFERENCES roles(id) ON DELETE SET NULL,
    role user_role_enum DEFAULT 'VOLUNTEER',
    status VARCHAR(20) DEFAULT 'ACTIVE',
    last_login TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- 3.11 DONORS TABLE
CREATE TABLE IF NOT EXISTS donors (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_code VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    full_name VARCHAR(255) NOT NULL,
    full_name_en VARCHAR(255),
    gender gender_enum NOT NULL DEFAULT 'MALE',
    date_of_birth DATE,
    age INTEGER CHECK (age >= 18 AND age <= 70),
    blood_group_id UUID NOT NULL REFERENCES blood_groups(id) ON DELETE RESTRICT,
    weight NUMERIC(5,2) CHECK (weight >= 40.0),
    occupation VARCHAR(100),
    phone VARCHAR(20) NOT NULL,
    whatsapp VARCHAR(20),
    alternative_phone VARCHAR(20),
    email VARCHAR(255),
    division_id UUID REFERENCES divisions(id) ON DELETE SET NULL,
    district_id UUID REFERENCES districts(id) ON DELETE SET NULL,
    upazila_id UUID REFERENCES upazilas(id) ON DELETE SET NULL,
    union_id UUID REFERENCES unions(id) ON DELETE SET NULL,
    village_id UUID REFERENCES villages(id) ON DELETE SET NULL,
    village TEXT NOT NULL,
    profile_image TEXT,
    last_donation_date DATE,
    total_donations INTEGER DEFAULT 0 CHECK (total_donations >= 0),
    hemoglobin VARCHAR(50),
    bp_notes VARCHAR(50),
    availability_status availability_status_enum NOT NULL DEFAULT 'AVAILABLE',
    medical_notes TEXT,
    diabetes BOOLEAN DEFAULT FALSE,
    high_blood_pressure BOOLEAN DEFAULT FALSE,
    hepatitis BOOLEAN DEFAULT FALSE,
    other_diseases TEXT,
    emergency_contact_name VARCHAR(255),
    emergency_contact_relation VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    verified BOOLEAN DEFAULT FALSE,
    can_donate BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    updated_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    CONSTRAINT unique_active_donor_phone UNIQUE (phone)
);

-- 3.12 DONATION HISTORY TABLE
CREATE TABLE IF NOT EXISTS donation_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    donor_id UUID NOT NULL REFERENCES donors(id) ON DELETE CASCADE,
    patient_name VARCHAR(255),
    hospital TEXT NOT NULL,
    blood_group_id UUID REFERENCES blood_groups(id) ON DELETE RESTRICT,
    units INTEGER DEFAULT 1 CHECK (units >= 1),
    location TEXT,
    notes TEXT,
    donation_date DATE NOT NULL DEFAULT CURRENT_DATE,
    verified_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.13 BLOOD REQUESTS TABLE
CREATE TABLE IF NOT EXISTS blood_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_code VARCHAR(50) UNIQUE NOT NULL,
    patient_name VARCHAR(255) NOT NULL,
    blood_group_id UUID NOT NULL REFERENCES blood_groups(id) ON DELETE RESTRICT,
    hospital TEXT NOT NULL,
    district_id UUID REFERENCES districts(id) ON DELETE SET NULL,
    upazila_id UUID REFERENCES upazilas(id) ON DELETE SET NULL,
    union_id UUID REFERENCES unions(id) ON DELETE SET NULL,
    units_needed INTEGER DEFAULT 1 CHECK (units_needed >= 1),
    contact_person VARCHAR(255) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    alternative_phone VARCHAR(20),
    required_date DATE NOT NULL,
    required_time TIME,
    priority request_priority_enum NOT NULL DEFAULT 'NORMAL',
    status request_status_enum NOT NULL DEFAULT 'PENDING',
    disease_reason TEXT,
    medical_docs_url TEXT,
    fulfilled_date TIMESTAMPTZ,
    notes TEXT,
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- 3.14 CAMPAIGNS TABLE
CREATE TABLE IF NOT EXISTS campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title_bn VARCHAR(255) NOT NULL,
    title_en VARCHAR(255),
    description_bn TEXT,
    description_en TEXT,
    location TEXT NOT NULL,
    upazila_id UUID REFERENCES upazilas(id) ON DELETE SET NULL,
    campaign_date DATE NOT NULL,
    campaign_time TIME,
    banner_url TEXT,
    target_bags INTEGER DEFAULT 0,
    collected_bags INTEGER DEFAULT 0,
    organizer VARCHAR(255) NOT NULL DEFAULT 'পাংশা ব্লাড ডোনার্স এসোসিয়েশন',
    status campaign_status_enum DEFAULT 'UPCOMING',
    created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.15 NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type notification_type_enum NOT NULL DEFAULT 'SYSTEM',
    is_read BOOLEAN DEFAULT FALSE,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    recipient_role user_role_enum,
    link_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.16 ACTIVITY LOGS TABLE
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    actor_name VARCHAR(255) NOT NULL,
    actor_role VARCHAR(50) NOT NULL,
    action VARCHAR(50) NOT NULL, -- Login, Logout, Create, Update, Delete, Restore, Export
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(100),
    details JSONB,
    ip_address VARCHAR(50),
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3.17 ORGANIZATION SETTINGS TABLE (Single row configuration)
CREATE TABLE IF NOT EXISTS settings (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    org_name_bn VARCHAR(255) NOT NULL DEFAULT 'পাংশা ব্লাড ডোনার্স এসোসিয়েশন',
    org_name_en VARCHAR(255) NOT NULL DEFAULT 'Pangsha Blood Donors Association',
    motto_bn TEXT DEFAULT 'রক্ত দিন, জীবন বাঁচান - মানব সেবায় আমরা সদা প্রস্তুত',
    motto_en TEXT DEFAULT 'Donate Blood, Save Lives - Ready to Serve Humanity',
    primary_phone VARCHAR(20) NOT NULL DEFAULT '+8801712000000',
    emergency_number VARCHAR(20) NOT NULL DEFAULT '+8801812999888',
    email VARCHAR(255) DEFAULT 'info@pbdabangladesh.org',
    address_bn TEXT DEFAULT 'পাংশা মডেল থানা রোড, পাংশা পৌরসভা, রাজবাড়ী',
    address_en TEXT DEFAULT 'Pangsha Model Thana Road, Pangsha Pourashava, Rajbari',
    logo_url TEXT,
    facebook_url TEXT DEFAULT 'https://facebook.com/pangshablooddonors',
    whatsapp_number VARCHAR(20) DEFAULT '+8801712000000',
    eligibility_interval_days INTEGER DEFAULT 90,
    enable_telegram_notify BOOLEAN DEFAULT FALSE,
    enable_public_request_posting BOOLEAN DEFAULT TRUE,
    telegram_bot_token TEXT,
    telegram_chat_id TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);


-- 4. PERFORMANCE INDEXES
CREATE INDEX IF NOT EXISTS idx_donors_phone ON donors(phone) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_donors_blood_group ON donors(blood_group_id);
CREATE INDEX IF NOT EXISTS idx_donors_district ON donors(district_id);
CREATE INDEX IF NOT EXISTS idx_donors_upazila ON donors(upazila_id);
CREATE INDEX IF NOT EXISTS idx_donors_union ON donors(union_id);
CREATE INDEX IF NOT EXISTS idx_donors_availability ON donors(availability_status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_donors_last_donation ON donors(last_donation_date);
CREATE INDEX IF NOT EXISTS idx_donors_verified ON donors(verified);

CREATE INDEX IF NOT EXISTS idx_blood_requests_status ON blood_requests(status) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_blood_requests_required_date ON blood_requests(required_date);
CREATE INDEX IF NOT EXISTS idx_donation_history_donor ON donation_history(donor_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;


-- 5. AUTOMATED FUNCTIONS & TRIGGERS

-- 5.1 Updated At Timestamp Trigger Function
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply timestamp triggers
DROP TRIGGER IF EXISTS set_profiles_updated_at ON profiles;
CREATE TRIGGER set_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

DROP TRIGGER IF EXISTS set_donors_updated_at ON donors;
CREATE TRIGGER set_donors_updated_at BEFORE UPDATE ON donors FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

DROP TRIGGER IF EXISTS set_blood_requests_updated_at ON blood_requests;
CREATE TRIGGER set_blood_requests_updated_at BEFORE UPDATE ON blood_requests FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

DROP TRIGGER IF EXISTS set_campaigns_updated_at ON campaigns;
CREATE TRIGGER set_campaigns_updated_at BEFORE UPDATE ON campaigns FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

DROP TRIGGER IF EXISTS set_settings_updated_at ON settings;
CREATE TRIGGER set_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();


-- 5.2 Auto Update Donor Stats on New Donation Record
CREATE OR REPLACE FUNCTION handle_donation_history_insert()
RETURNS TRIGGER AS $$
DECLARE
    v_interval INTEGER;
BEGIN
    -- Fetch eligibility interval days from settings
    SELECT COALESCE(eligibility_interval_days, 90) INTO v_interval FROM settings WHERE id = 1;
    IF v_interval IS NULL THEN v_interval := 90; END IF;

    -- Update donor last donation date, total count, and availability
    UPDATE donors
    SET 
        last_donation_date = NEW.donation_date,
        total_donations = total_donations + NEW.units,
        availability_status = CASE 
            WHEN (CURRENT_DATE - NEW.donation_date) < v_interval THEN 'TEMP_UNAVAILABLE'::availability_status_enum
            ELSE availability_status
        END,
        updated_at = NOW()
    WHERE id = NEW.donor_id;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_donation_history_insert ON donation_history;
CREATE TRIGGER on_donation_history_insert
AFTER INSERT ON donation_history
FOR EACH ROW EXECUTE FUNCTION handle_donation_history_insert();


-- 5.3 Sync Supabase Auth Users to Profiles Table
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, email, phone, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
        NEW.email,
        NEW.raw_user_meta_data->>'phone',
        'VOLUNTEER'::user_role_enum
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- 6. SECURITY HELPER FUNCTIONS FOR ROW LEVEL SECURITY (RLS)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
    v_role user_role_enum;
BEGIN
    SELECT role INTO v_role FROM public.profiles WHERE id = auth.uid() AND deleted_at IS NULL;
    RETURN v_role IN ('ADMIN', 'SUPER_ADMIN');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
DECLARE
    v_role user_role_enum;
BEGIN
    SELECT role INTO v_role FROM public.profiles WHERE id = auth.uid() AND deleted_at IS NULL;
    RETURN v_role = 'SUPER_ADMIN';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 7. ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE divisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE districts ENABLE ROW LEVEL SECURITY;
ALTER TABLE upazilas ENABLE ROW LEVEL SECURITY;
ALTER TABLE unions ENABLE ROW LEVEL SECURITY;
ALTER TABLE villages ENABLE ROW LEVEL SECURITY;
ALTER TABLE blood_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE donation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE blood_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;


-- 8. RLS POLICIES

-- 8.1 Public Lookup Tables (Read by anyone, Edit by Admin)
CREATE POLICY "Public read for blood_groups" ON blood_groups FOR SELECT USING (true);
CREATE POLICY "Admin write for blood_groups" ON blood_groups FOR ALL USING (public.is_admin());

CREATE POLICY "Public read for divisions" ON divisions FOR SELECT USING (true);
CREATE POLICY "Public read for districts" ON districts FOR SELECT USING (true);
CREATE POLICY "Public read for upazilas" ON upazilas FOR SELECT USING (true);
CREATE POLICY "Public read for unions" ON unions FOR SELECT USING (true);
CREATE POLICY "Public read for villages" ON villages FOR SELECT USING (true);

CREATE POLICY "Public read for settings" ON settings FOR SELECT USING (true);
CREATE POLICY "Super admin update settings" ON settings FOR UPDATE USING (public.is_super_admin());

-- 8.2 Profiles
CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id OR public.is_admin());
CREATE POLICY "Admin full access profiles" ON profiles FOR ALL USING (public.is_admin());

-- 8.3 Donors (Visitors read active public donors; Admins manage)
CREATE POLICY "Public read active verified donors" ON donors FOR SELECT USING (deleted_at IS NULL AND verified = true);
CREATE POLICY "Admin full access donors" ON donors FOR ALL USING (public.is_admin());

-- 8.4 Donation History
CREATE POLICY "Public read donation history" ON donation_history FOR SELECT USING (true);
CREATE POLICY "Admin manage donation history" ON donation_history FOR ALL USING (public.is_admin());

-- 8.5 Blood Requests
CREATE POLICY "Public read non-deleted blood requests" ON blood_requests FOR SELECT USING (deleted_at IS NULL);
CREATE POLICY "Public insert blood request" ON blood_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Admin manage blood requests" ON blood_requests FOR ALL USING (public.is_admin());

-- 8.6 Campaigns
CREATE POLICY "Public read campaigns" ON campaigns FOR SELECT USING (status != 'CANCELLED');
CREATE POLICY "Admin manage campaigns" ON campaigns FOR ALL USING (public.is_admin());

-- 8.7 Notifications
CREATE POLICY "Users read own notifications" ON notifications FOR SELECT USING (user_id = auth.uid() OR recipient_role IS NOT NULL OR public.is_admin());
CREATE POLICY "Users update own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid() OR public.is_admin());

-- 8.8 Activity Logs
CREATE POLICY "Admin read activity logs" ON activity_logs FOR SELECT USING (public.is_admin());
CREATE POLICY "Admin create activity logs" ON activity_logs FOR INSERT WITH CHECK (true);


-- 9. SUPABASE STORAGE BUCKETS SETUP
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('donors', 'donors', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('gallery', 'gallery', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('campaigns', 'campaigns', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('organization', 'organization', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'])
ON CONFLICT (id) DO NOTHING;

-- Storage Policies
CREATE POLICY "Public Read Access for Donors Bucket" ON storage.objects FOR SELECT USING (bucket_id = 'donors');
CREATE POLICY "Authenticated Upload Access for Donors Bucket" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'donors');
CREATE POLICY "Public Read Access for Gallery Bucket" ON storage.objects FOR SELECT USING (bucket_id = 'gallery');
CREATE POLICY "Public Read Access for Campaigns Bucket" ON storage.objects FOR SELECT USING (bucket_id = 'campaigns');
CREATE POLICY "Public Read Access for Organization Bucket" ON storage.objects FOR SELECT USING (bucket_id = 'organization');
