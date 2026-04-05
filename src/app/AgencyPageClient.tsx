"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import PropertyGrid from '@/components/PropertyGrid';
import Hero from '@/components/Hero';
import AdvancedSearch from '@/components/AdvancedSearch';
import PropertyDetailClient from '@/components/PropertyDetailClient';
import { Search, Loader2, X, ArrowLeft } from 'lucide-react';
import { useTranslation } from "@/contexts/I18nContext";
import { useAgency } from "@/contexts/AgencyContext"; // Utilisation du context centralisé
import { Villa, Filters } from '@/types';

export default function AgencyPageClient({ slug }: { slug: string }) {
  const { t, locale } = useTranslation();
  const { agency, loading: agencyLoading } = useAgency(); // Récupération via le context
  
  const [allProperties, setAllProperties] = useState<Villa[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Villa[]>([]);
  const [loadingProperties, setLoadingProperties] = useState(true);
  
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
    maxPrice: 20000000,
    reference: "",
  });

  // --- 1. INITIALISATION ---
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // --- 2. GESTION DES FAVORIS ---
  useEffect(() => {
    if (typeof window !== 'undefined' && slug) {
      const saved = localStorage.getItem(`fav_${slug}`);
      if (saved) {
        try { setFavorites(JSON.parse(saved)); } catch (e) { console.error(e); }
      }
    }
  }, [slug]);

  const toggleFavorite = (id: string) => {
    const newFavs = favorites.includes(id) 
      ? favorites.filter(fav => fav !== id) 
      : [...favorites, id];
    setFavorites(newFavs);
    localStorage.setItem(`fav_${slug}`, JSON.stringify(newFavs));
  };

  // --- 3. FORMATAGE DES DONNÉES ---
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
        type: v.type || "Villa",
        images: imageArray,
      };
    });
  }, [locale]);

  // --- 4. RÉCUPÉRATION DES PROPRIÉTÉS ---
  useEffect(() => {
    async function fetchProperties() {
      if (!agency) return;
      setLoadingProperties(true);
      try {
        let allowedXmlUrls: string[] = [];
        const footerConfig = typeof agency.footer_config === 'string' 
          ? JSON.parse(agency.footer_config) 
          : agency.footer_config;
        allowedXmlUrls = footerConfig?.xml_urls || [];

        let query = supabase.from('villas').select('*').eq('is_excluded', false);
        if (allowedXmlUrls.length > 0) {
          query = query.in('xml_source', allowedXmlUrls);
        }

        const { data: villasData } = await query;
        if (villasData) {
          const formatted = formatVillaData(villasData);
          const sorted = formatted.sort((a, b) => b.price - a.price); 
          setAllProperties(sorted);
          setFilteredProperties(sorted);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingProperties(false);
      }
    }
    fetchProperties();
  }, [agency, formatVillaData]);

  // --- 5. GESTION RECHERCHE ---
  const handleSearch = (newFilters: Filters) => {
    const min = Number(newFilters.minPrice) || 0;
    const max = Number(newFilters.maxPrice) || 20000000;
    setFilters({ ...newFilters, minPrice: min, maxPrice: max });
    
    const results = allProperties.filter((p) => {
      const matchPrice = p.price >= min && p.price <= (max >= 19900000 ? 999999999 : max);
      const matchType = !newFilters.type || newFilters.type === "all" || p.type.toLowerCase().includes(newFilters.type.toLowerCase());
      const matchBeds = (Number(p.beds) || 0) >= (Number(newFilters.beds) || 0);
      const matchRegion = !newFilters.region || 
        p.region?.toLowerCase().includes(newFilters.region.toLowerCase()) || 
        p.town?.toLowerCase().includes(newFilters.region.toLowerCase());
      const matchRef = !newFilters.reference || String(p.id_externe).toLowerCase().includes(newFilters.reference.toLowerCase());
      return matchPrice && matchBeds && matchType && matchRegion && matchRef;
    });

    setFilteredProperties(results);
    setIsSearchOpen(false);
    setSelectedProperty(null);
  };

  if (agencyLoading && !agency) return (
    <div className="h-[60vh] flex flex-col items-center justify-center bg-white">
      <Loader2 className="animate-spin text-slate-300 mb-4" size={50} />
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('common.loading')}</p>
    </div>
  );

  const buttonRadius = agency?.button_style || 'rounded-full';

  return (
    <div className="flex flex-col relative notranslate">
      <main className="flex-grow"> 
        {selectedProperty ? (
          <div className="animate-in fade-in duration-700 pb-20 pt-10 bg-white min-h-screen">
            <div className="max-w-7xl mx-auto px-6 py-8">
              <button 
                onClick={() => { setSelectedProperty(null); window.scrollTo(0, 0); }} 
                className="group flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-black transition-all"
              >
                <div className="w-8 h-[1px] bg-slate-200 group-hover:w-12 group-hover:bg-black transition-all"></div>
                <ArrowLeft size={14} /> {t('nav.back')}
              </button>
            </div>
            <PropertyDetailClient property={selectedProperty} agency={agency} />
          </div>
        ) : (
          <div className="animate-in fade-in duration-1000">
            <Hero 
              agency={agency}
              title={agency?.hero_title} 
              subtitle={agency?.agency_name} 
              backgroundImage={agency?.hero_url || "/hero_network.jpg"} 
              agencyName={agency?.agency_name} 
            />
            
            <div className="flex justify-center -mt-12 relative z-40">
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsSearchOpen(true)} 
                className={`group flex items-center gap-6 px-12 py-7 text-white transition-all shadow-xl bg-primary ${buttonRadius}`}
              >
                <Search size={20} />
                <span className="text-[11px] font-black uppercase tracking-[0.4em]">{t('common.search')}</span>
              </motion.button>
            </div>

            <section id="collection" className="py-24 bg-slate-50 relative z-10">
              <div className="max-w-7xl mx-auto px-6">
                <header className="mb-24 text-center">
                  <span className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-400 mb-6 block">{agency?.agency_name}</span>
                  <motion.h2 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    className="text-5xl font-serif italic mb-8 text-slate-900"
                  >
                    {t('nav.results') || 'Notre Sélection'}
                  </motion.h2>
                  <div className="w-24 h-[1px] mx-auto bg-slate-300"></div>
                </header>
                
                {loadingProperties ? (
                  <div className="flex justify-center py-20">
                    <Loader2 className="animate-spin text-slate-200" size={40} />
                  </div>
                ) : (
                  <PropertyGrid 
                    agency={agency}
                    properties={filteredProperties.slice(0, displayLimit)} 
                    favorites={favorites}
                    onToggleFavorite={toggleFavorite}
                    onPropertyClick={(p: Villa) => { setSelectedProperty(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                  />
                )}

                {filteredProperties.length > displayLimit && (
                  <div className="mt-20 flex justify-center">
                    <button 
                      onClick={() => setDisplayLimit(prev => prev + 12)}
                      className={`px-14 py-7 bg-primary text-white transition-all shadow-2xl ${buttonRadius}`}
                    >
                      <span className="text-[11px] font-black uppercase tracking-[0.4em]">
                        {t('common.showMore')}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </main>

      <AnimatePresence>
        {isSearchOpen && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-2 bg-slate-900/95 backdrop-blur-xl"
          >
            <div className="absolute inset-0" onClick={() => setIsSearchOpen(false)} />
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="relative w-full max-w-5xl bg-white rounded-[24px] md:rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[95vh]"
            >
              <button onClick={() => setIsSearchOpen(false)} className="absolute top-4 right-4 p-3 bg-slate-100 rounded-full text-slate-500 z-[220]">
                <X size={20} />
              </button>
              <div className="flex-grow overflow-y-auto p-6 md:p-12">
                <AdvancedSearch 
                  agency={agency}
                  onSearch={handleSearch} 
                  properties={allProperties} 
                  activeFilters={filters} 
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