"use client";

import { useEffect, useState, useRef } from "react";
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
  const { t } = useTranslation() as any;
  const searchParams = useSearchParams();
  const [activeImage, setActiveImage] = useState(0);
  const [mounted, setMounted] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isLight = searchParams.get('pack') === 'light';

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

  if (!mounted || !property) return null;

  const images = property.images || [];
  const numericPrice = Number(property.price || property.prix || 0);
  
  // WhatsApp config
  const rawPhone = property.phone || agency?.phone || "34627768233";
  const whatsappNumber = rawPhone.replace(/\D/g, '');
  const whatsappMessage = encodeURIComponent(`Infos sur réf: ${property.ref || property.id}`);

  return (
    <main className={`min-h-screen ${isLight ? 'bg-white' : 'bg-[#0A0A0A]'}`}>
      {/* 1. ESPACEMENT POUR NAVBAR : pt-32 assure que rien ne passe SOUS la navbar fixe */}
      <div className="pt-32 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          
          {/* BOUTON RETOUR UNIQUE */}
          <div className="mb-12">
            <button 
              onClick={() => window.history.back()}
              className="group inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] font-bold hover:opacity-70 transition-all"
            >
              <ArrowLeft size={14} /> RETOUR À LA SÉLECTION
            </button>
          </div>

          {/* 2. GALERIE PHOTO CORRIGÉE */}
          <section className="mb-16">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-auto md:h-[600px]">
              {/* Image Principale */}
              <div className="md:col-span-3 relative rounded-[2.5rem] md:rounded-[3rem] overflow-hidden shadow-2xl bg-slate-100 h-[400px] md:h-full">
                <div 
                  ref={scrollContainerRef} 
                  onScroll={handleScroll} 
                  className="flex md:block h-full overflow-x-auto md:overflow-x-hidden snap-x snap-mandatory scrollbar-hide"
                >
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
                <div className="absolute bottom-6 left-6 bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-full text-[10px] uppercase tracking-widest z-20 flex items-center gap-2">
                  <ImageIcon size={14} /> {activeImage + 1} / {images.length}
                </div>
              </div>

              {/* Liste des miniatures : Correction du bug d'écrasement */}
              <div className="hidden md:flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
                {images.map((img: string, idx: number) => (
                  <button 
                    key={idx} 
                    onClick={() => {
                      setActiveImage(idx);
                      scrollContainerRef.current?.scrollTo({ 
                        left: idx * (scrollContainerRef.current?.clientWidth || 0), 
                        behavior: 'smooth' 
                      });
                    }} 
                    className={`relative flex-shrink-0 w-full h-32 rounded-2xl overflow-hidden border-2 transition-all ${
                      activeImage === idx ? 'border-[#D4AF37] scale-95' : 'border-transparent opacity-60'
                    }`}
                  >
                    <img src={img} className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* CONTENU INFOS */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <div className="lg:col-span-2">
              <h1 className={`text-4xl md:text-7xl font-serif mb-8 leading-[1.1] ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {property.titre || "Propriété d'exception"}
              </h1>
              <div className="flex items-center gap-3 text-slate-500 mb-12 text-[11px] uppercase tracking-[0.2em] font-bold">
                <MapPin size={18} className="text-[#D4AF37]" /> {property.town} • {property.region}
              </div>

              {/* Grid caractéristiques */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-16">
                {[
                  { icon: Bed, label: 'Chambres', val: property.beds },
                  { icon: Bath, label: 'Bains', val: property.baths },
                  { icon: Maximize, label: 'Surface', val: `${property.surface_built}m²` },
                ].map((item, i) => (
                  <div key={i} className={`${isLight ? 'bg-slate-50' : 'bg-white/5'} p-8 rounded-3xl border ${isLight ? 'border-slate-100' : 'border-white/10'}`}>
                    <item.icon className="mb-4 text-[#D4AF37]" size={24} />
                    <p className={`text-2xl font-serif ${isLight ? 'text-slate-900' : 'text-white'}`}>{item.val || "0"}</p>
                    <p className="text-[9px] uppercase text-slate-400 font-bold tracking-widest">{item.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Sidebar Formulaire */}
            <div className="lg:col-span-1">
              <div className="sticky top-40 bg-[#111] border border-white/10 rounded-[3rem] p-4 shadow-2xl">
                <div className="p-8">
                  <p className="text-[10px] uppercase text-slate-400 mb-2 font-bold tracking-widest">Prix de vente</p>
                  <p className="text-5xl font-serif text-white mb-8">{numericPrice.toLocaleString("fr-FR")} €</p>
                  <ContactForm agency={agency} propertyRef={property.ref || property.id} isLight={false} />
                  <a 
                    href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                    className="w-full mt-4 flex items-center justify-center gap-3 py-4 rounded-2xl bg-green-600/10 text-green-500 font-bold uppercase text-[10px] hover:bg-green-600 hover:text-white transition-all"
                  >
                    <MessageCircle size={18} /> WhatsApp Direct
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
      <Footer agency={agency} />
    </main>
  );
}