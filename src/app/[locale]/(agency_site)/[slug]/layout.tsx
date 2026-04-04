import { supabase } from "@/lib/supabase";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import CookieBanner from "@/components/CookieBanner";

export default async function AgencyLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // 1. Correction du nom de la table : 'agency_settings' au lieu de 'agencies'
  const { data: agency } = await supabase
    .from('agency_settings') 
    .select('*')
    .eq('subdomain', slug)
    .single();

  // 2. Préparation des variables CSS pour Tailwind
  const dynamicStyles = {
    '--brand-primary': agency?.primary_color || '#10b981',
    '--font-main': agency?.font_family || 'Inter, sans-serif',
    '--font-serif': 'Playfair Display, serif', // Tu peux aussi le rendre dynamique
  } as React.CSSProperties;

  return (
    // 3. On applique les variables ici pour qu'elles soient disponibles dans tout le site
    <div style={dynamicStyles} className="min-h-screen">
      {children}
      
      {agency && (
        <>
          <FloatingWhatsApp 
            phone={agency.footer_config?.socials?.whatsapp || agency.whatsapp_number} 
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