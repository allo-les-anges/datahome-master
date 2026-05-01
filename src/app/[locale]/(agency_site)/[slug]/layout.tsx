import { supabase } from "@/lib/supabase";
import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import CookieBanner from "@/components/CookieBanner";

export default async function AgencyLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;

  // 1. Récupération des paramètres de l'agence (SSR)
  let { data: agency } = await supabase
    .from('agency_settings')
    .select('*')
    .eq('subdomain', slug)
    .maybeSingle();

  // Fallback: Safari et certains navigateurs normalisent les tirets finaux dans les URL.
  // On tente les variantes sans tiret final et avec tiret final pour être robuste.
  if (!agency) {
    const variants = Array.from(new Set([
      slug.replace(/^-+|-+$/g, ''),  // sans tirets de bord
      slug.replace(/-+$/, '') + '-', // avec tiret final ajouté
    ])).filter((v) => v !== slug);

    for (const variant of variants) {
      const { data: fallback } = await supabase
        .from('agency_settings')
        .select('*')
        .eq('subdomain', variant)
        .maybeSingle();
      if (fallback) {
        const headersList = await headers();
        const rawUrl = headersList.get('x-url') || '';
        const canonicalPath = rawUrl
          ? new URL(rawUrl).pathname.replace(`/${slug}`, `/${variant}`)
          : `/${locale}/${variant}`;
        redirect(canonicalPath);
      }
    }
    return notFound();
  }

  // 2. Définition des variables CSS dynamiques
  const dynamicStyles = {
    '--brand-primary': agency.primary_color || '#e5992e',
    '--font-main': agency.font_family || 'Montserrat, sans-serif',
    '--font-serif': 'Playfair Display, serif',
  } as React.CSSProperties;

  // 3. Parsing sécurisé de la configuration
  const getFooterData = (config: any) => {
    if (!config) return {};
    if (typeof config === 'object') return config;
    try { return JSON.parse(config); } catch { return {}; }
  };

  const footerConfig = getFooterData(agency.footer_config);
  const trialExpiresAt = footerConfig?.subscription?.trial_expires_at || agency.trial_expires_at;
  const trialExpired = trialExpiresAt ? new Date(trialExpiresAt).getTime() < Date.now() : false;

  if (trialExpired && footerConfig?.subscription?.plan === 'trial') {
    return (
      <div style={dynamicStyles} className="min-h-screen flex flex-col items-center justify-center bg-slate-950 px-6 text-center">
        <div
          className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 text-white font-bold text-2xl shadow-inner"
          style={{ backgroundColor: agency.primary_color || '#0f172a' }}
        >
          {agency.agency_name?.charAt(0)}
        </div>
        <h1 className="text-2xl font-serif italic text-white mb-3">{agency.agency_name}</h1>
        <p className="max-w-md text-sm text-white/55 leading-7">
          La période d'essai premium de 15 jours est terminée. Contactez DATA-HOME pour réactiver votre espace.
        </p>
      </div>
    );
  }

  return (
    <div style={dynamicStyles} className="min-h-screen flex flex-col">
      {/* NAVBAR : Présente sur toutes les pages du slug */}
      <Navbar agency={agency} />

      {/* CONTENU : Les pages (/about, /contact, home) s'injectent ici */}
      <main className="flex-grow">
        {children}
      </main>
      
      {/* FOOTER : Présent partout */}
      <Footer agency={agency} />

      {/* Widget WhatsApp — affiché uniquement si le module est activé */}
      {footerConfig?.integrations?.whatsapp_enabled && (
        <FloatingWhatsApp
          phone={footerConfig.integrations.whatsapp_number || footerConfig?.phone || agency.whatsapp_number}
          color="#25D366"
        />
      )}
      
      <CookieBanner 
        enabled={agency.cookie_consent_enabled} 
        agencyName={agency.agency_name} 
      />
    </div>
  );
}
