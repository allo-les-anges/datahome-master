import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_BASE = process.env.SUPABASE_URL || 'https://idoosovuatkqfrkuyiie.supabase.co';
const SUPABASE_KEY =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlkb29zb3Z1YXRrcWZya3V5aWllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3MTEwMDgsImV4cCI6MjA4NzI4NzAwOH0.JJKPOFgVdNgoweD4B4cIo28Ip3aGRvh-0czsgvY0AuM';

function normalizeSubdomain(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const subdomain = normalizeSubdomain(searchParams.get('subdomain') || '');

  if (!subdomain || subdomain.length < 3) {
    return NextResponse.json({ available: null });
  }

  const res = await fetch(
    `${SUPABASE_BASE}/rest/v1/agency_settings?subdomain=eq.${encodeURIComponent(subdomain)}&select=id&limit=1`,
    {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    },
  );

  if (!res.ok) {
    const details = await res.text();
    return NextResponse.json({ available: null, error: 'Subdomain check failed', details }, { status: 502 });
  }

  const rows = await res.json();
  return NextResponse.json({ available: rows.length === 0 });
}