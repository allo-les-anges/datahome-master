import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_BASE = process.env.SUPABASE_URL || 'https://idoosovuatkqfrkuyiie.supabase.co';
const SUPABASE_KEY  = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlkb29zb3Z1YXRrcWZya3V5aWllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3MTEwMDgsImV4cCI6MjA4NzI4NzAwOH0.JJKPOFgVdNgoweD4B4cIo28Ip3aGRvh-0czsgvY0AuM';

const BASE_HEADERS = {
  apikey:         SUPABASE_KEY,
  Authorization:  `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
};

function sb(path: string) {
  return `${SUPABASE_BASE}/rest/v1/${path}`;
}

export async function POST(req: NextRequest) {
  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Body JSON invalide' }, { status: 400 });
  }

  const { email, agency_name, subdomain, primary_color, hero_title, default_lang, xml_url, whatsapp, facebook } = body;

  if (!email || !agency_name || !subdomain) {
    return NextResponse.json({ success: false, error: 'email, agency_name et subdomain sont requis' }, { status: 400 });
  }

  // ① Vérifie que le prospect a bien validé son OTP
  const checkRes = await fetch(
    sb(`register_premium?email=eq.${encodeURIComponent(email)}&status=eq.verified&select=id`),
    { headers: BASE_HEADERS },
  );
  const checkRows: any[] = await checkRes.json();

  if (!checkRows || checkRows.length === 0) {
    return NextResponse.json({ success: false, error: 'OTP non vérifié pour cet email.' }, { status: 403 });
  }
  const prospectId = checkRows[0].id;

  // ② Vérifie que le sous-domaine n'est pas déjà pris
  const dupRes = await fetch(
    sb(`agency_settings?subdomain=eq.${encodeURIComponent(subdomain)}&select=id`),
    { headers: BASE_HEADERS },
  );
  const dupRows: any[] = await dupRes.json();

  if (dupRows && dupRows.length > 0) {
    return NextResponse.json({ success: false, error: 'Ce sous-domaine est déjà utilisé.' }, { status: 409 });
  }

  // ③ Construit le footer_config
  const footer_config = {
    allowed_langs:  default_lang ? [default_lang, 'en'].filter((v, i, a) => a.indexOf(v) === i) : ['en'],
    xml_urls:       xml_url ? [xml_url] : [],
    socials:        { facebook: facebook || '', whatsapp: whatsapp || '' },
    integrations:   {},
    subscription:   { website_active: true },
  };

  // ④ Crée l'agence dans agency_settings
  const insertRes = await fetch(
    sb('agency_settings'),
    {
      method:  'POST',
      headers: { ...BASE_HEADERS, Prefer: 'return=representation' },
      body: JSON.stringify({
        agency_name:      agency_name.trim(),
        subdomain:        subdomain.trim().toLowerCase().replace(/\s+/g, '-'),
        primary_color:    primary_color || '#e5992e',
        button_color:     primary_color || '#e5992e',
        button_style:     'rounded-full',
        button_animation: 'none',
        hero_type:        'image',
        hero_title:       hero_title || '',
        whatsapp_number:  whatsapp || null,
        default_lang:     default_lang || 'en',
        package_level:    'premium',
        footer_config,
        team_data:        [],
        created_at:       new Date().toISOString(),
        updated_at:       new Date().toISOString(),
      }),
    },
  );

  if (!insertRes.ok) {
    const err = await insertRes.text();
    return NextResponse.json({ success: false, error: `Supabase insert error: ${err}` }, { status: 502 });
  }

  const [newAgency] = await insertRes.json();

  // ⑤ Marque le prospect comme actif
  await fetch(
    sb(`register_premium?id=eq.${prospectId}`),
    {
      method:  'PATCH',
      headers: { ...BASE_HEADERS, Prefer: 'return=minimal' },
      body:    JSON.stringify({ status: 'active' }),
    },
  );

  return NextResponse.json({
    success:   true,
    subdomain: newAgency?.subdomain || subdomain,
    agency_id: newAgency?.id,
  }, { status: 201 });
}
