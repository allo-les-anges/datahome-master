import { NextRequest, NextResponse } from 'next/server';

// ─── Config ───────────────────────────────────────────────────────────────────
const SUPABASE_ENDPOINT =
  process.env.SUPABASE_ENDPOINT ||
  'https://idoosovuatkqfrkuyiie.supabase.co/rest/v1/register_premium';

const SUPABASE_KEY =
  process.env.SUPABASE_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlkb29zb3Z1YXRrcWZya3V5aWllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3MTEwMDgsImV4cCI6MjA4NzI4NzAwOH0.JJKPOFgVdNgoweD4B4cIo28Ip3aGRvh-0czsgvY0AuM';

const RESEND_KEY =
  process.env.RESEND_KEY ||
  process.env.RESEND_API_KEY ||
  're_FF7fBpoX_3VCWrP4FkF5HvdCxLf5uRCR8';

const FROM_EMAIL = process.env.FROM_EMAIL || process.env.RESEND_FROM_EMAIL || 'noreply@data-home.app';
const SITE_URL   = process.env.NEXT_PUBLIC_SITE_URL || 'https://datahome.vercel.app';

const SUPPORTED_LANGS = ['fr','en','nl','es','pl','ru','no','da','de'] as const;
type Lang = typeof SUPPORTED_LANGS[number];

const rateLimitStore = new Map<string, { count: number; resetAt: number }>();
const REGISTER_IP_LIMIT = { max: 3, windowMs: 60 * 60 * 1000 };
const REGISTER_EMAIL_LIMIT = { max: 2, windowMs: 60 * 60 * 1000 };
const ONBOARDING_RATE_LIMIT_ENABLED = process.env.ONBOARDING_RATE_LIMIT_ENABLED === 'true';

// ─── Helpers ──────────────────────────────────────────────────────────────────
function generateOtp(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function otpExpiresAt(): string {
  const d = new Date();
  d.setMinutes(d.getMinutes() + 15);
  return d.toISOString();
}

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    req.headers.get('cf-connecting-ip') ||
    'unknown'
  );
}

function checkRateLimit(key: string, max: number, windowMs: number) {
  const now = Date.now();
  const current = rateLimitStore.get(key);

  if (!current || now > current.resetAt) {
    rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, retryAfter: 0 };
  }

  if (current.count >= max) {
    return { allowed: false, retryAfter: Math.ceil((current.resetAt - now) / 1000) };
  }

  current.count += 1;
  rateLimitStore.set(key, current);
  return { allowed: true, retryAfter: 0 };
}

function rateLimitedResponse(retryAfter: number) {
  return NextResponse.json(
    { success: false, error: 'Trop de demandes. Réessayez plus tard.' },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } },
  );
}

// ─── Email templates ──────────────────────────────────────────────────────────
function baseHtml(p: {
  otp: string; greeting: string; intro: string;
  label: string; note: string; cta: string; footer: string;
  btn_label: string; link: string;
}): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">
        <tr>
          <td style="background:#0f172a;padding:32px 40px;text-align:center;">
            <span style="color:#ffffff;font-size:22px;font-weight:700;letter-spacing:1px;">DATA-HOME</span>
            <span style="display:inline-block;margin-left:10px;padding:3px 10px;background:#2563eb;color:#fff;font-size:10px;font-weight:800;letter-spacing:2px;border-radius:20px;text-transform:uppercase;">Premium</span>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 48px;">
            <p style="margin:0 0 12px;font-size:16px;color:#1e293b;font-weight:500;">${p.greeting}</p>
            <p style="margin:0 0 28px;font-size:14px;color:#475569;line-height:1.7;">${p.intro}</p>
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="padding:10px 0 32px;">
                  <div style="display:inline-block;background:#f0f7ff;border:2px dashed #2563eb;border-radius:12px;padding:20px 48px;text-align:center;">
                    <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#2563eb;">${p.label}</p>
                    <p style="margin:0;font-size:42px;font-weight:800;letter-spacing:10px;color:#0f172a;">${p.otp}</p>
                  </div>
                </td>
              </tr>
            </table>
            <p style="margin:0 0 28px;font-size:13px;color:#94a3b8;text-align:center;">${p.note}</p>

            <!-- CTA BUTTON -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="padding:0 0 32px;">
                  <a href="${p.link}" target="_blank" style="display:inline-block;padding:16px 40px;background:#2563eb;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;border-radius:50px;letter-spacing:0.5px;">${p.btn_label}</a>
                </td>
              </tr>
            </table>

            <p style="margin:0;font-size:14px;color:#475569;line-height:1.7;">${p.cta}</p>
          </td>
        </tr>
        <tr>
          <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:24px 48px;text-align:center;">
            <p style="margin:0;font-size:11px;color:#94a3b8;line-height:1.6;">${p.footer}</p>
          </td>
        </tr>
      </table>
    </td></table>
  </table>
