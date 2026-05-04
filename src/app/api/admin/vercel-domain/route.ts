import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { hasAdminOrPmAccess, unauthorized } from '@/lib/serverAuth';

export const dynamic = 'force-dynamic';

const VERCEL_API = 'https://api.vercel.com';
const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const VERCEL_PROJECT_ID =
  process.env.VERCEL_PROJECT_ID ||
  process.env.VERCEL_PROJECT_NAME ||
  'prj_qQWQns4jPhmoHKjADIfDhcN3wOt6';
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID;
const VERCEL_TEAM_SLUG = process.env.VERCEL_TEAM_SLUG;
const RESEND_KEY = process.env.RESEND_KEY || process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.FROM_EMAIL || process.env.RESEND_FROM_EMAIL || 'noreply@data-home.app';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://datahome.vercel.app';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

function normalizeDomain(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, '')
    .replace(/\/.*$/, '');
}

function vercelQuery() {
  const params = new URLSearchParams();
  if (VERCEL_TEAM_ID) params.set('teamId', VERCEL_TEAM_ID);
  if (VERCEL_TEAM_SLUG) params.set('slug', VERCEL_TEAM_SLUG);
  const query = params.toString();
  return query ? `?${query}` : '';
}

async function vercelFetch(path: string, init?: RequestInit) {
  if (!VERCEL_TOKEN) {
    throw new Error('VERCEL_TOKEN manquant dans les variables d\'environnement.');
  }

  const res = await fetch(`${VERCEL_API}${path}${vercelQuery()}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${VERCEL_TOKEN}`,
      'Content-Type': 'application/json',
      ...(init?.headers || {}),
    },
  });

  const text = await res.text();
  const json = text ? JSON.parse(text) : {};
  return { ok: res.ok, status: res.status, json };
}

function buildDnsInstructions(domain: string, projectDomain: any, domainConfig: any) {
  const isApex = domain.split('.').length === 2;
  const recommendedA = domainConfig?.recommendedIPv4?.[0]?.value?.[0] || '76.76.21.21';
  const recommendedCname = domainConfig?.recommendedCNAME?.[0]?.value || 'cname.vercel-dns.com';
  const records: Array<{ type: string; name: string; value: string; purpose: string }> = [];

  if (isApex) {
    records.push({ type: 'A', name: '@', value: recommendedA, purpose: 'Faire pointer le domaine racine vers Vercel' });
    records.push({ type: 'CNAME', name: 'www', value: recommendedCname, purpose: 'Faire pointer www vers Vercel' });
  } else {
    records.push({
      type: 'CNAME',
      name: domain.split('.')[0],
      value: recommendedCname,
      purpose: 'Faire pointer ce sous-domaine vers Vercel',
    });
  }

  const verificationRecords = Array.isArray(projectDomain?.verification)
    ? projectDomain.verification.map((challenge: any) => ({
      type: challenge.type,
      name: challenge.domain,
      value: challenge.value,
      purpose: challenge.reason || 'Verifier la propriete du domaine',
    }))
    : [];

  return {
    domain,
    verified: projectDomain?.verified === true,
    misconfigured: domainConfig?.misconfigured === true,
    records,
    verificationRecords,
  };
}

async function getProjectDomain(domain: string) {
  return vercelFetch(`/v9/projects/${encodeURIComponent(VERCEL_PROJECT_ID)}/domains/${encodeURIComponent(domain)}`);
}

function getClientEmail(agency: any) {
  const footer = typeof agency?.footer_config === 'string'
    ? (() => { try { return JSON.parse(agency.footer_config); } catch { return {}; } })()
    : (agency?.footer_config || {});
  return agency?.email || footer.client_email || footer.email || footer.contact_email || '';
}

function domainEmailCopy(lang: string) {
  const copy: Record<string, any> = {
    fr: {
      subject: 'Configuration de votre domaine Data-Home',
      title: 'Votre domaine est pret a etre connecte',
      intro: 'Nous avons ajoute votre domaine au projet Data-Home. Il reste a configurer les DNS chez votre fournisseur de nom de domaine.',
      records: 'Enregistrements DNS a configurer',
      verification: 'Verification Vercel',
      next: 'Une fois ces valeurs ajoutees, la propagation peut prendre de quelques minutes a quelques heures.',
      site: 'Votre site actuel',
    },
    en: {
      subject: 'Your Data-Home domain setup',
      title: 'Your domain is ready to be connected',
      intro: 'We have added your domain to the Data-Home project. The remaining step is to configure DNS records at your domain provider.',
      records: 'DNS records to configure',
      verification: 'Vercel verification',
      next: 'Once these values are added, DNS propagation can take from a few minutes to a few hours.',
      site: 'Your current website',
    },
    nl: {
      subject: 'Uw Data-Home domeinconfiguratie',
      title: 'Uw domein is klaar om gekoppeld te worden',
      intro: 'We hebben uw domein toegevoegd aan het Data-Home project. U hoeft nu alleen nog de DNS-records bij uw domeinprovider te configureren.',
      records: 'DNS-records om te configureren',
      verification: 'Vercel verificatie',
      next: 'Na het toevoegen van deze waarden kan DNS-propagatie enkele minuten tot enkele uren duren.',
      site: 'Uw huidige website',
    },
    es: {
      subject: 'Configuracion de su dominio Data-Home',
      title: 'Su dominio esta listo para conectarse',
      intro: 'Hemos anadido su dominio al proyecto Data-Home. El paso restante es configurar los DNS en su proveedor de dominio.',
      records: 'Registros DNS a configurar',
      verification: 'Verificacion Vercel',
      next: 'Una vez anadidos estos valores, la propagacion DNS puede tardar desde unos minutos hasta varias horas.',
      site: 'Su sitio actual',
    },
  };
  return copy[lang] || copy.en;
}

