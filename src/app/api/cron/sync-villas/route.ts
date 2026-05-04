import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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

  const { data: agencies, error } = await supabase
    .from('agency_settings')
    .select('id, agency_name, footer_config')
    .not('footer_config', 'is', null);

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  const jobs = (agencies || []).flatMap((agency: any) => {
    const footerConfig = parseFooterConfig(agency.footer_config);
    const xmlUrls = Array.from(new Set((footerConfig.xml_urls || []).filter(Boolean))) as string[];
    return xmlUrls.map((xmlUrl) => ({
      agencyId: agency.id,
      agencyName: agency.agency_name,
      xmlUrl,
    }));
  });

  if (jobs.length === 0) {
    return NextResponse.json({ success: true, message: 'Aucun flux XML à synchroniser', jobs: 0 });
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || new URL(request.url).origin;
  const results = [];

  for (const job of jobs) {
    try {
      const res = await fetch(`${baseUrl}/api/sync-villas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agencyId: job.agencyId, xmlUrl: job.xmlUrl }),
      });
      const json = await res.json();
      results.push({
        ...job,
        success: res.ok && json.success,
        count: json.count || 0,
        error: res.ok ? null : json.error || `HTTP ${res.status}`,
      });
    } catch (err: any) {
      results.push({
        ...job,
        success: false,
        count: 0,
        error: err.message || 'Erreur inconnue',
      });
    }
  }

  const synced = results.reduce((total, result) => total + Number(result.count || 0), 0);
  const failed = results.filter((result) => !result.success).length;

  return NextResponse.json({
    success: failed === 0,
    jobs: jobs.length,
    synced,
    failed,
    results,
  }, { status: failed === 0 ? 200 : 207 });
}
