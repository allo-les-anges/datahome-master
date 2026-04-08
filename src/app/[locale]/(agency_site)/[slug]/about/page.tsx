"use client";

import { useEffect, useState, use } from "react";
import { useTranslation } from "@/contexts/I18nContext";
import { useAgency } from "@/contexts/AgencyContext";
import { Loader2 } from "lucide-react";

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

  useEffect(() => {
    setMounted(true);
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
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-white">
        <Loader2 className="animate-spin text-slate-400 mb-4" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
          {t('common.loading') || "Chargement..."}
        </p>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-white text-slate-900 transition-colors duration-500"
      style={{ 
        fontFamily: `${fontFamily}, 'Helvetica Neue', Arial, sans-serif`,
        fontWeight: 400
      }}
    >
      <main>
        {/* Header / Hero Section */}
        <section className="pt-52 pb-20 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row items-start gap-16">
              
              <div className="flex-1 space-y-8">
                <h1 
                  className="text-5xl md:text-7xl font-serif italic border-l-4 pl-8" 
                  style={{ 
                    borderColor: brandColor,
                    fontFamily: `'Playfair Display', ${fontFamily}, serif`
                  }}
                >
                  {agency?.about_title || t('about.title') || "Notre Histoire"}
                </h1>
                
                <div className="prose prose-lg max-w-none">
                  <div 
                    className="text-slate-600 leading-relaxed whitespace-pre-wrap font-light text-xl italic"
                    style={{ fontFamily: `${fontFamily}, sans-serif` }}
                  >
                    {agency?.about_text || t('about.text') || "L'excellence immobilière à votre service."}
                  </div>
                </div>
              </div>

              {agency?.hero_url && (
                <div className="w-full md:w-1/3 aspect-[3/4] rounded-[3rem] overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-700">
                  <img 
                    src={agency.hero_url} 
                    alt={agency.agency_name} 
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Section Signature */}
        <section className="py-32 bg-slate-50 border-y border-black/5">
          <div className="max-w-4xl mx-auto px-6 text-center space-y-4">
            <h2 
              className="text-3xl font-serif italic" 
              style={{ 
                color: brandColor,
                fontFamily: `'Playfair Display', ${fontFamily}, serif`
              }}
            >
              {agency?.agency_name}
            </h2>
            <p 
              className="text-slate-500 uppercase tracking-[0.4em] text-[10px] font-bold"
              style={{ fontFamily: `${fontFamily}, sans-serif` }}
            >
              {t('about.signature') || "L'immobilier sous un nouveau regard"}
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}