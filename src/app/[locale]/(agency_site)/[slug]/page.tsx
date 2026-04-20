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

  console.log("🔍 [SSR] Début - slug:", slug);

  // 1. Récupération de l'agence (Table: agency_settings)
  const { data: agencies, error: agencyError } = await supabase
    .from('agency_settings')
    .select('*')
    .eq('subdomain', slug);

  const agency = agencies && agencies.length > 0 ? agencies[0] : null;

  if (agencyError || !agency) {
    console.error("[SSR] ❌ Agence non trouvée:", agencyError);
    return notFound();
  }

  console.log("🔍 [SSR] ✅ Agence trouvée:", agency.agency_name, "ID:", agency.id);

  // 2. Récupération des villas avec TOUS les champs de description
  console.log("🔍 [SSR] Chargement des propriétés pour agency_id:", agency.id);
  
  const { data: villas, error: villasError } = await supabase
    .from('villas')
    .select(`
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
      description,
      description_fr,
      description_en,
      description_es,
      description_nl,
      description_pl,
      description_ar,
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
    `)
    .eq('agency_id', agency.id)
    .eq('is_excluded', false)
    .order('prix', { ascending: false });

  if (villasError) {
    console.error("[SSR] ❌ Erreur chargement villas:", villasError);
  }

  console.log(`📦 [SSR] ${villas?.length || 0} propriétés chargées`);
  
  if (villas && villas.length > 0) {
    const firstVilla = villas[0];
    console.log("📦 [SSR] Première propriété - ID:", firstVilla.id);
    console.log("📦 [SSR] Première propriété - titre:", firstVilla.titre);
    console.log("📦 [SSR] Première propriété - a description_fr:", !!firstVilla.description_fr);
    console.log("📦 [SSR] Première propriété - description_fr (100 premiers chars):", firstVilla.description_fr?.substring(0, 100));
    console.log("📦 [SSR] Première propriété - a description_es:", !!firstVilla.description_es);
    console.log("📦 [SSR] Première propriété - clés disponibles:", Object.keys(firstVilla).filter(k => k.includes('description')));
  } else {
    console.log("📦 [SSR] ⚠️ Aucune propriété trouvée");
  }

  // 3. Rendu du composant Client
  console.log("🔍 [SSR] Rendu du AgencyPageClient");
  
  return (
    <AgencyPageClient 
      slug={slug} 
      initialAgency={agency} 
      initialProperties={villas || []} 
    />
  );
}