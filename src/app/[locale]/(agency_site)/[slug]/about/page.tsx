import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";

interface AboutPageProps {
  params: Promise<{
    slug: string;
    locale: string;
  }>;
}

export default async function AboutPage({ params }: AboutPageProps) {
  const { slug, locale } = await params;

  // Récupération de l'agence
  const { data: agency, error } = await supabase
    .from('agency_settings')
    .select('*')
    .eq('subdomain', slug) 
    .maybeSingle();

  if (error || !agency) {
    notFound();
  }

  const brandColor = agency.primary_color || "#c5a059";
  const selectedFont = agency.font_family || 'Montserrat';
  
  // Traductions basées sur la locale
  const translations: Record<string, any> = {
    fr: {
      aboutTitle: "Notre Histoire",
      aboutText: "L'excellence immobilière à votre service.",
      signature: "L'immobilier sous un nouveau regard"
    },
    en: {
      aboutTitle: "Our Story",
      aboutText: "Real estate excellence at your service.",
      signature: "Real estate through a new lens"
    },
    es: {
      aboutTitle: "Nuestra Historia",
      aboutText: "Excelencia inmobiliaria a su servicio.",
      signature: "Bienes raíces bajo una nueva mirada"
    },
    nl: {
      aboutTitle: "Ons Verhaal",
      aboutText: "Vastgoedexcellentie in uw dienst.",
      signature: "Vastgoed door een nieuwe lens"
    },
    pl: {
      aboutTitle: "Nasza Historia",
      aboutText: "Doskonałość w nieruchomościach na Twoją usługę.",
      signature: "Nieruchomości w nowym świetle"
    },
    ar: {
      aboutTitle: "قصتنا",
      aboutText: "التميز العقاري في خدمتكم.",
      signature: "العقارات من منظور جديد"
    }
  };

  const t = translations[locale] || translations.fr;

  // Styles inline pour garantir l'application
  const containerStyle = {
    minHeight: '100vh',
    backgroundColor: '#ffffff',
    color: '#0f172a',
    transition: 'all 0.5s ease',
    fontFamily: selectedFont,
  };

  const heroSectionStyle = {
    paddingTop: '208px', // pt-52
    paddingBottom: '80px', // pb-20
    paddingLeft: '24px',
    paddingRight: '24px',
  };

  const titleStyle = {
    fontSize: '3rem', // text-5xl
    fontFamily: 'serif',
    fontStyle: 'italic',
    borderLeftWidth: '4px',
    paddingLeft: '32px',
    marginBottom: '32px',
  };

  const descriptionStyle = {
    color: '#475569', // text-slate-600
    lineHeight: '1.625',
    whiteSpace: 'pre-wrap' as const,
    fontWeight: 300,
    fontSize: '1.25rem', // text-xl
    fontStyle: 'italic',
  };

  const signatureSectionStyle = {
    paddingTop: '128px',
    paddingBottom: '128px',
    backgroundColor: '#f8fafc', // bg-slate-50
    borderTopWidth: '1px',
    borderBottomWidth: '1px',
    borderColor: 'rgba(0,0,0,0.05)',
  };

  const signatureTitleStyle = {
    fontSize: '1.875rem', // text-3xl
    fontFamily: 'serif',
    fontStyle: 'italic',
    color: brandColor,
    marginBottom: '16px',
  };

  const signatureTextStyle = {
    color: '#64748b', // text-slate-500
    textTransform: 'uppercase' as const,
    letterSpacing: '0.4em',
    fontSize: '10px',
    fontWeight: 700,
  };

  // Styles responsives pour desktop
  const responsiveTitleStyle = {
    ...titleStyle,
    '@media (min-width: 768px)': {
      fontSize: '4.5rem', // md:text-7xl
    },
  };

  return (
    <div style={containerStyle}>
      <main>
        {/* Header / Hero Section */}
        <section style={heroSectionStyle}>
          <div style={{ maxWidth: '1024px', margin: '0 auto' }}>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'flex-start',
              gap: '64px',
              '@media (min-width: 768px)': {
                flexDirection: 'row',
              }
            }}>
              
              <div style={{ flex: 1 }}>
                <h1 
                  style={{
                    ...titleStyle,
                    borderColor: brandColor,
                    '@media (min-width: 768px)': {
                      fontSize: '4.5rem',
                    }
                  }}
                >
                  {agency.about_title || t.aboutTitle}
                </h1>
                
                <div style={{ maxWidth: 'none' }}>
                  <div style={descriptionStyle}>
                    {agency.about_text || t.aboutText}
                  </div>
                </div>
              </div>

              {agency.hero_url && (
                <div style={{
                  width: '100%',
                  aspectRatio: '3/4',
                  borderRadius: '3rem',
                  overflow: 'hidden',
                  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)',
                  transform: 'rotate(2deg)',
                  transition: 'transform 0.7s ease',
                  '@media (min-width: 768px)': {
                    width: '33.333%',
                  }
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'rotate(0deg)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'rotate(2deg)';
                }}>
                  <img 
                    src={agency.hero_url} 
                    alt={agency.agency_name} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    loading="lazy"
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Section Signature */}
        <section style={signatureSectionStyle}>
          <div style={{ maxWidth: '896px', margin: '0 auto', paddingLeft: '24px', paddingRight: '24px', textAlign: 'center' }}>
            <h2 style={signatureTitleStyle}>
              {agency.agency_name}
            </h2>
            <p style={signatureTextStyle}>
              {t.signature}
            </p>
          </div>
        </section>
      </main>

      {/* Injection CSS pour les media queries responsives */}
      <style jsx>{`
        @media (min-width: 768px) {
          .about-container {
            flex-direction: row;
          }
          .about-title {
            font-size: 4.5rem;
          }
          .about-image {
            width: 33.333%;
          }
        }
      `}</style>
    </div>
  );
}