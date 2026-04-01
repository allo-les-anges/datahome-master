"use client";

import React, { useState } from 'react';
import { useTranslation } from "@/contexts/I18nContext";

interface HeroProps {
  agency?: any; // Ajout crucial pour corriger l'erreur de build
  title?: string;
  subtitle?: string;
  backgroundImage?: string;
  agencyName?: string;
}

export default function Hero({ agency, title, subtitle, backgroundImage, agencyName }: HeroProps) {
  const { t } = useTranslation() as any;
  const [error, setError] = useState(false);

  // --- LOGIQUE DE PERSONNALISATION DASHBOARD ---
  // On utilise la couleur du dashboard ou le doré par défaut
  const brandColor = agency?.primary_color || "#D4AF37";

  // --- NETTOYAGE DES DONNÉES IMAGE ---
  const cleanBgUrl = backgroundImage ? backgroundImage.replace(/['"]+/g, '').trim() : null;
  const isValidUrl = cleanBgUrl && (cleanBgUrl.startsWith('http') || cleanBgUrl.startsWith('/'));

  const finalBg = (!isValidUrl || error) 
    ? "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop" 
    : cleanBgUrl;

  return (
    <div className="relative w-full h-[85vh] flex items-center justify-center overflow-hidden bg-slate-900 top-0 left-0 mt-0 block">
      
      {/* IMAGE DE FOND DYNAMIQUE */}
      <div className="absolute inset-0 z-0">
        <img
          src={finalBg}
          alt={agencyName || "Luxury Property"}
          className="w-full h-full object-cover transition-transform duration-[10s] scale-100"
          onError={() => setError(true)}
          style={{ opacity: 0.85 }} 
        />
        {/* OVERLAY SOMBRE UNIFIÉ */}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* CONTENU TEXTUEL */}
      <div className="relative z-10 text-center px-6 max-w-4xl">
        {/* Nom de l'agence ou Excellence */}
        <span className="inline-block text-[10px] md:text-[11px] font-black uppercase tracking-[0.6em] text-white/70 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          {agencyName || t('footer.excellence') || "EXCELLENCE"}
        </span>
        
        {/* Titre Principal */}
        <h1 className="text-4xl md:text-7xl font-serif italic text-white leading-[1.1] mb-10 drop-shadow-2xl animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
          {title || (
            <>
              {t('footer.excellence') || "Luxury Real Estate"} <br /> 
              <span className="not-italic font-sans font-light uppercase tracking-tighter opacity-80 text-2xl md:text-3xl">
                {t('nav.subtitle') || "Modern Living"}
              </span>
            </>
          )}
        </h1>
        
        {/* Sous-titre */}
        <p className="text-white/80 text-[10px] md:text-[12px] uppercase tracking-[0.4em] font-medium max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500 mb-8">
          {subtitle || t('nav.subtitle')}
        </p>

        {/* Ligne décorative à la couleur du Dashboard */}
        <div 
          className="w-24 h-[1px] mx-auto animate-in fade-in zoom-in duration-1000 delay-700"
          style={{ backgroundColor: brandColor }}
        />
      </div>

      {/* GRADIENT DE TRANSITION */}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-slate-50 via-slate-50/20 to-transparent z-20" />
    </div>
  );
}