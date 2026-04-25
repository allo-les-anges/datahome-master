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
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('villas')
      .select('ref, price, town, region, type, images, development_name, beds, baths, surface_built')
      .eq('is_excluded', false)
      .not('ref', 'is', null);

    if (error) throw error;

    const groups = new Map<string, {
      name: string | null;
      town: string;
      region: string;
      prices: number[];
      images: string[];
      optionMap: Map<string, { beds: number; baths: number; surface: number; minPrice: number; count: number }>;
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
        });
      }

      const g = groups.get(devId)!;
      if (!g.name && p.development_name) g.name = p.development_name;

      const price = Number(p.price) || 0;
      if (price > 0) g.prices.push(price);

      if (Array.isArray(p.images)) g.images.push(...p.images.slice(0, 2));

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
