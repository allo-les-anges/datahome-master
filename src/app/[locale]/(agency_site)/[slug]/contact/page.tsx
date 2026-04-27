"use client";

import React, { useState, useEffect, use, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Mail, Phone, User, Send, CheckCircle, AlertCircle, Sparkles } from "lucide-react";
import { useTranslation } from "@/contexts/I18nContext";
import { useAgency } from "@/contexts/AgencyContext";

interface ContactPageProps {
  params: Promise<{ slug: string; locale: string }>;
}

function AnimatedInput({
  label,
  type = "text",
  value,
  onChange,
  required,
  icon,
  brandColor,
  fontFamily,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  icon?: React.ReactNode;
  brandColor: string;
  fontFamily: string;
}) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;

  return (
    <div className="relative">
      <div
        className="absolute inset-0 rounded-2xl transition-all duration-300 pointer-events-none"
        style={{
          boxShadow: focused ? `0 0 0 1.5px ${brandColor}60` : "0 0 0 1px rgba(255,255,255,0.06)",
        }}
      />
      {icon && (
        <div
          className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300"
          style={{ color: active ? brandColor : "rgba(255,255,255,0.25)" }}
        >
          {icon}
        </div>
      )}
      <label
        className="absolute transition-all duration-200 pointer-events-none select-none"
        style={{
          fontFamily: `${fontFamily}, sans-serif`,
          left: icon ? "2.5rem" : "1rem",
          top: active ? "0.35rem" : "50%",
          transform: active ? "translateY(0) scale(0.72)" : "translateY(-50%) scale(1)",
          transformOrigin: "left top",
          fontSize: "0.7rem",
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: active ? brandColor : "rgba(255,255,255,0.3)",
        }}
      >
        {label}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full rounded-2xl bg-white/[0.04] border border-white/[0.06] text-white text-sm outline-none transition-all duration-300 placeholder-transparent"
        style={{
          fontFamily: `${fontFamily}, sans-serif`,
          paddingTop: "1.5rem",
          paddingBottom: "0.6rem",
          paddingLeft: icon ? "2.5rem" : "1rem",
          paddingRight: "1rem",
        }}
      />
    </div>
  );
}

function AnimatedTextarea({
  label,
  value,
  onChange,
  required,
  brandColor,
  fontFamily,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  brandColor: string;
  fontFamily: string;
}) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;

  return (
    <div className="relative">
      <div
        className="absolute inset-0 rounded-2xl transition-all duration-300 pointer-events-none"
        style={{
          boxShadow: focused ? `0 0 0 1.5px ${brandColor}60` : "0 0 0 1px rgba(255,255,255,0.06)",
        }}
      />
      <label
        className="absolute left-4 transition-all duration-200 pointer-events-none select-none"
        style={{
          fontFamily: `${fontFamily}, sans-serif`,
          top: active ? "0.4rem" : "1rem",
          fontSize: active ? "0.6rem" : "0.7rem",
          fontWeight: 700,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          color: active ? brandColor : "rgba(255,255,255,0.3)",
          transform: active ? "scale(1)" : "scale(1)",
        }}
      >
        {label}
      </label>
      <textarea
        required={required}
        rows={4}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full px-4 pb-3 rounded-2xl bg-white/[0.04] border border-white/[0.06] text-white text-sm outline-none resize-none transition-all duration-300"
        style={{
          fontFamily: `${fontFamily}, sans-serif`,
          paddingTop: "1.6rem",
          boxShadow: focused ? `0 0 0 1.5px ${brandColor}60` : undefined,
        }}
      />
    </div>
  );
}

