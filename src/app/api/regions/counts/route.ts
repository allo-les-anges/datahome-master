import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const CITY_TO_REGION_MAP: Record<string, string> = {
  "alicante": "Costa Blanca", "benidorm": "Costa Blanca", "altea": "Costa Blanca",
  "calpe": "Costa Blanca", "denia": "Costa Blanca", "javea": "Costa Blanca",
  "xabia": "Costa Blanca", "moraira": "Costa Blanca", "torrevieja": "Costa Blanca",
  "orihuela": "Costa Blanca", "orihuela costa": "Costa Blanca", "guardamar": "Costa Blanca",
  "santa pola": "Costa Blanca", "finestrat": "Costa Blanca", "villajoyosa": "Costa Blanca",
  "polop": "Costa Blanca", "elche": "Costa Blanca", "el campello": "Costa Blanca",
  "busot": "Costa Blanca", "cumbre del sol": "Costa Blanca",
  "marbella": "Costa del Sol", "estepona": "Costa del Sol", "mijas": "Costa del Sol",
  "fuengirola": "Costa del Sol", "benalmadena": "Costa del Sol", "torremolinos": "Costa del Sol",
  "malaga": "Costa del Sol", "nerja": "Costa del Sol", "casares": "Costa del Sol",
  "manilva": "Costa del Sol", "sotogrande": "Costa del Sol", "san pedro de alcantara": "Costa del Sol",
  "benahavis": "Costa del Sol", "cancelada": "Costa del Sol",
  "murcia": "Costa Calida", "cartagena": "Costa Calida", "los alcazares": "Costa Calida",
  "san javier": "Costa Calida", "san pedro del pinatar": "Costa Calida", "mazarron": "Costa Calida",
  "aguilas": "Costa Calida", "la manga": "Costa Calida", "sucina": "Costa Calida",
  "bano y mendigo": "Costa Calida",
  "almeria": "Costa Almeria", "roquetas de mar": "Costa Almeria", "mojacar": "Costa Almeria",
  "vera": "Costa Almeria", "san juan de los terreros": "Costa Almeria", "pulpi": "Costa Almeria",
  "cuevas del almanzora": "Costa Almeria"
};

export async function GET() {
  try {
    // Récupérer toutes les propriétés avec leur town et region
    const { data, error } = await supabase
      .from('villas')
      .select('town, region')
      .eq('is_excluded', false);

    if (error) {
      console.error("Erreur comptage régions:", error);
      return NextResponse.json({ error: "Erreur base de données" }, { status: 500 });
    }

    const counts: Record<string, number> = {
      "Costa Blanca": 0,
      "Costa del Sol": 0,
      "Costa Calida": 0,
      "Costa Almeria": 0,
    };

    data.forEach(p => {
      const rawCity = (p.town || "").toLowerCase().trim();
      const regionFound = CITY_TO_REGION_MAP[rawCity];
      if (regionFound) {
        counts[regionFound]++;
      } else {
        const rawRegion = p.region?.trim();
        if (rawRegion && counts[rawRegion] !== undefined) {
          counts[rawRegion]++;
        }
      }
    });

    return NextResponse.json(counts);
  } catch (error) {
    console.error("Erreur API comptage régions:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}