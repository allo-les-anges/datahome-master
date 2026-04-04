"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import PropertyGrid from '@/components/PropertyGrid';
import Hero from '@/components/Hero';
import AdvancedSearch from '@/components/AdvancedSearch';
import PropertyDetailClient from '@/components/PropertyDetailClient';
import { Search, Loader2, X, ArrowLeft } from 'lucide-react';
import { useTranslation } from "@/contexts/I18nContext";
import { Villa, Filters } from '@/types';

export default function AgencyPageClient({ slug }: { slug: string }) {
  const { t, setLocale, locale } = useTranslation() as any;
  
  const [agency, setAgency] = useState<any>(null);
  const [allProperties, setAllProperties] = useState<Villa[]>([]);
  const [filteredProperties, setFilteredProperties] = useState<Villa[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  
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
    setMounted(true);
    const meta = document.createElement('meta');
    meta.name = "google";
    meta.content = "notranslate";
    document.getElementsByTagName('head')[0].appendChild(meta);
    document.body.classList.add('notranslate');
    window.scrollTo(0, 0);

    return () => {
      document.body.classList.remove('notranslate');
    };
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

  // --- 4. RÉCUPÉRATION SUPABASE ---
  useEffect(() => {
    let isMounted = true;
    async function init() {
      if (!slug || !mounted) return;
      setLoading(true);
      try {
        const { data: agencyData } = await supabase
          .from('agency_settings')
          .select('*')
          .eq('subdomain', slug)
          .single();

        if (agencyData && isMounted) {
          setAgency(agencyData);
          if (agencyData.default_lang && !locale) {
            setLocale(agencyData.default_lang);
          }

          let allowedXmlUrls: string[] = [];
          try {
            const footerConfig = typeof agencyData.footer_config === 'string' 
              ? JSON.parse(agencyData.footer_config) 
              : agencyData.footer_config;
            allowedXmlUrls = footerConfig?.xml_urls || [];
          } catch (e) {}

          let query = supabase.from('villas').select('*').eq('is_excluded', false);
          if (allowedXmlUrls.length > 0) {
            query = query.in('xml_source', allowedXmlUrls);
          }

          const { data: villasData } = await query;
          if (isMounted && villasData) {
            const formatted = formatVillaData(villasData);
            const sorted = formatted.sort((a, b) => b.price - a.price); 
            setAllProperties(sorted);
            setFilteredProperties(sorted);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    init();
    return () => { isMounted = false; };
  }, [slug, formatVillaData, locale, setLocale, mounted]);

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

  if (!mounted || loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white">
      <Loader2 className="animate-spin text-slate-300 mb-4" size={50} />
      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Chargement...</p>
    </div>
  );

  const brandColor = agency?.primary_color || '#10b981';
  const selectedFont = agency?.font_family || 'Inter, sans-serif';
  const buttonRadius = agency?.button_style || 'rounded-full';
  const fontNameForUrl = selectedFont.split(',')[0].trim().replace(/\s+/g, '+');

  return (
    <div className="min-h-screen bg-white flex flex-col relative notranslate" style={{ fontFamily: selectedFont }}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=${fontNameForUrl}:wght@300;400;700;900&display=swap');
        :root { --brand-primary: ${brandColor}; }
        .bg-primary { background-color: var(--brand-primary) !important; }
        .text-primary { color: var(--brand-primary) !important; }
        .border-primary { border-color: var(--brand-primary) !important; }
      `}</style>

      <Navbar agency={agency} />

      <main className="flex-grow"> 
        {selectedProperty ? (
          <div className="animate-in fade-in duration-700 pb-20 pt-32 bg-white min-h-screen">
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
                
                <PropertyGrid 
                  agency={agency}
                  properties={filteredProperties.slice(0, displayLimit)} 
                  favorites={favorites}
                  onToggleFavorite={toggleFavorite}
                  onPropertyClick={(p: Villa) => { setSelectedProperty(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                />

                {filteredProperties.length > displayLimit && (
                  <div className="mt-20 flex justify-center">
                    <button 
                      onClick={() => setDisplayLimit(prev => prev + 12)}
                      className={`px-14 py-7 bg-primary text-white transition-all shadow-2xl ${buttonRadius}`}
                    >
                      <span className="text-[11px] font-black uppercase tracking-[0.4em]">
                        {t('common.showMore') || "Voir plus"}
                      </span>
                    </button>
                  </div>
                )}
              </div>
            </section>
          </div>
        )}
      </main>

      <Footer agency={agency} />

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