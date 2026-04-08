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
}import { supabase } from '@/lib/supabase';
import AgencyPageClient from "@/app/AgencyPageClient";
import { notFound } from 'next/navigation';

// Forcer le mode dynamique pour bypasser le cache et garantir les données fraîches
export const dynamic = 'force-dynamic';

export default async function DynamicAgencyPage({ 
  params 
}: { 
  params: Promise<{ slug: string, locale: string }> 
}) {
  const { slug } = await params;

  // 1. Récupération de l'agence (Table: agency_settings)
  // On identifie l'agence par son sous-domaine (slug)
  const { data: agencies, error: agencyError } = await supabase
    .from('agency_settings')
    .select('*')
    .eq('subdomain', slug);

  const agency = agencies && agencies.length > 0 ? agencies[0] : null;

  if (agencyError || !agency) {
    console.error("[SUPABASE ERROR - AGENCY]", agencyError);
    return notFound();
  }

  // 2. Récupération des villas filtrées par AGENCY_ID
  // On utilise agency.id pour ne récupérer que les biens appartenant à ce client.
  // On sélectionne les noms de colonnes exacts de ta table (titre, prix, town, etc.)
  const { data: villas, error: villasError } = await supabase
    .from('villas')
    .select(`
      id, 
      id_externe, 
      titre, 
      prix, 
      town, 
      region, 
      images, 
      beds, 
      baths, 
      surface_built, 
      surface_plot, 
      type, 
      pool, 
      is_excluded, 
      agency_id
    `)
    .eq('agency_id', agency.id) // Filtrage SaaS : Étanchéité garantie
    .eq('is_excluded', false)   // On ignore les biens masqués manuellement
    .order('prix', { ascending: false });

  if (villasError) {
    console.error("[SUPABASE ERROR - VILLAS]", villasError);
  }

  // 3. Rendu du composant Client
  // On envoie les données à AgencyPageClient qui gère l'affichage (Grid, Filtres, etc.)
  return (
    <AgencyPageClient 
      slug={slug} 
      initialAgency={agency} 
      initialProperties={villas || []} 
    />
  );
}