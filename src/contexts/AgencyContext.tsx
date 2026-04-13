// src/contexts/AgencyContext.tsx
"use client";

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/lib/supabase";
import { usePathname } from "next/navigation";

interface AgencyContextType {
  agency: any;
  loading: boolean;
  error: string | null;
  setAgencyBySlug: (slug: string) => Promise<void>;
}

const AgencyContext = createContext<AgencyContextType>({
  agency: null,
  loading: true,
  error: null,
  setAgencyBySlug: async () => {},
});

export function AgencyProvider({ children }: { children: React.ReactNode }) {
  const [agency, setAgency] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const pathname = usePathname();

  const fetchAgencyData = useCallback(async (slug: string) => {
    if (!slug) return null;
    
    const { data, error } = await supabase
      .from('agency_settings')
      .select('*')
      .eq('subdomain', slug)
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
      
      setLoading(true);
      setError(null);
      
      try {
        const host = window.location.hostname;
        const segments = pathname.split('/').filter(Boolean);
        
        const locales = ['fr', 'en', 'nl', 'es', 'ar', 'pl'];
        const urlSlug = segments.find(s => !locales.includes(s));
        
        let data = null;

        // 1. Priorité au slug détecté dans l'URL
        if (urlSlug) {
          data = await fetchAgencyData(urlSlug);
        }

        // 2. Si pas de slug, test via le domaine/sous-domaine
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

        // 3. ✅ PLUS DE FALLBACK - on affiche une erreur explicite
        if (!data) {
          const errorMsg = `Agence non trouvée pour: ${urlSlug || host}`;
          console.error(`❌ ${errorMsg}`);
          if (isMounted) {
            setError(errorMsg);
            setAgency(null);
          }
          return;
        }

        if (isMounted) {
          setAgency(data);
          setError(null);
        }
      } catch (err) {
        console.error("💥 [AgencyContext] Erreur critique:", err);
        if (isMounted) {
          setError("Erreur de chargement de l'agence");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    initAgency();
    return () => { isMounted = false; };
  }, [pathname, fetchAgencyData]);

  const contextValue = useMemo(() => ({
    agency,
    loading,
    error,
    setAgencyBySlug: async (slug: string) => {
      if (agency?.subdomain === slug) return;
      
      setLoading(true);
      setError(null);
      const d = await fetchAgencyData(slug);
      if (d) {
        setAgency(d);
      } else {
        setError(`Agence "${slug}" introuvable`);
      }
      setLoading(false);
    }
  }), [agency, loading, error, fetchAgencyData]);

  return (
    <AgencyContext.Provider value={contextValue}>
      {children}
    </AgencyContext.Provider>
  );
}

export const useAgency = () => useContext(AgencyContext);