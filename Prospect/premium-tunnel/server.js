'use strict';

require('dotenv').config();
const express = require('express');
const axios   = require('axios');

// ─────────────────────────────────────────────
// CONFIG
// ─────────────────────────────────────────────
const SUPABASE_ENDPOINT = process.env.SUPABASE_ENDPOINT
  || 'https://idoosovuatkqfrkuyiie.supabase.co/rest/v1/register_premium';

const SUPABASE_KEY = process.env.SUPABASE_KEY
  || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imlkb29zb3Z1YXRrcWZya3V5aWllIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE3MTEwMDgsImV4cCI6MjA4NzI4NzAwOH0.JJKPOFgVdNgoweD4B4cIo28Ip3aGRvh-0czsgvY0AuM';

const RESEND_KEY = process.env.RESEND_KEY
  || 're_FF7fBpoX_3VCWrP4FkF5HvdCxLf5uRCR8';

const FROM_EMAIL  = process.env.FROM_EMAIL  || 'noreply@data-home.app';
const PORT        = process.env.PORT        || 3001;
const SUPPORTED_LANGS = ['fr','en','nl','es','pl','ru','no','da','de'];

// ─────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────
function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function otpExpiresAt() {
  const d = new Date();
  d.setMinutes(d.getMinutes() + 15);
  return d.toISOString();
}

// ─────────────────────────────────────────────
// EMAIL TEMPLATES  (9 langues)
// ─────────────────────────────────────────────
function baseHtml({ greeting, intro, label, note, cta, footer, otp }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <title>Data-Home Premium</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f9;padding:40px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08);">

        <!-- HEADER -->
        <tr>
          <td style="background:#0f172a;padding:32px 40px;text-align:center;">
            <span style="color:#ffffff;font-size:22px;font-weight:700;letter-spacing:1px;">DATA-HOME</span>
            <span style="display:inline-block;margin-left:10px;padding:3px 10px;background:#2563eb;color:#fff;font-size:10px;font-weight:800;letter-spacing:2px;border-radius:20px;text-transform:uppercase;">Premium</span>
          </td>
        </tr>

        <!-- BODY -->
        <tr>
          <td style="padding:40px 48px;">
            <p style="margin:0 0 12px;font-size:16px;color:#1e293b;font-weight:500;">${greeting}</p>
            <p style="margin:0 0 28px;font-size:14px;color:#475569;line-height:1.7;">${intro}</p>

            <!-- OTP BOX -->
            <table width="100%" cellpadding="0" cellspacing="0">
              <tr>
                <td align="center" style="padding:10px 0 32px;">
                  <div style="display:inline-block;background:#f0f7ff;border:2px dashed #2563eb;border-radius:12px;padding:20px 48px;text-align:center;">
                    <p style="margin:0 0 6px;font-size:11px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#2563eb;">${label}</p>
                    <p style="margin:0;font-size:42px;font-weight:800;letter-spacing:10px;color:#0f172a;font-variant-numeric:tabular-nums;">${otp}</p>
                  </div>
                </td>
              </tr>
            </table>

            <p style="margin:0 0 28px;font-size:13px;color:#94a3b8;text-align:center;">${note}</p>
            <p style="margin:0;font-size:14px;color:#475569;line-height:1.7;">${cta}</p>
          </td>
        </tr>

        <!-- FOOTER -->
        <tr>
          <td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:24px 48px;text-align:center;">
            <p style="margin:0;font-size:11px;color:#94a3b8;line-height:1.6;">${footer}</p>
          </td>
        </tr>

      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

