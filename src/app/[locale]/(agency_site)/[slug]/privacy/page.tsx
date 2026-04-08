import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { Shield, ChevronLeft } from "lucide-react";
import Link from "next/link";

export const revalidate = 0; // Garantit que les changements dans le Dashboard sont visibles immédiatement

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;

  // Récupération des données depuis la table correcte : agency_settings
  const { data: agency } = await supabase
    .from('agency_settings')
    .select('*')
    .eq('subdomain', slug) // On utilise subdomain pour matcher le [slug] de l'URL
    .single();

  if (!agency) return notFound();

  // Texte de secours (Fallback) intelligent si Francisco n'a rien saisi
  const defaultPrivacy = `
    L'agence ${agency.agency_name} s'engage à ce que la collecte et le traitement de vos données soient conformes au règlement général sur la protection des données (RGPD). 
    
    Les données personnelles collectées (nom, email, téléphone) via les formulaires de ce site sont utilisées exclusivement pour vous recontacter dans le cadre de votre recherche immobilière ou de la mise en vente de votre bien. Elles ne sont en aucun cas cédées à des tiers.
    
    Vous disposez d'un droit d'accès, de rectification et de suppression des données vous concernant. Pour exercer ce droit, contactez-nous par email à l'adresse : ${agency.email || 'notre service client'}.
  `;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header avec Branding dynamique */}
      <header className="bg-white border-b border-slate-100 py-12">
        <div className="max-w-4xl mx-auto px-6">
          <div className="flex items-center gap-4 mb-4">
            <div 
              className="p-3 rounded-2xl text-white"
              style={{ backgroundColor: agency.primary_color || '#0f172a' }}
            >
              <Shield size={24} />
            </div>
            <h1 className="text-3xl md:text-4xl font-serif italic text-slate-900">
              Politique de Confidentialité
            </h1>
          </div>
          <div className="space-y-1">
            <p className="text-slate-500 font-medium uppercase text-[10px] tracking-widest">
              {agency.agency_name} {agency.legal_name ? `(${agency.legal_name})` : ''}
            </p>
            <p className="text-slate-400 text-[9px] italic">
              Dernière mise à jour : {new Date().toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>
      </header>

      {/* Zone de contenu */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="bg-white p-8 md:p-12 rounded-[2.5rem] shadow-sm border border-slate-100">
          <div className="prose prose-slate max-w-none">
            <div className="whitespace-pre-wrap text-slate-600 leading-relaxed text-sm md:text-base">
              {/* On affiche la colonne privacy_policy si elle existe, sinon le texte par défaut */}
              {agency.privacy_policy || defaultPrivacy}
            </div>
          </div>
        </div>

        {/* Bouton de retour contextuel au SaaS */}
        <div className="mt-12 text-center">
          <Link 
            href={`/${locale}/${slug}`}
            className="inline-flex items-center gap-2 text-slate-400 hover:text-slate-900 transition-colors text-xs font-bold uppercase tracking-widest"
          >
            <ChevronLeft size={14} />
            Retour à l'accueil de l'agence
          </Link>
        </div>
      </main>
    </div>
  );
}