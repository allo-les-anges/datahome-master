"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import PropertyDetailClient from "@/components/PropertyDetailClient";

export default function PropertyDetailPage() {
  const { id } = useParams();
  const [property, setProperty] = useState<any>(null);
  const [agency, setAgency] = useState<any>(null); // Ajout du state agency
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        console.log("📡 [FETCH] Récupération des données...");
        // On récupère les propriétés et l'agence
        const [propRes, agencyRes] = await Promise.all([
          fetch("/api/properties"),
          fetch("/api/agency") // Assurez-vous que cette route existe
        ]);

        const properties = await propRes.json();
        const agencyData = await agencyRes.json();

        const found = properties.find((p: any) => String(p.id) === String(id));
        
        if (found) {
          setProperty(found);
          setAgency(agencyData);
        }
      } catch (err) {
        console.error("💥 [FATAL] Erreur chargement:", err);
      } finally {
        setLoading(false);
      }
    }
    if (id) load();
  }, [id]);

  if (loading) return <div className="h-screen flex items-center justify-center">Chargement...</div>;
  if (!property) return <div className="h-screen flex items-center justify-center">Bien introuvable</div>;

  // On passe enfin l'agence réelle au lieu de null
  return <PropertyDetailClient property={property} agency={agency} />;
}