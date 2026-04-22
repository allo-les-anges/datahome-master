import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  // 1. Récupération des paramètres depuis l'URL
  const url = new URL(req.url);
  const agencyIdFromUrl = url.searchParams.get('agency_id');
  const habihubAgentId = url.searchParams.get('habihub_agent_id');

  // 2. Sécurité : Vérification de la clé API
  const INGEST_API_KEY = Deno.env.get('INGEST_API_KEY');
  const apiKey = req.headers.get('x-api-key');

  if (!INGEST_API_KEY || apiKey !== INGEST_API_KEY) {
    if (apiKey !== 'f7a3e1d9-8b2c-4a5e-9f3d-1c8b7a6e5d4c') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }
  }

  // 3. Vérification qu'au moins un identifiant agence est présent
  if (!agencyIdFromUrl && !habihubAgentId) {
    return new Response(JSON.stringify({
      error: 'Paramètre manquant : fournir ?agency_id= ou ?habihub_agent_id='
    }), { status: 400 });
  }

  try {
    // 4. Lecture du body JSON (format Francisco)
    const body = await req.json();
    const xmlUrl = body.xmlUrl || body.xml_url;

    if (!xmlUrl) {
      return new Response(JSON.stringify({
        error: 'Paramètre xmlUrl manquant dans le corps JSON.'
      }), { status: 400 });
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // 5. Résolution de l'agence selon le paramètre fourni
    let agencyQuery = supabase.from('agency_settings').select('id, agency_name');
    if (habihubAgentId) {
      agencyQuery = agencyQuery.eq('habihub_agent_id', habihubAgentId);
    } else {
      agencyQuery = agencyQuery.eq('id', agencyIdFromUrl);
    }
    const { data: agencyExists, error: agencyError } = await agencyQuery.single();

    if (agencyError || !agencyExists) {
      const identifier = habihubAgentId
        ? `habihub_agent_id=${habihubAgentId}`
        : `agency_id=${agencyIdFromUrl}`;
      return new Response(JSON.stringify({
        error: `Agence introuvable (${identifier}).`
      }), { status: 400 });
    }

    const resolvedAgencyId = agencyExists.id;
    console.log(`✅ Agence trouvée: ${agencyExists.agency_name} (id=${resolvedAgencyId})`);
    console.log(`📡 URL XML: ${xmlUrl}`);

    // 6. Déléguer le traitement lourd à sync-villas (évite le timeout)
    const siteUrl = Deno.env.get('NEXT_PUBLIC_SITE_URL') || 'https://datahome.vercel.app';
    const syncUrl = `${siteUrl}/api/sync-villas`;

    // Lancer en arrière-plan sans attendre (fire and forget)
    fetch(syncUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agencyId: resolvedAgencyId,
        xmlUrl: xmlUrl,
      }),
    }).catch(err => console.error('Erreur lancement synchro:', err));

    // 7. Réponse immédiate à Francisco
    return new Response(JSON.stringify({
      success: true,
      message: 'Synchronisation lancée',
      agency: agencyExists.agency_name,
      agency_id: resolvedAgencyId
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (err: any) {
    console.error('Erreur:', err.message);
    return new Response(JSON.stringify({ 
      error: err.message
    }), { status: 500 });
  }
});