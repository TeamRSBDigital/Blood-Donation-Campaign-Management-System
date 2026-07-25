import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Configuration & Constants
const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp'
];

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

export const MAX_FILE_SIZE_BYTES = 2 * 1024 * 1024; // 2MB Limit
export const DEFAULT_BUCKET = 'donors-photos';

// Lazy Supabase Client Initialization
let supabaseClient: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (supabaseClient) return supabaseClient;

  const metaEnv = (import.meta as any).env || {};
  const supabaseUrl = metaEnv.VITE_SUPABASE_URL || (typeof process !== 'undefined' ? process.env?.VITE_SUPABASE_URL : '');
  const supabaseAnonKey = metaEnv.VITE_SUPABASE_ANON_KEY || (typeof process !== 'undefined' ? process.env?.VITE_SUPABASE_ANON_KEY : '');

  if (supabaseUrl && supabaseAnonKey && supabaseUrl.trim() !== '' && supabaseAnonKey.trim() !== '') {
    try {
      supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
      return supabaseClient;
    } catch (err) {
      console.warn('Failed to initialize Supabase client:', err);
      return null;
    }
  }

  return null;
}

export interface FileValidationResult {
  valid: boolean;
  error?: string;
}

export interface UploadResult {
  url: string | null;
  path: string | null;
  error: string | null;
}

/**
 * Validates file type (JPG, PNG, WEBP) and size (Maximum 2MB).
 */
export function validateFile(file: File): FileValidationResult {
  if (!file) {
    return { valid: false, error: 'কোনো ফাইল নির্বাচন করা হয়নি।' };
  }

  // 1. File Size Validation (Max 2MB)
  if (file.size > MAX_FILE_SIZE_BYTES) {
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
    return {
      valid: false,
      error: `ফাইল সাইজ ${sizeInMB}MB। ফাইল সাইজ সর্বোচ্চ 2MB এর বেশি হতে পারবে না।`
    };
  }

  // 2. File Type / Extension Validation
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();
  const hasValidExtension = ALLOWED_EXTENSIONS.some(ext => fileName.endsWith(ext));
  const hasValidMime = ALLOWED_MIME_TYPES.includes(fileType);

  if (!hasValidMime && !hasValidExtension) {
    return {
      valid: false,
      error: 'অপ্রত্যাশিত ফাইল ফরম্যাট! শুধুমাত্র JPG, PNG এবং WEBP ফরম্যাটের ছবি আপলোড করা যাবে।'
    };
  }

  return { valid: true };
}

/**
 * Generates the public URL for an asset stored in Supabase Storage.
 */
export function getPublicUrl(bucket: string = DEFAULT_BUCKET, path: string): string {
  if (!path) return '';

  // If path is already a full http(s) URL or data URL, return directly
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('data:')) {
    return path;
  }

  const supabase = getSupabaseClient();
  if (supabase) {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    if (data?.publicUrl) {
      return data.publicUrl;
    }
  }

  // Fallback URL construction if client is unavailable
  const metaEnv = (import.meta as any).env || {};
  const supabaseUrl = metaEnv.VITE_SUPABASE_URL || (typeof process !== 'undefined' ? process.env?.VITE_SUPABASE_URL : '') || 'https://supabase-project.supabase.co';
  const cleanUrl = supabaseUrl.replace(/\/$/, '');
  const cleanPath = path.replace(/^\//, '');
  return `${cleanUrl}/storage/v1/object/public/${bucket}/${cleanPath}`;
}

/**
 * Uploads a file to Supabase Storage with strict validation.
 * Falls back to DataURL encoding if Supabase credentials are not provided.
 */
export async function uploadFile(
  file: File,
  bucket: string = DEFAULT_BUCKET,
  folder: string = 'avatars'
): Promise<UploadResult> {
  // 1. Validate File
  const validation = validateFile(file);
  if (!validation.valid) {
    return {
      url: null,
      path: null,
      error: validation.error || 'ফাইল ভ্যালিডেশন ব্যর্থ হয়েছে।'
    };
  }

  // Sanitize file name & construct storage path
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const sanitizedOriginalName = file.name
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .toLowerCase();
  const uniqueId = `${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const storagePath = `${folder}/${uniqueId}_${sanitizedOriginalName}`;

  const supabase = getSupabaseClient();

  // 2. Upload to Supabase Storage if configured
  if (supabase) {
    try {
      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: true,
          contentType: file.type || `image/${fileExt}`
        });

      if (error) {
        console.error('Supabase Storage Upload Error:', error);
        return {
          url: null,
          path: null,
          error: `আপলোড ব্যর্থ হয়েছে: ${error.message}`
        };
      }

      const publicUrl = getPublicUrl(bucket, data.path);
      return {
        url: publicUrl,
        path: data.path,
        error: null
      };
    } catch (err: any) {
      console.error('Storage Exception:', err);
      return {
        url: null,
        path: null,
        error: err.message || 'ফাইল আপলোড করতে নেটওয়ার্ক সমস্যা হয়েছে।'
      };
    }
  }

  // 3. Fallback: Convert to DataURL if Supabase credentials are missing
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      resolve({
        url: dataUrl,
        path: storagePath,
        error: null
      });
    };
    reader.onerror = () => {
      resolve({
        url: null,
        path: null,
        error: 'ফাইল রিড করা যায়নি।'
      });
    };
    reader.readAsDataURL(file);
  });
}

/**
 * Deletes a file from Supabase Storage by path.
 */
export async function deleteFile(
  path: string,
  bucket: string = DEFAULT_BUCKET
): Promise<{ success: boolean; error: string | null }> {
  if (!path) return { success: false, error: 'কোনো পাথ প্রদান করা হয়নি।' };

  const supabase = getSupabaseClient();
  if (!supabase) {
    return { success: true, error: null }; // Mock delete
  }

  try {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) {
      return { success: false, error: error.message };
    }
    return { success: true, error: null };
  } catch (err: any) {
    return { success: false, error: err.message || 'ফাইল ডিলিট করতে ব্যর্থ হয়েছে।' };
  }
}

export const storageService = {
  validateFile,
  getPublicUrl,
  uploadFile,
  deleteFile,
  MAX_FILE_SIZE_BYTES,
  DEFAULT_BUCKET
};
