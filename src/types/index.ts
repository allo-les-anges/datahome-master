// src/types/index.ts

// Définition de la Villa
export interface Villa {
    id: string;
    id_externe: string;
    ref: string;
    titre: string;
    description: string;
    price: number;
    town: string;
    region: string;
    beds: number;
    baths: number;
    surface_built: string | number;
    surface_plot: string | number;
    pool: string;
    type: string;
    listing_type?: 'sale' | 'rent';
    rental_period?: string | null;
    images: string[];
    // --- AJOUTS INDISPENSABLES POUR LA CARTE ---
    latitude: number | null;
    longitude: number | null;
    adresse?: string;
    // ✅ AJOUT : Champs de description multilingues
    description_fr?: string;
    description_en?: string;
    description_es?: string;
    description_nl?: string;
    description_pl?: string;
    description_ar?: string;
    // ✅ AJOUT : Champs de titre multilingues (optionnels)
    titre_fr?: string;
    titre_en?: string;
    titre_es?: string;
    titre_nl?: string;
    titre_pl?: string;
    titre_ar?: string;
    // -------------------------------------------
    // Fallbacks pour la compatibilité
    prix?: number;
    image?: string;
    pieces?: number;
    surface?: number;
    slug?: string;
    // Autres champs potentiels
    development_name?: string;
    promoteur_name?: string;
    xml_source?: string;
    agency_id?: string;
    commission_percentage?: number;
    is_excluded?: boolean;
    updated_at?: string;
    created_at?: string;
}

// Définition de l'Agence - CORRIGÉ (suppression du doublon font_family)
export interface Agency {
    id: string;
    subdomain: string;
    custom_domain?: string | null;
    custom_domain_status?: 'not_configured' | 'pending' | 'verified' | 'error' | null;
    custom_domain_verified_at?: string | null;
    custom_domain_verification?: any;
    custom_domain_dns?: any;
    agency_name: string;
    primary_color?: string;
    secondary_color?: string;
    hero_title?: string;
    hero_url?: string;
    logo_url?: string;
    package_level?: 'light' | 'premium' | 'ultimate';
    default_lang?: string;
    email?: string;
    phone?: string;
    whatsapp_number?: string;
    address?: string;
    footer_config?: any;
    team_data?: any[];
    button_color?: string;
    button_style?: string;
    button_animation?: string;
    about_title?: string;
    about_text?: string;
    privacy_policy?: string;
    cookie_consent_enabled?: boolean;
    hero_type?: 'image' | 'video';
    font_family?: string;  // ← UNE SEULE FOIS
}

// Définition des Filtres
export interface Filters {
    type: string;
    town: string;
    region: string;
    beds: number;
    minPrice: number;
    maxPrice: number;
    reference: string;
}
