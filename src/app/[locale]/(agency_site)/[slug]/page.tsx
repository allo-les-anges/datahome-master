import { supabase } from '@/lib/supabase';
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
  const { data: agencies, error: agencyError } = await supabase
    .from('agency_settings')
    .select('*')
    .eq('subdomain', slug);

  const agency = agencies && agencies.length > 0 ? agencies[0] : null;

  if (agencyError || !agency) {
    console.error("[SUPABASE ERROR - AGENCY]", agencyError);
    return notFound();
  }

  // 2. Récupération des villas filtrées par l'ID de l'agence
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
    .eq('agency_id', agency.id)
    .eq('is_excluded', false)
    .order('prix', { ascending: false });

  if (villasError) {
    console.error("[SUPABASE ERROR - VILLAS]", villasError);
  }

  // 3. Rendu du composant Client
  return (
    <AgencyPageClient 
      slug={slug} 
      initialAgency={agency} 
      initialProperties={villas || []} 
    />
  );
}