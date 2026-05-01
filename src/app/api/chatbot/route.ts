import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const DEFAULT_DAILY_LIMIT = 20;
const memoryUsage = new Map<string, { count: number; resetAt: number }>();

interface SearchCriteria {
  budget_max?: number;
  town?: string;
  beds?: number;
}

async function getChatbotLimit(agencyId: string): Promise<number> {
  const { data } = await supabase
    .from('agency_settings')
    .select('footer_config')
    .eq('id', agencyId)
    .maybeSingle();

  let footerConfig = data?.footer_config;
  if (typeof footerConfig === 'string') {
    try {
      footerConfig = JSON.parse(footerConfig);
    } catch {
      footerConfig = {};
    }
  }

  return Number(footerConfig?.integrations?.chatbot_daily_limit || DEFAULT_DAILY_LIMIT);
}

function memoryLimitFallback(agencyId: string, limit: number) {
  const day = new Date().toISOString().slice(0, 10);
  const key = `${agencyId}:${day}`;
  const resetAt = new Date(`${day}T23:59:59.999Z`).getTime();
  const current = memoryUsage.get(key);

  if (!current || Date.now() > current.resetAt) {
    memoryUsage.set(key, { count: 1, resetAt });
    return { allowed: true, remaining: Math.max(limit - 1, 0), limit };
  }

  if (current.count >= limit) {
    return { allowed: false, remaining: 0, limit };
  }

  current.count += 1;
  memoryUsage.set(key, current);
  return { allowed: true, remaining: Math.max(limit - current.count, 0), limit };
}

async function enforceChatbotDailyLimit(agencyId?: string) {
  if (!agencyId) return { allowed: true, remaining: DEFAULT_DAILY_LIMIT, limit: DEFAULT_DAILY_LIMIT };

  const limit = await getChatbotLimit(agencyId);
  const usageDate = new Date().toISOString().slice(0, 10);

  try {
    const { data, error } = await supabase
      .from('chatbot_daily_usage')
      .select('usage_count')
      .eq('agency_id', agencyId)
      .eq('usage_date', usageDate)
      .maybeSingle();

    if (error) throw error;

    const currentCount = Number(data?.usage_count || 0);
    if (currentCount >= limit) {
      return { allowed: false, remaining: 0, limit };
    }

    const nextCount = currentCount + 1;
    const { error: upsertError } = await supabase
      .from('chatbot_daily_usage')
      .upsert({
        agency_id: agencyId,
        usage_date: usageDate,
        usage_count: nextCount,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'agency_id,usage_date' });

    if (upsertError) throw upsertError;
    return { allowed: true, remaining: Math.max(limit - nextCount, 0), limit };
  } catch {
    return memoryLimitFallback(agencyId, limit);
  }
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

    const usage = await enforceChatbotDailyLimit(agencyId);
    if (!usage.allowed) {
      return NextResponse.json({
        error: 'Limite quotidienne du chatbot atteinte',
        limit: usage.limit,
        remaining: 0,
      }, { status: 429 });
    }

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

    return NextResponse.json({ content, properties, remaining: usage.remaining, limit: usage.limit });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
