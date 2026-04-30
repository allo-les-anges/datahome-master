import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

const RESEND_KEY  = process.env.RESEND_KEY  || 're_FF7fBpoX_3VCWrP4FkF5HvdCxLf5uRCR8';
const FROM_EMAIL  = process.env.FROM_EMAIL  || 'noreply@data-home.app';
const SITE_URL    = process.env.NEXT_PUBLIC_SITE_URL || 'https://datahome.vercel.app';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

// Charset sans caractères ambigus (0/O, 1/l/I)
function generateTempPassword(): string {
  const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789@#';
  let pwd = '';
  for (let i = 0; i < 12; i++) pwd += chars[Math.floor(Math.random() * chars.length)];
  return pwd;
}

type Lang = 'fr' | 'en' | 'nl' | 'es';
const SUPPORTED: Lang[] = ['fr', 'en', 'nl', 'es'];

type EmailParams = {
  firstName: string;
  companyName: string;
  agencyUrl: string;
  dashboardUrl: string;
  leadsUrl: string;
  email: string;
  tempPassword: string;
  trialExpiresAt: string;
  subdomain: string;
  packageLevel: string;
  lang: Lang;
};

const T: Record<Lang, Record<string, string | ((d: string) => string)>> = {
  fr: {
    subject:      'Votre espace Data-Home est prêt',
    welcome:      'Bienvenue',
    intro:        'Votre espace a été créé avec succès sur la plateforme <strong>Data-Home</strong>. Voici tout ce dont vous avez besoin pour démarrer.',
    creds_title:  'Vos identifiants de connexion',
    login_label:  'Identifiant (email)',
    pwd_label:    'Mot de passe provisoire',
    pwd_warn:     'Changez ce mot de passe dès votre première connexion.',
    cta:          '→ Accéder à mon espace',
    site_title:   'Votre site web',
    dash_title:   'Espace gestionnaire',
    leads_title:  'Espace leads CRM',
    trial:        (d: string) => `Votre période d'essai est active jusqu'au <strong>${d}</strong>. Profitez-en pour configurer votre espace et découvrir toutes les fonctionnalités.`,
    support:      'Pour toute question, contactez notre équipe à',
    footer:       '© Data-Home · Ne pas répondre à cet e-mail.',
  },
  en: {
    subject:      'Your Data-Home space is ready',
    welcome:      'Welcome',
    intro:        'Your space has been successfully created on the <strong>Data-Home</strong> platform. Here is everything you need to get started.',
    creds_title:  'Your login credentials',
    login_label:  'Login (email)',
    pwd_label:    'Temporary password',
    pwd_warn:     'Please change this password on your first login.',
    cta:          '→ Access my dashboard',
    site_title:   'Your website',
    dash_title:   'Manager dashboard',
    leads_title:  'Leads CRM',
    trial:        (d: string) => `Your trial period is active until <strong>${d}</strong>. Use this time to configure your space and explore all features.`,
    support:      'For any questions, contact our team at',
    footer:       '© Data-Home · Please do not reply to this e-mail.',
  },
  nl: {
    subject:      'Uw Data-Home ruimte is klaar',
    welcome:      'Welkom',
    intro:        'Uw ruimte is succesvol aangemaakt op het <strong>Data-Home</strong> platform. Hier vindt u alles wat u nodig heeft om te beginnen.',
    creds_title:  'Uw inloggegevens',
    login_label:  'Login (e-mail)',
    pwd_label:    'Tijdelijk wachtwoord',
    pwd_warn:     'Wijzig dit wachtwoord bij uw eerste aanmelding.',
    cta:          '→ Toegang tot mijn ruimte',
    site_title:   'Uw website',
    dash_title:   'Beheerdersruimte',
    leads_title:  'Leads CRM',
    trial:        (d: string) => `Uw proefperiode is actief tot <strong>${d}</strong>. Gebruik deze periode om uw ruimte te configureren.`,
    support:      'Voor vragen kunt u contact opnemen via',
    footer:       '© Data-Home · Beantwoord deze e-mail niet.',
  },
  es: {
    subject:      'Su espacio Data-Home está listo',
    welcome:      'Bienvenido/a',
    intro:        'Su espacio ha sido creado con éxito en la plataforma <strong>Data-Home</strong>. Aquí tiene todo lo que necesita para empezar.',
    creds_title:  'Sus credenciales de acceso',
    login_label:  'Identificador (email)',
    pwd_label:    'Contraseña provisional',
    pwd_warn:     'Cambie esta contraseña en su primer inicio de sesión.',
    cta:          '→ Acceder a mi espacio',
    site_title:   'Su sitio web',
    dash_title:   'Panel de gestión',
    leads_title:  'CRM de leads',
    trial:        (d: string) => `Su período de prueba está activo hasta el <strong>${d}</strong>. Aproveche este tiempo para configurar su espacio.`,
    support:      'Para cualquier pregunta, contacte con nuestro equipo en',
    footer:       '© Data-Home · No responda a este correo.',
  },
};

