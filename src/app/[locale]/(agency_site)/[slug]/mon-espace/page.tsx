"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import {
  Home, LogOut, Plus, Pencil, Trash2, X, Eye, EyeOff,
  Loader2, CheckCircle2, AlertCircle, Upload, Key, Save,
  BedDouble, Bath, Maximize2, MapPin, Image as ImageIcon,
  ArrowLeft, Building2, Euro, Waves, LayoutGrid, AlignLeft,
  Camera, Info, ChevronDown, TrendingUp, Globe, BarChart3,
  Lock, Zap, Clock, ChevronRight, Star, Settings,
} from "lucide-react";
import ClientDashboard from "@/components/ClientDashboard";

import fr from "@/dictionaries/fr.json";
import en from "@/dictionaries/en.json";
import es from "@/dictionaries/es.json";
import nl from "@/dictionaries/nl.json";
import pl from "@/dictionaries/pl.json";
import ar from "@/dictionaries/ar.json";

const dicts: Record<string, any> = { fr, en, es, nl, pl, ar };

const SESSION_KEY = "pm_session";
const SESSION_DURATION = 8 * 60 * 60 * 1000;

type PmSession = { agencyId: string; slug: string; exp: number };

type Property = {
  id: number;
  ref: string;
  titre_fr: string;
  titre_en: string;
  price: number;
  town: string;
  region: string;
  beds: number;
  baths: number;
  surface_built: string;
  type: string;
  pool: string;
  images: string[];
  description_fr: string;
  description_en: string;
};

const PROPERTY_TYPES = ["Villa", "Appartement", "Penthouse", "Bungalow", "Maison", "Terrain", "Commercial"];

const emptyForm = {
  titre_fr: "", titre_en: "", price: "", town: "", region: "",
  beds: "", baths: "", surface_built: "", type: "Villa",
  pool: "Non", description_fr: "", description_en: "",
};

// ─── Skeleton Loader ───────────────────────────────────────────────────────────
function SkeletonCard() {
  return (
    <div
      className="rounded-3xl overflow-hidden animate-pulse"
      style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.05)" }}
    >
      <div className="aspect-[4/3] bg-white/5" />
      <div className="p-5 space-y-3">
        <div className="h-3 rounded-full bg-white/8 w-3/4" />
        <div className="h-2 rounded-full bg-white/5 w-1/2" />
        <div className="h-5 rounded-full bg-white/10 w-1/3 mt-2" />
        <div className="flex gap-3 mt-3 pt-3 border-t border-white/5">
          <div className="h-8 flex-1 rounded-xl bg-white/5" />
          <div className="h-8 w-10 rounded-xl bg-white/5" />
        </div>
      </div>
    </div>
  );
}

