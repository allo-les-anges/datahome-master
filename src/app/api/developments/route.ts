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
  latestCreatedAt: string | null;
  isNew: boolean;
}

export async function GET() {
  try {
    const { data, error } = await supabase
      .from('villas')
      .select('ref, price, town, region, type, images, development_name, created_at')
      .eq('is_excluded', false)
      .not('ref', 'is', null);

    if (error) throw error;

    // Group by ref prefix (e.g. "55499639" from "55499639-03")
    const groups = new Map<string, {
      name: string | null;
      town: string;
      region: string;
      prices: number[];
      types: Set<string>;
      images: string[];
      createdAts: string[];
    }>();

    for (const p of data || []) {
      const parts = (p.ref as string).split('-');
      if (parts.length < 2) continue; // skip non-development refs
      const devId = parts[0];

      if (!groups.has(devId)) {
        groups.set(devId, {
          name: p.development_name || null,
          town: p.town || '',
          region: p.region || '',
          prices: [],
          types: new Set(),
          images: [],
          createdAts: [],
        });
      }

      const g = groups.get(devId)!;
      if (p.price) g.prices.push(Number(p.price));
      if (p.type) g.types.add(p.type);
      if (Array.isArray(p.images)) g.images.push(...p.images.slice(0, 2));
      if (p.created_at) g.createdAts.push(p.created_at);
      // Use first non-null name found
      if (!g.name && p.development_name) g.name = p.development_name;
    }

    // Build summary array sorted by most recent first
    const summaries: DevelopmentSummary[] = Array.from(groups.entries()).map(([devId, g]) => {
      const sortedDates = g.createdAts.sort((a, b) => b.localeCompare(a));
      const latestCreatedAt = sortedDates[0] || null;
      return {
        devId,
        name: g.name,
        town: g.town,
        region: g.region,
        unitCount: g.prices.length,
        minPrice: g.prices.length ? Math.min(...g.prices) : 0,
        maxPrice: g.prices.length ? Math.max(...g.prices) : 0,
        types: Array.from(g.types),
        images: Array.from(new Set(g.images)).slice(0, 4),
        latestCreatedAt,
        isNew: false, // will be set below
      };
    });

    // Sort by most recent
    summaries.sort((a, b) => {
      if (!a.latestCreatedAt) return 1;
      if (!b.latestCreatedAt) return -1;
      return b.latestCreatedAt.localeCompare(a.latestCreatedAt);
    });

    // Mark top 5 as new
    summaries.slice(0, 5).forEach(s => { s.isNew = true; });

    return NextResponse.json({ developments: summaries, total: summaries.length });
  } catch (error: any) {
    console.error('Erreur API Developments:', error.message);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
}
