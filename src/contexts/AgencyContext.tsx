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
    const { data } = await supabase
      .from('agency_settings')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
    return data;
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function loadAgency() {
      if (!isMounted) return;
      setLoading(true);

      try {
        const host = window.location.hostname;
        const segments = pathname.split('/').filter(Boolean);
        
        // Structure: /[locale]/[slug]/... -> slug est en index 1
        const urlSlug = segments.length >= 2 ? segments[1] : null;
        const subdomain = host.split('.')[0];

        let data = null;

        // 1. Priorité URL (Vercel/Local)
        if (urlSlug && (host.includes('vercel.app') || host.includes('localhost'))) {
          data = await fetchAgencyData(urlSlug);
        }

        // 2. Priorité Domaine/Sous-domaine
        if (!data && subdomain !== 'datahome') {
          const { data: domainData } = await supabase
            .from('agency_settings')
            .select('*')
            .or(`subdomain.eq.${subdomain},custom_domain.eq.${host}`)
            .maybeSingle();
          data = domainData;
        }

        // 3. Fallback final
        if (!data) {
          data = await fetchAgencyData('schmidt-privilege');
        }

        if (isMounted && data) {
          setAgency(data);
        }
      } catch (err) {
        console.error("💥 AgencyContext Error:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadAgency();
    return () => { isMounted = false; };
  }, [pathname, fetchAgencyData]); // Se redéclenche si le chemin change

  return (
    <AgencyContext.Provider value={{ 
      agency, 
      loading, 
      setAgencyBySlug: async (slug) => {
        const d = await fetchAgencyData(slug);
        if (d) setAgency(d);
      } 
    }}>
      {children}
    </AgencyContext.Provider>
  );
}

export const useAgency = () => useContext(AgencyContext);