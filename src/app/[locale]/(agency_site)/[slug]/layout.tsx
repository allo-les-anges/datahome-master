// src/app/[locale]/(agency_site)/[slug]/layout.tsx
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

  // On cherche par SLUG (car c'est ce qui est dans l'URL /[locale]/[slug])
  const { data: agency } = await supabase
    .from('agency_settings') 
    .select('*')
    .eq('slug', slug) // ✅ Correction : on utilise le slug
    .maybeSingle();  // ✅ Sécurité : ne crash pas si non trouvé

  const dynamicStyles = {
    '--brand-primary': agency?.primary_color || '#10b981',
    '--font-main': agency?.font_family || 'Inter, sans-serif',
    '--font-serif': 'Playfair Display, serif',
  } as React.CSSProperties;

  return (
    <div style={dynamicStyles} className="min-h-screen">
      {/* IMPORTANT : children DOIT être rendu ici. 
          C'est ce qui contient tes pages /about et /contact.
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