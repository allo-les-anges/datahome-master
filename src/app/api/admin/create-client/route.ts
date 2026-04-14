import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

// Fonction pour obtenir le client Supabase de manière sécurisée (Lazy Init)
function getSupabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Variables Supabase manquantes dans l'environnement.");
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
}

export async function POST(req: Request) {
  try {
    // 1. SÉCURITÉ : Vérification de la clé API (Correction Claude Point n°3)
    const apiKey = req.headers.get('x-api-key');
    const INGEST_API_KEY = process.env.INGEST_API_KEY;

    if (!apiKey || apiKey !== INGEST_API_KEY) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const { email, projectId } = body;

    if (!email) {
      return NextResponse.json({ error: "Email requis" }, { status: 400 });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const pinCode = Math.floor(1000 + Math.random() * 9000).toString();
    const tempPassword = "Client" + pinCode + "!";

    // 2. Création de l'utilisateur via Admin Auth
    const { data: authUser, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: { role: 'client', pin_code: pinCode }
    });

    if (authError) {
      return NextResponse.json({ error: authError.message }, { status: 400 });
    }

    // 3. Liaison optionnelle au projet
    if (projectId && authUser.user) {
      await supabaseAdmin
        .from('suivi_chantier')
        .update({ 
          client_id: authUser.user.id, 
          nom_client: email,
          pin_code: pinCode 
        })
        .eq('id', projectId);
    }

    return NextResponse.json({ 
      success: true, 
      pin: pinCode, 
      password: tempPassword 
    });

  } catch (err: any) {
    console.error("Erreur API:", err.message);
    // SÉCURITÉ : On ne renvoie pas la stack trace (Correction Claude Point n°2)
    return NextResponse.json({ error: "Erreur serveur interne" }, { status: 500 });
  }
}