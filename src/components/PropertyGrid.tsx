"use client";

import React from 'react';
import { useTranslation } from "@/contexts/I18nContext";
import { Bed, Bath, Maximize, Heart, MapPin } from "lucide-react";
import type { Villa } from '@/types';  
interface PropertyGridProps {
  properties: any[];
  onPropertyClick: (property: any) => void;
  isLight?: boolean;
  favorites?: string[];
  onToggleFavorite?: (id: string) => void;
  activeFilters?: any; 
}

// --- C'EST ICI QUE TU PLACES TES LOGS ---
const PropertyCard = ({ property, isLight, isFavorite, onToggle, onClick, locale }: any) => {
  // Log 1 : Voir si la carte reçoit bien les données de la propriété
  console.log("PropertyCard reçue :", property);
  
  const getLocalizedText = (field: any) => {
    // Log 2 : Voir quelle donnée brute arrive pour la traduction
    console.log("getLocalizedText (champ brut) :", field);
    
    if (!field) return "";
    
    // Si c'est déjà une chaîne de caractères, on la retourne
    if (typeof field === 'string') return field;

    // Logique de traduction avec log
    const localizedText = field[locale] || field.fr || field.en || "";
    console.log(`Texte localisé (langue: ${locale}) :`, localizedText);
    
    return localizedText;
  };

  const price = Number(property.price || 0);

  return (
    <div 
      onClick={() => onClick(property)}
      className="group bg-white rounded-[2.5rem] overflow-hidden border border-slate-100 hover:shadow-2xl transition-all duration-500 cursor-pointer flex flex-col h-full"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <img 
          src={property.images?.[0] || '/hero_network.jpg'} 
          alt={getLocalizedText(property.titre)}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute top-5 left-5 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full shadow-sm">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-900">
            {getLocalizedText(property.type)}
          </span>
        </div>
        {!isLight && (
          <button 
            onClick={(e) => { e.stopPropagation(); onToggle(property.id); }}
            className={`absolute top-5 right-5 p-3 rounded-full transition-all ${
              isFavorite ? 'bg-red-500 text-white' : 'bg-white/90 text-slate-400 hover:text-red-500'
            }`}
          >
            <Heart size={16} fill={isFavorite ? "currentColor" : "none"} />
          </button>
        )}
      </div>

      <div className="p-8 flex flex-col flex-grow">
        <div className="flex items-center gap-2 text-slate-400 mb-3">
          <MapPin size={12} className="text-primary" />
          <span className="text-[10px] font-black uppercase tracking-widest">
            {getLocalizedText(property.town)}
          </span>
        </div>
        
        <h3 className="text-xl font-serif italic text-slate-900 mb-6 line-clamp-2 group-hover:text-primary transition-colors">
          {getLocalizedText(property.titre)}
        </h3>

        <div className="grid grid-cols-3 gap-2 py-6 border-y border-slate-50 mb-6 mt-auto">
          <div className="flex flex-col items-center gap-1">
            <Bed size={14} className="text-slate-300" />
            <span className="text-xs font-bold text-slate-900">{property.beds || 0}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Bath size={14} className="text-slate-300" />
            <span className="text-xs font-bold text-slate-900">{property.baths || 0}</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Maximize size={14} className="text-slate-300" />
            <span className="text-xs font-bold text-slate-900">{property.surface_built || 0}m²</span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-2xl font-serif text-slate-900">
            {price > 0 ? price.toLocaleString(locale === 'fr' ? 'fr-FR' : 'en-US') + " €" : "—"}
          </span>
          <div className="h-8 w-8 rounded-full border border-slate-100 flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-all">
            <span className="text-lg">→</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function PropertyGrid({ 
  properties, 
  onPropertyClick, 
  isLight = false, 
  favorites = [], 
  onToggleFavorite = () => {},
  activeFilters 
}: PropertyGridProps) {
  const { locale } = useTranslation();

  if (!properties || properties.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="text-slate-400 font-serif italic text-xl">Aucun bien ne correspond à vos critères.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
      {properties.map((property, index) => (
        <div 
          key={property.id || index}
          className="animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both"
          style={{ animationDelay: `${(index % 6) * 100}ms` }}
        >
          <PropertyCard 
            property={property} 
            isLight={isLight} 
            isFavorite={favorites.includes(property.id)}
            onToggle={onToggleFavorite}
            onClick={onPropertyClick}
            locale={locale}
          />
        </div>
      ))}
    </div>
  );
}