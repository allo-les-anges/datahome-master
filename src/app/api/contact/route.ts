import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Support des données envoyées par le formulaire
    const { name, email, message, property_ref } = body;

    console.log("📨 Réception formulaire:", { name, email, property_ref });

    // Validation
    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: "Champs manquants" },
        { status: 400 }
      );
    }

    // Envoi vers Zoho CRM
    const zohoResponse = await fetch("https://crm.zoho.eu/crm/WebToLeadForm", {
      method: "POST",
      body: new URLSearchParams({
        'xnpe_force': '1',
        'Last Name': name,
        'Email': email,
        'Description': `Propriété: ${property_ref || 'Non spécifiée'} | Message: ${message}`,
      })
    });

    console.log("Zoho response status:", zohoResponse.status);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur API contact:", error);
    return NextResponse.json({ success: false }, { status: 500 });
  }
}