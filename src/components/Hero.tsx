// src/components/Hero.tsx - Ajout du lazy loading
"use client";

import React, { useState, useEffect } from 'react';
import { useTranslation } from "@/contexts/I18nContext";

interface HeroProps {
  agency?: any;
  title?: string;
  subtitle?: string;
  backgroundImage?: string;
  agencyName?: string;
}

export default function Hero({ agency, title, subtitle, backgroundImage, agencyName }: HeroProps) {
  const { t } = useTranslation() as any;
  const [error, setError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);

  const brandColor = agency?.primary_color || "#D4AF37";
  const displayTitle = agency?.hero_title || title || t('footer.excellence') || "Luxury Real Estate";
  const footerConfig = typeof agency?.footer_config === 'string'
    ? (() => { try { return JSON.parse(agency.footer_config); } catch { return {}; } })()
    : (agency?.footer_config || {});
  const heroVideoEnabled = footerConfig?.integrations?.hero_video_enabled === true;
  const heroConfig = footerConfig?.hero || {};
  const heroAlignment = heroConfig.alignment === 'left' || heroConfig.alignment === 'right' ? heroConfig.alignment : 'center';
  const overlayOpacity = typeof heroConfig.overlay_opacity === 'number' ? heroConfig.overlay_opacity : 30;
  const subtitleText = heroConfig.subtitle || subtitle || t('nav.subtitle');
  const contentAlignmentClass = heroAlignment === 'left'
    ? 'items-start text-left ml-0 mr-auto'
    : heroAlignment === 'right'
      ? 'items-end text-right ml-auto mr-0'
      : 'items-center text-center mx-auto';
  const lineAlignmentClass = heroAlignment === 'left'
    ? 'mr-auto'
    : heroAlignment === 'right'
      ? 'ml-auto'
      : 'mx-auto';

  const isVideo = agency?.hero_type === 'video' && (heroVideoEnabled || Boolean(agency?.hero_url));
  const rawBgUrl = agency?.hero_url || backgroundImage;
  const cleanBgUrl = rawBgUrl ? rawBgUrl.replace(/['"]+/g, '').trim() : null;
  const isValidUrl = cleanBgUrl && (cleanBgUrl.startsWith('http') || cleanBgUrl.startsWith('/'));

  const fallbackImage = "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop";
  const finalBg = (!isValidUrl || error) ? fallbackImage : cleanBgUrl;

  return (
    <div className="relative w-full h-[85vh] flex items-center justify-center overflow-hidden bg-slate-900 top-0 left-0 mt-0 block">

      <div className="absolute inset-0 z-0">
        {isVideo && isValidUrl && !error ? (
          <video
            key={cleanBgUrl}
            src={cleanBgUrl!}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
            style={{ opacity: 0.85 }}
            onError={() => setError(true)}
          />
        ) : (
          <>
            {!imageLoaded && (
              <div className="absolute inset-0 bg-slate-800 animate-pulse" />
            )}
            <img
              src={finalBg}
              alt={agency?.agency_name || agencyName || "Luxury Property"}
              className={`w-full h-full object-cover transition-all duration-700 ${imageLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'}`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setError(true)}
              style={{ opacity: 0.85 }}
              loading="eager"
              fetchPriority="high"
            />
          </>
        )}
        <div className="absolute inset-0 bg-black" style={{ opacity: Math.min(80, Math.max(0, overlayOpacity)) / 100 }} />
      </div>

      <div className={`relative z-10 px-6 max-w-4xl flex flex-col ${contentAlignmentClass}`}>
        <span className="inline-block text-[10px] md:text-[11px] font-black uppercase tracking-[0.6em] text-white/70 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
          {agency?.agency_name || agencyName || t('footer.excellence') || "EXCELLENCE"}
        </span>
        
        <h1 className="text-4xl md:text-7xl font-serif italic text-white leading-[1.1] mb-10 drop-shadow-2xl animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-200">
          {displayTitle}
        </h1>
        
        <p className="text-white/80 text-[10px] md:text-[12px] uppercase tracking-[0.4em] font-medium max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500 mb-8">
          {subtitleText}
        </p>

        <div 
          className={`w-24 h-[2px] animate-in fade-in zoom-in duration-1000 delay-700 ${lineAlignmentClass}`}
          style={{ backgroundColor: brandColor }}
        />
      </div>

      <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-slate-50 via-slate-50/20 to-transparent z-20" />
    </div>
  );
}
