"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { Bed, Bath, Waves, Car, Maximize, Map, ChevronRight, Heart, Lock } from 'lucide-react';
import Link from 'next/link';
import { useTheme } from "next-themes";
import { useTranslation } from "@/contexts/I18nContext";

interface PropertyCardProps {
  property: any;
  agency?: any;
  isLight?: boolean;
  isLocked?: boolean;
  onContact?: () => void;
}

/* Skeleton inline — aucune donnée réelle dans le DOM */
function Skel({ w = 'w-24', h = 'h-4' }: { w?: string; h?: string }) {
  return <span className={`inline-block ${w} ${h} rounded bg-slate-300/60 animate-pulse align-middle`} />;
}

export default function PropertyCard({ property, agency, isLight = false, isLocked = false, onContact }: PropertyCardProps) {
  const { resolvedTheme } = useTheme();
  const { t, locale } = useTranslation() as any;
  const [mounted, setMounted] = useState(false);
  const EUR_TO_AED = 3.97;
  const isArabic = locale === 'ar';
  const rawPrice = property.price || 0;
  const eurFormatted = `${new Intl.NumberFormat('de-DE').format(rawPrice)} €`;
  const aedFormatted = `${new Intl.NumberFormat('ar-AE').format(Math.round(rawPrice * EUR_TO_AED))} د.إ`;

  // --- EXTRACTION DE LA COULEUR DYNAMIQUE ---
  const primaryColor = useMemo(() => {
    return agency?.theme?.primary || 
           agency?.colors?.primary || 
           agency?.color || 
           "#D4AF37"; 
  }, [agency]);

  // --- EXTRACTION DE LA POLICE DYNAMIQUE ---
  const fontFamily = useMemo(() => {
    return agency?.font_family || 'Montserrat';
  }, [agency]);

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

  const detailUrl = isLocked ? '#' : `/bien/${property.id}${isLight ? '?pack=light' : ''}`;

  const handleCardClick = (e: React.MouseEvent) => {
    if (isLocked) e.preventDefault();
  };

  return (
    <Link href={detailUrl} onClick={handleCardClick} className="group flex flex-col w-full transition-all duration-500">
      <div
        className="relative h-[380px] overflow-hidden rounded-none border transition-colors duration-500"
        style={{
          backgroundColor: showDark ? '#0f172a' : '#f1f5f9',
          borderColor: showDark ? 'rgba(255,255,255,0.05)' : '#e2e8f0'
        }}
      >
        {/* Image — blurée si verrou actif */}
        <img
          src={property.images?.[0] || "/placeholder-house.jpg"}
          alt={isLocked ? "Propriété confidentielle" : property.titre}
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          style={isLocked ? { filter: 'blur(12px)', transform: 'scale(1.08)' } : undefined}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90" />

        {/* OVERLAY DE VERROUILLAGE — intercepte les clics, données réelles absentes du DOM */}
        {isLocked && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/50 backdrop-blur-[2px]">
            <div className="flex flex-col items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-white/10 border border-white/30 flex items-center justify-center backdrop-blur-sm">
                <Lock size={24} className="text-white" strokeWidth={1.5} />
              </div>
              <button
                onClick={(e) => { e.preventDefault(); onContact?.(); }}
                className="flex items-center gap-2 px-6 py-3 text-[11px] font-black uppercase tracking-[0.25em] text-white border border-white/60 hover:bg-white hover:text-black transition-all duration-300"
                style={{ backgroundColor: 'rgba(0,0,0,0.4)' }}
              >
                <Lock size={12} strokeWidth={2.5} />
                {t('contact.title').toUpperCase()}
              </button>
            </div>
          </div>
        )}

        {/* BADGES GAUCHE */}
        <div className="absolute bottom-6 left-6 flex flex-wrap gap-2 max-w-[70%] z-10">
          <span
            className="text-[9px] font-black px-4 py-2 rounded-none uppercase tracking-widest shadow-xl border border-white/10"
            style={{
              backgroundColor: isLight ? 'black' : primaryColor,
              color: isLight ? 'white' : 'black'
            }}
          >
            {/* Référence jamais dans le DOM si verrouillé */}
            {isLocked ? '••• ••••••' : translate('propertyCard.ref', { ref: property.ref || property.id_externe })}
          </span>
          <span className="bg-black/60 backdrop-blur-md text-white border border-white/30 text-[8px] font-bold px-4 py-2 rounded-none uppercase tracking-[0.2em]">
            {property.type || "EXCLUSIVITÉ"}
          </span>
        </div>

        {/* BOUTONS DROITE */}
        <div className="absolute bottom-6 right-6 flex flex-col gap-2 z-10">
          {!isLocked && (
            <button className="bg-black/40 backdrop-blur-md p-3 rounded-none border border-white/20 text-white hover:bg-opacity-100 transition-all">
              <Heart size={18} strokeWidth={1.5} />
            </button>
          )}
          <div
            className="p-3 rounded-none shadow-xl transform group-hover:translate-x-1 transition-all border border-white/10"
            style={{
              backgroundColor: isLight ? 'black' : primaryColor,
              color: isLight ? 'white' : 'black'
            }}
          >
            {isLocked ? <Lock size={20} strokeWidth={2} /> : <ChevronRight size={20} strokeWidth={2.5} />}
          </div>
        </div>
      </div>

      <div className="py-8 px-2">
        <div className="flex justify-between items-start gap-4 mb-3">
          <h3
            className="text-2xl italic leading-tight flex-grow line-clamp-1 font-normal"
            style={{
              fontFamily: `${fontFamily}, 'Playfair Display', serif`,
              color: showDark ? '#ffffff' : '#0f172a',
              fontWeight: 400
            }}
          >
            {/* Titre : affiché même verrouillé (non sensible) */}
            {property.titre}
          </h3>
          {/* Prix : jamais dans le DOM si verrouillé */}
          <span className="text-right pt-1 shrink-0" style={{ color: isLight ? 'black' : primaryColor }}>
            {isLocked
              ? <Skel w="w-28" h="h-6" />
              : <>
                  <span className="text-xl font-bold block">{isArabic ? aedFormatted : eurFormatted}</span>
                  {isArabic && <span className="text-xs font-normal text-slate-400 block">{eurFormatted}</span>}
                </>
            }
          </span>
        </div>
        {/* Ville / région : jamais dans le DOM si verrouillé */}
        <div className="flex items-center gap-2 text-[10px] tracking-[0.3em] uppercase font-bold" style={{ color: showDark ? '#e2e8f0' : '#475569' }}>
          <span style={{ color: isLight ? 'black' : primaryColor }}>●</span>
          {isLocked
            ? <><Skel w="w-20" h="h-3" /><span className="opacity-30">|</span><Skel w="w-16" h="h-3" /></>
            : <><span style={{ fontFamily: `${fontFamily}, sans-serif` }}>{property.town}</span><span className="opacity-30">|</span><span style={{ fontFamily: `${fontFamily}, sans-serif` }}>{property.region}</span></>
          }
        </div>
      </div>

      {/* ICONES TECHNIQUES */}
      <div className="grid grid-cols-3 gap-y-6 pt-6 border-t" style={{ borderColor: showDark ? 'rgba(255,255,255,0.1)' : '#f1f5f9' }}>
        {[
          { 
            icon: Maximize, 
            value: `${property.surface_built || 0} ${t('propertyCard.surface') || 'm²'}`,
            label: t('propertyCard.surface') || 'm²'
          },
          { 
            icon: Bed, 
            value: `${property.beds || 0}`,
            label: t('propertyCard.beds') || 'lits'
          },
          { 
            icon: Bath, 
            value: `${property.baths || 0}`,
            label: t('propertyCard.baths') || 'sdb'
          },
          { 
            icon: Waves, 
            value: (property.pool === "Oui" || property.pool === true) ? "✓" : "✗",
            label: t('propertyDetail.pool') || 'Piscine'
          },
          { 
            icon: Map, 
            value: `${property.surface_plot || 0} ${t('propertyCard.plot') || 'm² terrain'}`,
            label: t('propertyCard.plot') || 'm² terrain'
          },
          { 
            icon: Car, 
            value: "✓",
            label: t('propertyDetail.parking') || 'Parking'
          }
        ].map((item, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <div 
              className="w-8 h-8 flex items-center justify-center border"
              style={{ 
                backgroundColor: showDark ? 'rgba(255,255,255,0.05)' : '#f8fafc',
                borderColor: showDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'
              }}
            >
              <item.icon size={14} style={{ color: isLight ? 'black' : primaryColor }} />
            </div>
            <div className="flex flex-col">
              <span 
                className="text-[11px] font-medium"
                style={{ 
                  fontFamily: `${fontFamily}, sans-serif`,
                  color: showDark ? '#f1f5f9' : '#1e293b'
                }}
              >
                {item.value}
              </span>
              <span 
                className="text-[8px] uppercase tracking-wider text-slate-500"
                style={{ fontFamily: `${fontFamily}, sans-serif` }}
              >
                {item.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </Link>
  );
}