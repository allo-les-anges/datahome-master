"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Mail, Phone, MapPin, User, Send } from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslation } from "@/contexts/I18nContext";
import { supabase } from "@/lib/supabase";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ContactPage() {
  const { resolvedTheme } = useTheme();
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [agency, setAgency] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({ name: "", email: "", region: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    setMounted(true);
    async function fetchAgencyData() {
      try {
        // 1. Extraction du sous-domaine depuis l'URL
        const hostname = window.location.hostname;
        let subdomain = hostname.split('.')[0];

        // Gestion du développement local ou domaine principal
        if (subdomain === 'localhost' || subdomain === 'www' || subdomain === 'datahome') {
          subdomain = 'lumina-prestige'; // Remplacer par un slug de test existant en base
        }

        // 2. Requête filtrée pour obtenir la bonne agence
        const { data, error } = await supabase
          .from('agency_settings')
          .select('*')
          .eq('subdomain', subdomain)
          .single();

        if (error) throw error;
        if (data) setAgency(data);
      } catch (err) {
        console.error("Erreur lors du chargement de l'agence:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchAgencyData();
  }, []);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-[#0A0A0A]">
        <Loader2 className="animate-spin text-slate-400" size={40} />
      </div>
    );
  }

  const brandColor = agency?.primary_color || "#D4AF37";
  const isDark = resolvedTheme === "dark";
  
  // Analyse sécurisée des données JSON
  const team = Array.isArray(agency?.team_data) ? agency.team_data : [];
  
  const contactInfo = typeof agency?.footer_config === 'string' 
    ? JSON.parse(agency.footer_config) 
    : (agency?.footer_config || {});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus("idle");

    try {
      // Logique d'envoi à votre API de contact
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...formData, agencyId: agency?.id }),
      });

      if (response.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", region: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch (error) {
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A] text-slate-900 dark:text-white transition-colors duration-500">
      <Navbar agency={agency} />

      <main>
        {/* HERO SECTION DYNAMIQUE */}
        <section className="relative h-[60vh] flex items-center justify-center overflow-hidden bg-slate-900">
          {agency?.hero_url ? (
            <img 
              src={agency.hero_url} 
              className="absolute inset-0 w-full h-full object-cover opacity-50 brightness-75" 
              alt="Luxe Villa" 
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-b from-slate-800 to-black opacity-80" />
          )}
          <div className="relative z-10 text-center px-6 max-w-4xl">
            <motion.span 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              className="text-[10px] font-black uppercase tracking-[0.5em] mb-4 block"
              style={{ color: brandColor }}
            >
              Contact & Expertise
            </motion.span>
            <motion.h1 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-7xl font-serif italic text-white mb-6 leading-tight"
            >
              {agency?.hero_title || "L'Art de l'Accompagnement"}
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-white/80 text-lg font-light italic"
            >
              {t('contact.subtitle') || "Une équipe dédiée à la réussite de vos projets immobiliers d'exception."}
            </motion.p>
          </div>
        </section>

        <section className="max-w-[1400px] mx-auto px-6 py-24 grid grid-cols-1 xl:grid-cols-12 gap-20">
          
          {/* ÉQUIPE DYNAMIQUE */}
          <div className="xl:col-span-7 space-y-12">
            <header className="space-y-2 border-l-4 pl-6" style={{ borderColor: brandColor }}>
              <h2 className="text-3xl font-serif italic uppercase tracking-tighter">Nos Partenaires</h2>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Experts de proximité</p>
            </header>
            
            <div className="grid gap-8">
              {team.length > 0 ? team.map((member: any, idx: number) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="group p-8 rounded-[2.5rem] border border-slate-100 dark:border-white/5 bg-slate-50/30 dark:bg-white/5 flex flex-col md:flex-row gap-10 items-center transition-all hover:shadow-2xl hover:bg-white dark:hover:bg-white/10"
                >
                  <div className="relative shrink-0">
                    <img 
                      src={member.photo || "/placeholder-user.jpg"} 
                      className="w-40 h-48 rounded-[2rem] object-cover shadow-2xl transition-transform group-hover:scale-105"
                      alt={member.name}
                    />
                    <div className="absolute -bottom-2 -right-2 p-3 bg-white dark:bg-slate-900 rounded-2xl shadow-lg">
                      <User size={16} style={{ color: brandColor }} />
                    </div>
                  </div>
                  <div className="flex-1 text-center md:text-left space-y-4">
                    <div>
                      <h3 className="text-2xl font-bold tracking-tight">{member.name}</h3>
                      <p className="text-[10px] uppercase tracking-[0.3em] font-black opacity-50" style={{ color: brandColor }}>
                        {member.role || "Consultant Immobilier"}
                      </p>
                    </div>
                    <p className="text-sm font-light leading-relaxed text-slate-600 dark:text-slate-400 italic">
                      "{member.bio || "Spécialiste du marché local dévoué à vos critères les plus exigeants."}"
                    </p>
                  </div>
                </motion.div>
              )) : (
                <div className="text-center py-20 border-2 border-dashed border-slate-100 rounded-[3rem]">
                  <p className="italic opacity-40">Aucun expert n'est listé pour le moment.</p>
                </div>
              )}
            </div>
          </div>

          {/* FORMULAIRE & INFOS DE CONTACT */}
          <div className="xl:col-span-5">
            <div className="sticky top-32 space-y-8">
              <div className="p-12 rounded-[3.5rem] bg-slate-950 text-white shadow-[0_35px_60px_-15px_rgba(0,0,0,0.3)] border border-white/5">
                <h3 className="text-3xl font-serif italic mb-8">Nous Joindre</h3>
                
                <div className="space-y-6 mb-12">
                  {contactInfo?.phone && (
                    <a href={`tel:${contactInfo.phone}`} className="flex items-center gap-5 group">
                      <div className="p-4 rounded-2xl bg-white/5 group-hover:bg-white/10 transition-colors">
                        <Phone size={20} style={{ color: brandColor }} />
                      </div>
                      <span className="text-sm font-medium tracking-wider">{contactInfo.phone}</span>
                    </a>
                  )}
                  {contactInfo?.email && (
                    <a href={`mailto:${contactInfo.email}`} className="flex items-center gap-5 group">
                      <div className="p-4 rounded-2xl bg-white/5 group-hover:bg-white/10 transition-colors">
                        <Mail size={20} style={{ color: brandColor }} />
                      </div>
                      <span className="text-sm font-medium tracking-wider">{contactInfo.email}</span>
                    </a>
                  )}
                  {contactInfo?.address && (
                    <div className="flex items-center gap-5">
                      <div className="p-4 rounded-2xl bg-white/5">
                        <MapPin size={20} style={{ color: brandColor }} />
                      </div>
                      <span className="text-sm font-light leading-relaxed opacity-80">{contactInfo.address}</span>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <input 
                      required
                      placeholder="NOM COMPLET"
                      className="w-full px-6 py-5 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black tracking-widest outline-none focus:border-white/30 transition-all"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <input 
                      required
                      type="email"
                      placeholder="VOTRE EMAIL"
                      className="w-full px-6 py-5 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black tracking-widest outline-none focus:border-white/30 transition-all"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <textarea 
                      required
                      rows={4}
                      placeholder="VOTRE PROJET EN QUELQUES MOTS..."
                      className="w-full px-6 py-5 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black tracking-widest outline-none focus:border-white/30 transition-all resize-none"
                      value={formData.message}
                      onChange={(e) => setFormData({...formData, message: e.target.value})}
                    />
                  </div>
                  
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    style={{ backgroundColor: brandColor }}
                    className="w-full py-6 rounded-2xl text-black font-black text-[11px] tracking-[0.3em] hover:scale-[1.02] active:scale-95 transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isSubmitting ? (
                      <Loader2 className="animate-spin" size={18} />
                    ) : (
                      <>ENVOYER LA DEMANDE <Send size={14} /></>
                    )}
                  </button>

                  {status === "success" && (
                    <p className="text-green-400 text-center text-[10px] font-black tracking-widest mt-4 animate-pulse">
                      MESSAGE ENVOYÉ AVEC SUCCÈS
                    </p>
                  )}
                </form>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer agency={agency} />
    </div>
  );
}