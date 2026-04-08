import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { FileText, ChevronLeft } from "lucide-react";
import Link from "next/link";

// Importations statiques
import fr from "@/locales/fr.json";
import en from "@/locales/en.json";
import es from "@/locales/es.json";
import nl from "@/locales/nl.json";
import pl from "@/locales/pl.json";
import ar from "@/locales/ar.json";

export const revalidate = 0;

export default async function TermsPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;

  // Sélection de la traduction
  const translations: any = 
    locale === 'en' ? en : 
    locale === 'es' ? es : 
    locale === 'nl' ? nl : 
    locale === 'pl' ? pl : 
    locale === 'ar' ? ar : fr;

  const { data: agency } = await supabase
    .from('agency_settings')
    .select('*')
    .eq('subdomain', slug)
    .single();

  if (!agency) return notFound();

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-100 py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-4">
            <div 
              className="p-3 rounded-2xl text-white"
              style={{ backgroundColor: agency.primary_color || '#0f172a' }}
            >
              <FileText size={24} />
            </div>
            <h1 className="text-3xl md:text-4xl font-serif italic text-slate-900">
              {translations.footer?.terms || "Terms & Conditions"}
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
              {agency.terms_content || translations.legal?.terms_default}
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link 
            href={`/${locale}/${slug}`}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors text-xs font-bold uppercase tracking-widest"
          >
            <ChevronLeft size={14} />
            {translations.common?.backToHome || "Back"}
          </Link>
        </div>
      </main>
    </div>
  );
}