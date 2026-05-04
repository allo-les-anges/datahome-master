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
import { Search, X } from 'lucide-react';
import { useTranslation } from "@/contexts/I18nContext";
import { useAgency } from "@/contexts/AgencyContext"; 
import { Villa, Filters } from '@/types';

const PAGE_SIZE_DEFAULT = 24;

interface AgencyPageClientProps {
  slug: string;
  routeLocale?: string;
  initialAgency?: any;
  initialProperties?: any[];
  initialPropertyTotal?: number;
}

export default function AgencyPageClient({ slug, routeLocale, initialAgency, initialProperties, initialPropertyTotal }: AgencyPageClientProps) {
  const { t, locale, setLocale } = useTranslation() as any;
  const { agency: contextAgency, setAgencyBySlug } = useAgency();
  const initialLoadDone = useRef(false);
  const effectiveLocale = routeLocale || locale || 'fr';
  
  const agency = useMemo(() => initialAgency || contextAgency, [initialAgency, contextAgency]);

  const [allProperties, setAllProperties] = useState<Villa[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Villa[]>([]);
  const [propertyTotal, setPropertyTotal] = useState<number | null>(initialPropertyTotal ?? null);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Villa | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [pageSize, setPageSize] = useState<12 | 24>(12);
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
  useEffect(() => {
    if (routeLocale && routeLocale !== locale) {
      setLocale(routeLocale);
    }
  }, [routeLocale, locale, setLocale]);

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
      titre: property[`titre_${effectiveLocale}` as keyof Villa] as string || property.titre_fr || property.titre || "Propriété",
      description: property[`description_${effectiveLocale}` as keyof Villa] as string || property.description_fr || property.description || "",
    };
  }, [effectiveLocale]);

  // Extrait les URLs XML autorisées depuis la config agence
  const getXmlUrls = useCallback((currentAgency: any): string[] => {
    if (!currentAgency?.footer_config) return [];
    try {
      const config = typeof currentAgency.footer_config === 'string'
        ? JSON.parse(currentAgency.footer_config)
        : currentAgency.footer_config;
      return config?.xml_urls || [];
    } catch { return []; }
  }, []);

  // Requête légère pour récupérer tous les types distincts sans limite de pagination
  const loadAvailableTypes = useCallback(async (currentAgency: any) => {
    if (!currentAgency?.id) return;
    try {
      let allowedXmlUrls: string[] = [];
      if (currentAgency?.footer_config) {
        try {
          const config = typeof currentAgency.footer_config === 'string'
            ? JSON.parse(currentAgency.footer_config)
            : currentAgency.footer_config;
          allowedXmlUrls = config?.xml_urls || [];
        } catch (e) { /* ignore */ }
      }

      const fetchTypePages = async (baseQuery: any): Promise<string[]> => {
        const PAGE_SIZE = 1000;
        const types: string[] = [];
        let page = 0;
        while (true) {
          const { data: pageData } = await baseQuery.range(page * PAGE_SIZE, (page + 1) * PAGE_SIZE - 1);
          if (!pageData || pageData.length === 0) break;
          types.push(...pageData.map((r: any) => r.type?.trim()).filter(Boolean));
          if (pageData.length < PAGE_SIZE) break;
          page++;
        }
        return types;
      };

      const [byAgencyTypes, byXmlTypes] = await Promise.all([
        fetchTypePages(
          supabase.from('villas').select('type').eq('agency_id', currentAgency.id).or('is_excluded.eq.false,is_excluded.is.null')
        ),
        allowedXmlUrls.length > 0
          ? fetchTypePages(
              supabase.from('villas').select('type').in('xml_source', allowedXmlUrls).or('is_excluded.eq.false,is_excluded.is.null')
            )
          : Promise.resolve([] as string[]),
      ]);

      const distinct = [...new Set([...byAgencyTypes, ...byXmlTypes])] as string[];
      if (distinct.length > 0) setAvailableTypes(distinct);
    } catch (e) { /* silently ignore */ }
  }, []);

  // Chargement initial : utilise les données SSR immédiatement, pas de fetch massif
  const loadData = useCallback(async (currentAgency: any) => {
    if (!currentAgency?.id || initialLoadDone.current) return;
    initialLoadDone.current = true;

    if (initialProperties && initialProperties.length > 0) {
      const formatted = formatVillaData(initialProperties);
      setAllProperties(formatted);
      setFilteredProperties(formatted);
      setHasMore((initialPropertyTotal ?? 0) > formatted.length);
      setLoadingProperties(false);
      return;
    }

    // Fallback si pas de données SSR : première page
    try {
      setLoadingProperties(true);
      const xmlUrls = getXmlUrls(currentAgency);
      const params = new URLSearchParams({ agencyId: String(currentAgency.id), limit: String(PAGE_SIZE_DEFAULT), lang: 'fr', mode: 'listing' });
      xmlUrls.forEach((url: string) => params.append('xmlSource', url));
      const res = await fetch(`/api/properties?${params.toString()}`);
      const json = await res.json();
      const formatted = formatVillaData(json.properties || []);
      setAllProperties(formatted);
      setFilteredProperties(formatted);
      setPropertyTotal(json.total ?? null);
      setHasMore((json.properties || []).length === PAGE_SIZE_DEFAULT);
    } catch {
      /* silently keep empty state */
    } finally {
      setLoadingProperties(false);
    }
  }, [initialProperties, initialPropertyTotal, formatVillaData, getXmlUrls]);

  // Charge la page suivante et l'ajoute à la liste affichée
  const loadMore = useCallback(async () => {
    if (!agency?.id || loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const xmlUrls = getXmlUrls(agency);
      const offset = filteredProperties.length;
      const params = new URLSearchParams({
        agencyId: String(agency.id),
        limit: String(pageSize),
        offset: String(offset),
        lang: 'fr',
        mode: 'listing',
      });
      if (filters.type) params.set('type', filters.type);
      if (filters.town) params.set('town', filters.town);
      if (filters.region) params.set('region', filters.region);
      if (filters.beds) params.set('beds', String(filters.beds));
      if (filters.minPrice) params.set('minPrice', String(filters.minPrice));
      if (filters.maxPrice && filters.maxPrice < 20000000) params.set('maxPrice', String(filters.maxPrice));
      if (filters.reference) params.set('reference', filters.reference);
      xmlUrls.forEach((url: string) => params.append('xmlSource', url));

      const res = await fetch(`/api/properties?${params.toString()}`);
      const json = await res.json();
      const newProps = json.properties || [];
      const formatted = formatVillaData(newProps);
      setAllProperties(prev => [...prev, ...formatted]);
      setFilteredProperties(prev => [...prev, ...formatted]);
      setHasMore(newProps.length === pageSize);
    } catch { /* garder l'état actuel */ }
    finally { setLoadingMore(false); }
  }, [agency, filteredProperties.length, loadingMore, hasMore, pageSize, filters, getXmlUrls, formatVillaData]);

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
      loadAvailableTypes(agency);
    }
  }, [agency?.id, loadData, loadAvailableTypes]);

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

  // Ouvre une fiche détail immédiatement, puis enrichit images complètes + descriptions via l'API (service role key)
  const openPropertyDetail = useCallback(async (property: Villa) => {
    setSelectedProperty(property);
    window.scrollTo({ top: 0 });
    try {
      const params = new URLSearchParams({ lang: effectiveLocale });
      if (agency?.id) params.set('agencyId', String(agency.id));
      const res = await fetch(`/api/property/${property.id}?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data && !data.error) {
          setSelectedProperty(prev =>
            prev?.id === property.id ? { ...prev, ...data } : prev
          );
        }
      }
    } catch { /* garder les données initiales */ }
  }, [effectiveLocale, agency?.id]);

  // Recherche côté serveur (couvre tout le catalogue, pas seulement la page chargée)
  const handleSearch = useCallback(async (newFilters: Filters & { sortOrder?: 'asc' | 'desc' }) => {
    const { sortOrder: newSortOrder, ...filterValues } = newFilters;
    if (newSortOrder) setSortOrder(newSortOrder);
    setFilters(filterValues);
    setIsSearchOpen(false);

    const hasFilter = Boolean(
      filterValues.type || filterValues.town || filterValues.region ||
      filterValues.beds || filterValues.minPrice ||
      (filterValues.maxPrice && filterValues.maxPrice < 20000000) || filterValues.reference
    );

    if (!hasFilter) {
      // Réinitialiser : revenir aux données initiales sans refetch
      const sorted = [...allProperties].sort((a, b) =>
        (newSortOrder || sortOrder) === 'asc'
          ? Number(a.price || 0) - Number(b.price || 0)
          : Number(b.price || 0) - Number(a.price || 0)
      );
      setFilteredProperties(sorted);
      setHasMore((propertyTotal ?? 0) > allProperties.length);
      setDisplayLimit(pageSize);
      setTimeout(() => document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' }), 150);
      return;
    }

    setLoadingProperties(true);
    try {
      const xmlUrls = getXmlUrls(agency);
      const params = new URLSearchParams({ agencyId: String(agency.id), limit: '200', lang: 'fr', mode: 'listing' });
      if (filterValues.type) params.set('type', filterValues.type);
      if (filterValues.town) params.set('town', filterValues.town);
      if (filterValues.region) params.set('region', filterValues.region);
      if (filterValues.beds) params.set('beds', String(filterValues.beds));
      if (filterValues.minPrice) params.set('minPrice', String(filterValues.minPrice));
      if (filterValues.maxPrice && filterValues.maxPrice < 20000000) params.set('maxPrice', String(filterValues.maxPrice));
      if (filterValues.reference) params.set('reference', filterValues.reference);
      xmlUrls.forEach((url: string) => params.append('xmlSource', url));

      const res = await fetch(`/api/properties?${params.toString()}`);
      const json = await res.json();
      let results = formatVillaData(json.properties || []);
      const ord = newSortOrder || sortOrder;
      results.sort((a, b) => ord === 'asc'
        ? Number(a.price || 0) - Number(b.price || 0)
        : Number(b.price || 0) - Number(a.price || 0)
      );
      setFilteredProperties(results);
      setHasMore(false);
      setDisplayLimit(pageSize);
    } catch { /* garder l'état actuel */ }
    finally {
      setLoadingProperties(false);
      setTimeout(() => document.getElementById('results-section')?.scrollIntoView({ behavior: 'smooth' }), 150);
    }
  }, [agency, allProperties, propertyTotal, sortOrder, pageSize, getXmlUrls, formatVillaData]);

  const resetFilters = useCallback(() => {
    const defaultFilters = { type: "", town: "", region: "", beds: 0, minPrice: 0, maxPrice: 20000000, reference: "" };
    setFilters(defaultFilters);
    setSortOrder('asc');
    setFilteredProperties([...allProperties].sort((a, b) => Number(a.price || 0) - Number(b.price || 0)));
    setHasMore((propertyTotal ?? 0) > allProperties.length);
  }, [allProperties, propertyTotal]);

  const localizedProperties = useMemo(() => {
    return filteredProperties.map(getLocalizedProperty);
  }, [filteredProperties, getLocalizedProperty]);

  const hasActiveFilters = useMemo(() => {
    return Boolean(
      filters.type ||
      filters.town ||
      filters.region ||
      filters.beds ||
      filters.minPrice ||
      (filters.maxPrice && filters.maxPrice < 20000000) ||
      filters.reference
    );
  }, [filters]);

  const displayedPropertyCount = hasActiveFilters
    ? localizedProperties.length
    : propertyTotal ?? localizedProperties.length;
  const propertyCountLabel = displayedPropertyCount > 1
    ? (t('home.propertiesPlural') || 'properties')
    : (t('home.propertiesSingular') || 'property');
  const propertiesAvailableLabel = (t('home.propertiesAvailable') || '{count} properties available')
    .replace('{count}', String(displayedPropertyCount));

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
  const blurAfter6 = parsedFooterConfig?.subscription?.blur_listings === true;
  const propertiesPerRow = parsedFooterConfig?.layout?.properties_per_row === 4 ? 4 : 3;
  const propertyCardCorners = parsedFooterConfig?.layout?.property_card_corners === "square" ? "square" : "rounded";
  const propertyCardIconColor = parsedFooterConfig?.layout?.property_card_icon_color || primaryColor;
  const propertyCardStyle = ['compact', 'editorial', 'minimal'].includes(parsedFooterConfig?.layout?.property_card_style)
    ? parsedFooterConfig.layout.property_card_style
    : 'classic';
  const resultsBgColor = parsedFooterConfig?.layout?.results_bg_color || '#f8fafc';
  const searchButtonText = parsedFooterConfig?.hero?.cta_text || t('common.search') || 'Rechercher';
  const heroSubtitle = parsedFooterConfig?.hero?.subtitle || agency?.hero_subtitle || "Votre partenaire immobilier de confiance";

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
              <PropertyDetailClient
                property={getLocalizedProperty(selectedProperty)}
                agency={agency}
                locale={effectiveLocale}
                onBack={() => { setSelectedProperty(null); window.scrollTo(0, 0); }}
              />
            </motion.div>
          ) : (
            <motion.div key="list" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="force-agency-font">
                <Hero 
                  agency={agency} 
                  title={agency?.hero_title || "Des professionnels à votre écoute"} 
                  subtitle={heroSubtitle}
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
                  <span className="text-[11px] font-black uppercase tracking-widest">{searchButtonText}</span>
                </button>
              </div>

              <section id="results-section" className="py-24 relative z-10 min-h-[600px]" style={{ backgroundColor: resultsBgColor }}>
                <div className="max-w-7xl mx-auto px-6">
                  <header className="mb-24 text-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 block">{agency?.agency_name}</span>
                    <div className="mb-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                      <h2 className="text-5xl italic text-slate-900" style={{ fontFamily: selectedFont }}>{t('nav.results') || 'Nos Biens'}</h2>
                      <span
                        className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-4 py-2 text-[10px] font-black uppercase tracking-widest text-slate-500 shadow-sm"
                        aria-label={propertiesAvailableLabel}
                      >
                        {displayedPropertyCount} {propertyCountLabel}
                      </span>
                    </div>
                    <div className="w-24 h-[1px] mx-auto bg-slate-300"></div>
                  </header>

                  <div className="mb-10 flex flex-wrap items-center justify-center gap-3">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                      {t('home.propertiesPerPage') || 'Properties per page'}
                    </span>
                    {[12, 24].map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => {
                          const nextSize = size as 12 | 24;
                          setPageSize(nextSize);
                          setDisplayLimit(nextSize);
                        }}
                        className={`h-10 min-w-14 rounded-full border px-5 text-[10px] font-black uppercase tracking-widest transition-all ${
                          pageSize === size
                            ? 'border-slate-900 bg-slate-900 text-white shadow-lg'
                            : 'border-slate-200 bg-white text-slate-500 hover:border-slate-300'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                  
                  <AnimatePresence mode="popLayout">
                    {localizedProperties.length > 0 ? (
                      <PropertyGrid
                        agency={agency}
                        properties={localizedProperties.slice(0, displayLimit)}
                        favorites={favorites}
                        onToggleFavorite={toggleFavorite}
                        blurAfter6={blurAfter6}
                        propertiesPerRow={propertiesPerRow}
                        cardCorners={propertyCardCorners}
                        iconColor={propertyCardIconColor}
                        cardStyle={propertyCardStyle}
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

                  {!loadingProperties && (localizedProperties.length > displayLimit || hasMore) && (
                    <div className="mt-20 flex justify-center">
                      <button
                        onClick={() => {
                          if (localizedProperties.length > displayLimit) {
                            setDisplayLimit(prev => prev + pageSize);
                          } else {
                            loadMore();
                          }
                        }}
                        disabled={loadingMore}
                        className={`px-14 py-7 text-white shadow-2xl transition-all hover:scale-105 active:scale-95 disabled:opacity-60 ${radius}`}
                        style={{ backgroundColor: primaryColor }}
                      >
                        <span className="text-[11px] font-black uppercase tracking-widest">
                          {loadingMore ? '...' : (t('common.showMore') || 'Afficher plus')}
                        </span>
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
        locale={effectiveLocale}
        config={{
          primaryColor: agency?.primary_color || '#0f172a',
          agencyName: agency?.agency_name,
          logoUrl: agency?.logo_url,
          agencyId: agency?.id,
          crmType: 'none',
        }}
        onPropertyClick={async (id) => {
          let property = allProperties.find(p =>
            [p.id, p.id_externe, p.ref].some(value => String(value) === String(id))
          );
          if (!property) {
            try {
              const params = new URLSearchParams({ lang: effectiveLocale });
              if (agency?.id) params.set('agencyId', String(agency.id));
              const res = await fetch(`/api/property/${id}?${params.toString()}`);
              if (res.ok) {
                const data = await res.json();
                const [formatted] = formatVillaData([data]);
                property = formatted;
              }
            } catch { /* ignore */ }
          }
          if (property) {
            await openPropertyDetail(property);
          }
        }}
      />

      <AnimatePresence>
        {isSearchOpen && (
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }} 
            className="fixed inset-0 z-[200] flex items-center justify-center p-3 md:p-6 bg-slate-950/90 backdrop-blur-2xl"
            style={{ fontFamily: fontFamily }}
          >
            <div className="absolute inset-0" onClick={() => setIsSearchOpen(false)} />
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} 
              animate={{ scale: 1, y: 0 }} 
              exit={{ scale: 0.9, y: 20 }} 
              className="relative w-full max-w-6xl rounded-[28px] md:rounded-[34px] shadow-2xl overflow-hidden flex flex-col max-h-[94vh] border"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.98), rgba(248,250,252,0.94))',
                borderColor: 'rgba(255,255,255,0.35)',
                boxShadow: `0 40px 120px rgba(0,0,0,0.55), 0 0 0 1px ${primaryColor}18`,
              }}
            >
              <button 
                onClick={() => setIsSearchOpen(false)} 
                className="absolute top-4 right-4 md:top-6 md:right-6 p-3 bg-slate-900/5 hover:bg-slate-900/10 rounded-2xl text-slate-500 transition-colors z-[220] border border-slate-200/70"
              >
                <X size={20} />
              </button>
              <div className="flex-grow overflow-y-auto p-4 md:p-8">
                <AdvancedSearch
                  agency={agency}
                  onSearch={handleSearch}
                  properties={allProperties}
                  availableTypes={availableTypes}
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
