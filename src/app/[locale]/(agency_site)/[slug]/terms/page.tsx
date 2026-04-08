import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { FileText, ChevronLeft } from "lucide-react";
import Link from "next/link";
import { getTranslator } from "@/lib/i18n";

export const revalidate = 0;

export default async function TermsPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  const t = await getTranslator(locale);

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
              {t('footer.terms')}
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
              {/* Affiche le texte de la base de données OU la traduction par défaut */}
              {agency.terms_content || t('legal.terms_default')}
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Link 
            href={`/${locale}/${slug}`}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors text-xs font-bold uppercase tracking-widest"
          >
            <ChevronLeft size={14} />
            {t('nav.back_home') || 'Retour'}
          </Link>
        </div>
      </main>
    </div>
  );
}