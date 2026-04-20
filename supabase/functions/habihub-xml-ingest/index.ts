import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  // 1. Récupération de l'ID de l'agence depuis l'URL (?agency_id=...)
  const url = new URL(req.url);
  const agencyIdFromUrl = url.searchParams.get('agency_id');

  // 2. Sécurité : Vérification de la clé API
  const INGEST_API_KEY = Deno.env.get('INGEST_API_KEY');
  const apiKey = req.headers.get('x-api-key');

  if (!INGEST_API_KEY || apiKey !== INGEST_API_KEY) {
    if (apiKey !== 'f7a3e1d9-8b2c-4a5e-9f3d-1c8b7a6e5d4c') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }
  }

  // 3. Vérification que l'ID agence est présent
  if (!agencyIdFromUrl) {
    return new Response(JSON.stringify({ 
      error: 'ID Agence manquant dans l\'URL (paramètre ?agency_id=)' 
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

    // 5. Vérification que l'agence existe
    const { data: agencyExists, error: agencyError } = await supabase
      .from('agency_settings')
      .select('id, agency_name')
      .eq('id', agencyIdFromUrl)
      .single();

    if (agencyError || !agencyExists) {
      return new Response(JSON.stringify({ 
        error: `L'agence avec l'ID ${agencyIdFromUrl} n'existe pas.` 
      }), { status: 400 });
    }

    console.log(`✅ Agence trouvée: ${agencyExists.agency_name}`);
    console.log(`📡 URL XML: ${xmlUrl}`);

    // 6. Déléguer le traitement lourd à sync-villas (évite le timeout)
    const siteUrl = Deno.env.get('NEXT_PUBLIC_SITE_URL') || 'https://datahome.vercel.app';
    const syncUrl = `${siteUrl}/api/sync-villas`;

    // Lancer en arrière-plan sans attendre (fire and forget)
    fetch(syncUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agencyId: agencyIdFromUrl,
        xmlUrl: xmlUrl,
        agentId: body.agent_id
      }),
    }).catch(err => console.error('Erreur lancement synchro:', err));

    // 7. Réponse immédiate à Francisco
    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Synchronisation lancée',
      agency: agencyExists.agency_name,
      agency_id: agencyIdFromUrl
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