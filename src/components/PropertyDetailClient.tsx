"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import ContactForm from "@/components/ContactForm";
import { 
  Bed, Bath, Maximize, MessageCircle, Home, Waves, Car, MapPin, Navigation, ArrowLeft, ImageIcon
} from "lucide-react";
import { useTranslation } from "@/contexts/I18nContext";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

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

  // --- EXTRACTION DE LA COULEUR DYNAMIQUE (Logique alignée sur le Footer) ---
  const primaryColor = useMemo(() => {
    // On vérifie d'abord dans footer_config comme dans votre Footer
    const footerData = typeof agency?.footer_config === 'string' 
      ? JSON.parse(agency.footer_config) 
      : (agency?.footer_config || {});

    return agency?.theme?.primary || 
           agency?.colors?.primary || 
           footerData?.primary_color || // Fallback sur la config footer
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

  const images = property?.images || [];
  const numericPrice = Number(property?.price || property?.prix || 0);
  const whatsappNumber = (property?.phone || agency?.phone || "34627768233").replace(/\D/g, '');

  if (!mounted || !property) return null;

  return (
    <main className={`min-h-screen relative z-10 transition-colors duration-500 ${isLight ? 'bg-white' : 'bg-[#0A0A0A]'}`}>
      
      <div className="pt-32 pb-20"> 
        <div className="max-w-7xl mx-auto px-6">
          
          {/* GALERIE IMAGES */}
          <section className="mb-16">
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
                <div className="absolute bottom-6 left-6 bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-full text-[10px] uppercase tracking-widest flex items-center gap-2 z-20">
                  <ImageIcon size={14} /> {activeImage + 1} / {images.length}
                </div>
              </div>

              <div className="hidden md:flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
                {images.map((img: string, idx: number) => (
                  <button 
                    key={idx} 
                    onClick={() => setActiveImage(idx)} 
                    className={`relative flex-shrink-0 w-full h-32 rounded-2xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'scale-95' : 'opacity-40'}`}
                    style={{ 
                      borderColor: activeImage === idx ? primaryColor : 'transparent',
                    }}
                  >
                    <img src={img} className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* INFOS ET SIDEBAR */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <div className="lg:col-span-2">
              <h1 className={`text-5xl md:text-8xl font-serif mb-6 leading-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {property.titre || property.title || "Propriété Exclusive"}
              </h1>

              <div className="flex items-center gap-3 text-slate-500 mb-12 text-[11px] uppercase tracking-[0.2em] font-bold">
                <MapPin size={18} style={{ color: primaryColor }} />
                {property.town || property.ville} • {property.region}
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-16">
                {[
                  { icon: Bed, val: property.beds, label: 'CHAMBRES' },
                  { icon: Bath, val: property.baths, label: 'BAINS' },
                  { icon: Maximize, val: property.surface_built, label: 'CONSTRUIT M²' },
                  { icon: Home, val: property.surface_plot, label: 'TERRAIN M²' },
                  { icon: Waves, val: (property.pool === "Oui" || property.pool === true ? "OUI" : "NON"), label: 'PISCINE' },
                  { icon: Car, val: "OUI", label: 'PARKING' },
                ].map((item, i) => (
                  <div 
                    key={i} 
                    className={`p-8 rounded-[2rem] border text-left transition-all hover:scale-[1.02] ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-[#111] border-white/5 hover:border-white/10'}`}
                  >
                    <item.icon className="mb-6" style={{ color: primaryColor }} size={24} />
                    <p className={`text-3xl font-serif mb-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>{item.val || "0"}</p>
                    <p className="text-[9px] uppercase text-slate-500 font-bold tracking-[0.2em]">{item.label}</p>
                  </div>
                ))}
              </div>

              <div 
                className={`text-xl font-light leading-relaxed mb-16 space-y-6 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}
                dangerouslySetInnerHTML={{ __html: description }}
              />

              <div className="mt-10 border-t pt-10 border-white/10">
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-12 w-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}>
                    <Navigation size={24} />
                  </div>
                  <div>
                    <h2 className={`text-3xl font-serif italic ${isLight ? 'text-slate-900' : 'text-white'}`}>Localisation</h2>
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">{property.town}, Costa Blanca</p>
                  </div>
                </div>
                <div className="relative rounded-[2.5rem] overflow-hidden border border-white/10 shadow-xl h-[400px]">
                  <iframe
                    width="100%"
                    height="100%"
                    style={{ border: 0, filter: isLight ? "none" : "grayscale(1) invert(0.9) contrast(1.2)" }}
                    loading="lazy"
                    allowFullScreen
                    src={`https://maps.google.com/maps?q=${property.latitude || property.town},${property.longitude || property.region}&z=14&output=embed`}
                  ></iframe>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className={`sticky top-40 border rounded-[3rem] overflow-hidden shadow-2xl ${isLight ? 'bg-white border-slate-200' : 'bg-[#0A0A0A] border-white/10'}`}>
                <div className="p-10 pb-4">
                  <p className="text-[10px] uppercase text-slate-400 mb-2 font-bold tracking-widest">PRIX</p>
                  <p className={`text-6xl font-serif leading-none ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {numericPrice.toLocaleString("fr-FR")} €
                  </p>
                </div>
                
                <div className="px-2">
                   <ContactForm agency={agency} propertyRef={property.ref || property.id} isLight={isLight} />
                </div>

                <div className="px-10 pb-10">
                  <a 
                    href={`https://wa.me/${whatsappNumber}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center gap-3 py-5 rounded-2xl font-bold uppercase text-[10px] tracking-widest border border-white/10 hover:bg-white/5 transition-all text-white"
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