import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_BASE = process.env.SUPABASE_URL || 'https://idoosovuatkqfrkuyiie.supabase.co';
const SUPABASE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY
                   || process.env.SUPABASE_KEY
                   || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlkb29zb3Z1YXRrcWZya3V5aWllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3MTEwMDgsImV4cCI6MjA4NzI4NzAwOH0.JJKPOFgVdNgoweD4B4cIo28Ip3aGRvh-0czsgvY0AuM';

const BASE_HEADERS = {
  apikey:        SUPABASE_KEY,
  Authorization: `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
  Prefer:        'return=minimal',
};

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ success: false, error: 'id requis' }, { status: 400 });
  }

  const res = await fetch(
    `${SUPABASE_BASE}/rest/v1/agency_settings?id=eq.${encodeURIComponent(id)}`,
    { method: 'DELETE', headers: BASE_HEADERS },
  );

  // Supabase renvoie 204 No Content (sans body) quand le DELETE réussit
  if (res.status === 204 || res.ok) {
    return NextResponse.json({ success: true });
  }

  const err = await res.text();
  console.error('[delete-agency]', res.status, err);
  return NextResponse.json({ success: false, error: err }, { status: res.status });
}
