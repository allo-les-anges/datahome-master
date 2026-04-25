// src/app/api/developments/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dynamic = 'force-dynamic';

export interface UnitOption {
  beds: number;
  baths: number;
  surface: number;
  minPrice: number;
  count: number;
}

export interface DevelopmentSummary {
  devId: string;
  name: string | null;
  town: string;
  region: string;
  unitCount: number;
  minPrice: number;
  maxPrice: number;
  options: UnitOption[];
  images: string[];
  isNew: boolean;
  lat: number | null;
  lng: number | null;
  types: string[];
  hasPool: boolean;
  minDistanceBeach: number | null;
  minDistanceGolf: number | null;
  delivery_date: string | null;
  start_date: string | null;
}

export async function GET() {
  try {
    // Try with date columns first; fall back silently if they don't exist in the table
    const baseSelect = 'ref, price, town, region, type, images, development_name, beds, baths, surface_built, latitude, longitude, pool, distance_beach, distance_golf';

    let result: any = await supabase
      .from('villas')
      .select(`${baseSelect}, delivery_date, start_date`)
      .eq('is_excluded', false)
      .not('ref', 'is', null);

    if (result.error) {
      result = await supabase
        .from('villas')
        .select(baseSelect)
        .eq('is_excluded', false)
        .not('ref', 'is', null);
    }

    const { data, error } = result as { data: any[] | null; error: any };
    if (error) throw error;

    const groups = new Map<string, {
      name: string | null;
      town: string;
      region: string;
      prices: number[];
      images: string[];
      optionMap: Map<string, { beds: number; baths: number; surface: number; minPrice: number; count: number }>;
      lat: number | null;
      lng: number | null;
      types: Set<string>;
      hasPool: boolean;
      minDistanceBeach: number | null;
      minDistanceGolf: number | null;
      delivery_date: string | null;
      start_date: string | null;
    }>();

    for (const p of data || []) {
      const ref = p.ref as string;
      const dashIdx = ref.indexOf('-');
      if (dashIdx === -1) continue;
      const devId = ref.slice(0, dashIdx);

      if (!groups.has(devId)) {
        groups.set(devId, {
          name: p.development_name || null,
          town: p.town || '',
          region: p.region || '',
          prices: [],
          images: [],
          optionMap: new Map(),
          lat: null,
          lng: null,
          types: new Set(),
          hasPool: false,
          minDistanceBeach: null,
          minDistanceGolf: null,
          delivery_date: null,
          start_date: null,
        });
      }

      const g = groups.get(devId)!;
      if (!g.name && p.development_name) g.name = p.development_name;
      if (!g.lat && p.latitude) { g.lat = Number(p.latitude); g.lng = Number(p.longitude); }

      const price = Number(p.price) || 0;
      if (price > 0) g.prices.push(price);

      if (Array.isArray(p.images)) g.images.push(...p.images.slice(0, 2));

      // Type
      if (p.type) g.types.add(String(p.type));

      // Pool
      if (!g.hasPool && (p.pool === 'Oui' || p.pool === true || p.pool === '1' || p.pool === 1)) {
        g.hasPool = true;
      }

      // Distances — keep the smallest non-zero value seen in the group
      const beach = p.distance_beach ? parseFloat(String(p.distance_beach)) : null;
      if (beach && beach > 0 && (g.minDistanceBeach === null || beach < g.minDistanceBeach)) {
        g.minDistanceBeach = beach;
      }
      const golf = p.distance_golf ? parseFloat(String(p.distance_golf)) : null;
      if (golf && golf > 0 && (g.minDistanceGolf === null || golf < g.minDistanceGolf)) {
        g.minDistanceGolf = golf;
      }

      // Dates — first non-null value wins for the group
      if (!g.delivery_date && p.delivery_date) g.delivery_date = String(p.delivery_date);
      if (!g.start_date   && p.start_date)    g.start_date    = String(p.start_date);

      // Build option key from beds + baths + rounded surface
      const beds = parseInt(String(p.beds || '0')) || 0;
      const baths = parseInt(String(p.baths || '0')) || 0;
      const surface = parseFloat(String(p.surface_built || '0')) || 0;
      const surfaceRounded = Math.round(surface * 10) / 10;
      const optKey = `${beds}-${baths}-${surfaceRounded}`;

      if (!g.optionMap.has(optKey)) {
        g.optionMap.set(optKey, { beds, baths, surface: surfaceRounded, minPrice: price, count: 0 });
      }
      const opt = g.optionMap.get(optKey)!;
      opt.count++;
      if (price > 0 && (opt.minPrice === 0 || price < opt.minPrice)) opt.minPrice = price;
    }

    const summaries: DevelopmentSummary[] = Array.from(groups.entries()).map(([devId, g]) => {
      const options: UnitOption[] = Array.from(g.optionMap.values())
        .filter(o => o.beds > 0 || o.baths > 0 || o.surface > 0)
        .sort((a, b) => a.minPrice - b.minPrice || a.beds - b.beds);

      const allPrices = g.prices;

      return {
        devId,
        name: g.name,
        town: g.town,
        region: g.region,
        unitCount: Array.from(g.optionMap.values()).reduce((s, o) => s + o.count, 0),
        minPrice: allPrices.length ? Math.min(...allPrices) : 0,
        maxPrice: allPrices.length ? Math.max(...allPrices) : 0,
        options,
        images: Array.from(new Set(g.images)).slice(0, 4),
        isNew: false,
        lat: g.lat,
        lng: g.lng,
        types: Array.from(g.types),
        hasPool: g.hasPool,
        minDistanceBeach: g.minDistanceBeach,
        minDistanceGolf: g.minDistanceGolf,
        delivery_date: g.delivery_date,
        start_date: g.start_date,
      };
    });

    summaries.sort((a, b) => Number(b.devId) - Number(a.devId));
    summaries.slice(0, 5).forEach(s => { s.isNew = true; });

    return NextResponse.json({ developments: summaries, total: summaries.length });
  } catch (error: any) {
    console.error('Erreur API Developments:', error.message);
    return NextResponse.json({ error: 'Erreur serveur', detail: error.message }, { status: 500 });
  }
}
