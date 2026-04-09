"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import PropertyDetailClient from "@/components/PropertyDetailClient";

export default function PropertyDetailPage() {
  const { id } = useParams();
  const [property, setProperty] = useState<any>(null);
  const [agency, setAgency] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // ✅ CORRECTION : Utiliser l'API dédiée qui renvoie la description complète
        const [propRes, agencyRes] = await Promise.all([
          fetch(`/api/property/${id}`),  // ← Changement clé ici
          fetch("/api/agency")
        ]);

        const propertyData = await propRes.json();
        const agencyData = await agencyRes.json();

        // Vérifier que la propriété a été trouvée
        if (propertyData && !propertyData.error) {
          setProperty(propertyData);
          setAgency(agencyData);
        } else {
          console.error("Propriété non trouvée");
        }
      } catch (err) {
        console.error("Erreur de chargement:", err);
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  if (loading) return <div className="h-screen flex items-center justify-center">Chargement...</div>;
  if (!property) return <div className="h-screen flex items-center justify-center">Bien introuvable</div>;

  return <PropertyDetailClient property={property} agency={agency} />;
}