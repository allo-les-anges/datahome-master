// src/components/PropertyDetailClient.tsx
"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import ContactForm from "@/components/ContactForm";
import { 
  Bed, Bath, Maximize, MessageCircle, Home, Waves, Car, MapPin, Navigation, ImageIcon, Play, X
} from "lucide-react";
import { useTranslation } from "@/contexts/I18nContext";
import { useSearchParams } from "next/navigation";

interface PropertyDetailClientProps {
  property: any;
  agency: any;
}

export default function PropertyDetailClient({ property, agency }: PropertyDetailClientProps) {
  const { t, locale } = useTranslation() as any;
  const searchParams = useSearchParams();
  const [activeImage, setActiveImage] = useState(0);
  const [mounted, setMounted] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const isLight = searchParams.get('pack') === 'light' || agency?.package_level === 'light';

  const primaryColor = useMemo(() => {
    return agency?.primary_color || 
           agency?.theme?.primary || 
           agency?.color || 
           "#D4AF37"; 
  }, [agency]);

  const fontFamily = agency?.font_family || 'Montserrat';

  // Récupérer la vidéo (peut être une URL ou un objet)
  const videoUrl = useMemo(() => {
    if (!property) return null;
    
    // Si video_url est une chaîne directe
    if (typeof property.video_url === 'string' && property.video_url) {
      return property.video_url;
    }
    
    // Si video_url est un objet avec des URLs par langue
    if (property.video_url && typeof property.video_url === 'object') {
      return property.video_url[locale] || property.video_url.fr || property.video_url.en || null;
    }
    
    return null;
  }, [property, locale]);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      if (clientWidth > 0) {
        const newIndex = Math.round(scrollLeft / clientWidth);
        if (newIndex !== activeImage) setActiveImage(newIndex);
      }
    }
  };

  const description = useMemo(() => {
    if (!property) return "";
    
    if (property[`description_${locale}`]) {
      return property[`description_${locale}`];
    }
    if (property.description_fr) {
      return property.description_fr;
    }
    if (property.description) {
      return property.description;
    }
    if (property.details) {
      return property.details;
    }
    return "";
  }, [property, locale]);

  useEffect(() => {
    if (property && mounted) {
      console.log("📦 [PropertyDetailClient] Propriété reçue:", {
        id: property.id,
        titre: property.titre,
        hasDescriptionFr: !!property.description_fr,
        localeActuelle: locale,
        videoUrl: videoUrl
      });
    }
  }, [property, mounted, locale, videoUrl]);

  const images = property?.images || [];
  const numericPrice = Number(property?.price || property?.prix || 0);
  const EUR_TO_AED = 3.97;
  const isArabic = locale === 'ar';
  const displayPrice = isArabic
    ? `${new Intl.NumberFormat('ar-AE').format(Math.round(numericPrice * EUR_TO_AED))} د.إ`
    : `${numericPrice.toLocaleString('fr-FR')} €`;
  const whatsappNumber = (property?.phone || agency?.whatsapp_number || agency?.phone || "34627768233").replace(/\D/g, '');

  if (!mounted || !property) return null;

  const cleanDescription = description ? description.replace(/<p class="title">/g, '<p class="title" style="font-weight: 600; margin-top: 1.5rem; margin-bottom: 0.5rem;">') : "";

  // Fonction pour extraire l'ID YouTube ou Vimeo
  const getEmbedUrl = (url: string) => {
    if (!url) return null;
    
    // YouTube
    const youtubeRegex = /(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&]+)/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}`;
    }
    
    // Vimeo
    const vimeoRegex = /vimeo\.com\/(\d+)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch) {
      return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
    }
    
    // Si c'est déjà une URL d'embed
    if (url.includes('embed') || url.includes('player')) {
      return url;
    }
    
    return url;
  };

  const embedUrl = videoUrl ? getEmbedUrl(videoUrl) : null;

  return (
    <main 
      className={`min-h-screen relative z-10 transition-colors duration-500 ${isLight ? 'bg-white' : 'bg-[#0A0A0A]'} pt-24 md:pt-32`}
      style={{ 
        fontFamily: `${fontFamily}, 'Helvetica Neue', Arial, sans-serif`,
        fontWeight: 400
      }}
    >
      {/* Modal vidéo */}
      {isVideoModalOpen && embedUrl && (
        <div 
          className="fixed inset-0 z-[300] bg-black/95 flex items-center justify-center p-4"
          onClick={() => setIsVideoModalOpen(false)}
        >
          <button 
            onClick={() => setIsVideoModalOpen(false)}
            className="absolute top-6 right-6 text-white hover:text-gray-300 transition-colors z-[310]"
          >
            <X size={32} />
          </button>
          <div 
            className="relative w-full max-w-5xl aspect-video"
            onClick={(e) => e.stopPropagation()}
          >
            <iframe
              src={embedUrl}
              className="w-full h-full rounded-2xl"
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            />
          </div>
        </div>
      )}

      <div className="pb-20"> 
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          
          {/* GALERIE D'IMAGES / VIDÉO */}
          <section className="mb-12 md:mb-16">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[350px] md:h-[600px]">
              <div className="md:col-span-3 relative rounded-[1.5rem] md:rounded-[3rem] overflow-hidden shadow-2xl bg-zinc-900">
                
                {/* Affichage de la vidéo en premier si disponible */}
                {embedUrl && activeImage === -1 ? (
                  <div className="relative w-full h-full">
                    <iframe
                      src={embedUrl}
                      className="w-full h-full"
                      allowFullScreen
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    />
                    <button
                      onClick={() => setIsVideoModalOpen(true)}
                      className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-full text-[10px] uppercase tracking-widest flex items-center gap-2 z-20 hover:bg-black/80 transition-colors"
                    >
                      <Play size={14} /> Plein écran
                    </button>
                  </div>
                ) : (
                  <>
                    <div ref={scrollContainerRef} onScroll={handleScroll} className="flex md:block h-full overflow-x-auto md:overflow-x-hidden snap-x snap-mandatory scrollbar-hide">
                      {images.map((img: string, idx: number) => (
                        <div 
                          key={idx} 
                          className="min-w-full h-full snap-center md:absolute md:inset-0 md:transition-opacity md:duration-700" 
                          style={{ 
                            opacity: activeImage === idx ? 1 : 0, 
                            zIndex: activeImage === idx ? 10 : 0,
                            pointerEvents: activeImage === idx ? 'auto' : 'none'
                          }}
                        >
                          <img src={img} className="w-full h-full object-cover" alt="" loading="lazy" />
                        </div>
                      ))}
                    </div>
                    <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 bg-black/60 backdrop-blur-md text-white px-3 py-1 md:px-4 md:py-2 rounded-full text-[8px] md:text-[10px] uppercase tracking-widest flex items-center gap-2 z-20">
                      <ImageIcon size={12} className="md:size-14" /> {activeImage + 1} / {images.length}
                    </div>
                  </>
                )}
              </div>

              <div className="hidden md:flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
                {/* Bouton vidéo en premier si disponible */}
                {embedUrl && (
                  <button 
                    onClick={() => setActiveImage(-1)} 
                    className={`relative flex-shrink-0 w-full h-32 rounded-2xl overflow-hidden border-2 transition-all ${activeImage === -1 ? 'scale-95' : 'opacity-40'}`}
                    style={{ borderColor: activeImage === -1 ? primaryColor : 'transparent' }}
                  >
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                      <Play size={24} className="text-white" />
                    </div>
                    <span className="absolute bottom-2 left-2 text-white text-[8px] bg-black/50 px-2 py-0.5 rounded-full">VIDÉO</span>
                  </button>
                )}
                
                {/* Images miniatures */}
                {images.map((img: string, idx: number) => (
                  <button 
                    key={idx} 
                    onClick={() => setActiveImage(idx)} 
                    className={`relative flex-shrink-0 w-full h-32 rounded-2xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'scale-95' : 'opacity-40'}`}
                    style={{ borderColor: activeImage === idx ? primaryColor : 'transparent' }}
                  >
                    <img src={img} className="w-full h-full object-cover" alt="" loading="lazy" />
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* RESTE DU CODE INCHANGÉ... */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 lg:gap-16">
            <div className="lg:col-span-2">
              <h1 
                className="text-3xl md:text-5xl lg:text-7xl mb-4 md:mb-6 leading-tight font-normal"
                style={{ 
                  fontFamily: `${fontFamily}, 'Playfair Display', serif`,
                  color: isLight ? '#0f172a' : '#ffffff',
                  fontWeight: 400,
                  letterSpacing: '-0.02em'
                }}
              >
                {property.titre || property.title || "Propriété Exclusive"}
              </h1>

              <div className="flex items-center gap-2 md:gap-3 text-slate-500 mb-8 md:mb-12 text-[9px] md:text-[11px] uppercase tracking-[0.2em] font-bold">
                <MapPin size={14} className="md:size-18" color={primaryColor} />
                <span style={{ fontFamily: `${fontFamily}, sans-serif` }}>{property.town || property.ville}</span>
                <span className="opacity-30">•</span>
                <span style={{ fontFamily: `${fontFamily}, sans-serif` }}>{property.region}</span>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-12 md:mb-16">
                {[
                  { icon: Bed, val: property.beds, labelKey: 'propertyCard.beds', defaultLabel: 'CHAMBRES' },
                  { icon: Bath, val: property.baths, labelKey: 'propertyCard.baths', defaultLabel: 'BAINS' },
                  { icon: Maximize, val: property.surface_built, labelKey: 'propertyCard.surface', defaultLabel: 'M² CONSTRUIT' },
                  { icon: Home, val: property.surface_plot, labelKey: 'propertyCard.land', defaultLabel: 'M² TERRAIN' },
                  { icon: Waves, val: (property.pool === "Oui" || property.pool === true ? t('propertyCard.yes') || "OUI" : t('propertyCard.no') || "NON"), labelKey: 'propertyCard.pool', defaultLabel: 'PISCINE' },
                  { icon: Car, val: t('propertyCard.yes') || "OUI", labelKey: 'propertyCard.parking', defaultLabel: 'PARKING' },
                ].map((item, i) => (
                  <div 
                    key={i} 
                    className={`p-4 md:p-6 lg:p-8 rounded-[1.5rem] md:rounded-[2rem] border text-left transition-all hover:scale-[1.02] ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#111] border-white/5 hover:border-white/10'}`}
                  >
                    <item.icon className="mb-3 md:mb-4 lg:mb-6" color={primaryColor} size={20} />
                    <p 
                      className="text-xl md:text-2xl lg:text-3xl mb-1 font-normal"
                      style={{ 
                        fontFamily: `${fontFamily}, 'Playfair Display', serif`,
                        color: isLight ? '#0f172a' : '#ffffff',
                        fontWeight: 400
                      }}
                    >
                      {item.val || "0"}
                    </p>
                    <p className="text-[8px] md:text-[9px] uppercase text-slate-500 font-bold tracking-[0.2em]">
                      {t(item.labelKey) || item.defaultLabel}
                    </p>
                  </div>
                ))}
              </div>

              {/* SECTION DESCRIPTION */}
              <div className="mb-12 md:mb-16">
                <h2 
                  className="text-xl md:text-2xl italic mb-4 md:mb-6 font-normal"
                  style={{ 
                    fontFamily: `${fontFamily}, 'Playfair Display', serif`,
                    color: isLight ? '#0f172a' : '#ffffff'
                  }}
                >
                  {t('propertyDetail.description') || "Description"}
                </h2>
                {cleanDescription ? (
                  <div 
                    className={`text-base md:text-xl font-light leading-relaxed space-y-4 md:space-y-6 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}
                    dangerouslySetInnerHTML={{ __html: cleanDescription }}
                    style={{ 
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                      maxWidth: '100%',
                      fontFamily: `${fontFamily}, sans-serif`
                    }}
                  />
                ) : (
                  <p className={`text-base md:text-xl font-light italic ${isLight ? 'text-slate-400' : 'text-slate-500'}`}>
                    {t('propertyDetail.noDescription') || "Aucune description disponible pour ce bien."}
                  </p>
                )}
              </div>

              {/* SECTION LOCALISATION */}
              <div className="mt-8 md:mt-10 border-t pt-8 md:pt-10" style={{ borderColor: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.1)' }}>
                <div className="flex items-center gap-3 md:gap-4 mb-6 md:mb-8">
                  <div className="h-10 w-10 md:h-12 md:w-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${primaryColor}20` }}>
                    <Navigation size={20} className="md:size-24" color={primaryColor} />
                  </div>
                  <div>
                    <h2 
                      className="text-xl md:text-2xl lg:text-3xl italic font-normal"
                      style={{ 
                        fontFamily: `${fontFamily}, 'Playfair Display', serif`,
                        color: isLight ? '#0f172a' : '#ffffff'
                      }}
                    >
                      {t('propertyDetail.location') || "Localisation"}
                    </h2>
                    <p className="text-[9px] md:text-[10px] uppercase tracking-widest text-slate-400 font-bold">
                      {property.town || property.ville}, {property.region}
                    </p>
                  </div>
                </div>
                <div className="relative rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-xl h-[250px] md:h-[400px]" style={{ border: `1px solid ${isLight ? '#e2e8f0' : 'rgba(255,255,255,0.1)'}` }}>
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0, filter: isLight ? "none" : "grayscale(1) invert(0.9) contrast(1.2)" }}
                    loading="lazy"
                    allowFullScreen
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(property.town || property.ville || "")},${encodeURIComponent(property.region || "")}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                    title="Location map"
                  ></iframe>
                </div>
              </div>
            </div>

            {/* SIDEBAR - Contact Form */}
            <div className="lg:col-span-1">
              <div className={`sticky top-32 rounded-[1.5rem] md:rounded-[2rem] lg:rounded-[3rem] overflow-hidden shadow-2xl ${isLight ? 'bg-white border border-slate-200' : 'bg-[#0A0A0A] border border-white/10'}`}>
                <div className="p-5 md:p-6 lg:p-8 pb-3 md:pb-4">
                  <p className="text-[9px] md:text-[10px] uppercase text-slate-400 mb-1 md:mb-2 font-bold tracking-widest">
                    {t('propertyDetail.price') || "PRIX"}
                  </p>
                  <p 
                    className="text-3xl md:text-4xl lg:text-5xl leading-none font-normal"
                    style={{ 
                      fontFamily: `${fontFamily}, 'Playfair Display', serif`,
                      color: isLight ? '#0f172a' : '#ffffff',
                      fontWeight: 400
                    }}
                  >
                    {displayPrice}
                  </p>
                </div>
                
                <ContactForm agency={agency} propertyRef={property.ref || property.id_externe || property.id} isLight={isLight} />

                <div className="p-5 md:p-6 lg:p-8 pt-0">
                  <a 
                    href={`https://wa.me/${whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-2 md:gap-3 py-3 md:py-4 lg:py-5 rounded-xl md:rounded-2xl font-bold uppercase text-[9px] md:text-[10px] tracking-widest transition-all"
                    style={{ 
                      border: `1px solid ${isLight ? '#e2e8f0' : 'rgba(255,255,255,0.1)'}`,
                      color: isLight ? '#0f172a' : '#ffffff',
                      backgroundColor: 'transparent',
                      fontFamily: `${fontFamily}, sans-serif`
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = isLight ? '#f1f5f9' : 'rgba(255,255,255,0.05)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'transparent';
                    }}
                  >
                    <MessageCircle size={16} className="md:size-18 text-green-500" /> 
                    {t('propertyDetail.whatsapp') || "WHATSAPP DIRECT"}
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}