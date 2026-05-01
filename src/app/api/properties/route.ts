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
    const agencyId = searchParams.get('agencyId') || searchParams.get('agency_id');
    const xmlSources = searchParams.getAll('xmlSource').concat(searchParams.getAll('xml_source')).filter(Boolean);


    // Optimisation : sélectionner seulement les champs nécessaires pour la liste
    const BASE_FIELDS = 'id, id_externe, ref, price, prix, town, ville, region, province, beds, baths, surface_built, surface_plot, surface_useful, pool, type, images, titre_fr, titre_en, titre_es, titre_nl, titre_pl, titre_ar, description_fr, description_en, description_es, description_nl, description_pl, description_ar, agency_id, xml_source, development_name, promoteur_name, distance_beach, distance_golf, distance_town, latitude, longitude, adresse, commission_percentage, currency, status';

    // Rebuild base query as a function so we can retry without date columns if needed
    const buildQuery = () => {
      let q = supabase.from('villas').select('*', { count: 'exact' }).or('is_excluded.eq.false,is_excluded.is.null');
      if (agencyId) q = q.eq('agency_id', agencyId);
      if (!agencyId && xmlSources.length > 0) q = q.in('xml_source', xmlSources);
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

    let { data: properties, error, count } = result;

    if (!error && agencyId && xmlSources.length > 0) {
      let xmlResult: any = await supabase.from('villas')
        .select(`${BASE_FIELDS}, delivery_date, start_date`)
        .or('is_excluded.eq.false,is_excluded.is.null')
        .in('xml_source', xmlSources)
        .order('price', { ascending: true })
        .range(offset, offset + limit - 1);

      if (xmlResult.error) {
        xmlResult = await supabase.from('villas')
          .select(BASE_FIELDS)
          .or('is_excluded.eq.false,is_excluded.is.null')
          .in('xml_source', xmlSources)
          .order('price', { ascending: true })
          .range(offset, offset + limit - 1);
      }

      if (xmlResult.error) {
        error = xmlResult.error;
      } else {
        const byId = new Map<string, any>();
        for (const row of properties || []) byId.set(String(row.id), row);
        for (const row of xmlResult.data || []) byId.set(String(row.id), row);
        properties = Array.from(byId.values()).sort((a, b) => Number(a.price || a.prix || 0) - Number(b.price || b.prix || 0));
        count = properties.length;
      }
    }
    if (error) throw error;

    const parseImages = (images: any) => {
      if (Array.isArray(images)) return images.slice(0, 5);
      if (typeof images !== 'string') return [];

      try {
        const parsed = JSON.parse(images);
        return Array.isArray(parsed) ? parsed.slice(0, 5) : [];
      } catch {
        return [];
      }
    };

    // Transformation multilingue optimisée
    const formatted = (properties || []).map((p: any) => ({
      id: p.id,
      id_externe: p.id_externe,
      ref: p.ref,
      price: p.price || p.prix,
      town: p.town || p.ville,
      region: p.region,
      beds: p.beds,
      baths: p.baths,
      surface_built: p.surface_built,
      surface_plot: p.surface_plot,
      surface_useful: p.surface_useful,
      pool: p.pool,
      type: p.type,
      images: parseImages(p.images),
      titre: p[`titre_${lang}`] || p.titre_fr || p.ref,
      description: p[`description_${lang}`] || p.description_fr || "",
      agency_id: p.agency_id,
      xml_source: p.xml_source,
      development_name: p.development_name || null,
      promoteur_name: p.promoteur_name || null,
      province: p.province || null,
      distance_beach: p.distance_beach ?? null,
      distance_golf: p.distance_golf ?? null,
      distance_town: p.distance_town ?? null,
      latitude: p.latitude ?? null,
      longitude: p.longitude ?? null,
      adresse: p.adresse ?? null,
      commission_percentage: p.commission_percentage ?? null,
      currency: p.currency || 'EUR',
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
