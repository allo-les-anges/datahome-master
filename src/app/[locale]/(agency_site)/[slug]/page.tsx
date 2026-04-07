import { supabase } from '@/lib/supabase';
import AgencyPageClient from "@/app/AgencyPageClient";
import { notFound } from 'next/navigation';

// On force le mode dynamique pour bypasser tout cache Vercel pendant le debug
export const dynamic = 'force-dynamic';

export default async function DynamicAgencyPage({ 
  params 
}: { 
  params: Promise<{ slug: string, locale: string }> 
}) {
  // 1. On attend la résolution des paramètres
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  // 2. Requête Supabase sur la table correcte : 'agency_settings'
  // On utilise .select() pour vérifier l'existence sans planter sur une erreur 406
  const { data: agencies, error: agencyError } = await supabase
    .from('agency_settings')
    .select('*')
    .eq('subdomain', slug);

  const agency = agencies && agencies.length > 0 ? agencies[0] : null;

  // LOGS SERVEUR - Visibles dans le dashboard Vercel
  console.log(`[ROUTE CHECK] Slug reçu: ${slug}`);
  if (agencyError) console.error("[SUPABASE ERROR]", agencyError);

  // 3. Si l'agence n'est pas trouvée dans agency_settings, on renvoie une 404
  if (!agency) {
    console.log(`[NOT FOUND] Aucune agence trouvée dans agency_settings pour le slug: ${slug}`);
    return notFound();
  }

  // 4. Extraction sécurisée de la configuration XML pour filtrer les propriétés
  let allowedXmlUrls: string[] = [];
  if (agency.footer_config) {
    try {
      const parsed = typeof agency.footer_config === 'string' 
        ? JSON.parse(agency.footer_config) 
        : agency.footer_config;
      allowedXmlUrls = parsed?.xml_urls || [];
    } catch (e) {
      console.error("Erreur lors du parsing de footer_config pour l'agence:", slug);
    }
  }

  // 5. Récupération des villas correspondantes
  let query = supabase.from('villas').select('*').eq('is_excluded', false);
  
  // Filtrage par source XML si défini dans la configuration de l'agence
  if (allowedXmlUrls.length > 0) {
    query = query.in('xml_source', allowedXmlUrls);
  }

  const { data: villas } = await query.order('price', { ascending: false });

  // 6. Rendu du composant Client avec les données initiales
  return (
    <AgencyPageClient 
      slug={slug} 
      initialAgency={agency} 
      initialProperties={villas || []} 
    />
  );
}