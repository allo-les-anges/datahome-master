import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const RESEND_KEY = process.env.RESEND_KEY || process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@data-home.app';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://datahome.vercel.app';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

type Lang = 'fr' | 'en' | 'nl' | 'es';
const SUPPORTED: Lang[] = ['fr', 'en', 'nl', 'es'];

const T: Record<Lang, {
  subject: string;
  title: string;
  intro: string;
  cta: string;
  expires: (date: string) => string;
  keep: string;
  contact: string;
  footer: string;
}> = {
  fr: {
    subject: 'Votre essai Data-Home se termine bientôt',
    title: 'Votre période d’essai arrive à son terme',
    intro: 'Votre site Data-Home est en ligne et votre période d’essai Premium touche bientôt à sa fin.',
    cta: 'Choisir mon abonnement',
    expires: (date) => `Votre essai se termine le <strong>${date}</strong>.`,
    keep: 'Pour conserver votre site, vos leads, le chatbot et votre espace gestionnaire, choisissez votre abonnement avant la fin de l’essai.',
    contact: 'Besoin d’aide ? Répondez à cet e-mail ou contactez notre équipe.',
    footer: 'Data-Home · Rappel automatique de fin d’essai.',
  },
  en: {
    subject: 'Your Data-Home trial ends soon',
    title: 'Your trial period is almost over',
    intro: 'Your Data-Home website is live and your Premium trial is coming to an end soon.',
    cta: 'Choose my subscription',
    expires: (date) => `Your trial ends on <strong>${date}</strong>.`,
    keep: 'To keep your website, leads, chatbot and manager dashboard active, choose your subscription before the trial ends.',
    contact: 'Need help? Reply to this email or contact our team.',
    footer: 'Data-Home · Automatic trial reminder.',
  },
  nl: {
    subject: 'Uw Data-Home proefperiode eindigt binnenkort',
    title: 'Uw proefperiode loopt bijna af',
    intro: 'Uw Data-Home website staat online en uw Premium proefperiode eindigt binnenkort.',
    cta: 'Mijn abonnement kiezen',
    expires: (date) => `Uw proefperiode eindigt op <strong>${date}</strong>.`,
    keep: 'Kies uw abonnement voor het einde van de proefperiode om uw website, leads, chatbot en beheerdersruimte actief te houden.',
    contact: 'Hulp nodig? Beantwoord deze e-mail of neem contact op met ons team.',
    footer: 'Data-Home · Automatische proefperiodeherinnering.',
  },
  es: {
    subject: 'Su prueba de Data-Home termina pronto',
    title: 'Su período de prueba está a punto de terminar',
    intro: 'Su sitio Data-Home está en línea y su prueba Premium terminará pronto.',
    cta: 'Elegir mi suscripción',
    expires: (date) => `Su prueba termina el <strong>${date}</strong>.`,
    keep: 'Para mantener activo su sitio, sus leads, el chatbot y el panel de gestión, elija su suscripción antes de que finalice la prueba.',
    contact: '¿Necesita ayuda? Responda a este correo o contacte con nuestro equipo.',
    footer: 'Data-Home · Recordatorio automático de fin de prueba.',
  },
};

function parseFooterConfig(value: any) {
  if (!value) return {};
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch {
      return {};
    }
  }
  return value;
}

function resolveClientEmail(agency: any, footerConfig: any) {
  return agency.email || footerConfig.client_email || footerConfig.contact_email || footerConfig.email || null;
}

function resolveTrialExpiresAt(agency: any, footerConfig: any) {
  return agency.trial_expires_at || footerConfig?.subscription?.trial_expires_at || null;
}

function formatDate(value: string, lang: Lang) {
  const locale = lang === 'fr' ? 'fr-FR' : lang === 'nl' ? 'nl-NL' : lang === 'es' ? 'es-ES' : 'en-GB';
  return new Date(value).toLocaleDateString(locale, { day: '2-digit', month: 'long', year: 'numeric' });
}

