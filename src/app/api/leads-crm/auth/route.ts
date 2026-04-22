import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, slug, password } = body;

    if (!action || !slug || !password) {
      return NextResponse.json({ success: false, error: 'Paramètres manquants' }, { status: 400 });
    }

    const { data: agency, error: agencyError } = await supabase
      .from('agency_settings')
      .select('id, leads_password, footer_config')
      .eq('subdomain', slug)
      .maybeSingle();

    if (agencyError || !agency) {
      return NextResponse.json({ success: false, error: 'Agence introuvable' }, { status: 404 });
    }

    const leadsEnabled = !!agency.footer_config?.integrations?.leads_enabled;
    if (!leadsEnabled) {
      return NextResponse.json({ success: false, error: 'Module non activé' }, { status: 403 });
    }

    if (action === 'set-password') {
      if (agency.leads_password) {
        return NextResponse.json({ success: false, error: 'Mot de passe déjà défini' }, { status: 409 });
      }
      if (password.length < 8) {
        return NextResponse.json({ success: false, error: 'Minimum 8 caractères' }, { status: 400 });
      }
      const hash = await bcrypt.hash(password, 10);
      const { error } = await supabase
        .from('agency_settings')
        .update({ leads_password: hash })
        .eq('id', agency.id);
      if (error) throw error;
      return NextResponse.json({ success: true, agencyId: agency.id });
    }

    if (action === 'login') {
      if (!agency.leads_password) {
        return NextResponse.json({ success: false, error: 'Aucun mot de passe défini' }, { status: 400 });
      }
      const valid = await bcrypt.compare(password, agency.leads_password);
      if (!valid) {
        return NextResponse.json({ success: false, error: 'Mot de passe incorrect' }, { status: 401 });
      }
      return NextResponse.json({ success: true, agencyId: agency.id });
    }

    if (action === 'change-password') {
      const { currentPassword, newPassword } = body;
      if (!agency.leads_password) {
        return NextResponse.json({ success: false, error: 'Aucun mot de passe défini' }, { status: 400 });
      }
      const valid = await bcrypt.compare(currentPassword, agency.leads_password);
      if (!valid) {
        return NextResponse.json({ success: false, error: 'Mot de passe actuel incorrect' }, { status: 401 });
      }
      if (!newPassword || newPassword.length < 8) {
        return NextResponse.json({ success: false, error: 'Minimum 8 caractères' }, { status: 400 });
      }
      const hash = await bcrypt.hash(newPassword, 10);
      const { error } = await supabase
        .from('agency_settings')
        .update({ leads_password: hash })
        .eq('id', agency.id);
      if (error) throw error;
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ success: false, error: 'Action inconnue' }, { status: 400 });
  } catch (err: any) {
    console.error('[Leads CRM Auth]', err);
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 });
  }
}
