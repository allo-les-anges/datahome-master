import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { verifyPmSessionToken } from '@/lib/serverAuth';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const agencyId = searchParams.get('agency_id');
  if (!agencyId) return NextResponse.json({ error: 'agency_id requis' }, { status: 400 });
  if (!verifyPmSessionToken(request.headers.get('x-pm-session'), agencyId)) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('villas')
    .select('id, ref, titre_fr, titre_en, price, town, region, beds, baths, surface_built, type, listing_type, rental_period, pool, images, video_url, description_fr, description_en, source, agency_id')
    .eq('agency_id', agencyId)
    .eq('source', 'manual')
    .order('id', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ data });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { agency_id, ...fields } = body;
    if (!agency_id) return NextResponse.json({ error: 'agency_id requis' }, { status: 400 });
    if (!verifyPmSessionToken(request.headers.get('x-pm-session'), agency_id)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const ref = `MAN-${Date.now()}`;
    const { data, error } = await supabase
      .from('villas')
      .insert({ ...fields, agency_id, source: 'manual', ref })
      .select('id')
      .single();

    if (error) throw error;
    return NextResponse.json({ success: true, id: data.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, agency_id, ...fields } = body;
    if (!id || !agency_id) return NextResponse.json({ error: 'id et agency_id requis' }, { status: 400 });
    if (!verifyPmSessionToken(request.headers.get('x-pm-session'), agency_id)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    // Vérifie que le bien appartient à l'agence
    const { data: existing } = await supabase
      .from('villas')
      .select('agency_id')
      .eq('id', id)
      .maybeSingle();

    if (!existing || existing.agency_id !== agency_id) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const { error } = await supabase
      .from('villas')
      .update({ ...fields, source: 'manual' })
      .eq('id', id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const agencyId = searchParams.get('agency_id');
    if (!id || !agencyId) return NextResponse.json({ error: 'id et agency_id requis' }, { status: 400 });
    if (!verifyPmSessionToken(request.headers.get('x-pm-session'), agencyId)) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 });
    }

    const { data: existing } = await supabase
      .from('villas')
      .select('agency_id')
      .eq('id', id)
      .maybeSingle();

    if (!existing || existing.agency_id !== agencyId) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 403 });
    }

    const { error } = await supabase.from('villas').delete().eq('id', id);
    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
