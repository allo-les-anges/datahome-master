"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { Search, Map, Home, Hash, Bed, RotateCcw, ArrowUpDown } from "lucide-react";
import { useTranslation } from "@/contexts/I18nContext";

interface AdvancedSearchProps {
  onSearch: (filters: any) => void;
  properties?: any[];
  availableTypes?: string[];
  activeFilters?: any;
  onClose?: () => void;
  isLight?: boolean;
  agency?: any;
}

export default function AdvancedSearch({
  onSearch,
  properties = [],
  availableTypes,
  activeFilters = {},
  onClose,
  isLight = true,
  agency,
}: AdvancedSearchProps) {
  const { t, locale } = useTranslation() as any;
  
  // Récupération des styles dynamiques de l'agence
  const brandColor = agency?.primary_color || '#D4AF37';
  const fontFamily = agency?.font_family || 'Montserrat';
  const buttonStyle = agency?.button_style === 'rounded-full' ? 'rounded-full' : 'rounded-none';
  const buttonAnimation = agency?.button_animation || 'scale';

  const MIN_VAL = 0;
  const MAX_VAL = 20000000;
  const STEP = 10000;

  // État pour l'ordre de tri
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

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

  // Synchronisation avec les filtres actifs
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
  
  // Extraction dynamique des Types UNIQUES
  const uniqueTypes = useMemo(() => {
    const translation: { [key: string]: string } = {
      villa: "Villa",
      apartment: "Appartement",
      penthouse: "Penthouse",
      bungalow: "Bungalow",
      townhouse: "Maison de ville",
      house: "Maison",
      maison: "Maison",
      terrain: "Terrain",
      land: "Terrain",
      commercial: "Commercial",
      plot: "Terrain",
      studio: "Studio",
      duplex: "Duplex",
      chalet: "Chalet",
      farmhouse: "Ferme",
      property: "Propriété",
    };

    // Priorité à availableTypes (requête dédiée sans limite de pagination)
    // Sinon on dérive depuis les biens déjà chargés en mémoire
    const source: string[] = availableTypes && availableTypes.length > 0
      ? availableTypes
      : (Array.isArray(properties) ? properties : []).map((p) => p.type);

    const distinctTypes = [...new Set(source.map((t: any) => t?.toLowerCase().trim()))]
      .filter((t): t is string => !!t);

    return distinctTypes
      .map((t) => ({
        id: t,
        label: translation[t] || t.charAt(0).toUpperCase() + t.slice(1),
      }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [properties, availableTypes]);

  // Extraction dynamique des Villes UNIQUES (basé sur la région sélectionnée)
  const uniqueTowns = useMemo(() => {
    const safeProps = Array.isArray(properties) ? properties : [];
    let filtered = safeProps;
    
    if (localFilters.region) {
      filtered = safeProps.filter(p => p.region === localFilters.region);
    }
    
    const rawTowns = filtered.map((p) => p.town || p.ville);
    return [...new Set(rawTowns)]
      .filter((t) => t && typeof t === 'string' && t.trim() !== "")
      .sort();
  }, [properties, localFilters.region]);

  const handleSearchClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    onSearch({ ...localFilters, sortOrder });
    if (onClose) onClose();
  }, [onSearch, localFilters, sortOrder, onClose]);

  const handleReset = () => {
    setLocalFilters(initialFilters);
    setSortOrder('asc');
    onSearch(initialFilters);
  };

  const formatPrice = (price: number) => {
    return price.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
  };

  const getSliderBackground = (value: number) => {
    const percentage = ((value - MIN_VAL) / (MAX_VAL - MIN_VAL)) * 100;
    return `linear-gradient(to right, ${brandColor} ${percentage}%, #e2e8f0 ${percentage}%)`;
  };

  // Animation du bouton
  const getButtonAnimationClass = () => {
    switch (buttonAnimation) {
      case 'scale': return 'hover:scale-105 active:scale-95';
      case 'glow': return 'hover:shadow-xl hover:shadow-primary/50';
      case 'slide': return 'hover:translate-x-1';
      default: return '';
    }
  };

  // Texte du bouton traduit
  const buttonText = t('common.search') || "Voir les résultats";

  return (
    <div 
      className="w-full relative"
      style={{ fontFamily: `${fontFamily}, sans-serif` }}
    >
      {/* INJECTION DYNAMIQUE DES STYLES */}
      <style jsx global>{`
        :root {
          --brand-primary: ${brandColor};
        }
        .text-primary { color: ${brandColor} !important; }
        .bg-primary { background-color: ${brandColor} !important; }
        .border-primary { border-color: ${brandColor} !important; }
        .ring-primary\/20 { --tw-ring-color: ${brandColor}20 !important; }
        
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
      
      <div className="flex justify-between items-center mb-8 pb-4" style={{ borderBottom: `1px solid ${isLight ? '#e2e8f0' : 'rgba(255,255,255,0.1)'}` }}>
        <h3 
          className="text-2xl md:text-3xl font-serif italic"
          style={{ color: isLight ? '#0f172a' : '#ffffff' }}
        >
          {t('common.search') || "Recherche"}
        </h3>
        <button 
          onClick={handleReset}
          className="group flex items-center gap-2.5 text-[10px] font-bold uppercase tracking-widest transition-colors"
          style={{ color: isLight ? '#94a3b8' : '#64748b' }}
        >
          <RotateCcw size={14} className="group-hover:rotate-[-90deg] transition-transform" /> 
          {t('home.reset') || "Réinitialiser"}
        </button>
      </div>

      <form className="space-y-8 md:space-y-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-6 gap-y-8">
          
          {/* CHAMP RÉFÉRENCE (corrigé) */}
          <div className="md:col-span-2 space-y-3 p-5 rounded-2xl" style={{ 
            backgroundColor: isLight ? '#f8fafc' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${isLight ? '#e2e8f0' : 'rgba(255,255,255,0.05)'}`
          }}>
            <label className="flex items-center gap-3 text-[9px] uppercase font-black tracking-[0.2em]" style={{ color: isLight ? '#64748b' : '#94a3b8' }}>
              <Hash size={14} className="text-primary" /> {t('propertyCard.ref')?.replace('{ref}', '') || "Référence"}
            </label>
            <input 
              type="text"
              placeholder="REF-1234"
              value={localFilters.reference}
              onChange={(e) => setLocalFilters({ ...localFilters, reference: e.target.value })}
              className="w-full rounded-xl p-3 text-sm font-medium outline-none transition-all shadow-inner"
              style={{
                backgroundColor: isLight ? '#ffffff' : 'rgba(255,255,255,0.05)',
                border: `1px solid ${isLight ? '#e2e8f0' : 'rgba(255,255,255,0.1)'}`,
                color: isLight ? '#0f172a' : '#ffffff',
              }}
            />
          </div>

          {/* RÉGION */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 text-[9px] uppercase font-black" style={{ color: isLight ? '#64748b' : '#94a3b8' }}>
              <Map size={14} className="text-primary" /> {t('home.region') || "Région"}
            </label>
            <div className="relative">
              <select 
                value={localFilters.region}
                onChange={(e) => setLocalFilters({ ...localFilters, region: e.target.value, town: "" })}
                className="w-full p-3 rounded-xl text-[13px] font-semibold outline-none cursor-pointer appearance-none transition-all shadow-sm"
                style={{
                  backgroundColor: isLight ? '#ffffff' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${isLight ? '#e2e8f0' : 'rgba(255,255,255,0.1)'}`,
                  color: isLight ? '#0f172a' : '#ffffff',
                }}
              >
                <option value="">{t('home.allRegions') || "Toutes les régions"}</option>
                {uniqueRegions.map(r => (
                  <option key={`reg-${r}`} value={r}>{r}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: isLight ? '#cbd5e1' : '#475569' }}>
                <Map size={14} />
              </div>
            </div>
          </div>

          {/* VILLE (NOUVEAU - dynamique basé sur la région) */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 text-[9px] uppercase font-black" style={{ color: isLight ? '#64748b' : '#94a3b8' }}>
              <Map size={14} className="text-primary" /> {t('home.city') || "Ville"}
            </label>
            <div className="relative">
              <select 
                value={localFilters.town}
                onChange={(e) => setLocalFilters({ ...localFilters, town: e.target.value })}
                className="w-full p-3 rounded-xl text-[13px] font-semibold outline-none cursor-pointer appearance-none transition-all shadow-sm"
                style={{
                  backgroundColor: isLight ? '#ffffff' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${isLight ? '#e2e8f0' : 'rgba(255,255,255,0.1)'}`,
                  color: isLight ? '#0f172a' : '#ffffff',
                }}
                disabled={!localFilters.region}
              >
                <option value="">{t('home.allCities') || "Toutes les villes"}</option>
                {uniqueTowns.map(t => (
                  <option key={`town-${t}`} value={t}>{t}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: isLight ? '#cbd5e1' : '#475569' }}>
                <Map size={14} />
              </div>
            </div>
          </div>

          {/* TYPE */}
          <div className="space-y-3">
            <label className="flex items-center gap-3 text-[9px] uppercase font-black" style={{ color: isLight ? '#64748b' : '#94a3b8' }}>
              <Home size={14} className="text-primary" /> {t('propertyCard.type') || "Type"}
            </label>
            <div className="relative">
              <select 
                value={localFilters.type}
                onChange={(e) => setLocalFilters({ ...localFilters, type: e.target.value })}
                className="w-full p-3 rounded-xl text-[13px] font-semibold outline-none cursor-pointer appearance-none transition-all shadow-sm"
                style={{
                  backgroundColor: isLight ? '#ffffff' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${isLight ? '#e2e8f0' : 'rgba(255,255,255,0.1)'}`,
                  color: isLight ? '#0f172a' : '#ffffff',
                }}
              >
                <option value="">{t('home.allTypes') || "Tous types"}</option>
                {uniqueTypes.map(t => (
                  <option key={`type-${t.id}`} value={t.id}>{t.label}</option>
                ))}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: isLight ? '#cbd5e1' : '#475569' }}>
                <Home size={14} />
              </div>
            </div>
          </div>

          {/* CHAMBRES */}
          <div className="space-y-3 md:col-span-2 lg:col-span-2">
            <label className="flex items-center gap-3 text-[9px] uppercase font-black" style={{ color: isLight ? '#64748b' : '#94a3b8' }}>
              <Bed size={14} className="text-primary" /> {t('propertyCard.beds') || "Chambres min."}
            </label>
            <div className="flex p-1 rounded-full shadow-sm" style={{ 
              backgroundColor: isLight ? '#ffffff' : 'rgba(255,255,255,0.03)',
              border: `1px solid ${isLight ? '#e2e8f0' : 'rgba(255,255,255,0.1)'}`
            }}>
              {[0, 2, 3, 4, 5].map((n) => (
                <button
                  key={`beds-${n}`}
                  type="button"
                  onClick={() => setLocalFilters({ ...localFilters, beds: n.toString() })}
                  className={`flex-1 h-10 rounded-full text-[12px] font-extrabold transition-all duration-300 ${
                    (localFilters.beds === n.toString() || (n === 0 && !localFilters.beds)) 
                      ? "bg-primary text-white shadow-md scale-105" 
                      : "hover:bg-slate-100 dark:hover:bg-white/10"
                  }`}
                  style={{ color: (localFilters.beds === n.toString() || (n === 0 && !localFilters.beds)) ? '#000000' : (isLight ? '#64748b' : '#94a3b8') }}
                >
                  {n === 0 ? "Tous" : `${n}+`}
                </button>
              ))}
            </div>
          </div>

          {/* SECTION PRIX */}
          <div className="md:col-span-2 lg:col-span-4 space-y-8 p-6 md:p-8 rounded-3xl" style={{ 
            backgroundColor: isLight ? '#f8fafc' : 'rgba(255,255,255,0.03)',
            border: `1px solid ${isLight ? '#e2e8f0' : 'rgba(255,255,255,0.05)'}`
          }}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-baseline gap-4">
                  <label className="text-[9px] uppercase font-black tracking-wider" style={{ color: isLight ? '#64748b' : '#94a3b8' }}>
                    {t('propertyDetail.minPrice') || "Prix Minimum"}
                  </label>
                  <span className="text-xl font-serif italic" style={{ color: isLight ? '#0f172a' : '#ffffff' }}>
                    {formatPrice(Number(localFilters.minPrice))}
                  </span>
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
                  <label className="text-[9px] uppercase font-black tracking-wider" style={{ color: isLight ? '#64748b' : '#94a3b8' }}>
                    {t('propertyDetail.maxPrice') || "Prix Maximum"}
                  </label>
                  <span className="text-xl font-serif italic" style={{ color: isLight ? '#0f172a' : '#ffffff' }}>
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

        {/* SECTION TRI PAR PRIX */}
        <div className="flex justify-between items-center pt-4">
          <div className="flex items-center gap-4">
            <label className="text-[10px] font-bold uppercase tracking-widest" style={{ color: isLight ? '#64748b' : '#94a3b8' }}>
              {t('propertyDetail.sortByPrice') || "Trier par prix :"}
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setSortOrder('asc')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase transition-all ${
                  sortOrder === 'asc' 
                    ? 'bg-primary text-black shadow-md' 
                    : 'bg-transparent hover:bg-white/10'
                }`}
                style={{ 
                  backgroundColor: sortOrder === 'asc' ? brandColor : 'transparent',
                  color: sortOrder === 'asc' ? '#000000' : (isLight ? '#64748b' : '#94a3b8'),
                  border: `1px solid ${sortOrder === 'asc' ? 'transparent' : (isLight ? '#e2e8f0' : 'rgba(255,255,255,0.1)')}`
                }}
              >
                <ArrowUpDown size={12} /> Croissant
              </button>
              <button
                type="button"
                onClick={() => setSortOrder('desc')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold uppercase transition-all ${
                  sortOrder === 'desc' 
                    ? 'bg-primary text-black shadow-md' 
                    : 'bg-transparent hover:bg-white/10'
                }`}
                style={{ 
                  backgroundColor: sortOrder === 'desc' ? brandColor : 'transparent',
                  color: sortOrder === 'desc' ? '#000000' : (isLight ? '#64748b' : '#94a3b8'),
                  border: `1px solid ${sortOrder === 'desc' ? 'transparent' : (isLight ? '#e2e8f0' : 'rgba(255,255,255,0.1)')}`
                }}
              >
                <ArrowUpDown size={12} className="rotate-180" /> Décroissant
              </button>
            </div>
          </div>
        </div>

        <div className="flex justify-center pt-4 pb-6 md:pb-0">
          <button 
            type="button"
            onClick={handleSearchClick}
            className={`group flex items-center justify-center gap-5 w-full md:w-auto md:px-16 py-5 bg-primary text-black rounded-xl transition-all duration-300 shadow-xl shadow-primary/30 ${getButtonAnimationClass()} ${buttonStyle}`}
          >
            <Search size={20} strokeWidth={3} className="group-hover:rotate-6 transition-transform" />
            <span className="text-[11px] font-black uppercase tracking-[0.4em]">{buttonText}</span>
          </button>
        </div>
      </form>
    </div>
  );
}