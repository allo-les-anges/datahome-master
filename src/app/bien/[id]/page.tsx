"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import PropertyDetailClient from "@/components/PropertyDetailClient";
import { useAgency } from "@/contexts/AgencyContext";

export default function PropertyDetailPage() {
  const { id } = useParams();
  const { agency, loading: agencyLoading } = useAgency();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      if (agencyLoading) {
        console.log("⏳ Attente chargement agence...");
        return;
      }

      try {
        let url = `/api/property/${id}`;
        if (agency?.id) {
          url += `?agencyId=${agency.id}`;
        }
        
        console.log("🔍 [Page] Appel API:", url);
        const res = await fetch(url);
        const data = await res.json();
        
        console.log("📦 [Page] Réponse API - a description_fr:", !!data.description_fr);
        
        if (data && !data.error) {
          // ✅ On passe TOUTES les données, sans filtre
          setProperty(data);
        }
      } catch (err) {
        console.error("❌ Erreur:", err);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      load();
    }
  }, [id, agency?.id, agencyLoading]);

  if (agencyLoading || loading) {
    return <div className="h-screen flex items-center justify-center">Chargement...</div>;
  }

  if (!property) {
    return <div className="h-screen flex items-center justify-center">Bien introuvable</div>;
  }

  // ✅ Vérification avant rendu
  console.log("🎯 [Page] Rendu final - property a description_fr:", !!property.description_fr);
  console.log("🎯 [Page] description_fr preview:", property.description_fr?.substring(0, 100));
  
  return <PropertyDetailClient property={property} agency={agency} />;
}