function renderRecordRows(records: any[]) {
  if (!records?.length) return '';
  return records.map((record) => `
    <tr>
      <td style="padding:10px;border-bottom:1px solid #e2e8f0;font-family:monospace;font-weight:700;">${record.type}</td>
      <td style="padding:10px;border-bottom:1px solid #e2e8f0;font-family:monospace;">${record.name}</td>
      <td style="padding:10px;border-bottom:1px solid #e2e8f0;font-family:monospace;word-break:break-all;">${record.value}</td>
    </tr>
  `).join('');
}

async function sendDomainInstructionsEmail(agency: any, dns: any, requestedLang?: string) {
  if (!RESEND_KEY) return;

  const to = getClientEmail(agency);
  if (!to) return;

  const lang = requestedLang || agency?.default_lang || 'en';
  const t = domainEmailCopy(lang);
  const siteUrl = `${SITE_URL}/${lang}/${agency.subdomain}`;
  const subject = `${t.subject} - ${agency.agency_name || dns.domain}`;
  const verificationRows = renderRecordRows(dns.verificationRecords || []);
  const html = `<!DOCTYPE html>
<html lang="${lang}">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:Arial,sans-serif;color:#0f172a;">
  <table width="100%" cellpadding="0" cellspacing="0" style="padding:32px 0;background:#f1f5f9;">
    <tr><td align="center">
      <table width="640" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(15,23,42,.10);">
        <tr><td style="background:#0f172a;padding:28px 36px;color:#fff;">
          <div style="font-size:22px;font-weight:800;letter-spacing:1px;">DATA-HOME</div>
          <div style="margin-top:8px;color:#cbd5e1;font-size:13px;">${dns.domain}</div>
        </td></tr>
        <tr><td style="padding:32px 36px;">
          <h1 style="margin:0 0 12px;font-size:22px;">${t.title}</h1>
          <p style="margin:0 0 24px;color:#475569;line-height:1.7;">${t.intro}</p>
          <p style="margin:0 0 8px;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:#64748b;">${t.records}</p>
          <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:12px;overflow:hidden;margin-bottom:22px;">
            ${renderRecordRows(dns.records || [])}
          </table>
          ${verificationRows ? `
            <p style="margin:0 0 8px;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:2px;color:#92400e;">${t.verification}</p>
            <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #fde68a;border-radius:12px;overflow:hidden;margin-bottom:22px;background:#fffbeb;">
              ${verificationRows}
            </table>
          ` : ''}
          <p style="margin:0 0 18px;color:#475569;line-height:1.7;">${t.next}</p>
          <p style="margin:0;color:#64748b;font-size:13px;">${t.site}: <a href="${siteUrl}" style="color:#2563eb;font-weight:700;">${siteUrl}</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM_EMAIL, to: [to], subject, html }),
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const agencyId = String(body.agency_id || '');
    const domain = normalizeDomain(String(body.domain || ''));
    const lang = String(body.lang || '');

    if (!agencyId || !domain) {
      return NextResponse.json({ success: false, error: 'agency_id et domain sont requis' }, { status: 400 });
    }

    if (!hasAdminOrPmAccess(req, agencyId)) return unauthorized();

    let projectDomainRes = await vercelFetch(
      `/v10/projects/${encodeURIComponent(VERCEL_PROJECT_ID)}/domains`,
      {
        method: 'POST',
        body: JSON.stringify({ name: domain }),
      },
    );

    if (!projectDomainRes.ok && [400, 409].includes(projectDomainRes.status)) {
      projectDomainRes = await getProjectDomain(domain);
    }

    if (!projectDomainRes.ok) {
      return NextResponse.json(
        { success: false, error: projectDomainRes.json?.error?.message || 'Erreur Vercel', details: projectDomainRes.json },
        { status: 502 },
      );
    }

    const configRes = await vercelFetch(`/v6/domains/${encodeURIComponent(domain)}/config`);
    if (!projectDomainRes.json?.verified) {
      const verifyRes = await vercelFetch(
        `/v9/projects/${encodeURIComponent(VERCEL_PROJECT_ID)}/domains/${encodeURIComponent(domain)}/verify`,
        { method: 'POST' },
      );
      if (verifyRes.ok) {
        projectDomainRes = verifyRes;
      }
    }

    const dns = buildDnsInstructions(domain, projectDomainRes.json, configRes.ok ? configRes.json : null);
    const status = projectDomainRes.json?.verified ? 'verified' : 'pending';

    const { data: agency, error } = await supabase
      .from('agency_settings')
      .update({
        custom_domain: domain,
        custom_domain_status: status,
        custom_domain_verified_at: status === 'verified' ? new Date().toISOString() : null,
        custom_domain_verification: projectDomainRes.json?.verification || [],
        custom_domain_dns: dns,
        updated_at: new Date().toISOString(),
      })
      .eq('id', agencyId)
      .select()
      .maybeSingle();

    if (error) throw error;

    await sendDomainInstructionsEmail(agency, dns, lang);

    return NextResponse.json({ success: true, agency, dns, vercel: projectDomainRes.json });
  } catch (err: any) {
    console.error('[vercel-domain]', err);
    return NextResponse.json({ success: false, error: err.message || 'Erreur serveur' }, { status: 500 });
  }
}
