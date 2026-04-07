import { supabase } from '@/lib/supabase';
import AgencyPageClient from "@/app/AgencyPageClient";
import { notFound } from 'next/navigation';

// On force le rendu dynamique pour garantir que les données Supabase sont fraîches
export const dynamic = 'force-dynamic'; 
// Revalidation ISR toutes les 10 minutes
export const revalidate = 600; 

export default async function DynamicAgencyPage({ 
  params 
}: { 
  params: Promise<{ slug: string, locale: string }> 
}) {
  // 1. Extraction des paramètres de l'URL
  const { slug, locale } = await params;

  // 2. Récupération de l'agence dans Supabase
  // On cherche une correspondance dans la colonne 'subdomain' (car c'est celle qui contient 'schmidt-privilege')
  const { data: agency, error: agencyError } = await supabase
    .from('agencies')
    .select('*')
    .eq('subdomain', slug)
    .single();

  // Si l'agence n'existe pas, on renvoie la 404 de Next.js
  if (agencyError || !agency) {
    console.error(`[DEBUG] Agence introuvable pour le subdomain: ${slug}`);
    return notFound();
  }

  // 3. Extraction sécurisée de la configuration du footer (XML URLs)
  let allowedXmlUrls: string[] = [];
  if (agency.footer_config) {
    try {
      const parsed = typeof agency.footer_config === 'string' 
        ? JSON.parse(agency.footer_config) 
        : agency.footer_config;
      allowedXmlUrls = parsed?.xml_urls || [];
    } catch (e) {
      console.warn("Erreur de parsing footer_config pour l'agence:", slug);
    }
  }

  // 4. Récupération des propriétés (Villas) liées à cette agence
  // On filtre par les URLs XML autorisées trouvées dans footer_config
  let query = supabase
    .from('villas')
    .select('*')
    .eq('is_excluded', false);

  if (allowedXmlUrls.length > 0) {
    query = query.in('xml_source', allowedXmlUrls);
  }

  const { data: villas } = await query.order('price', { ascending: false });

  // 5. Envoi des données au composant Client (AgencyPageClient)
  // On injecte directement les données pour éviter tout chargement côté client
  return (
    <AgencyPageClient 
      slug={slug} 
      initialAgency={agency} 
      initialProperties={villas || []} 
    />
  );
}