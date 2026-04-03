import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await request.json();
    const { id } = await params;

    // AJOUTER team_data DANS LA MISE À JOUR
    const { error } = await supabase
      .from('agency_settings')
      .update({
        agency_name: body.agency_name,
        subdomain: body.subdomain,
        logo_url: body.logo_url,
        primary_color: body.primary_color,
        hero_title: body.hero_title,
        hero_url: body.hero_url,
        hero_type: body.hero_type,
        package_level: body.package_level,
        footer_config: body.footer_config,
        modules_active: body.modules_active,
        font_family: body.font_family,
        about_title: body.about_title,      // ← AJOUTER
        about_text: body.about_text,        // ← AJOUTER
        button_color: body.button_color,    // ← AJOUTER
        default_lang: body.default_lang,    // ← AJOUTER
        cookie_consent_enabled: body.cookie_consent_enabled, // ← AJOUTER
        privacy_policy: body.privacy_policy, // ← AJOUTER
        whatsapp_number: body.whatsapp_number, // ← AJOUTER
        team_data: body.team_data,          // ← CRUCIAL - AJOUTER team_data
      })
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ message: "Succès" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { error } = await supabase
      .from('agency_settings')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ message: "Agence supprimée" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}