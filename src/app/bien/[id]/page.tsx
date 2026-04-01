"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import PropertyDetailClient from "@/components/PropertyDetailClient";

export default function PropertyDetailPage() {
  const { id } = useParams();
  const [property, setProperty] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        console.log("📡 [FETCH] Récupération des propriétés...");
        const res = await fetch("/api/properties");
        const data = await res.json();
        
        // On cherche l'ID une seule fois de manière stricte
        const found = data.find((p: any) => String(p.id) === String(id));
        
        if (found) {
          console.log("✅ [MATCH] Propriété trouvée:", found.id);
          setProperty(found);
        } else {
          console.error("❌ [NOT FOUND] Aucun bien avec l'ID:", id);
        }
      } catch (err) {
        console.error("💥 [FATAL] Erreur API:", err);
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id]); // Ne dépend QUE de l'ID, pas de la langue !

  if (loading) return <div className="h-screen flex items-center justify-center">Chargement...</div>;
  if (!property) return <div className="h-screen flex items-center justify-center">Bien introuvable (ID: {id})</div>;

  return <PropertyDetailClient property={property} agency={null} />;
}