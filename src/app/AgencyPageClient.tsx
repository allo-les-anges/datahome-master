"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import PropertyGrid from '@/components/PropertyGrid';
import Hero from '@/components/Hero';
import AdvancedSearch from '@/components/AdvancedSearch';
import PropertyDetailClient from '@/components/PropertyDetailClient';
import { Search, X, ArrowLeft, Loader2 } from 'lucide-react';
import { useTranslation } from "@/contexts/I18nContext";
import { useAgency } from "@/contexts/AgencyContext"; 
import { Villa, Filters } from '@/types';

interface AgencyPageClientProps {
  slug: string;
  initialAgency?: any;
  initialProperties?: any[];
}

export default function AgencyPageClient({ slug, initialAgency, initialProperties }: AgencyPageClientProps) {
  const { t, locale } = useTranslation() as any;
  const { agency: contextAgency, setAgencyBySlug } = useAgency(); 
  
  // Stabilisation de l'objet agency : priorité au contexte une fois chargé
  const agency = useMemo(() => contextAgency || initialAgency, [contextAgency, initialAgency]);

  const [allProperties, setAllProperties] = useState<Villa[]>([]);
  // Initialisation avec les props SSR pour éviter l'écran vide
  const [filteredProperties, setFilteredProperties] = useState<Villa[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Villa | null>(null);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [displayLimit, setDisplayLimit] = useState(12);

  const [filters, setFilters] = useState<Filters>({
    type: "",
    town: "",
    region: "",
    beds: 0,
    minPrice: 0,
    maxPrice: 50000000,
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

  const formatVillaData = useCallback((villas: any[]): Villa[] => {
    return villas.map((v, index) => {
      let imageArray: string[] = [];
      try {
        if (Array.isArray(v.images)) imageArray = v.images;
        else if (typeof v.images === 'string') imageArray = JSON.parse(v.images || '[]');
      } catch (e) { imageArray = []; }
      
      if (imageArray.length === 0) imageArray = ['/hero_network.jpg'];
      
      return {
        ...v,
        id: v.id || `v-${index}`,
        id_externe: String(v.id_externe || v.ref || v.external_id || ""),
        ref: String(v.id_externe || v.ref || ""), 
        titre: v[`titre_${locale}`] || v.titre || v.development_name || "Propriété",
        description: v[`description_${locale}`] || v.description || v.details || "",
        price: Number(v.price || v.prix || 0),
        town: v.town || v.ville || v.city || "",
        region: v.region || v.province || "",
        beds: parseInt(v.beds || v.bedrooms) || 0,
        baths: parseInt(v.baths || v.bathrooms) || 0,
        surface: v.surface || v.m2 || v.built || 0,
        type: v.type || "Villa",
        images: imageArray,
      };
    });
  }, [locale]);

  const loadData = useCallback(async (currentAgency: any) => {
    if (!currentAgency?.id) return;

    try {
      setLoadingProperties(true);
      setLoadingProgress(20);

      // 1. Si on a des propriétés initiales valides au premier montage, on les formate
      if (initialProperties && initialProperties.length > 0 && allProperties.length === 0) {
        const formatted = formatVillaData(initialProperties);
        setAllProperties(formatted);
        setFilteredProperties(formatted);
        setLoadingProgress(100);
        setLoadingProperties(false);
        return;
      }

      // 2. Sinon récupération Supabase
      setLoadingProgress(40);
      let allowedXmlUrls: string[] = [];
      
      if (currentAgency?.footer_config) {
        try {
          const config = typeof currentAgency.footer_config === 'string' 
            ? JSON.parse(currentAgency.footer_config) 
            : currentAgency.footer_config;
          allowedXmlUrls = config?.xml_urls || [];
        } catch (e) {
          console.error("Erreur parsing config agence");
        }
      }

      let query = supabase
        .from('villas')
        .select('*')
        .eq('is_excluded', false);

      if (allowedXmlUrls.length > 0) {
        query = query.in('xml_source', allowedXmlUrls);
      }

      const { data, error } = await query.order('price', { ascending: false }).limit(100);
      
      if (error) throw error;

      const formatted = formatVillaData(data || []);
      setAllProperties(formatted);
      setFilteredProperties(formatted);

    } catch (err) {
      console.error("Erreur chargement propriétés:", err);
    } finally {
      setLoadingProgress(100);
      setLoadingProperties(false);
    }
  }, [initialProperties, formatVillaData, allProperties.length]);

  // Synchronisation de l'agence
  useEffect(() => {
    if (slug) setAgencyBySlug(slug);
  }, [slug, setAgencyBySlug]);

  // Chargement des données quand l'agence est prête
  useEffect(() => {
    if (agency?.id) {
      loadData(agency);
    }
  }, [agency?.id, loadData]);

  useEffect(() => {
    const savedFavs = localStorage.getItem(`fav_${slug}`);
    if (savedFavs) {
      try { setFavorites(JSON.parse(savedFavs)); } catch (e) {}
    }
  }, [slug]);

  const toggleFavorite = (id: string) => {
    const newFavs = favorites.includes(id) ? favorites.filter(f => f !== id) : [...favorites, id];
    setFavorites(newFavs);
    localStorage.setItem(`fav_${slug}`, JSON.stringify(newFavs));
  };

  const handleSearch = (newFilters: Filters) => {
    const min = Number(newFilters.minPrice) || 0;
    const max = Number(newFilters.maxPrice) || 50000000;
    setFilters({ ...newFilters, minPrice: min, maxPrice: max });
    
    const results = allProperties.filter((p) => {
      const matchPrice = p.price >= min && p.price <= (max >= 19900000 ? 999999999 : max);
      const matchType = !newFilters.type || newFilters.type === "all" || p.type.toLowerCase().includes(newFilters.type.toLowerCase());
      const matchBeds = (Number(p.beds) || 0) >= (Number(newFilters.beds) || 0);
      const matchRegion = !newFilters.region || 
        p.region?.toLowerCase().includes(newFilters.region.toLowerCase()) || 
        p.town?.toLowerCase().includes(newFilters.region.toLowerCase());
      return matchPrice && matchBeds && matchType && matchRegion;
    });

    setFilteredProperties(results);
    setIsSearchOpen(false);
  };

  const primaryColor = agency?.primary_color || '#FF8C00'; 
  const radius = agency?.button_style || 'rounded-full';

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
                <button onClick={() => { setSelectedProperty(null); window.scrollTo(0, 0); }} className="flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  <ArrowLeft size={14} /> {t('nav.back')}
                </button>
              </div>
              <PropertyDetailClient property={selectedProperty} agency={agency} />
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
                <button onClick={() => setIsSearchOpen(true)} className={`flex items-center gap-6 px-12 py-7 text-white shadow-xl transition-transform hover:scale-105 ${radius}`} style={{ backgroundColor: primaryColor }}>
                  <Search size={20} />
                  <span className="text-[11px] font-black uppercase tracking-widest">{t('common.search')}</span>
                </button>
              </div>

              <section className="py-24 bg-slate-50 relative z-10">
                <div className="max-w-7xl mx-auto px-6">
                  <header className="mb-24 text-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 block">{agency?.agency_name}</span>
                    <h2 className="text-5xl italic mb-8 text-slate-900" style={{ fontFamily: selectedFont }}>{t('nav.results')}</h2>
                    <div className="w-24 h-[1px] mx-auto bg-slate-300"></div>
                  </header>
                  
                  {loadingProperties && filteredProperties.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 space-y-8">
                      <div className="w-64 h-[2px] bg-slate-200 relative overflow-hidden rounded-full">
                        <motion.div className="absolute inset-y-0 left-0" style={{ backgroundColor: primaryColor }} animate={{ width: `${loadingProgress}%` }} />
                      </div>
                      <p className="text-[9px] font-medium uppercase tracking-widest text-slate-400 italic flex items-center gap-2">
                        <Loader2 className="animate-spin" size={12} /> {t('common.loadingProperties')}
                      </p>
                    </div>
                  ) : (
                    <AnimatePresence>
                      {filteredProperties.length > 0 ? (
                        <PropertyGrid 
                          agency={agency}
                          properties={filteredProperties.slice(0, displayLimit)} 
                          favorites={favorites}
                          onToggleFavorite={toggleFavorite}
                          onPropertyClick={(p: Villa) => { setSelectedProperty(p); window.scrollTo({ top: 0 }); }}
                        />
                      ) : (
                        <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-slate-200">
                          <p className="text-slate-400 italic mb-4">{t('common.noResults')}</p>
                          <button onClick={() => loadData(agency)} className="text-[10px] font-bold uppercase tracking-widest underline">Réessayer</button>
                        </div>
                      )}
                    </AnimatePresence>
                  )}

                  {!loadingProperties && filteredProperties.length > displayLimit && (
                    <div className="mt-20 flex justify-center">
                      <button onClick={() => setDisplayLimit(prev => prev + 12)} className={`px-14 py-7 text-white shadow-2xl ${radius}`} style={{ backgroundColor: primaryColor }}>
                        <span className="text-[11px] font-black uppercase tracking-widest">{t('common.showMore')}</span>
                      </button>
                    </div>
                  )}
                </div>
              </section>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <AnimatePresence>
        {isSearchOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[200] flex items-center justify-center p-2 bg-slate-900/95 backdrop-blur-xl">
            <div className="absolute inset-0" onClick={() => setIsSearchOpen(false)} />
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="relative w-full max-w-5xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[95vh]">
              <button onClick={() => setIsSearchOpen(false)} className="absolute top-4 right-4 p-3 bg-slate-100 rounded-full text-slate-500 z-[220]"><X size={20} /></button>
              <div className="flex-grow overflow-y-auto p-6 md:p-12">
                <AdvancedSearch agency={agency} onSearch={handleSearch} properties={allProperties} activeFilters={filters} onClose={() => setIsSearchOpen(false)} />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}