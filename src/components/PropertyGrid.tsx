"use client";

import React, { useState } from 'react';
import { useTranslation } from "@/contexts/I18nContext";
import { Bed, Bath, Maximize, Heart, MapPin, Waves, Map, Car, Plus } from "lucide-react";
import type { Villa, Agency, Filters } from '@/types';  

interface PropertyGridProps {
  agency?: Agency | null;
  properties: Villa[];
  onPropertyClick: (property: Villa) => void;
  isLight?: boolean;
  favorites?: string[];
  onToggleFavorite?: (id: string) => void;
  activeFilters?: Filters; 
}

// Composant Interne Card (Gardé tel quel selon votre structure)
const PropertyCard = ({ property, isLight, isFavorite, onToggle, onClick, locale, agency }: any) => {
  const { t } = useTranslation();
  const price = Number(property.price || 0);
  const brandColor = agency?.primary_color || "#10b981";
  const showDark = !isLight;

  return (
    <div 
      onClick={() => onClick(property)}
      className={`group cursor-pointer rounded-[2.5rem] overflow-hidden transition-all duration-500 hover:shadow-2xl border ${
        showDark ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-100'
      }`}
    >
      {/* Image et Badge */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <img 
          src={property.images?.[0] || '/placeholder-villa.jpg'} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          alt={property.titre_fr}
        />
        <div className="absolute top-6 left-6 px-4 py-2 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest text-slate-900 shadow-sm">
          {property.type}
        </div>
      </div>

      {/* Contenu */}
      <div className="p-8 space-y-4">
        <div className="flex justify-between items-start">
          <div className="text-2xl font-serif italic" style={{ color: showDark ? 'white' : '#0f172a' }}>
            {price.toLocaleString()} €
          </div>
        </div>
        <h3 className={`text-lg font-medium leading-tight ${showDark ? 'text-white/90' : 'text-slate-800'}`}>
          {property.titre_fr}
        </h3>
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          <MapPin size={14} style={{ color: brandColor }} />
          {property.town} <span className="opacity-30">|</span> {property.region}
        </div>
      </div>

      {/* ICONES TECHNIQUES */}
      <div className="grid grid-cols-3 gap-y-6 pt-6 border-t p-8" style={{ borderColor: showDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9' }}>
        {[
          { icon: Maximize, value: `${property.surface_built} m²` },
          { icon: Bed, value: `${property.beds}` },
          { icon: Bath, value: `${property.baths}` },
          { icon: Waves, value: property.pool === "Oui" ? "Piscine" : "Non" },
          { icon: Map, value: `${property.surface_plot} m²` },
          { icon: Car, value: "Garage" }
        ].map((item, idx) => (
          <div key={idx} className="flex flex-col items-center gap-1">
            <item.icon size={16} className="text-slate-400" />
            <span className="text-[10px] font-bold text-slate-400">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Composant Principal avec Pagination
export default function PropertyGrid({ 
  properties, 
  agency, 
  onPropertyClick, 
  isLight, 
  locale 
}: any) {
  // État pour gérer le nombre de biens affichés
  const [visibleCount, setVisibleCount] = useState(12);

  const handleLoadMore = () => {
    setVisibleCount(prev => prev + 12);
  };

  // On découpe la liste pour n'afficher que les X premiers
  const displayedProperties = properties.slice(0, visibleCount);

  return (
    <div className="space-y-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayedProperties.map((property: Villa) => (
          <PropertyCard 
            key={property.id} 
            property={property} 
            agency={agency}
            onClick={onPropertyClick}
            isLight={isLight}
            locale={locale}
          />
        ))}
      </div>

      {/* Bouton "Voir plus" conditionnel */}
      {visibleCount < properties.length && (
        <div className="flex justify-center pt-8 pb-12">
          <button
            onClick={handleLoadMore}
            className="group flex items-center gap-3 px-10 py-5 bg-slate-900 text-white rounded-full font-bold text-[11px] uppercase tracking-[0.2em] hover:bg-blue-600 transition-all shadow-2xl active:scale-95"
          >
            <Plus size={16} className="group-hover:rotate-90 transition-transform duration-300" />
            Voir plus de biens
          </button>
        </div>
      )}
    </div>
  );
}