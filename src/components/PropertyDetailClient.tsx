"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import ContactForm from "@/components/ContactForm";
import { 
  Bed, Bath, Maximize, MessageCircle, Home, Waves, Car, MapPin, Navigation, ImageIcon
} from "lucide-react";
import { useTranslation } from "@/contexts/I18nContext";
import { useSearchParams } from "next/navigation";

interface PropertyDetailClientProps {
  property: any;
  agency: any;
}

export default function PropertyDetailClient({ property, agency }: PropertyDetailClientProps) {
  const { locale } = useTranslation() as any;
  const searchParams = useSearchParams();
  const [activeImage, setActiveImage] = useState(0);
  const [mounted, setMounted] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  const isLight = searchParams.get('pack') === 'light' || agency?.package_level === 'light';

  const primaryColor = useMemo(() => {
    return agency?.primary_color || agency?.theme?.primary || agency?.color || "#D4AF37"; 
  }, [agency]);

  useEffect(() => {
    setMounted(true);
    // CRITIQUE : Regardez ce log dans votre console F12 pour voir les vrais noms des clés
    console.log("Structure réelle du bien :", property);
  }, [property]);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      if (clientWidth > 0) {
        const newIndex = Math.round(scrollLeft / clientWidth);
        if (newIndex !== activeImage) setActiveImage(newIndex);
      }
    }
  };

  // 1. GESTION DES IMAGES
  const images = useMemo(() => {
    if (!property?.images) return [];
    if (Array.isArray(property.images)) return property.images;
    try {
      const parsed = JSON.parse(property.images);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }, [property?.images]);

  // 2. LOGIQUE DE TITRE MULTILINGUE
  const displayTitle = useMemo(() => {
    if (!property) return "";
    return property[`titre_${locale}`] || property.titre_fr || property.titre || "Propriété Exclusive";
  }, [property, locale]);

  // 3. LOGIQUE DE DESCRIPTION "SCAVENGER" (Cherche partout)
  const descriptionContent = useMemo(() => {
    if (!property) return "";
    
    // Étape A : Chercher la clé exacte selon la langue
    let content = property[`description_${locale}`] || property[`desc_${locale}`];

    // Étape B : Si vide, chercher n'importe quelle clé qui contient "description" ou "content"
    if (!content) {
      const keys = Object.keys(property);
      const fallbackKey = keys.find(k => 
        (k.toLowerCase().includes('description') || k.toLowerCase().includes('desc_fr')) && 
        property[k] && property[k] !== "null"
      );
      if (fallbackKey) content = property[fallbackKey];
    }

    // Étape C : Fallbacks manuels classiques
    if (!content) {
      content = property.description_fr || property.description || property.details || "";
    }

    if (!content || content === "null" || content === "undefined") return "";
    
    // Formatage final
    return content.includes('<') ? content : content.replace(/\n/g, '<br />');
  }, [property, locale]);

  const numericPrice = Number(property?.price || property?.prix || 0);
  const whatsappNumber = (property?.phone || agency?.whatsapp_number || agency?.phone || "34627768233").replace(/\D/g, '');

  if (!mounted || !property) return null;

  return (
    <main className={`min-h-screen relative z-10 transition-colors duration-500 ${isLight ? 'bg-white' : 'bg-[#0A0A0A]'} pt-24 md:pt-32`}>
      <div className="pb-20"> 
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          
          {/* GALERIE D'IMAGES */}
          <section className="mb-12 md:mb-16">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[350px] md:h-[600px]">
              <div className="md:col-span-3 relative rounded-[1.5rem] md:rounded-[3rem] overflow-hidden shadow-2xl bg-zinc-900">
                <div 
                  ref={scrollContainerRef} 
                  onScroll={handleScroll} 
                  className="flex md:block h-full overflow-x-auto md:overflow-x-hidden snap-x snap-mandatory scrollbar-hide"
                >
                  {images.length > 0 ? images.map((img: string, idx: number) => (
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
                  )) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-500">Aucune image disponible</div>
                  )}
                </div>
                <div className="absolute bottom-4 left-4 md:bottom-6 md:left-6 bg-black/60 backdrop-blur-md text-white px-3 py-1 md:px-4 md:py-2 rounded-full text-[10px] uppercase tracking-widest flex items-center gap-2 z-20">
                  <ImageIcon size={14} /> {images.length > 0 ? activeImage + 1 : 0} / {images.length}
                </div>
              </div>

              <div className="hidden md:flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
                {images.map((img: string, idx: number) => (
                  <button 
                    key={idx} 
                    onClick={() => setActiveImage(idx)} 
                    className={`relative flex-shrink-0 w-full h-32 rounded-2xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'scale-95' : 'opacity-40'}`}
                    style={{ borderColor: activeImage === idx ? primaryColor : 'transparent' }}
                  >
                    <img src={img} className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* CONTENU PRINCIPAL */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-16">
            <div className="lg:col-span-2">
              <h1 className={`text-3xl md:text-5xl lg:text-7xl font-serif mb-6 leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {displayTitle}
              </h1>

              <div className="flex items-center gap-3 text-slate-500 mb-10 text-[11px] uppercase tracking-[0.2em] font-bold">
                <MapPin size={18} color={primaryColor} />
                {property.town || property.ville || property.city} • {property.region}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-12 md:mb-16">
                {[
                  { icon: Bed, val: property.beds, label: 'CHAMBRES' },
                  { icon: Bath, val: property.baths, label: 'BAINS' },
                  { icon: Maximize, val: property.surface_built || property.surface, label: 'M² CONSTRUIT' },
                  { icon: Home, val: property.surface_plot, label: 'M² TERRAIN' },
                  { icon: Waves, val: (property.pool === "Oui" || property.pool === true ? "OUI" : "NON"), label: 'PISCINE' },
                  { icon: Car, val: "OUI", label: 'PARKING' },
                ].map((item, i) => (
                  <div key={i} className={`p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border text-left transition-all ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#111] border-white/5'}`}>
                    <item.icon className="mb-4 md:mb-6" color={primaryColor} size={24} />
                    <p className={`text-2xl md:text-3xl font-serif mb-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>{item.val || "0"}</p>
                    <p className="text-[9px] uppercase text-slate-500 font-bold tracking-[0.2em]">{item.label}</p>
                  </div>
                ))}
              </div>

              {/* SECTION DESCRIPTION - AFFICHAGE FINAL */}
              <div className="mb-16">
                <h2 className={`text-xl md:text-2xl font-serif italic mb-6 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                  Description
                </h2>
                <div 
                  className={`text-base md:text-xl font-light leading-relaxed space-y-4 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}
                  style={{ wordBreak: 'break-word' }}
                >
                  {descriptionContent ? (
                    <div dangerouslySetInnerHTML={{ __html: descriptionContent }} />
                  ) : (
                    <p className="text-slate-500 italic">Description en cours de chargement ou non disponible.</p>
                  )}
                </div>
              </div>

              {/* LOCALISATION MAP */}
              <div className="mt-10 border-t pt-10" style={{ borderColor: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.1)' }}>
                <div className="relative rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden shadow-xl h-[300px] md:h-[400px]">
                  <iframe
                    width="100%" height="100%" style={{ border: 0, filter: isLight ? "none" : "grayscale(1) invert(0.9) contrast(1.2)" }}
                    src={`https://maps.google.com/maps?q=${encodeURIComponent(property.town || property.city || "")},${encodeURIComponent(property.region || "")}&t=&z=14&ie=UTF8&iwloc=&output=embed`}
                    title="Location map"
                  ></iframe>
                </div>
              </div>
            </div>

            {/* SIDEBAR PRIX / CONTACT */}
            <div className="lg:col-span-1">
              <div className={`sticky top-32 rounded-[1.5rem] md:rounded-[2rem] lg:rounded-[3rem] border overflow-hidden shadow-2xl ${isLight ? 'bg-white border-slate-200' : 'bg-[#0A0A0A] border-white/10'}`}>
                <div className="p-6 md:p-10 pb-4">
                  <p className="text-[10px] uppercase text-slate-400 mb-2 font-bold tracking-widest">PRIX</p>
                  <p className={`text-3xl md:text-5xl font-serif leading-none ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {numericPrice > 0 ? numericPrice.toLocaleString("fr-FR") + " €" : "Sur demande"}
                  </p>
                </div>
                <div className="px-2 md:px-4">
                  <ContactForm agency={agency} propertyRef={property.ref || property.id_externe || property.id} isLight={isLight} />
                </div>
                <div className="p-6 md:p-10 pt-0">
                  <a 
                    href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-3 py-4 md:py-5 rounded-2xl font-bold uppercase text-[10px] tracking-widest border transition-all"
                    style={{ borderColor: isLight ? '#e2e8f0' : 'rgba(255,255,255,0.1)', color: isLight ? '#0f172a' : '#ffffff' }}
                  >
                    <MessageCircle size={18} className="text-green-500" /> WHATSAPP DIRECT
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