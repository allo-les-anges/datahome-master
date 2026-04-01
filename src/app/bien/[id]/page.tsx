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
        const [propRes, agencyRes] = await Promise.all([
          fetch("/api/properties"),
          fetch("/api/agency") 
        ]);
        
        const properties = await propRes.json();
        const agencyData = await agencyRes.json();
        
        const found = properties.find((p: any) => String(p.id) === String(id));
        
        if (found) {
          setProperty(found);
          setAgency(agencyData);
        }
      } catch (err) {
        console.error("Erreur:", err);
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