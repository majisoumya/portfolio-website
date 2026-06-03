import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn("⚠️ Supabase credentials are missing. Please add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file and RESTART the dev server.");
}

const dummyClient = {
  from: () => ({ 
    select: () => ({ order: () => Promise.resolve({ data: [] }) }),
    insert: () => Promise.resolve({}),
    update: () => ({ eq: () => Promise.resolve({}) }),
    delete: () => ({ eq: () => Promise.resolve({}) })
  }),
  auth: { 
    getSession: () => Promise.resolve({ data: { session: null } }), 
    signInWithPassword: () => Promise.resolve({ error: { message: "No API keys configured" } }),
    signOut: () => Promise.resolve()
  },
  storage: { 
    from: () => ({ 
      upload: () => Promise.resolve({ error: { message: "No API keys" } }), 
      getPublicUrl: () => ({ data: { publicUrl: "" } }) 
    }) 
  }
};

let client;
try {
  if (supabaseUrl && supabaseAnonKey) {
    client = createClient(supabaseUrl, supabaseAnonKey);
  }
} catch (e) {
  console.error("Failed to initialize Supabase client. Check if your VITE_SUPABASE_URL is a valid URL starting with https://", e);
}

export const supabase = client || (dummyClient as any);
