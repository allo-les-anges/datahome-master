"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";
import { 
  Bed, Bath, Maximize, MapPin, MessageCircle, ArrowLeft, 
  Image as ImageIcon, Home, Waves, Car, Navigation
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

  // Extraction des couleurs du thème (avec fallback sur le doré si absent)
  const primaryColor = agency?.theme?.primary || agency?.color || "#D4AF37";
  const secondaryColor = agency?.theme?.secondary || "#8d701a";

  useEffect(() => {
    setMounted(true);
    console.log("🔍 [DEBUG] Composant monté avec thème:", primaryColor);
  }, [primaryColor]);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      if (clientWidth > 0) {
        const newIndex = Math.round(scrollLeft / clientWidth);
        if (newIndex !== activeImage) setActiveImage(newIndex);
      }
    }
  };

  // Mémorisation de la description selon la langue pour éviter les sauts au rendu
  const description = useMemo(() => {
    if (!property) return "";
    return property[`description_${locale}`] || property.description || property.description_fr || "";
  }, [property, locale]);

  if (!mounted || !property) return null;

  const images = property.images || [];
  const numericPrice = Number(property.price || property.prix || 0);
  const rawPhone = property.phone || agency?.phone || "34627768233";
  const whatsappNumber = rawPhone.replace(/\D/g, '');

  return (
    <main 
      className={`min-h-screen ${isLight ? 'bg-white' : 'bg-[#0A0A0A]'}`}
      style={{ "--primary-agency": primaryColor } as React.CSSProperties}
    >
      <div className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* BOUTON RETOUR DYNAMIQUE */}
          <div className="mb-12">
            <button 
              onClick={() => window.history.back()}
              className="group inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] font-bold hover:opacity-70 transition-all"
              style={{ color: primaryColor }}
            >
              <ArrowLeft size={14} /> {t('propertyDetail.back') || "RETOUR À LA SÉLECTION"}
            </button>
          </div>

          {/* GALERIE PHOTO */}
          <section className="mb-16">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-auto md:h-[600px]">
              <div className="md:col-span-3 relative rounded-[2.5rem] md:rounded-[3rem] overflow-hidden shadow-2xl bg-slate-100 h-[400px] md:h-full">
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

              {/* MINIATURES AVEC BORDURE DYNAMIQUE */}
              <div className="hidden md:flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
                {images.map((img: string, idx: number) => (
                  <button 
                    key={idx} 
                    onClick={() => {
                      setActiveImage(idx);
                      scrollContainerRef.current?.scrollTo({ left: idx * (scrollContainerRef.current?.clientWidth || 0), behavior: 'smooth' });
                    }} 
                    className="relative flex-shrink-0 w-full h-32 rounded-2xl overflow-hidden border-2 transition-all"
                    style={{ 
                      borderColor: activeImage === idx ? primaryColor : 'transparent',
                      opacity: activeImage === idx ? 1 : 0.6
                    }}
                  >
                    <img src={img} className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* INFOS PROPRIÉTÉ */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <div className="lg:col-span-2">
              <h1 className={`text-4xl md:text-7xl font-serif mb-8 leading-[1.1] ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {property.titre || property.title || "Propriété d'exception"}
              </h1>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-16">
                {[
                  { icon: Bed, val: property.beds, label: 'Chambres' },
                  { icon: Bath, val: property.baths, label: 'Bains' },
                  { icon: Maximize, val: `${property.surface_built} m²`, label: 'Surface' },
                ].map((item, i) => (
                  <div 
                    key={i} 
                    className={`p-8 rounded-3xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-white/5 border-white/10'}`}
                    style={{ borderColor: `${primaryColor}33` }} // 33 = 20% d'opacité en hexa
                  >
                    <item.icon className="mb-2" style={{ color: primaryColor }} />
                    <p className={`text-2xl font-serif ${isLight ? 'text-slate-900' : 'text-white'}`}>{item.val || 0}</p>
                    <p className="text-[9px] uppercase text-slate-400 font-bold">{item.label}</p>
                  </div>
                ))}
              </div>

              <div 
                className={`text-lg leading-relaxed whitespace-pre-line ${isLight ? 'text-slate-700' : 'text-slate-300'}`}
                dangerouslySetInnerHTML={{ __html: description }}
              />
            </div>

            {/* SIDEBAR AVEC BORDURE ET PRIX DYNAMIQUE */}
            <div className="lg:col-span-1">
              <div 
                className={`sticky top-40 border rounded-[3rem] p-8 shadow-2xl ${isLight ? 'bg-white border-slate-200' : 'bg-[#111] border-white/10'}`}
              >
                <p className="text-[10px] uppercase text-slate-400 mb-2 font-bold tracking-widest">Prix</p>
                <p className="text-5xl font-serif mb-8" style={{ color: isLight ? '#000' : '#fff' }}>
                  {numericPrice.toLocaleString("fr-FR")} €
                </p>
                
                {/* Le formulaire de contact hérite généralement des couleurs de l'agence via ses propres props */}
                <ContactForm 
                  agency={agency} 
                  propertyRef={property.ref || property.id} 
                  isLight={isLight} 
                />

                <a 
                  href={`https://wa.me/${whatsappNumber}`}
                  className="w-full mt-6 flex items-center justify-center gap-3 py-4 rounded-2xl font-bold uppercase text-[10px] transition-all border"
                  style={{ 
                    borderColor: `${primaryColor}44`,
                    color: primaryColor,
                    backgroundColor: `${primaryColor}11`
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