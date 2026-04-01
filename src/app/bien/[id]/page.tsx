"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  Bed, Bath, Maximize, MapPin, ArrowLeft, 
  Waves, Flag, Sun, Layout, MessageCircle, Mail, Calendar, Share2, Phone
} from "lucide-react";
import Link from "next/link";

export default function PropertyDetailPage() {
  const { id } = useParams();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/properties");
        const data = await res.json();
        // On cherche le bien par ID
        const found = data.find((p: any) => String(p.id) === String(id));
        setProperty(found);
      } catch (err) {
        console.error("Erreur chargement bien:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [id]);

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-white">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-600"></div>
    </div>
  );

  if (!property) return <div className="h-screen flex items-center justify-center font-serif italic text-slate-400">Bien introuvable.</div>;

  // --- LOGIQUE DE LA CARTE ---
  // On récupère la ville et la région, avec des valeurs par défaut pour éviter les erreurs
  const town = property.town || "";
  const region = property.region || "";
  const mapQuery = encodeURIComponent(`${town}, ${region}, Espagne`);
  
  // URL de la carte corrigée avec le symbole $ pour la template string
  const finalMapUrl = `https://maps.google.com/maps?q=${mapQuery}&t=&z=13&ie=UTF8&iwloc=&output=embed`;

  // Gestion des images
  const allImages = Array.isArray(property.images) 
    ? property.images.map((img: any) => typeof img === 'object' ? img.url : img).filter(Boolean)
    : ["/hero_network.jpg"];

  const whatsappUrl = `https://wa.me/34627768233?text=Bonjour, je souhaite des infos sur le bien : ${property.titre}`;

  return (
    <main className="bg-white min-h-screen pb-20 lg:pb-0">
      <Navbar />
      
      {/* BANDEAU DE TEST VISIBLE */}
      <div className="bg-orange-600 text-white py-2 text-center font-bold text-xs uppercase tracking-widest fixed top-20 w-full z-50 shadow-md">
        CARTE ACTIVÉE - MODE DEBUG
      </div>

      <section className="pt-32 px-4 lg:px-10">
        <div className="max-w-[1600px] mx-auto">
          <Link href="/" className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors mb-6 text-[10px] font-black uppercase tracking-widest">
            <ArrowLeft size={14} /> Retour à la sélection
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 h-[400px] lg:h-[600px]">
            <div className="lg:col-span-3 rounded-[2.5rem] overflow-hidden relative shadow-sm border border-slate-100 bg-slate-50">
              <img 
                src={allImages[activeImage]} 
                alt={property.titre} 
                className="w-full h-full object-cover transition-opacity duration-500" 
              />
              <div className="absolute top-6 left-6 bg-black/50 backdrop-blur-md px-4 py-2 rounded-full text-white text-[9px] font-black uppercase tracking-widest">
                Réf: {property.reference || property.id}
              </div>
            </div>
            <div className="hidden lg:flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
              {allImages.map((img: string, index: number) => (
                <button 
                  key={index} 
                  onClick={() => setActiveImage(index)} 
                  className={`relative h-28 flex-shrink-0 rounded-2xl overflow-hidden border-2 transition-all ${activeImage === index ? 'border-emerald-500 scale-[0.98]' : 'border-transparent opacity-60 hover:opacity-100'}`}
                >
                  <img src={img} className="w-full h-full object-cover" alt="miniature" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex flex-col lg:flex-row gap-16">
          
          <div className="w-full lg:w-2/3">
            <div className="flex items-center gap-2 text-slate-500 mb-6">
              <MapPin size={18} className="text-emerald-500" />
              <span className="uppercase text-[10px] font-black tracking-[0.3em]">{town} • {region}</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-serif italic text-slate-900 mb-8 leading-tight">
              {property.titre}
            </h1>

            <div className="grid grid-cols-4 gap-2 md:gap-4 p-6 md:p-8 bg-slate-50 rounded-[2.5rem] mb-12 border border-slate-100">
              <div className="flex flex-col items-center border-r border-slate-200">
                <Bed size={20} className="text-slate-400 mb-2" />
                <span className="text-lg font-bold text-slate-900">{property.beds || "--"}</span>
                <p className="text-[8px] uppercase font-black text-slate-400">Chambres</p>
              </div>
              <div className="flex flex-col items-center border-r border-slate-200">
                <Bath size={20} className="text-slate-400 mb-2" />
                <span className="text-lg font-bold text-slate-900">{property.baths || "--"}</span>
                <p className="text-[8px] uppercase font-black text-slate-400">Bains</p>
              </div>
              <div className="flex flex-col items-center border-r border-slate-200">
                <Maximize size={20} className="text-slate-400 mb-2" />
                <span className="text-lg font-bold text-slate-900">{property.sqft || property.surface_area?.built || "--"}</span>
                <p className="text-[8px] uppercase font-black text-slate-400">m²</p>
              </div>
              <div className="flex flex-col items-center">
                <Sun size={20} className="text-slate-400 mb-2" />
                <span className="text-lg font-bold text-slate-900">Privée</span>
                <p className="text-[8px] uppercase font-black text-slate-400">Piscine</p>
              </div>
            </div>

            <div className="prose prose-slate max-w-none mb-16">
              <h2 className="text-3xl font-serif italic text-slate-900 mb-6">Description</h2>
              <div 
                className="text-slate-600 leading-relaxed text-lg"
                dangerouslySetInnerHTML={{ __html: property.description_fr || property.description || "" }} 
              />
            </div>

            {/* SECTION CARTE GOOGLE MAPS */}
            <div className="border-t border-slate-100 pt-12 mt-12">
              <h2 className="text-3xl font-serif italic mb-8">Localisation</h2>
              <div className="w-full h-[450px] rounded-[3rem] overflow-hidden border border-slate-200 shadow-2xl bg-slate-50">
                {town ? (
                  <iframe
                    width="100%"
                    height="100%"
                    src={finalMapUrl}
                    style={{ border: 0 }}
                    allowFullScreen
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  ></iframe>
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-slate-400 italic">
                    Coordonnées en cours de chargement...
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SIDEBAR DE CONTACT */}
          <div className="w-full lg:w-1/3">
            <div className="lg:sticky lg:top-32 bg-white border border-slate-100 shadow-2xl rounded-[3rem] p-10 text-center">
              <p className="text-[10px] font-black uppercase text-emerald-600 mb-2 tracking-[0.2em]">Prix de vente</p>
              <div className="text-5xl font-serif text-slate-900 mb-10">
                {property.price ? Number(property.price).toLocaleString("fr-FR") : "--"} €
              </div>
              
              <div className="space-y-4">
                <a 
                  href={whatsappUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-3 w-full bg-[#25D366] text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-[#20ba5a] transition-all"
                >
                  <MessageCircle size={18} /> Contact WhatsApp
                </a>
                <button className="w-full bg-slate-950 text-white py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-3 hover:bg-slate-800 transition-all">
                  <Mail size={16} /> Recevoir la brochure
                </button>
              </div>

              <div className="mt-8 pt-8 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400">
                    <Phone size={18} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Appeler</span>
                </div>
                <Share2 size={20} className="text-slate-300 hover:text-emerald-500 cursor-pointer" />
              </div>
            </div>
          </div>

        </div>
      </section>

      <Footer />

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
      `}</style>
    </main>
  );
}