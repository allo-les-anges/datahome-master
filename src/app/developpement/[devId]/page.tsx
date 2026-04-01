"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { 
  Bed, Bath, Maximize, ArrowLeft, Building2, 
  MapPin, ChevronRight, Hash, CheckCircle 
} from "lucide-react";
import Link from "next/link";

export default function DevelopmentPage() {
  const { devId } = useParams();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/properties");
        const data = await res.json();
        setProperties(data);
      } catch (err) {
        console.error("Erreur API:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Fonction pour transformer le nom du projet en format URL (slug)
  const slugify = (text: string) =>
    text?.toString().toLowerCase().trim()
      .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      .replace(/\s+/g, "-").replace(/[^\w-]+/g, "");

  // Filtrage des unités appartenant à ce développement précis
  const devUnits = properties.filter((p) => {
    const nameInJson = slugify(p.development_name || "");
    const idInUrl = String(devId).toLowerCase();
    return nameInJson === idInUrl;
  });

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-12 h-12 border-4 border-slate-200 border-t-[#D4AF37] rounded-full animate-spin mb-4"></div>
      <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Chargement du projet...</p>
    </div>
  );

  if (!devUnits.length) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white text-center p-6">
      <h1 className="text-2xl font-serif mb-4">Projet introuvable</h1>
      <Link href="/" className="text-[#D4AF37] uppercase text-[10px] font-bold tracking-widest border-b border-[#D4AF37]">
        Retour à l'accueil
      </Link>
    </div>
  );

  const dev = devUnits[0];

  return (
    <main className="bg-white min-h-screen">
      <Navbar />
      
      {/* HEADER DU PROGRAMME - DESIGN LUXE */}
      <section className="relative pt-48 pb-32 bg-[#0A0A0A] text-white overflow-hidden">
        {/* Décoration de fond subtile */}
        <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-white/5 to-transparent pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <button 
            onClick={() => window.history.back()} 
            className="inline-flex items-center gap-2 text-slate-500 hover:text-[#D4AF37] transition-colors mb-12 text-[10px] uppercase font-black tracking-widest"
          >
            <ArrowLeft size={12} /> Retour à la sélection
          </button>
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8">
            <div>
              <div className="flex items-center gap-3 text-[#D4AF37] mb-4">
                <Building2 size={20} />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Développement Exclusif</span>
              </div>
              <h1 className="text-5xl md:text-8xl font-serif italic leading-tight">
                {dev.development_name}
              </h1>
              <p className="text-xl text-slate-400 mt-6 flex items-center gap-2">
                <MapPin size={20} className="text-[#D4AF37]" /> {dev.town}, {dev.province || "Espagne"}
              </p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-10 rounded-[2.5rem] min-w-[260px] text-center">
              <p className="text-[#D4AF37] text-[10px] font-black uppercase tracking-widest mb-2">Disponibilité</p>
              <p className="text-4xl font-serif italic">{devUnits.length} Unités</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION PRÉSENTATION */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          <div>
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#D4AF37] mb-8 flex items-center gap-4">
              <span className="w-12 h-[1px] bg-[#D4AF37]"></span> L'Art de Vivre
            </h2>
            <div 
              className="text-slate-600 font-light leading-relaxed text-xl space-y-6"
              dangerouslySetInnerHTML={{ __html: dev.description_fr || dev.description }}
            />
          </div>
          
          <div className="space-y-8">
             <div className="grid grid-cols-2 gap-6">
                <div className="p-10 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                  <p className="text-[9px] font-black uppercase text-slate-400 mb-2 tracking-widest">Distance Mer</p>
                  <p className="text-3xl font-serif italic text-slate-900">5 000 m</p>
                </div>
                <div className="p-10 bg-slate-50 rounded-[2.5rem] border border-slate-100">
                  <p className="text-[9px] font-black uppercase text-slate-400 mb-2 tracking-widest">Aéroport</p>
                  <p className="text-3xl font-serif italic text-slate-900">38 km</p>
                </div>
             </div>
             <div className="rounded-[3rem] overflow-hidden h-[400px] shadow-2xl border border-slate-100">
                <img 
                  src={Array.isArray(dev.images) ? (dev.images[0]?.url || dev.images[0]) : "/placeholder.jpg"} 
                  className="w-full h-full object-cover transition-transform duration-1000 hover:scale-105" 
                  alt="Lifestyle" 
                />
             </div>
          </div>
        </div>
      </section>

      {/* GRILLE DES UNITÉS */}
      <section className="py-24 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-serif italic text-slate-900 mb-6">Unités disponibles & Plans</h2>
            <p className="text-slate-400 text-[10px] uppercase font-black tracking-[0.2em]">Sélectionnez un lot pour voir les détails et plans d'étage</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {devUnits.map((unit) => (
              <div key={unit.id} className="group bg-white rounded-[3rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100">
                <div className="relative h-72 overflow-hidden">
                  <img 
                    src={Array.isArray(unit.images) ? (unit.images[0]?.url || unit.images[0]) : "/placeholder.jpg"} 
                    alt={unit.titre} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute top-6 left-6 bg-black/60 backdrop-blur-md px-4 py-2 rounded-full text-white text-[9px] font-black uppercase tracking-widest flex items-center gap-2 border border-white/10">
                    <Hash size={12} className="text-[#D4AF37]" /> {unit.reference || unit.id}
                  </div>
                </div>

                <div className="p-10">
                  <h3 className="text-2xl font-serif italic text-slate-900 mb-4">{unit.titre}</h3>
                  
                  <div className="flex justify-between items-end mb-8">
                    <p className="text-3xl font-serif text-slate-900">
                      {unit.price ? Number(unit.price).toLocaleString("fr-FR") : "--"} €
                    </p>
                    <span className="text-[9px] text-[#D4AF37] font-black uppercase flex items-center gap-2 tracking-widest mb-1">
                      <CheckCircle size={14} /> Disponible
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-4 py-6 mb-8 border-y border-slate-50 text-slate-500">
                    <div className="text-center">
                      <Bed size={20} className="mx-auto mb-2 text-slate-300" />
                      <span className="text-sm font-bold text-slate-900">{unit.beds || "0"}</span>
                      <p className="text-[8px] uppercase font-black text-slate-400">Chambres</p>
                    </div>
                    <div className="text-center border-x border-slate-50">
                      <Bath size={20} className="mx-auto mb-2 text-slate-300" />
                      <span className="text-sm font-bold text-slate-900">{unit.baths || "0"}</span>
                      <p className="text-[8px] uppercase font-black text-slate-400">Bains</p>
                    </div>
                    <div className="text-center">
                      <Maximize size={20} className="mx-auto mb-2 text-slate-300" />
                      <span className="text-sm font-bold text-slate-900">{unit.surface_area?.built || unit.sqft || "0"}m²</span>
                      <p className="text-[8px] uppercase font-black text-slate-400">Surface</p>
                    </div>
                  </div>

                  <Link 
                    href={`/bien/${unit.id}`} 
                    className="w-full py-5 bg-[#0A0A0A] text-white rounded-2xl flex items-center justify-center gap-3 hover:bg-[#D4AF37] transition-all text-[10px] font-black uppercase tracking-widest"
                  >
                    Voir les plans & détails <ChevronRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}