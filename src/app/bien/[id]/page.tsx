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
      console.log("🔍 [Page] Début chargement, agencyLoading:", agencyLoading, "agency:", agency?.id);
      
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
        
        console.log("📦 [Page] Réponse reçue:", {
          status: res.status,
          hasDescription: !!data.description,
          descriptionLength: data.description?.length
        });
        
        if (data && !data.error) {
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

  return <PropertyDetailClient property={property} agency={agency} />;
}