import { supabase } from '@/lib/supabase';
import AgencyPageClient from "@/app/AgencyPageClient";
import { notFound } from 'next/navigation';

// Forcer le rendu dynamique pour éviter que Vercel ne fige une erreur 404 au build
export const dynamic = 'force-dynamic';
// La page sera mise à jour en arrière-plan toutes les 10 minutes (ISR)
export const revalidate = 600; 

export default async function DynamicAgencyPage({ 
  params 
}: { 
  params: Promise<{ slug: string, locale: string }> 
}) {
  // 1. Résolution des paramètres (Obligatoire Next.js 15+)
  const { slug, locale } = await params;

  // 2. Récupération de l'agence
  // Utilisation de .ilike pour ignorer la casse et suppression des guillemets complexes
  const { data: agency, error: agencyError } = await supabase
    .from('agencies')
    .select('*')
    .or(`slug.ilike.${slug},subdomain.ilike.${slug}`)
    .single();

  // Si l'agence n'existe pas ou erreur Supabase, on déclenche la 404
  if (agencyError || !agency) {
    console.error("DEBUG - Agence introuvable ou erreur:", { slug, agencyError });
    return notFound();
  }

  // 3. Extraction de la configuration XML
  let allowedXmlUrls: string[] = [];
  if (agency.footer_config) {
    try {
      const parsed = typeof agency.footer_config === 'string' 
        ? JSON.parse(agency.footer_config) 
        : agency.footer_config;
      allowedXmlUrls = parsed?.xml_urls || [];
    } catch (e) {
      console.warn("Format footer_config invalide pour:", slug);
    }
  }

  // 4. Récupération des propriétés
  let query = supabase
    .from('villas')
    .select('*')
    .eq('is_excluded', false);

  // Filtrage par source XML si défini dans l'agence
  if (allowedXmlUrls.length > 0) {
    query = query.in('xml_source', allowedXmlUrls);
  }

  const { data: villas, error: villasError } = await query.order('price', { ascending: false });

  if (villasError) {
    console.error("Erreur récupération villas:", villasError);
  }

  // 5. Rendu du composant client avec les données injectées (zéro attente pour l'utilisateur)
  return (
    <AgencyPageClient 
      slug={slug} 
      initialAgency={agency} 
      initialProperties={villas || []} 
    />
  );
}