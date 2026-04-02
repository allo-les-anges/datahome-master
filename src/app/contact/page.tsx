"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Globe, Target, MapPin, Languages, Compass, Sun, Moon, Loader2 
} from "lucide-react";
import { useTheme } from "next-themes";
import { useTranslation } from "@/contexts/I18nContext";
import { supabase } from "@/lib/supabase";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

// Tableau statique des photos d'équipe
const teamMembers = [
  { id: 1, photo: "/Deborah.jpeg" },
  { id: 2, photo: "/Gillian.jpeg" },
  { id: 3, photo: "/Joanna.jpeg" },
  { id: 4, photo: "/Abdou.jpeg" },
  { id: 5, photo: "/Gaëtan.jpeg" },
];

export default function ContactPage() {
  const { resolvedTheme } = useTheme();
  const { t } = useTranslation();
  const [mounted, setMounted] = useState(false);
  const [agency, setAgency] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    region: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  // Chargement des données de l'agence et montage du composant
  useEffect(() => {
    setMounted(true);
    async function fetchAgencyData() {
      try {
        // Récupère la première agence trouvée (Logique à adapter si multi-domaines)
        const { data, error } = await supabase
          .from('agency_settings')
          .select('*')
          .limit(1)
          .single();

        if (data) setAgency(data);
      } catch (err) {
        console.error("Erreur chargement agence:", err);
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

  const isDark = resolvedTheme === "dark";
  const brandColor = agency?.primary_color || "#D4AF37"; // Couleur du Dashboard ou Or par défaut

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus("idle");

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          agencyId: agency?.id,
          agencyEmail: JSON.parse(agency?.footer_config || '{}').email
        }),
      });

      if (response.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", region: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch (error) {
      console.error("Erreur soumission:", error);
      setStatus("error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputStyle = {
    color: isDark ? '#ffffff' : '#0f172a',
    backgroundColor: isDark ? 'rgba(255, 255, 255, 0.05)' : '#ffffff',
  };

  const inputClasses = `
    w-full px-8 py-5 rounded-2xl outline-none transition-all 
    text-[10px] font-black tracking-widest 
    border-2 border-slate-200 dark:border-white/10 
    placeholder:text-slate-400 dark:placeholder:text-white/40
    focus:border-opacity-100
  `;

  return (
    <div className="min-h-screen transition-colors duration-500 bg-white dark:bg-[#0A0A0A] text-slate-900 dark:text-white">
      
      {/* On passe l'agence à la Navbar pour le logo et la couleur */}
      <Navbar agency={agency} />

      <main>
        {/* SECTION HÉRO dynamique avec l'image Hero du Dashboard si disponible */}
        <section className="relative h-[65vh] w-full flex items-center justify-center overflow-hidden">
          {agency?.hero_url ? (
            <img 
              src={agency.hero_url} 
              className="absolute inset-0 w-full h-full object-cover brightness-[0.4]" 
              alt="Hero"
            />
          ) : (
            <div className="absolute inset-0 bg-slate-900 dark:bg-black opacity-50" />
          )}
          
          <div className="relative z-10 text-center px-6 max-w-5xl pt-20">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <span 
                className="text-[12px] font-black uppercase tracking-[0.6em] mb-6 block"
                style={{ color: brandColor }}
              >
                {t('contact.heroBadge') || "Contact"}
              </span>
              <h1 className="text-4xl md:text-7xl font-serif italic text-white mb-8">
                {t('contact.heroTitle') || "Parlons de votre projet"}
              </h1>
              <p className="text-white/70 text-base md:text-lg font-light max-w-3xl mx-auto leading-relaxed italic">
                {t('contact.heroQuote') || "L'excellence immobilière à votre écoute."}
              </p>
            </motion.div>
          </div>
        </section>

        {/* SECTION ÉQUIPE & FORMULAIRE */}
        <section className="max-w-[1400px] mx-auto px-6 py-24 grid grid-cols-1 xl:grid-cols-12 gap-20">
          
          {/* LISTE DES MEMBRES */}
          <div className="xl:col-span-7 space-y-12">
            {teamMembers.map((member, idx) => (
              <motion.div 
                key={member.id}
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                className="p-8 md:p-12 rounded-[2.5rem] border transition-all duration-700 bg-white dark:bg-white/5 border-slate-100 dark:border-white/10 shadow-xl"
              >
                <div className="flex flex-col md:flex-row gap-10">
                  <div className="relative w-full md:w-48 h-60 shrink-0 overflow-hidden rounded-[2rem] bg-slate-100 dark:bg-white/5">
                    <img 
                      src={member.photo} 
                      className={`w-full h-full object-cover ${isDark ? "brightness-75 grayscale-[0.3]" : ""}`}
                      alt="Team Member"
                    />
                  </div>
                  <div className="flex-1 space-y-5">
                    <h3 className="text-3xl font-serif italic" style={{ color: brandColor }}>
                      {t(`contact.team.${idx}.name`) || "Expert Immobilier"}
                    </h3>
                    <p className="text-base leading-relaxed font-light text-slate-600 dark:text-slate-300">
                      {t(`contact.team.${idx}.background`) || "Spécialiste de la Riviera espagnole avec plus de 10 ans d'expérience."}
                    </p>
                    <div className="flex flex-wrap gap-2 pt-4">
                      {[0, 1, 2].map((skillIdx) => (
                        <span 
                          key={skillIdx} 
                          className="text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-md border"
                          style={{ 
                            backgroundColor: `${brandColor}10`, 
                            color: brandColor,
                            borderColor: `${brandColor}20`
                          }}
                        >
                          {t(`contact.team.${idx}.skills.${skillIdx}`) || "Expertise"}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* FORMULAIRE DE CONTACT */}
          <div className="xl:col-span-5">
            <div className="sticky top-32 p-12 rounded-[3.5rem] transition-all duration-700 bg-slate-50 dark:bg-[#111] border border-slate-200 dark:border-white/10 shadow-2xl">
              <h3 className="text-3xl md:text-4xl font-serif italic mb-2">
                {t('contact.formTitle') || "Écrivez-nous"}
              </h3>
              
              <p className="text-[10px] font-black uppercase tracking-[0.2em] mb-10" style={{ color: brandColor }}>
                {t('contact.formSubtitle') || "Réponse sous 24h"}
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <input 
                  required
                  type="text" 
                  placeholder={t('contact.namePlaceholder') || "NOM COMPLET"}
                  style={{ ...inputStyle, borderColor: isSubmitting ? brandColor : undefined }}
                  className={inputClasses}
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    required
                    type="email" 
                    placeholder={t('contact.emailPlaceholder') || "EMAIL"}
                    style={inputStyle}
                    className={inputClasses}
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                  />
                  <input 
                    type="text" 
                    placeholder={t('contact.regionPlaceholder') || "RÉGION D'INTÉRÊT"}
                    style={inputStyle}
                    className={inputClasses}
                    value={formData.region}
                    onChange={(e) => setFormData({...formData, region: e.target.value})}
                  />
                </div>
                
                <textarea 
                  required
                  rows={4} 
                  placeholder={t('contact.messagePlaceholder') || "VOTRE MESSAGE"}
                  style={inputStyle}
                  className={`${inputClasses} resize-none`}
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                />
                
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  style={{ backgroundColor: brandColor }}
                  className="w-full text-black py-6 rounded-2xl font-black uppercase text-[10px] tracking-[0.4em] hover:brightness-110 transition-all shadow-xl disabled:opacity-50"
                >
                  {isSubmitting ? (t('contact.submitting') || "ENVOI...") : (t('contact.submit') || "ENVOYER LA DEMANDE")}
                </button>

                {status === "success" && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-green-600 dark:text-green-400 text-center font-bold text-[10px] tracking-widest uppercase mt-4">
                    {t('contact.success') || "Message envoyé avec succès."}
                  </motion.p>
                )}
                {status === "error" && (
                  <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-500 text-center font-bold text-[10px] tracking-widest uppercase mt-4">
                    {t('contact.error') || "Une erreur est survenue."}
                  </motion.p>
                )}
              </form>
            </div>
          </div>
        </section>
      </main>

      <Footer agency={agency} />
    </div>
  );
}