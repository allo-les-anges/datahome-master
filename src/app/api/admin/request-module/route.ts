import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const RESEND_KEY = process.env.RESEND_KEY || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@data-home.app';
const INTERNAL_RECIPIENTS = ['gillian@habihub-soft.com', 'gaetan@amaru-homes.com'];
const MODULE_CATALOG: Record<string, { name: string; price: string }> = {
  chatbot: { name: 'Chatbot IA', price: '39 EUR / mois' },
  mini_crm: { name: 'Mini CRM Leads', price: 'Gratuit' },
  'mini-crm': { name: 'Mini CRM Leads', price: 'Gratuit' },
  languages: { name: 'Langues supplementaires', price: '2 EUR / langue / mois' },
  seo: { name: 'Module SEO', price: '19 EUR / mois' },
  'hero-video': { name: 'Video hero', price: '9 EUR / mois' },
  whatsapp: { name: 'WhatsApp Business', price: '19 EUR / mois' },
  property_manager: { name: 'Property Manager', price: '29 EUR / mois' },
  crm_sync: { name: 'CRM Zoho / HubSpot', price: '39 EUR / mois' },
  'plan-silver': { name: 'Plan Silver', price: '50 EUR / mois' },
  'plan-gold': { name: 'Plan Gold', price: '129 EUR / mois' },
  'plan-platinum': { name: 'Plan Platinum', price: '179 EUR / mois' },
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

function escapeHtml(value: unknown) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      agencyId,
      moduleId,
      locale,
    } = body || {};

    if (!agencyId || !moduleId) {
      return NextResponse.json(
        { success: false, error: 'agencyId et moduleId sont requis' },
        { status: 400 },
      );
    }

    const moduleConfig = MODULE_CATALOG[String(moduleId)];
    if (!moduleConfig) {
      return NextResponse.json({ success: false, error: 'Module inconnu' }, { status: 400 });
    }

    const { data: agency, error: agencyError } = await supabase
      .from('agency_settings')
      .select('id, agency_name, email, footer_config')
      .eq('id', agencyId)
      .maybeSingle();

    if (agencyError || !agency) {
      return NextResponse.json({ success: false, error: 'Agence introuvable' }, { status: 404 });
    }

    const footerConfig = typeof agency.footer_config === 'string'
      ? (() => { try { return JSON.parse(agency.footer_config); } catch { return {}; } })()
      : (agency.footer_config || {});
    const agencyName = agency.agency_name || String(agencyId);
    const agencyEmail = agency.email || footerConfig.client_email || footerConfig.contact_email || footerConfig.email || null;
    const moduleName = moduleConfig.name;
    const modulePrice = moduleConfig.price;

    const insertPayload = {
      agency_id: agencyId,
      agency_name: agencyName || null,
      agency_email: agencyEmail || null,
      module_id: moduleId,
      module_name: moduleName,
      module_price: modulePrice || null,
      status: 'pending',
      metadata: { locale: locale || null },
    };

    const { data: requestRow, error } = await supabase
      .from('module_purchase_requests')
      .insert(insertPayload)
      .select()
      .single();

    if (error) throw error;

    let warning: string | null = null;

    if (RESEND_KEY) {
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: `DATAhome <${FROM_EMAIL}>`,
          to: INTERNAL_RECIPIENTS,
          subject: `Module request - ${moduleName} - ${agencyName || agencyId}`,
          html: `
            <h2>New module purchase request</h2>
            <p><strong>Agency:</strong> ${escapeHtml(agencyName || agencyId)}</p>
            <p><strong>Client email:</strong> ${escapeHtml(agencyEmail || 'Not provided')}</p>
            <p><strong>Module:</strong> ${escapeHtml(moduleName)}</p>
            <p><strong>Price:</strong> ${escapeHtml(modulePrice || 'Not provided')}</p>
            <p><strong>Status:</strong> pending</p>
            <hr/>
            <p>The client has requested this module from their client dashboard. Send the payment link or invoice, then activate the module manually in AgencyDashboard once payment is confirmed.</p>
          `,
        }),
      });

      if (!resendRes.ok) {
        warning = await resendRes.text();
        console.error('[request-module] Resend warning:', warning);
      }
    } else {
      warning = 'RESEND_KEY is not configured';
    }

    return NextResponse.json({ success: true, request: requestRow, warning });
  } catch (err: any) {
    console.error('[request-module]', err);
    return NextResponse.json({ success: false, error: err.message || 'Erreur serveur' }, { status: 500 });
  }
}
