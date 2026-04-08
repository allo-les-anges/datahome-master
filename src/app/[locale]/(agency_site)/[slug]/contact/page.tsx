"use client";

import React, { useState, useEffect, use, useMemo } from "react";
import { motion } from "framer-motion";
import { Loader2, Mail, Phone, User, Send, CheckCircle, AlertCircle } from "lucide-react";
import { useTranslation } from "@/contexts/I18nContext";
import { useAgency } from "@/contexts/AgencyContext";

interface ContactPageProps {
  params: Promise<{
    slug: string;
    locale: string;
  }>;
}

export default function ContactPage({ params }: ContactPageProps) {
  const resolvedParams = use(params);
  const { t, locale } = useTranslation();
  const { agency, loading, setAgencyBySlug } = useAgency(); 
  const [mounted, setMounted] = useState(false);
  
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const currentSlug = resolvedParams.slug;
    if (currentSlug && agency?.subdomain !== currentSlug && !loading) {
      setAgencyBySlug(currentSlug);
    }
  }, [resolvedParams.slug, agency?.subdomain, loading, setAgencyBySlug]);

  const { contactInfo, displayTeam, brandColor, buttonColor, fontFamily } = useMemo(() => {
    const getParsed = (data: any) => {
      if (!data) return {};
      if (typeof data === 'object') return data;
      try { return JSON.parse(data); } catch (e) { return {}; }
    };

    const cInfo = getParsed(agency?.footer_config);
    const tData = getParsed(agency?.team_data);
    
    const team = Array.isArray(tData) && tData.length > 0 
      ? tData 
      : [{ 
          name: agency?.agency_name || "Direction", 
          role: "Expert Immobilier", 
          bio: "Spécialiste de l'accompagnement sur-mesure.", 
          photo: null 
        }];

    return {
      contactInfo: cInfo,
      displayTeam: team,
      brandColor: agency?.primary_color || "#c5a059",
      buttonColor: agency?.button_color || agency?.primary_color || "#c5a059",
      fontFamily: agency?.font_family || 'Montserrat'
    };
  }, [agency]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setStatus("success");
        setFormData({ name: "", email: "", message: "" });
        setTimeout(() => setStatus("idle"), 5000);
      } else {
        setStatus("error");
        setTimeout(() => setStatus("idle"), 3000);
      }
    } catch (err) {
      console.error("Erreur envoi:", err);
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !mounted) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="animate-spin text-slate-400 mb-4" size={40} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">{t('common.loading')}</p>
      </div>
    );
  }

  return (
    <div 
      className="bg-white text-slate-900" 
      style={{ 
        fontFamily: `${fontFamily}, 'Helvetica Neue', Arial, sans-serif`,
        fontWeight: 400,
        fontStyle: 'normal'
      }}
    >
      <main>
        {/* Hero Section */}
        <section className="relative h-[40vh] flex items-center justify-center overflow-hidden bg-slate-900">
          {agency?.hero_url && (
            <img src={agency.hero_url} className="absolute inset-0 w-full h-full object-cover opacity-40 brightness-50" alt="Hero" />
          )}
          <div className="relative z-10 text-center px-6">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              className="text-4xl md:text-6xl font-serif italic text-white mb-4"
              style={{ fontFamily: `'Playfair Display', ${fontFamily}, serif` }}
            >
              {t('contact.title')}
            </motion.h1>
            <p className="text-white/80 text-lg font-light italic uppercase tracking-widest">{agency?.agency_name}</p>
          </div>
        </section>

        {/* Main Content */}
        <section className="max-w-[1400px] mx-auto px-6 py-20 grid grid-cols-1 xl:grid-cols-12 gap-16">
          
          {/* Team Side */}
          <div className="xl:col-span-7 space-y-10">
            <div className="flex items-center gap-4 border-l-4 pl-6" style={{ borderColor: brandColor }}>
              <h2 className="text-3xl font-serif italic uppercase tracking-widest">
                {agency?.about_title || t('contact.teamTitle')}
              </h2>
            </div>
            
            <div className="grid gap-8">
              {displayTeam.map((member: any, idx: number) => (
                <motion.div 
                  key={idx} 
                  initial={{ opacity: 0, x: -20 }} 
                  whileInView={{ opacity: 1, x: 0 }} 
                  viewport={{ once: true }} 
                  className="p-6 rounded-[2rem] border border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-8 items-center shadow-sm"
                >
                  <div className="w-24 h-32 rounded-2xl bg-slate-200 overflow-hidden shrink-0 flex items-center justify-center">
                    {member.photo ? (
                      <img src={member.photo} className="w-full h-full object-cover" alt={member.name} loading="lazy" />
                    ) : (
                      <User size={30} className="text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-xl font-bold" style={{ color: brandColor }}>{member.name}</h3>
                    <p className="text-[9px] uppercase tracking-widest font-black opacity-50 mb-2">{member.role}</p>
                    <p className="text-sm font-light italic text-slate-600 leading-relaxed">{member.bio}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Formulaire de contact */}
          <div className="xl:col-span-5 flex justify-center">
            <div className="relative w-full max-w-[380px] rounded-[3rem] bg-slate-900 p-6 shadow-2xl">
              <div className="w-full rounded-[2rem] overflow-hidden bg-slate-950 flex flex-col p-6">
                
                {status === "success" ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 py-12">
                    <CheckCircle size={48} className="text-green-500" />
                    <h3 className="text-xl font-serif italic text-white">
                      {t('contact.success_title')}
                    </h3>
                    <p className="text-xs text-slate-400">
                      {t('contact.ref_label')} {t('contact.success_message')}
                    </p>
                    <button 
                      onClick={() => setStatus("idle")}
                      className="text-[10px] uppercase tracking-widest font-bold underline mt-4 text-slate-500 hover:text-slate-300 transition-colors"
                    >
                      {t('common.back')}
                    </button>
                  </div>
                ) : (
                  <>
                    <h3 className="text-lg font-serif italic text-white mb-6 text-center tracking-widest uppercase">
                      {t('contact.directContact')}
                    </h3>
                    
                    <div className="space-y-3 mb-8">
                      <div className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5 text-white/90 text-[11px]">
                        <Phone size={14} style={{ color: brandColor }} />
                        {contactInfo?.phone || agency?.phone || "+33 1 00 00 00 00"}
                      </div>
                      <div className="flex items-center gap-4 p-3 rounded-xl bg-white/5 border border-white/5 text-white/90 text-[11px] truncate">
                        <Mail size={14} style={{ color: brandColor }} />
                        {contactInfo?.email || agency?.email || "contact@agency.com"}
                      </div>
                    </div>

                    <form onSubmit={handleSubmit} className="flex-1 flex flex-col gap-3">
                      <input 
                        required 
                        className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-[10px] text-white outline-none focus:border-white/30 transition-all placeholder:text-slate-500" 
                        placeholder={t('contact.placeholder_name')} 
                        value={formData.name} 
                        onChange={(e) => setFormData({...formData, name: e.target.value})} 
                      />
                      <input 
                        required 
                        type="email" 
                        className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-[10px] text-white outline-none focus:border-white/30 transition-all placeholder:text-slate-500" 
                        placeholder={t('contact.placeholder_email')} 
                        value={formData.email} 
                        onChange={(e) => setFormData({...formData, email: e.target.value})} 
                      />
                      <textarea 
                        required 
                        rows={4} 
                        className="w-full p-4 rounded-xl bg-white/5 border border-white/10 text-[10px] text-white outline-none focus:border-white/30 resize-none transition-all placeholder:text-slate-500" 
                        placeholder={t('contact.placeholder_message')} 
                        value={formData.message} 
                        onChange={(e) => setFormData({...formData, message: e.target.value})} 
                      />
                      
                      <button 
                        type="submit" 
                        disabled={isSubmitting} 
                        style={{ backgroundColor: buttonColor }} 
                        className="mt-auto w-full py-4 rounded-xl text-black font-black text-[10px] tracking-[0.3em] hover:brightness-110 active:scale-95 transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <Loader2 className="animate-spin" size={14}/>
                        ) : (
                          <>
                            <Send size={14} />
                            {t('contact.send_btn')}
                          </>
                        )}
                      </button>

                      {status === "error" && (
                        <div className="flex items-center justify-center gap-2 text-red-400 text-[9px] mt-2 uppercase tracking-widest">
                          <AlertCircle size={12} />
                          {t('contact.error_message')}
                        </div>
                      )}
                    </form>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}