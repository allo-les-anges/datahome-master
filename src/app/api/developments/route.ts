// src/app/api/developments/route.ts
import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dynamic = 'force-dynamic';

export interface DevelopmentSummary {
  devId: string;
  name: string | null;
  town: string;
  region: string;
  unitCount: number;
  minPrice: number;
  maxPrice: number;
  types: string[];
  images: string[];
  isNew: boolean;
}

export async function GET() {
  try {
    // Only select columns that are guaranteed to exist in the villas table
    const { data, error } = await supabase
      .from('villas')
      .select('ref, price, town, region, type, images, development_name, promoteur_name')
      .eq('is_excluded', false)
      .not('ref', 'is', null);

    if (error) throw error;

    // Group by ref prefix (e.g. "55499639" from "55499639-03")
    const groups = new Map<string, {
      name: string | null;
      town: string;
      region: string;
      unitCount: number;
      prices: number[];
      types: Set<string>;
      images: string[];
    }>();

    for (const p of data || []) {
      const ref = p.ref as string;
      const dashIdx = ref.indexOf('-');
      // Skip refs without a dash (not a development unit)
      if (dashIdx === -1) continue;
      const devId = ref.slice(0, dashIdx);

      if (!groups.has(devId)) {
        groups.set(devId, {
          name: p.development_name || null,
          town: p.town || '',
          region: p.region || '',
          unitCount: 0,
          prices: [],
          types: new Set(),
          images: [],
        });
      }

      const g = groups.get(devId)!;
      g.unitCount++;
      if (p.price) g.prices.push(Number(p.price));
      if (p.type) g.types.add(p.type);
      if (Array.isArray(p.images)) g.images.push(...p.images.slice(0, 2));
      if (!g.name && p.development_name) g.name = p.development_name;
    }

    const summaries: DevelopmentSummary[] = Array.from(groups.entries()).map(([devId, g]) => ({
      devId,
      name: g.name,
      town: g.town,
      region: g.region,
      unitCount: g.unitCount,
      minPrice: g.prices.length ? Math.min(...g.prices) : 0,
      maxPrice: g.prices.length ? Math.max(...g.prices) : 0,
      types: Array.from(g.types),
      images: Array.from(new Set(g.images)).slice(0, 4),
      isNew: false,
    }));

    // Higher devId number = more recently added to the Habihub feed
    summaries.sort((a, b) => Number(b.devId) - Number(a.devId));

    // Mark top 5 as new
    summaries.slice(0, 5).forEach(s => { s.isNew = true; });

    return NextResponse.json({ developments: summaries, total: summaries.length });
  } catch (error: any) {
    console.error('Erreur API Developments:', error.message);
    return NextResponse.json({ error: 'Erreur serveur', detail: error.message }, { status: 500 });
  }
}
