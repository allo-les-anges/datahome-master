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
  const { t, locale } = useTranslation() as any; // On récupère locale pour surveiller les changements
  const searchParams = useSearchParams();
  const [activeImage, setActiveImage] = useState(0);
  const [mounted, setMounted] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const isLight = searchParams.get('pack') === 'light';

  // --- SYSTEME DE LOGS DE DEBUG ---
  useEffect(() => {
    setMounted(true);
    console.log("🔍 [DEBUG] Composant monté");
    console.log("🔍 [DEBUG] Langue actuelle :", locale);
    console.log("🔍 [DEBUG] Données propriété reçues :", property);
    
    if (!property) {
      console.error("❌ [ERREUR] L'objet 'property' est indéfini ou null !");
    } else {
      console.log("✅ [SUCCESS] ID Propriété :", property.id || property.ref);
    }
  }, [property, locale]); // Se déclenche à chaque changement de langue ou de donnée

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth } = scrollContainerRef.current;
      if (clientWidth > 0) {
        const newIndex = Math.round(scrollLeft / clientWidth);
        if (newIndex !== activeImage) setActiveImage(newIndex);
      }
    }
  };

  // Sécurité anti-crash au changement de langue
  if (!mounted) return null;

  if (!property) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-white p-10">
        <p className="text-red-500 font-bold">Erreur : Données de propriété manquantes.</p>
        <button onClick={() => window.location.reload()} className="mt-4 underline">Recharger la page</button>
      </div>
    );
  }

  const images = property.images || [];
  const numericPrice = Number(property.price || property.prix || 0);
  const rawPhone = property.phone || agency?.phone || "34627768233";
  const whatsappNumber = rawPhone.replace(/\D/g, '');

  return (
    <main className={`min-h-screen ${isLight ? 'bg-white' : 'bg-[#0A0A0A]'}`}>
      
      {/* IMPORTANT : Pas de Navbar ici. 
          Si le double menu persiste, vérifiez 'src/app/layout.tsx' 
          et supprimez toute Navbar présente dans 'src/app/bien/[id]/page.tsx'.
      */}

      <div className="pt-32 pb-20"> {/* Padding top important pour la Navbar fixed */}
        <div className="max-w-7xl mx-auto px-6">
          
          {/* BOUTON RETOUR UNIQUE : S'il y en a un autre au-dessus, il vient de votre Layout global */}
          <div className="mb-12">
            <button 
              onClick={() => window.history.back()}
              className="group inline-flex items-center gap-2 text-[10px] uppercase tracking-[0.3em] text-[#D4AF37] font-bold hover:opacity-70 transition-all"
            >
              <ArrowLeft size={14} /> {t('propertyDetail.back') || "RETOUR À LA SÉLECTION"}
            </button>
          </div>

          {/* GALERIE PHOTO AVEC FIX DE HAUTEUR */}
          <section className="mb-16">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-auto md:h-[600px]">
              {/* Image Principale */}
              <div className="md:col-span-3 relative rounded-[2.5rem] md:rounded-[3rem] overflow-hidden shadow-2xl bg-slate-100 h-[400px] md:h-full">
                <div ref={scrollContainerRef} onScroll={handleScroll} className="flex md:block h-full overflow-x-auto md:overflow-x-hidden snap-x snap-mandatory scrollbar-hide">
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
                      <img src={img} className="w-full h-full object-cover" alt="" onError={(e) => console.log(`Erreur chargement image ${idx}`)} />
                    </div>
                  )) : (
                    <div className="w-full h-full flex items-center justify-center bg-slate-200">Aucune image</div>
                  )}
                </div>
              </div>

              {/* Miniatures : h-32 et flex-shrink-0 pour éviter l'écrasement */}
              <div className="hidden md:flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
                {images.map((img: string, idx: number) => (
                  <button 
                    key={idx} 
                    onClick={() => {
                      setActiveImage(idx);
                      scrollContainerRef.current?.scrollTo({ left: idx * (scrollContainerRef.current?.clientWidth || 0), behavior: 'smooth' });
                    }} 
                    className={`relative flex-shrink-0 w-full h-32 rounded-2xl overflow-hidden border-2 transition-all ${activeImage === idx ? 'border-[#D4AF37]' : 'border-transparent opacity-60'}`}
                  >
                    <img src={img} className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* DETAILS */}
          <section className="grid grid-cols-1 lg:grid-cols-3 gap-16">
            <div className="lg:col-span-2">
              <h1 className={`text-4xl md:text-7xl font-serif mb-8 leading-[1.1] ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {property.titre || property.title || "Propriété d'exception"}
              </h1>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-16">
                <div className="p-8 rounded-3xl border border-[#D4AF37]/20 bg-white/5">
                  <Bed className="text-[#D4AF37] mb-2" />
                  <p className="text-2xl font-serif text-white">{property.beds || 0}</p>
                  <p className="text-[9px] uppercase text-slate-400 font-bold">Chambres</p>
                </div>
                <div className="p-8 rounded-3xl border border-[#D4AF37]/20 bg-white/5">
                  <Bath className="text-[#D4AF37] mb-2" />
                  <p className="text-2xl font-serif text-white">{property.baths || 0}</p>
                  <p className="text-[9px] uppercase text-slate-400 font-bold">Bains</p>
                </div>
                <div className="p-8 rounded-3xl border border-[#D4AF37]/20 bg-white/5">
                  <Maximize className="text-[#D4AF37] mb-2" />
                  <p className="text-2xl font-serif text-white">{property.surface_built || 0} m²</p>
                  <p className="text-[9px] uppercase text-slate-400 font-bold">Surface</p>
                </div>
              </div>

              <div className="text-slate-300 text-lg leading-relaxed whitespace-pre-line">
                {property.description_fr || property.description || "Pas de description disponible."}
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-40 bg-[#111] border border-white/10 rounded-[3rem] p-8">
                <p className="text-[10px] uppercase text-slate-400 mb-2 font-bold tracking-widest">Prix</p>
                <p className="text-5xl font-serif text-white mb-8">{numericPrice.toLocaleString("fr-FR")} €</p>
                <ContactForm agency={agency} propertyRef={property.ref || property.id} isLight={false} />
              </div>
            </div>
          </section>
        </div>
      </div>
      <Footer agency={agency} />
    </main>
  );
}