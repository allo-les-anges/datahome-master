"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

const AgencyContext = createContext<{ agency: any; loading: boolean }>({
  agency: null,
  loading: true,
});

export function AgencyProvider({ children }: { children: React.ReactNode }) {
  const [agency, setAgency] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAgency() {
      try {
        const host = window.location.hostname;
        // On isole le sous-domaine (ex: agence1.habihub.com -> agence1)
        const subdomain = host.split('.')[0];

        // On cherche l'agence par sous-domaine OU par domaine complet (si custom domain)
        const { data, error } = await supabase
          .from('agency_settings')
          .select('*')
          .or(`subdomain.eq.${subdomain},custom_domain.eq.${host}`)
          .single();

        if (data) {
          setAgency(data);
        } else {
          // Fallback : Agence par défaut si rien n'est trouvé
          const { data: defaultData } = await supabase
            .from('agency_settings')
            .select('*')
            .eq('subdomain', 'lumina-prestige')
            .single();
          setAgency(defaultData);
        }
      } catch (err) {
        console.error("Erreur AgencyContext:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAgency();
  }, []);

  return (
    <AgencyContext.Provider value={{ agency, loading }}>
      {children}
    </AgencyContext.Provider>
  );
}

export const useAgency = () => useContext(AgencyContext);