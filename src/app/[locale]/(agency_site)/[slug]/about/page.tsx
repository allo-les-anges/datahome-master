import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// On définit le type des paramètres pour Next.js
interface AboutPageProps {
  params: Promise<{
    slug: string;
    locale: string;
  }>;
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { slug } = await params;

  // 1. Récupérer les données de l'agence spécifique au slug
  const { data: agency, error } = await supabase
    .from('agency_settings')
    .select('*')
    .eq('slug', slug) // CRITIQUE : On filtre par le slug de l'URL
    .single();

  // Si l'agence n'existe pas, on renvoie une 404
  if (error || !agency) {
    notFound();
  }

  const brandColor = agency.primary_color || "#c5a059";
  const selectedFont = agency.font_family || 'Montserrat';

  return (
    <div 
      className="min-h-screen bg-white dark:bg-[#0A0A0A] transition-colors duration-500"
      style={{ fontFamily: selectedFont }}
    >
      {/* On passe l'objet agency à la Navbar et au Footer pour la cohérence visuelle */}
      <Navbar agency={agency} />

      <main className="relative">
        {/* Header de la page About */}
        <section className="pt-40 pb-20 px-6">
          <div className="max-w-4xl mx-auto">
            <h1 
              className="text-5xl md:text-7xl font-serif italic mb-12 border-l-4 pl-8" 
              style={{ borderColor: brandColor, color: agency.dark_mode ? '#white' : '#1e293b' }}
            >
              {agency.about_title || "Notre Histoire"}
            </h1>
            
            <div className="grid grid-cols-1 gap-12">
              {/* Image de présentation si disponible */}
              {agency.hero_url && (
                <div className="w-full h-[400px] rounded-[2rem] overflow-hidden shadow-2xl">
                  <img 
                    src={agency.hero_url} 
                    alt={agency.agency_name} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}

              {/* Texte de présentation */}
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <div 
                  className="text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-light text-xl italic"
                >
                  {agency.about_text || "L'excellence immobilière à votre service."}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section optionnelle : Valeurs ou Vision */}
        <section className="py-20 bg-slate-50 dark:bg-white/5">
          <div className="max-w-4xl mx-auto px-6 text-center">
             <h2 className="text-2xl font-serif italic mb-6" style={{ color: brandColor }}>
                {agency.agency_name}
             </h2>
             <p className="text-slate-500 dark:text-slate-400 uppercase tracking-[0.3em] text-xs">
                Une signature d'exception
             </p>
          </div>
        </section>
      </main>

      <Footer agency={agency} />
    </div>
  );
}