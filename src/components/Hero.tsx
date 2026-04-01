"use client";

import React, { useState } from 'react';
import { useTranslation } from "@/contexts/I18nContext";

interface HeroProps {
  title?: string;
  subtitle?: string;
  backgroundImage?: string;
  agencyName?: string;
}

export default function Hero({ title, subtitle, backgroundImage, agencyName }: HeroProps) {
  const { t } = useTranslation();
  const [error, setError] = useState(false);

  // --- NETTOYAGE DES DONNÉES ---
  const cleanBgUrl = backgroundImage ? backgroundImage.replace(/['"]+/g, '').trim() : null;
  const isValidUrl = cleanBgUrl && (cleanBgUrl.startsWith('http') || cleanBgUrl.startsWith('/'));

  const finalBg = (!isValidUrl || error) 
    ? "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop" 
    : cleanBgUrl;

  return (
    /* CORRECTION : 
       - Ajout de 'top-0 left-0' pour forcer le positionnement.
       - Ajout de 'mt-0' pour annuler toute marge supérieure héritée.
       - 'block' assure qu'il n'est pas traité comme un élément inline-block (qui peut avoir des descentes de ligne).
    */
    <div className="relative w-full h-[85vh] flex items-center justify-center overflow-hidden bg-slate-900 top-0 left-0 mt-0 block">
      
      {/* IMAGE DE FOND DYNAMIQUE */}
      <div className="absolute inset-0 z-0">
        <img
          src={finalBg}
          alt={agencyName || "Luxury Property"}
          className="w-full h-full object-cover transition-transform duration-[10s] scale-100"
          onError={() => setError(true)}
          /* CORRECTION : Opacité légèrement augmentée pour éviter l'effet 
             de "fond qui transparaît" si le parent est blanc.
          */
          style={{ opacity: 0.85 }} 
        />
        {/* OVERLAY SOMBRE UNIFIÉ */}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* CONTENU TEXTUEL */}
      <div className="relative z-10 text-center px-6 max-w-4xl">
        <span className="inline-block text-[10px] md:text-[11px] font-black uppercase tracking-[0.6em] text-white/70 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          {agencyName || t('footer.excellence')}
        </span>
        
        <h1 className="text-4xl md:text-7xl font-serif italic text-white leading-[1.1] mb-10 drop-shadow-2xl animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
          {title || (
            <>
              {t('footer.excellence')} <br /> 
              <span className="not-italic font-sans font-light uppercase tracking-tighter opacity-80 text-2xl md:text-3xl">
                {t('nav.subtitle')}
              </span>
            </>
          )}
        </h1>
        
        <p className="text-white/80 text-[10px] md:text-[12px] uppercase tracking-[0.4em] font-medium max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
          {subtitle || t('nav.subtitle')}
        </p>
      </div>

      {/* GRADIENT DE TRANSITION : 
          Assurez-vous que le 'from-slate-50' correspond exactement 
          à la couleur de fond de la section suivante dans votre page.
      */}
      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-slate-50 via-slate-50/20 to-transparent z-20" />
    </div>
  );
}