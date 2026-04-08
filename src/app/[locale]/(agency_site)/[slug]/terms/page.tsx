import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { FileText, ChevronLeft } from "lucide-react";
import Link from "next/link";

export const revalidate = 0;

export default async function TermsPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;

  const { data: agency } = await supabase
    .from('agency_settings')
    .select('*')
    .eq('subdomain', slug)
    .single();

  if (!agency) return notFound();

  // Texte par défaut pour les mentions légales / CGU
  const defaultTerms = `
    Les présentes conditions régissent l'utilisation du site de l'agence ${agency.agency_name}. 
    
    1. Éditeur du site : ${agency.legal_name || agency.agency_name}.
    2. Hébergement : Vercel Inc.
    3. Propriété intellectuelle : Tous les contenus (photos, textes) sont la propriété de l'agence ou de ses concédants.
    4. Responsabilité : Les informations sur les biens sont fournies sous réserve d'erreur ou d'omission.
  `;

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-100 py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 rounded-2xl bg-slate-900 text-white">
              <FileText size={24} />
            </div>
            <h1 className="text-3xl md:text-4xl font-serif italic text-slate-900">
              Mentions Légales & CGU
            </h1>
          </div>
          <p className="text-slate-500 font-medium uppercase text-[10px] tracking-widest">
            {agency.agency_name}
          </p>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="prose prose-slate max-w-none">
            <div className="whitespace-pre-wrap text-slate-600 leading-relaxed text-sm">
              {agency.terms_content || defaultTerms}
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link 
            href={`/${locale}/${slug}`}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors text-xs font-bold uppercase tracking-widest"
          >
            <ChevronLeft size={14} />
            Retour
          </Link>
        </div>
      </main>
    </div>
  );
}