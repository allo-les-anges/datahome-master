import { supabase } from "@/lib/supabase";
import FloatingWhatsApp from "@/components/FloatingWhatsApp";
import CookieBanner from "@/components/CookieBanner";

export default async function AgencyLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ slug: string }>; // Changement ici : Promise
}) {
  // On attend la résolution des params
  const { slug } = await params;

  // On récupère les infos de l'agence via le slug
  const { data: agency } = await supabase
    .from('agencies')
    .select('*')
    .eq('subdomain', slug)
    .single();

  return (
    <>
      {children}
      {agency && (
        <>
          <FloatingWhatsApp 
            phone={agency.footer_config?.socials?.whatsapp} 
            color={agency.primary_color || agency.button_color} 
          />
          <CookieBanner 
            enabled={agency.cookie_consent_enabled} 
            agencyName={agency.agency_name} 
          />
        </>
      )}
    </>
  );
}