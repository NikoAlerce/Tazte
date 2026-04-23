import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  try {
    const { address, archetype, layer } = await request.json();

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    // Upsert user profile
    const { data, error } = await supabase
      .from('profiles')
      .upsert({ 
        wallet_address: address, 
        archetype: archetype,
        last_layer: layer,
        updated_at: new Date() 
      }, { onConflict: 'wallet_address' })
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, profile: data[0] });
  } catch (err) {
    console.error('Auth error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
