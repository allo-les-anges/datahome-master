"use client";

import { useEffect, useState, use } from "react";
import { useTranslation } from "@/contexts/I18nContext";
import { useAgency } from "@/contexts/AgencyContext";
import { Loader2, ChevronRight, Award, Users, MapPin, Clock, Quote } from "lucide-react";

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

  // Valeurs par défaut pour les statistiques
  const stats = [
    { 
      icon: Award, 
      value: "15+", 
      label: t('about.years_experience') || "Années d'expérience",
      description: "dans l'immobilier de luxe"
    },
    { 
      icon: Users, 
      value: "500+", 
      label: t('about.clients_satisfied') || "Clients satisfaits",
      description: "dans toute la région"
    },
    { 
      icon: MapPin, 
      value: "50+", 
      label: t('about.properties_sold') || "Propriétés vendues",
      description: "biens d'exception"
    },
    { 
      icon: Clock, 
      value: "24/7", 
      label: t('about.support') || "Accompagnement",
      description: "disponibilité totale"
    }
  ];

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
                className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6"
                style={{ 
                  fontFamily: `'Playfair Display', ${fontFamily}, serif`,
                  fontWeight: 600,
                  letterSpacing: '-0.02em'
                }}
              >
                {agency?.about_title || t('about.title') || "Notre Histoire"}
              </h1>
              <div className="w-24 h-1 mx-auto mb-8" style={{ backgroundColor: brandColor }} />
              <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto font-light">
                {agency?.tagline || "L'excellence immobilière à votre service depuis plus de 15 ans"}
              </p>
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
                      fontFamily: `'Playfair Display', ${fontFamily}, serif`,
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
                    {agency?.about_text || t('about.text') || 
                      `Fondée avec la passion de l'immobilier d'exception, notre agence réunit les meilleurs experts du marché pour vous offrir un service sur-mesure.

Notre approche unique combine une connaissance approfondie du marché local avec une vision internationale, permettant à nos clients de bénéficier du meilleur des deux mondes.

Chaque projet est unique, et c'est cette diversité qui nous motive chaque jour à repousser les limites de l'excellence immobilière.`}
                  </div>
                </div>

                {/* Bouton de contact */}
                <button 
                  className="group inline-flex items-center gap-2 px-8 py-4 rounded-full transition-all duration-300 hover:shadow-lg"
                  style={{ 
                    backgroundColor: brandColor,
                    color: 'white'
                  }}
                >
                  <span className="font-semibold tracking-wide">
                    {t('about.contact_us') || "Nous contacter"}
                  </span>
                  <ChevronRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              </div>

              {/* Citation / Témoignage */}
              <div className={`transform transition-all duration-1000 delay-700 ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-10 opacity-0'}`}>
                <div className="bg-slate-50 rounded-3xl p-10 relative">
                  <Quote className="absolute top-6 right-6 w-12 h-12 text-slate-200" />
                  <div className="space-y-6">
                    <p className="text-2xl font-light italic text-slate-700 leading-relaxed">
                      "L'immobilier n'est pas seulement une transaction, c'est la réalisation d'un rêve. Notre engagement est de transformer chaque projet en une histoire de réussite."
                    </p>
                    <div>
                      <p className="font-bold text-slate-900" style={{ color: brandColor }}>
                        {agency?.agency_name}
                      </p>
                      <p className="text-sm text-slate-500">Fondateur & CEO</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section Statistiques */}
        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 
                className="text-4xl md:text-5xl font-bold mb-4"
                style={{ 
                  fontFamily: `'Playfair Display', ${fontFamily}, serif`,
                  color: brandColor
                }}
              >
                {t('about.our_achievements') || "Nos réalisations"}
              </h2>
              <div className="w-16 h-0.5 mx-auto" style={{ backgroundColor: brandColor }} />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div 
                    key={index}
                    className={`text-center p-8 bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 transform ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
                    style={{ transitionDelay: `${800 + index * 100}ms` }}
                  >
                    <div className="inline-flex p-4 rounded-full mb-6" style={{ backgroundColor: `${brandColor}15` }}>
                      <Icon className="w-8 h-8" style={{ color: brandColor }} />
                    </div>
                    <div className="text-4xl font-bold mb-2" style={{ color: brandColor }}>
                      {stat.value}
                    </div>
                    <div className="font-semibold text-slate-900 mb-1">{stat.label}</div>
                    <div className="text-sm text-slate-500">{stat.description}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Section Valeurs */}
        <section className="py-24 px-6 bg-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 
              className="text-4xl md:text-5xl font-bold mb-6"
              style={{ 
                fontFamily: `'Playfair Display', ${fontFamily}, serif`,
                color: brandColor
              }}
            >
              {t('about.our_values') || "Nos valeurs"}
            </h2>
            <p className="text-xl text-slate-600 mb-12 font-light">
              {t('about.values_description') || "L'excellence, la transparence et l'innovation sont au cœur de notre démarche. Nous croyons en un immobilier plus humain, où chaque client est unique."}
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              {['Excellence', 'Transparence', 'Innovation', 'Confiance', 'Passion', 'Engagement'].map((value, idx) => (
                <span 
                  key={idx}
                  className="px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 hover:shadow-md"
                  style={{ 
                    backgroundColor: `${brandColor}10`,
                    color: brandColor,
                    border: `1px solid ${brandColor}20`
                  }}
                >
                  {value}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Signature finale */}
        <section className="py-20 bg-slate-900 text-white">
          <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
            <h2 
              className="text-5xl md:text-6xl font-light italic"
              style={{ 
                fontFamily: `'Playfair Display', ${fontFamily}, serif`,
                fontStyle: 'italic',
                fontWeight: 300
              }}
            >
              {agency?.agency_name}
            </h2>
            <p 
              className="text-slate-400 uppercase tracking-[0.3em] text-xs font-semibold"
              style={{ fontFamily: `${fontFamily}, sans-serif` }}
            >
              {t('about.signature') || "L'immobilier sous un nouveau regard"}
            </p>
            <div className="pt-6">
              <div className="inline-flex items-center gap-2 text-slate-400">
                <span className="text-sm">© {new Date().getFullYear()}</span>
                <span className="w-1 h-1 rounded-full bg-slate-500" />
                <span className="text-sm">{t('about.all_rights_reserved') || "Tous droits réservés"}</span>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}