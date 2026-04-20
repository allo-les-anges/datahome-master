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

async function searchVillas(criteria: SearchCriteria, agencyId: string, locale: string) {
  const { data: agency } = await supabase
    .from('agency_settings')
    .select('footer_config')
    .eq('id', agencyId)
    .single();

  const xmlUrls: string[] = agency?.footer_config?.xml_urls || [];

  let query = supabase
    .from('villas')
    .select('id, titre, titre_fr, titre_en, titre_es, titre_nl, titre_pl, titre_ar, price, town, beds, pool, images')
    .eq('is_excluded', false)
    .order('price', { ascending: true })
    .limit(3);

  if (xmlUrls.length > 0) query = query.in('xml_source', xmlUrls);

  const budgetMax = parseBudgetMax(criteria.budget_max);
  if (budgetMax) query = query.lte('price', budgetMax);
  if (criteria.town) query = query.ilike('town', `%${criteria.town}%`);
  if (criteria.beds) query = query.filter('beds', 'gte', criteria.beds);

  console.log('[Chatbot] Villa query params:', {
    agencyId,
    xmlUrls,
    budgetMax,
    town: criteria.town || null,
    beds: criteria.beds || null,
  });

  const { data: villas, error } = await query;

  console.log('[Chatbot] Villa query result:', { count: villas?.length ?? 0, error: error?.message });

  if (error) {
    console.error('[Chatbot] Villa search error:', error.message);
    return [];
  }

  return (villas || []).map(v => {
    const titleKey = `titre_${locale}` as keyof typeof v;
    const title = (v[titleKey] as string) || v.titre_fr || v.titre || 'Propriété';
    let images: string[] = [];
    try {
      images = Array.isArray(v.images) ? v.images : JSON.parse(v.images || '[]');
    } catch { images = []; }

    return {
      id: v.id,
      title,
      price: Number(v.price) || 0,
      town: v.town || '',
      beds: parseInt(String(v.beds)) || 0,
      pool: v.pool === 'Oui' || v.pool === true,
      image: images[0] || '/hero_network.jpg',
    };
  });
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
      console.error('[Chatbot] OpenAI error:', err);
      return NextResponse.json({ error: 'OpenAI API error', detail: err }, { status: 500 });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // Recherche de biens si critères disponibles
    let properties: any[] = [];
    if (agencyId) {
      const criteria = extractSearchCriteria(content);
      if (criteria && (criteria.budget_max || criteria.town || criteria.beds)) {
        console.log('[Chatbot] Search criteria found:', criteria);
        properties = await searchVillas(criteria, agencyId, locale || 'fr');
        console.log('[Chatbot] Properties found:', properties.length);
      }
    }

    return NextResponse.json({ content, properties });
  } catch (err: any) {
    console.error('[Chatbot] Unexpected error:', err.message);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
