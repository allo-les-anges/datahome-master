import { NextResponse } from 'next/server';

const SUPABASE_BASE = process.env.SUPABASE_URL || 'https://idoosovuatkqfrkuyiie.supabase.co';
const SUPABASE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY
                   || process.env.SUPABASE_KEY
                   || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlkb29zb3Z1YXRrcWZya3V5aWllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3MTEwMDgsImV4cCI6MjA4NzI4NzAwOH0.JJKPOFgVdNgoweD4B4cIo28Ip3aGRvh-0czsgvY0AuM';

export async function GET() {
  const res = await fetch(
    `${SUPABASE_BASE}/rest/v1/register_premium?status=in.(pending,verified)&order=created_at.desc&select=id,first_name,last_name,email,company_name,phone_number,preferred_language,status,created_at,otp_expires_at`,
    {
      headers: {
        apikey:        SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
      cache: 'no-store',
    },
  );
  if (!res.ok) {
    return NextResponse.json({ error: await res.text() }, { status: 502 });
  }
  return NextResponse.json(await res.json());
}
