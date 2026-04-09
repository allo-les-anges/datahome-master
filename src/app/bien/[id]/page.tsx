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
      console.log("🔍 [PAGE] 1. Début - id:", id);
      console.log("🔍 [PAGE] 2. agencyLoading:", agencyLoading);
      console.log("🔍 [PAGE] 3. agency?.id:", agency?.id);
      
      if (agencyLoading) {
        console.log("⏳ Attente agence...");
        return;
      }

      try {
        let url = `/api/property/${id}`;
        if (agency?.id) {
          url += `?agencyId=${agency.id}`;
        }
        
        console.log("🔍 [PAGE] 4. Appel API:", url);
        const res = await fetch(url);
        const data = await res.json();
        
        console.log("🔍 [PAGE] 5. Réponse reçue");
        console.log("🔍 [PAGE] 6. data a description_fr:", !!data.description_fr);
        console.log("🔍 [PAGE] 7. data.description_fr (100 premiers chars):", data.description_fr?.substring(0, 100));
        
        if (data && !data.error) {
          setProperty(data);
          console.log("🔍 [PAGE] 8. Property mise à jour avec description_fr:", !!data.description_fr);
        }
      } catch (err) {
        console.error("❌ Erreur:", err);
      } finally {
        setLoading(false);
        console.log("🔍 [PAGE] 9. Chargement terminé");
      }
    }

    if (id) {
      load();
    }
  }, [id, agency?.id, agencyLoading]);

  console.log("🔍 [PAGE] RENDER - loading:", loading, "hasProperty:", !!property, "hasDescriptionFr:", !!property?.description_fr);

  if (agencyLoading || loading) {
    return <div className="h-screen flex items-center justify-center">Chargement...</div>;
  }

  if (!property) {
    return <div className="h-screen flex items-center justify-center">Bien introuvable</div>;
  }

  return <PropertyDetailClient property={property} agency={agency} />;
}