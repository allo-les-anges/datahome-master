"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Loader2, Mail, Phone, MapPin, User } from "lucide-react";
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
        const { data } = await supabase.from('agency_settings').select('*').limit(1).single();
        if (data) setAgency(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchAgencyData();
  }, []);

  if (!mounted || loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin" /></div>;

  const brandColor = agency?.primary_color || "#D4AF37";
  const isDark = resolvedTheme === "dark";
  
  // Analyse des données JSON du dashboard
  const team = agency?.team_data || []; // Tableau de prestataires
  const contactInfo = typeof agency?.footer_config === 'string' ? JSON.parse(agency.footer_config) : agency?.footer_config;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Logique d'envoi API...
    setIsSubmitting(false);
    setStatus("success");
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0A0A0A] text-slate-900 dark:text-white">
      <Navbar agency={agency} />

      <main>
        {/* HERO SECTION DYNAMIQUE */}
        <section className="relative h-[50vh] flex items-center justify-center overflow-hidden bg-slate-900">
          {agency?.hero_url && (
            <img src={agency.hero_url} className="absolute inset-0 w-full h-full object-cover opacity-40" alt="Hero" />
          )}
          <div className="relative z-10 text-center px-6">
            <h1 className="text-4xl md:text-6xl font-serif italic text-white mb-4">
              {agency?.hero_title || t('contact.title')}
            </h1>
            <p className="text-white/70 max-w-2xl mx-auto italic">{t('contact.subtitle')}</p>
          </div>
        </section>

        <section className="max-w-[1400px] mx-auto px-6 py-20 grid grid-cols-1 xl:grid-cols-12 gap-16">
          
          {/* ÉQUIPE DYNAMIQUE (Nombre de prestataires variable) */}
          <div className="xl:col-span-7 space-y-8">
            <h2 className="text-2xl font-serif italic mb-10 flex items-center gap-3">
              <User style={{ color: brandColor }} /> Notre Équipe d'Experts
            </h2>
            
            {team.length > 0 ? team.map((member: any, idx: number) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className="p-6 rounded-[2rem] border border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 flex flex-col md:flex-row gap-8 items-center"
              >
                <img 
                  src={member.photo || "/placeholder-user.jpg"} 
                  className="w-32 h-32 rounded-2xl object-cover shadow-lg"
                  alt={member.name}
                />
                <div className="flex-1 text-center md:text-left">
                  <h3 className="text-xl font-bold" style={{ color: brandColor }}>{member.name}</h3>
                  <p className="text-[10px] uppercase tracking-widest font-black mb-3 opacity-60">{member.role}</p>
                  <p className="text-sm font-light leading-relaxed">{member.bio}</p>
                </div>
              </motion.div>
            )) : (
              <p className="italic opacity-50">Aucun membre d'équipe configuré.</p>
            )}
          </div>

          {/* FORMULAIRE & INFOS DE CONTACT */}
          <div className="xl:col-span-5 space-y-8">
            <div className="p-10 rounded-[3rem] bg-slate-900 text-white shadow-2xl">
              <h3 className="text-2xl font-serif italic mb-6">Contact Direct</h3>
              
              <div className="space-y-4 mb-10">
                {contactInfo?.phone && (
                  <div className="flex items-center gap-4 text-sm font-light">
                    <Phone size={18} style={{ color: brandColor }} /> {contactInfo.phone}
                  </div>
                )}
                {contactInfo?.email && (
                  <div className="flex items-center gap-4 text-sm font-light">
                    <Mail size={18} style={{ color: brandColor }} /> {contactInfo.email}
                  </div>
                )}
                {contactInfo?.address && (
                  <div className="flex items-center gap-4 text-sm font-light">
                    <MapPin size={18} style={{ color: brandColor }} /> {contactInfo.address}
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <input 
                  placeholder="VOTRE NOM"
                  className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-[10px] tracking-widest outline-none focus:border-[#D4AF37]"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
                <button 
                  style={{ backgroundColor: brandColor }}
                  className="w-full py-4 rounded-xl text-black font-black text-[10px] tracking-widest hover:scale-[1.02] transition-transform"
                >
                  ENVOYER LE MESSAGE
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>
      <Footer agency={agency} />
    </div>
  );
}