"use client";

import React, { useState, useEffect } from 'react';
import { Bed, Bath, Waves, Car, Maximize, Map, ChevronRight, Heart } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from "next-themes";
import { useTranslation } from "@/contexts/I18nContext";

export default function PropertyCard({ property, isLight = false }: { property: any, isLight?: boolean }) {
  const { resolvedTheme } = useTheme();
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const priceFormatted = new Intl.NumberFormat('de-DE').format(property.price || 0);

  useEffect(() => {
    setMounted(true);
  }, []);

  const translate = (key: string, params?: Record<string, string>) => {
    let text = t(key);
    if (params && text) {
      Object.entries(params).forEach(([k, v]) => {
        text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
      });
    }
    return text || key;
  };

  if (!mounted) return null;
  const showDark = resolvedTheme === 'dark' && !isLight;
  const detailUrl = `/property/${property.id_externe || property.id}${isLight ? '?pack=light' : ''}`;

  return (
    <Link href={detailUrl} className="group flex flex-col w-full transition-all duration-500">
      <div 
        className="relative h-[380px] overflow-hidden rounded-none border transition-colors duration-500"
        style={{ 
          backgroundColor: showDark ? '#0f172a' : '#f1f5f9',
          borderColor: showDark ? 'rgba(255,255,255,0.05)' : '#e2e8f0'
        }}
      >
        <img 
          src={property.images?.[0] || "/placeholder-house.jpg"} 
          alt={property.titre}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90" />

        {/* BADGES GAUCHE - Utilise var(--brand-primary) */}
        <div className="absolute bottom-6 left-6 flex flex-wrap gap-2 max-w-[70%] z-10">
          <span 
            className="text-[9px] font-black px-4 py-2 rounded-none uppercase tracking-widest shadow-xl border border-white/10"
            style={{ 
              backgroundColor: isLight ? 'black' : 'var(--brand-primary)',
              color: isLight ? 'white' : 'black' 
            }}
          >
            {translate('propertyCard.ref', { ref: property.ref || property.id_externe })}
          </span>
          <span className="bg-black/60 backdrop-blur-md text-white border border-white/30 text-[8px] font-bold px-4 py-2 rounded-none uppercase tracking-[0.2em]">
            {property.type || t('propertyCard.exclusivity')}
          </span>
        </div>

        {/* BOUTONS DROITE */}
        <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-10">
          <button className="bg-black/40 backdrop-blur-md p-3 rounded-none border border-white/20 text-white hover:bg-primary transition-all">
            <Heart size={18} strokeWidth={1.5} />
          </button>
          <div 
            className="p-3 rounded-none shadow-xl transform group-hover:translate-x-1 transition-all border border-white/10"
            style={{ 
              backgroundColor: isLight ? 'black' : 'var(--brand-primary)',
              color: isLight ? 'white' : 'black'
            }}
          >
            <ChevronRight size={20} strokeWidth={2.5} />
          </div>
        </div>
      </div>

      <div className="py-8 px-2">
        <div className="flex justify-between items-start gap-4 mb-3">
          <h3 className="font-serif text-2xl italic leading-tight flex-grow line-clamp-1" style={{ color: showDark ? '#ffffff' : '#0f172a' }}>
            {property.titre}
          </h3>
          <span className="text-xl font-bold pt-1" style={{ color: isLight ? 'black' : 'var(--brand-primary)' }}>
            {priceFormatted} €
          </span>
        </div>
        <div className="flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase font-bold" style={{ color: showDark ? '#e2e8f0' : '#475569' }}>
          <span style={{ color: isLight ? 'black' : 'var(--brand-primary)' }}>●</span>
          {property.town} <span className="opacity-30">|</span> {property.region}
        </div>
      </div>

      {/* ICONES TECHNIQUES */}
      <div className="grid grid-cols-3 gap-y-6 pt-6 border-t" style={{ borderColor: showDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9' }}>
        {[
          { icon: Maximize, value: `${property.surface_built} m²` },
          { icon: Bed, value: `${property.beds} ${t('propertyCard.beds')}` },
          { icon: Bath, value: `${property.baths} ${t('propertyCard.baths')}` },
          { icon: Waves, value: property.pool === "Oui" ? t('propertyCard.pool') : t('propertyCard.noPool') },
          { icon: Map, value: `${property.surface_plot} m²` },
          { icon: Car, value: t('propertyCard.garage') }
        ].map((item, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <div 
              className="w-8 h-8 flex items-center justify-center border"
              style={{ 
                backgroundColor: showDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                borderColor: showDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'
              }}
            >
              <item.icon size={14} style={{ color: isLight ? 'black' : 'var(--brand-primary)' }} />
            </div>
            <span className="text-[11px] font-medium" style={{ color: showDark ? '#f1f5f9' : '#1e293b' }}>
              {item.value}
            </span>
          </div>
        ))}
      </div>
    </Link>
  );
}