</body>
</html>`;
}

type Template = { subject: string; html: string };

const TEMPLATES: Record<Lang, (otp: string, prenom: string, link: string) => Template> = {
  fr: (otp, p, link) => ({ subject: 'Votre code de validation Premium — Data-Home', html: baseHtml({ otp, link, btn_label: '→ Compléter mon inscription', greeting: `Bonjour ${p},`, intro: `Merci pour votre inscription à l'offre <strong>Premium</strong> de Data-Home. Cliquez sur le bouton ci-dessous pour finaliser votre inscription avec votre code de validation.`, label: 'Votre code de validation', note: '⏱ Ce code expire dans 15 minutes.', cta: `Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail en toute sécurité.`, footer: '© Data-Home · noreply@data-home.app · Ne pas répondre à cet e-mail.' }) }),
  en: (otp, p, link) => ({ subject: 'Your Premium Validation Code — Data-Home', html: baseHtml({ otp, link, btn_label: '→ Complete my registration', greeting: `Dear ${p},`, intro: `Thank you for registering for the <strong>Premium</strong> plan at Data-Home. Click the button below to complete your registration with your validation code.`, label: 'Your validation code', note: '⏱ This code expires in 15 minutes.', cta: `If you did not initiate this request, you can safely ignore this e-mail.`, footer: '© Data-Home · noreply@data-home.app · Please do not reply to this e-mail.' }) }),
  nl: (otp, p, link) => ({ subject: 'Uw Premium-validatiecode — Data-Home', html: baseHtml({ otp, link, btn_label: '→ Mijn registratie voltooien', greeting: `Beste ${p},`, intro: `Bedankt voor uw inschrijving voor het <strong>Premium</strong>-abonnement bij Data-Home. Klik op de knop hieronder om uw registratie te voltooien met uw validatiecode.`, label: 'Uw validatiecode', note: '⏱ Deze code verloopt over 15 minuten.', cta: `Als u dit verzoek niet heeft ingediend, kunt u deze e-mail veilig negeren.`, footer: '© Data-Home · noreply@data-home.app · Beantwoord deze e-mail niet.' }) }),
  es: (otp, p, link) => ({ subject: 'Su código de validación Premium — Data-Home', html: baseHtml({ otp, link, btn_label: '→ Completar mi registro', greeting: `Estimado/a ${p},`, intro: `Gracias por registrarse en el plan <strong>Premium</strong> de Data-Home. Haga clic en el botón de abajo para completar su registro con su código de validación.`, label: 'Su código de validación', note: '⏱ Este código expira en 15 minutos.', cta: `Si no realizó esta solicitud, puede ignorar este correo electrónico con total seguridad.`, footer: '© Data-Home · noreply@data-home.app · No responda a este correo.' }) }),
  pl: (otp, p, link) => ({ subject: 'Twój kod weryfikacyjny Premium — Data-Home', html: baseHtml({ otp, link, btn_label: '→ Dokończyć rejestrację', greeting: `Szanowny/a ${p},`, intro: `Dziękujemy za rejestrację w planie <strong>Premium</strong> Data-Home. Kliknij przycisk poniżej, aby dokończyć rejestrację z kodem weryfikacyjnym.`, label: 'Twój kod weryfikacyjny', note: '⏱ Kod wygaśnie za 15 minut.', cta: `Jeśli nie składałeś/aś tej prośby, możesz bezpiecznie zignorować tę wiadomość.`, footer: '© Data-Home · noreply@data-home.app · Prosimy nie odpowiadać na tę wiadomość.' }) }),
  ru: (otp, p, link) => ({ subject: 'Ваш код подтверждения Premium — Data-Home', html: baseHtml({ otp, link, btn_label: '→ Завершить регистрацию', greeting: `Уважаемый/ая ${p},`, intro: `Благодарим вас за регистрацию в тарифе <strong>Premium</strong> на платформе Data-Home. Нажмите кнопку ниже, чтобы завершить регистрацию с вашим кодом подтверждения.`, label: 'Ваш код подтверждения', note: '⏱ Код действителен в течение 15 минут.', cta: `Если вы не инициировали этот запрос, просто проигнорируйте данное письмо.`, footer: '© Data-Home · noreply@data-home.app · Пожалуйста, не отвечайте на это письмо.' }) }),
  no: (otp, p, link) => ({ subject: 'Din Premium-bekreftelseskode — Data-Home', html: baseHtml({ otp, link, btn_label: '→ Fullfør registreringen', greeting: `Kjære ${p},`, intro: `Takk for at du registrerte deg for <strong>Premium</strong>-planen hos Data-Home. Klikk på knappen nedenfor for å fullføre registreringen med bekreftelseskoden.`, label: 'Din bekreftelseskode', note: '⏱ Denne koden utløper om 15 minutter.', cta: `Hvis du ikke ba om dette, kan du trygt ignorere denne e-posten.`, footer: '© Data-Home · noreply@data-home.app · Ikke svar på denne e-posten.' }) }),
  da: (otp, p, link) => ({ subject: 'Din Premium-bekræftelseskode — Data-Home', html: baseHtml({ otp, link, btn_label: '→ Fuldfør min registrering', greeting: `Kære ${p},`, intro: `Tak fordi du tilmeldte dig <strong>Premium</strong>-planen hos Data-Home. Klik på knappen nedenfor for at fuldføre din registrering med din bekræftelseskode.`, label: 'Din bekræftelseskode', note: '⏱ Denne kode udløber om 15 minutter.', cta: `Hvis du ikke anmodede om dette, kan du roligt ignorere denne e-mail.`, footer: '© Data-Home · noreply@data-home.app · Besvar venligst ikke denne e-mail.' }) }),
  de: (otp, p, link) => ({ subject: 'Ihr Premium-Bestätigungscode — Data-Home', html: baseHtml({ otp, link, btn_label: '→ Meine Registrierung abschließen', greeting: `Sehr geehrte/r ${p},`, intro: `Vielen Dank für Ihre Registrierung beim <strong>Premium</strong>-Plan von Data-Home. Klicken Sie auf die Schaltfläche unten, um Ihre Registrierung mit Ihrem Bestätigungscode abzuschließen.`, label: 'Ihr Bestätigungscode', note: '⏱ Dieser Code läuft in 15 Minuten ab.', cta: `Falls Sie diese Anfrage nicht gestellt haben, können Sie diese E-Mail bedenkenlos ignorieren.`, footer: '© Data-Home · noreply@data-home.app · Bitte antworten Sie nicht auf diese E-Mail.' }) }),
};