function buildEmail(p: EmailParams): { subject: string; html: string } {
  const t = T[p.lang];
  const trialDate = new Date(p.trialExpiresAt).toLocaleDateString(
    p.lang === 'fr' ? 'fr-FR' : p.lang === 'nl' ? 'nl-NL' : p.lang === 'es' ? 'es-ES' : 'en-GB',
    { day: '2-digit', month: 'long', year: 'numeric' },
  );
  const pkgLabel = p.packageLevel.charAt(0).toUpperCase() + p.packageLevel.slice(1);

  const subject = `${t.subject} — ${p.companyName}`;

  const html = `<!DOCTYPE html>
<html lang="${p.lang}">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:40px 0;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 32px rgba(0,0,0,.10);">

  <!-- HEADER -->
  <tr>
    <td style="background:linear-gradient(135deg,#0f172a 0%,#1e3a5f 100%);padding:36px 48px;text-align:center;">
      <div style="font-size:26px;font-weight:800;color:#fff;letter-spacing:1px;">DATA-HOME</div>
      <div style="margin-top:10px;">
        <span style="display:inline-block;padding:4px 14px;background:#D4AF37;color:#0f172a;font-size:10px;font-weight:800;letter-spacing:2px;border-radius:20px;text-transform:uppercase;">${pkgLabel}</span>
      </div>
    </td>
  </tr>

  <!-- BODY -->
  <tr><td style="padding:40px 48px;">

    <!-- Greeting -->
    <p style="margin:0 0 6px;font-size:20px;font-weight:700;color:#0f172a;">${t.welcome}, ${p.firstName} 🎉</p>
    <p style="margin:0 0 28px;font-size:14px;color:#475569;line-height:1.8;">${t.intro}</p>

    <!-- Credentials -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:12px;">
      <tr><td style="padding:20px 24px 8px;">
        <p style="margin:0 0 14px;font-size:10px;font-weight:800;letter-spacing:3px;text-transform:uppercase;color:#64748b;">${t.creds_title}</p>
        <table width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:12px;color:#94a3b8;">${t.login_label}</td>
            <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;text-align:right;font-size:13px;font-weight:700;color:#0f172a;font-family:monospace;">${p.email}</td>
          </tr>
          <tr>
            <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:12px;color:#94a3b8;">${t.pwd_label}</td>
            <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;text-align:right;">
              <span style="font-size:18px;font-weight:800;color:#D4AF37;font-family:monospace;letter-spacing:3px;">${p.tempPassword}</span>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 0;font-size:12px;color:#94a3b8;">Site</td>
            <td style="padding:8px 0;text-align:right;font-size:12px;font-weight:600;color:#2563eb;font-family:monospace;">${p.subdomain}</td>
          </tr>
        </table>
        <p style="margin:12px 0 0;font-size:11px;color:#ef4444;font-weight:600;">⚠️ ${t.pwd_warn}</p>
      </td></tr>
    </table>

    <!-- CTA -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr><td align="center">
        <a href="${p.dashboardUrl}" target="_blank"
           style="display:inline-block;padding:16px 44px;background:#2563eb;color:#fff;font-size:14px;font-weight:700;text-decoration:none;border-radius:50px;letter-spacing:0.5px;">
          ${t.cta}
        </a>
      </td></tr>
    </table>

    <!-- Links grid -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr>
        <td width="33%" style="padding:0 4px 0 0;vertical-align:top;">
          <div style="background:#f0f7ff;border-radius:10px;padding:14px 16px;">
            <div style="font-size:10px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:#2563eb;margin-bottom:6px;">${t.site_title}</div>
            <a href="${p.agencyUrl}" style="font-size:12px;color:#0f172a;font-weight:600;text-decoration:none;word-break:break-all;">${p.agencyUrl}</a>
          </div>
        </td>
        <td width="33%" style="padding:0 4px;vertical-align:top;">
          <div style="background:#f0fdf4;border-radius:10px;padding:14px 16px;">
            <div style="font-size:10px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:#16a34a;margin-bottom:6px;">${t.dash_title}</div>
            <a href="${p.dashboardUrl}" style="font-size:12px;color:#0f172a;font-weight:600;text-decoration:none;word-break:break-all;">${p.dashboardUrl}</a>
          </div>
        </td>
        <td width="33%" style="padding:0 0 0 4px;vertical-align:top;">
          <div style="background:#fff7ed;border-radius:10px;padding:14px 16px;">
            <div style="font-size:10px;font-weight:800;letter-spacing:2px;text-transform:uppercase;color:#ea580c;margin-bottom:6px;">${t.leads_title}</div>
            <a href="${p.leadsUrl}" style="font-size:12px;color:#0f172a;font-weight:600;text-decoration:none;word-break:break-all;">${p.leadsUrl}</a>
          </div>
        </td>
      </tr>
    </table>

    <!-- Trial info -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
      <tr><td style="background:#fefce8;border:1px solid #fde68a;border-radius:10px;padding:16px 20px;">
        <p style="margin:0;font-size:13px;color:#92400e;line-height:1.7;">⏳ ${(t.trial as (d: string) => string)(trialDate)}</p>
      </td></tr>
    </table>

    <!-- Support -->
    <p style="margin:0;font-size:13px;color:#94a3b8;line-height:1.7;">
      ${t.support} <a href="mailto:support@data-home.app" style="color:#2563eb;font-weight:600;">support@data-home.app</a>
    </p>

  </td></tr>

  <!-- FOOTER -->
  <tr>
    <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:20px 48px;text-align:center;">
      <p style="margin:0;font-size:11px;color:#94a3b8;line-height:1.6;">${t.footer}</p>
    </td>
  </tr>

</table>
</td></tr>
</table>
</body>
</html>`;

  return { subject, html };
}

