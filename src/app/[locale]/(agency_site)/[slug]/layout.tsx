import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
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
  const { slug } = await params;

  // 1. Récupération des paramètres de l'agence (SSR)
  // CORRECTION : Utilisation du nom de table exact 'agency_settings'
  const { data: agency } = await supabase
    .from('agency_settings') 
    .select('*')
    .eq('subdomain', slug) 
    .maybeSingle();

  if (!agency) return notFound();

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