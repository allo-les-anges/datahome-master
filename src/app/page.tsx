"use client";

import { useEffect, useState } from "react";
import PropertyCard from "@/components/PropertyCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Loader2 } from "lucide-react";

export default function HomePage() {
  const [properties, setProperties] = useState<any[]>([]);
  const [agency, setAgency] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // Chargement parallèle des propriétés et des infos agence
        const [propRes, agencyRes] = await Promise.all([
          fetch("/api/properties"),
          fetch("/api/agency")
        ]);

        if (propRes.ok && agencyRes.ok) {
          const propData = await propRes.json();
          const agencyData = await agencyRes.json();
          
          setProperties(propData);
          setAgency(agencyData);
        }
      } catch (err) {
        console.error("Erreur lors du chargement initial:", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-[#0A0A0A]">
        <Loader2 className="animate-spin text-[#D4AF37] mb-4" size={40} />
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#0A0A0A]">
      <Navbar agency={agency} />
      
      {/* Hero Section ou Header */}
      <section className="pt-32 pb-20 px-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-5xl md:text-8xl font-serif text-white mb-12">
            Notre Sélection <br />
            <span className="text-zinc-500 italic">Exclusive</span>
          </h1>

          {/* Grille des propriétés */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property) => (
              <PropertyCard 
                key={property.id} 
                property={property} 
                agency={agency} 
              />
            ))}
          </div>

          {properties.length === 0 && (
            <div className="text-center py-20">
              <p className="text-zinc-500 font-serif text-xl">
                Aucune propriété disponible pour le moment.
              </p>
            </div>
          )}
        </div>
      </section>

      <Footer agency={agency} />
    </main>
  );
}