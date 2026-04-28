import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const ALLOWED_FIELDS = [
  'agency_name', 'primary_color', 'button_color', 'button_style', 'button_animation',
  'font_family', 'logo_url', 'hero_title', 'hero_type', 'hero_url',
  'about_title', 'about_text', 'cookie_consent_enabled', 'privacy_policy',
  'team_data', 'footer_config', 'updated_at',
];

export async function POST(request: Request) {
  try {
    const { slug, agencyId, data } = await request.json();

    if (!slug || !agencyId || !data) {
      return NextResponse.json({ success: false, error: 'Paramètres manquants' }, { status: 400 });
    }

    // Verify agencyId matches slug
    const { data: agency, error: lookupError } = await supabase
      .from('agency_settings')
      .select('id')
      .eq('subdomain', slug)
      .eq('id', agencyId)
      .maybeSingle();

    if (lookupError || !agency) {
      return NextResponse.json({ success: false, error: 'Agence introuvable' }, { status: 404 });
    }

    const safeData: Record<string, any> = {};
    for (const field of ALLOWED_FIELDS) {
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
