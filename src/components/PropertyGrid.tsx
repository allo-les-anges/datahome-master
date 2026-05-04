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
  blurAfter6?: boolean;
  propertiesPerRow?: 3 | 4;
  cardCorners?: "rounded" | "square";
  iconColor?: string;
  cardStyle?: "classic" | "compact" | "editorial" | "minimal";
}

// Composant memoizÃ© pour Ã©viter les re-rendus inutiles
const PropertyCard = memo(({ property, isLight, onClick, agency, cardCorners = "rounded", iconColor, cardStyle = "classic" }: any) => {
  const { t, locale } = useTranslation() as any;
  const price = Number(property.price || 0);
  const isRental = property.listing_type === "rent";
  const rentalSuffix = property.rental_period === "week" ? "/sem." : property.rental_period === "day" ? "/jour" : "/mois";
  const EUR_TO_AED = 3.97;
  const isArabic = locale === 'ar';
  const eurFormatted = `${price.toLocaleString()} €${isRental ? ` ${rentalSuffix}` : ""}`;
  const aedFormatted = `${new Intl.NumberFormat('ar-AE').format(Math.round(price * EUR_TO_AED))} Ø¯.Ø¥`;
  const brandColor = agency?.primary_color || "#10b981";
  const cardIconColor = iconColor || brandColor;
  const fontFamily = agency?.font_family || 'Montserrat';
  const showDark = !isLight;
  const cardRadiusClass = cardCorners === "square" ? "rounded-none" : "rounded-[2.5rem]";
  const isCompact = cardStyle === "compact";
  const isMinimal = cardStyle === "minimal";
  const isEditorial = cardStyle === "editorial";
  const imageAspectClass = isEditorial ? "aspect-[16/10]" : "aspect-[4/3]";
  const bodyPaddingClass = isCompact ? "p-5" : isMinimal ? "p-6" : "p-8";
  const statsPaddingClass = isCompact ? "p-5 pt-5" : "p-8 pt-6";
  const titleClass = isEditorial ? "text-xl italic" : isCompact ? "text-base" : "text-lg";
  const priceClass = isCompact ? "text-xl" : isEditorial ? "text-3xl" : "text-2xl";

  return (
    <div 
      onClick={() => onClick(property)}
      className={`group cursor-pointer ${cardRadiusClass} overflow-hidden transition-all duration-500 hover:shadow-2xl border ${
        isMinimal
          ? showDark ? 'bg-transparent border-white/10' : 'bg-transparent border-slate-200'
          : showDark ? 'bg-slate-900 border-white/5' : 'bg-white border-slate-100'
      }`}
      style={{ 
        fontFamily: `${fontFamily}, 'Helvetica Neue', Arial, sans-serif`
      }}
    >
      <div className={`relative ${imageAspectClass} overflow-hidden bg-slate-100`}>
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

      <div className={`${bodyPaddingClass} space-y-4`}>
        <div className="flex justify-between items-start">
          <div 
            className={`${priceClass} font-normal`}
            style={{ 
              fontFamily: `${fontFamily}, 'Playfair Display', serif`,
              color: showDark ? 'white' : '#0f172a',
              fontWeight: 400
            }}
          >
            {isArabic ? aedFormatted : eurFormatted}
            {isArabic && <span className="block text-xs font-normal text-slate-400 mt-0.5">{eurFormatted}</span>}
          </div>
        </div>
        <h3 
          className={`${titleClass} leading-tight line-clamp-2 font-normal ${showDark ? 'text-white/90' : 'text-slate-800'}`}
          style={{ 
            fontFamily: `${fontFamily}, 'Playfair Display', serif`,
            fontWeight: 400
          }}
        >
          {property.titre}
        </h3>
        <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-400">
          <MapPin size={14} style={{ color: cardIconColor }} />
          <span style={{ fontFamily: `${fontFamily}, sans-serif` }}>{property.town}</span>
          <span className="opacity-30">|</span>
          <span style={{ fontFamily: `${fontFamily}, sans-serif` }}>{property.region}</span>
        </div>
      </div>

      <div className={`grid grid-cols-3 gap-y-6 border-t ${statsPaddingClass}`} style={{ borderColor: showDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9' }}>
        {[
          { 
            icon: Maximize, 
            value: `${property.surface || property.surface_built || 0} ${t('propertyCard.surface') || 'mÂ²'}`,
            labelKey: 'propertyCard.surface'
          },
          { 
            icon: Bed, 
            value: `${property.beds || 0}`,
            labelKey: 'propertyCard.beds'
          },
          { 
            icon: Bath, 
            value: `${property.baths || 0}`,
            labelKey: 'propertyCard.baths'
          },
          { 
            icon: Waves, 
            value: (property.pool === "Oui" || property.pool === true) 
              ? (t('propertyCard.yes') || 'OUI') 
              : (t('propertyCard.no') || 'NON'),
            labelKey: 'propertyCard.pool'
          },
          { 
            icon: Map, 
            value: `${property.surface_plot || 0} ${t('propertyCard.plot') || 'mÂ²'}`,
            labelKey: 'propertyCard.land'
          },
          { 
            icon: Car, 
            value: t('propertyCard.yes') || 'OUI',
            labelKey: 'propertyCard.parking'
          }
        ].map((item, idx) => (
          <div key={idx} className="flex flex-col items-center gap-1">
            <item.icon size={16} style={{ color: cardIconColor }} />
            <span 
              className="text-[10px] font-medium text-slate-400"
              style={{ fontFamily: `${fontFamily}, sans-serif` }}
            >
              {item.value}
            </span>
            <span 
              className="text-[8px] uppercase tracking-wider text-slate-500"
              style={{ fontFamily: `${fontFamily}, sans-serif` }}
            >
              {t(item.labelKey) || ''}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
});

PropertyCard.displayName = 'PropertyCard';

// Composant principal Ã©galement memoizÃ©
const PropertyGrid = memo(function PropertyGrid({
  properties,
  agency,
  onPropertyClick,
  isLight,
  locale,
  blurAfter6 = false,
  propertiesPerRow = 3,
  cardCorners = "rounded",
  iconColor,
  cardStyle = "classic",
}: PropertyGridProps) {
  const { t } = useTranslation() as any;
  const visiblePerPage = 6;
  const cardsPerPage = 12;
  const gridColumnsClass = propertiesPerRow === 4
    ? "grid-cols-1 md:grid-cols-2 xl:grid-cols-4"
    : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3";

  return (
    <div className={`grid ${gridColumnsClass} gap-8`}>
      {properties.map((property: Villa, index: number) => {
        const shouldBlur = blurAfter6 && index % cardsPerPage >= visiblePerPage;
        return (
          <div key={property.id} className="relative">
            <div className={shouldBlur ? 'pointer-events-none select-none' : ''} style={shouldBlur ? { filter: 'blur(6px)', opacity: 0.6 } : undefined}>
              <PropertyCard
                property={property}
                agency={agency}
                onClick={onPropertyClick}
                isLight={isLight}
                locale={locale}
                cardCorners={cardCorners}
                iconColor={iconColor}
                cardStyle={cardStyle}
              />
            </div>
            {shouldBlur && (
              <div className={`absolute inset-0 flex flex-col items-center justify-center ${cardCorners === "square" ? "rounded-none" : "rounded-[2.5rem]"} bg-white/30 backdrop-blur-[2px]`}>
                <div className="px-6 py-4 bg-white/90 rounded-2xl shadow-xl text-center border border-slate-100">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto mb-2 text-slate-400"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-600">{t('contact.title').toUpperCase()}</p>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
});

export default PropertyGrid;

