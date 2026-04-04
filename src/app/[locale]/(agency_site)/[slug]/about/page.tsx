import { supabase } from "@/lib/supabase";

export default async function AboutPage() {
  // 1. Récupérer les données de l'agence (ici exemple simplifié, à adapter selon votre logique de domaine)
  const { data: agency } = await supabase
    .from('agency_settings')
    .select('*')
    .single(); // Dans un vrai SaaS, on filtrerait par le domaine actuel

  return (
    <main className="min-h-screen pt-32 px-6 max-w-4xl mx-auto">
      <h1 className="text-4xl font-serif mb-8" style={{ color: agency?.primary_color }}>
        {agency?.about_title || "À Propos"}
      </h1>
      
      <div className="prose prose-lg text-slate-700 leading-relaxed whitespace-pre-wrap">
        {agency?.about_text || "Contenu en cours de rédaction..."}
      </div>
    </main>
  );
}