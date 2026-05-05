"use client";

import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";
import {
  TrendingUp, LogOut, Key, Loader2, Eye, EyeOff,
  AlertCircle, CheckCircle2, Save, X, RefreshCw,
  Mail, Phone, MapPin, Clock, User, Sun, Moon,
} from "lucide-react";

import fr from "@/dictionaries/fr.json";
import en from "@/dictionaries/en.json";
import es from "@/dictionaries/es.json";
import nl from "@/dictionaries/nl.json";
import pl from "@/dictionaries/pl.json";
import ar from "@/dictionaries/ar.json";

const dicts: Record<string, any> = { fr, en, es, nl, pl, ar };

const SESSION_KEY = "leads_crm_session";
const SESSION_DURATION = 8 * 60 * 60 * 1000;

type CrmSession = { agencyId: string; slug: string; exp: number };

type Lead = {
  id: number;
  full_name: string;
  email: string;
  phone: string;
  budget: string;
  location: string;
  delay: string;
  project_type: string;
  status: string;
  created_at: string;
};

const STATUS_CYCLE: Record<string, string> = {
  new: "contacted",
  contacted: "converted",
  converted: "new",
};

const STATUS_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  new:       { bg: "rgba(59,130,246,0.12)",  text: "#60a5fa", border: "rgba(59,130,246,0.2)"  },
  contacted: { bg: "rgba(245,158,11,0.12)",  text: "#fbbf24", border: "rgba(245,158,11,0.2)"  },
  converted: { bg: "rgba(16,185,129,0.12)",  text: "#34d399", border: "rgba(16,185,129,0.2)"  },
};

// ─── Skeleton Lead ─────────────────────────────────────────────────────────────
function SkeletonLead() {
  return (
    <div
      className="rounded-3xl p-5 animate-pulse"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
    >
      <div className="flex gap-4">
        <div className="w-10 h-10 rounded-xl bg-white/8 shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-3 rounded-full bg-white/8 w-1/3" />
          <div className="h-2 rounded-full bg-white/5 w-1/2" />
          <div className="flex gap-3 mt-3">
            <div className="h-2 rounded-full bg-white/5 w-1/4" />
            <div className="h-2 rounded-full bg-white/5 w-1/4" />
          </div>
        </div>
        <div className="h-6 w-20 rounded-full bg-white/8 shrink-0" />
      </div>
    </div>
  );
}