const TEMPLATES = {

  fr: (otp, prenom) => ({
    subject: 'Votre code de validation Premium — Data-Home',
    html: baseHtml({
      otp,
      greeting:  `Bonjour ${prenom},`,
      intro:     `Merci pour votre inscription à l'offre <strong>Premium</strong> de Data-Home. Pour finaliser votre accès, veuillez utiliser le code de validation ci-dessous. Ce code est strictement personnel et confidentiel.`,
      label:     'Votre code de validation',
      note:      '⏱ Ce code expire dans 15 minutes.',
      cta:       `Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet e-mail en toute sécurité.`,
      footer:    '© Data-Home · noreply@data-home.app · Ne pas répondre à cet e-mail.',
    }),
  }),

  en: (otp, prenom) => ({
    subject: 'Your Premium Validation Code — Data-Home',
    html: baseHtml({
      otp,
      greeting:  `Dear ${prenom},`,
      intro:     `Thank you for registering for the <strong>Premium</strong> plan at Data-Home. To complete your access, please use the validation code below. This code is strictly personal and confidential.`,
      label:     'Your validation code',
      note:      '⏱ This code expires in 15 minutes.',
      cta:       `If you did not initiate this request, you can safely ignore this e-mail.`,
      footer:    '© Data-Home · noreply@data-home.app · Please do not reply to this e-mail.',
    }),
  }),

  nl: (otp, prenom) => ({
    subject: 'Uw Premium-validatiecode — Data-Home',
    html: baseHtml({
      otp,
      greeting:  `Beste ${prenom},`,
      intro:     `Bedankt voor uw inschrijving voor het <strong>Premium</strong>-abonnement bij Data-Home. Om uw toegang te voltooien, gebruikt u de onderstaande validatiecode. Deze code is strikt persoonlijk en vertrouwelijk.`,
      label:     'Uw validatiecode',
      note:      '⏱ Deze code verloopt over 15 minuten.',
      cta:       `Als u dit verzoek niet heeft ingediend, kunt u deze e-mail veilig negeren.`,
      footer:    '© Data-Home · noreply@data-home.app · Beantwoord deze e-mail niet.',
    }),
  }),

  es: (otp, prenom) => ({
    subject: 'Su código de validación Premium — Data-Home',
    html: baseHtml({
      otp,
      greeting:  `Estimado/a ${prenom},`,
      intro:     `Gracias por registrarse en el plan <strong>Premium</strong> de Data-Home. Para completar su acceso, utilice el código de validación que aparece a continuación. Este código es estrictamente personal y confidencial.`,
      label:     'Su código de validación',
      note:      '⏱ Este código expira en 15 minutos.',
      cta:       `Si no realizó esta solicitud, puede ignorar este correo electrónico con total seguridad.`,
      footer:    '© Data-Home · noreply@data-home.app · No responda a este correo.',
    }),
  }),

  pl: (otp, prenom) => ({
    subject: 'Twój kod weryfikacyjny Premium — Data-Home',
    html: baseHtml({
      otp,
      greeting:  `Szanowny/a ${prenom},`,
      intro:     `Dziękujemy za rejestrację w planie <strong>Premium</strong> Data-Home. Aby dokończyć aktywację konta, prosimy o użycie poniższego kodu weryfikacyjnego. Kod ten jest ściśle osobisty i poufny.`,
      label:     'Twój kod weryfikacyjny',
      note:      '⏱ Kod wygaśnie za 15 minut.',
      cta:       `Jeśli nie składałeś/aś tej prośby, możesz bezpiecznie zignorować tę wiadomość.`,
      footer:    '© Data-Home · noreply@data-home.app · Prosimy nie odpowiadać na tę wiadomość.',
    }),
  }),

  ru: (otp, prenom) => ({
    subject: 'Ваш код подтверждения Premium — Data-Home',
    html: baseHtml({
      otp,
      greeting:  `Уважаемый/ая ${prenom},`,
      intro:     `Благодарим вас за регистрацию в тарифе <strong>Premium</strong> на платформе Data-Home. Для завершения активации учётной записи, пожалуйста, воспользуйтесь приведённым ниже кодом подтверждения. Этот код является строго личным и конфиденциальным.`,
      label:     'Ваш код подтверждения',
      note:      '⏱ Код действителен в течение 15 минут.',
      cta:       `Если вы не инициировали этот запрос, просто проигнорируйте данное письмо.`,
      footer:    '© Data-Home · noreply@data-home.app · Пожалуйста, не отвечайте на это письмо.',
    }),
  }),

  no: (otp, prenom) => ({
    subject: 'Din Premium-bekreftelseskode — Data-Home',
    html: baseHtml({
      otp,
      greeting:  `Kjære ${prenom},`,
      intro:     `Takk for at du registrerte deg for <strong>Premium</strong>-planen hos Data-Home. For å fullføre tilgangen din, bruk bekreftelseskoden nedenfor. Denne koden er strengt personlig og konfidensiell.`,
      label:     'Din bekreftelseskode',
      note:      '⏱ Denne koden utløper om 15 minutter.',
      cta:       `Hvis du ikke ba om dette, kan du trygt ignorere denne e-posten.`,
      footer:    '© Data-Home · noreply@data-home.app · Ikke svar på denne e-posten.',
    }),
  }),

  da: (otp, prenom) => ({
    subject: 'Din Premium-bekræftelseskode — Data-Home',
    html: baseHtml({
      otp,
      greeting:  `Kære ${prenom},`,
      intro:     `Tak fordi du tilmeldte dig <strong>Premium</strong>-planen hos Data-Home. For at fuldføre din adgang skal du bruge bekræftelseskoden nedenfor. Denne kode er strengt personlig og fortrolig.`,
      label:     'Din bekræftelseskode',
      note:      '⏱ Denne kode udløber om 15 minutter.',
      cta:       `Hvis du ikke anmodede om dette, kan du roligt ignorere denne e-mail.`,
      footer:    '© Data-Home · noreply@data-home.app · Besvar venligst ikke denne e-mail.',
    }),
  }),

  de: (otp, prenom) => ({
    subject: 'Ihr Premium-Bestätigungscode — Data-Home',
    html: baseHtml({
      otp,
      greeting:  `Sehr geehrte/r ${prenom},`,
      intro:     `Vielen Dank für Ihre Registrierung beim <strong>Premium</strong>-Plan von Data-Home. Um Ihren Zugang abzuschließen, verwenden Sie bitte den untenstehenden Bestätigungscode. Dieser Code ist streng persönlich und vertraulich.`,
      label:     'Ihr Bestätigungscode',
      note:      '⏱ Dieser Code läuft in 15 Minuten ab.',
      cta:       `Falls Sie diese Anfrage nicht gestellt haben, können Sie diese E-Mail bedenkenlos ignorieren.`,
      footer:    '© Data-Home · noreply@data-home.app · Bitte antworten Sie nicht auf diese E-Mail.',
    }),
  }),

};

