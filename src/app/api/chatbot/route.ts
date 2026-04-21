import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface SearchCriteria {
  budget_max?: number;
  town?: string;
  beds?: number;
}

interface PropertyResult {
  id: string;
  title: string;
  price: number;
  town: string;
  beds: number;
  pool: boolean;
  image: string;
  over_budget?: boolean;
}

function extractSearchCriteria(text: string): SearchCriteria | null {
  const match = text.match(/<search_criteria>([\s\S]*?)<\/search_criteria>/);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

function parseBudgetMax(raw?: number | string): number | null {
  if (!raw) return null;
  const num = typeof raw === 'number' ? raw : parseFloat(String(raw).replace(/[^\d.]/g, ''));
  if (isNaN(num)) return null;
  return num < 10000 ? num * 1000 : num;
}

function buildBaseQuery(xmlUrls: string[]) {
  let q = supabase
    .from('villas')
    .select('id, titre, titre_fr, titre_en, titre_es, titre_nl, titre_pl, titre_ar, price, town, beds, pool, images')
    .or('is_excluded.eq.false,is_excluded.is.null')
    .order('price', { ascending: true })
    .limit(3);
  if (xmlUrls.length > 0) q = q.in('xml_source', xmlUrls);
  return q;
}

function formatResult(v: any, locale: string, budgetMax: number | null): PropertyResult {
  const titleKey = `titre_${locale}` as keyof typeof v;
  const title = (v[titleKey] as string) || v.titre_fr || v.titre || 'Propriété';
  let images: string[] = [];
  try {
    images = Array.isArray(v.images) ? v.images : JSON.parse(v.images || '[]');
  } catch { images = []; }

  const price = Number(v.price) || 0;
  return {
    id: v.id,
    title,
    price,
    town: v.town || '',
    beds: parseInt(String(v.beds)) || 0,
    pool: v.pool === 'Oui' || v.pool === true,
    image: images[0] || '/hero_network.jpg',
    ...(budgetMax && price > budgetMax ? { over_budget: true } : {}),
  };
}

async function searchVillas(criteria: SearchCriteria, agencyId: string, locale: string): Promise<PropertyResult[]> {
  const { data: agency } = await supabase
    .from('agency_settings')
    .select('footer_config')
    .eq('id', agencyId)
    .single();

  const xmlUrls: string[] = agency?.footer_config?.xml_urls || [];
  const budgetMax = parseBudgetMax(criteria.budget_max);

  // Tentative 1 : price <= budget +20%, + town et beds
  if (budgetMax) {
    const ceiling1 = Math.round(budgetMax * 1.2);
    let q1 = buildBaseQuery(xmlUrls).lte('price', ceiling1);
    if (criteria.town) q1 = q1.ilike('town', `%${criteria.town}%`);
    if (criteria.beds) q1 = q1.filter('beds', 'gte', criteria.beds);
    const { data: v1 } = await q1;
    if (v1 && v1.length > 0) return v1.map(v => formatResult(v, locale, budgetMax));
  }

  // Tentative 2 : price <= budget +50%, sans town/beds
  if (budgetMax) {
    const ceiling2 = Math.round(budgetMax * 1.5);
    const { data: v2 } = await buildBaseQuery(xmlUrls).lte('price', ceiling2);
    if (v2 && v2.length > 0) return v2.map(v => formatResult(v, locale, budgetMax));
  }

  // Tentative 3 : aucun filtre budget — town ou beds seul, les 3 moins chers
  if (criteria.town || criteria.beds) {
    let q3 = buildBaseQuery(xmlUrls);
    if (criteria.town) q3 = q3.ilike('town', `%${criteria.town}%`);
    if (criteria.beds) q3 = q3.filter('beds', 'gte', criteria.beds);
    const { data: v3 } = await q3;
    if (v3 && v3.length > 0) return v3.map(v => formatResult(v, locale, budgetMax));
  }

  return [];
}

export async function POST(req: NextRequest) {
  try {
    const { messages, systemPrompt, agencyId, locale } = await req.json();

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: 'OpenAI API key not configured' }, { status: 500 });
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        max_tokens: 500,
        temperature: 0.7,
        messages: [{ role: 'system', content: systemPrompt }, ...messages],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      return NextResponse.json({ error: 'OpenAI API error', detail: err }, { status: 500 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    let properties: PropertyResult[] = [];
    if (agencyId) {
      const criteria = extractSearchCriteria(content);
      if (criteria && (criteria.budget_max || criteria.town || criteria.beds)) {
        properties = await searchVillas(criteria, agencyId, locale || 'fr');
      }
    }

    return NextResponse.json({ content, properties });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
