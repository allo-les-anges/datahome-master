"use client";

import React, { use, useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  Globe, Building2, Users, BarChart3,
  AlertTriangle, Zap, Mail, Clock,
} from "lucide-react";
import { useAgency } from "@/contexts/AgencyContext";
import { useTranslation } from "@/contexts/I18nContext";

interface ExpiredPageProps {
  params: Promise<{ slug: string; locale: string }>;
}

function ShimmerButton({ href, children, brandColor }: { href: string; children: React.ReactNode; brandColor: string }) {
  return (
    <a
      href={href}
      className="relative inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl font-black text-[11px] tracking-[0.2em] uppercase overflow-hidden transition-all duration-300 hover:scale-[1.02] active:scale-[0.97] text-black"
      style={{ backgroundColor: brandColor, boxShadow: `0 8px 32px ${brandColor}50` }}
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
      <style>{`@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }`}</style>
    </a>
  );
}

const LOST_ITEMS = [
  { icon: <Globe size={18} />, key: "lost1" },
  { icon: <Building2 size={18} />, key: "lost2" },
  { icon: <Users size={18} />, key: "lost3" },
  { icon: <BarChart3 size={18} />, key: "lost4" },
];

export default function ExpiredPage({ params }: ExpiredPageProps) {
  const resolvedParams = use(params);
  const { t, locale } = useTranslation();
  const { agency, loading, setAgencyBySlug } = useAgency();
  const [mounted, setMounted] = useState(false);
  const [daysSinceExpiry, setDaysSinceExpiry] = useState(0);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const { slug } = resolvedParams;
    if (slug && agency?.subdomain !== slug && !loading) {
      setAgencyBySlug(slug);
    }
  }, [resolvedParams.slug, agency?.subdomain, loading, setAgencyBySlug]);

  const brandColor = agency?.primary_color || "#c5a059";
  const fontFamily = agency?.font_family || "Montserrat";

  useEffect(() => {
    const expiry = agency?.footer_config?.subscription?.trial_expires_at;
    if (expiry) {
      const days = Math.floor((Date.now() - new Date(expiry).getTime()) / (1000 * 60 * 60 * 24));
      setDaysSinceExpiry(Math.max(0, days));
    }
  }, [agency]);

  const expiredSince = useMemo(() => {
    const s: string = t("expired.expiredSince") || "Expiré depuis {days} jours";
    return s.replace("{days}", String(daysSinceExpiry));
  }, [t, daysSinceExpiry]);

  const contactEmail = agency?.email || agency?.footer_config?.email || "contact@habihub.com";
  const reactivateHref = `mailto:${contactEmail}?subject=Réactivation — ${agency?.agency_name || ""}`;

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#0d0d0d" }}>
        <div className="w-8 h-8 rounded-full animate-spin border-2 border-white/10" style={{ borderTopColor: brandColor }} />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-20 relative overflow-hidden"
      style={{ background: "#0d0d0d", fontFamily: `${fontFamily}, 'Helvetica Neue', Arial, sans-serif` }}
    >
      {/* Ambient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] rounded-full opacity-[0.04] blur-3xl"
          style={{ background: `radial-gradient(circle, ${brandColor} 0%, transparent 70%)` }} />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[300px] rounded-full opacity-[0.03] blur-3xl"
          style={{ background: `radial-gradient(circle, #ef4444 0%, transparent 70%)` }} />
      </div>

      <div className="max-w-xl w-full relative z-10">

        {/* Agency logo / name */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="text-center mb-12">
          {agency?.logo_url
            ? <img src={agency.logo_url} alt={agency.agency_name} className="h-12 mx-auto mb-4 object-contain opacity-50" />
            : <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-4">{agency?.agency_name}</p>
          }
        </motion.div>

        {/* Main card */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="rounded-3xl overflow-hidden"
          style={{ background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)", border: "1px solid rgba(255,255,255,0.07)" }}
        >
          {/* Red warning band */}
          <div className="h-1 w-full" style={{ background: "linear-gradient(to right, #ef4444, #f97316)" }} />

          <div className="p-8 md:p-12">
            <div className="flex items-start gap-4 mb-8">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 bg-red-900/20 border border-red-900/30">
                <AlertTriangle size={22} className="text-red-400" />
              </div>
              <div>
                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-red-400 mb-1">{expiredSince}</p>
                <h1
                  className="text-3xl md:text-4xl font-light text-white"
                  style={{ fontFamily: `${fontFamily}, "Playfair Display", serif`, letterSpacing: "-0.02em" }}
                >
                  {t("expired.title")}
                </h1>
                <p className="text-sm text-white/40 mt-1">{t("expired.subtitle")}</p>
              </div>
            </div>

            <p className="text-sm text-white/50 leading-relaxed mb-10">{t("expired.body")}</p>

            {/* Lost benefits */}
            <div className="mb-10">
              <p className="text-[9px] font-black uppercase tracking-[0.25em] text-white/25 mb-5">{t("expired.lostTitle")}</p>
              <div className="space-y-3">
                {LOST_ITEMS.map(({ icon, key }, i) => (
                  <motion.div
                    key={key}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + i * 0.1 }}
                    className="flex items-center gap-4 p-4 rounded-2xl"
                    style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)" }}
                  >
                    {/* Strikethrough icon */}
                    <div className="relative w-9 h-9 rounded-xl flex items-center justify-center shrink-0 bg-white/5">
                      <span className="text-white/20">{icon}</span>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-full h-px bg-red-500/60 rotate-[−30deg]" style={{ transform: "rotate(-30deg) scaleX(1.4)" }} />
                      </div>
                    </div>
                    <p className="text-sm text-white/30 line-through decoration-red-500/40">{t(`expired.${key}`)}</p>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3">
              <ShimmerButton href={reactivateHref} brandColor={brandColor}>
                <Zap size={15} /> {t("expired.reactiveBtn")}
              </ShimmerButton>
              <a
                href={`mailto:${contactEmail}`}
                className="flex items-center justify-center gap-2 px-6 py-4 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] text-white/40 hover:text-white/70 transition-all border border-white/10 hover:bg-white/5"
              >
                <Mail size={14} /> {t("expired.contactBtn")}
              </a>
            </div>

            {/* Urgency note */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-6 flex items-center gap-2 p-4 rounded-2xl"
              style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)" }}
            >
              <Clock size={13} className="text-amber-400 shrink-0" />
              <p className="text-[10px] text-amber-400/70 leading-relaxed">{t("expired.urgency")}</p>
            </motion.div>
          </div>
        </motion.div>

        {/* Footer */}
        <p className="text-center text-[9px] text-white/15 uppercase tracking-[0.3em] font-black mt-10">
          {agency?.agency_name} · HabiHub Platform
        </p>
      </div>
    </div>
  );
}
