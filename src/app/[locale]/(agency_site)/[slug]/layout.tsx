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

  // 1. On récupère l'agence en utilisant le SLUG (qui correspond au segment d'URL)
  const { data: agency } = await supabase
    .from('agency_settings') 
    .select('*')
    .eq('slug', slug) // CHANGEMENT ICI : 'slug' au lieu de 'subdomain'
    .maybeSingle();

  // 2. Préparation des styles
  const dynamicStyles = {
    '--brand-primary': agency?.primary_color || '#10b981',
    '--font-main': agency?.font_family || 'Inter, sans-serif',
    '--font-serif': 'Playfair Display, serif',
  } as React.CSSProperties;

  return (
    <div style={dynamicStyles} className="min-h-screen">
      {/* IMPORTANT : On doit TOUJOURS rendre {children}. 
         Si on ne le fait pas, /about et /contact ne s'afficheront JAMAIS.
      */}
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