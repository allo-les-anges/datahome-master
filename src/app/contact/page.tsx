"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Mail, Phone, MapPin, User, MessageCircle } from "lucide-react";
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
  
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    setMounted(true);
    async function fetchAgencyData() {
      try {
        const hostname = window.location.hostname;
        let subdomain = hostname.split('.')[0];

        if (subdomain === 'localhost' || subdomain === 'www' || subdomain === 'datahome') {
          subdomain = 'lumina-prestige'; 
        }

        const { data, error } = await supabase
          .from('agency_settings')
          .select('*')
          .eq('subdomain', subdomain)
          .single();

        if (data) {
          setAgency(data);
        }
      } catch (err) {
        console.error("Erreur de récupération Supabase:", err);
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

  // --- CONFIGURATION DES COULEURS ---
  const brandColor = agency?.primary_color || "#c5a059";
  const buttonColor = agency?.button_color || brandColor;

  // --- PARSING DU FOOTER ---
  let contactInfo = { email: "", phone: "", address: "" };
  try {
    if (agency?.footer_config) {
      contactInfo = typeof agency.footer_config === 'string' 
        ? JSON.parse(agency.footer_config) 
        : agency.footer_config;
    }
  } catch (e) { 
    console.error("Erreur parsing footer_config"); 
  }

  const getTeam = () => {
    if (!agency?.team_data) return [];
    if (Array.isArray(agency.team_data)) return agency.team_data;
    try {
      if (typeof agency.team_data === 'string') return JSON.parse(agency.team_data);
    } catch (e) {
      console.error("Erreur parsing team_data");
    }
    return [];
  };

  const team = getTeam();
  const displayTeam = team.length > 0 ? team : [
    { 
      name: "Direction Générale", 
      role: "Expert Immobilier Luxe", 
      bio: "Spécialiste de l'accompagnement sur-mesure pour vos projets d'exception.", 
      photo: null 
    },
    { 
      name: "Consultant Senior", 
      role: "Relations Internationales", 
      bio: "Expert en investissements résidentiels de prestige et gestion de patrimoine.", 
      photo: null 
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStatus("success");
      setFormData({ name: "", email: "", message: "" });
      setTimeout(() => setStatus("idle"), 5000);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A] text-slate-900 dark:text-white transition-colors duration-500 font-sans">
      <Navbar agency={agency} />

      <main>
        {/* HERO SECTION */}
        <section className="relative h-[55vh] flex items-center justify-center overflow-hidden bg-slate-900">
          {agency?.hero_url ? (
            <img 
              src={agency.hero_url} 
              className="absolute inset-0 w-full h-full object-cover opacity-50 brightness-75" 
              alt="Hero" 
            />
          ) : (
            <div className="absolute inset-0 bg-black opacity-80" />
          )}
          <div className="relative z-10 text-center px-6 max-w-4xl">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-4xl md:text-7xl font-serif italic text-white mb-6" 
              style={{ fontFamily: agency?.font_family || 'serif' }}
            >
              {agency?.hero_title || "Contactez-nous"}
            </motion.h1>
            <p className="text-white/80 text-lg font-light italic max-w-2xl mx-auto leading-relaxed">
              {agency?.about_text || "L'excellence immobilière à votre écoute pour réaliser vos plus grands projets."}
            </p>
          </div>
        </section>

        <section className="max-w-[1400px] mx-auto px-6 py-24 grid grid-cols-1 xl:grid-cols-12 gap-20">
          
          {/* SECTION ÉQUIPE */}
          <div className="xl:col-span-7 space-y-12">
            <div className="flex items-center gap-4 border-l-4 pl-6" style={{ borderColor: brandColor }}>
              <h2 className="text-3xl font-serif italic uppercase tracking-widest">
                {agency?.about_title || "Nos Partenaires"}
              </h2>
            </div>
            
            <div className="grid gap-10">
              {displayTeam.map((member: any, idx: number) => (
                <motion.div 
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="p-8 rounded-[2rem] border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 flex flex-col md:flex-row gap-10 items-center hover:bg-white dark:hover:bg-white/10 transition-all shadow-sm"
                >
                  <div className="w-32 h-40 rounded-2xl bg-slate-200 dark:bg-white/10 overflow-hidden shrink-0 flex items-center justify-center shadow-inner">
                    {member.photo ? (
                      <img src={member.photo} className="w-full h-full object-cover shadow-lg" alt={member.name} />
                    ) : (
                      <User size={40} className="text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 text-center md:text-left space-y-3">
                    <h3 className="text-2xl font-bold" style={{ color: brandColor }}>{member.name}</h3>
                    <p className="text-[10px] uppercase tracking-widest font-black opacity-50">{member.role}</p>
                    <p className="text-sm font-light leading-relaxed italic text-slate-600 dark:text-slate-400">
                      {member.bio}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* SECTION SMARTPHONE (Informations + Formulaire) */}
          <div className="xl:col-span-5 flex justify-center items-start">
            <div className="sticky top-32">
              
              {/* COQUE DU SMARTPHONE */}
              <div className="relative w-[320px] md:w-[380px] aspect-[9/18.5] rounded-[3.5rem] bg-slate-900 p-3 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.6)] border-[8px] border-slate-800 ring-1 ring-white/10">
                
                {/* Encoche (Notch) */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-800 rounded-b-2xl z-30 flex items-center justify-center gap-2">
                  <div className="w-8 h-1 bg-slate-700 rounded-full"></div>
                  <div className="w-2 h-2 bg-slate-700 rounded-full"></div>
                </div>

                {/* ÉCRAN INTERNE */}
                <div className="relative w-full h-full rounded-[2.8rem] overflow-hidden bg-slate-950 flex flex-col border border-white/5">
                  
                  {/* Fond Interne */}
                  <div className="absolute inset-0 bg-gradient-to-b from-slate-900 to-black opacity-60" />

                  <div className="relative z-10 h-full flex flex-col p-8 pt-12">
                    <h3 className="text-xl font-serif italic text-white mb-8 text-center tracking-widest">Informations</h3>
                    
                    {/* Infos Contact */}
                    <div className="space-y-4 mb-10">
                      <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                        <div className="p-2.5 rounded-xl bg-slate-800 shadow-lg">
                          <Phone size={16} style={{ color: brandColor }} />
                        </div>
                        <span className="text-[11px] font-light tracking-wider text-white/90">
                          {contactInfo.phone || "+33 1 45 22 33 44"}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all">
                        <div className="p-2.5 rounded-xl bg-slate-800 shadow-lg">
                          <Mail size={16} style={{ color: brandColor }} />
                        </div>
                        <span className="text-[11px] font-light tracking-wider text-white/90 truncate">
                          {contactInfo.email || "agence@lumina.com"}
                        </span>
                      </div>

                      {agency?.whatsapp_number && (
                        <div className="flex items-center gap-4 p-3 rounded-2xl bg-green-500/5 border border-green-500/10 hover:bg-green-500/10 transition-all">
                          <div className="p-2.5 rounded-xl bg-green-500/20">
                            <MessageCircle size={16} className="text-green-500" />
                          </div>
                          <span className="text-[11px] font-light tracking-wider text-green-500">WhatsApp Direct</span>
                        </div>
                      )}
                    </div>

                    {/* Formulaire */}
                    <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-4">
                      <div className="space-y-3">
                        <input 
                          required
                          type="text"
                          placeholder="VOTRE NOM"
                          className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-[9px] tracking-[0.2em] outline-none focus:border-white/30 transition-all placeholder:text-white/20 text-white"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                        <input 
                          required
                          type="email"
                          placeholder="VOTRE EMAIL"
                          className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-[9px] tracking-[0.2em] outline-none focus:border-white/30 transition-all placeholder:text-white/20 text-white"
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                        <textarea 
                          required
                          rows={3}
                          placeholder="VOTRE MESSAGE..."
                          className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-[9px] tracking-[0.2em] outline-none focus:border-white/30 transition-all resize-none placeholder:text-white/20 text-white"
                          value={formData.message}
                          onChange={(e) => setFormData({...formData, message: e.target.value})}
                        />
                      </div>

                      <button 
                        type="submit"
                        disabled={isSubmitting}
                        style={{ backgroundColor: buttonColor }}
                        className="mt-auto w-full py-4 rounded-xl text-black font-black text-[9px] tracking-[0.3em] hover:brightness-110 active:scale-95 transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
                      >
                        {isSubmitting ? <Loader2 className="animate-spin" size={14}/> : "ENVOYER LE MESSAGE"}
                      </button>

                      {status === "success" && (
                        <motion.p 
                          initial={{ opacity: 0, y: 10 }} 
                          animate={{ opacity: 1, y: 0 }} 
                          className="text-center text-green-400 text-[8px] font-black tracking-widest mt-2 uppercase"
                        >
                          Demande envoyée avec succès
                        </motion.p>
                      )}
                    </form>
                  </div>

                  {/* Barre Home (iOS style) */}
                  <div className="relative z-10 h-10 w-full flex justify-center items-center">
                    <div className="w-20 h-1 bg-white/20 rounded-full"></div>
                  </div>
                </div>

                {/* Reflet Verre */}
                <div className="absolute top-0 right-10 w-full h-full bg-gradient-to-br from-white/5 to-transparent pointer-events-none rounded-[3.5rem] z-20" />
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer agency={agency} />
    </div>
  );
}