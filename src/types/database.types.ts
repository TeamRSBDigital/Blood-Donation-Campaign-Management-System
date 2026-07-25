// Supabase Database TypeScript Definitions
// Auto-aligned with PostgreSQL Normalized Schema for Pangsha Blood Donors Association

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRoleEnum = 'SUPER_ADMIN' | 'ADMIN' | 'VOLUNTEER' | 'MEMBER';
export type GenderEnum = 'MALE' | 'FEMALE' | 'OTHER';
export type AvailabilityStatusEnum = 'AVAILABLE' | 'UNAVAILABLE' | 'TEMP_UNAVAILABLE' | 'RESTRICTED';
export type RequestPriorityEnum = 'NORMAL' | 'URGENT' | 'CRITICAL';
export type RequestStatusEnum = 'PENDING' | 'APPROVED' | 'FULFILLED' | 'CANCELLED';
export type NotificationTypeEnum = 'BLOOD_REQUEST' | 'CAMPAIGN' | 'DONOR_ALERT' | 'SYSTEM';
export type CampaignStatusEnum = 'UPCOMING' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';

export interface Database {
  public: {
    Tables: {
      roles: {
        Row: {
          id: string;
          name: string;
          display_name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          display_name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          display_name?: string;
          description?: string | null;
          updated_at?: string;
        };
      };
      permissions: {
        Row: {
          id: string;
          code: string;
          name: string;
          description: string | null;
          category: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          description?: string | null;
          category?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          description?: string | null;
          category?: string;
        };
      };
      divisions: {
        Row: {
          id: string;
          name_en: string;
          name_bn: string;
          code: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name_en: string;
          name_bn: string;
          code?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name_en?: string;
          name_bn?: string;
          code?: string | null;
        };
      };
      districts: {
        Row: {
          id: string;
          division_id: string;
          name_en: string;
          name_bn: string;
          lat: number | null;
          lng: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          division_id: string;
          name_en: string;
          name_bn: string;
          lat?: number | null;
          lng?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          division_id?: string;
          name_en?: string;
          name_bn?: string;
          lat?: number | null;
          lng?: number | null;
        };
      };
      upazilas: {
        Row: {
          id: string;
          district_id: string;
          name_en: string;
          name_bn: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          district_id: string;
          name_en: string;
          name_bn: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          district_id?: string;
          name_en?: string;
          name_bn?: string;
        };
      };
      unions: {
        Row: {
          id: string;
          upazila_id: string;
          name_en: string;
          name_bn: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          upazila_id: string;
          name_en: string;
          name_bn: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          upazila_id?: string;
          name_en?: string;
          name_bn?: string;
        };
      };
      villages: {
        Row: {
          id: string;
          union_id: string;
          name_en: string | null;
          name_bn: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          union_id: string;
          name_en?: string | null;
          name_bn: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          union_id?: string;
          name_en?: string | null;
          name_bn?: string;
        };
      };
      blood_groups: {
        Row: {
          id: string;
          code: string;
          name: string;
          can_donate_to: string[];
          can_receive_from: string[];
          created_at: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
          can_donate_to?: string[];
          can_receive_from?: string[];
          created_at?: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
          can_donate_to?: string[];
          can_receive_from?: string[];
        };
      };
      profiles: {
        Row: {
          id: string;
          full_name: string;
          full_name_en: string | null;
          email: string;
          phone: string | null;
          avatar_url: string | null;
          role_id: string | null;
          role: UserRoleEnum;
          status: string;
          last_login: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id: string;
          full_name: string;
          full_name_en?: string | null;
          email: string;
          phone?: string | null;
          avatar_url?: string | null;
          role_id?: string | null;
          role?: UserRoleEnum;
          status?: string;
          last_login?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          full_name?: string;
          full_name_en?: string | null;
          email?: string;
          phone?: string | null;
          avatar_url?: string | null;
          role_id?: string | null;
          role?: UserRoleEnum;
          status?: string;
          last_login?: string | null;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      donors: {
        Row: {
          id: string;
          donor_code: string;
          user_id: string | null;
          full_name: string;
          full_name_en: string | null;
          gender: GenderEnum;
          date_of_birth: string | null;
          age: number | null;
          blood_group_id: string;
          weight: number | null;
          occupation: string | null;
          phone: string;
          whatsapp: string | null;
          alternative_phone: string | null;
          email: string | null;
          division_id: string | null;
          district_id: string | null;
          upazila_id: string | null;
          union_id: string | null;
          village_id: string | null;
          village: string;
          profile_image: string | null;
          last_donation_date: string | null;
          total_donations: number;
          hemoglobin: string | null;
          bp_notes: string | null;
          availability_status: AvailabilityStatusEnum;
          medical_notes: string | null;
          diabetes: boolean;
          high_blood_pressure: boolean;
          hepatitis: boolean;
          other_diseases: string | null;
          emergency_contact_name: string | null;
          emergency_contact_relation: string | null;
          emergency_contact_phone: string | null;
          verified: boolean;
          can_donate: boolean;
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          donor_code: string;
          user_id?: string | null;
          full_name: string;
          full_name_en?: string | null;
          gender?: GenderEnum;
          date_of_birth?: string | null;
          age?: number | null;
          blood_group_id: string;
          weight?: number | null;
          occupation?: string | null;
          phone: string;
          whatsapp?: string | null;
          alternative_phone?: string | null;
          email?: string | null;
          division_id?: string | null;
          district_id?: string | null;
          upazila_id?: string | null;
          union_id?: string | null;
          village_id?: string | null;
          village: string;
          profile_image?: string | null;
          last_donation_date?: string | null;
          total_donations?: number;
          hemoglobin?: string | null;
          bp_notes?: string | null;
          availability_status?: AvailabilityStatusEnum;
          medical_notes?: string | null;
          diabetes?: boolean;
          high_blood_pressure?: boolean;
          hepatitis?: boolean;
          other_diseases?: string | null;
          emergency_contact_name?: string | null;
          emergency_contact_relation?: string | null;
          emergency_contact_phone?: string | null;
          verified?: boolean;
          can_donate?: boolean;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          donor_code?: string;
          user_id?: string | null;
          full_name?: string;
          full_name_en?: string | null;
          gender?: GenderEnum;
          date_of_birth?: string | null;
          age?: number | null;
          blood_group_id?: string;
          weight?: number | null;
          occupation?: string | null;
          phone?: string;
          whatsapp?: string | null;
          alternative_phone?: string | null;
          email?: string | null;
          division_id?: string | null;
          district_id?: string | null;
          upazila_id?: string | null;
          union_id?: string | null;
          village_id?: string | null;
          village?: string;
          profile_image?: string | null;
          last_donation_date?: string | null;
          total_donations?: number;
          hemoglobin?: string | null;
          bp_notes?: string | null;
          availability_status?: AvailabilityStatusEnum;
          medical_notes?: string | null;
          diabetes?: boolean;
          high_blood_pressure?: boolean;
          hepatitis?: boolean;
          other_diseases?: string | null;
          emergency_contact_name?: string | null;
          emergency_contact_relation?: string | null;
          emergency_contact_phone?: string | null;
          verified?: boolean;
          can_donate?: boolean;
          updated_by?: string | null;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      donation_history: {
        Row: {
          id: string;
          donor_id: string;
          patient_name: string | null;
          hospital: string;
          blood_group_id: string | null;
          units: number;
          location: string | null;
          notes: string | null;
          donation_date: string;
          verified_by: string | null;
          created_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          donor_id: string;
          patient_name?: string | null;
          hospital: string;
          blood_group_id?: string | null;
          units?: number;
          location?: string | null;
          notes?: string | null;
          donation_date?: string;
          verified_by?: string | null;
          created_by?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          donor_id?: string;
          patient_name?: string | null;
          hospital?: string;
          blood_group_id?: string | null;
          units?: number;
          location?: string | null;
          notes?: string | null;
          donation_date?: string;
          verified_by?: string | null;
          created_by?: string | null;
        };
      };
      blood_requests: {
        Row: {
          id: string;
          request_code: string;
          patient_name: string;
          blood_group_id: string;
          hospital: string;
          district_id: string | null;
          upazila_id: string | null;
          union_id: string | null;
          units_needed: number;
          contact_person: string;
          contact_number: string;
          alternative_phone: string | null;
          required_date: string;
          required_time: string | null;
          priority: RequestPriorityEnum;
          status: RequestStatusEnum;
          disease_reason: string | null;
          medical_docs_url: string | null;
          fulfilled_date: string | null;
          notes: string | null;
          created_by: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          request_code: string;
          patient_name: string;
          blood_group_id: string;
          hospital: string;
          district_id?: string | null;
          upazila_id?: string | null;
          union_id?: string | null;
          units_needed?: number;
          contact_person: string;
          contact_number: string;
          alternative_phone?: string | null;
          required_date: string;
          required_time?: string | null;
          priority?: RequestPriorityEnum;
          status?: RequestStatusEnum;
          disease_reason?: string | null;
          medical_docs_url?: string | null;
          fulfilled_date?: string | null;
          notes?: string | null;
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
          deleted_at?: string | null;
        };
        Update: {
          id?: string;
          request_code?: string;
          patient_name?: string;
          blood_group_id?: string;
          hospital?: string;
          district_id?: string | null;
          upazila_id?: string | null;
          union_id?: string | null;
          units_needed?: number;
          contact_person?: string;
          contact_number?: string;
          alternative_phone?: string | null;
          required_date?: string;
          required_time?: string | null;
          priority?: RequestPriorityEnum;
          status?: RequestStatusEnum;
          disease_reason?: string | null;
          medical_docs_url?: string | null;
          fulfilled_date?: string | null;
          notes?: string | null;
          updated_at?: string;
          deleted_at?: string | null;
        };
      };
      notifications: {
        Row: {
          id: string;
          title: string;
          message: string;
          type: NotificationTypeEnum;
          is_read: boolean;
          user_id: string | null;
          recipient_role: UserRoleEnum | null;
          link_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          message: string;
          type?: NotificationTypeEnum;
          is_read?: boolean;
          user_id?: string | null;
          recipient_role?: UserRoleEnum | null;
          link_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          message?: string;
          type?: NotificationTypeEnum;
          is_read?: boolean;
          user_id?: string | null;
          recipient_role?: UserRoleEnum | null;
          link_url?: string | null;
        };
      };
      activity_logs: {
        Row: {
          id: string;
          user_id: string | null;
          actor_name: string;
          actor_role: string;
          action: string;
          entity_type: string;
          entity_id: string | null;
          details: Json | null;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          actor_name: string;
          actor_role: string;
          action: string;
          entity_type: string;
          entity_id?: string | null;
          details?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          actor_name?: string;
          actor_role?: string;
          action?: string;
          entity_type?: string;
          entity_id?: string | null;
          details?: Json | null;
          ip_address?: string | null;
          user_agent?: string | null;
        };
      };
      settings: {
        Row: {
          id: number;
          org_name_bn: string;
          org_name_en: string;
          motto_bn: string | null;
          motto_en: string | null;
          primary_phone: string;
          emergency_number: string;
          email: string | null;
          address_bn: string | null;
          address_en: string | null;
          logo_url: string | null;
          facebook_url: string | null;
          whatsapp_number: string | null;
          eligibility_interval_days: number;
          enable_telegram_notify: boolean;
          enable_public_request_posting: boolean;
          telegram_bot_token: string | null;
          telegram_chat_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          org_name_bn?: string;
          org_name_en?: string;
          motto_bn?: string | null;
          motto_en?: string | null;
          primary_phone?: string;
          emergency_number?: string;
          email?: string | null;
          address_bn?: string | null;
          address_en?: string | null;
          logo_url?: string | null;
          facebook_url?: string | null;
          whatsapp_number?: string | null;
          eligibility_interval_days?: number;
          enable_telegram_notify?: boolean;
          enable_public_request_posting?: boolean;
          telegram_bot_token?: string | null;
          telegram_chat_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          org_name_bn?: string;
          org_name_en?: string;
          motto_bn?: string | null;
          motto_en?: string | null;
          primary_phone?: string;
          emergency_number?: string;
          email?: string | null;
          address_bn?: string | null;
          address_en?: string | null;
          logo_url?: string | null;
          facebook_url?: string | null;
          whatsapp_number?: string | null;
          eligibility_interval_days?: number;
          enable_telegram_notify?: boolean;
          enable_public_request_posting?: boolean;
          telegram_bot_token?: string | null;
          telegram_chat_id?: string | null;
          updated_at?: string;
        };
      };
    };
  };
}
