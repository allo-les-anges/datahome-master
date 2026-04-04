"use client";

import React, { useState, useEffect, use } from "react";
import { motion } from "framer-motion";
import { Loader2, Mail, Phone, User } from "lucide-react";
import { useTranslation } from "@/contexts/I18nContext";
import { useAgency } from "@/contexts/AgencyContext";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

interface ContactPageProps {
  params: Promise<{
    slug: string;
    locale: string;
  }>;
}

export default function ContactPage({ params }: ContactPageProps) {
  // Déballe les params de manière réactive
  const resolvedParams = use(params);
  const { t } = useTranslation();
  const { agency, loading, setAgencyBySlug } = useAgency(); 
  
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  // Synchronisation avec le slug de l'URL
  useEffect(() => {
    if (resolvedParams.slug) {
      setAgencyBySlug(resolvedParams.slug);
    }
  }, [resolvedParams.slug, setAgencyBySlug]);

  // --- GESTION DU CHARGEMENT ---
  // On ne bloque que si on charge ET qu'on a strictement aucune donnée d'agence
  if (loading && !agency) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0A0A0A]">
        <Loader2 className="animate-spin text-slate-400" size={40} />
      </div>
    );
  }

  // --- FALLBACK SI L'AGENCE EST INTROUVABLE ---
  if (!agency) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0A0A0A]">
        <p className="text-slate-500 font-serif italic">Agence non répertoriée...</p>
      </div>
    );
  }

  // --- CONFIGURATION DYNAMIQUE ---
  const brandColor = agency.primary_color || "#c5a059";
  const buttonColor = agency.button_color || brandColor;
  const selectedFont = agency.font_family || 'Montserrat';

  // --- PARSING DES DONNÉES ---
  const getParsedData = (data: any) => {
    if (!data) return {};
    if (typeof data === 'object') return data;
    try {
      return JSON.parse(data);
    } catch (e) {
      return {};
    }
  };

  const contactInfo = getParsedData(agency.footer_config);
  const teamData = getParsedData(agency.team_data);
  
  const displayTeam = Array.isArray(teamData) && teamData.length > 0 
    ? teamData 
    : [{ 
        name: "Direction Générale", 
        role: "Expert Immobilier Luxe", 
        bio: "Spécialiste de l'accompagnement sur-mesure pour vos projets d'exception.", 
        photo: null 
      }];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulation d'envoi
    setTimeout(() => {
      setIsSubmitting(false);
      setStatus("success");
      setFormData({ name: "", email: "", message: "" });
      setTimeout(() => setStatus("idle"), 5000);
    }, 1500);
  };

  return (
    <div 
      className="min-h-screen bg-white dark:bg-[#0A0A0A] text-slate-900 dark:text-white transition-colors duration-500"
      style={{ fontFamily: selectedFont }}
    >
      <Navbar agency={agency} />

      <main>
        {/* HERO SECTION */}
        <section className="relative h-[45vh] flex items-center justify-center overflow-hidden bg-slate-900">
          {agency.hero_url ? (
            <img 
              src={agency.hero_url} 
              className="absolute inset-0 w-full h-full object-cover opacity-40 brightness-50" 
              alt="Hero" 
            />
          ) : (
            <div className="absolute inset-0 bg-black opacity-80" />
          )}
          <div className="relative z-10 text-center px-6 max-w-4xl">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-6xl font-serif italic text-white mb-4" 
            >
              {t('nav.contact') || "Contactez-nous"}
            </motion.h1>
            <p className="text-white/80 text-lg font-light italic max-w-2xl mx-auto">
              {agency.agency_name}
            </p>
          </div>
        </section>

        <section className="max-w-[1400px] mx-auto px-6 py-20 grid grid-cols-1 xl:grid-cols-12 gap-16">
          
          {/* SECTION ÉQUIPE */}
          <div className="xl:col-span-7 space-y-10">
            <div className="flex items-center gap-4 border-l-4 pl-6" style={{ borderColor: brandColor }}>
              <h2 className="text-3xl font-serif italic uppercase tracking-widest">
                {agency.about_title || "L'Équipe"}
              </h2>
            </div>
            
            <div className="grid gap-8">
              {displayTeam.map((member: any, idx: number) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="p-6 rounded-[2rem] border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 flex flex-col md:flex-row gap-8 items-center shadow-sm"
                >
                  <div className="w-24 h-32 rounded-2xl bg-slate-200 dark:bg-white/10 overflow-hidden shrink-0 flex items-center justify-center">
                    {member.photo ? (
                      <img src={member.photo} className="w-full h-full object-cover" alt={member.name} />
                    ) : (
                      <User size={30} className="text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 text-center md:text-left space-y-2">
                    <h3 className="text-xl font-bold" style={{ color: brandColor }}>{member.name}</h3>
                    <p className="text-[9px] uppercase tracking-widest font-black opacity-50">{member.role}</p>
                    <p className="text-sm font-light leading-relaxed italic text-slate-600 dark:text-slate-400">
                      {member.bio}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* SECTION FORMULAIRE (IPHONE DESIGN) */}
          <div className="xl:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[380px] aspect-[9/18.5] rounded-[3.5rem] bg-slate-900 p-3 shadow-2xl border-[8px] border-slate-800 ring-1 ring-white/10">
              <div className="relative w-full h-full rounded-[2.8rem] overflow-hidden bg-slate-950 flex flex-col">
                <div className="relative z-10 h-full flex flex-col p-8 pt-12">
                  <h3 className="text-lg font-serif italic text-white mb-6 text-center tracking-widest uppercase">Direct Contact</h3>
                  
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5 text-white/90 text-[11px]">
                        <Phone size={14} style={{ color: brandColor }} />
                        {contactInfo.phone || agency.phone || "+33 1 00 00 00 00"}
                    </div>
                    <div className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5 text-white/90 text-[11px] truncate">
                        <Mail size={14} style={{ color: brandColor }} />
                        {contactInfo.email || agency.email || "contact@agence.com"}
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-3">
                    <input 
                      required
                      className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-[10px] text-white outline-none focus:border-white/30 transition-all"
                      placeholder="VOTRE NOM"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                    <input 
                      required
                      type="email"
                      className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-[10px] text-white outline-none focus:border-white/30 transition-all"
                      placeholder="VOTRE EMAIL"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                    <textarea 
                      required
                      rows={4}
                      className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-[10px] text-white outline-none focus:border-white/30 resize-none transition-all"
                      placeholder="VOTRE MESSAGE..."
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                    />
                    
                    <button 
                      type="submit"
                      disabled={isSubmitting}
                      style={{ backgroundColor: buttonColor }}
                      className="mt-auto w-full py-4 rounded-xl text-black font-black text-[10px] tracking-[0.3em] hover:brightness-110 active:scale-95 transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
                    >
                      {isSubmitting ? <Loader2 className="animate-spin" size={14}/> : (status === "success" ? "ENVOYÉ !" : "ENVOYER")}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer agency={agency} />
    </div>
  );
}