import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const RESEND_KEY = process.env.RESEND_KEY || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'noreply@data-home.app';
const INTERNAL_RECIPIENTS = ['gillian@habihub-soft.com', 'gaetan@amaru-homes.com'];

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
      agencyName,
      agencyEmail,
      moduleId,
      moduleName,
      modulePrice,
      locale,
    } = body || {};

    if (!agencyId || !moduleId || !moduleName) {
      return NextResponse.json(
        { success: false, error: 'agencyId, moduleId et moduleName sont requis' },
        { status: 400 },
      );
    }

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

