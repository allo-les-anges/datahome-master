"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
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

  // On utilise useCallback pour que la fonction ne change pas à chaque rendu
  const fetchAgencyData = useCallback(async (slug: string) => {
    if (!slug) return null;
    
    console.log(`🔍 [Supabase] Tentative de récupération pour : "${slug}"`);
    const { data, error } = await supabase
      .from('agency_settings')
      .select('*')
      .eq('subdomain', slug) // On interroge la colonne subdomain
      .maybeSingle();
    
    if (error) {
      console.error("❌ [Supabase] Erreur:", error);
      return null;
    }
    return data;
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function initAgency() {
      if (!isMounted) return;
      
      console.log("🚀 [AgencyContext] Initialisation...");
      setLoading(true);
      
      try {
        const host = window.location.hostname;
        const segments = pathname.split('/').filter(Boolean);
        
        // Détection du slug dans l'URL (ex: /fr/schmidt-privilege -> schmidt-privilege)
        const locales = ['fr', 'en', 'nl', 'es', 'ar', 'pl'];
        const urlSlug = segments.find(s => !locales.includes(s));
        
        let data = null;

        // 1. Priorité au slug détecté dans l'URL
        if (urlSlug) {
          data = await fetchAgencyData(urlSlug);
        }

        // 2. Si pas de slug, test via le domaine/sous-domaine (SaaS mode)
        if (!data) {
          const subdomain = host.split('.')[0];
          if (subdomain !== 'datahome' && subdomain !== 'localhost' && subdomain !== 'www') {
            const { data: subData } = await supabase
              .from('agency_settings')
              .select('*')
              .or(`subdomain.eq.${subdomain},custom_domain.eq.${host}`)
              .maybeSingle();
            data = subData;
          }
        }

        // 3. Fallback ultime si rien n'est trouvé
        if (!data) {
          console.log("🏠 [Fallback] Utilisation de l'agence par défaut");
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
  }, [pathname, fetchAgencyData]); // fetchAgencyData est stable grâce au useCallback

  // Mémoïsation de la valeur du contexte pour optimiser les performances
  const contextValue = useMemo(() => ({
    agency,
    loading,
    setAgencyBySlug: async (slug: string) => {
      // Éviter de recharger si c'est déjà la même agence
      if (agency?.subdomain === slug) return;
      
      setLoading(true);
      const d = await fetchAgencyData(slug);
      if (d) setAgency(d);
      setLoading(false);
    }
  }), [agency, loading, fetchAgencyData]);

  return (
    <AgencyContext.Provider value={contextValue}>
      {children}
    </AgencyContext.Provider>
  );
}

export const useAgency = () => useContext(AgencyContext);