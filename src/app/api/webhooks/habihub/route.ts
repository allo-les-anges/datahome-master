import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📨 Webhook reçu:", body);
    
    // HabiHub envoie agent_id et xml_url selon leur documentation
    const { agent_id, xml_url, email } = body;
    
    if (!agent_id && !email) {
      return NextResponse.json({ error: "agent_id ou email requis" }, { status: 400 });
    }
    
    // Rechercher l'agence par agent_id ou par email
    let query = supabaseAdmin.from("agency_settings").select("*");
    
    if (agent_id) {
      query = query.eq("habihub_agent_id", agent_id);
    } else if (email) {
      query = query.eq("email", email);
    }
    
    const { data: agency, error: agencyError } = await query.maybeSingle();
    
    if (agencyError || !agency) {
      console.error("Agence non trouvée pour:", { agent_id, email });
      return NextResponse.json({ error: "Agence inconnue" }, { status: 404 });
    }
    
    console.log(`✅ Agence trouvée: ${agency.agency_name} (${agency.id})`);
    
    // Lancer la synchronisation en arrière-plan (sans attendre)
    // On utilise fetch avec un timeout court pour ne pas bloquer le webhook
    const syncUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://datahome.vercel.app'}/api/sync-villas`;
    
    // Ne pas attendre la fin de la synchro pour répondre rapidement
    fetch(syncUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        agencyId: agency.id,
        xmlUrl: xml_url,
        agentId: agent_id
      }),
    }).catch(err => console.error("Erreur lancement synchro:", err));
    
    // Réponse immédiate
    return NextResponse.json({ 
      success: true, 
      message: "Synchronisation lancée",
      agency: agency.agency_name
    });
    
  } catch (error) {
    console.error("Erreur webhook:", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

// Endpoint GET pour tester
export async function GET() {
  return NextResponse.json({ 
    status: "Webhook HabiHub actif",
    endpoints: {
      post: "POST /api/webhooks/habihub - Reçoit les notifications",
      test: "GET /api/webhooks/habihub - Test de connexion"
    }
  });
}