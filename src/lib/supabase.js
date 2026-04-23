import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

function canCreateClient() {
  if (!supabaseUrl || !supabaseAnonKey) {
    return false;
  }

  try {
    const parsed = new URL(supabaseUrl);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

export const supabase = canCreateClient() ? createClient(supabaseUrl, supabaseAnonKey) : null;

const PROFILE_COLUMNS = "id,wallet_address,archetype,last_layer,onboarding_answers,twitter_handle,created_at,updated_at";

export const getProfiles = async () => {
  if (!supabase) {
    throw new Error("Supabase client is not configured");
  }

  const { data, error } = await supabase
    .from('profiles')
    .select(PROFILE_COLUMNS)
    .order('created_at', { ascending: false });
    
  if (error) {
    throw new Error('Unable to fetch profiles');
  }
  return data;
};

export const getProfileByAddress = async (walletAddress) => {
  if (!supabase) {
    throw new Error("Supabase client is not configured");
  }
  if (!walletAddress) {
    return null;
  }

  const { data, error } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("wallet_address", walletAddress)
    .maybeSingle();

  if (error) {
    throw new Error("Unable to fetch profile");
  }

  return data;
};
