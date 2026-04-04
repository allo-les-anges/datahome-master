"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

// 1. Définition de l'interface pour TypeScript
interface AgencyContextType {
  agency: any;
  loading: boolean;
  setAgencyBySlug: (slug: string) => Promise<void>; // Ajout de la fonction manquante
}

// 2. Initialisation du contexte avec les types
const AgencyContext = createContext<AgencyContextType>({
  agency: null,
  loading: true,
  setAgencyBySlug: async () => {}, // Valeur par défaut vide
});

export function AgencyProvider({ children }: { children: React.ReactNode }) {
  const [agency, setAgency] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Fonction pour forcer le changement d'agence via le slug (utile pour les routes [slug])
  const setAgencyBySlug = async (slug: string) => {
    try {
      // Si l'agence actuelle correspond déjà au slug, on ne refait pas l'appel
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
    <AgencyContext.Provider value={{ agency, loading, setAgencyBySlug }}>
      {children}
    </AgencyContext.Provider>
  );
}

export const useAgency = () => useContext(AgencyContext);