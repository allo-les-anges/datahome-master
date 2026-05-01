import { NextRequest, NextResponse } from 'next/server';

const SUPABASE_BASE = process.env.SUPABASE_URL || 'https://idoosovuatkqfrkuyiie.supabase.co';
// Service role key bypasses RLS â€” required for server-side inserts into agency_settings
const SUPABASE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY
                   || process.env.SUPABASE_KEY
                   || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlkb29zb3Z1YXRrcWZya3V5aWllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3MTEwMDgsImV4cCI6MjA4NzI4NzAwOH0.JJKPOFgVdNgoweD4B4cIo28Ip3aGRvh-0czsgvY0AuM';

const BASE_HEADERS = {
  apikey:         SUPABASE_KEY,
  Authorization:  `Bearer ${SUPABASE_KEY}`,
  'Content-Type': 'application/json',
};

function sb(path: string) {
  return `${SUPABASE_BASE}/rest/v1/${path}`;
}

function slugify(value: string) {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

export async function POST(req: NextRequest) {
  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Body JSON invalide' }, { status: 400 });
  }

  const { email, agency_name, primary_color, hero_title, default_lang, whatsapp, facebook, package_level, logo, logo_url, hero_url } = body;

  if (!email || !agency_name) {
    return NextResponse.json({ success: false, error: 'email et agency_name sont requis' }, { status: 400 });
  }

  console.log('[create-agency-premium] â‘  VÃ©rification OTP pour:', email);

  // â‘  VÃ©rifie que le prospect a bien validÃ© son OTP
  const checkRes = await fetch(
    sb(`register_premium?email=eq.${encodeURIComponent(email)}&status=eq.verified&select=id,company_name`),
    { headers: BASE_HEADERS },
  );

  if (!checkRes.ok) {
    const errBody = await checkRes.text();
    console.error('[create-agency-premium] â‘  Erreur lecture register_premium:', checkRes.status, errBody);
    return NextResponse.json({ success: false, error: 'Erreur vÃ©rification OTP', details: errBody }, { status: 502 });
  }

  const checkRows: any[] = await checkRes.json();
  console.log('[create-agency-premium] â‘  checkRows:', checkRows);

  if (!checkRows || checkRows.length === 0) {
    return NextResponse.json({ success: false, error: 'OTP non vÃ©rifiÃ© pour cet email.' }, { status: 403 });
  }
  const prospectId = checkRows[0].id;
  const lockedAgencyName = (checkRows[0].company_name || agency_name || '').trim();
  const lockedSubdomain = slugify(lockedAgencyName);

  if (!lockedSubdomain) {
    return NextResponse.json({ success: false, error: 'Impossible de gÃ©nÃ©rer le sous-domaine.' }, { status: 400 });
  }

  console.log('[create-agency-premium] â‘¡ VÃ©rification doublon subdomain:', lockedSubdomain);

  // â‘¡ VÃ©rifie que le sous-domaine n'est pas dÃ©jÃ  pris
  const dupRes = await fetch(
    sb(`agency_settings?subdomain=eq.${encodeURIComponent(lockedSubdomain)}&select=id`),
    { headers: BASE_HEADERS },
  );

  if (!dupRes.ok) {
    const errBody = await dupRes.text();
    console.error('[create-agency-premium] â‘¡ Erreur lecture agency_settings:', dupRes.status, errBody);
    return NextResponse.json({ success: false, error: 'Erreur vÃ©rification subdomain', details: errBody }, { status: 502 });
  }

  const dupRows: any[] = await dupRes.json();

  if (dupRows && dupRows.length > 0) {
    return NextResponse.json({ success: false, error: 'Ce sous-domaine est dÃ©jÃ  utilisÃ©.' }, { status: 409 });
  }

  // â‘¢ Construit le footer_config avec trial de 15 jours
  const trialExpiresAt = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString();
  const footer_config = {
    allowed_langs:  default_lang ? [default_lang, 'en'].filter((v, i, a) => a.indexOf(v) === i) : ['en'],
    xml_urls:       [],
    client_email:   email.trim().toLowerCase(),
    socials:        { facebook: facebook || '', whatsapp: whatsapp || '' },
    integrations:   {
      crm_enabled: false,
      leads_enabled: true,
      property_manager_enabled: true,
      chatbot_enabled: true,
      chatbot_daily_limit: 20,
      hero_video_enabled: false,
    },
    subscription:   {
      website_active: false,
      blur_listings: true,
      plan: 'trial',
      trial_expires_at: trialExpiresAt,
    },
  };

  const insertPayload = {
    agency_name:      lockedAgencyName,
    email:            email.trim().toLowerCase(),
    subdomain:        lockedSubdomain,
    primary_color:    primary_color || '#e5992e',
    button_color:     primary_color || '#e5992e',
    button_style:     'rounded-full',
    button_animation: 'none',
    hero_type:        'image',
    hero_title:       hero_title || '',
    hero_url:         hero_url || null,
    logo_url:         logo_url || logo || null,
    whatsapp_number:  whatsapp || null,
    default_lang:     default_lang || 'en',
    package_level:    (['silver', 'gold', 'platinum'].includes(package_level) ? package_level : 'silver'),
    footer_config,
    website_status:   'pending',
    trial_expires_at: trialExpiresAt,
    team_data:        [],
    created_at:       new Date().toISOString(),
    updated_at:       new Date().toISOString(),
  };

  console.log('[create-agency-premium] â‘£ INSERT agency_settings:', insertPayload);

  // â‘£ CrÃ©e l'agence dans agency_settings
  let insertRes = await fetch(
    sb('agency_settings'),
    {
      method:  'POST',
      headers: { ...BASE_HEADERS, Prefer: 'return=representation' },
      body: JSON.stringify(insertPayload),
    },
  );

  if (insertRes.status >= 400) {
    const errBody = await insertRes.text();
    if (errBody.toLowerCase().includes('email')) {
      console.warn('[create-agency-premium] email column rejected, retrying with footer_config.client_email fallback');
      const { email: _email, ...payloadWithoutEmail } = insertPayload;
      insertRes = await fetch(
        sb('agency_settings'),
        {
          method:  'POST',
          headers: { ...BASE_HEADERS, Prefer: 'return=representation' },
          body: JSON.stringify(payloadWithoutEmail),
        },
      );
    } else {
      console.error('[create-agency-premium] Ã¢â€˜Â£ INSERT agency_settings FAILED:', insertRes.status, errBody);
      return NextResponse.json({
        success: false,
        error:   errBody,
        details: { status: insertRes.status, payload_keys: Object.keys(insertPayload) },
      }, { status: 502 });
    }
  }

  if (insertRes.status >= 400) {
    const errBody = await insertRes.text();
    console.error('[create-agency-premium] â‘£ INSERT agency_settings FAILED:', insertRes.status, errBody);
    return NextResponse.json({
      success: false,
      error:   errBody,
      details: { status: insertRes.status, payload_keys: Object.keys(insertPayload) },
    }, { status: 502 });
  }

  const [newAgency] = await insertRes.json();
  console.log('[create-agency-premium] â‘£ INSERT success:', newAgency?.id, newAgency?.subdomain);

  // â‘¤ Marque le prospect comme actif
  const patchRes = await fetch(
    sb(`register_premium?id=eq.${prospectId}`),
    {
      method:  'PATCH',
      headers: { ...BASE_HEADERS, Prefer: 'return=minimal' },
      body:    JSON.stringify({ status: 'active' }),
    },
  );
  if (!patchRes.ok) {
    console.error('[create-agency-premium] â‘¤ PATCH register_premium failed (non bloquant):', await patchRes.text());
  }

  return NextResponse.json({
    success:   true,
    subdomain: newAgency?.subdomain || lockedSubdomain,
    agency_id: newAgency?.id,
  }, { status: 201 });
}

