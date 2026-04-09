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
      // Attendre que l'agence soit chargée
      if (agencyLoading) {
        console.log("⏳ Attente chargement agence...");
        return;
      }

      if (!agency?.id) {
        console.log("⚠️ Pas d'agence trouvée, tentative sans filtre");
        // Tentative sans filtre agence
        try {
          const res = await fetch(`/api/property/${id}`);
          const data = await res.json();
          if (data && !data.error) {
            setProperty(data);
          }
        } catch (err) {
          console.error("Erreur:", err);
        } finally {
          setLoading(false);
        }
        return;
      }

      try {
        console.log(`🔍 Chargement propriété ${id} pour agence ${agency.id}`);
        const res = await fetch(`/api/property/${id}?agencyId=${agency.id}`);
        const data = await res.json();
        
        console.log("📦 Données reçues:", {
          status: res.status,
          hasDescription: !!data.description,
          descriptionLength: data.description?.length,
          keys: Object.keys(data)
        });
        
        if (data && !data.error) {
          setProperty(data);
        } else {
          console.error("Propriété non trouvée");
        }
      } catch (err) {
        console.error("Erreur de chargement:", err);
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      load();
    }
  }, [id, agency?.id, agencyLoading]);

  if (agencyLoading || loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-slate-200 border-t-[#D4AF37] rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Chargement...</p>
        </div>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="h-screen flex items-center justify-center">
        <p className="text-slate-500">Bien introuvable</p>
      </div>
    );
  }

  return <PropertyDetailClient property={property} agency={agency} />;
}