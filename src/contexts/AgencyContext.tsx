"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

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

  const setAgencyBySlug = useCallback(async (slug: string) => {
    if (!slug) return;
    try {
      if (agency?.slug === slug) return;
      const { data } = await supabase
        .from('agency_settings')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();
      if (data) setAgency(data);
    } catch (err) {
      console.error("Erreur setAgencyBySlug:", err);
    }
  }, [agency?.slug]);

  useEffect(() => {
    let isMounted = true;

    async function fetchAgency() {
      if (!isMounted) return;
      setLoading(true);

      try {
        const host = window.location.hostname;
        const path = window.location.pathname;
        
        // On découpe l'URL et on ignore les segments vides
        const pathParts = path.split('/').filter(Boolean);
        
        // Logique de détection du slug :
        // Dans /fr/schmidt-privilege/about -> pathParts[1] est le slug
        const urlSlug = pathParts.length >= 2 ? pathParts[1] : null;

        const subdomain = host.split('.')[0];
        let agencyData = null;

        // 1. Recherche par le slug de l'URL (Priorité Vercel/Local)
        if (urlSlug && (host.includes('vercel.app') || host.includes('localhost'))) {
          const { data } = await supabase
            .from('agency_settings')
            .select('*')
            .eq('slug', urlSlug)
            .maybeSingle();
          agencyData = data;
        }

        // 2. Recherche par domaine (Production)
        if (!agencyData && subdomain !== 'datahome') {
          const { data } = await supabase
            .from('agency_settings')
            .select('*')
            .or(`subdomain.eq.${subdomain},custom_domain.eq.${host}`)
            .maybeSingle();
          agencyData = data;
        }

        // 3. Fallback (Si rien n'est trouvé)
        if (!agencyData) {
          const { data } = await supabase
            .from('agency_settings')
            .select('*')
            .eq('slug', 'schmidt-privilege')
            .maybeSingle();
          agencyData = data;
        }

        if (isMounted && agencyData) {
          setAgency(agencyData);
        }
      } catch (err) {
        console.error("💥 Erreur AgencyContext:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    
    fetchAgency();
    return () => { isMounted = false; };
  }, []);

  return (
    <AgencyContext.Provider value={{ agency, loading, setAgencyBySlug }}>
      {children}
    </AgencyContext.Provider>
  );
}

export const useAgency = () => useContext(AgencyContext);