// src/components/PropertyGrid.tsx
"use client";

import React, { memo } from 'react';
import { useTranslation } from "@/contexts/I18nContext";
import { Bed, Bath, Maximize, MapPin, Waves, Map, Car } from "lucide-react";
import type { Villa, Agency, Filters } from '@/types';

interface PropertyGridProps {
  agency?: Agency | null;
  properties: Villa[];
  onPropertyClick: (property: Villa) => void;
  isLight?: boolean;
  favorites?: string[];
  onToggleFavorite?: (id: string) => void;
  activeFilters?: Filters; 
  locale?: string;
}

// Composant memoizé pour éviter les re-rendus inutiles
const PropertyCard = memo(({ property, isLight, onClick, agency }: any) => {
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
      <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
        {/* Lazy loading avec loading="lazy" */}
        <img 
          src={property.images?.[0] || '/placeholder-villa.jpg'} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          alt={property.titre}
          loading="lazy"
          decoding="async"
        />
        <div className="absolute top-6 left-6 px-4 py-2 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-bold uppercase tracking-widest text-slate-900 shadow-sm">
          {property.type}
        </div>
      </div>

      <div className="p-8 space-y-4">
        <div className="flex justify-between items-start">
          <div className="text-2xl font-serif italic" style={{ color: showDark ? 'white' : '#0f172a' }}>
            {price.toLocaleString()} €
          </div>
        </div>
        <h3 className={`text-lg font-medium leading-tight line-clamp-2 ${showDark ? 'text-white/90' : 'text-slate-800'}`}>
          {property.titre}
        </h3>
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          <MapPin size={14} style={{ color: brandColor }} />
          {property.town} <span className="opacity-30">|</span> {property.region}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-y-6 pt-6 border-t p-8" style={{ borderColor: showDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9' }}>
        {[
          { icon: Maximize, value: `${property.surface || property.surface_built || 0} m²` },
          { icon: Bed, value: `${property.beds || 0}` },
          { icon: Bath, value: `${property.baths || 0}` },
          { icon: Waves, value: property.pool === "Oui" || property.pool === true ? "Piscine" : "Non" },
          { icon: Map, value: `${property.surface_plot || 0} m²` },
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
});

PropertyCard.displayName = 'PropertyCard';

// Composant principal également memoizé
const PropertyGrid = memo(function PropertyGrid({ 
  properties, 
  agency, 
  onPropertyClick, 
  isLight, 
  locale 
}: PropertyGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {properties.map((property: Villa) => (
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
  );
});

export default PropertyGrid;