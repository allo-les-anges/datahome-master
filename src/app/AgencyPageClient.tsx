"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import PropertyGrid from '@/components/PropertyGrid';
import Hero from '@/components/Hero';
import AdvancedSearch from '@/components/AdvancedSearch';
import PropertyDetailClient from '@/components/PropertyDetailClient';
import { Search, Loader2, X, ArrowLeft } from 'lucide-react';
import { useTranslation } from "@/contexts/I18nContext";
import { useAgency } from "@/contexts/AgencyContext"; 
import { Villa, Filters } from '@/types';

export default function AgencyPageClient({ slug }: { slug: string }) {
  const { t, locale } = useTranslation() as any;
  const { agency, loading: agencyLoading, setAgencyBySlug } = useAgency(); 
  
  const [allProperties, setAllProperties] = useState<Villa[]>([]);
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
    maxPrice: 20000000,
    reference: "",
  });

  // 1. Initialisation et Scroll
  useEffect(() => {
    if (slug) {
      setAgencyBySlug(slug);
    }
    window.scrollTo(0, 0);
  }, [slug, setAgencyBySlug]);

  // 2. Gestion des favoris locaux
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

  // 3. Formateur de données Villa
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

  // 4. Chargement des propriétés sécurisé (Anti-White Screen & Anti-Flash)
  useEffect(() => {
    async function fetchProperties() {
      if (!agency) return;

      try {
        setLoadingProperties(true);
        setLoadingProgress(10);
        
        let allowedXmlUrls: string[] = [];
        const config = agency.footer_config;
        
        if (config) {
          try {
            const parsed = typeof config === 'string' ? JSON.parse(config) : config;
            allowedXmlUrls = parsed?.xml_urls || [];
          } catch (e) {
            console.error("Erreur de lecture de la config agence", e);
            allowedXmlUrls = []; 
          }
        }

        setLoadingProgress(40);

        let query = supabase.from('villas').select('*').eq('is_excluded', false);
        if (allowedXmlUrls.length > 0) {
          query = query.in('xml_source', allowedXmlUrls);
        }

        const { data: villasData, error } = await query;
        
        if (error) throw error;

        if (villasData) {
          const formatted = formatVillaData(villasData);
          const sorted = formatted.sort((a, b) => b.price - a.price); 
          setAllProperties(sorted);
          setFilteredProperties(sorted);
          setLoadingProgress(100);
        }
      } catch (err) {
        console.error("Erreur critique lors du chargement :", err);
      } finally {
        // IMPORTANT: Un délai suffisant pour laisser au DOM le temps de se préparer
        // évite de voir "No results" avant que les composants ne s'injectent.
        setTimeout(() => setLoadingProperties(false), 800);
      }
    }

    fetchProperties();
  }, [agency, formatVillaData]);

  // 5. Logique de filtrage
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

  if (agencyLoading && !agency) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center bg-white">
        <Loader2 className="animate-spin text-slate-300 mb-4" size={50} />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 italic">Initialisation de l'agence...</p>
      </div>
    );
  }

  const primaryBrandColor = agency?.primary_color || '#FF8C00'; 
  const buttonRadius = agency?.button_style || 'rounded-full';

  return (
    <div className="flex flex-col relative notranslate">
      <main className="flex-grow"> 
        <AnimatePresence mode="wait">
          {selectedProperty ? (
            <motion.div 
              key="detail"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pb-20 bg-white min-h-screen"
            >
              <div className="max-w-7xl mx-auto px-6 pt-32 pb-8">
                <button 
                  onClick={() => { setSelectedProperty(null); window.scrollTo(0, 0); }} 
                  className="group flex items-center gap-4 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 hover:text-black transition-all relative z-50"
                >
                  <div className="w-8 h-[1px] bg-slate-200 group-hover:w-12 group-hover:bg-black transition-all"></div>
                  <ArrowLeft size={14} /> {t('nav.back')}
                </button>
              </div>
              <PropertyDetailClient property={selectedProperty} agency={agency} />
            </motion.div>
          ) : (
            <motion.div 
              key="list"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="animate-in fade-in duration-1000"
            >
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
                  className={`group flex items-center gap-6 px-12 py-7 text-white transition-all shadow-xl ${buttonRadius}`}
                  style={{ backgroundColor: primaryBrandColor }}
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
                    <div className="flex flex-col items-center justify-center py-32 space-y-8">
                      <div className="w-64 h-[2px] bg-slate-200 relative overflow-hidden rounded-full">
                        <motion.div 
                          className="absolute inset-y-0 left-0"
                          style={{ backgroundColor: primaryBrandColor }}
                          initial={{ width: "0%" }}
                          animate={{ width: `${loadingProgress}%` }}
                          transition={{ duration: 0.5, ease: "circOut" }}
                        />
                      </div>
                      <div className="text-center">
                        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-900 mb-2">
                           {loadingProgress}%
                        </p>
                        <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-slate-400 italic">
                          {t('common.loadingProperties') || "Chargement de la collection..."}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <AnimatePresence>
                      {filteredProperties.length > 0 ? (
                        <motion.div 
                          key="grid-container"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.6 }}
                        >
                          <PropertyGrid 
                            agency={agency}
                            properties={filteredProperties.slice(0, displayLimit)} 
                            favorites={favorites}
                            onToggleFavorite={toggleFavorite}
                            onPropertyClick={(p: Villa) => { setSelectedProperty(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                          />
                        </motion.div>
                      ) : (
                        <motion.div 
                          key="no-results"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className="text-center py-20 border border-dashed border-slate-200 rounded-3xl"
                        >
                          <p className="text-slate-400 italic font-serif">
                            {t('common.noResults') || "Aucun bien trouvé."}
                          </p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  )}

                  {!loadingProperties && filteredProperties.length > displayLimit && (
                    <div className="mt-20 flex justify-center">
                      <button 
                        onClick={() => setDisplayLimit(prev => prev + 12)}
                        className={`px-14 py-7 text-white transition-all shadow-2xl hover:-translate-y-1 ${buttonRadius}`}
                        style={{ 
                          backgroundColor: primaryBrandColor,
                          boxShadow: `0 20px 40px ${primaryBrandColor}33` 
                        }}
                      >
                        <span className="text-[11px] font-black uppercase tracking-[0.4em]">
                          {t('common.showMore')}
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