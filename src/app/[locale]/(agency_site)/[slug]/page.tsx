import { supabase } from '@/lib/supabase';
import AgencyPageClient from "@/app/AgencyPageClient";
import { notFound } from 'next/navigation';

// La page sera régénérée en arrière-plan toutes les 10 minutes (ISR)
export const revalidate = 600; 

export default async function DynamicAgencyPage({ 
  params 
}: { 
  params: Promise<{ slug: string, locale: string }> 
}) {
  // On attend la résolution des paramètres (Next.js 15+)
  const { slug, locale } = await params;

  // 1. Récupération de l'agence côté serveur
  const { data: agency, error: agencyError } = await supabase
    .from('agencies')
    .select('*')
    .or(`slug.eq.${slug},subdomain.eq.${slug}`)
    .single();

  if (agencyError || !agency) {
    return notFound();
  }

  // 2. Extraction des URLs XML autorisées depuis la config
  let allowedXmlUrls: string[] = [];
  if (agency.footer_config) {
    try {
      const parsed = typeof agency.footer_config === 'string' 
        ? JSON.parse(agency.footer_config) 
        : agency.footer_config;
      allowedXmlUrls = parsed?.xml_urls || [];
    } catch (e) {
      console.error("Erreur parsing footer_config serveur:", e);
    }
  }

  // 3. Récupération des propriétés côté serveur
  let query = supabase.from('villas').select('*').eq('is_excluded', false);
  if (allowedXmlUrls.length > 0) {
    query = query.in('xml_source', allowedXmlUrls);
  }

  // On limite à une certaine quantité pour booster la vitesse, ou on prend tout si nécessaire
  const { data: villas } = await query.order('price', { ascending: false });

  // 4. On envoie tout au composant Client
  return (
    <AgencyPageClient 
      slug={slug} 
      initialAgency={agency} 
      initialProperties={villas || []} 
    />
  );
}