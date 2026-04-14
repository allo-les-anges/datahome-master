import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { parse } from "https://deno.land/x/xml@2.1.1/mod.ts"

serve(async (req) => {
  // 1. Récupération de l'ID de l'agence depuis l'URL (?agency_id=...)
  const url = new URL(req.url);
  const agencyIdFromUrl = url.searchParams.get('agency_id');

  // 2. Sécurité : Vérification de la clé API
  const INGEST_API_KEY = Deno.env.get('INGEST_API_KEY');
  const apiKey = req.headers.get('x-api-key');
  if (apiKey !== 'f7a3e1d9-8b2c-4a5e-9f3d-1c8b7a6e5d4c') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
  }

  // 3. Sécurité : Vérification que l'ID agence est présent
  if (!agencyIdFromUrl) {
    return new Response(JSON.stringify({ 
      error: 'ID Agence manquant dans l\'URL (paramètre ?agency_id=)' 
    }), { status: 400 });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 4. Vérification : l'agence existe bien dans la table agency_settings
    const { data: agencyExists, error: agencyError } = await supabase
      .from('agency_settings')
      .select('id')
      .eq('id', agencyIdFromUrl)
      .single();

    if (agencyError || !agencyExists) {
      return new Response(JSON.stringify({ 
        error: `L'agence avec l'ID ${agencyIdFromUrl} n'existe pas dans la table agency_settings.` 
      }), { status: 400 });
    }

    const xmlText = await req.text();
    const parsedXml = parse(xmlText) as any;
    const rawProps = parsedXml.root?.property || [];
    const properties = Array.isArray(rawProps) ? rawProps : [rawProps];

    const formattedProperties = properties.map((p: any) => {
      // --- Extraction sécurisée des objets imbriqués ---
      const surfaceArea = p.surface_area || {};
      const distances = p.distances || {};
      const location = p.location || {};
      const energyRating = p.energy_rating || {};
      const devCompany = p.development_company || {};
      const commission = p.commission || {};
      const restrictions = p.restrictions || {};

      // --- Gestion des tableaux/objets multiples ---
      const imagesArray = (() => {
        const imageEntries = p.images?.image || [];
        const images = Array.isArray(imageEntries) ? imageEntries : [imageEntries];
        return images.map((img: any) => img.url).filter((url: string) => url);
      })();

      const featuresArray = (() => {
        const features = p.features?.feature || [];
        return Array.isArray(features) ? features : [features];
      })();

      const tagsArray = (() => {
        const tags = p.tags?.tag || [];
        return Array.isArray(tags) ? tags : [tags];
      })();

      const documentsArray = (() => {
        const docs = p.documents?.document || [];
        const docsArray = Array.isArray(docs) ? docs : [docs];
        return docsArray.map((doc: any) => ({ lang: doc.lang, url: doc.url }));
      })();

      const plansArray = (() => {
        const plans = p.plans?.plan || [];
        const plansArray = Array.isArray(plans) ? plans : [plans];
        return plansArray.map((plan: any) => plan.url).filter((url: string) => url);
      })();

      // --- Récupération de l'URL web (priorité à la langue française) ---
      const webUrl = p.url?.fr || p.url?.en || p.url?.es || null;

      // --- Gestion des 12 langues ---
      const langs = ['de', 'cs', 'en', 'fr', 'nl', 'pl', 'es', 'ru', 'da', 'no', 'sv', 'hu'];
      const langData: any = {};
      
      for (const lang of langs) {
        // Extraction sécurisée du titre
        let titreValue = '';
        const titleField = p.title;
        if (titleField && typeof titleField === 'object' && titleField[lang]) {
          titreValue = String(titleField[lang]);
        } else if (titleField && typeof titleField === 'string') {
          titreValue = titleField;
        }
        langData[`titre_${lang}`] = titreValue;

        // Extraction sécurisée de la description
        let descValue = '';
        const descField = p.desc;
        if (descField && typeof descField === 'object' && descField[lang]) {
          descValue = String(descField[lang]);
        } else if (descField && typeof descField === 'string') {
          descValue = descField;
        }
        langData[`description_${lang}`] = descValue;
      }

      // --- Construction de l'objet final ---
      return {
        // Identifiants & métadonnées
        id_externe: String(p.id || ''),
        ref: String(p.ref || ''),
        xml_source: req.url || null,
        updated_at: new Date().toISOString(),

        // Dates
        date_publication: p.date || null,
        key_date: p.key_date || null,

        // Prix & informations financières
        prix: String(p.price || '0'),
        price: String(p.price || '0'),
        price_to: p.price_to || null,
        currency: p.currency || 'EUR',
        commission_percentage: commission.quantity ? String(commission.quantity) : null,
        commission_type: commission.type || null,

        // Localisation
        ville: p.town || '',
        town: p.town || '',
        province: p.province || '',
        region: location.environment?.areas?.area || '',
        adresse: location.address || '',
        latitude: location.latitude ? parseFloat(location.latitude) : null,
        longitude: location.longitude ? parseFloat(location.longitude) : null,

        // Caractéristiques principales
        type: p.type || 'property',
        development_name: p.development_name || '',
        promoteur_name: devCompany.name || null,
        status: p.status || null,
        units: p.units ? parseInt(p.units) : 1,

        // Pièces & surfaces
        beds: String(p.beds || '0'),
        baths: String(p.baths || '0'),
        surface_built: String(surfaceArea.built || '0'),
        surface_plot: String(surfaceArea.plot || '0'),
        surface_useful: String(surfaceArea.useful || '0'),
        surface_terrace: String(surfaceArea.terrace || '0'),
        surface_solarium: String(surfaceArea.solarium || '0'),
        living_room: String(surfaceArea.living_room || '0'),
        wc: p.wc ? String(p.wc) : '0',

        // Équipements extérieurs
        pool: p.pool === '1' ? 'Oui' : 'Non',
        terraces: p.terraces ? String(p.terraces) : '0',
        kitchen_type: p.kitchen_type || null,

        // Efficacité énergétique
        energy_consumption: energyRating.consumption || null,
        energy_emissions: energyRating.emissions || null,

        // Distances (en mètres)
        distance_beach: distances.beach ? parseInt(distances.beach) : null,
        distance_airport: distances.airport ? parseInt(distances.airport) : null,
        distance_golf: distances.golf ? parseInt(distances.golf) : null,
        distance_green_areas: distances.green_areas ? parseInt(distances.green_areas) : null,

        // Multimédia & documents
        images: JSON.stringify(imagesArray),
        video_url: p.videos?.video_url || null,
        documents: JSON.stringify(documentsArray),
        plans: JSON.stringify(plansArray),
        url_web: webUrl,

        // Listes et caractéristiques
        features: featuresArray,
        tags: tagsArray,

        // Restrictions de diffusion
        restrict_website: restrictions.website === '1',
        restrict_national: restrictions.national_portals === '1',
        restrict_international: restrictions.international_portals === '1',

        // Clé étrangère - utilisation de l'ID dynamique reçu de l'URL
        agency_id: agencyIdFromUrl,

        // Données multi-langues (12 langues)
        ...langData
      };
    });

    // Upsert des données dans la table 'villas'
    const { data, error } = await supabase
      .from('villas')
      .upsert(formattedProperties, { 
        onConflict: 'id_externe',
        ignoreDuplicates: false 
      });

    if (error) throw error;

    return new Response(JSON.stringify({ 
      success: true, 
      count: formattedProperties.length,
      agency_id: agencyIdFromUrl,
      languages_imported: ['de', 'cs', 'en', 'fr', 'nl', 'pl', 'es', 'ru', 'da', 'no', 'sv', 'hu'],
      message: `Import réussi de ${formattedProperties.length} propriétés pour l'agence ${agencyIdFromUrl} avec les 12 langues.`,
      data: data
    }), { status: 200 });

  } catch (err) {
    console.error('Erreur lors de l\'import:', err);
    return new Response(JSON.stringify({ 
      error: err.message,
      stack: err.stack 
    }), { status: 500 });
  }
});