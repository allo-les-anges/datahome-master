import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { Shield } from "lucide-react";

export const revalidate = 0; // Force Next.js à ignorer le cache pour vos tests
export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Récupération des données de l'agence
  const { data: agency } = await supabase
    .from('agencies')
    .select('*')
    .eq('subdomain', slug)
    .single();

  if (!agency) return notFound();

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header simple pour la page légale */}
      <header className="bg-white border-b border-slate-100 py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-2xl bg-slate-900 text-white">
              <Shield size={24} />
            </div>
            <h1 className="text-3xl md:text-4xl font-serif italic text-slate-900">
              Politique de Confidentialité
            </h1>
          </div>
          <p className="text-slate-500 font-medium uppercase text-[10px] tracking-widest">
            {agency.agency_name} — Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
          </p>
        </div>
      </header>

      {/* Contenu dynamique */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="prose prose-slate max-w-none">
            {agency.privacy_policy ? (
              <div className="whitespace-pre-wrap text-slate-600 leading-relaxed">
                {agency.privacy_policy}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-slate-400 italic">
                  La politique de confidentialité n'a pas encore été rédigée pour cette agence.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Bouton retour */}
        <div className="mt-12 text-center">
          <a 
            href={`/agency/${slug}`}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors text-xs font-bold uppercase tracking-widest"
          >
            ← Retour à l'accueil
          </a>
        </div>
      </main>
    </div>
  );
}