export async function POST(req: NextRequest) {
  let body: Record<string, string>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Body JSON invalide' }, { status: 400 });
  }

  const {
    agency_id, email, first_name, company_name,
    subdomain, default_lang, trial_expires_at, package_level,
  } = body;

  if (!agency_id || !email || !subdomain) {
    return NextResponse.json({ success: false, error: 'agency_id, email et subdomain sont requis' }, { status: 400 });
  }

  const tempPassword  = generateTempPassword();
  const hashedPwd     = await bcrypt.hash(tempPassword, 10);

  // Pré-renseigner les mots de passe des modules pour la première connexion
  const { error: updateErr } = await supabase
    .from('agency_settings')
    .update({
      property_manager_password: hashedPwd,
      leads_password:            hashedPwd,
      updated_at:                new Date().toISOString(),
    })
    .eq('id', agency_id);

  if (updateErr) {
    console.error('[send-welcome-email] password update:', updateErr.message);
    return NextResponse.json({ success: false, error: updateErr.message }, { status: 500 });
  }

  const lang: Lang = SUPPORTED.includes(default_lang as Lang) ? (default_lang as Lang) : 'fr';
  const agencyUrl   = `${SITE_URL}/${lang}/${subdomain}`;
  const dashUrl     = `${SITE_URL}/${lang}/${subdomain}/mon-espace`;
  const leadsUrl    = `${SITE_URL}/${lang}/${subdomain}/mes-leads`;
  const trialTs     = trial_expires_at || new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString();

  const { subject, html } = buildEmail({
    firstName:      first_name  || email,
    companyName:    company_name || subdomain,
    agencyUrl,
    dashboardUrl:   dashUrl,
    leadsUrl,
    email,
    tempPassword,
    trialExpiresAt: trialTs,
    subdomain,
    packageLevel:   package_level || 'silver',
    lang,
  });

  const resendRes = await fetch('https://api.resend.com/emails', {
    method:  'POST',
    headers: {
      Authorization:  `Bearer ${RESEND_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM_EMAIL, to: [email], subject, html }),
  });

  if (!resendRes.ok) {
    const err = await resendRes.text();
    console.error('[send-welcome-email] Resend:', err);
    return NextResponse.json({ success: false, error: `Resend: ${err}` }, { status: 502 });
  }

  console.log(`[send-welcome-email] ✅ Email envoyé à ${email} pour l'agence ${subdomain}`);
  return NextResponse.json({ success: true });
}