// ─────────────────────────────────────────────
// SERVICES
// ─────────────────────────────────────────────
async function insertToSupabase(payload) {
  const { data } = await axios.post(SUPABASE_ENDPOINT, payload, {
    headers: {
      'apikey':        SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type':  'application/json',
      'Prefer':        'return=minimal',
    },
  });
  return data;
}

async function sendEmail(to, lang, otp, prenom) {
  const safeLang = SUPPORTED_LANGS.includes(lang) ? lang : 'en';
  const { subject, html } = TEMPLATES[safeLang](otp, prenom);

  const { data } = await axios.post(
    'https://api.resend.com/emails',
    { from: FROM_EMAIL, to: [to], subject, html },
    {
      headers: {
        'Authorization': `Bearer ${RESEND_KEY}`,
        'Content-Type':  'application/json',
      },
    },
  );
  return data;
}

// ─────────────────────────────────────────────
// VALIDATION MIDDLEWARE
// ─────────────────────────────────────────────
function validateBody(req, res, next) {
  const { prenom, nom, email } = req.body;
  const errors = [];
  if (!prenom || typeof prenom !== 'string') errors.push('prenom requis');
  if (!nom    || typeof nom    !== 'string') errors.push('nom requis');
  if (!email  || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.push('email invalide');
  if (errors.length) return res.status(400).json({ success: false, errors });
  next();
}

// ─────────────────────────────────────────────
// EXPRESS APP
// ─────────────────────────────────────────────
const app = express();
app.use(express.json());

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok', ts: new Date().toISOString() }));

// Main route
app.post('/register-premium', validateBody, async (req, res) => {
  const {
    prenom,
    nom,
    email,
    entreprise = null,
    telephone  = null,
    preferred_language = 'en',
  } = req.body;

  const otp_code      = generateOtp();
  const otp_expires_at = otpExpiresAt();
  const lang          = SUPPORTED_LANGS.includes(preferred_language) ? preferred_language : 'en';

  try {
    // ① Supabase insert
    await insertToSupabase({
      first_name:         prenom,
      last_name:          nom,
      email,
      company_name:       entreprise,
      phone_number:       telephone,
      otp_code,
      otp_expires_at,
      status:             'pending',
      preferred_language: lang,
    });

    // ② Email Resend
    await sendEmail(email, lang, otp_code, prenom);

    console.log(`[OK] ${email} | lang=${lang} | otp=${otp_code}`);
    return res.status(201).json({
      success: true,
      message: 'Inscription enregistrée. Code OTP envoyé par e-mail.',
    });

  } catch (err) {
    const detail = err.response?.data ?? err.message;
    const status = err.response?.status ?? 500;
    console.error(`[ERROR] ${email} →`, detail);
    return res.status(status >= 400 && status < 600 ? status : 500).json({
      success: false,
      error:   'Erreur lors du traitement.',
      detail,
    });
  }
});

// 404 catch-all
app.use((_req, res) => res.status(404).json({ error: 'Route introuvable' }));

// ─────────────────────────────────────────────
// START
// ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n✅  Premium Tunnel démarré → http://localhost:${PORT}`);
  console.log(`   POST /register-premium`);
  console.log(`   GET  /health\n`);
});
