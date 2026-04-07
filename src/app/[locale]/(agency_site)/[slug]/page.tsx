import { supabase } from '@/lib/supabase';
import AgencyPageClient from "@/app/AgencyPageClient";
import { notFound } from 'next/navigation';

// Permet de générer les pages à la volée si elles ne sont pas connues au build
export const dynamicParams = true; 

// La page sera mise à jour en arrière-plan (ISR)
export const revalidate = 600; 

export default async function DynamicAgencyPage({ 
  params 
}: { 
  params: Promise<{ slug: string, locale: string }> 
}) {
  // 1. Résolution des paramètres (Obligatoire Next.js 15)
  const resolvedParams = await params;
  const slug = resolvedParams.slug;
  const locale = resolvedParams.locale;

  // 2. Récupération de l'agence
  // On cherche par slug OU par subdomain
  const { data: agency, error: agencyError } = await supabase
    .from('agencies')
    .select('*')
    .or(`slug.eq."${slug}",subdomain.eq."${slug}"`) // Ajout de guillemets pour sécuriser la requête
    .single();

  // Si l'agence n'existe pas, on affiche la 404 proprement
  if (agencyError || !agency) {
    console.error("Agence introuvable pour le slug:", slug);
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

  if (allowedXmlUrls.length > 0) {
    query = query.in('xml_source', allowedXmlUrls);
  }

  const { data: villas } = await query.order('price', { ascending: false });

  // 5. Rendu
  return (
    <AgencyPageClient 
      slug={slug} 
      initialAgency={agency} 
      initialProperties={villas || []} 
    />
  );
}