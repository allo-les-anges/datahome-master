// src/app/AgencyPageClient.tsx
"use client";

import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import PropertyGrid from '@/components/PropertyGrid';
import Hero from '@/components/Hero';
import AdvancedSearch from '@/components/AdvancedSearch';
import dynamic from 'next/dynamic';
const PropertyDetailClient = dynamic(() => import('@/components/PropertyDetailClient'), { ssr: false });
const QualifiedChatbot = dynamic(() => import('@/components/QualifiedChatbot'), { ssr: false });
import { Search, X, ArrowLeft, Loader2 } from 'lucide-react';
import { useTranslation } from "@/contexts/I18nContext";
import { useAgency } from "@/contexts/AgencyContext"; 
import { Villa, Filters } from '@/types';

// Cache key pour sessionStorage
const CACHE_KEY = (slug: string) => `properties_cache_${slug}`;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

interface CachedData {
  properties: Villa[];
  timestamp: number;
}

interface AgencyPageClientProps {
  slug: string;
  initialAgency?: any;
  initialProperties?: any[];
}

export default function AgencyPageClient({ slug, initialAgency, initialProperties }: AgencyPageClientProps) {
  const { t, locale } = useTranslation() as any;
  const { agency: contextAgency, setAgencyBySlug } = useAgency();
  const initialLoadDone = useRef(false);
  
  const agency = useMemo(() => initialAgency || contextAgency, [initialAgency, contextAgency]);

  const [allProperties, setAllProperties] = useState<Villa[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Villa[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(true);
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Villa | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [displayLimit, setDisplayLimit] = useState(12);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const [filters, setFilters] = useState<Filters>({
    type: "",
    town: "",
    region: "",
    beds: 0,
    minPrice: 0,
    maxPrice: 20000000,
    reference: "",
  });

  const getFontVariable = useCallback((fontName: string) => {
    const fonts: Record<string, string> = {
      'Montserrat': 'var(--font-montserrat)',
      'Inter': 'var(--font-inter)',
      'Playfair Display': 'var(--font-playfair)',
      'Poppins': 'var(--font-poppins)',
      'Roboto Mono': 'var(--font-roboto)'
    };
    return fonts[fontName] || 'var(--font-inter)';
  }, []);

  const selectedFont = useMemo(() => getFontVariable(agency?.font_family || 'Inter'), [agency?.font_family, getFontVariable]);

  // Formatage des villas - version adaptée à la structure réelle
  const formatVillaData = useCallback((villas: any[]): Villa[] => {
    const uniqueMap = new Map();
    
    for (const v of villas) {
      const key = v.id_externe || v.ref || v.id;
      if (uniqueMap.has(key)) continue;
      
      let imageArray: string[] = [];
      try {
        if (Array.isArray(v.images)) imageArray = v.images;
        else if (typeof v.images === 'string') imageArray = JSON.parse(v.images || '[]');
      } catch (e) { imageArray = []; }
      
      if (imageArray.length === 0) imageArray = ['/hero_network.jpg'];
      
      uniqueMap.set(key, {
        ...v,
        id: v.id,
        id_externe: String(v.id_externe || ""),
        ref: String(v.ref || v.id_externe || ""),
        titre_fr: v.titre_fr || v.titre || v.development_name || "Propriété",
        titre_en: v.titre_en || v.titre || "",
        titre_es: v.titre_es || v.titre || "",
        titre_nl: v.titre_nl || v.titre || "",
        titre_pl: v.titre_pl || v.titre || "",
        titre_ar: v.titre_ar || v.titre || "",
        description_fr: v.description_fr || v.description || "",
        description_en: v.description_en || "",
        description_es: v.description_es || "",
        description_nl: v.description_nl || "",
        description_pl: v.description_pl || "",
        description_ar: v.description_ar || "",
        price: Number(v.price || v.prix || 0),
        town: String(v.town || v.ville || "").trim(),
        region: String(v.region || v.province || "").trim(),
        beds: parseInt(v.beds) || 0,
        baths: parseInt(v.baths) || 0,
        surface_built: v.surface_built || "0",
        surface_plot: v.surface_plot || "0",
        type: String(v.type || "Villa").trim(),
        images: imageArray,
        pool: v.pool === "Oui" || v.pool === true ? "Oui" : "Non",
        latitude: v.latitude || null,
        longitude: v.longitude || null,
        adresse: v.adresse || "",
        development_name: v.development_name,
        promoteur_name: v.promoteur_name,
        xml_source: v.xml_source,
        agency_id: v.agency_id,
        commission_percentage: v.commission_percentage,
        currency: v.currency || "EUR",
        distance_beach: v.distance_beach,
        distance_golf: v.distance_golf,
        distance_town: v.distance_town,
        province: v.province,
      });
    }
    
    return Array.from(uniqueMap.values()).sort((a, b) => {
      const priceA = a.price || 0;
      const priceB = b.price || 0;
      return sortOrder === 'asc' ? priceA - priceB : priceB - priceA;
    });
  }, [sortOrder]);

  const getLocalizedProperty = useCallback((property: Villa): Villa => {
    return {
      ...property,
      titre: property[`titre_${locale}` as keyof Villa] as string || property.titre_fr || property.titre || "Propriété",
      description: property[`description_${locale}` as keyof Villa] as string || property.description_fr || property.description || "",
    };
  }, [locale]);

  const saveToCache = useCallback((properties: Villa[]) => {
    if (typeof window === 'undefined') return;
    try {
      const cacheData: CachedData = {
        properties,
        timestamp: Date.now()
      };
      sessionStorage.setItem(CACHE_KEY(slug), JSON.stringify(cacheData));
    } catch (e) {
      console.warn('Cache save failed:', e);
    }
  }, [slug]);

  const loadFromCache = useCallback((): Villa[] | null => {
    if (typeof window === 'undefined') return null;
    try {
      const cached = sessionStorage.getItem(CACHE_KEY(slug));
      if (!cached) return null;
      
      const data: CachedData = JSON.parse(cached);
      const isExpired = Date.now() - data.timestamp > CACHE_DURATION;
      
      if (isExpired) {
        sessionStorage.removeItem(CACHE_KEY(slug));
        return null;
      }
      
      return data.properties;
    } catch (e) {
      return null;
    }
  }, [slug]);

  // Chargement des données - Version avec les bonnes colonnes
  const loadData = useCallback(async (currentAgency: any) => {
    if (!currentAgency?.id) return;
    
    if (initialLoadDone.current && allProperties.length > 0) return;
    
    // 1. Vérifier le cache
    const cached = loadFromCache();
    if (cached && cached.length > 0) {
      setAllProperties(cached);
      setFilteredProperties(cached);
      setLoadingProperties(false);
      initialLoadDone.current = true;
      return;
    }

    // 2. Utiliser les propriétés initiales du SSR
    if (initialProperties && initialProperties.length > 0 && !initialLoadDone.current) {
      const formatted = formatVillaData(initialProperties);
      setAllProperties(formatted);
      setFilteredProperties(formatted);
      saveToCache(formatted);
      setLoadingProperties(false);
      initialLoadDone.current = true;
      return;
    }

    // 3. Fallback client
    try {
      setLoadingProperties(true);

      let allowedXmlUrls: string[] = [];
      if (currentAgency?.footer_config) {
        try {
          const config = typeof currentAgency.footer_config === 'string'
            ? JSON.parse(currentAgency.footer_config)
            : currentAgency.footer_config;
          allowedXmlUrls = config?.xml_urls || [];
        } catch (e) {
          // ignore
        }
      }

      let query = supabase
        .from('villas')
        .select(`
          id,
          id_externe,
          ref,
          titre,
          titre_fr,
          titre_en,
          titre_es,
          titre_nl,
          titre_pl,
          titre_ar,
          price,
          prix,
          town,
          ville,
          region,
          province,
          beds,
          baths,
          surface_built,
          surface_plot,
          surface_useful,
          type,
          pool,
          is_excluded,
          agency_id,
          images,
          latitude,
          longitude,
          adresse,
          xml_source,
          commission_percentage,
          currency,
          development_name,
          promoteur_name,
          distance_beach,
          distance_golf,
          distance_town
        `)
        .or('is_excluded.eq.false,is_excluded.is.null');

      if (allowedXmlUrls.length > 0) {
        query = query.in('xml_source', allowedXmlUrls);
      }

      const { data, error } = await query.limit(500);

      if (error) throw error;

      const formatted = formatVillaData(data || []);
      setAllProperties(formatted);
      setFilteredProperties(formatted);
      saveToCache(formatted);

    } catch (err) {
      if (initialProperties && initialProperties.length > 0) {
        const formatted = formatVillaData(initialProperties);
        setAllProperties(formatted);
        setFilteredProperties(formatted);
      }
    } finally {
      setLoadingProperties(false);
      initialLoadDone.current = true;
    }
  }, [initialProperties, formatVillaData, saveToCache, loadFromCache, allProperties.length]);

  // Synchronisation de l'agence
  useEffect(() => {
    if (initialAgency) {
      if (!contextAgency && setAgencyBySlug) {
        setAgencyBySlug(slug).catch(console.error);
      }
      return;
    }
    
    if (slug && !contextAgency) {
      setAgencyBySlug(slug);
    }
  }, [slug, contextAgency, setAgencyBySlug, initialAgency]);

  // Chargement des données
  useEffect(() => {
    if (agency?.id) {
      loadData(agency);
    }
  }, [agency?.id, loadData]);

  // Favoris
  useEffect(() => {
    const savedFavs = localStorage.getItem(`fav_${slug}`);
    if (savedFavs) {
      try { setFavorites(JSON.parse(savedFavs)); } catch (e) {}
    }
  }, [slug]);

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const newFavs = prev.includes(id) ? prev.filter(f => f !== id) : [...prev, id];
      localStorage.setItem(`fav_${slug}`, JSON.stringify(newFavs));
      return newFavs;
    });
  };

  // Ouvre une fiche détail en enrichissant les descriptions à la demande
  const openPropertyDetail = useCallback(async (property: Villa) => {
    if (property.description_fr || property.description) {
      setSelectedProperty(property);
      window.scrollTo({ top: 0 });
      return;
    }
    try {
      const { data } = await supabase
        .from('villas')
        .select('description,description_fr,description_en,description_es,description_nl,description_pl,description_ar')
        .eq('id', property.id)
        .single();
      setSelectedProperty(data ? { ...property, ...data } : property);
    } catch {
      setSelectedProperty(property);
    }
    window.scrollTo({ top: 0 });
  }, []);

  // Filtrage
  const handleSearch = useCallback((newFilters: Filters & { sortOrder?: 'asc' | 'desc' }) => {
    const { sortOrder: newSortOrder, ...filterValues } = newFilters;
    
    if (newSortOrder) {
      setSortOrder(newSortOrder);
    }
    
    setFilters(filterValues);
    
    const MIN_UNLIMITED = 0;
    const MAX_UNLIMITED = 20000000;
    const min = Number(filterValues.minPrice) || MIN_UNLIMITED;
    const max = Number(filterValues.maxPrice);
    const isUnlimited = !max || max >= MAX_UNLIMITED;
    const requiredBeds = Number(filterValues.beds) || 0;
    const searchLocation = (filterValues.town || filterValues.region || "").toLowerCase().trim();
    const searchRef = (filterValues.reference || "").toLowerCase().trim();
    const searchType = (filterValues.type || "").toLowerCase().trim();

    let results = allProperties.filter((p) => {
      const pPrice = Number(p.price) || 0;

      const matchPrice = pPrice >= min && (isUnlimited || pPrice <= max);
      const matchType = !searchType || searchType === "all" || 
        (p.type && p.type.toLowerCase().includes(searchType));
      const matchBeds = (Number(p.beds) || 0) >= requiredBeds;
      const matchLocation = !searchLocation || 
        (p.town && p.town.toLowerCase().includes(searchLocation)) || 
        (p.region && p.region.toLowerCase().includes(searchLocation));
      const matchRef = !searchRef || 
        (p.ref && p.ref.toLowerCase().includes(searchRef)) ||
        (p.id_externe && p.id_externe.toLowerCase().includes(searchRef));

      return matchPrice && matchType && matchBeds && matchLocation && matchRef;
    });

    const currentSortOrder = newSortOrder || sortOrder;
    results = [...results].sort((a, b) => {
      const priceA = Number(a.price) || 0;
      const priceB = Number(b.price) || 0;
      return currentSortOrder === 'asc' ? priceA - priceB : priceB - priceA;
    });

    setFilteredProperties(results);
    setDisplayLimit(12);
    setIsSearchOpen(false);
    
    setTimeout(() => {
      const element = document.getElementById('results-section');
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  }, [allProperties, sortOrder]);

  const resetFilters = useCallback(() => {
    const defaultFilters = {
      type: "",
      town: "",
      region: "",
      beds: 0,
      minPrice: 0,
      maxPrice: 20000000,
      reference: "",
    };
    setFilters(defaultFilters);
    setSortOrder('asc');
    const sorted = [...allProperties].sort((a, b) => {
      const priceA = Number(a.price) || 0;
      const priceB = Number(b.price) || 0;
      return priceA - priceB;
    });
    setFilteredProperties(sorted);
  }, [allProperties]);

  const localizedProperties = useMemo(() => {
    return filteredProperties.map(getLocalizedProperty);
  }, [filteredProperties, getLocalizedProperty]);

  const primaryColor = agency?.primary_color || '#FF8C00';
  const radius = agency?.button_style === 'rounded-full' ? 'rounded-full' : 'rounded-none';
  const fontFamily = agency?.font_family || 'Montserrat';

  const parsedFooterConfig = useMemo(() => {
    if (!agency?.footer_config) return null;
    if (typeof agency.footer_config === 'string') {
      try { return JSON.parse(agency.footer_config); } catch { return null; }
    }
    return agency.footer_config;
  }, [agency?.footer_config]);

  const chatbotEnabled = parsedFooterConfig?.integrations?.chatbot_enabled === true;

  // Loader
  if (loadingProperties && allProperties.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50">
        <div className="w-16 h-16 border-4 border-slate-200 border-t-[#D4AF37] rounded-full animate-spin mb-4"></div>
        <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">
          {t('common.loading') || 'Chargement...'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col relative notranslate min-h-screen" style={{ fontFamily: selectedFont }}>
      <style dangerouslySetInnerHTML={{ __html: `
        .force-agency-font h1, .force-agency-font h2, .force-agency-font p, .force-agency-font span {
          font-family: ${selectedFont} !important;
        }
      `}} />

      <main className="flex-grow"> 
        <AnimatePresence mode="wait">
          {selectedProperty ? (
            <motion.div key="detail" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="pb-20 bg-white">
              <div className="max-w-7xl mx-auto px-6 pt-32 pb-8">
                <button 
                  onClick={() => { setSelectedProperty(null); window.scrollTo(0, 0); }} 
                  className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
                >
                  <ArrowLeft size={14} /> {t('nav.back') || 'Retour'}
                </button>
              </div>
              <PropertyDetailClient 
                property={getLocalizedProperty(selectedProperty)} 
                agency={agency} 
              />
            </motion.div>
          ) : (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="force-agency-font">
                <Hero 
                  agency={agency} 
                  title={agency?.hero_title || "Des professionnels à votre écoute"} 
                  subtitle={agency?.hero_subtitle || "Votre partenaire immobilier de confiance"}
                  backgroundImage={agency?.hero_url || "/hero_network.jpg"} 
                  agencyName={agency?.agency_name} 
                />
              </div>
              
              <div className="flex justify-center -mt-12 relative z-40">
                <button 
                  onClick={() => setIsSearchOpen(true)} 
                  className={`flex items-center gap-6 px-12 py-7 text-white shadow-xl transition-all hover:scale-105 active:scale-95 ${radius}`} 
                  style={{ backgroundColor: primaryColor }}
                >
                  <Search size={20} />
                  <span className="text-[11px] font-black uppercase tracking-widest">{t('common.search') || 'Rechercher'}</span>
                </button>
              </div>

              <section id="results-section" className="py-24 bg-slate-50 relative z-10 min-h-[600px]">
                <div className="max-w-7xl mx-auto px-6">
                  <header className="mb-24 text-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 block">{agency?.agency_name}</span>
                    <h2 className="text-5xl italic mb-8 text-slate-900" style={{ fontFamily: selectedFont }}>{t('nav.results') || 'Nos Biens'}</h2>
                    <div className="w-24 h-[1px] mx-auto bg-slate-300"></div>
                  </header>
                  
                  <AnimatePresence mode="popLayout">
                    {localizedProperties.length > 0 ? (
                      <PropertyGrid 
                        agency={agency}
                        properties={localizedProperties.slice(0, displayLimit)} 
                        favorites={favorites}
                        onToggleFavorite={toggleFavorite}
                        onPropertyClick={(p: Villa) => {
                          const originalProperty = allProperties.find(prop => prop.id === p.id);
                          openPropertyDetail(originalProperty || p);
                        }}
                      />
                    ) : (
                      <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center py-32 bg-white rounded-[40px] border border-dashed border-slate-200 shadow-inner"
                      >
                        <p className="text-slate-400 italic mb-6">{t('common.noResults') || 'Aucun résultat trouvé'}</p>
                        <button 
                          onClick={resetFilters}
                          className="px-8 py-4 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-full hover:bg-slate-800 transition-all"
                        >
                          {t('home.reset') || 'Réinitialiser les filtres'}
                        </button>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {!loadingProperties && localizedProperties.length > displayLimit && (
                    <div className="mt-20 flex justify-center">
                      <button 
                        onClick={() => setDisplayLimit(prev => prev + 12)} 
                        className={`px-14 py-7 text-white shadow-2xl transition-all hover:scale-105 active:scale-95 ${radius}`} 
                        style={{ backgroundColor: primaryColor }}
                      >
                        <span className="text-[11px] font-black uppercase tracking-widest">{t('common.showMore') || 'Afficher plus'}</span>
                      </button>
                    </div>
                  )}
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <QualifiedChatbot
        enabled={chatbotEnabled}
        locale={locale}
        config={{
          primaryColor: agency?.primary_color || '#0f172a',
          agencyName: agency?.agency_name,
          logoUrl: agency?.logo_url,
          agencyId: agency?.id,
          crmType: 'none',
        }}
        onPropertyClick={async (id) => {
          let property = allProperties.find(p => String(p.id) === String(id));
          if (!property) {
            try {
              const { data } = await supabase.from('villas').select('*').eq('id', id).single();
              if (data) {
                const [formatted] = formatVillaData([data]);
                property = formatted;
              }
            } catch { /* ignore */ }
          }
          if (property) {
            setSelectedProperty(property);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }
        }}
      />

      <AnimatePresence>
        {isSearchOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[200] flex items-center justify-center p-2 md:p-6 bg-slate-900/95 backdrop-blur-xl"
            style={{ fontFamily: fontFamily }}
          >
            <div className="absolute inset-0" onClick={() => setIsSearchOpen(false)} />
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.9, y: 20 }} 
              className="relative w-full max-w-5xl rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
              style={{ backgroundColor: '#ffffff' }}
            >
              <button 
                onClick={() => setIsSearchOpen(false)} 
                className="absolute top-6 right-6 p-3 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-colors z-[220]"
              >
                <X size={20} />
              </button>
              <div className="flex-grow overflow-y-auto p-6 md:p-12">
                <AdvancedSearch 
                  agency={agency} 
                  onSearch={handleSearch} 
                  properties={allProperties} 
                  activeFilters={{ ...filters, sortOrder }} 
                  onClose={() => setIsSearchOpen(false)} 
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}