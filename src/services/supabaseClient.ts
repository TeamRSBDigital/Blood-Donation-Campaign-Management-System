// Supabase Client Abstraction
// Ready for production integration when env vars SUPABASE_URL & SUPABASE_ANON_KEY are present

export interface SupabaseConfig {
  url: string;
  anonKey: string;
}

export const getSupabaseConfig = (): SupabaseConfig | null => {
  const url = process.env.VITE_SUPABASE_URL;
  const anonKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (url && anonKey) {
    return { url, anonKey };
  }
  return null;
};

export const isSupabaseConfigured = (): boolean => {
  return getSupabaseConfig() !== null;
};

export class SupabaseClientStub {
  private config: SupabaseConfig | null;

  constructor() {
    this.config = getSupabaseConfig();
  }

  async syncWithSupabase(table: string, data: any) {
    if (!this.config) {
      console.log(`[Supabase Stub] Local mode active. Table '${table}' change logged.`);
      return { success: true, localMode: true };
    }
    // Production Supabase sync logic placeholder
    return { success: true, localMode: false };
  }
}

export const supabase = new SupabaseClientStub();
