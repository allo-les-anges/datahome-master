"use client";

import { useEffect, useState, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";
import { 
  Bed, Bath, Maximize, MapPin, MessageCircle, ArrowLeft, 
  Image as ImageIcon, Home, Waves, Car, ShieldCheck, Navigation
} from "lucide-react";
import Link from "next/link";
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
      const newIndex = Math.round(scrollLeft / clientWidth);
      if (newIndex !== activeImage) setActiveImage(newIndex);
    }
  };

  const cleanDescription = (html: string) => {
    if (!html) return "";
    return html
      .replace(/style="[^"]*"/gi, '')
      .replace(/color="[^"]*"/gi, '')
      .replace(/<font[^>]*>/gi, '')
      .replace(/<\/font>/gi, '')
      .replace(/ /g, ' ');
  };

  if (!mounted) return null;

  if (!property) {
    return (
      <div className={`h-screen flex flex-col items-center justify-center ${isLight ? 'bg-white' : 'bg-[#0A0A0A]'} p-6 text-center`}>
        <h1 className={`text-2xl mb-4 font-serif ${isLight ? 'text-slate-900' : 'text-white'}`}>Propriété non trouvée</h1>
        <Link href="/" className="px-8 py-3 bg-[#D4AF37] text-black rounded-full font-bold uppercase text-[10px]">Retour</Link>
      </div>
    );
  }

  const images = property.images || [];
  const numericPrice = Number(property.price || property.prix || 0);
  const town = property.town || property.ville || "";
  const region = property.region || "";
  const mapQuery = encodeURIComponent(`${town}, ${region}, Espagne`);
  const fallbackMapUrl = `https://maps.google.com/maps?q=${mapQuery}&t=&z=13&ie=UTF8&iwloc=&output=embed`;

  const rawPhone = property.phone || agency?.phone || "34627768233";
  const whatsappNumber = rawPhone.replace(/\D/g, '');
  const whatsappMessage = encodeURIComponent(`Bonjour, je souhaite plus d'infos sur la référence : ${property.ref || property.id}`);

  return (
    <main className={`min-h-screen ${isLight ? 'bg-white' : 'bg-[#0A0A0A]'}`}>
      <Navbar agency={agency} />
      
      {/* FORÇAGE DE L'ESPACE : 
          Puisque votre Navbar fait 112px, on utilise mt-[112px] 
          pour pousser TOUT le contenu vers le bas.
      */}
      <div className="flex flex-col mt-[112px]">
        
        {/* BOUTON RETOUR */}
        <div className="max-w-7xl mx-auto w-full px-6 py-8">
          <button 
            onClick={() => window.history.back()}
            className="group inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] font-bold"
          >
            <ArrowLeft size={14} /> {t('propertyDetail.back') || "RETOUR À LA SÉLECTION"}
          </button>
        </div>

        {/* SECTION GALERIE */}
        <section className="max-w-7xl mx-auto w-full px-6 mb-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:h-[550px]">
            <div className="md:col-span-3 relative rounded-[2.5rem] md:rounded-[3rem] overflow-hidden shadow-2xl bg-slate-100 dark:bg-[#111] h-[400px] md:h-full">
              <div ref={scrollContainerRef} onScroll={handleScroll} className="flex md:block h-full overflow-x-auto md:overflow-x-hidden snap-x snap-mandatory scrollbar-hide">
                {images.map((img: string, idx: number) => (
                  <div key={idx} className="min-w-full h-full snap-center md:absolute md:inset-0 md:transition-opacity md:duration-700" style={{ opacity: activeImage === idx ? 1 : 0, zIndex: activeImage === idx ? 10 : 0 }}>
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
                  onClick={() => { 
                    setActiveImage(idx); 
                    scrollContainerRef.current?.scrollTo({ left: idx * (scrollContainerRef.current?.clientWidth || 0), behavior: 'smooth' }); 
                  }} 
                  className={`relative h-24 min-h-[96px] rounded-2xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-[#D4AF37] scale-95' : 'border-transparent opacity-60'}`}
                >
                  <img src={img} className="w-full h-full object-cover" alt="" />
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION CONTENU DETAILLÉ */}
        <section className="max-w-7xl mx-auto w-full px-6 grid grid-cols-1 lg:grid-cols-3 gap-16 pb-24">
          <div className="lg:col-span-2">
            <h1 className={`text-4xl md:text-7xl font-serif mb-8 leading-[1.1] ${isLight ? 'text-slate-900' : 'text-white'}`}>
              {property.titre || "Propriété d'exception"}
            </h1>
            
            <div className="flex items-center gap-3 text-slate-500 mb-8 text-[11px] uppercase tracking-[0.2em] font-bold">
              <MapPin size={18} className="text-[#D4AF37]" />
              {town} {region && `• ${region}`}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-16">
              {[
                { icon: Bed, key: 'bedrooms', val: property.beds },
                { icon: Bath, key: 'bathrooms', val: property.baths },
                { icon: Maximize, key: 'built', val: property.surface_built },
                { icon: Home, key: 'plot', val: property.surface_plot },
                { icon: Waves, key: 'pool', val: (property.pool === "Oui" || property.pool === "Private" ? "Privée" : "Non") },
                { icon: Car, key: 'parking', val: "Inclus" }
              ].map((item, i) => (
                <div key={i} className={`${isLight ? 'bg-slate-50' : 'bg-white/5'} p-6 rounded-3xl text-center border ${isLight ? 'border-slate-100' : 'border-white/10'}`}>
                  <item.icon className="mx-auto mb-2 text-[#D4AF37]" size={22} />
                  <p className={`text-2xl font-serif ${isLight ? 'text-slate-900' : 'text-white'}`}>{item.val || "0"}</p>
                  <p className="text-[8px] uppercase text-slate-400 font-bold tracking-widest">{t(`propertyDetail.${item.key}`)}</p>
                </div>
              ))}
            </div>

            <div className={`max-w-none mb-20 pt-10 border-t ${isLight ? 'border-slate-100' : 'border-white/10'}`}>
              <h2 className={`text-3xl font-serif italic mb-8 ${isLight ? 'text-slate-900' : 'text-white'}`}>{t('propertyDetail.artOfLiving')}</h2>
              <div 
                className={`text-lg leading-relaxed opacity-90 mb-16 ${isLight ? 'text-slate-700' : 'text-slate-300'}`}
                dangerouslySetInnerHTML={{ __html: cleanDescription(property.description || "") }} 
              />
              
              <div className="space-y-8">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-2xl bg-[#D4AF37]/10 flex items-center justify-center text-[#D4AF37]"><Navigation size={24} /></div>
                  <div>
                    <h3 className={`text-2xl font-serif italic ${isLight ? 'text-slate-900' : 'text-white'}`}>{t('propertyDetail.location')}</h3>
                    <p className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">{town}, {region}</p>
                  </div>
                </div>
                <div className="relative w-full h-[400px] rounded-[2.5rem] overflow-hidden shadow-xl border border-slate-200 dark:border-white/10 bg-slate-100">
                  <iframe 
                    width="100%" height="100%" frameBorder="0" 
                    src={fallbackMapUrl} 
                    className={isLight ? "" : "grayscale-[1] invert opacity-80"} 
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-40 space-y-6">
              {!isLight && (
                <Link href={`/contact-cashback?Property_ID=${property.id_externe || property.id}`} className="group relative block w-full overflow-hidden rounded-[2.5rem] bg-slate-900 p-[1px] shadow-2xl transition-transform hover:scale-[1.02]">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#D4AF37] to-transparent opacity-30" />
                  <div className="relative bg-slate-900 rounded-[2.5rem] p-8 flex items-center gap-5">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30"><ShieldCheck size={28} /></div>
                    <div className="flex flex-col">
                      <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-[#D4AF37] mb-1">Privilège</span>
                      <span className="text-xl font-serif italic text-white leading-tight">Activer mon Cashback</span>
                    </div>
                  </div>
                </Link>
              )}

              <div className={isLight ? "bg-slate-50 border border-slate-200 rounded-[3rem] p-4" : "bg-[#111] border border-white/10 rounded-[3rem] shadow-2xl overflow-hidden"}>
                <div className="p-10 pb-0">
                  <p className="text-[10px] uppercase text-slate-400 mb-2 font-bold tracking-widest">Prix de vente</p>
                  <p className={`text-5xl font-serif leading-none mb-6 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                    {numericPrice.toLocaleString("fr-FR")} €
                  </p>
                </div>
                <ContactForm agency={agency} propertyRef={property.ref || property.id} isLight={isLight} />
                <div className="px-8 pb-8">
                  <a 
                    href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`} 
                    target="_blank" rel="noopener noreferrer"
                    className={`w-full border ${isLight ? 'border-slate-200 bg-white' : 'border-white/10'} flex items-center justify-center gap-3 py-4 rounded-2xl font-bold uppercase text-[10px] hover:bg-slate-50 transition-all ${isLight ? 'text-slate-900' : 'text-white'}`}
                  >
                    <MessageCircle size={18} className="text-green-500" /> WhatsApp Direct
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
      <Footer agency={agency} />
    </main>
  );
}