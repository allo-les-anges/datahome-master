"use client";

import { useEffect, useState, use } from "react";
import { useTranslation } from "@/contexts/I18nContext";
import { useAgency } from "@/contexts/AgencyContext";
import { Loader2, Quote } from "lucide-react";

interface AboutPageProps {
  params: Promise<{
    slug: string;
    locale: string;
  }>;
}

export default function AboutPage({ params }: AboutPageProps) {
  const resolvedParams = use(params);
  const { t, locale } = useTranslation();
  const { agency, loading, setAgencyBySlug } = useAgency();
  const [mounted, setMounted] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setMounted(true);
    setTimeout(() => setIsVisible(true), 100);
  }, []);

  useEffect(() => {
    const currentSlug = resolvedParams.slug;
    if (currentSlug && agency?.subdomain !== currentSlug && !loading) {
      setAgencyBySlug(currentSlug);
    }
  }, [resolvedParams.slug, agency?.subdomain, loading, setAgencyBySlug]);

  const brandColor = agency?.primary_color || "#c5a059";
  const fontFamily = agency?.font_family || 'Montserrat';

  if (loading || !mounted) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-white">
        <Loader2 className="animate-spin text-slate-400 mb-4" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
          {t('common.loading') || "Chargement..."}
        </p>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-white text-slate-900 transition-all duration-700"
      style={{ 
        fontFamily: `${fontFamily}, 'Helvetica Neue', Arial, sans-serif`,
        fontWeight: 400
      }}
    >
      <main>
        {/* Hero Section avec image de fond */}
        <section className="relative h-[70vh] min-h-[500px] flex items-center justify-center overflow-hidden">
          {/* Background Image */}
          {agency?.hero_url && (
            <>
              <div className="absolute inset-0 z-0">
                <img 
                  src={agency.hero_url} 
                  alt={agency.agency_name} 
                  className="w-full h-full object-cover"
                  loading="eager"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />
              </div>
            </>
          )}
          
          {/* Content */}
          <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
            <div className={`transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
              <h1 
                className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-6"
                style={{ 
                  fontFamily: `${fontFamily}, 'Playfair Display', serif`,
                  fontWeight: 600,
                  letterSpacing: '-0.02em'
                }}
              >
                {agency?.about_title || t('about.title') || "Notre Histoire"}
              </h1>
              <div className="w-24 h-1 mx-auto" style={{ backgroundColor: brandColor }} />
            </div>
          </div>
        </section>

        {/* Section de contenu principal */}
        <section className="py-24 px-6 bg-white">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
              
              {/* Texte de présentation */}
              <div className={`space-y-8 transform transition-all duration-1000 delay-500 ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-10 opacity-0'}`}>
                <div className="space-y-4">
                  <h2 
                    className="text-4xl md:text-5xl font-bold"
                    style={{ 
                      fontFamily: `${fontFamily}, 'Playfair Display', serif`,
                      color: brandColor
                    }}
                  >
                    {agency?.agency_name}
                  </h2>
                  <div className="w-16 h-0.5" style={{ backgroundColor: brandColor }} />
                </div>
                
                <div className="prose prose-lg max-w-none">
                  <div 
                    className="text-slate-600 leading-relaxed whitespace-pre-wrap text-lg space-y-6"
                    style={{ 
                      fontFamily: `${fontFamily}, sans-serif`,
                      fontWeight: 300,
                      lineHeight: 1.8
                    }}
                  >
                    {agency?.about_text || t('about.text') || "L'excellence immobilière à votre service."}
                  </div>
                </div>
              </div>

              {/* Citation - uniquement si des données existent */}
              {agency?.testimonial_text && (
                <div className={`transform transition-all duration-1000 delay-700 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
                  <div className="bg-slate-50 rounded-3xl p-10 relative">
                    <Quote className="absolute top-6 right-6 w-12 h-12 text-slate-200" />
                    <div className="space-y-6">
                      <p className="text-2xl font-light italic text-slate-700 leading-relaxed">
                        "{agency?.testimonial_text}"
                      </p>
                      <div>
                        <p className="font-bold text-slate-900" style={{ color: brandColor }}>
                          {agency?.testimonial_author || agency?.agency_name}
                        </p>
                        {agency?.testimonial_role && (
                          <p className="text-sm text-slate-500">{agency?.testimonial_role}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}