export default function MesLeadsPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const locale = (params?.locale as string) || "fr";
  const dict = (dicts[locale] || dicts.fr).leadsCrm;
  const isRtl = locale === "ar";

  const [agency, setAgency] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<CrmSession | null>(null);

  const [mode, setMode] = useState<"login" | "create">("login");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  const [showChangePw, setShowChangePw] = useState(false);
  const [cpCurrent, setCpCurrent] = useState("");
  const [cpNew, setCpNew] = useState("");
  const [cpConfirm, setCpConfirm] = useState("");
  const [cpLoading, setCpLoading] = useState(false);
  const [cpMsg, setCpMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [isDark, setIsDark] = useState(true);

  const brandColor = agency?.primary_color || "#ea580c";
  const fontFamily = agency?.font_family || "Montserrat";

  useEffect(() => {
    const stored = localStorage.getItem("pm_theme");
    if (stored) setIsDark(stored !== "light");
  }, []);

  const toggleTheme = () => {
    setIsDark((current) => {
      const next = !current;
      localStorage.setItem("pm_theme", next ? "dark" : "light");
      return next;
    });
  };

  const dateLocale =
    locale === "ar" ? "ar-MA" :
    locale === "nl" ? "nl-NL" :
    locale === "pl" ? "pl-PL" :
    locale === "es" ? "es-ES" :
    locale === "en" ? "en-GB" : "fr-FR";

  useEffect(() => {
    if (!slug) return;
    supabase.from("agency_settings").select("*").eq("subdomain", slug).maybeSingle()
      .then(({ data }) => { setAgency(data); setLoading(false); });
  }, [slug]);

  useEffect(() => {
    if (!agency) return;
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return;
      const s: CrmSession = JSON.parse(raw);
      if (s.slug === slug && s.agencyId === String(agency.id) && Date.now() < s.exp) {
        setSession(s);
      } else { sessionStorage.removeItem(SESSION_KEY); }
    } catch { sessionStorage.removeItem(SESSION_KEY); }
  }, [agency, slug]);

  useEffect(() => {
    if (!agency) return;
    setMode(agency.leads_password ? "login" : "create");
  }, [agency]);

  const loadLeads = useCallback(async (agencyId: string) => {
    setLeadsLoading(true);
    const { data } = await supabase
      .from("leads")
      .select("*")
      .eq("agency_id", agencyId)
      .order("created_at", { ascending: false });
    setLeads(data || []);
    setLeadsLoading(false);
  }, []);

  useEffect(() => {
    if (session) loadLeads(session.agencyId);
  }, [session, loadLeads]);

  const handleAuth = async () => {
    setAuthError("");
    if (mode === "create") {
      if (password.length < 8) { setAuthError("Min. 8 " + (isRtl ? "أحرف" : "characters")); return; }
      if (password !== confirm) { setAuthError(isRtl ? "كلمات المرور غير متطابقة" : "Passwords do not match"); return; }
    }
    setAuthLoading(true);
    const res = await fetch("/api/leads-crm/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: mode === "create" ? "set-password" : "login", slug, password }),
    });
    const data = await res.json();
    setAuthLoading(false);
    if (!data.success) { setAuthError(data.error || "Erreur"); return; }
    const s: CrmSession = { agencyId: String(data.agencyId || agency.id), slug, exp: Date.now() + SESSION_DURATION };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
    setSession(s);
  };

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setSession(null);
    setLeads([]);
  };

  const handleChangePw = async () => {
    setCpMsg(null);
    if (cpNew.length < 8) { setCpMsg({ type: "err", text: "Min. 8 chars" }); return; }
    if (cpNew !== cpConfirm) { setCpMsg({ type: "err", text: isRtl ? "كلمات المرور غير متطابقة" : "Passwords do not match" }); return; }
    setCpLoading(true);
    const res = await fetch("/api/leads-crm/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "change-password", slug, password: cpCurrent, currentPassword: cpCurrent, newPassword: cpNew }),
    });
    const data = await res.json();
    setCpLoading(false);
    if (!data.success) { setCpMsg({ type: "err", text: data.error || "Erreur" }); return; }
    setCpMsg({ type: "ok", text: dict.pwUpdated });
    setCpCurrent(""); setCpNew(""); setCpConfirm("");
  };

  const cycleStatus = async (lead: Lead) => {
    const nextStatus = STATUS_CYCLE[lead.status] || "new";
    await supabase.from("leads").update({ status: nextStatus }).eq("id", lead.id);
    setLeads((prev) => prev.map((l) => l.id === lead.id ? { ...l, status: nextStatus } : l));
  };

  const filteredLeads = filter === "all" ? leads : leads.filter((l) => l.status === filter);

  const stats = {
    total:     leads.length,
    new:       leads.filter((l) => l.status === "new").length,
    contacted: leads.filter((l) => l.status === "contacted").length,
    converted: leads.filter((l) => l.status === "converted").length,
  };

  const formatDate = (iso: string) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleDateString(dateLocale, { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  const glassCard = {
    background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
    border: "1px solid rgba(255,255,255,0.08)",
    backdropFilter: "blur(12px)",
  };

  const inputCls = "w-full px-4 py-3.5 rounded-2xl border text-sm text-white placeholder:text-white/20 focus:outline-none transition-all bg-white/[0.04] border-white/[0.07] focus:border-white/20";

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0d0d]">
      <Loader2 size={32} className="animate-spin text-white/20" />
    </div>
  );

  if (!agency) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0d0d]">
      <p className="text-white/30 font-medium">Agency not found.</p>
    </div>
  );

  const leadsEnabled = !!agency?.footer_config?.integrations?.leads_enabled;

  if (!leadsEnabled) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0d0d] px-6" dir={isRtl ? "rtl" : "ltr"} style={{ fontFamily: `${fontFamily}, sans-serif` }}>
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ backgroundColor: `${brandColor}20`, border: `1px solid ${brandColor}30` }}>
          <TrendingUp size={28} style={{ color: brandColor }} />
        </div>
        <h1 className="text-xl font-bold text-white mb-2">{agency.agency_name}</h1>
        <p className="text-sm text-white/40">{dict.moduleOff}</p>
        <p className="text-xs text-white/25 mt-1">{dict.moduleOffContact}</p>
      </div>
    </div>
  );

  if (!session) return (
    <div
      className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden"
      dir={isRtl ? "rtl" : "ltr"}
      style={{ fontFamily: `${fontFamily}, sans-serif`, background: "#0d0d0d" }}
    >
      <div className="absolute inset-0 opacity-[0.07]" style={{ backgroundImage: `radial-gradient(circle at 50% 40%, ${brandColor} 0%, transparent 60%)` }} />
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          {agency.logo_url
            ? <img src={agency.logo_url} alt={agency.agency_name} className="h-12 mx-auto mb-4 object-contain" />
            : <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: `${brandColor}20`, border: `1px solid ${brandColor}30` }}>
                <TrendingUp size={24} style={{ color: brandColor }} />
              </div>
          }
          <h1 className="text-2xl font-bold text-white">
            {mode === "create" ? dict.createTitle : dict.title}
          </h1>
          <p className="text-sm text-white/30 mt-1">{agency.agency_name}</p>
        </div>

        <div className="rounded-3xl p-8 space-y-5" style={glassCard}>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/30">
              {mode === "create" ? dict.createPwLabel : dict.pwLabel}
            </label>
            <div className="relative">
              <input type={showPw ? "text" : "password"} value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAuth()}
                placeholder="••••••••"
                className={inputCls} />
              <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {mode === "create" && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30">{dict.confirmLabel}</label>
              <input type="password" value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAuth()}
                placeholder="••••••••"
                className={inputCls} />
            </div>
          )}

          {authError && (
            <div className="flex items-center gap-2 p-3 rounded-xl border border-red-900/30 bg-red-900/10">
              <AlertCircle size={14} className="text-red-400 shrink-0" />
              <p className="text-xs text-red-400 font-medium">{authError}</p>
            </div>
          )}

          <button type="button" onClick={handleAuth} disabled={authLoading}
            className="w-full py-4 rounded-2xl text-sm font-black flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ backgroundColor: brandColor, color: "#000", boxShadow: `0 8px 32px ${brandColor}40` }}>
            {authLoading ? <Loader2 size={16} className="animate-spin" /> : <Key size={16} />}
            {mode === "create" ? dict.createBtn : dict.loginBtn}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`min-h-screen ${isDark ? "pm-dark bg-[#0d0d0d]" : "pm-light bg-slate-100"}`} dir={isRtl ? "rtl" : "ltr"} style={{ fontFamily: `${fontFamily}, sans-serif` }}>
      <style jsx global>{`
        .pm-light [class*="text-white"] { color: #0f172a !important; }
        .pm-light [class*="text-white/"] { color: rgba(15, 23, 42, 0.62) !important; }
        .pm-light [class*="bg-white/"] { background-color: rgba(15, 23, 42, 0.045) !important; }
        .pm-light [class*="border-white/"] { border-color: rgba(15, 23, 42, 0.10) !important; }
        .pm-light input { color: #0f172a !important; background-color: rgba(255,255,255,0.82) !important; border-color: rgba(15,23,42,0.12) !important; }
        .pm-light input::placeholder { color: rgba(15,23,42,0.35) !important; }
      `}</style>

      {/* Header */}
      <div
        className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between"
        style={{ background: "rgba(13,13,13,0.9)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-3">
          {agency.logo_url
            ? <img src={agency.logo_url} alt={agency.agency_name} className="h-8 object-contain" />
            : <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${brandColor}20`, border: `1px solid ${brandColor}30` }}>
                <TrendingUp size={15} style={{ color: brandColor }} />
              </div>
          }
          <div>
            <p className="text-sm font-bold text-white">{agency.agency_name}</p>
            <p className="text-[10px] text-white/25 uppercase tracking-widest font-bold">{dict.badge}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setShowChangePw(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/10 text-xs font-bold text-white/50 hover:bg-white/5 transition-all">
            <Key size={13} /> {dict.changePwBtn}
          </button>
          <button type="button" onClick={toggleTheme}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/10 text-xs font-bold text-white/50 hover:bg-white/5 transition-all"
            title={isDark ? "Mode jour" : "Mode nuit"}>
            {isDark ? <Sun size={13} /> : <Moon size={13} />} {isDark ? "Jour" : "Nuit"}
          </button>
          <button type="button" onClick={handleLogout}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/10 text-xs font-bold text-white/50 hover:bg-red-900/20 hover:border-red-900/40 hover:text-red-400 transition-all">
            <LogOut size={13} /> {dict.logout}
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">

        {/* Bento Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: dict.totalLeads, value: stats.total,     accent: brandColor,    icon: <TrendingUp size={18} /> },
            { label: dict.new,        value: stats.new,        accent: "#60a5fa",     icon: <User size={18} /> },
            { label: dict.contacted,  value: stats.contacted,  accent: "#fbbf24",     icon: <Mail size={18} /> },
            { label: dict.converted,  value: stats.converted,  accent: "#34d399",     icon: <CheckCircle2 size={18} /> },
          ].map(({ label, value, accent, icon }) => (
            <div
              key={label}
              className="rounded-3xl p-6 relative overflow-hidden group hover:-translate-y-0.5 transition-transform duration-300"
              style={glassCard}
            >
              <div className="absolute top-0 right-0 w-16 h-16 rounded-full opacity-10 blur-xl" style={{ backgroundColor: accent, transform: "translate(30%, -30%)" }} />
              <div className="flex items-start justify-between mb-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${accent}18` }}>
                  <span style={{ color: accent }}>{icon}</span>
                </div>
              </div>
              <p className="text-3xl font-black text-white mb-1" style={{ color: accent }}>{value}</p>
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/30">{label}</p>
            </div>
          ))}
        </div>

        {/* Filtres */}
        <div className="flex items-center gap-3 flex-wrap">
          {[
            { key: "all",       label: dict.all,       count: stats.total },
            { key: "new",       label: dict.new,       count: stats.new },
            { key: "contacted", label: dict.contacted,  count: stats.contacted },
            { key: "converted", label: dict.converted,  count: stats.converted },
          ].map(({ key, label, count }) => (
            <button type="button" key={key}
              onClick={() => setFilter(key)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-xs font-bold transition-all"
              style={filter === key
                ? { backgroundColor: brandColor, color: "#000", boxShadow: `0 4px 16px ${brandColor}40` }
                : { background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.5)" }
              }>
              {label}
              <span
                className="w-4 h-4 rounded-full text-[9px] font-black flex items-center justify-center"
                style={filter === key
                  ? { backgroundColor: "rgba(0,0,0,0.2)", color: "#000" }
                  : { backgroundColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.4)" }
                }
              >
                {count}
              </span>
            </button>
          ))}
          <button type="button" onClick={() => loadLeads(session.agencyId)} disabled={leadsLoading}
            className="ml-auto flex items-center gap-1.5 px-4 py-2.5 rounded-full border border-white/10 text-xs font-bold text-white/40 hover:bg-white/5 transition-all">
            <RefreshCw size={13} className={leadsLoading ? "animate-spin" : ""} /> {dict.refresh}
          </button>
        </div>

        {/* Lead list */}
        {leadsLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => <SkeletonLead key={i} />)}
          </div>
        ) : filteredLeads.length === 0 ? (
          <div className="text-center py-24 rounded-3xl" style={glassCard}>
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: "rgba(255,255,255,0.05)" }}>
              <TrendingUp size={28} className="text-white/15" />
            </div>
            <p className="text-white/40 font-medium">{dict.noLeads}{filter !== "all" ? ` ${dict.noLeadsFilter}` : ""}</p>
            <p className="text-xs text-white/20 mt-1">{dict.noLeadsHint}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLeads.map((lead) => {
              const st = STATUS_STYLES[lead.status] || STATUS_STYLES.new;
              return (
                <div
                  key={lead.id}
                  className="rounded-3xl p-5 transition-all duration-300 hover:-translate-y-0.5"
                  style={{ ...glassCard, boxShadow: "0 4px 24px rgba(0,0,0,0.25)" }}
                >
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm"
                        style={{ backgroundColor: `${brandColor}20`, color: brandColor }}
                      >
                        {lead.full_name?.charAt(0) || <User size={16} />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <p className="font-bold text-white text-sm">{lead.full_name || "—"}</p>
                          <span
                            className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full"
                            style={{ backgroundColor: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.35)" }}
                          >
                            {dict.source}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-1 flex-wrap">
                          {lead.email && (
                            <a href={`mailto:${lead.email}`} className="flex items-center gap-1 text-xs text-white/35 hover:text-blue-400 transition-colors">
                              <Mail size={11} /> {lead.email}
                            </a>
                          )}
                          {lead.phone && (
                            <a href={`tel:${lead.phone}`} className="flex items-center gap-1 text-xs text-white/35 hover:text-green-400 transition-colors">
                              <Phone size={11} /> {lead.phone}
                            </a>
                          )}
                        </div>
                        <div className="flex items-center gap-3 mt-2 flex-wrap">
                          {lead.budget && (
                            <span className="text-[10px] text-white/30 font-medium">
                              {dict.budget} : <strong className="text-white/60">{lead.budget}</strong>
                            </span>
                          )}
                          {lead.location && (
                            <span className="flex items-center gap-1 text-[10px] text-white/30 font-medium">
                              <MapPin size={10} /> {lead.location}
                            </span>
                          )}
                          {lead.delay && (
                            <span className="flex items-center gap-1 text-[10px] text-white/30 font-medium">
                              <Clock size={10} /> {lead.delay}
                            </span>
                          )}
                          {lead.project_type && (
                            <span className="text-[10px] text-white/30 font-medium">{lead.project_type}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-2 shrink-0">
                      <button type="button"
                        onClick={() => cycleStatus(lead)}
                        className="px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all hover:opacity-80 cursor-pointer"
                        style={{ backgroundColor: st.bg, color: st.text, border: `1px solid ${st.border}` }}
                      >
                        {(dict as any)[lead.status] || lead.status}
                      </button>
                      <p className="text-[9px] text-white/20 font-medium">{formatDate(lead.created_at)}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modale changement mot de passe */}
      {showChangePw && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-6" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
          <div className="rounded-3xl p-8 max-w-sm w-full" style={{ ...glassCard, boxShadow: "0 40px 80px rgba(0,0,0,0.6)" }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-white">{dict.changePwTitle}</h3>
              <button type="button" onClick={() => { setShowChangePw(false); setCpMsg(null); }} className="p-1.5 hover:bg-white/5 rounded-xl transition-all">
                <X size={16} className="text-white/30" />
              </button>
            </div>
            <div className="space-y-4">
              {([
                [dict.currentPw, cpCurrent, setCpCurrent],
                [dict.newPw, cpNew, setCpNew],
                [dict.confirmNewPw, cpConfirm, setCpConfirm],
              ] as [string, string, (v: string) => void][]).map(([label, val, setter]) => (
                <div key={label} className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-white/30">{label}</label>
                  <input type="password" value={val} onChange={(e) => setter(e.target.value)}
                    className={inputCls} />
                </div>
              ))}
              {cpMsg && (
                <div className={`flex items-center gap-2 p-3 rounded-xl border ${cpMsg.type === "ok" ? "bg-green-900/10 border-green-900/30" : "bg-red-900/10 border-red-900/30"}`}>
                  {cpMsg.type === "ok" ? <CheckCircle2 size={14} className="text-green-400" /> : <AlertCircle size={14} className="text-red-400" />}
                  <p className={`text-xs font-medium ${cpMsg.type === "ok" ? "text-green-400" : "text-red-400"}`}>{cpMsg.text}</p>
                </div>
              )}
              <button type="button" onClick={handleChangePw} disabled={cpLoading}
                className="w-full py-3.5 rounded-2xl text-sm font-black flex items-center justify-center gap-2 mt-2 transition-all hover:opacity-90"
                style={{ backgroundColor: brandColor, color: "#000", boxShadow: `0 8px 24px ${brandColor}40` }}>
                {cpLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {dict.updateBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
