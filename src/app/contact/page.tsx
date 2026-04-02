"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Mail, Phone, MapPin, User, Send, MessageCircle } from "lucide-react";
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

        // Gestion du local ou du domaine principal
        if (subdomain === 'localhost' || subdomain === 'www' || subdomain === 'datahome') {
          subdomain = 'lumina-prestige'; 
        }

        const { data, error } = await supabase
          .from('agency_settings')
          .select('*')
          .eq('subdomain', subdomain)
          .single();

        if (data) setAgency(data);
      } catch (err) {
        console.error("Erreur de récupération:", err);
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

  // --- EXTRACTION DES DONNÉES SELON VOTRE STRUCTURE ---
  const brandColor = agency?.primary_color || "#c5a059";
  const buttonColor = agency?.button_color || brandColor;

  // Analyse du JSON footer_config
  let contactInfo = { email: "", phone: "", address: "" };
  try {
    contactInfo = typeof agency?.footer_config === 'string' 
      ? JSON.parse(agency.footer_config) 
      : (agency?.footer_config || {});
  } catch (e) { console.error("Erreur parsing footer_config"); }

  // Analyse du JSON team_data
  let team = [];
  try {
    if (agency?.team_data) {
      team = typeof agency.team_data === 'string' ? JSON.parse(agency.team_data) : agency.team_data;
    }
  } catch (e) { console.error("Erreur parsing team_data"); }

  // Si team_data est vide en base, on utilise des placeholders pour l'affichage
  const displayTeam = team.length > 0 ? team : [
    { name: "Direction Générale", role: "Expert Immobilier Luxe", bio: "Spécialiste de l'accompagnement sur-mesure depuis 15 ans.", photo: null },
    { name: "Consultant Senior", role: "Relations Internationales", bio: "Expert en investissements résidentiels de prestige.", photo: null }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setStatus("success");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A] text-slate-900 dark:text-white transition-colors duration-500">
      <Navbar agency={agency} />

      <main>
        {/* HERO SECTION DYNAMIQUE */}
        <section className="relative h-[55vh] flex items-center justify-center overflow-hidden bg-slate-900">
          {agency?.hero_url ? (
            <img src={agency.hero_url} className="absolute inset-0 w-full h-full object-cover opacity-50 brightness-75" alt="Hero" />
          ) : (
            <div className="absolute inset-0 bg-black opacity-80" />
          )}
          <div className="relative z-10 text-center px-6 max-w-4xl">
            <h1 className="text-4xl md:text-7xl font-serif italic text-white mb-6" style={{ fontFamily: agency?.font_family }}>
              {agency?.hero_title || "Contactez-nous"}
            </h1>
            <p className="text-white/80 text-lg font-light italic max-w-2xl mx-auto leading-relaxed">
              {agency?.about_text || "L'excellence immobilière à votre écoute."}
            </p>
          </div>
        </section>

        <section className="max-w-[1400px] mx-auto px-6 py-24 grid grid-cols-1 xl:grid-cols-12 gap-20">
          
          {/* SECTION ÉQUIPE / PARTENAIRES */}
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
                  className="p-8 rounded-[2rem] border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 flex flex-col md:flex-row gap-10 items-center hover:bg-white dark:hover:bg-white/10 transition-all shadow-sm"
                >
                  <div className="w-32 h-40 rounded-2xl bg-slate-200 dark:bg-white/10 overflow-hidden shrink-0 flex items-center justify-center">
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

          {/* FORMULAIRE & INFORMATIONS */}
          <div className="xl:col-span-5">
            <div className="sticky top-32 space-y-8">
              <div className="p-10 rounded-[3rem] bg-slate-950 text-white shadow-2xl border border-white/5">
                <h3 className="text-2xl font-serif italic mb-8">Informations</h3>
                
                <div className="space-y-6 mb-12">
                  <div className="flex items-center gap-5 group">
                    <div className="p-4 rounded-2xl bg-white/5 group-hover:bg-white/10 transition-colors">
                      <Phone size={20} style={{ color: brandColor }} />
                    </div>
                    <span className="text-sm font-light tracking-widest">{contactInfo.phone || "Non renseigné"}</span>
                  </div>
                  <div className="flex items-center gap-5 group">
                    <div className="p-4 rounded-2xl bg-white/5 group-hover:bg-white/10 transition-colors">
                      <Mail size={20} style={{ color: brandColor }} />
                    </div>
                    <span className="text-sm font-light tracking-widest">{contactInfo.email || "Non renseigné"}</span>
                  </div>
                  <div className="flex items-center gap-5">
                    <div className="p-4 rounded-2xl bg-white/5">
                      <MapPin size={20} style={{ color: brandColor }} />
                    </div>
                    <span className="text-sm font-light leading-relaxed opacity-70">{contactInfo.address || "Adresse de prestige"}</span>
                  </div>
                  {agency?.whatsapp_number && (
                    <div className="flex items-center gap-5">
                      <div className="p-4 rounded-2xl bg-green-500/10">
                        <MessageCircle size={20} className="text-green-500" />
                      </div>
                      <span className="text-sm font-light tracking-widest">WhatsApp Direct</span>
                    </div>
                  )}
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <input 
                    required
                    placeholder="VOTRE NOM"
                    className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 text-[10px] tracking-widest outline-none focus:border-white/30 transition-all"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                  <textarea 
                    required
                    rows={4}
                    placeholder="VOTRE MESSAGE..."
                    className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 text-[10px] tracking-widest outline-none focus:border-white/30 transition-all resize-none"
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                  />
                  <button 
                    type="submit"
                    disabled={isSubmitting}
                    style={{ backgroundColor: buttonColor }}
                    className="w-full py-5 rounded-2xl text-black font-black text-[10px] tracking-[0.3em] hover:scale-[1.02] active:scale-95 transition-all shadow-xl flex items-center justify-center gap-3 disabled:opacity-50"
                  >
                    {isSubmitting ? <Loader2 className="animate-spin" size={16}/> : "ENVOYER"}
                  </button>
                  {status === "success" && (
                    <p className="text-center text-green-400 text-[10px] font-black tracking-widest mt-4">DEMANDE ENVOYÉE</p>
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