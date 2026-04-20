import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { agency_id, session_id, full_name, email, phone, budget, location, delay, project_type, source } = body;

    if (!email && !phone) {
      return NextResponse.json({ error: 'Email or phone required' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('leads')
      .insert({
        agency_id: agency_id || null,
        session_id: session_id || null,
        full_name: full_name || null,
        email: email || null,
        phone: phone || null,
        budget: budget || null,
        location: location || null,
        delay: delay || null,
        project_type: project_type || null,
        source: source || 'chatbot',
        status: 'new',
      })
      .select('id')
      .single();

    if (error) {
      console.error('[Leads] Supabase insert error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log('[Leads] Lead saved:', data.id);
    return NextResponse.json({ success: true, id: data.id });
  } catch (err: any) {
    console.error('[Leads] Unexpected error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
