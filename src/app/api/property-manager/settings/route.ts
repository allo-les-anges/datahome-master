import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { hasAdminOrPmAccess, isAdminRequest, unauthorized } from '@/lib/serverAuth';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ALLOWED_FIELDS = [
  'agency_name', 'subdomain', 'primary_color', 'button_color', 'button_style', 'button_animation',
  'font_family', 'logo_url', 'hero_title', 'hero_type', 'hero_url',
  'default_lang', 'whatsapp_number', 'habihub_agent_id',
  'custom_domain', 'custom_domain_status', 'custom_domain_verified_at',
  'custom_domain_verification', 'custom_domain_dns',
  'about_title', 'about_text', 'cookie_consent_enabled', 'privacy_policy',
  'team_data', 'footer_config', 'website_status', 'updated_at',
];

const CLIENT_ALLOWED_FIELDS = [
  'agency_name', 'primary_color', 'button_color', 'button_style', 'button_animation',
  'font_family', 'logo_url', 'hero_title', 'hero_type', 'hero_url',
  'custom_domain', 'custom_domain_status', 'custom_domain_verified_at',
  'custom_domain_verification', 'custom_domain_dns',
  'about_title', 'about_text', 'cookie_consent_enabled', 'privacy_policy',
  'team_data', 'footer_config', 'updated_at',
];

export async function POST(request: Request) {
  try {
    const { agencyId, data } = await request.json();

    if (agencyId && !hasAdminOrPmAccess(request, String(agencyId))) {
      return unauthorized();
    }

    if (!agencyId || !data) {
      return NextResponse.json({ success: false, error: 'Paramètres manquants' }, { status: 400 });
    }

    const { data: agency, error: lookupError } = await supabase
      .from('agency_settings')
      .select('id')
      .eq('id', agencyId)
      .maybeSingle();

    if (lookupError || !agency) {
      return NextResponse.json({ success: false, error: 'Agence introuvable' }, { status: 404 });
    }

    const allowedFields = isAdminRequest(request) ? ALLOWED_FIELDS : CLIENT_ALLOWED_FIELDS;
    const safeData: Record<string, any> = {};
    for (const field of allowedFields) {
      if (field in data) safeData[field] = data[field];
    }

    const { data: updated, error } = await supabase
      .from('agency_settings')
      .update(safeData)
      .eq('id', agencyId)
      .select()
      .maybeSingle();

    if (error) throw error;

    return NextResponse.json({ success: true, agency: updated });
  } catch (err: any) {
    console.error('[PM Settings]', err);
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}
