import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// On utilise la clé SERVICE_ROLE pour avoir le droit d'écrire dans la base
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { agent_id, xml_url } = body;

    console.log(`Notification reçue pour l'agent : ${agent_id}`);

    // 1. Trouver quelle agence correspond à cet agent_id
    const { data: agency, error: agencyError } = await supabaseAdmin
      .from("agency_settings")
      .select("id")
      .eq("habihub_agent_id", agent_id)
      .single();

    if (agencyError || !agency) {
      return NextResponse.json({ error: "Agence inconnue" }, { status: 404 });
    }

    // 2. Déclencher la synchronisation
    // On appelle notre propre API de synchro en lui passant l'URL et l'ID d'agence
    const syncResponse = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/sync-villas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        agencyId: agency.id, 
        xmlUrl: xml_url 
      }),
    });

    return NextResponse.json({ success: true, message: "Synchro lancée" });
  } catch (error) {
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}