function ShimmerButton({
  onClick,
  disabled,
  loading,
  children,
  brandColor,
  fontFamily,
}: {
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  brandColor: string;
  fontFamily: string;
}) {
  return (
    <button
      type="submit"
      disabled={disabled}
      className="relative w-full py-4 rounded-2xl font-black text-[11px] tracking-[0.25em] uppercase overflow-hidden transition-all duration-300 active:scale-[0.97] disabled:opacity-50 flex items-center justify-center gap-2"
      style={{
        backgroundColor: brandColor,
        color: "#000",
        fontFamily: `${fontFamily}, sans-serif`,
        boxShadow: `0 8px 32px ${brandColor}50`,
      }}
    >
      <span
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.35) 50%, transparent 60%)`,
          backgroundSize: "200% 100%",
          animation: "shimmer 2.4s infinite",
        }}
      />
      <span className="relative z-10 flex items-center gap-2">{children}</span>
      <style>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
      `}</style>
    </button>
  );
}

export default function ContactPage({ params }: ContactPageProps) {
  const resolvedParams = use(params);
  const { t } = useTranslation();
  const { agency, loading, setAgencyBySlug } = useAgency();
  const [mounted, setMounted] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const currentSlug = resolvedParams.slug;
    if (currentSlug && agency?.subdomain !== currentSlug && !loading) {
      setAgencyBySlug(currentSlug);
    }
  }, [resolvedParams.slug, agency?.subdomain, loading, setAgencyBySlug]);

  const { contactInfo, displayTeam, brandColor, buttonColor, fontFamily } = useMemo(() => {
    const getParsed = (data: any) => {
      if (!data) return {};
      if (typeof data === "object") return data;
      try { return JSON.parse(data); } catch { return {}; }
    };
    const cInfo = getParsed(agency?.footer_config);
    const tData = getParsed(agency?.team_data);
    const team = Array.isArray(tData) && tData.length > 0
      ? tData
      : [{ name: agency?.agency_name || "Direction", role: "Expert Immobilier", bio: "Spécialiste de l'accompagnement sur-mesure.", photo: null }];
    return {
      contactInfo: cInfo,
      displayTeam: team,
      brandColor: agency?.primary_color || "#c5a059",
      buttonColor: agency?.button_color || agency?.primary_color || "#c5a059",
      fontFamily: agency?.font_family || "Montserrat",
    };
  }, [agency]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    } catch {
      setStatus("error");
      setTimeout(() => setStatus("idle"), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !mounted) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-[#0d0d0d]">
        <Loader2 className="animate-spin mb-4" size={36} style={{ color: brandColor || "#c5a059" }} />
        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/30">{t("common.loading")}</p>
      </div>
    );
  }

  return (
    <div className="bg-[#0d0d0d] text-white" style={{ fontFamily: `${fontFamily}, 'Helvetica Neue', Arial, sans-serif` }}>
      {/* Hero */}
      <section className="relative h-[45vh] min-h-[320px] flex items-end justify-center overflow-hidden">
        {agency?.hero_url && (
          <img
            src={agency.hero_url}
            className="absolute inset-0 w-full h-full object-cover opacity-25"
            alt="Hero"
          />
        )}
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(to bottom, rgba(13,13,13,0.2) 0%, rgba(13,13,13,0.7) 60%, #0d0d0d 100%)" }}
        />
        <div className="relative z-10 text-center px-6 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          >
            <p
              className="text-[10px] uppercase tracking-[0.35em] mb-4 font-bold"
              style={{ color: brandColor }}
            >
              {agency?.agency_name}
            </p>
            <h1
              className="text-4xl md:text-6xl lg:text-7xl font-normal"
              style={{ fontFamily: `${fontFamily}, 'Playfair Display', serif`, letterSpacing: "-0.03em", fontWeight: 300 }}
            >
              {t("contact.title")}
            </h1>
          </motion.div>
        </div>
      </section>

      {/* Main */}
      <section className="max-w-[1400px] mx-auto px-6 py-20 grid grid-cols-1 xl:grid-cols-12 gap-16 items-start">

        {/* Team */}
        <div className="xl:col-span-7 space-y-12">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="flex items-center gap-5"
          >
            <div className="w-px h-12" style={{ backgroundColor: brandColor }} />
            <div>
              <p className="text-[9px] uppercase tracking-[0.3em] font-black mb-1" style={{ color: brandColor }}>
                Notre équipe
              </p>
              <h2
                className="text-2xl md:text-3xl font-normal"
                style={{ fontFamily: `${fontFamily}, 'Playfair Display', serif`, fontWeight: 300 }}
              >
                {agency?.about_title || t("contact.teamTitle")}
              </h2>
            </div>
          </motion.div>

          <div className="space-y-5">
            {displayTeam.map((member: any, idx: number) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                whileHover={{ y: -2 }}
                className="group relative rounded-3xl overflow-hidden"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  backdropFilter: "blur(12px)",
                }}
              >
                <div
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none rounded-3xl"
                  style={{ background: `linear-gradient(135deg, ${brandColor}08 0%, transparent 60%)` }}
                />
                <div className="flex flex-col sm:flex-row gap-6 p-7 items-center sm:items-start">
                  <div
                    className="w-20 h-24 rounded-2xl overflow-hidden shrink-0 flex items-center justify-center"
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
                  >
                    {member.photo ? (
                      <img src={member.photo} className="w-full h-full object-cover" alt={member.name} loading="lazy" />
                    ) : (
                      <User size={28} className="text-white/20" />
                    )}
                  </div>
                  <div className="flex-1 text-center sm:text-left">
                    <h3 className="text-lg font-bold mb-0.5" style={{ color: brandColor }}>{member.name}</h3>
                    <p className="text-[9px] uppercase tracking-[0.25em] font-black text-white/30 mb-3">{member.role}</p>
                    <p className="text-sm text-white/50 leading-relaxed font-light" style={{ fontStyle: "italic" }}>{member.bio}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Contact info */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            {(contactInfo?.phone || agency?.phone) && (
              <a
                href={`tel:${contactInfo?.phone || agency?.phone}`}
                className="flex items-center gap-3 px-5 py-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] group"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <Phone size={16} style={{ color: brandColor }} />
                <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors" style={{ fontFamily: `${fontFamily}, sans-serif` }}>
                  {contactInfo?.phone || agency?.phone}
                </span>
              </a>
            )}
            {(contactInfo?.email || agency?.email) && (
              <a
                href={`mailto:${contactInfo?.email || agency?.email}`}
                className="flex items-center gap-3 px-5 py-4 rounded-2xl transition-all duration-300 hover:scale-[1.02] group"
                style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
              >
                <Mail size={16} style={{ color: brandColor }} />
                <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors truncate" style={{ fontFamily: `${fontFamily}, sans-serif` }}>
                  {contactInfo?.email || agency?.email}
                </span>
              </a>
            )}
          </motion.div>
        </div>

        {/* Smartphone Form */}
        <div className="xl:col-span-5 flex justify-center xl:sticky xl:top-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className="relative w-full max-w-[390px]"
          >
            {/* Phone shell */}
            <div
              className="relative rounded-[3.5rem] p-[3px] shadow-2xl"
              style={{
                background: `linear-gradient(145deg, rgba(255,255,255,0.12), rgba(255,255,255,0.03))`,
                boxShadow: `0 40px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.08), 0 0 60px ${brandColor}20`,
              }}
            >
              <div className="rounded-[3.3rem] overflow-hidden" style={{ background: "#111" }}>
                {/* Notch */}
                <div className="flex justify-center pt-4 pb-2">
                  <div className="w-28 h-7 rounded-full bg-black flex items-center justify-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-white/10" />
                    <div className="w-10 h-1.5 rounded-full bg-white/10" />
                  </div>
                </div>

                {/* Screen */}
                <div className="px-6 pt-2 pb-10 min-h-[580px] flex flex-col">
                  <AnimatePresence mode="wait">
                    {status === "success" ? (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex-1 flex flex-col items-center justify-center text-center space-y-5 py-12"
                      >
                        <div className="relative">
                          <div
                            className="w-20 h-20 rounded-full flex items-center justify-center"
                            style={{ background: `${brandColor}20`, border: `1px solid ${brandColor}40` }}
                          >
                            <CheckCircle size={36} style={{ color: brandColor }} />
                          </div>
                          <Sparkles
                            size={16}
                            className="absolute -top-1 -right-1 animate-pulse"
                            style={{ color: brandColor }}
                          />
                        </div>
                        <h3
                          className="text-xl text-white font-light"
                          style={{ fontFamily: `${fontFamily}, 'Playfair Display', serif` }}
                        >
                          {t("contact.success_title")}
                        </h3>
                        <p className="text-xs text-white/40 leading-relaxed">
                          {t("contact.success_message")}
                        </p>
                        <button
                          onClick={() => setStatus("idle")}
                          className="text-[10px] uppercase tracking-widest font-bold text-white/30 hover:text-white/60 transition-colors mt-2"
                        >
                          {t("common.back")}
                        </button>
                      </motion.div>
                    ) : (
                      <motion.form
                        key="form"
                        onSubmit={handleSubmit}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex-1 flex flex-col gap-3"
                      >
                        <div className="text-center mb-4">
                          <p
                            className="text-[9px] uppercase tracking-[0.3em] font-black mb-1"
                            style={{ color: brandColor }}
                          >
                            {agency?.agency_name}
                          </p>
                          <h3
                            className="text-base text-white/90 font-light"
                            style={{ fontFamily: `${fontFamily}, 'Playfair Display', serif` }}
                          >
                            {t("contact.directContact")}
                          </h3>
                        </div>

                        <AnimatedInput
                          label={t("contact.placeholder_name")}
                          value={formData.name}
                          onChange={(v) => setFormData({ ...formData, name: v })}
                          required
                          icon={<User size={14} />}
                          brandColor={brandColor}
                          fontFamily={fontFamily}
                        />
                        <AnimatedInput
                          label={t("contact.placeholder_email")}
                          type="email"
                          value={formData.email}
                          onChange={(v) => setFormData({ ...formData, email: v })}
                          required
                          icon={<Mail size={14} />}
                          brandColor={brandColor}
                          fontFamily={fontFamily}
                        />
                        <AnimatedTextarea
                          label={t("contact.placeholder_message")}
                          value={formData.message}
                          onChange={(v) => setFormData({ ...formData, message: v })}
                          required
                          brandColor={brandColor}
                          fontFamily={fontFamily}
                        />

                        <div className="mt-2">
                          <ShimmerButton
                            disabled={isSubmitting}
                            loading={isSubmitting}
                            brandColor={buttonColor}
                            fontFamily={fontFamily}
                          >
                            {isSubmitting ? (
                              <Loader2 className="animate-spin" size={15} />
                            ) : (
                              <>
                                <Send size={14} />
                                {t("contact.send_btn")}
                              </>
                            )}
                          </ShimmerButton>
                        </div>

                        {status === "error" && (
                          <motion.div
                            initial={{ opacity: 0, y: 4 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="flex items-center justify-center gap-2 text-red-400 text-[9px] uppercase tracking-widest"
                          >
                            <AlertCircle size={11} />
                            <span>{t("contact.error_message")}</span>
                          </motion.div>
                        )}
                      </motion.form>
                    )}
                  </AnimatePresence>
                </div>

                {/* Home indicator */}
                <div className="flex justify-center pb-3">
                  <div className="w-28 h-1 rounded-full bg-white/15" />
                </div>
              </div>
            </div>

            {/* Glow */}
            <div
              className="absolute -inset-8 rounded-full opacity-20 blur-3xl pointer-events-none -z-10"
              style={{ background: `radial-gradient(circle, ${brandColor} 0%, transparent 70%)` }}
            />
          </motion.div>
        </div>
      </section>
    </div>
  );
}
