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
    images: string[];
    // --- AJOUTS INDISPENSABLES POUR LA CARTE ---
    latitude: number | null;
    longitude: number | null;
    adresse?: string;
    // -------------------------------------------
    // Fallbacks pour la compatibilité
    prix?: number;
    image?: string;
    pieces?: number;
    surface?: number;
    slug?: string;
}

// Définition de l'Agence
export interface Agency {
    id: string;
    subdomain: string;
    agency_name: string;
    primary_color?: string;
    secondary_color?: string;
    font_family?: string;
    hero_title?: string;
    hero_url?: string;
    logo_url?: string;
    package_level?: 'light' | 'premium' | 'ultimate';
    default_lang?: string;
    email?: string;
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