import { supabase } from '@/lib/supabase';
import AgencyPageClient from "@/app/AgencyPageClient";
import { notFound } from 'next/navigation';

// ISR : rÃ©gÃ©nÃ¨re la page au plus toutes les 60s, sert depuis le cache entre-temps
export const revalidate = 60;
const INITIAL_PROPERTIES_LIMIT = 24;

export default async function DynamicAgencyPage({
  params
}: {
  params: Promise<{ slug: string, locale: string }>
}) {
  const { slug, locale } = await params;

  const { data: agencies, error: agencyError } = await supabase
    .from('agency_settings')
    .select('*')
    .eq('subdomain', slug);

  const agency = agencies && agencies.length > 0 ? agencies[0] : null;

  if (agencyError || !agency) {
    return notFound();
  }

  // Site dÃ©sactivÃ© depuis le dashboard admin
  const subscription = agency.footer_config?.subscription;
  if (subscription?.website_active === false) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-6">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-white font-bold text-2xl shadow-inner"
          style={{ backgroundColor: agency.primary_color || '#0f172a' }}>
          {agency.agency_name?.charAt(0)}
        </div>
        <h1 className="text-2xl font-serif italic text-slate-900 mb-2">{agency.agency_name}</h1>
        <p className="text-[11px] uppercase tracking-widest font-bold text-slate-400 mb-8">Site en cours d'activation</p>
        <div className="w-24 h-[1px] bg-slate-200" />
      </div>
    );
  }

  // RÃ©cupÃ©ration des flux XML autorisÃ©s depuis la config de l'agence
  let xmlUrls: string[] = [];
  try {
    const config = typeof agency.footer_config === 'string'
      ? JSON.parse(agency.footer_config)
      : agency.footer_config;
    xmlUrls = config?.xml_urls || [];
  } catch (e) { /* ignore */ }

  const selectColumns = `
    id,
    id_externe,
    ref,
    titre,
    titre_fr,
    titre_en,
    titre_es,
    titre_nl,
    titre_pl,
    titre_ar,
    prix,
    price,
    town,
    ville,
    region,
    province,
    images,
    beds,
    baths,
    surface_built,
    built,
    surface_plot,
    plot,
    type,
    pool,
    is_excluded,
    agency_id,
    development_name,
    promoteur_name,
    latitude,
    longitude,
    adresse,
    distance_beach,
    distance_golf,
    distance_town,
    currency,
    commission_percentage,
    xml_source,
    description,
    description_fr,
    description_en,
    description_es,
    description_nl,
    description_pl,
    description_ar,
    listing_type,
    rental_period
  `;

  // Deux requÃªtes parallÃ¨les : par agency_id ET par xml_source (union)
  // Couvre tous les cas : biens assignÃ©s directement + biens importÃ©s via flux XML
  const byAgencyQuery = supabase
    .from('villas')
    .select('*')
    .eq('agency_id', agency.id)
    .or('is_excluded.eq.false,is_excluded.is.null')
    .order('price', { ascending: true })
    .limit(INITIAL_PROPERTIES_LIMIT);

  const byXmlQuery = xmlUrls.length > 0
    ? supabase
        .from('villas')
        .select('*')
        .in('xml_source', xmlUrls)
        .or('is_excluded.eq.false,is_excluded.is.null')
        .order('price', { ascending: true })
        .limit(INITIAL_PROPERTIES_LIMIT)
    : Promise.resolve({ data: [] as any[] });

  const [{ data: byAgency }, { data: byXml }] = await Promise.all([byAgencyQuery, byXmlQuery]);

  // Fusion et dÃ©duplication par id
  const seen = new Set<string>();
  const villas = [...(byAgency || []), ...(byXml || [])].filter(v => {
    if (v.listing_type === 'rent') return false;
    const id = String(v.id);
    if (seen.has(id)) return false;
    seen.add(id);
    return true;
  });

  const [{ count: agencyCount }, { count: xmlCount }] = await Promise.all([
    supabase.from('villas').select('*', { count: 'exact', head: true })
      .eq('agency_id', agency.id).or('is_excluded.eq.false,is_excluded.is.null'),
    xmlUrls.length > 0
      ? supabase.from('villas').select('*', { count: 'exact', head: true })
          .in('xml_source', xmlUrls).or('is_excluded.eq.false,is_excluded.is.null')
      : Promise.resolve({ count: 0 }),
  ]);
  const totalCount = (agencyCount || 0) + (xmlCount || 0);

  return (
    <AgencyPageClient
      slug={slug}
      routeLocale={locale}
      initialAgency={agency}
      initialProperties={villas || []}
      initialPropertyTotal={totalCount}
      listingType="sale"
    />
  );
}


