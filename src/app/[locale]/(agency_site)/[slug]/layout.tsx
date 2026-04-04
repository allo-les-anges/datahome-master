import { supabase } from "@/lib/supabase";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import CookieBanner from "@/components/CookieBanner";

export default async function AgencyLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string; locale: string }>; // Ajout de locale ici
}) {
  const { slug } = await params; // On récupère le slug de l'agence

  const { data: agency } = await supabase
    .from('agency_settings') 
    .select('*')
    .eq('subdomain', slug)
    .single();

  const dynamicStyles = {
    '--brand-primary': agency?.primary_color || '#10b981',
    '--font-main': agency?.font_family || 'Inter, sans-serif',
    '--font-serif': 'Playfair Display, serif',
  } as React.CSSProperties;

  return (
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