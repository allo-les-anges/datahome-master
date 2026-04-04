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

  // Fonction pour charger manuellement une agence via son slug
  const setAgencyBySlug = async (slug: string) => {
    if (!slug) return;
    try {
      // Si l'agence est déjà la bonne, on ne recharge pas
      if (agency?.slug === slug) return;

      const { data, error } = await supabase
        .from('agency_settings')
        .select('*')
        .eq('slug', slug)
        .maybeSingle();

      if (data) {
        console.log("🎯 Agence synchronisée par slug:", data.agency_name);
        setAgency(data);
      }
    } catch (err) {
      console.error("Erreur setAgencyBySlug:", err);
    }
  };

  useEffect(() => {
    async function fetchAgency() {
      setLoading(true);
      try {
        const host = window.location.hostname;
        const path = window.location.pathname;
        
        // 1. Extraction du sous-domaine
        const subdomain = host.split('.')[0];
        
        // 2. Extraction du slug depuis l'URL (ex: /nl/schmidt-privilege/contact -> schmidt-privilege)
        const pathParts = path.split('/').filter(Boolean);
        // On cherche le segment après la locale (index 1 si l'URL commence par /fr/ ou /nl/)
        const urlSlug = pathParts.length >= 2 ? pathParts[1] : null;

        console.log("🔍 Détection Context - Hôte:", host, "| Sous-domaine:", subdomain, "| Slug URL:", urlSlug);

        let agencyData = null;

        // PRIORITÉ 1 : Si on est sur Vercel ou Localhost, on utilise le slug de l'URL
        if ((host.includes('vercel.app') || host.includes('localhost')) && urlSlug) {
          const { data } = await supabase
            .from('agency_settings')
            .select('*')
            .eq('slug', urlSlug)
            .maybeSingle();
          agencyData = data;
        }

        // PRIORITÉ 2 : Recherche par domaine ou sous-domaine (Production)
        if (!agencyData) {
          const { data } = await supabase
            .from('agency_settings')
            .select('*')
            .or(`subdomain.eq.${subdomain},custom_domain.eq.${host}`)
            .maybeSingle();
          agencyData = data;
        }

        // PRIORITÉ 3 : Fallback si rien n'est trouvé
        if (!agencyData) {
          console.warn("⚠️ Aucune agence trouvée, chargement du fallback...");
          const { data } = await supabase
            .from('agency_settings')
            .select('*')
            .eq('subdomain', 'schmidt-privilege') // Remplacez par votre vrai slug par défaut
            .maybeSingle();
          agencyData = data;
        }

        if (agencyData) {
          setAgency(agencyData);
        } else {
          console.error("❌ Échec total : Aucune agence trouvée.");
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