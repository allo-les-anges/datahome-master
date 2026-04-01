import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Paramètres de base
    const lang = searchParams.get('lang') || 'fr';
    const limit = parseInt(searchParams.get('limit') || '12');
    const offset = parseInt(searchParams.get('offset') || '0');

    // --- NOUVEAUX FILTRES RÉCUPÉRÉS DE L'URL ---
    const type = searchParams.get('type');
    const region = searchParams.get('region');
    const town = searchParams.get('town');
    const beds = searchParams.get('beds');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const ref = searchParams.get('reference');

    // Construction de la requête
    let query = supabase
      .from('villas')
      .select('*', { count: 'exact' }) // On sélectionne tout pour simplifier le formatage
      .eq('is_excluded', false);

    // --- APPLICATION DES FILTRES DYNAMIQUE ---
    if (type) query = query.ilike('type', `%${type}%`);
    if (region) query = query.eq('region', region);
    if (town) query = query.ilike('town', `%${town}%`);
    if (ref) query = query.ilike('ref', `%${ref}%`);
    if (beds) query = query.gte('beds', parseInt(beds));
    
    if (minPrice) query = query.gte('price', parseInt(minPrice));
    if (maxPrice) query = query.lte('price', parseInt(maxPrice));

    // Pagination et Tri
    const { data: properties, error, count } = await query
      .order('price', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) throw error;

    // Transformation multilingue
    const formatted = (properties || []).map((p: any) => ({
      ...p,
      titre: p[`titre_${lang}`] || p.titre_fr || p.ref,
      description: p[`description_${lang}`] || p.description_fr || "",
    }));

    return NextResponse.json({ 
      properties: formatted, 
      total: count 
    });

  } catch (error: any) {
    console.error("Erreur API Properties:", error.message);
    return NextResponse.json({ error: "Erreur serveur", details: error.message }, { status: 500 });
  }
}