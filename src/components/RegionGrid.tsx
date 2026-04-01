"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from "next-themes";
// CORRECTION : Chemin correct avec 's' et nom du hook useTranslation
import { useTranslation } from "@/contexts/I18nContext";
import { useSearchParams } from "next/navigation";

interface RegionGridProps {
  onRegionClick: (regionName: string) => void;
}

const REGIONS_DISPLAY = [
  { name: "Costa Blanca", image: "/images/regions/1.jpg", size: "md:col-span-2 md:row-span-1" },
  { name: "Costa del Sol", image: "/images/regions/2.jpg", size: "md:col-span-1 md:row-span-2" },
  { name: "Costa Calida", image: "/images/regions/3.jpg", size: "md:col-span-1 md:row-span-1" },
  { name: "Costa Almeria", image: "/images/regions/4.jpg", size: "md:col-span-1 md:row-span-1" }
];

export default function RegionGrid({ onRegionClick }: RegionGridProps) {
  const { resolvedTheme } = useTheme();
  // CORRECTION : Utilisation de useTranslation
  const { t } = useTranslation();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [regionCounts, setRegionCounts] = useState<Record<string, number>>({
    "Costa Blanca": 0,
    "Costa del Sol": 0,
    "Costa Calida": 0,
    "Costa Almeria": 0
  });
  const [loading, setLoading] = useState(true);

  const isLight = searchParams.get('pack') === 'light';

  useEffect(() => {
    setMounted(true);
    const fetchCounts = async () => {
      try {
        const res = await fetch('/api/regions/counts');
        const data = await res.json();
        if (res.ok) setRegionCounts(data);
      } catch (err) {
        console.error("Erreur chargement comptes régions", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCounts();
  }, []);

  if (!mounted) return null;

  const isDarkVisual = resolvedTheme === "dark" && !isLight;

  if (loading) {
    return (
      <div className="max-w-[1600px] mx-auto px-6 py-20">
        <div className="animate-pulse bg-slate-200 dark:bg-slate-700 h-64 rounded-2xl" />
      </div>
    );
  }

  return (
    <section 
      className="max-w-[1600px] mx-auto px-6 py-20 transition-colors duration-500"
      style={{ backgroundColor: isDarkVisual ? '#0A0A0A' : '#FFFFFF' }}
    >
      
      {/* HEADER */}
      <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8">
        <div className="max-w-2xl">
          <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <span className="text-[#D4AF37] text-[10px] font-black uppercase tracking-[0.4em] mb-3 block">
              {t('home.regionGrid.ourDestinations') || "Nos Destinations"}
            </span>
            <h2 
              className="text-4xl md:text-6xl font-serif italic leading-tight"
              style={{ color: isDarkVisual ? '#FFFFFF' : '#0f172a' }}
            >
              {t('home.regionGrid.exceptionalPlaces') || "Lieux d'exception"}
            </h2>
          </motion.div>
        </div>
        
        <motion.div 
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="max-w-xs border-l pl-6 pb-1"
          style={{ borderColor: isDarkVisual ? 'rgba(255,255,255,0.1)' : '#e2e8f0' }}
        >
          <p 
            className="text-xs font-light leading-relaxed italic"
            style={{ color: isDarkVisual ? '#CBD5E1' : '#64748b' }}
          >
            {t('home.regionGrid.description') || "Découvrez notre sélection exclusive de propriétés dans les plus belles régions d'Espagne."}
          </p>
        </motion.div>
      </div>

      {/* GRILLE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[300px] md:auto-rows-[400px]">
        {REGIONS_DISPLAY.map((region, index) => {
          const count = regionCounts[region.name] || 0;
          return (
            <motion.div
              key={region.name}
              initial={{ opacity: 0, scale: 0.99 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05, duration: 1, ease: [0.19, 1, 0.22, 1] }}
              onClick={() => onRegionClick(region.name)}
              className={`${region.size} group relative overflow-hidden cursor-pointer bg-slate-900 rounded-none`}
            >
              <div className="absolute inset-0">
                <img 
                  src={region.image} 
                  alt={region.name} 
                  className="w-full h-full object-cover transition-transform duration-[4s] ease-out group-hover:scale-105 opacity-90 group-hover:opacity-80" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-80" />
              </div>

              <div className="absolute inset-0 p-8 flex flex-col justify-end items-start text-white">
                <motion.div className="space-y-2 w-full">
                  <p className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#D4AF37]">
                    {count} {t('home.regionGrid.properties') || "Propriétés"}
                  </p>
                  <h3 className="text-2xl md:text-4xl font-serif italic leading-none text-white">
                    {region.name}
                  </h3>
                  <div className="relative pt-4">
                    <div className="absolute top-0 left-0 w-8 h-[1px] bg-white/40 group-hover:w-full transition-all duration-700" />
                    <div className="flex items-center justify-between pt-3 opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <span className="text-[8px] uppercase tracking-[0.4em] font-light text-white">
                        {t('home.regionGrid.discover') || "Découvrir"}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </div>
              <div className="absolute inset-0 border border-white/5 pointer-events-none" />
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}