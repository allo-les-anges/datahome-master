import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'fr';
    const agencyId = searchParams.get('agencyId');

    console.log(`[API] 🔍 Recherche: id=${id}, agencyId=${agencyId}, lang=${lang}`);

    // Construction de la requête de base
    let query = supabase.from('villas').select('*');

    // 1. Recherche par UUID
    query = query.eq('id', id);
    
    // 2. Filtrer par agency_id si fourni
    if (agencyId) {
      query = query.eq('agency_id', agencyId);
    }

    let { data: property } = await query.maybeSingle();

    // 3. Si non trouvé, chercher par id_externe
    if (!property && agencyId) {
      console.log(`[API] Recherche par id_externe: ${id}`);
      const { data: altProperty } = await supabase
        .from('villas')
        .select('*')
        .eq('id_externe', id)
        .eq('agency_id', agencyId)
        .maybeSingle();
      property = altProperty;
    }

    // 4. Si non trouvé, chercher par ref
    if (!property && agencyId) {
      console.log(`[API] Recherche par ref: ${id}`);
      const { data: refProperty } = await supabase
        .from('villas')
        .select('*')
        .eq('ref', id)
        .eq('agency_id', agencyId)
        .maybeSingle();
      property = refProperty;
    }

    // 5. Dernier recours: recherche élargie sans filtre agence
    if (!property) {
      console.log(`[API] Recherche élargie sans filtre agence`);
      const { data: finalTry } = await supabase
        .from('villas')
        .select('*')
        .or(`id.eq.${id},id_externe.eq.${id},ref.eq.${id}`)
        .maybeSingle();
      property = finalTry;
    }

    if (!property) {
      console.error(`[API] ❌ Propriété ${id} introuvable`);
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Formatage dynamique
    const formatted = {
      ...property,
      titre: property[`titre_${lang}`] || property.titre_fr || property.titre || "Villa",
      description: property[`description_${lang}`] || property.description_fr || property.description || "",
      images: Array.isArray(property.images) ? property.images : 
              (typeof property.images === 'string' ? JSON.parse(property.images || '[]') : [])
    };

    console.log(`[API] ✅ Trouvé: ${formatted.titre.substring(0, 50)}...`);
    return NextResponse.json(formatted);

  } catch (error) {
    console.error('Erreur API Critique:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}