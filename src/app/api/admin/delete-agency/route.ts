import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { isAdminRequest, unauthorized } from '@/lib/serverAuth';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
);

export async function DELETE(req: NextRequest) {
  if (!isAdminRequest(req)) return unauthorized();

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ success: false, error: 'id requis' }, { status: 400 });
  }

  console.log('[delete-agency] Tentative suppression id:', id);

  const { error, count } = await supabase
    .from('agency_settings')
    .delete({ count: 'exact' })
    .eq('id', id);

  if (error) {
    console.error('[delete-agency] Erreur Supabase:', error.code, error.message, error.details);
    return NextResponse.json(
      { success: false, error: error.message, code: error.code, details: error.details },
      { status: 400 },
    );
  }

  console.log('[delete-agency] Supprimé, lignes affectées:', count);
  return NextResponse.json({ success: true, count });
}
