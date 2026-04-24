import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_BASE = process.env.SUPABASE_URL   || 'https://idoosovuatkqfrkuyiie.supabase.co';
const SUPABASE_KEY  = process.env.SUPABASE_KEY   || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlkb29zb3Z1YXRrcWZya3V5aWllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3MTEwMDgsImV4cCI6MjA4NzI4NzAwOH0.JJKPOFgVdNgoweD4B4cIo28Ip3aGRvh-0czsgvY0AuM';

function sb(path: string) {
  return `${SUPABASE_BASE}/rest/v1/${path}`;
}

const HEADERS = {
  apikey:          SUPABASE_KEY,
  Authorization:   `Bearer ${SUPABASE_KEY}`,
  'Content-Type':  'application/json',
  Prefer:          'return=representation',
};

export async function POST(req: NextRequest) {
  let email: string, otp_code: string;
  try {
    ({ email, otp_code } = await req.json());
  } catch {
    return NextResponse.json({ success: false, error: 'Body JSON invalide' }, { status: 400 });
  }

  if (!email || !otp_code) {
    return NextResponse.json({ success: false, error: 'email et otp_code requis' }, { status: 400 });
  }

  const now = encodeURIComponent(new Date().toISOString());

  // Cherche un enregistrement pending avec ce code non expiré
  const selectRes = await fetch(
    sb(`register_premium?email=eq.${encodeURIComponent(email)}&otp_code=eq.${encodeURIComponent(otp_code)}&status=eq.pending&otp_expires_at=gt.${now}&select=id,first_name,last_name,email,company_name,phone_number,preferred_language`),
    { headers: HEADERS },
  );

  if (!selectRes.ok) {
    return NextResponse.json({ success: false, error: 'Erreur Supabase (select)' }, { status: 502 });
  }

  const rows: any[] = await selectRes.json();

  if (!rows || rows.length === 0) {
    return NextResponse.json({ success: false, error: 'Code invalide ou expiré.' }, { status: 400 });
  }

  const record = rows[0];

  // Marque le code comme vérifié
  const patchRes = await fetch(
    sb(`register_premium?id=eq.${record.id}`),
    {
      method:  'PATCH',
      headers: { ...HEADERS, Prefer: 'return=minimal' },
      body:    JSON.stringify({ status: 'verified' }),
    },
  );

  if (!patchRes.ok) {
    return NextResponse.json({ success: false, error: 'Erreur Supabase (patch)' }, { status: 502 });
  }

  return NextResponse.json({
    success: true,
    data: {
      id:                 record.id,
      first_name:         record.first_name,
      last_name:          record.last_name,
      email:              record.email,
      company_name:       record.company_name,
      phone_number:       record.phone_number,
      preferred_language: record.preferred_language,
    },
  });
}
