import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface AboutPageProps {
  params: Promise<{
    slug: string;
    locale: string;
  }>;
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { slug } = await params;

  // Récupération de l'agence par slug
  const { data: agency, error } = await supabase
    .from('agency_settings')
    .select('*')
    .eq('slug', slug)
    .maybeSingle();

  if (error || !agency) {
    notFound();
  }

  const brandColor = agency.primary_color || "#c5a059";
  const selectedFont = agency.font_family || 'Montserrat';

  return (
    <div 
      className="min-h-screen bg-white dark:bg-[#0A0A0A] text-slate-900 dark:text-white transition-colors duration-500"
      style={{ fontFamily: selectedFont }}
    >
      <Navbar agency={agency} />

      <main className="relative">
        {/* Header / Hero Section */}
        <section className="pt-52 pb-20 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="flex flex-col md:flex-row items-start gap-16">
              
              <div className="flex-1 space-y-8">
                <h1 
                  className="text-5xl md:text-7xl font-serif italic border-l-4 pl-8" 
                  style={{ borderColor: brandColor }}
                >
                  {agency.about_title || "Notre Histoire"}
                </h1>
                
                <div className="prose prose-lg dark:prose-invert max-w-none">
                  <div className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-wrap font-light text-xl italic">
                    {agency.about_text || "L'excellence immobilière à votre service."}
                  </div>
                </div>
              </div>

              {agency.hero_url && (
                <div className="w-full md:w-1/3 aspect-[3/4] rounded-[3rem] overflow-hidden shadow-2xl rotate-2 hover:rotate-0 transition-transform duration-700">
                  <img 
                    src={agency.hero_url} 
                    alt={agency.agency_name} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Section Signature */}
        <section className="py-32 bg-slate-50 dark:bg-white/5 border-y border-black/5 dark:border-white/5">
          <div className="max-w-4xl mx-auto px-6 text-center space-y-4">
             <h2 className="text-3xl font-serif italic" style={{ color: brandColor }}>
               {agency.agency_name}
             </h2>
             <p className="text-slate-400 dark:text-slate-500 uppercase tracking-[0.4em] text-[10px] font-bold">
               L'immobilier sous un nouveau regard
             </p>
          </div>
        </section>
      </main>

      <Footer agency={agency} />
    </div>
  );
}