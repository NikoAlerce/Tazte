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

    const { address, archetype, layer, onboarding_answers, twitter_handle } = await request.json();
    console.log(`Processing profile for: ${address}`);

    if (!address) {
      return NextResponse.json({ error: 'Address is required' }, { status: 400 });
    }

    // Build update object dynamically to avoid overwriting with nulls
    const updateData = { 
      wallet_address: address,
      updated_at: new Date().toISOString()
    };
    
    if (archetype) updateData.archetype = archetype;
    if (layer) updateData.last_layer = layer;
    if (onboarding_answers) updateData.onboarding_answers = onboarding_answers;
    if (twitter_handle) updateData.twitter_handle = twitter_handle;

    // Upsert user profile
    const { data, error } = await supabase
      .from('profiles')
      .upsert(updateData, { onConflict: 'wallet_address' })
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
