import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { parseStringPromise } from "xml2js";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Langues supportées
const LANGUAGES = ['fr', 'en', 'es', 'nl', 'pl', 'ar'];

export async function POST(req: Request) {
  try {
    const { agencyId, xmlUrl, agentId } = await req.json();
    
    console.log(`🔄 Début synchronisation pour agence ${agencyId}`);
    console.log(`📡 URL XML: ${xmlUrl}`);
    
    if (!xmlUrl) {
      return NextResponse.json({ error: "xml_url requis" }, { status: 400 });
    }
    
    // 1. Télécharger le XML
    const response = await fetch(xmlUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    const xmlText = await response.text();
    console.log(`📄 XML téléchargé: ${xmlText.length} caractères`);
    
    // 2. Parser le XML
    const result = await parseStringPromise(xmlText, {
      explicitArray: false,
      mergeAttrs: true,
      trim: true
    });
    
    // Trouver la clé racine (peut être "ads", "properties", etc.)
    const rootKey = Object.keys(result)[0];
    let properties = result[rootKey]?.property || result[rootKey]?.ad || [];
    
    if (!Array.isArray(properties)) {
      properties = [properties];
    }
    
    console.log(`🏠 ${properties.length} propriétés trouvées dans le XML`);
    
    // 3. Transformer les données
    const villasToUpsert = [];
    
    for (const p of properties) {
      // Extraction des données
      const idExterne = String(p.id || p.$.id || "");
      const ref = String(p.ref || p.$.ref || idExterne);
      const type = String(p.type || p.property_type || "Villa");
      const price = parseFloat(p.price || p.prix || 0);
      const beds = String(p.beds || p.bedrooms || "0");
      const baths = String(p.baths || p.bathrooms || "0");
      
      // Localisation
      const town = String(p.town || p.city || p.location?.town || "");
      const province = String(p.province || p.location?.province || "");
      const region = String(p.region || p.location?.region || "");
      
      // Coordonnées
      let latitude = null, longitude = null;
      if (p.location?.latitude && p.location?.longitude) {
        latitude = parseFloat(p.location.latitude);
        longitude = parseFloat(p.location.longitude);
      }
      
      // Surfaces
      const surfaceBuilt = String(p.surface_built || p.built_surface || p.surface?.built || "0");
      const surfacePlot = String(p.surface_plot || p.plot_surface || p.surface?.plot || "0");
      const surfaceUseful = String(p.surface_useful || p.useful_surface || p.surface?.useful || "0");
      
      // Distances
      const distanceBeach = p.distance_beach || p.distances?.beach || null;
      const distanceGolf = p.distance_golf || p.distances?.golf || null;
      const distanceTown = p.distance_town || p.distances?.town || null;
      
      // Pool
      const pool = (p.pool === "1" || p.pool === "true" || p.pool === "Oui") ? "Oui" : "Non";
      
      // Images
      let imagesArray = [];
      if (p.images) {
        if (Array.isArray(p.images.image)) {
          imagesArray = p.images.image.map((img: any) => typeof img === 'string' ? img : img.url);
        } else if (p.images.image) {
          imagesArray = [typeof p.images.image === 'string' ? p.images.image : p.images.image.url];
        }
      }
      // Limiter à 20 images max
      imagesArray = imagesArray.slice(0, 20);
      
      // Titres et descriptions multilingues
      const titleObj = p.title || {};
      const descObj = p.desc || p.description || {};
      
      const villaData: any = {
        id_externe: idExterne,
        ref: ref,
        type: type,
        price: price,
        prix: price,
        beds: beds,
        baths: baths,
        town: town,
        province: province,
        region: region,
        latitude: latitude,
        longitude: longitude,
        surface_built: surfaceBuilt,
        surface_plot: surfacePlot,
        surface_useful: surfaceUseful,
        pool: pool,
        images: imagesArray,
        distance_beach: distanceBeach,
        distance_golf: distanceGolf,
        distance_town: distanceTown,
        currency: p.currency || "EUR",
        xml_source: xmlUrl,
        agency_id: agencyId,
        updated_at: new Date().toISOString(),
        is_excluded: false,
        promoteur_name: p.development_name || p.promoter_name || null,
        commission_percentage: p.commission_percentage || p.commission?.quantity || "0"
      };
      
      // Ajouter les traductions
      for (const lang of LANGUAGES) {
        villaData[`titre_${lang}`] = String(
          titleObj[lang] || 
          titleObj.fr || 
          titleObj.en || 
          p.development_name || 
          `Propriété ${ref}`
        ).substring(0, 255);
        
        villaData[`description_${lang}`] = String(
          descObj[lang] || 
          descObj.fr || 
          descObj.en || 
          ""
        );
      }
      
      villasToUpsert.push(villaData);
    }
    
    if (villasToUpsert.length === 0) {
      return NextResponse.json({ success: true, message: "Aucune propriété à synchroniser" });
    }
    
    // 4. Upsert dans Supabase (sans supprimer les anciennes)
    const BATCH_SIZE = 50;
    let synced = 0;
    
    for (const villa of villasToUpsert) {
  delete villa.titre_ar;
  delete villa.description_ar;
}

// Upsert par batches
for (let i = 0; i < villasToUpsert.length; i += BATCH_SIZE) {
  const batch = villasToUpsert.slice(i, i + BATCH_SIZE);
  const { error, data } = await supabaseAdmin
    .from("villas")
    .upsert(batch, { 
      onConflict: 'id_externe',
      ignoreDuplicates: false
    });
  
  if (error) {
    console.error(`❌ Erreur batch ${i}:`, error.message);
  } else {
    synced += batch.length;
  }
}
    
    console.log(`✅ Synchronisation terminée: ${synced} propriétés traitées`);
    
    // 5. Optionnel: Mettre à jour la date de dernière synchro de l'agence
    await supabaseAdmin
      .from("agency_settings")
      .update({ last_sync_at: new Date().toISOString() })
      .eq("id", agencyId);
    
    return NextResponse.json({ 
      success: true, 
      count: synced,
      message: `${synced} propriétés synchronisées`
    });
    
  } catch (error) {
    console.error("❌ Erreur synchronisation:", error);
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "Erreur inconnue"
    }, { status: 500 });
  }
}

// Endpoint GET pour tester manuellement
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const xmlUrl = searchParams.get('url');
  
  if (!xmlUrl) {
    return NextResponse.json({ 
      message: "Utilisez ?url=URL_DU_XML pour tester",
      example: "/api/sync-villas?url=https://example.com/feed.xml"
    });
  }
  
  // Simuler un appel POST pour tester
  return POST(new Request(req.url, {
    method: 'POST',
    body: JSON.stringify({ xmlUrl, agencyId: 'test', agentId: 'test' })
  }));
}