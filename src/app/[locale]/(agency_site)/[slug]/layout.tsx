import { supabase } from "@/lib/supabase";
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

  // Récupération des paramètres de l'agence via la colonne subdomain
  const { data: agency } = await supabase
    .from('agency_settings') 
    .select('*')
    .eq('subdomain', slug) 
    .maybeSingle();

  // Définition des variables CSS dynamiques pour le thème de l'agence
  const dynamicStyles = {
    '--brand-primary': agency?.primary_color || '#10b981',
    '--font-main': agency?.font_family || 'Inter, sans-serif',
    '--font-serif': 'Playfair Display, serif',
  } as React.CSSProperties;

  // Parsing sécurisé de footer_config (au cas où il arrive en string JSON)
  const getFooterData = (config: any) => {
    if (!config) return {};
    if (typeof config === 'object') return config;
    try { return JSON.parse(config); } catch { return {}; }
  };

  const footerConfig = getFooterData(agency?.footer_config);

  return (
    <div style={dynamicStyles} className="min-h-screen">
      {/* IMPORTANT : children permet d'afficher les pages enfants 
          (/contact, /about, etc.) à l'intérieur de ce layout.
      */}
      {children} 
      
      {agency && (
        <>
          {/* Widgets flottants spécifiques à l'agence */}
          <FloatingWhatsApp 
            phone={footerConfig?.socials?.whatsapp || agency.whatsapp_number} 
            color={agency.primary_color} 
          />
          <CookieBanner 
            enabled={agency.cookie_consent_enabled} 
            agencyName={agency.agency_name} 
          />
        </>
      )}
    </div>
  );
}