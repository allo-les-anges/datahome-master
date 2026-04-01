import { createClient } from '@supabase/supabase-js';

// On récupère les clés
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

// On n'initialise le client que si les clés existent pour éviter le crash au chargement
const getSupabaseClient = () => {
  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      "Supabase Key ou URL manquante. Vérifiez votre fichier .env.local et assurez-vous que SUPABASE_SERVICE_ROLE_KEY n'a PAS le préfixe NEXT_PUBLIC."
    );
  }
  return createClient(supabaseUrl, supabaseServiceKey);
};

export async function getAgencySettings(subdomain: string) {
  try {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase
      .from('agency_settings')
      .select('*')
      .eq('subdomain', subdomain)
      .maybeSingle();

    if (error) {
      console.error("Détails erreur Supabase:", error.message);
      throw error;
    }

    return data;
  } catch (error: any) {
    console.error("Erreur configuration agence:", error.message || error);
    return null;
  }
}