import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

export async function POST(request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables');
      return NextResponse.json({ error: 'Database configuration missing' }, { status: 500 });
    }

    const { address, archetype, layer } = await request.json();
    console.log(`Authenticating wallet: ${address} on ${layer} with archetype: ${archetype}`);

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
        updated_at: new Date().toISOString()
      }, { onConflict: 'wallet_address' })
      .select();

    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }

    return NextResponse.json({ success: true, profile: data[0] });
  } catch (err) {
    console.error('Full Auth API error:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
