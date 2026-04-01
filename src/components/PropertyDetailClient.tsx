"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";
import { 
  Bed, Bath, Maximize, MessageCircle, ArrowLeft 
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isLight = searchParams.get('pack') === 'light';

  const primaryColor = useMemo(() => {
    return agency?.theme?.primary || 
           agency?.colors?.primary || 
           agency?.color || 
           "#D4AF37"; 
  }, [agency]);

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
    return property[`description_${locale}`] || property.description || property.description_fr || "";
  }, [property, locale]);

  if (!mounted || !property) return null;

  const images = property.images || [];
  const numericPrice = Number(property.price || property.prix || 0);
  const whatsappNumber = (property.phone || agency?.phone || "34627768233").replace(/\D/g, '');

  return (
    <main className={`min-h-screen relative z-10 ${isLight ? 'bg-white' : 'bg-[#0A0A0A]'}`}>
      <div className="pt-24 pb-20"> {/* pt-24 réduit pour éviter le trop grand vide en haut */}
        <div className="max-w-7xl mx-auto px-6">
          
          {/* BOUTON RETOUR UNIQUE - S'affichera avec la couleur de l'agence */}
          <div className="mb-12 relative z-20">
            <button 
              onClick={() => window.history.back()}
              className="group inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-bold hover:opacity-70 transition-all"
              style={{ color: primaryColor }}
            >
              <ArrowLeft size={14} /> {t('propertyDetail.back') || "RETOUR À LA SÉLECTION"}
            </button>
          </div>

          {/* GALERIE IMAGES */}
          <section className="mb-16 min-h-[400px]">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[400px] md:h-[600px]">
              <div className="md:col-span-3 relative rounded-[2.5rem] md:rounded-[3rem] overflow-hidden shadow-2xl bg-zinc-900">
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
                      <img src={img} className="w-full h-full object-cover" alt="" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="hidden md:flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
                {images.map((img: string, idx: number) => (
                  <button 
                    key={idx} 
                    onClick={() => setActiveImage(idx)} 
                    className="relative flex-shrink-0 w-full h-32 rounded-2xl overflow-hidden border-2 transition-all"
                    style={{ 
                      borderColor: activeImage === idx ? primaryColor : 'transparent',
                      opacity: activeImage === idx ? 1 : 0.5
                    }}
                  >
                    <img src={img} className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* CONTENU ET SIDEBAR */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <div className="lg:col-span-2">
              <h1 className={`text-4xl md:text-7xl font-serif mb-8 leading-[1.1] ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {property.titre || property.title || "Propriété"}
              </h1>
              
              <div className="grid grid-cols-3 gap-4 mb-16">
                {[
                  { icon: Bed, val: property.beds, label: 'Chambres' },
                  { icon: Bath, val: property.baths, label: 'Bains' },
                  { icon: Maximize, val: property.surface_built, label: 'm²' },
                ].map((item, i) => (
                  <div 
                    key={i} 
                    className={`p-6 rounded-3xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'}`}
                  >
                    <item.icon className="mb-2" style={{ color: primaryColor }} size={20} />
                    <p className={`text-xl font-serif ${isLight ? 'text-slate-900' : 'text-white'}`}>{item.val || 0}</p>
                    <p className="text-[8px] uppercase text-slate-500 font-bold tracking-tighter">{item.label}</p>
                  </div>
                ))}
              </div>

              <div 
                className={`text-lg leading-relaxed mb-16 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}
                dangerouslySetInnerHTML={{ __html: description }}
              />

              {/* LOCALISATION - SANS OVERLAY NOIR OBSTRUANT */}
              {property.latitude && property.longitude && (
                <div className="mt-10">
                  <h2 className={`text-2xl font-serif mb-6 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    Localisation
                  </h2>
                  <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 shadow-xl group">
                    {/* L'overlay est maintenant invisible au repos pour voir la carte */}
                    <div className="absolute inset-0 bg-black/0 pointer-events-none z-10 group-hover:bg-black/10 transition-all duration-700" />
                    
                    <iframe
                      width="100%"
                      height="400"
                      style={{ 
                        border: 0,
                        filter: isLight ? "none" : "grayscale(1) invert(0.9) contrast(1.2)" // Look luxe en mode sombre
                      }}
                      loading="lazy"
                      allowFullScreen
                      src={`https://maps.google.com/maps?q=${property.latitude},${property.longitude}&z=14&output=embed`}
                    ></iframe>
                  </div>
                </div>
              )}
            </div>

            {/* SIDEBAR */}
            <div className="lg:col-span-1">
              <div className={`sticky top-40 border rounded-[3rem] p-8 ${isLight ? 'bg-white border-slate-200' : 'bg-[#111] border-white/10'}`}>
                <p className="text-[10px] uppercase text-slate-400 mb-2 font-bold tracking-widest">Prix</p>
                <p className="text-5xl font-serif mb-8" style={{ color: isLight ? '#000' : '#fff' }}>
                  {numericPrice.toLocaleString("fr-FR")} €
                </p>
                
                <ContactForm agency={agency} propertyRef={property.ref || property.id} isLight={isLight} />

                <a 
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full mt-6 flex items-center justify-center gap-3 py-4 rounded-2xl font-bold uppercase text-[10px] border transition-all"
                  style={{ 
                    borderColor: primaryColor,
                    color: primaryColor,
                    backgroundColor: `${primaryColor}10` 
                  }}
                >
                  <MessageCircle size={18} /> WhatsApp Direct
                </a>
              </div>
            </div>
          </section>
        </div>
      </div>
      <Footer agency={agency} />
    </main>
  );
}