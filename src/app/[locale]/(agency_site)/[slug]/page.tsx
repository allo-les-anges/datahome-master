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
  // 1. On attend les paramètres
  const resolvedParams = await params;
  const slug = resolvedParams.slug;

  // 2. Requête Supabase optimisée sur la colonne 'subdomain'
  // On récupère une liste (.select) plutôt que .single() pour éviter les erreurs 406/404 silencieuses
  const { data: agencies, error: agencyError } = await supabase
    .from('agencies')
    .select('*')
    .eq('subdomain', slug);

  const agency = agencies && agencies.length > 0 ? agencies[0] : null;

  // LOGS SERVEUR - À vérifier dans ton dashboard Vercel > Logs
  console.log(`[ROUTE CHECK] Slug reçu: ${slug}`);
  if (agencyError) console.error("[SUPABASE ERROR]", agencyError);

  // 3. Si l'agence n'est pas trouvée, on sort ici
  if (!agency) {
    console.log(`[NOT FOUND] Aucune agence avec le subdomain: ${slug}`);
    return notFound();
  }

  // 4. Extraction de la configuration XML pour les propriétés
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

  // 5. Récupération des villas
  let query = supabase.from('villas').select('*').eq('is_excluded', false);
  
  if (allowedXmlUrls.length > 0) {
    query = query.in('xml_source', allowedXmlUrls);
  }

  const { data: villas } = await query.order('price', { ascending: false });

  // 6. Rendu du composant Client
  return (
    <AgencyPageClient 
      slug={slug} 
      initialAgency={agency} 
      initialProperties={villas || []} 
    />
  );
}