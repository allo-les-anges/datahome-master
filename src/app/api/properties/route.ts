// src/app/api/properties/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dynamic = 'force-dynamic';
export const revalidate = 60; // Cache ISR pendant 60 secondes

// Cache en mémoire simple pour les requêtes identiques
const cache = new Map();
const CACHE_TTL = 60000; // 1 minute

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Générer une clé de cache unique basée sur les paramètres
    const cacheKey = searchParams.toString();
    const cached = cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return NextResponse.json(cached.data);
    }
    
    const lang = searchParams.get('lang') || 'fr';
    const limit = parseInt(searchParams.get('limit') || '24');
    const offset = parseInt(searchParams.get('offset') || '0');

    const type = searchParams.get('type');
    const region = searchParams.get('region');
    const town = searchParams.get('town');
    const beds = searchParams.get('beds');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const ref = searchParams.get('reference');


    // Optimisation : sélectionner seulement les champs nécessaires pour la liste
    const BASE_FIELDS = 'id, ref, price, town, region, province, beds, baths, surface_built, surface_plot, pool, type, images, titre_fr, titre_en, titre_es, titre_nl, titre_pl, titre_ar, description_fr, description_en, description_es, description_nl, description_pl, description_ar, xml_source, development_name, promoteur_name, distance_beach, distance_golf, distance_town, latitude, longitude, commission_percentage, status';

    // Rebuild base query as a function so we can retry without date columns if needed
    const buildQuery = () => {
      let q = supabase.from('villas').select('*', { count: 'exact' }).eq('is_excluded', false);
      if (type) q = q.ilike('type', `%${type}%`);
      if (region) q = q.eq('region', region);
      if (town) q = q.ilike('town', `%${town}%`);
      if (ref) q = q.ilike('ref', `%${ref}%`);
      if (beds) q = q.gte('beds', parseInt(beds));
      if (minPrice) q = q.gte('price', parseInt(minPrice));
      if (maxPrice) q = q.lte('price', parseInt(maxPrice));
      return q;
    };

    let result: any = await buildQuery()
      .select(`${BASE_FIELDS}, delivery_date, start_date`)
      .order('price', { ascending: true })
      .range(offset, offset + limit - 1);

    if (result.error) {
      result = await buildQuery()
        .select(BASE_FIELDS)
        .order('price', { ascending: true })
        .range(offset, offset + limit - 1);
    }

    const { data: properties, error, count } = result;
    if (error) throw error;

    // Transformation multilingue optimisée
    const formatted = (properties || []).map((p: any) => ({
      id: p.id,
      ref: p.ref,
      price: p.price,
      town: p.town,
      region: p.region,
      beds: p.beds,
      baths: p.baths,
      surface_built: p.surface_built,
      surface_plot: p.surface_plot,
      pool: p.pool,
      type: p.type,
      images: Array.isArray(p.images) ? p.images.slice(0, 5) : [], // Limiter les images
      titre: p[`titre_${lang}`] || p.titre_fr || p.ref,
      description: p[`description_${lang}`] || p.description_fr || "",
      xml_source: p.xml_source,
      development_name: p.development_name || null,
      promoteur_name: p.promoteur_name || null,
      province: p.province || null,
      distance_beach: p.distance_beach ?? null,
      distance_golf: p.distance_golf ?? null,
      distance_town: p.distance_town ?? null,
      latitude: p.latitude ?? null,
      longitude: p.longitude ?? null,
      commission_percentage: p.commission_percentage ?? null,
      status: p.status ?? null,
      delivery_date: p.delivery_date ?? null,
      start_date: p.start_date ?? null,
    }));

    const response = { properties: formatted, total: count };
    
    // Mise en cache
    cache.set(cacheKey, { data: response, timestamp: Date.now() });
    
    // Nettoyer le cache périodiquement
    if (cache.size > 50) {
      const now = Date.now();
      for (const [key, value] of cache.entries()) {
        if (now - value.timestamp > CACHE_TTL) {
          cache.delete(key);
        }
      }
    }

    return NextResponse.json(response);

  } catch (error: any) {
    console.error("Erreur API Properties:", error.message);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}