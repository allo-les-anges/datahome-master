import { NextResponse } from 'next/server';
import { isAdminRequest, unauthorized } from '@/lib/serverAuth';

const SUPABASE_BASE = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY
                   || process.env.SUPABASE_KEY;

export async function GET(request: Request) {
  if (!isAdminRequest(request)) return unauthorized();
  if (!SUPABASE_BASE || !SUPABASE_KEY) {
    return NextResponse.json({ error: 'Configuration Supabase manquante' }, { status: 500 });
  }

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