// ─── Form components ───────────────────────────────────────────────────────────
function SectionHeader({ icon, label, color }: { icon: React.ReactNode; label: string; color: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${color}18` }}>
        <span style={{ color }}>{icon}</span>
      </div>
      <p className="text-[10px] font-black uppercase tracking-widest text-white/30">{label}</p>
      <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
    </div>
  );
}

function FieldInput({ label, icon, children }: { label: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black uppercase tracking-widest text-white/30 flex items-center gap-1">
        {icon && <span className="opacity-50">{icon}</span>}
        {label}
      </label>
      {children}
    </div>
  );
}

function PropertyForm({
  initial, agencyId, slug, brandColor, dict, onSaved, onCancel,
}: {
  initial?: Partial<Property> | null;
  agencyId: string;
  slug: string;
  brandColor: string;
  dict: any;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({ ...emptyForm, ...(initial || {}) });
  const [images, setImages] = useState<string[]>(initial?.images || []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }));

  const handleUpload = async (files: FileList) => {
    setUploading(true);
    const newUrls: string[] = [];
    for (const file of Array.from(files)) {
      const ext = file.name.split(".").pop();
      const path = `${slug}/properties/${initial?.id || "new"}_${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("agencies").upload(path, file, { upsert: true });
      if (!upErr) {
        const { data } = supabase.storage.from("agencies").getPublicUrl(path);
        newUrls.push(data.publicUrl);
      }
    }
    setImages((prev) => [...prev, ...newUrls]);
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.titre_fr || !form.price || !form.town) { setError(dict.requiredFields); return; }
    setSaving(true);
    setError("");
    const payload = {
      ...form,
      price: Number(form.price),
      beds: Number(form.beds) || 0,
      baths: Number(form.baths) || 0,
      images,
      agency_id: agencyId,
      ...(initial?.id ? { id: initial.id } : {}),
    };
    const res = await fetch("/api/property-manager/properties", {
      method: initial?.id ? "PUT" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    setSaving(false);
    if (data.error) { setError(data.error); return; }
    onSaved();
  };

  const inputCls = "w-full px-4 py-3 rounded-2xl border text-sm text-white placeholder:text-white/20 focus:outline-none transition-all"
    + " bg-white/[0.04] border-white/[0.07] focus:border-white/20 focus:bg-white/[0.06]";

  return (
    <div className="space-y-10 pb-4">
      <div>
        <SectionHeader icon={<Info size={15} />} label="Informations" color={brandColor} />
        <div className="space-y-4">
          <FieldInput label={dict.titleFr}>
            <input type="text" placeholder="Belle villa avec vue mer..." value={form.titre_fr}
              onChange={(e) => set("titre_fr", e.target.value)} className={inputCls} />
          </FieldInput>
          <FieldInput label={dict.titleEn}>
            <input type="text" placeholder="Stunning sea view villa..." value={form.titre_en}
              onChange={(e) => set("titre_en", e.target.value)} className={inputCls} />
          </FieldInput>
          <div className="grid grid-cols-2 gap-4">
            <FieldInput label={dict.price} icon={<Euro size={11} />}>
              <div className="relative">
                <input type="number" placeholder="350 000" value={form.price}
                  onChange={(e) => set("price", e.target.value)} className={`${inputCls} pr-8`} />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-white/20 font-bold">€</span>
              </div>
            </FieldInput>
            <FieldInput label={dict.type}>
              <div className="relative">
                <select value={form.type} onChange={(e) => set("type", e.target.value)}
                  className={`${inputCls} appearance-none pr-9 cursor-pointer`}>
                  {PROPERTY_TYPES.map((t) => <option key={t} className="bg-[#1a1a1a]">{t}</option>)}
                </select>
                <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
              </div>
            </FieldInput>
          </div>
        </div>
      </div>

      <div>
        <SectionHeader icon={<MapPin size={15} />} label="Localisation" color={brandColor} />
        <div className="grid grid-cols-2 gap-4">
          <FieldInput label={dict.city}>
            <input type="text" placeholder="Marbella" value={form.town}
              onChange={(e) => set("town", e.target.value)} className={inputCls} />
          </FieldInput>
          <FieldInput label={dict.region}>
            <input type="text" placeholder="Andalousie" value={form.region}
              onChange={(e) => set("region", e.target.value)} className={inputCls} />
          </FieldInput>
        </div>
      </div>

      <div>
        <SectionHeader icon={<LayoutGrid size={15} />} label="Caractéristiques" color={brandColor} />
        <div className="grid grid-cols-3 gap-4 mb-5">
          <FieldInput label={dict.beds} icon={<BedDouble size={11} />}>
            <input type="number" placeholder="3" value={form.beds}
              onChange={(e) => set("beds", e.target.value)} className={inputCls} />
          </FieldInput>
          <FieldInput label={dict.baths} icon={<Bath size={11} />}>
            <input type="number" placeholder="2" value={form.baths}
              onChange={(e) => set("baths", e.target.value)} className={inputCls} />
          </FieldInput>
          <FieldInput label={dict.surface} icon={<Maximize2 size={11} />}>
            <div className="relative">
              <input type="number" placeholder="180" value={form.surface_built}
                onChange={(e) => set("surface_built", e.target.value)} className={`${inputCls} pr-9`} />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-white/20 font-bold">m²</span>
            </div>
          </FieldInput>
        </div>
        <FieldInput label={dict.pool} icon={<Waves size={11} />}>
          <div className="flex gap-3 mt-1">
            {[{ label: dict.yes, val: "Oui" }, { label: dict.no, val: "Non" }].map(({ label, val }) => {
              const active = form.pool === val;
              return (
                <button key={val} type="button" onClick={() => set("pool", val)}
                  className="flex-1 py-3 rounded-2xl text-sm font-bold transition-all border"
                  style={active
                    ? { backgroundColor: brandColor, color: "#000", border: "1px solid transparent" }
                    : { backgroundColor: "rgba(255,255,255,0.03)", color: "rgba(255,255,255,0.4)", border: "1px solid rgba(255,255,255,0.07)" }
                  }>
                  {label}
                </button>
              );
            })}
          </div>
        </FieldInput>
      </div>

      <div>
        <SectionHeader icon={<AlignLeft size={15} />} label="Description" color={brandColor} />
        <div className="space-y-4">
          <FieldInput label={dict.descFr}>
            <textarea rows={4} value={form.description_fr}
              onChange={(e) => set("description_fr", e.target.value)}
              className={`${inputCls} resize-none leading-relaxed`} />
          </FieldInput>
          <FieldInput label={dict.descEn}>
            <textarea rows={4} value={form.description_en}
              onChange={(e) => set("description_en", e.target.value)}
              className={`${inputCls} resize-none leading-relaxed`} />
          </FieldInput>
        </div>
      </div>

      <div>
        <SectionHeader icon={<Camera size={15} />} label={dict.photos} color={brandColor} />
        {images.length > 0 && (
          <div className="grid grid-cols-3 md:grid-cols-4 gap-2 mb-3">
            {images.map((url, i) => (
              <div key={i} className={`relative group rounded-2xl overflow-hidden bg-white/5 ${i === 0 ? "col-span-2 row-span-2 aspect-[4/3]" : "aspect-square"}`}>
                <img src={url} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt="" />
                {i === 0 && (
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest bg-black/60 text-white">Cover</span>
                )}
                <button type="button" onClick={() => setImages((imgs) => imgs.filter((_, j) => j !== i))}
                  className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/70 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                  <X size={11} className="text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
        <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
          className="w-full py-7 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-2 text-white/30 hover:text-white/50 transition-all group"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          {uploading
            ? <Loader2 size={20} className="animate-spin" />
            : <div className="w-10 h-10 rounded-2xl bg-white/5 group-hover:bg-white/10 flex items-center justify-center transition-all">
                <Upload size={18} />
              </div>
          }
          <span className="text-sm font-semibold">{uploading ? dict.uploading : dict.addPhotos}</span>
          {!uploading && <span className="text-xs text-white/20">JPG, PNG, WEBP</span>}
        </button>
        <input ref={fileRef} type="file" multiple accept="image/*" className="hidden"
          onChange={(e) => e.target.files && handleUpload(e.target.files)} />
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3.5 rounded-2xl border border-red-900/30 bg-red-900/10">
          <AlertCircle size={14} className="text-red-400 shrink-0" />
          <p className="text-xs text-red-400 font-semibold">{error}</p>
        </div>
      )}

      <div className="sticky bottom-0 -mx-8 px-8 py-5 border-t border-white/[0.06] flex gap-3 rounded-b-3xl"
        style={{ background: "rgba(17,17,17,0.95)", backdropFilter: "blur(12px)" }}>
        <button type="button" onClick={onCancel}
          className="px-6 py-3.5 rounded-2xl border border-white/10 text-sm font-bold text-white/40 hover:bg-white/5 transition-all whitespace-nowrap">
          {dict.cancel}
        </button>
        <button type="button" onClick={handleSave} disabled={saving}
          className="flex-1 py-3.5 rounded-2xl text-sm font-black flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ backgroundColor: brandColor, color: "#000", boxShadow: `0 8px 24px ${brandColor}40` }}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {initial?.id ? dict.save : dict.addProperty}
        </button>
      </div>
    </div>
  );
}

// ─── Trial helpers ─────────────────────────────────────────────────────────────
function getTrialInfo(agency: any): { isExpired: boolean; daysLeft: number; expiresAt: Date | null } {
  const sub = agency?.footer_config?.subscription;
  if (!sub?.trial_expires_at) return { isExpired: false, daysLeft: 15, expiresAt: null };
  const expiresAt = new Date(sub.trial_expires_at);
  const msLeft = expiresAt.getTime() - Date.now();
  const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
  return { isExpired: daysLeft <= 0, daysLeft: Math.max(0, daysLeft), expiresAt };
}

// ─── Trial Banner ──────────────────────────────────────────────────────────────
function TrialBanner({ daysLeft, brandColor, dict }: { daysLeft: number; brandColor: string; dict: any }) {
  const pct = Math.min(100, Math.round((daysLeft / 15) * 100));
  const urgent = daysLeft <= 3;
  const color = urgent ? "#ef4444" : brandColor;

  const label = daysLeft === 0
    ? dict?.expiresToday || "Expire aujourd'hui"
    : daysLeft === 1
    ? dict?.dayLeft || "1 jour restant"
    : (dict?.daysLeft || "{days} jours restants").replace("{days}", String(daysLeft));

  return (
    <div className="mx-6 my-3 rounded-2xl px-4 py-3 flex items-center justify-between gap-4"
      style={{ background: `${color}10`, border: `1px solid ${color}30` }}>
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <Clock size={14} style={{ color }} className="shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-[9px] font-black uppercase tracking-widest" style={{ color }}>{dict?.badge || "Essai Gratuit"}</p>
          <div className="flex items-center gap-2 mt-1">
            <div className="flex-1 h-1 rounded-full bg-white/10">
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: color }} />
            </div>
            <span className="text-[9px] text-white/40 font-bold whitespace-nowrap">{label}</span>
          </div>
        </div>
      </div>
      <button className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl transition-all hover:opacity-80 shrink-0 text-black"
        style={{ backgroundColor: color }}>
        {dict?.upgradeBtn || "Upgrade"}
      </button>
    </div>
  );
}

// ─── Page principale ───────────────────────────────────────────────────────────
export default function MonEspacePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const locale = (params?.locale as string) || "fr";
  const dict = (dicts[locale] || dicts.fr).propertyManager;
  const trialDict = (dicts[locale] || dicts.fr).trial;
  const upsellDict = (dicts[locale] || dicts.fr).upsell;
  const isRtl = locale === "ar";

  const [agency, setAgency] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<PmSession | null>(null);

  const [mode, setMode] = useState<"login" | "create">("login");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");

  const [properties, setProperties] = useState<Property[]>([]);
  const [propLoading, setPropLoading] = useState(false);
  const [view, setView] = useState<"dashboard" | "list" | "form" | "settings">("dashboard");
  const [editing, setEditing] = useState<Partial<Property> | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [showChangePw, setShowChangePw] = useState(false);
  const [cpCurrent, setCpCurrent] = useState("");
  const [cpNew, setCpNew] = useState("");
  const [cpConfirm, setCpConfirm] = useState("");
  const [cpLoading, setCpLoading] = useState(false);
  const [cpMsg, setCpMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const brandColor = agency?.primary_color || "#D4AF37";
  const fontFamily = agency?.font_family || "Montserrat";

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
      const s: PmSession = JSON.parse(raw);
      if (s.slug === slug && s.agencyId === String(agency.id) && Date.now() < s.exp) {
        setSession(s);
      } else { sessionStorage.removeItem(SESSION_KEY); }
    } catch { sessionStorage.removeItem(SESSION_KEY); }
  }, [agency, slug]);

  useEffect(() => {
    if (!agency) return;
    setMode(agency.property_manager_password ? "login" : "create");
  }, [agency]);

  const loadProperties = useCallback(async () => {
    if (!session) return;
    setPropLoading(true);
    const res = await fetch(`/api/property-manager/properties?agency_id=${session.agencyId}`);
    const { data } = await res.json();
    setProperties(data || []);
    setPropLoading(false);
  }, [session]);

  useEffect(() => { if (session) loadProperties(); }, [session, loadProperties]);

  useEffect(() => {
    if (!session || !agency) return;
    const { isExpired } = getTrialInfo(agency);
    if (isExpired) router.push(`/${locale}/${slug}/expired`);
  }, [session, agency, locale, slug, router]);

  const handleAuth = async () => {
    setAuthError("");
    if (mode === "create") {
      if (password.length < 8) { setAuthError("Min. 8 chars"); return; }
      if (password !== confirm) { setAuthError("Passwords do not match"); return; }
    }
    setAuthLoading(true);
    const res = await fetch("/api/property-manager/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: mode === "create" ? "set-password" : "login", slug, password }),
    });
    const data = await res.json();
    setAuthLoading(false);
    if (!data.success) { setAuthError(data.error || "Erreur"); return; }
    const s: PmSession = { agencyId: String(data.agencyId || agency.id), slug, exp: Date.now() + SESSION_DURATION };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
    setSession(s);
  };

  const handleLogout = () => { sessionStorage.removeItem(SESSION_KEY); setSession(null); setProperties([]); };

  const handleDelete = async (id: number) => {
    if (!session) return;
    setDeleting(true);
    await fetch(`/api/property-manager/properties?id=${id}&agency_id=${session.agencyId}`, { method: "DELETE" });
    setDeleteId(null);
    setDeleting(false);
    loadProperties();
  };

  const handleChangePw = async () => {
    setCpMsg(null);
    if (cpNew.length < 8) { setCpMsg({ type: "err", text: "Min. 8 chars" }); return; }
    if (cpNew !== cpConfirm) { setCpMsg({ type: "err", text: "Passwords do not match" }); return; }
    setCpLoading(true);
    const res = await fetch("/api/property-manager/auth", {
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

  const glassCard = {
    background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
    border: "1px solid rgba(255,255,255,0.08)",
    backdropFilter: "blur(12px)",
  };

  const inputCls = "w-full px-4 py-3.5 rounded-2xl border text-sm text-white placeholder:text-white/20 focus:outline-none transition-all bg-white/[0.04] border-white/[0.07] focus:border-white/20";

  // ── Loading ──
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

  // ── Module non activé ──
  const pmEnabled = agency.property_manager_enabled || agency.footer_config?.integrations?.property_manager_enabled;
  if (!pmEnabled) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0d0d] px-6" dir={isRtl ? "rtl" : "ltr"} style={{ fontFamily: `${fontFamily}, sans-serif` }}>
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-black font-bold text-2xl" style={{ backgroundColor: brandColor }}>
          {agency.agency_name?.charAt(0)}
        </div>
        <h1 className="text-xl font-bold text-white mb-2">{agency.agency_name}</h1>
        <p className="text-sm text-white/40">{dict.moduleOff}</p>
        <p className="text-xs text-white/25 mt-1">{dict.moduleOffContact}</p>
      </div>
    </div>
  );

  // ── Auth ──
  if (!session) return (
    <div
      className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden"
      dir={isRtl ? "rtl" : "ltr"}
      style={{ fontFamily: `${fontFamily}, sans-serif`, background: "#0d0d0d" }}
    >
      <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: `radial-gradient(circle at 50% 40%, ${brandColor} 0%, transparent 60%)` }} />
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          {agency.logo_url
            ? <img src={agency.logo_url} alt={agency.agency_name} className="h-14 mx-auto mb-5 object-contain" />
            : <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 text-black text-2xl font-bold" style={{ backgroundColor: brandColor }}>{agency.agency_name?.charAt(0)}</div>
          }
          <h1 className="text-2xl font-bold text-white">{dict.title}</h1>
          <p className="text-sm text-white/30 mt-1">{mode === "create" ? dict.welcome : agency.agency_name}</p>
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

  // ── Settings ──
  if (view === "settings") return (
    <ClientDashboard
      agency={agency}
      slug={slug as string}
      agencyId={session!.agencyId}
      locale={locale as string}
      onBack={() => setView("dashboard")}
      onSaved={(updated) => { setAgency(updated); setView("dashboard"); }}
    />
  );

  // ── Dashboard ──
  return (
    <div className="min-h-screen bg-[#0d0d0d]" dir={isRtl ? "rtl" : "ltr"} style={{ fontFamily: `${fontFamily}, sans-serif` }}>

      {/* Header */}
      <div
        className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between"
        style={{ background: "rgba(13,13,13,0.9)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-3">
          {(view === "list" || view === "form") && (
            <button
              type="button"
              onClick={() => {
                if (view === "form") { setView("list"); setEditing(null); }
                else setView("dashboard");
              }}
              className="p-2 rounded-xl hover:bg-white/5 transition-all text-white/40 hover:text-white/70 mr-1"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          {agency.logo_url
            ? <img src={agency.logo_url} alt={agency.agency_name} className="h-8 object-contain" />
            : <div className="w-9 h-9 rounded-xl flex items-center justify-center text-black font-bold" style={{ backgroundColor: brandColor }}>{agency.agency_name?.charAt(0)}</div>
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
          <button type="button" onClick={handleLogout}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/10 text-xs font-bold text-white/50 hover:bg-red-900/20 hover:border-red-900/40 hover:text-red-400 transition-all">
            <LogOut size={13} /> {dict.logout}
          </button>
        </div>
      </div>

      {/* Trial Banner — shown in dashboard and list views */}
      {view !== "form" && (() => {
        const { daysLeft } = getTrialInfo(agency);
        return <TrialBanner daysLeft={daysLeft} brandColor={brandColor} dict={trialDict} />;
      })()}

      <div className="max-w-6xl mx-auto px-6 py-10">
        {view === "dashboard" ? (
          <>
            {/* Welcome header */}
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-10"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.25em] text-white/20 mb-1">
                {upsellDict?.viewModule || "Mon Espace"}
              </p>
              <h2 className="text-3xl font-bold text-white">
                {agency.agency_name}
              </h2>
            </motion.div>

            {/* Module Bento Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* ── Propriétés ── */}
              <motion.button
                type="button"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                onClick={() => { loadProperties(); setView("list"); }}
                className="group text-left rounded-3xl p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                style={{ ...glassCard, boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: `${brandColor}20` }}>
                    <Building2 size={22} style={{ color: brandColor }} />
                  </div>
                  <ChevronRight size={18} className="text-white/20 group-hover:text-white/50 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-lg font-bold text-white mb-1">{upsellDict?.propertiesTitle || "Mes Propriétés"}</p>
                <p className="text-sm text-white/30 mb-4">{upsellDict?.propertiesSubtitle || "Gérez votre catalogue"}</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: brandColor }} />
                  <span className="text-xs font-bold text-white/40">
                    {properties.length} {properties.length <= 1 ? dict.published : dict.publishedPlural}
                  </span>
                </div>
              </motion.button>

              {/* ── Mini CRM ── */}
              {(() => {
                const crmEnabled = agency?.footer_config?.integrations?.crm_enabled;
                return (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="relative rounded-3xl p-7 overflow-hidden"
                    style={{ ...glassCard, boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }}
                  >
                    {/* Card content (blurred when locked) */}
                    <div style={{ filter: crmEnabled ? "none" : "blur(3px)", pointerEvents: crmEnabled ? "auto" : "none", opacity: crmEnabled ? 1 : 0.5 }}>
                      <div className="flex items-start justify-between mb-6">
                        <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-purple-900/20">
                          <TrendingUp size={22} className="text-purple-400" />
                        </div>
                      </div>
                      <p className="text-lg font-bold text-white mb-1">{upsellDict?.crmTitle || "Mini CRM"}</p>
                      <p className="text-sm text-white/30">{upsellDict?.crmSubtitle || "Gérez vos leads et contacts"}</p>
                    </div>

                    {/* Lock overlay */}
                    {!crmEnabled && (
                      <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 rounded-3xl"
                        style={{ background: "rgba(13,13,13,0.6)", backdropFilter: "blur(4px)" }}>
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center bg-white/5 border border-white/10">
                          <Lock size={18} className="text-white/40" />
                        </div>
                        <div className="text-center px-4">
                          <span className="block text-[9px] font-black uppercase tracking-[0.25em] mb-1"
                            style={{ color: brandColor }}>{upsellDict?.crmBadge || "Premium"}</span>
                          <p className="text-xs text-white/40">{upsellDict?.locked || "Module non activé"}</p>
                        </div>
                        <a
                          href={`mailto:${agency?.email || "contact@habihub.com"}?subject=Activer CRM — ${agency?.agency_name || ""}`}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-black transition-all hover:opacity-90"
                          style={{ backgroundColor: brandColor }}
                        >
                          <Zap size={12} /> {upsellDict?.crmBtn || "Activer"}
                        </a>
                      </div>
                    )}
                  </motion.div>
                );
              })()}

              {/* ── Site Vitrine ── */}
              <motion.a
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                href={`/${locale}/${slug}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group text-left rounded-3xl p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                style={{ ...glassCard, boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-sky-900/20">
                    <Globe size={22} className="text-sky-400" />
                  </div>
                  <ChevronRight size={18} className="text-white/20 group-hover:text-sky-400 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-lg font-bold text-white mb-1">{upsellDict?.siteTitle || "Mon Site Vitrine"}</p>
                <p className="text-sm text-white/30">{upsellDict?.siteSubtitle || "Voir votre site public"}</p>
              </motion.a>

              {/* ── Paramètres ── */}
              <motion.button
                type="button"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                onClick={() => setView("settings")}
                className="group text-left rounded-3xl p-7 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                style={{ ...glassCard, boxShadow: "0 4px 24px rgba(0,0,0,0.3)" }}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-slate-800/60">
                    <Settings size={22} className="text-slate-400" />
                  </div>
                  <ChevronRight size={18} className="text-white/20 group-hover:text-white/50 group-hover:translate-x-1 transition-all" />
                </div>
                <p className="text-lg font-bold text-white mb-1">Paramètres</p>
                <p className="text-sm text-white/30">Identité, couleurs, équipe…</p>
              </motion.button>

              {/* ── Statistiques ── */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25 }}
                className="relative rounded-3xl p-7 overflow-hidden"
                style={{ ...glassCard, boxShadow: "0 4px 24px rgba(0,0,0,0.3)", opacity: 0.6 }}
              >
                <div className="flex items-start justify-between mb-6">
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-amber-900/20">
                    <BarChart3 size={22} className="text-amber-400" />
                  </div>
                  <span className="text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full"
                    style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.2)" }}>
                    {upsellDict?.statsBadge || "Bientôt"}
                  </span>
                </div>
                <p className="text-lg font-bold text-white mb-1">{upsellDict?.statsTitle || "Statistiques"}</p>
                <p className="text-sm text-white/30">{upsellDict?.statsSubtitle || "Vues, clics, performances"}</p>
              </motion.div>

            </div>
          </>
        ) : view === "list" ? (
          <>
            {/* Header liste */}
            <div className="flex items-end justify-between mb-10">
              <div>
                <h2 className="text-3xl font-bold text-white">{dict.myProperties}</h2>
                <div className="flex items-center gap-2 mt-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: brandColor }} />
                  <p className="text-sm text-white/30">
                    {properties.length} {properties.length <= 1 ? dict.published : dict.publishedPlural}
                  </p>
                </div>
              </div>
              <button type="button"
                onClick={() => { setEditing(null); setView("form"); }}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-black text-black transition-all hover:opacity-90 active:scale-[0.97]"
                style={{ backgroundColor: brandColor, boxShadow: `0 8px 24px ${brandColor}40` }}>
                <Plus size={18} strokeWidth={2.5} /> {dict.addProperty}
              </button>
            </div>

            {propLoading ? (
              /* Bento Skeleton */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : properties.length === 0 ? (
              <div className="text-center py-28 rounded-3xl" style={glassCard}>
                <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: `${brandColor}15` }}>
                  <Building2 size={32} style={{ color: brandColor }} />
                </div>
                <p className="text-white font-bold text-lg">{dict.noProperties}</p>
                <p className="text-sm text-white/30 mt-1">{dict.noPropertiesHint}</p>
                <button type="button"
                  onClick={() => { setEditing(null); setView("form"); }}
                  className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black text-black hover:opacity-90 transition-all"
                  style={{ backgroundColor: brandColor }}>
                  <Plus size={16} /> {dict.addProperty}
                </button>
              </div>
            ) : (
              /* Bento Grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 auto-rows-min">
                {properties.map((p, idx) => (
                  <div
                    key={p.id}
                    className={`group rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${idx === 0 ? "md:col-span-2" : ""}`}
                    style={{
                      ...glassCard,
                      boxShadow: "0 4px 24px rgba(0,0,0,0.3)",
                    }}
                  >
                    <div className={`relative overflow-hidden ${idx === 0 ? "aspect-[16/7]" : "aspect-[4/3]"} bg-white/5`}>
                      {p.images?.[0]
                        ? <img src={p.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={p.titre_fr} />
                        : <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                            <ImageIcon size={32} className="text-white/10" />
                          </div>
                      }
                      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)" }} />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-black/60 text-white backdrop-blur-sm">{p.type}</span>
                      </div>
                      {p.pool === "Oui" && (
                        <div className="absolute top-3 right-3">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-500/80 text-white backdrop-blur-sm">Pool</span>
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <p className="font-bold text-white text-sm leading-tight line-clamp-1 mb-1">{p.titre_fr || "(Sans titre)"}</p>
                      <div className="flex items-center gap-1 mb-3">
                        <MapPin size={11} className="text-white/20 shrink-0" />
                        <p className="text-xs text-white/30 truncate">{[p.town, p.region].filter(Boolean).join(", ") || "—"}</p>
                      </div>
                      <p className="text-xl font-black" style={{ color: brandColor }}>
                        {p.price ? Number(p.price).toLocaleString("fr-FR") + " €" : "—"}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-white/30 font-medium">
                        {p.beds > 0 && <span className="flex items-center gap-1"><BedDouble size={12} /> {p.beds}</span>}
                        {p.baths > 0 && <span className="flex items-center gap-1"><Bath size={12} /> {p.baths}</span>}
                        {p.surface_built && <span className="flex items-center gap-1"><Maximize2 size={12} /> {p.surface_built} m²</span>}
                      </div>
                      <div className="flex gap-2 mt-4 pt-4" style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                        <button type="button" onClick={() => { setEditing(p); setView("form"); }}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white/50 hover:text-white/80 transition-all">
                          <Pencil size={13} /> {dict.modify}
                        </button>
                        <button type="button" onClick={() => setDeleteId(p.id)}
                          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-900/10 hover:bg-red-900/20 text-xs font-bold text-red-400 transition-all">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="max-w-2xl mx-auto">
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white">{editing?.id ? dict.editProperty : dict.newProperty}</h2>
              <p className="text-sm text-white/30 mt-1">{dict.fillInfo}</p>
            </div>
            <div className="rounded-3xl p-8" style={glassCard}>
              <PropertyForm
                initial={editing}
                agencyId={session.agencyId}
                slug={slug}
                brandColor={brandColor}
                dict={dict}
                onSaved={() => { setView("list"); setEditing(null); loadProperties(); }}
                onCancel={() => { setView("list"); setEditing(null); }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Modale suppression */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-6" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
          <div className="rounded-3xl p-8 max-w-sm w-full" style={{ ...glassCard, boxShadow: "0 40px 80px rgba(0,0,0,0.6)" }}>
            <div className="w-14 h-14 rounded-2xl bg-red-900/20 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-400" />
            </div>
            <h3 className="text-center font-bold text-white text-lg mb-1">{dict.deleteTitle}</h3>
            <p className="text-center text-sm text-white/30 mb-7">{dict.deleteWarning}</p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setDeleteId(null)}
                className="flex-1 py-3.5 rounded-2xl border border-white/10 text-sm font-bold text-white/40 hover:bg-white/5 transition-all">
                {dict.cancel}
              </button>
              <button type="button" onClick={() => handleDelete(deleteId)} disabled={deleting}
                className="flex-1 py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold flex items-center justify-center gap-2 transition-all">
                {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                {dict.delete}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale changement mot de passe */}
      {showChangePw && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-6" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
          <div className="rounded-3xl p-8 max-w-sm w-full" style={{ ...glassCard, boxShadow: "0 40px 80px rgba(0,0,0,0.6)" }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-white text-lg">{dict.changePwTitle}</h3>
              <button type="button" onClick={() => { setShowChangePw(false); setCpMsg(null); }}
                className="p-2 hover:bg-white/5 rounded-xl transition-all">
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
                className="w-full py-4 rounded-2xl text-sm font-black flex items-center justify-center gap-2 transition-all hover:opacity-90"
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
