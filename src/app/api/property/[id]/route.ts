import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const id = resolvedParams.id;
    const { searchParams } = new URL(request.url);
    const lang = searchParams.get('lang') || 'fr';

    console.log(`[API] 🔍 Recherche de la propriété : ${id}`);

    // 1. Recherche par UUID (ID natif)
    let { data: property } = await supabase
      .from('villas')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    // 2. Si non trouvé, on cherche dans id_externe OU dans ref
    if (!property) {
      console.log(`[API] 📡 UUID non trouvé, test id_externe et ref...`);
      
      const cleanId = id.includes('-') ? id.split('-')[0] : id;
      
      // On construit une requête OR qui scanne id_externe et ref
      // On ajoute des guillemets pour les IDs qui sont des strings
      const { data: altProperty, error: extError } = await supabase
        .from('villas')
        .select('*')
        .or(`id_externe.eq."${id}",id_externe.eq."${cleanId}",ref.eq."${id}",ref.eq."${cleanId}"`)
        .maybeSingle();

      if (extError) console.error("[API] Erreur Supabase OR:", extError);
      property = altProperty;
    }

    // 3. Si toujours rien, on tente un scan partiel sur ref (très courant dans les flux immo)
    if (!property) {
       console.log(`[API] ⚠️ Recherche par correspondance partielle sur ref...`);
       const { data: finalTry } = await supabase
        .from('villas')
        .select('*')
        .ilike('ref', `%${id}%`)
        .limit(1)
        .maybeSingle();
       
       property = finalTry;
    }

    if (!property) {
      console.error(`[API] ❌ Propriété ${id} introuvable dans toutes les colonnes.`);
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Formatage dynamique
    const formatted = {
      ...property,
      titre: property[`titre_${lang}`] || property.titre_fr || property.titre || "Villa",
      description: property[`description_${lang}`] || property.description_fr || property.description || "",
      // Gestion sécurisée des images (parfois string, parfois tableau)
      images: Array.isArray(property.images) ? property.images : 
              (typeof property.images === 'string' ? JSON.parse(property.images) : [])
    };

    console.log(`[API] ✅ Trouvé : ${formatted.titre} (Ref: ${formatted.ref})`);
    return NextResponse.json(formatted);

  } catch (error) {
    console.error('Erreur API Critique:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}