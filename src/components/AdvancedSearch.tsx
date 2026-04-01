"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Search, Map, Home, Hash, Bed, RotateCcw } from "lucide-react";

interface AdvancedSearchProps {
  onSearch: (filters: any) => void;
  properties?: any[];
  activeFilters?: any;
  onClose?: () => void;
  isLight?: boolean;
  agency?: any; // Ajout de la prop agency pour le branding dynamique
}

export default function AdvancedSearch({
  onSearch,
  properties = [],
  activeFilters = {}, 
  onClose,
  isLight = true,
  agency, // Récupération de l'agence
}: AdvancedSearchProps) {
  
  // On définit la couleur de marque (Dashboard) ou une couleur par défaut
  const brandColor = agency?.primary_color || '#0f172a';

  const MIN_VAL = 0;
  const MAX_VAL = 20000000;
  const STEP = 10000;

  const initialFilters = {
    region: "",
    town: "",
    type: "",
    beds: "",
    minPrice: MIN_VAL,
    maxPrice: MAX_VAL,
    reference: "",
  };

  const [localFilters, setLocalFilters] = useState({
    ...initialFilters,
    ...activeFilters
  });

  // Synchronisation avec les filtres actifs venant du parent
  useEffect(() => {
    if (activeFilters && Object.keys(activeFilters).length > 0) {
      setLocalFilters((prev: any) => ({ ...prev, ...activeFilters }));
    }
  }, [activeFilters]);

  // Extraction dynamique des Régions UNIQUES
  const uniqueRegions = useMemo(() => {
    const safeProps = Array.isArray(properties) ? properties : [];
    const rawRegions = safeProps.map((p) => p.region);
    return [...new Set(rawRegions)]
      .filter((r) => r && typeof r === 'string' && r.trim() !== "")
      .sort();
  }, [properties]);
  
  // Extraction dynamique des Types UNIQUES avec traduction
  const uniqueTypes = useMemo(() => {
    const translation: { [key: string]: string } = {
      villa: "Villa", 
      apartment: "Appartement", 
      penthouse: "Penthouse", 
      bungalow: "Bungalow", 
      townhouse: "Maison de ville"
    };
    const safeProps = Array.isArray(properties) ? properties : [];
    const rawTypes = safeProps.map((p) => p.type);
    
    const distinctTypes = [...new Set(rawTypes.map(t => t?.toLowerCase().trim()))]
      .filter((t) => t && t !== "property");

    return distinctTypes.map((t) => ({ 
      id: t, 
      label: translation[t] || t.charAt(0).toUpperCase() + t.slice(1) 
    }));
  }, [properties]);

  const handleSearchClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    onSearch(localFilters);
    if (onClose) onClose();
  }, [onSearch, localFilters, onClose]);

  const handleReset = () => {
    setLocalFilters(initialFilters);
    onSearch(initialFilters);
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
  };

  const getSliderBackground = (value: number) => {
    const percentage = ((value - MIN_VAL) / (MAX_VAL - MIN_VAL)) * 100;
    return `linear-gradient(to right, ${brandColor} ${percentage}%, #e2e8f0 ${percentage}%)`;
  };

  return (
    <div className="w-full relative">
      {/* INJECTION DYNAMIQUE DE LA COULEUR DANS LES VARIABLES CSS */}
      <style jsx global>{`
        :root {
          --brand-primary: ${brandColor};
        }
        .text-primary { color: ${brandColor} !important; }
        .bg-primary { background-color: ${brandColor} !important; }
        .focus-ring-primary:focus { --tw-ring-color: ${brandColor}20; }
        
        .sexy-slider {
          -webkit-appearance: none;
          width: 100%;
          height: 5px;
          border-radius: 10px;
          outline: none;
          cursor: pointer;
        }
        .sexy-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 20px;
          height: 20px;
          background: #fff;
          border-radius: 50%;
          border: 2px solid ${brandColor};
          box-shadow: 0 3px 8px rgba(0,0,0,0.15);
        }
        .sexy-slider::-moz-range-thumb {
          width: 20px;
          height: 20px;
          background: #fff;
          border-radius: 50%;
          border: 2px solid ${brandColor};
        }
      `}</style>
      
      <div className="flex justify-between items-center mb-8 border-b border-slate-100 pb-4">
        <h3 className="text-2xl md:text-3xl font-serif italic text-slate-900">Recherche</h3>
        <button 
          onClick={handleReset}
          className="group flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-primary transition-colors"
        >
          <RotateCcw size={14} className="group-hover:rotate-[-90deg] transition-transform" /> Réinitialiser
        </button>
      </div>

      <form className="space-y-8 md:space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8">
          
          {/* CHAMP RÉFÉRENCE */}
          <div className="md:col-span-2 space-y-3 bg-slate-50/50 p-5 rounded-2xl border border-slate-100">
            <label className="flex items-center gap-3 text-[9px] uppercase font-black tracking-[0.2em] text-slate-500">
              <Hash size={14} className="text-primary" /> Référence Propriété
            </label>
            <input 
              type="text"
              placeholder="Ex: REF-1234..."
              value={localFilters.reference}
              onChange={(e) => setLocalFilters({ ...localFilters, reference: e.target.value })}
              className="w-full bg-white border border-slate-200 rounded-xl p-3 text-sm font-medium outline-none text-slate-900 placeholder:text-slate-300 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all shadow-inner"
            />
          </div>

          {/* RÉGION */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 text-[9px] uppercase font-black text-slate-500">
              <Map size={14} className="text-primary" /> Région
            </label>
            <div className="relative">
              <select 
                value={localFilters.region}
                onChange={(e) => setLocalFilters({ ...localFilters, region: e.target.value })}
                className="w-full bg-white border border-slate-200 p-3 rounded-xl text-[13px] font-semibold outline-none cursor-pointer appearance-none uppercase text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all shadow-sm"
              >
                <option value="">Espagne (Toutes)</option>
                {uniqueRegions.map(r => (
                  <option key={`reg-${r}`} value={r}>{r}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
                <Map size={14} />
              </div>
            </div>
          </div>

          {/* TYPE */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 text-[9px] uppercase font-black text-slate-500">
              <Home size={14} className="text-primary" /> Type de Bien
            </label>
            <div className="relative">
              <select 
                value={localFilters.type}
                onChange={(e) => setLocalFilters({ ...localFilters, type: e.target.value })}
                className="w-full bg-white border border-slate-200 p-3 rounded-xl text-[13px] font-semibold outline-none cursor-pointer appearance-none uppercase text-slate-900 focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all shadow-sm"
              >
                <option value="">Indifférent</option>
                {uniqueTypes.map(t => (
                  <option key={`type-${t.id}`} value={t.id}>{t.label}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-300">
                <Home size={14} />
              </div>
            </div>
          </div>

          {/* CHAMBRES */}
          <div className="space-y-3 md:col-span-2 lg:col-span-2">
            <label className="flex items-center gap-3 text-[9px] uppercase font-black text-slate-500">
              <Bed size={14} className="text-primary" /> Chambres Minimum
            </label>
            <div className="flex bg-white border border-slate-200 p-1 rounded-full shadow-sm">
              {[2, 3, 4, 5].map((n) => (
                <button
                  key={`beds-${n}`}
                  type="button"
                  onClick={() => setLocalFilters({ ...localFilters, beds: n.toString() })}
                  className={`flex-1 h-10 rounded-full text-[12px] font-extrabold transition-all duration-300 ${localFilters.beds === n.toString() ? "bg-primary text-white shadow-md scale-105" : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"}`}
                >
                  {n}+
                </button>
              ))}
            </div>
          </div>

          {/* SECTION PRIX */}
          <div className="md:col-span-2 lg:col-span-4 space-y-8 bg-slate-50/50 p-6 md:p-8 rounded-3xl border border-slate-100">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-baseline gap-4">
                  <label className="text-[9px] uppercase font-black tracking-wider text-slate-500">Prix Minimum</label>
                  <span className="text-xl font-serif italic text-slate-950 whitespace-nowrap">{formatPrice(Number(localFilters.minPrice))}</span>
                </div>
                <input 
                  type="range" 
                  min={MIN_VAL} 
                  max={MAX_VAL} 
                  step={STEP}
                  value={localFilters.minPrice}
                  onChange={(e) => setLocalFilters({ ...localFilters, minPrice: e.target.value })}
                  style={{ background: getSliderBackground(Number(localFilters.minPrice)) }}
                  className="sexy-slider"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-baseline gap-4">
                  <label className="text-[9px] uppercase font-black tracking-wider text-slate-500">Prix Maximum</label>
                  <span className="text-xl font-serif italic text-slate-950 whitespace-nowrap">
                    {Number(localFilters.maxPrice) >= MAX_VAL - STEP ? "Illimité" : formatPrice(Number(localFilters.maxPrice))}
                  </span>
                </div>
                <input 
                  type="range" 
                  min={MIN_VAL} 
                  max={MAX_VAL} 
                  step={STEP}
                  value={localFilters.maxPrice}
                  onChange={(e) => setLocalFilters({ ...localFilters, maxPrice: e.target.value })}
                  style={{ background: getSliderBackground(Number(localFilters.maxPrice)) }}
                  className="sexy-slider"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-center pt-4 pb-6 md:pb-0">
          <button 
            type="button"
            onClick={handleSearchClick}
            className="group flex items-center justify-center gap-5 w-full md:w-auto md:px-16 py-5 bg-primary text-white rounded-xl md:rounded-full hover:scale-105 active:scale-95 transition-all duration-300 shadow-xl shadow-primary/30"
          >
            <Search size={20} strokeWidth={3} className="group-hover:rotate-6 transition-transform" />
            <span className="text-[11px] font-black uppercase tracking-[0.4em]">Voir les résultats</span>
          </button>
        </div>
      </form>
    </div>
  );
}