// ─── Supabase insert ───────────────────────────────────────────────────────────
async function insertToSupabase(payload: object): Promise<void> {
  const res = await fetch(SUPABASE_ENDPOINT, {
    method: 'POST',
    headers: {
      apikey:          SUPABASE_KEY,
      Authorization:   `Bearer ${SUPABASE_KEY}`,
      'Content-Type':  'application/json',
      Prefer:          'return=minimal',
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase error ${res.status}: ${err}`);
  }
}

async function upsertPendingRegistration(email: string, payload: object): Promise<'created' | 'updated'> {
  const pendingRes = await fetch(
    `${SUPABASE_ENDPOINT}?email=eq.${encodeURIComponent(email)}&status=eq.pending&select=id&order=created_at.desc&limit=1`,
    {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    },
  );

  if (!pendingRes.ok) {
    const err = await pendingRes.text();
    throw new Error(`Supabase pending check error ${pendingRes.status}: ${err}`);
  }

  const pendingRows = await pendingRes.json();
  const pendingId = Array.isArray(pendingRows) ? pendingRows[0]?.id : null;

  if (!pendingId) {
    await insertToSupabase(payload);
    return 'created';
  }

  const patchRes = await fetch(`${SUPABASE_ENDPOINT}?id=eq.${encodeURIComponent(pendingId)}`, {
    method: 'PATCH',
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify(payload),
  });

  if (!patchRes.ok) {
    const err = await patchRes.text();
    throw new Error(`Supabase pending update error ${patchRes.status}: ${err}`);
  }

  return 'updated';
}

async function hasActivePremiumRegistration(email: string): Promise<boolean> {
  const res = await fetch(
    `${SUPABASE_ENDPOINT}?email=eq.${encodeURIComponent(email)}&status=in.(active,published)&select=id&limit=1`,
    {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    },
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Supabase check error ${res.status}: ${err}`);
  }

  const rows = await res.json();
  return Array.isArray(rows) && rows.length > 0;
}

// ─── Resend email ──────────────────────────────────────────────────────────────
async function sendEmail(
  to: string, lang: Lang, otp: string, prenom: string, company: string,
): Promise<void> {
  const onboardingLink =
    `${SITE_URL}/onboarding` +
    `?email=${encodeURIComponent(to)}` +
    `&name=${encodeURIComponent(prenom)}` +
    `&company=${encodeURIComponent(company)}` +
    `&lang=${lang}`;

  const { subject, html } = TEMPLATES[lang](otp, prenom, onboardingLink);
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization:  `Bearer ${RESEND_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM_EMAIL, to: [to], subject, html }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Resend error ${res.status}: ${err}`);
  }
}

