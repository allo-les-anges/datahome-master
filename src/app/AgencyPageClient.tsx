"use client";

import { useState, useEffect, useCallback } from "react";
import { Loader2, Search, ArrowLeft } from "lucide-react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import PropertyGrid from "@/components/PropertyGrid";
import Footer from "@/components/Footer";
import AdvancedSearch from "@/components/AdvancedSearch";
import PropertyDetailClient from "@/components/PropertyDetailClient";
import { useTranslation } from "@/contexts/I18nContext";

// --- TYPES ---
import type { Villa, Agency, Filters } from '@/types'; 

interface AgencyPageProps {
  slug: string;
}

export default function AgencyPageClient({ slug }: AgencyPageProps) {
  const { t } = useTranslation();
  
  const [mounted, setMounted] = useState<boolean>(false);
  const [agency, setAgency] = useState<Agency | null>(null);
  const [allProperties, setAllProperties] = useState<Villa[]>([]);
  const [totalProperties, setTotalProperties] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [loadingMore, setLoadingMore] = useState<boolean>(false);
  const [isSearchOpen, setIsSearchOpen] = useState<boolean>(false);
  const [modalKey, setModalKey] = useState<number>(0); 
  const [selectedProperty, setSelectedProperty] = useState<Villa | null>(null);
  
  const [filters, setFilters] = useState<Filters>({
    type: "",
    town: "",
    region: "",
    beds: 0,
    minPrice: 0,
    maxPrice: 20000000,
    reference: "",
  });

  // Empêcher le scroll quand un détail ou la recherche est ouvert
  useEffect(() => {
    if (isSearchOpen || selectedProperty) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => { document.body.style.overflow = "unset"; };
  }, [isSearchOpen, selectedProperty]);

  // Fermeture avec la touche Echap
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsSearchOpen(false);
        setSelectedProperty(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fetch Agency Dynamique basé sur le SLUG injecté par le serveur
  useEffect(() => {
    const fetchConfig = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/agency?subdomain=${slug}`);
        const data = await res.json();
        
        if (data.error) {
          console.error("Agence introuvable pour :", slug);
        } else {
          setAgency(data);
        }
      } catch (err) {
        console.error("Erreur config:", err);
      } finally {
        setMounted(true);
        setLoading(false);
      }
    };
    fetchConfig();
  }, [slug]);

  // Chargement des propriétés (Logique originale réintégrée)
  const loadProperties = useCallback(async (offset: number, currentFilters: Filters) => {
    if (!mounted) return;
    
    try {
      offset === 0 ? setLoading(true) : setLoadingMore(true);
      const queryParams = new URLSearchParams();
      
      queryParams.append("subdomain", slug);
      queryParams.append("limit", "12");
      queryParams.append("offset", offset.toString());

      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value !== "" && value !== undefined) {
          queryParams.append(key, value as string);
        }
      });

      const res = await fetch(`/api/properties?${queryParams.toString()}`);
      const data = await res.json();
      const newProps = data.properties || (Array.isArray(data) ? data : []);
      const total = data.total ?? 0;

      if (offset === 0) {
        setAllProperties(newProps);
      } else {
        setAllProperties(prev => {
          const ids = new Set(prev.map(p => p.id));
          return [...prev, ...newProps.filter((p: Villa) => !ids.has(p.id))];
        });
      }
      setTotalProperties(total);
    } catch (err) {
      console.error("Erreur chargement propriétés:", err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [slug, mounted]);

  useEffect(() => {
    if (mounted && agency) loadProperties(0, filters);
  }, [mounted, agency, loadProperties, filters]);

  const handleSearch = (newFilters: Filters) => {
    setFilters(newFilters);
    setIsSearchOpen(false);
    setSelectedProperty(null);
    loadProperties(0, newFilters);
    setTimeout(() => {
      document.getElementById("collection")?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen font-sans overflow-x-hidden bg-transparent">
      <Navbar agency={agency} />
      
      {selectedProperty ? (
        <div className="relative z-50 pt-32 pb-20 min-h-screen bg-white">
          <div className="max-w-7xl mx-auto px-6 mb-8">
            <button 
              onClick={() => setSelectedProperty(null)}
              className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-400 hover:text-black transition-colors"
            >
              <ArrowLeft size={14} /> Retour à la liste
            </button>
          </div>
          <div className="animate-in fade-in duration-500">
            <PropertyDetailClient 
              property={selectedProperty} 
              agency={agency} 
            />
          </div>
        </div>
      ) : (
        <>
          <section className="relative h-[75vh] flex flex-col items-center justify-center bg-transparent no-forced-bg">
            <Hero 
              title={agency?.hero_title} 
              subtitle={agency?.agency_name}
              backgroundImage={agency?.hero_url}
              agencyName={agency?.agency_name}
            />
            <div className="absolute bottom-[10%] z-40">
              <button 
                onClick={() => {
                  setModalKey(prev => prev + 1);
                  setIsSearchOpen(true);
                }}
                className="flex items-center gap-4 px-8 py-4 bg-slate-900 text-white rounded-full hover:scale-105 transition-all shadow-lg cursor-pointer"
              >
                <Search size={18} />
                <span className="text-xs font-bold uppercase tracking-widest">
                  {t('nav.search') || "Lancer la recherche"}
                </span>
              </button>
            </div>
          </section>

          <section id="collection" className="relative py-24 bg-slate-50">
            <div className="max-w-7xl w-full mx-auto px-6">
              <header className="mb-16 text-center">
                <h2 className="text-4xl md:text-6xl font-serif italic text-slate-900 mb-4">
                  {t('filters.collection') || "Notre Sélection"}
                </h2>
                <div className="w-24 h-1 bg-slate-900 mx-auto mb-6"></div>
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.4em]">
                  {totalProperties} Biens disponibles
                </p>
              </header>

              {loading ? (
                <div className="flex justify-center py-20">
                  <Loader2 className="animate-spin text-slate-900" size={40} />
                </div>
              ) : (
                <>
                  <PropertyGrid 
                    properties={allProperties} 
                    isLight={true} 
                    onPropertyClick={(prop) => {
                      setSelectedProperty(prop);
                      window.scrollTo(0, 0);
                    }}
                  />
                  
                  {allProperties.length > 0 && allProperties.length < totalProperties && (
                    <div className="flex justify-center mt-20">
                      <button
                        onClick={() => loadProperties(allProperties.length, filters)}
                        disabled={loadingMore}
                        className="px-12 py-5 border-2 border-slate-900 text-slate-900 font-bold uppercase text-[11px] hover:bg-slate-900 hover:text-white transition-all flex items-center gap-4 cursor-pointer"
                      >
                        {loadingMore && <Loader2 className="animate-spin" size={16} />}
                        <span>{loadingMore ? "Chargement..." : "Afficher plus"}</span>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </section>
        </>
      )}

      {isSearchOpen && (
        <div className="fixed inset-0 flex items-center justify-center p-4 z-[9999]">
          <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-md" onClick={() => setIsSearchOpen(false)} />
          <div className="relative w-full max-w-5xl z-[10000]" onClick={(e) => e.stopPropagation()}>
            <AdvancedSearch 
              key={modalKey}
              onSearch={handleSearch} 
              isLight={true} 
              activeFilters={filters}
              properties={allProperties}
              onClose={() => setIsSearchOpen(false)} 
            />
          </div>
        </div>
      )}

      <Footer agency={agency} />
    </main>
  );
}