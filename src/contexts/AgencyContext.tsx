"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { usePathname } from "next/navigation";

interface AgencyContextType {
  agency: any;
  loading: boolean;
  setAgencyBySlug: (slug: string) => Promise<void>;
}

const AgencyContext = createContext<AgencyContextType>({
  agency: null,
  loading: true,
  setAgencyBySlug: async () => {},
});

export function AgencyProvider({ children }: { children: React.ReactNode }) {
  const [agency, setAgency] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  const fetchAgencyData = useCallback(async (slug: string) => {
    console.log(`🔍 [Supabase] Tentative de récupération pour le slug: "${slug}"`);
    const { data, error } = await supabase
      .from('agency_settings')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
    
    if (error) console.error("❌ [Supabase] Erreur:", error);
    if (!data) console.warn(`⚠️ [Supabase] Aucune agence trouvée pour le slug: "${slug}"`);
    else console.log("✅ [Supabase] Agence récupérée avec succès:", data.agency_name);
    
    return data;
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function initAgency() {
      console.log("🚀 [AgencyContext] Initialisation...");
      setLoading(true);
      
      try {
        const host = window.location.hostname;
        const segments = pathname.split('/').filter(Boolean);
        
        console.log("📍 https://www.merriam-webster.com/dictionary/context", {
          fullPath: pathname,
          segments: segments,
          hostname: host
        });

        // Détection du slug
        const locales = ['fr', 'en', 'nl', 'es', 'ar', 'pl'];
        const urlSlug = segments.find(s => !locales.includes(s));
        
        console.log(`🎯 [Analyse] Slug détecté dans l'URL: "${urlSlug}"`);

        let data = null;

        // 1. Test via le slug de l'URL
        if (urlSlug) {
          data = await fetchAgencyData(urlSlug);
        }

        // 2. Test via le domaine (si pas de slug ou slug invalide)
        if (!data) {
          const subdomain = host.split('.')[0];
          if (subdomain !== 'datahome' && subdomain !== 'localhost') {
            console.log(`🌐 [Domaine] Test du sous-domaine: "${subdomain}"`);
            const { data: subData } = await supabase
              .from('agency_settings')
              .select('*')
              .or(`subdomain.eq.${subdomain},custom_domain.eq.${host}`)
              .maybeSingle();
            data = subData;
          }
        }

        // 3. Fallback
        if (!data) {
          console.log("🏠 [Fallback] Utilisation de l'agence par défaut: schmidt-privilege");
          data = await fetchAgencyData('schmidt-privilege');
        }

        if (isMounted) {
          setAgency(data);
          console.log("💾 [State] AgencyContext mis à jour.");
        }
      } catch (err) {
        console.error("💥 [AgencyContext] Erreur critique:", err);
      } finally {
        if (isMounted) {
          setLoading(false);
          console.log("🏁 [AgencyContext] Chargement terminé.");
        }
      }
    }

    initAgency();
    return () => { isMounted = false; };
  }, [pathname, fetchAgencyData]);

  return (
    <AgencyContext.Provider value={{ 
      agency, 
      loading, 
      setAgencyBySlug: async (slug) => {
        console.log(`Manual override pour le slug: ${slug}`);
        const d = await fetchAgencyData(slug);
        if (d) setAgency(d);
      } 
    }}>
      {children}
    </AgencyContext.Provider>
  );
}

export const useAgency = () => useContext(AgencyContext);