function buildEmail(agency: any, email: string, lang: Lang, trialExpiresAt: string) {
  const t = T[lang];
  const siteUrl = `${SITE_URL}/${lang}/${agency.subdomain}`;
  const dashboardUrl = `${siteUrl}/mon-espace`;
  const subscriptionUrl = dashboardUrl;
  const subject = `${t.subject} - ${agency.agency_name}`;
  const trialDate = formatDate(trialExpiresAt, lang);

  const html = `<!DOCTYPE html>
<html lang="${lang}">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 32px rgba(15,23,42,.12);">
  <tr>
    <td style="background:#0f172a;padding:34px 44px;text-align:center;">
      <div style="font-size:26px;font-weight:800;color:#fff;letter-spacing:1px;">DATA-HOME</div>
      <div style="margin-top:10px;color:#cbd5e1;font-size:13px;">${agency.agency_name}</div>
    </td>
  </tr>
  <tr>
    <td style="padding:40px 48px;color:#0f172a;">
      <p style="margin:0 0 12px;font-size:22px;font-weight:800;">${t.title}</p>
      <p style="margin:0 0 20px;font-size:15px;color:#475569;line-height:1.8;">${t.intro}</p>
      <div style="margin:0 0 26px;background:#fefce8;border:1px solid #fde68a;border-radius:12px;padding:18px 20px;color:#92400e;font-size:14px;line-height:1.7;">
        ${t.expires(trialDate)}
      </div>
      <p style="margin:0 0 28px;font-size:15px;color:#475569;line-height:1.8;">${t.keep}</p>
      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
        <tr><td align="center">
          <a href="${subscriptionUrl}" target="_blank" style="display:inline-block;padding:16px 42px;background:#2563eb;color:#fff;font-size:14px;font-weight:800;text-decoration:none;border-radius:999px;">
            ${t.cta}
          </a>
        </td></tr>
      </table>
      <p style="margin:0 0 8px;font-size:13px;color:#64748b;line-height:1.7;">${t.contact}</p>
      <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.7;">
        ${email}<br/>
        <a href="${siteUrl}" style="color:#2563eb;text-decoration:none;">${siteUrl}</a>
      </p>
    </td>
  </tr>
  <tr>
    <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 48px;text-align:center;">
      <p style="margin:0;font-size:11px;color:#94a3b8;">${t.footer}</p>
    </td>
  </tr>
</table>
</td></tr>
</table>
</body>
</html>`;

  return { subject, html };
}

async function sendTrialReminder(agency: any, email: string, lang: Lang, trialExpiresAt: string) {
  const { subject, html } = buildEmail(agency, email, lang, trialExpiresAt);
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM_EMAIL, to: [email], subject, html }),
  });

  if (!res.ok) {
    throw new Error(await res.text());
  }
}

function isAuthorizedCron(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  const auth = request.headers.get('authorization') || '';
  const headerSecret = request.headers.get('x-cron-secret') || '';
  return auth === `Bearer ${secret}` || headerSecret === secret;
}

export async function GET(request: Request) {
  if (!isAuthorizedCron(request)) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  if (!RESEND_KEY) {
    return NextResponse.json({ success: false, error: 'RESEND_KEY manquant' }, { status: 500 });
  }

  const now = new Date();
  const threshold = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  const { data: agencies, error } = await supabase
    .from('agency_settings')
    .select('id, agency_name, subdomain, default_lang, footer_config, trial_expires_at, trial_reminder_sent_at, website_status')
    .is('trial_reminder_sent_at', null)
    .in('website_status', ['active', 'pending']);

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  const results = [];

  for (const agency of agencies || []) {
    const footerConfig = parseFooterConfig(agency.footer_config);
    const subscription = footerConfig.subscription || {};
    const trialExpiresAt = resolveTrialExpiresAt(agency, footerConfig);
    const plan = subscription.plan || 'trial';
    const clientEmail = resolveClientEmail(agency, footerConfig);
    const expiresAt = trialExpiresAt ? new Date(trialExpiresAt) : null;

    if (!clientEmail || !expiresAt || Number.isNaN(expiresAt.getTime())) continue;
    if (plan !== 'trial') continue;
    if (expiresAt <= now || expiresAt > threshold) continue;

    const langCandidate = agency.default_lang || footerConfig.allowed_langs?.[0] || 'fr';
    const lang: Lang = SUPPORTED.includes(langCandidate as Lang) ? (langCandidate as Lang) : 'fr';

    try {
      await sendTrialReminder(agency, clientEmail, lang, trialExpiresAt);
      const { error: updateError } = await supabase
        .from('agency_settings')
        .update({ trial_reminder_sent_at: new Date().toISOString(), updated_at: new Date().toISOString() })
        .eq('id', agency.id);

      if (updateError) throw updateError;
      results.push({ agencyId: agency.id, email: clientEmail, success: true });
    } catch (err: any) {
      results.push({ agencyId: agency.id, email: clientEmail, success: false, error: err.message || 'Erreur inconnue' });
    }
  }

  const failed = results.filter((result) => !result.success).length;

  return NextResponse.json({
    success: failed === 0,
    checked: agencies?.length || 0,
    sent: results.filter((result) => result.success).length,
    failed,
    results,
  }, { status: failed === 0 ? 200 : 207 });
}
