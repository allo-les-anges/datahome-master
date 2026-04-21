import { supabase } from '@/lib/supabase';
import AgencyPageClient from "@/app/AgencyPageClient";
import { notFound } from 'next/navigation';

// ISR : régénère la page au plus toutes les 60s, sert depuis le cache entre-temps
export const revalidate = 60;

export default async function DynamicAgencyPage({
  params
}: {
  params: Promise<{ slug: string, locale: string }>
}) {
  const { slug } = await params;

  const { data: agencies, error: agencyError } = await supabase
    .from('agency_settings')
    .select('*')
    .eq('subdomain', slug);

  const agency = agencies && agencies.length > 0 ? agencies[0] : null;

  if (agencyError || !agency) {
    return notFound();
  }

  // Site désactivé depuis le dashboard admin
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

  // Récupération des flux XML autorisés depuis la config de l'agence
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
    xml_source
  `;

  // Deux requêtes parallèles : par agency_id ET par xml_source (union)
  // Couvre tous les cas : biens assignés directement + biens importés via flux XML
  const byAgencyQuery = supabase
    .from('villas')
    .select(selectColumns)
    .eq('agency_id', agency.id)
    .or('is_excluded.eq.false,is_excluded.is.null')
    .limit(10000);

  const byXmlQuery = xmlUrls.length > 0
    ? supabase
        .from('villas')
        .select(selectColumns)
        .in('xml_source', xmlUrls)
        .or('is_excluded.eq.false,is_excluded.is.null')
        .limit(10000)
    : Promise.resolve({ data: [] as any[] });

  const [{ data: byAgency }, { data: byXml }] = await Promise.all([byAgencyQuery, byXmlQuery]);

  // Fusion et déduplication par id
  const seen = new Set<number>();
  const villas = [...(byAgency || []), ...(byXml || [])].filter(v => {
    if (seen.has(v.id)) return false;
    seen.add(v.id);
    return true;
  });

  return (
    <AgencyPageClient
      slug={slug}
      initialAgency={agency}
      initialProperties={villas || []}
    />
  );
}
