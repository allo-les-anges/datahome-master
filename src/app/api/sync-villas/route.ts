import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { parseStringPromise } from "xml2js"; // Tu devras peut-être faire : npm install xml2js

const supabaseAdmin = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);

export async function POST(req: Request) {
  const { agencyId, xmlUrl } = await req.json();

  try {
    // 1. Télécharger le XML
    const response = await fetch(xmlUrl);
    const xmlText = await response.text();
    
    // 2. Parser le XML en objet JavaScript
    const result = await parseStringPromise(xmlText);
    const properties = result. ads.ad; // Structure typique des flux Habihub

    // 3. Préparer les données pour Supabase
    const villasToInsert = properties.map((p: any) => ({
      id_externe: p.id[0],
      titre: p.title[0],
      prix: p.price[0],
      agency_id: agencyId, // L'ÉTIQUETTE !
      xml_source: xmlUrl,
      // Ajoute ici les autres champs (images, description...)
    }));

    // 4. Nettoyer les anciennes villas de cette agence et insérer les nouvelles
    // Option simple : on supprime et on remplace
    await supabaseAdmin.from("villas").delete().eq("agency_id", agencyId);
    const { error } = await supabaseAdmin.from("villas").insert(villasToInsert);

    if (error) throw error;

    return NextResponse.json({ success: true, count: villasToInsert.length });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}