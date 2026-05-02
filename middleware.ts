import { NextRequest, NextResponse } from 'next/server';

const SUPPORTED_LOCALES = ['fr', 'en', 'nl', 'es', 'ar', 'pl', 'de', 'ru', 'no', 'da'];
const RESERVED_HOSTS = new Set(['localhost', '127.0.0.1', 'datahome.vercel.app', 'data-home.app']);
const PUBLIC_FILE = /\.(.*)$/;

type DomainAgency = {
  subdomain: string;
  default_lang: string | null;
  website_status: string | null;
};

function normalizeHost(host: string) {
  return host.split(':')[0].trim().toLowerCase();
}

function normalizeDomain(domain: string) {
  return normalizeHost(domain)
    .replace(/^https?:\/\//, '')
    .replace(/^www\./, '')
    .replace(/\/.*$/, '');
}

function shouldIgnoreRequest(pathname: string, host: string) {
  return (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/admin') ||
    pathname === '/favicon.ico' ||
    pathname === '/robots.txt' ||
    PUBLIC_FILE.test(pathname) ||
    RESERVED_HOSTS.has(host) ||
    host.endsWith('.vercel.app')
  );
}

async function findAgencyByDomain(host: string): Promise<DomainAgency | null> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_KEY;

  if (!supabaseUrl || !supabaseKey) return null;

  const normalizedHost = normalizeDomain(host);
  const candidates = Array.from(new Set([host, normalizedHost, `www.${normalizedHost}`]));
  const orFilter = candidates.map((domain) => `custom_domain.eq.${encodeURIComponent(domain)}`).join(',');
  const url =
    `${supabaseUrl}/rest/v1/agency_settings` +
    `?select=subdomain,default_lang,website_status` +
    `&or=(${orFilter})` +
    `&limit=1`;

  const res = await fetch(url, {
    headers: {
      apikey: supabaseKey,
      Authorization: `Bearer ${supabaseKey}`,
    },
    next: { revalidate: 60 },
  });

  if (!res.ok) return null;
  const rows = await res.json();
  return Array.isArray(rows) ? rows[0] || null : null;
}

function buildAgencyPath(pathname: string, agency: DomainAgency) {
  const segments = pathname.split('/').filter(Boolean);
  const localeFromPath = SUPPORTED_LOCALES.includes(segments[0]) ? segments[0] : null;
  const locale = localeFromPath || agency.default_lang || 'fr';
  const rest = localeFromPath ? segments.slice(1) : segments;

  if (rest[0] === agency.subdomain) {
    return `/${locale}/${rest.join('/')}`;
  }

  return `/${[locale, agency.subdomain, ...rest].filter(Boolean).join('/')}`;
}

export async function middleware(req: NextRequest) {
  const host = normalizeHost(req.headers.get('host') || '');
  const { pathname, search } = req.nextUrl;

  if (shouldIgnoreRequest(pathname, host)) {
    return NextResponse.next();
  }

  const agency = await findAgencyByDomain(host);
  if (!agency?.subdomain || agency.website_status === 'pending') {
    return NextResponse.next();
  }

  const rewriteUrl = req.nextUrl.clone();
  rewriteUrl.pathname = buildAgencyPath(pathname, agency);
  rewriteUrl.search = search;

  return NextResponse.rewrite(rewriteUrl);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