// ─── Route handler ─────────────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ success: false, error: 'Body JSON invalide' }, { status: 400 });
  }

  const { prenom, nom, email, entreprise = null, telephone = null, preferred_language = 'en' } = body as Record<string, string>;
  const normalizedEmail = String(email || '').trim().toLowerCase();

  // Validation
  if (!prenom || !nom) {
    return NextResponse.json({ success: false, error: 'prenom et nom sont requis' }, { status: 400 });
  }
  if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
    return NextResponse.json({ success: false, error: 'Email invalide' }, { status: 400 });
  }

  if (ONBOARDING_RATE_LIMIT_ENABLED) {
    const ip = getClientIp(req);
    const ipLimit = checkRateLimit(`register:ip:${ip}`, REGISTER_IP_LIMIT.max, REGISTER_IP_LIMIT.windowMs);
    if (!ipLimit.allowed) return rateLimitedResponse(ipLimit.retryAfter);

    const emailLimit = checkRateLimit(`register:email:${normalizedEmail}`, REGISTER_EMAIL_LIMIT.max, REGISTER_EMAIL_LIMIT.windowMs);
    if (!emailLimit.allowed) return rateLimitedResponse(emailLimit.retryAfter);
  }

  const lang: Lang = SUPPORTED_LANGS.includes(preferred_language as Lang)
    ? (preferred_language as Lang)
    : 'en';

  const otp_code       = generateOtp();
  const otp_expires_at = otpExpiresAt();

  try {
    if (await hasActivePremiumRegistration(normalizedEmail)) {
      return NextResponse.json(
        { success: false, error: 'Un accès premium existe déjà pour cet email.' },
        { status: 409 },
      );
    }

    const saveMode = await upsertPendingRegistration(normalizedEmail, {
      first_name:         prenom,
      last_name:          nom,
      email:              normalizedEmail,
      company_name:       entreprise,
      phone_number:       telephone,
      otp_code,
      otp_expires_at,
      status:             'pending',
      preferred_language: lang,
    });

    await sendEmail(normalizedEmail, lang, otp_code, prenom, entreprise || '');
    console.log(`[register-premium] OTP email sent to ${normalizedEmail} (${saveMode})`);

    return NextResponse.json(
      { success: true, message: 'Inscription enregistrée. Code OTP envoyé par e-mail.' },
      { status: 201 },
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Erreur inconnue';
    console.error('[register-premium]', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
