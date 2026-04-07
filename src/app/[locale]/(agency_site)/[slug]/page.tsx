import { supabase } from '@/lib/supabase';
import AgencyPageClient from "@/app/AgencyPageClient";
import { notFound } from 'next/navigation';

// Forcer le mode dynamique pour bypasser le cache
export const dynamic = 'force-dynamic';

export default async function DynamicAgencyPage({ 
  params 
}: { 
  params: Promise<{ slug: string, locale: string }> 
}) {
  const { slug } = await params;

  // 1. Récupération de l'agence (Table: agency_settings)
  // On ne récupère que ce qui est nécessaire pour l'affichage initial pour gagner en vitesse
  const { data: agencies, error: agencyError } = await supabase
    .from('agency_settings')
    .select('*')
    .eq('subdomain', slug);

  const agency = agencies && agencies.length > 0 ? agencies[0] : null;

  if (agencyError || !agency) {
    console.error("[SUPABASE ERROR]", agencyError);
    return notFound();
  }

  // 2. Extraction des URLs XML autorisées
  let allowedXmlUrls: string[] = [];
  if (agency.footer_config) {
    try {
      const parsed = typeof agency.footer_config === 'string' 
        ? JSON.parse(agency.footer_config) 
        : agency.footer_config;
      allowedXmlUrls = parsed?.xml_urls || [];
    } catch (e) {
      console.error("Erreur parsing footer_config");
    }
  }

  // 3. Récupération des villas optimisée
  // On sélectionne les champs essentiels pour réduire le temps de transfert (payload)
  let query = supabase
    .from('villas')
    .select('id, title, price, location, images, bedrooms, bathrooms, area, type, xml_source, is_excluded')
    .eq('is_excluded', false);
  
  // N'appliquer le filtre XML QUE s'il y a des URLs définies
  // Si la liste est vide, on affiche tout pour éviter le "noResults"
  if (allowedXmlUrls && allowedXmlUrls.length > 0) {
    query = query.in('xml_source', allowedXmlUrls);
  }

  const { data: villas, error: villasError } = await query.order('price', { ascending: false });

  if (villasError) {
    console.error("[VILLAS ERROR]", villasError);
  }

  // 4. Rendu du composant Client
  return (
    <AgencyPageClient 
      slug={slug} 
      initialAgency={agency} 
      initialProperties={villas || []} 
    />
  );
}