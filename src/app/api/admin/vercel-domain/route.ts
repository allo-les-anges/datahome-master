import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const VERCEL_API = 'https://api.vercel.com';
const VERCEL_TOKEN = process.env.VERCEL_TOKEN;
const VERCEL_PROJECT_ID =
  process.env.VERCEL_PROJECT_ID ||
  process.env.VERCEL_PROJECT_NAME ||
  'prj_qQWQns4jPhmoHKjADIfDhcN3wOt6';
const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID;
const VERCEL_TEAM_SLUG = process.env.VERCEL_TEAM_SLUG;

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

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const agencyId = String(body.agency_id || '');
    const domain = normalizeDomain(String(body.domain || ''));

    if (!agencyId || !domain) {
      return NextResponse.json({ success: false, error: 'agency_id et domain sont requis' }, { status: 400 });
    }

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

    return NextResponse.json({ success: true, agency, dns, vercel: projectDomainRes.json });
  } catch (err: any) {
    console.error('[vercel-domain]', err);
    return NextResponse.json({ success: false, error: err.message || 'Erreur serveur' }, { status: 500 });
  }
}
