"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
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

  const setAgencyBySlug = async (slug: string) => {
    try {
      if (agency?.slug === slug) return;

      const { data, error } = await supabase
        .from('agency_settings')
        .select('*')
        .eq('slug', slug)
        .single();

      if (data) {
        setAgency(data);
      }
    } catch (err) {
      console.error("Erreur setAgencyBySlug:", err);
    }
  };

  useEffect(() => {
    async function fetchAgency() {
      setLoading(true); // On s'assure d'être en chargement au début
      try {
        const host = window.location.hostname;
        const subdomain = host.split('.')[0];
        
        console.log("🔍 Recherche agence pour hôte:", host, "sous-domaine:", subdomain);

        // Tentative 1 : Domaine ou sous-domaine
        let { data, error } = await supabase
          .from('agency_settings')
          .select('*')
          .or(`subdomain.eq.${subdomain},custom_domain.eq.${host}`)
          .maybeSingle(); // maybeSingle évite une erreur si rien n'est trouvé

        // Tentative 2 : Fallback si rien n'est trouvé
        if (!data) {
          console.warn("⚠️ Aucune agence trouvée pour ce domaine, tentative fallback...");
          const { data: fallbackData } = await supabase
            .from('agency_settings')
            .select('*')
            .eq('subdomain', 'lumina-prestige')
            .maybeSingle();
          
          data = fallbackData;
        }

        if (data) {
          console.log("✅ Agence chargée:", data.agency_name);
          setAgency(data);
        } else {
          console.error("❌ Échec total : Aucune agence trouvée, même en fallback.");
        }
      } catch (err) {
        console.error("💥 Erreur critique AgencyContext:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAgency();
  }, []);

  return (
    <AgencyContext.Provider value={{ agency, loading, setAgencyBySlug }}>
      {children}
    </AgencyContext.Provider>
  );
}

export const useAgency = () => useContext(AgencyContext);