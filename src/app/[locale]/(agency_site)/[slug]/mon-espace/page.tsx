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
  Lock, Zap, Clock, ChevronRight, Star, Settings, Sun, Moon,
  Bot, Languages, Search, Video,
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

type PmSession = { agencyId: string; slug: string; exp: number; token?: string };

const WEBSITE_TEMPLATES = [
  {
    id: "luxury-light",
    labelFr: "Luxe clair",
    labelEn: "Light luxury",
    descriptionFr: "Fond clair, or doux, vignettes elegantes.",
    descriptionEn: "Light background, soft gold, elegant cards.",
    primary_color: "#C8A84E",
    button_color: "#D4AF37",
    button_style: "rounded-full",
    layout: {
      property_card_style: "editorial",
      property_card_corners: "rounded",
      property_card_icon_color: "#C8A84E",
      results_bg_color: "#F8FAFC",
    },
    hero: { alignment: "center", overlay_opacity: 30 },
  },
  {
    id: "modern-contrast",
    labelFr: "Moderne contraste",
    labelEn: "Modern contrast",
    descriptionFr: "Style premium sombre, violet et cartes compactes.",
    descriptionEn: "Premium dark style, violet accents and compact cards.",
    primary_color: "#B859C5",
    button_color: "#B859C5",
    button_style: "rounded-full",
    layout: {
      property_card_style: "compact",
      property_card_corners: "rounded",
      property_card_icon_color: "#B859C5",
      results_bg_color: "#F3F4F6",
    },
    hero: { alignment: "left", overlay_opacity: 45 },
  },
  {
    id: "minimal-square",
    labelFr: "Minimal carre",
    labelEn: "Minimal square",
    descriptionFr: "Presentation sobre, bords droits, accent bleu.",
    descriptionEn: "Clean layout, square edges, blue accent.",
    primary_color: "#2563EB",
    button_color: "#0F172A",
    button_style: "rounded-none",
    layout: {
      property_card_style: "minimal",
      property_card_corners: "square",
      property_card_icon_color: "#2563EB",
      results_bg_color: "#FFFFFF",
    },
    hero: { alignment: "right", overlay_opacity: 25 },
  },
] as const;

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
  listing_type?: "sale" | "rent";
  rental_period?: string | null;
  pool: string;
  images: string[];
  video_url?: string;
  description_fr: string;
  description_en: string;
};

const PROPERTY_TYPES = ["Villa", "Appartement", "Penthouse", "Bungalow", "Maison", "Terrain", "Commercial"];

const emptyForm = {
  titre_fr: "", titre_en: "", price: "", town: "", region: "",
  beds: "", baths: "", surface_built: "", type: "Villa",
  listing_type: "sale", rental_period: "month",
  pool: "Non", video_url: "", description_fr: "", description_en: "",
};

// --- Skeleton Loader -----------------------------------------------------------
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

// --- Form components -----------------------------------------------------------
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
  initial, agencyId, pmToken, slug, brandColor, dict, immersiveEnabled, onSaved, onCancel,
}: {
  initial?: Partial<Property> | null;
  agencyId: string;
  pmToken: string;
  slug: string;
  brandColor: string;
  dict: any;
  immersiveEnabled: boolean;
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
      ...(initial?.id ?{ id: initial.id } : {}),
    };
    const res = await fetch("/api/property-manager/properties", {
      method: initial?.id ?"PUT" : "POST",
      headers: { "Content-Type": "application/json", "x-pm-session": pmToken },
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <FieldInput label="Transaction">
              <div className="grid grid-cols-2 gap-2">
                {[
                  { value: "sale", label: "Vente" },
                  { value: "rent", label: "Location" },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => set("listing_type", option.value)}
                    className={`rounded-2xl border px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                      form.listing_type === option.value
                        ? "border-white/25 bg-white/15 text-white"
                        : "border-white/[0.07] bg-white/[0.03] text-white/35 hover:text-white/70"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </FieldInput>
            <FieldInput label={dict.price} icon={<Euro size={11} />}>
              <div className="relative">
                <input type="number" placeholder="350 000" value={form.price}
                  onChange={(e) => set("price", e.target.value)} className={`${inputCls} pr-8`} />
                <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-white/20 font-bold">
                  {form.listing_type === "rent" ? "EUR/mois" : "EUR"}
                </span>
              </div>
            </FieldInput>
            {form.listing_type === "rent" && (
              <FieldInput label="Periode de location">
                <div className="relative">
                  <select value={form.rental_period || "month"} onChange={(e) => set("rental_period", e.target.value)}
                    className={`${inputCls} appearance-none pr-9 cursor-pointer`}>
                    <option value="month" className="bg-[#1a1a1a]">Par mois</option>
                    <option value="week" className="bg-[#1a1a1a]">Par semaine</option>
                    <option value="day" className="bg-[#1a1a1a]">Par jour</option>
                  </select>
                  <ChevronDown size={14} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-white/20 pointer-events-none" />
                </div>
              </FieldInput>
            )}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
        <SectionHeader icon={<LayoutGrid size={15} />} label="Caracteristiques" color={brandColor} />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
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
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-white/20 font-bold">m2</span>
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
                    ?{ backgroundColor: brandColor, color: "#000", border: "1px solid transparent" }
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
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 mb-3">
            {images.map((url, i) => (
              <div key={i} className={`relative group rounded-2xl overflow-hidden bg-white/5 ${i === 0 ?"col-span-2 row-span-2 aspect-[4/3]" : "aspect-square"}`}>
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
            ?<Loader2 size={20} className="animate-spin" />
            : <div className="w-10 h-10 rounded-2xl bg-white/5 group-hover:bg-white/10 flex items-center justify-center transition-all">
                <Upload size={18} />
              </div>
          }
          <span className="text-sm font-semibold">{uploading ?dict.uploading : dict.addPhotos}</span>
          {!uploading && <span className="text-xs text-white/20">JPG, PNG, WEBP</span>}
        </button>
        <input ref={fileRef} type="file" multiple accept="image/*" className="hidden"
          onChange={(e) => e.target.files && handleUpload(e.target.files)} />
      </div>

      {immersiveEnabled && (
        <div>
          <SectionHeader icon={<Video size={15} />} label={dict.immersiveTour || "Visite immersive"} color={brandColor} />
          <FieldInput label={dict.immersiveUrl || "Lien visite virtuelle / video 360"}>
            <input
              type="url"
              placeholder="https://my.matterport.com/show/?m=..."
              value={form.video_url || ""}
              onChange={(e) => set("video_url", e.target.value)}
              className={inputCls}
            />
          </FieldInput>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-white/20">
            {dict.immersiveHint || "Matterport, Kuula, 3D Vista, CloudPano, YouTube, Vimeo ou URL embed."}
          </p>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 p-3.5 rounded-2xl border border-red-900/30 bg-red-900/10">
          <AlertCircle size={14} className="text-red-400 shrink-0" />
          <p className="text-xs text-red-400 font-semibold">{error}</p>
        </div>
      )}

      <div className="sticky bottom-0 -mx-4 sm:-mx-8 px-4 sm:px-8 py-5 border-t border-white/[0.06] flex flex-col sm:flex-row gap-3 rounded-b-3xl"
        style={{ background: "rgba(17,17,17,0.95)", backdropFilter: "blur(12px)" }}>
        <button type="button" onClick={onCancel}
          className="px-6 py-3.5 rounded-2xl border border-white/10 text-sm font-bold text-white/40 hover:bg-white/5 transition-all whitespace-nowrap">
          {dict.cancel}
        </button>
        <button type="button" onClick={handleSave} disabled={saving}
          className="flex-1 py-3.5 rounded-2xl text-sm font-black flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ backgroundColor: brandColor, color: "#000", boxShadow: `0 8px 24px ${brandColor}40` }}>
          {saving ?<Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {initial?.id ?dict.save : dict.addProperty}
        </button>
      </div>
    </div>
  );
}

// --- Trial helpers -------------------------------------------------------------
function getTrialInfo(agency: any): { isExpired: boolean; daysLeft: number; expiresAt: Date | null } {
  const sub = agency?.footer_config?.subscription;
  const trialExpiresAt = agency?.trial_expires_at || sub?.trial_expires_at;
  if (!trialExpiresAt) return { isExpired: false, daysLeft: 15, expiresAt: null };
  const expiresAt = new Date(trialExpiresAt);
  if (Number.isNaN(expiresAt.getTime())) return { isExpired: false, daysLeft: 15, expiresAt: null };
  const msLeft = expiresAt.getTime() - Date.now();
  const daysLeft = Math.ceil(msLeft / (1000 * 60 * 60 * 24));
  return { isExpired: daysLeft <= 0, daysLeft: Math.max(0, daysLeft), expiresAt };
}

// --- Trial Banner --------------------------------------------------------------
function TrialBanner({ daysLeft, brandColor, dict }: { daysLeft: number; brandColor: string; dict: any }) {
  const pct = Math.min(100, Math.round((daysLeft / 15) * 100));
  const urgent = daysLeft <= 3;
  const color = urgent ?"#ef4444" : brandColor;

  const label = daysLeft === 0
    ?dict?.expiresToday || "Expire aujourd'hui"
    : daysLeft === 1
    ?dict?.dayLeft || "1 jour restant"
    : (dict?.daysLeft || "{days} jours restants").replace("{days}", String(daysLeft));

  return (
    <div className="mx-4 sm:mx-6 my-3 rounded-2xl px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
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
      <button className="text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl transition-all hover:opacity-80 shrink-0 text-black self-start sm:self-auto"
        style={{ backgroundColor: color }}>
        {dict?.upgradeBtn || "Upgrade"}
      </button>
    </div>
  );
}

// --- Page principale -----------------------------------------------------------
export default function MonEspacePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const locale = (params?.locale as string) || "fr";
  const dict = (dicts[locale] || dicts.fr).propertyManager;
  const leadsCrmDict = (dicts[locale] || dicts.fr).leadsCrm;
  const trialDict = (dicts[locale] || dicts.fr).trial;
  const upsellDict = (dicts[locale] || dicts.fr).upsell;
  const settingsTile = locale === "fr"
    ?{ title: "Parametres", subtitle: "Identite, couleurs, equipe..." }
    : { title: "Settings", subtitle: "Identity, colors, team..." };
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
  const [showModules, setShowModules] = useState(false);
  const [homePanel, setHomePanel] = useState<"properties" | "leads" | "modules" | "website" | "settings" | "stats">("properties");
  const [moduleRequestLoading, setModuleRequestLoading] = useState<string | null>(null);
  const [moduleRequestMsg, setModuleRequestMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [layoutSaving, setLayoutSaving] = useState(false);
  const [layoutMsg, setLayoutMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [isDark, setIsDark] = useState(true);

  const [showChangePw, setShowChangePw] = useState(false);
  const [cpCurrent, setCpCurrent] = useState("");
  const [cpNew, setCpNew] = useState("");
  const [cpConfirm, setCpConfirm] = useState("");
  const [cpLoading, setCpLoading] = useState(false);
  const [cpMsg, setCpMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const brandColor = agency?.primary_color || "#D4AF37";
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
    setMode(agency.property_manager_password ?"login" : "create");
  }, [agency]);

  const loadProperties = useCallback(async () => {
    if (!session) return;
    setPropLoading(true);
    const res = await fetch(`/api/property-manager/properties?agency_id=${session.agencyId}`, {
      headers: { "x-pm-session": session.token || "" },
    });
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
      body: JSON.stringify({ action: mode === "create" ?"set-password" : "login", slug, password }),
    });
    const data = await res.json();
    setAuthLoading(false);
    if (!data.success) { setAuthError(data.error || "Erreur"); return; }
    const s: PmSession = { agencyId: String(data.agencyId || agency.id), slug, exp: Date.now() + SESSION_DURATION, token: data.token };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
    setSession(s);
  };

  const handleLogout = () => { sessionStorage.removeItem(SESSION_KEY); setSession(null); setProperties([]); };

  const handleDelete = async (id: number) => {
    if (!session) return;
    setDeleting(true);
    await fetch(`/api/property-manager/properties?id=${id}&agency_id=${session.agencyId}`, {
      method: "DELETE",
      headers: { "x-pm-session": session.token || "" },
    });
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

  const requestModule = async (module: any) => {
    if (!agency?.id) return;
    setModuleRequestLoading(module.id);
    setModuleRequestMsg(null);

    const footerConfig = agency.footer_config || {};
    const agencyEmail = footerConfig.client_email || footerConfig.contact_email || footerConfig.email || "";

    try {
      const res = await fetch("/api/admin/request-module", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agencyId: agency.id,
          agencyName: agency.agency_name || slug,
          agencyEmail,
          moduleId: module.id,
          moduleName: module.name,
          modulePrice: module.price,
          locale,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || data.success === false) throw new Error(data.error || "Erreur lors de la demande");
      setModuleRequestMsg({ type: "ok", text: "Demande envoyee. Notre equipe vous contactera pour le paiement." });
    } catch (err: any) {
      setModuleRequestMsg({ type: "err", text: err.message || "Impossible d'envoyer la demande." });
    } finally {
      setModuleRequestLoading(null);
    }
  };

  const glassCard = {
    background: isDark
      ? "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)"
      : "linear-gradient(135deg, rgba(255,255,255,0.96) 0%, rgba(248,250,252,0.9) 100%)",
    border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(15,23,42,0.10)",
    backdropFilter: "blur(12px)",
  };

  const inputCls = "w-full px-4 py-3.5 rounded-2xl border text-sm text-white placeholder:text-white/20 focus:outline-none transition-all bg-white/[0.04] border-white/[0.07] focus:border-white/20";
  const footerConfig = (() => {
    if (!agency?.footer_config) return {};
    if (typeof agency.footer_config === "string") {
      try { return JSON.parse(agency.footer_config); } catch { return {}; }
    }
    return agency.footer_config;
  })();
  const integrations = footerConfig?.integrations || {};
  const allowedLangs = footerConfig?.allowed_langs || [];
  const propertiesPerRow = footerConfig?.layout?.properties_per_row === 4 ? 4 : 3;
  const propertyCardCorners = footerConfig?.layout?.property_card_corners === "square" ? "square" : "rounded";
  const propertyCardIconColor = footerConfig?.layout?.property_card_icon_color || brandColor;
  const propertyCardStyle = ["compact", "editorial", "minimal"].includes(footerConfig?.layout?.property_card_style)
    ? footerConfig.layout.property_card_style
    : "classic";
  const resultsBgColor = footerConfig?.layout?.results_bg_color || "#f8fafc";
  const heroSubtitle = footerConfig?.hero?.subtitle || "";
  const heroCtaText = footerConfig?.hero?.cta_text || "";
  const heroAlignment = ["left", "center", "right"].includes(footerConfig?.hero?.alignment) ? footerConfig.hero.alignment : "center";
  const heroOverlayOpacity = typeof footerConfig?.hero?.overlay_opacity === "number" ? footerConfig.hero.overlay_opacity : 30;
  const firstPropertyImage = properties.find((property) => property.images?.[0])?.images?.[0] || "";
  const heroPreviewImage = agency?.hero_type !== "video" ? agency?.hero_url : "";
  const makeVisualTileStyle = (imageUrl: string | undefined, accent: string, opacity = 0.58) => ({
    ...glassCard,
    backgroundImage: imageUrl
      ? isDark
        ? `linear-gradient(135deg, rgba(8,10,18,${opacity}) 0%, rgba(8,10,18,0.92) 72%), url("${imageUrl}")`
        : `linear-gradient(135deg, rgba(255,255,255,0.88) 0%, rgba(248,250,252,0.78) 74%), url("${imageUrl}")`
      : isDark
        ? `radial-gradient(circle at 18% 12%, ${accent}40, transparent 34%), linear-gradient(135deg, rgba(255,255,255,0.06), rgba(255,255,255,0.02))`
        : `radial-gradient(circle at 18% 12%, ${accent}22, transparent 34%), linear-gradient(135deg, rgba(255,255,255,0.98), rgba(248,250,252,0.9))`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    boxShadow: isDark
      ? `0 18px 50px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.08)`
      : `0 18px 45px rgba(15,23,42,0.10), inset 0 1px 0 rgba(255,255,255,0.9)`,
  });
  const premiumPanelStyle = (accent = brandColor) => ({
    ...glassCard,
    background: `radial-gradient(circle at 10% 0%, ${accent}24, transparent 34%), linear-gradient(135deg, rgba(255,255,255,0.065), rgba(255,255,255,0.025))`,
    boxShadow: "0 22px 70px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.08)",
  });

  const updateFooterSectionSetting = async (section: "layout" | "hero", field: string, value: any) => {
    if (!session || !agency?.id || layoutSaving) return;
    setLayoutSaving(true);
    setLayoutMsg(null);
    const nextFooterConfig = {
      ...footerConfig,
      [section]: {
        ...(footerConfig[section] || {}),
        [field]: value,
      },
    };
    try {
      const res = await fetch("/api/property-manager/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-pm-session": session.token || "" },
        body: JSON.stringify({
          slug,
          agencyId: session.agencyId,
          data: {
            footer_config: nextFooterConfig,
            updated_at: new Date().toISOString(),
          },
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error(json.error || "Erreur sauvegarde");
      setAgency(json.agency || { ...agency, footer_config: nextFooterConfig });
      setLayoutMsg({ type: "ok", text: locale === "fr" ? "Affichage mis a jour." : "Display updated." });
    } catch (err: any) {
      setLayoutMsg({ type: "err", text: err.message || (locale === "fr" ? "Sauvegarde impossible." : "Could not save.") });
    } finally {
      setLayoutSaving(false);
      setTimeout(() => setLayoutMsg(null), 3000);
    }
  };

  const applyWebsiteTemplate = async (template: typeof WEBSITE_TEMPLATES[number]) => {
    if (!session || !agency?.id || layoutSaving) return;
    setLayoutSaving(true);
    setLayoutMsg(null);
    const nextFooterConfig = {
      ...footerConfig,
      layout: { ...(footerConfig.layout || {}), ...template.layout },
      hero: { ...(footerConfig.hero || {}), ...template.hero },
    };
    try {
      const res = await fetch("/api/property-manager/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-pm-session": session.token || "" },
        body: JSON.stringify({
          slug,
          agencyId: session.agencyId,
          data: {
            primary_color: template.primary_color,
            button_color: template.button_color,
            button_style: template.button_style,
            footer_config: nextFooterConfig,
            updated_at: new Date().toISOString(),
          },
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error(json.error || "Erreur sauvegarde");
      setAgency(json.agency || {
        ...agency,
        primary_color: template.primary_color,
        button_color: template.button_color,
        button_style: template.button_style,
        footer_config: nextFooterConfig,
      });
      setLayoutMsg({ type: "ok", text: locale === "fr" ? "Template applique." : "Template applied." });
    } catch (err: any) {
      setLayoutMsg({ type: "err", text: err.message || (locale === "fr" ? "Sauvegarde impossible." : "Could not save.") });
    } finally {
      setLayoutSaving(false);
      setTimeout(() => setLayoutMsg(null), 3000);
    }
  };

  const updatePropertiesPerRow = async (value: 3 | 4) => {
    if (!session || !agency?.id || layoutSaving || value === propertiesPerRow) return;
    setLayoutSaving(true);
    setLayoutMsg(null);
    const nextFooterConfig = {
      ...footerConfig,
      layout: {
        ...(footerConfig.layout || {}),
        properties_per_row: value,
      },
    };
    try {
      const res = await fetch("/api/property-manager/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-pm-session": session.token || "" },
        body: JSON.stringify({
          slug,
          agencyId: session.agencyId,
          data: {
            footer_config: nextFooterConfig,
            updated_at: new Date().toISOString(),
          },
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error(json.error || "Erreur sauvegarde");
      setAgency(json.agency || { ...agency, footer_config: nextFooterConfig });
      setLayoutMsg({ type: "ok", text: locale === "fr" ? "Affichage mis a jour." : "Display updated." });
    } catch (err: any) {
      setLayoutMsg({ type: "err", text: err.message || (locale === "fr" ? "Sauvegarde impossible." : "Could not save.") });
    } finally {
      setLayoutSaving(false);
      setTimeout(() => setLayoutMsg(null), 3000);
    }
  };

  const updatePropertyCardCorners = async (value: "rounded" | "square") => {
    if (!session || !agency?.id || layoutSaving || value === propertyCardCorners) return;
    setLayoutSaving(true);
    setLayoutMsg(null);
    const nextFooterConfig = {
      ...footerConfig,
      layout: {
        ...(footerConfig.layout || {}),
        property_card_corners: value,
      },
    };
    try {
      const res = await fetch("/api/property-manager/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-pm-session": session.token || "" },
        body: JSON.stringify({
          slug,
          agencyId: session.agencyId,
          data: {
            footer_config: nextFooterConfig,
            updated_at: new Date().toISOString(),
          },
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error(json.error || "Erreur sauvegarde");
      setAgency(json.agency || { ...agency, footer_config: nextFooterConfig });
      setLayoutMsg({ type: "ok", text: locale === "fr" ? "Affichage mis a jour." : "Display updated." });
    } catch (err: any) {
      setLayoutMsg({ type: "err", text: err.message || (locale === "fr" ? "Sauvegarde impossible." : "Could not save.") });
    } finally {
      setLayoutSaving(false);
      setTimeout(() => setLayoutMsg(null), 3000);
    }
  };

  const updatePropertyCardIconColor = async (value: string) => {
    if (!session || !agency?.id || layoutSaving || value === propertyCardIconColor) return;
    setLayoutSaving(true);
    setLayoutMsg(null);
    const nextFooterConfig = {
      ...footerConfig,
      layout: {
        ...(footerConfig.layout || {}),
        property_card_icon_color: value,
      },
    };
    try {
      const res = await fetch("/api/property-manager/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-pm-session": session.token || "" },
        body: JSON.stringify({
          slug,
          agencyId: session.agencyId,
          data: {
            footer_config: nextFooterConfig,
            updated_at: new Date().toISOString(),
          },
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) throw new Error(json.error || "Erreur sauvegarde");
      setAgency(json.agency || { ...agency, footer_config: nextFooterConfig });
      setLayoutMsg({ type: "ok", text: locale === "fr" ? "Affichage mis a jour." : "Display updated." });
    } catch (err: any) {
      setLayoutMsg({ type: "err", text: err.message || (locale === "fr" ? "Sauvegarde impossible." : "Could not save.") });
    } finally {
      setLayoutSaving(false);
      setTimeout(() => setLayoutMsg(null), 3000);
    }
  };

  const extraLangCount = Array.isArray(allowedLangs) ?Math.max(0, allowedLangs.length - 1) : 0;
  const moduleCatalog = [
    {
      id: "chatbot",
      name: "Chatbot IA",
      price: "39 EUR / mois",
      description: "Assistant IA pour qualifier les demandes et repondre aux visiteurs.",
      active: integrations.chatbot_enabled === true,
      status: "Disponible",
      icon: Bot,
      color: "#a855f7",
    },
    {
      id: "mini-crm",
      name: "Mini CRM Leads",
      price: "Gratuit",
      description: "Suivi simple des leads recus depuis le site de l'agence.",
      active: integrations.leads_enabled === true,
      status: "Inclus",
      icon: TrendingUp,
      color: "#22c55e",
    },
    {
      id: "languages",
      name: "Langues supplementaires",
      price: "2 EUR / langue / mois",
      description: extraLangCount > 0
        ?`${extraLangCount} langue${extraLangCount > 1 ?"s" : ""} supplementaire${extraLangCount > 1 ?"s" : ""} active${extraLangCount > 1 ?"s" : ""}.`
        : "Ajoutez EN, NL, ES, DE, PL ou d'autres langues selon vos besoins.",
      active: extraLangCount > 0,
      status: "Disponible",
      icon: Languages,
      color: "#38bdf8",
      requestableWhenActive: true,
    },
    {
      id: "seo",
      name: "Module SEO",
      price: "19 EUR / mois",
      description: "Optimisations SEO, metas et structure de pages. Developpement prevu plus tard.",
      active: false,
      status: "Bientot",
      icon: Search,
      color: "#f59e0b",
      comingSoon: true,
    },
    {
      id: "hero-video",
      name: "Video hero",
      price: "9 EUR / mois",
      description: "Remplacez l'image de couverture par une video sur la homepage.",
      active: integrations.hero_video_enabled === true,
      status: "Disponible",
      icon: Video,
      color: "#ec4899",
    },
    {
      id: "immersive-tours",
      name: "Visites immersives",
      price: "29 EUR / mois",
      description: "Ajoutez des liens Matterport, Kuula, 3D Vista, CloudPano ou videos 360 sur les fiches biens.",
      active: integrations.immersive_tours_enabled === true,
      status: "Disponible",
      icon: Video,
      color: "#14b8a6",
    },
    {
      id: "crm-sync",
      name: "Sync CRM externe",
      price: "29 EUR / mois",
      description: "Connexion future vers Zoho, HubSpot ou autre CRM externe.",
      active: integrations.crm_enabled === true,
      status: "Disponible",
      icon: Zap,
      color: "#6366f1",
    },
  ];

  // -- Loading --
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

  // -- Module non active --
  const pmEnabled = agency.property_manager_enabled || agency.footer_config?.integrations?.property_manager_enabled;
  if (!pmEnabled) return (
    <div className="min-h-screen flex items-center justify-center bg-[#0d0d0d] px-6" dir={isRtl ?"rtl" : "ltr"} style={{ fontFamily: `${fontFamily}, sans-serif` }}>
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

  // -- Auth --
  if (!session) return (
    <div
      className="min-h-screen flex items-center justify-center px-6 relative overflow-hidden"
      dir={isRtl ?"rtl" : "ltr"}
      style={{ fontFamily: `${fontFamily}, sans-serif`, background: "#0d0d0d" }}
    >
      <div className="absolute inset-0 opacity-[0.08]" style={{ backgroundImage: `radial-gradient(circle at 50% 40%, ${brandColor} 0%, transparent 60%)` }} />
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          {agency.logo_url
            ?<img src={agency.logo_url} alt={agency.agency_name} className="h-14 mx-auto mb-5 object-contain" />
            : <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 text-black text-2xl font-bold" style={{ backgroundColor: brandColor }}>{agency.agency_name?.charAt(0)}</div>
          }
          <h1 className="text-2xl font-bold text-white">{dict.title}</h1>
          <p className="text-sm text-white/30 mt-1">{mode === "create" ?dict.welcome : agency.agency_name}</p>
        </div>

        <div className="rounded-3xl p-8 space-y-5" style={glassCard}>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-white/30">
              {mode === "create" ?dict.createPwLabel : dict.pwLabel}
            </label>
            <div className="relative">
              <input type={showPw ?"text" : "password"} value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAuth()}
                placeholder="********"
                className={inputCls} />
              <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors">
                {showPw ?<EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {mode === "create" && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-white/30">{dict.confirmLabel}</label>
              <input type="password" value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleAuth()}
                placeholder="********"
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
            {authLoading ?<Loader2 size={16} className="animate-spin" /> : <Key size={16} />}
            {mode === "create" ?dict.createBtn : dict.loginBtn}
          </button>
        </div>
      </div>
    </div>
  );

  // -- Settings --
  if (view === "settings") return (
    <ClientDashboard
      agency={agency}
      slug={slug as string}
      agencyId={session!.agencyId}
      pmToken={session!.token || ""}
      locale={locale as string}
      onBack={() => setView("dashboard")}
      onSaved={(updated) => { setAgency(updated); setView("dashboard"); }}
    />
  );

  // -- Dashboard --
  return (
    <div className={`min-h-screen ${isDark ? "pm-dark bg-[#0d0d0d]" : "pm-light bg-slate-100"}`} dir={isRtl ?"rtl" : "ltr"} style={{ fontFamily: `${fontFamily}, sans-serif` }}>
      <style jsx global>{`
        .pm-light [class*="text-white"] { color: #0f172a !important; }
        .pm-light [class*="text-white/"] { color: rgba(15, 23, 42, 0.62) !important; }
        .pm-light .pm-header [class*="text-white"] { color: #0f172a !important; }
        .pm-dark .pm-header [class*="text-white"] { color: rgba(255,255,255,0.76) !important; }
        .pm-dark .pm-header .pm-header-title { color: #fff !important; }
        .pm-dark .pm-header .pm-header-muted { color: rgba(255,255,255,0.38) !important; }
        .pm-light .pm-dashboard-tile .pm-tile-bottom-fade {
          background: linear-gradient(to top, rgba(255,255,255,0.82), rgba(255,255,255,0)) !important;
          opacity: 1 !important;
        }
        .pm-light .pm-dashboard-tile .pm-tile-pill {
          background: rgba(255,255,255,0.86) !important;
          border-color: rgba(15,23,42,0.10) !important;
          box-shadow: 0 8px 22px rgba(15,23,42,0.08);
        }
        .pm-light [class*="bg-white/"] { background-color: rgba(15, 23, 42, 0.045) !important; }
        .pm-light [class*="border-white/"] { border-color: rgba(15, 23, 42, 0.10) !important; }
        .pm-light input, .pm-light textarea, .pm-light select {
          color: #0f172a !important;
          background-color: rgba(255,255,255,0.82) !important;
          border-color: rgba(15,23,42,0.12) !important;
        }
        .pm-light input::placeholder, .pm-light textarea::placeholder { color: rgba(15,23,42,0.35) !important; }
      `}</style>

      {/* Header */}
      <div
        className="pm-header sticky top-0 z-50 px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3"
        style={isDark
          ? { background: "rgba(13,13,13,0.9)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }
          : { background: "rgba(255,255,255,0.95)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(15,23,42,0.08)" }
        }
      >
        <div className="flex items-center gap-3 w-full sm:w-auto min-w-0">
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
            ?<img src={agency.logo_url} alt={agency.agency_name} className="h-8 object-contain" />
            : <div className="w-9 h-9 rounded-xl flex items-center justify-center text-black font-bold" style={{ backgroundColor: brandColor }}>{agency.agency_name?.charAt(0)}</div>
          }
          <div className="min-w-0">
            <p className="pm-header-title text-sm font-bold text-white truncate">{agency.agency_name}</p>
            <p className="pm-header-muted text-[10px] text-white/25 uppercase tracking-widest font-bold">{dict.badge}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button type="button" onClick={() => setShowChangePw(true)}
            className="flex flex-1 sm:flex-none items-center justify-center gap-1.5 px-3 sm:px-4 py-2 rounded-full border border-white/10 text-xs font-bold text-white/50 hover:bg-white/5 transition-all">
            <Key size={13} /> <span className="truncate">{dict.changePwBtn}</span>
          </button>
          <button type="button" onClick={toggleTheme}
            className="flex flex-1 sm:flex-none items-center justify-center gap-1.5 px-3 sm:px-4 py-2 rounded-full border border-white/10 text-xs font-bold text-white/50 hover:bg-white/5 transition-all"
            title={isDark ? "Mode jour" : "Mode nuit"}>
            {isDark ? <Sun size={13} /> : <Moon size={13} />}
            <span className="truncate">{isDark ? "Jour" : "Nuit"}</span>
          </button>
          <button type="button" onClick={handleLogout}
            className="flex flex-1 sm:flex-none items-center justify-center gap-1.5 px-3 sm:px-4 py-2 rounded-full border border-white/10 text-xs font-bold text-white/50 hover:bg-red-900/20 hover:border-red-900/40 hover:text-red-400 transition-all">
            <LogOut size={13} /> <span className="truncate">{dict.logout}</span>
          </button>
        </div>
      </div>

      {/* Trial Banner - shown in dashboard and list views */}
      {view !== "form" && (() => {
        const { daysLeft } = getTrialInfo(agency);
        return <TrialBanner daysLeft={daysLeft} brandColor={brandColor} dict={trialDict} />;
      })()}

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {view === "dashboard" ?(
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

            <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-5">
              <motion.nav
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                className="rounded-3xl p-3"
                style={glassCard}
              >
                {[
                  { id: "properties", title: upsellDict?.propertiesTitle || "Mes Proprietes", subtitle: `${properties.length} ${properties.length <= 1 ?dict.published : dict.publishedPlural}`, icon: Building2, color: brandColor, visible: true },
                  { id: "leads", title: leadsCrmDict?.title || "Mini CRM Leads", subtitle: integrations.leads_enabled === true ? "Module actif" : "Module inactif", icon: TrendingUp, color: "#22c55e", visible: integrations.leads_enabled === true },
                  { id: "modules", title: "Modules disponibles", subtitle: "Options premium", icon: Zap, color: "#B859C5", visible: true },
                  { id: "website", title: upsellDict?.siteTitle || "Mon Site Vitrine", subtitle: agency?.footer_config?.subscription?.website_active === true ? "Site actif" : "Non publie", icon: Globe, color: "#38BDF8", visible: agency?.footer_config?.subscription?.website_active === true },
                  { id: "settings", title: settingsTile.title, subtitle: settingsTile.subtitle, icon: Settings, color: "#94A3B8", visible: true },
                  { id: "stats", title: upsellDict?.statsTitle || "Statistiques", subtitle: upsellDict?.statsBadge || "Bientot", icon: BarChart3, color: "#f59e0b", visible: true },
                ].filter(item => item.visible).map((item) => {
                  const Icon = item.icon;
                  const active = homePanel === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setHomePanel(item.id as any)}
                      className={`w-full flex items-center gap-3 rounded-2xl p-4 text-left transition-all ${active ? "bg-white/10" : "hover:bg-white/[0.05]"}`}
                      style={active ? { boxShadow: `inset 3px 0 0 ${item.color}` } : undefined}
                    >
                      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-white/10" style={{ backgroundColor: `${item.color}20`, color: item.color }}>
                        <Icon size={19} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-black text-white">{item.title}</span>
                        <span className="mt-0.5 block truncate text-[10px] font-bold uppercase tracking-widest text-white/35">{item.subtitle}</span>
                      </span>
                      <ChevronRight size={16} className={`shrink-0 transition-all ${active ? "text-white/70" : "text-white/20"}`} />
                    </button>
                  );
                })}
              </motion.nav>

              <motion.section
                key={homePanel}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="pm-dashboard-tile relative min-h-[420px] overflow-hidden rounded-3xl p-6 sm:p-8"
                style={homePanel === "properties"
                  ? makeVisualTileStyle(firstPropertyImage || heroPreviewImage, brandColor, 0.5)
                  : homePanel === "website"
                    ? makeVisualTileStyle(heroPreviewImage || firstPropertyImage, "#38BDF8", 0.55)
                    : homePanel === "settings"
                      ? makeVisualTileStyle(agency.logo_url, "#94A3B8", 0.72)
                      : { ...glassCard, boxShadow: isDark ? "0 4px 24px rgba(0,0,0,0.3)" : "0 18px 45px rgba(15,23,42,0.08)" }
                }
              >
                <div className="absolute inset-0 opacity-40" style={{ background: `radial-gradient(circle at 85% 15%, ${brandColor}22, transparent 34%)` }} />
                <div className="relative flex h-full min-h-[360px] flex-col justify-between">
                  {homePanel === "properties" && (
                    <>
                      <div>
                        <div className="mb-8 flex items-center justify-between">
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 backdrop-blur-md" style={{ backgroundColor: `${brandColor}25` }}>
                            <Building2 size={24} style={{ color: brandColor }} />
                          </div>
                          <span className="rounded-full border border-white/10 bg-black/25 px-3 py-1.5 text-xs font-bold text-white/70 backdrop-blur-md">
                            {properties.length} {properties.length <= 1 ?dict.published : dict.publishedPlural}
                          </span>
                        </div>
                        <p className="text-3xl font-black text-white">{upsellDict?.propertiesTitle || "Mes Proprietes"}</p>
                        <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/60">{upsellDict?.propertiesSubtitle || "Gerez votre catalogue, ajoutez des biens et gardez vos annonces a jour."}</p>
                      </div>
                      <button type="button" onClick={() => { loadProperties(); setView("list"); }} className="mt-8 inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-black text-black transition-all hover:opacity-90" style={{ backgroundColor: brandColor }}>
                        <Building2 size={16} /> {upsellDict?.viewModule || "Acceder"}
                      </button>
                    </>
                  )}

                  {homePanel === "leads" && (
                    <>
                      <div>
                        <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl" style={{ backgroundColor: `${brandColor}20` }}>
                          <TrendingUp size={24} style={{ color: brandColor }} />
                        </div>
                        <p className="text-3xl font-black text-white">{leadsCrmDict?.title || "Mini CRM Leads"}</p>
                        <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/60">{leadsCrmDict?.noLeadsHint || "Les leads apparaissent ici des qu'un visiteur remplit le formulaire chatbot."}</p>
                      </div>
                      <a href={`/${locale}/${slug}/mes-leads`} className="mt-8 inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-black text-black transition-all hover:opacity-90" style={{ backgroundColor: brandColor }}>
                        <TrendingUp size={16} /> {upsellDict?.viewModule || "Acceder"}
                      </a>
                    </>
                  )}

                  {homePanel === "modules" && (
                    <>
                      <div>
                        <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-fuchsia-500/15">
                          <Zap size={24} className="text-fuchsia-300" />
                        </div>
                        <p className="text-3xl font-black text-white">Modules disponibles</p>
                        <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/60">Chatbot, langues, SEO, video hero et integrations.</p>
                        <div className="mt-6 flex flex-wrap gap-2">
                          <span className="px-3 py-1.5 rounded-full text-[10px] font-bold bg-white/5 text-white/50">Chatbot 39 EUR</span>
                          <span className="px-3 py-1.5 rounded-full text-[10px] font-bold bg-white/5 text-white/50">Mini CRM gratuit</span>
                          <span className="px-3 py-1.5 rounded-full text-[10px] font-bold bg-white/5 text-white/50">Langue +2 EUR</span>
                        </div>
                      </div>
                      <button type="button" onClick={() => setShowModules(true)} className="mt-8 inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-black text-black transition-all hover:opacity-90" style={{ backgroundColor: brandColor }}>
                        <Zap size={16} /> Voir les modules
                      </button>
                    </>
                  )}

                  {homePanel === "website" && (
                    <>
                      <div>
                        <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-sky-900/30">
                          <Globe size={24} className="text-sky-400" />
                        </div>
                        <p className="text-3xl font-black text-white">{upsellDict?.siteTitle || "Mon Site Vitrine"}</p>
                        <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/60">{upsellDict?.siteSubtitle || "Voir votre site public"}</p>
                      </div>
                      <a href={`/${locale}/${slug}`} target="_blank" rel="noopener noreferrer" className="mt-8 inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-black text-black transition-all hover:opacity-90" style={{ backgroundColor: brandColor }}>
                        <Globe size={16} /> Ouvrir le site
                      </a>
                    </>
                  )}

                  {homePanel === "settings" && (
                    <>
                      <div>
                        <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-slate-800/60">
                          <Settings size={24} className="text-slate-300" />
                        </div>
                        <p className="text-3xl font-black text-white">{settingsTile.title}</p>
                        <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/60">{settingsTile.subtitle}</p>
                      </div>
                      <button type="button" onClick={() => setView("settings")} className="mt-8 inline-flex w-full sm:w-auto items-center justify-center gap-2 rounded-2xl px-6 py-3 text-sm font-black text-black transition-all hover:opacity-90" style={{ backgroundColor: brandColor }}>
                        <Settings size={16} /> Ouvrir les parametres
                      </button>
                    </>
                  )}

                  {homePanel === "stats" && (
                    <>
                      <div>
                        <div className="mb-8 flex items-center justify-between">
                          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-900/20">
                            <BarChart3 size={24} className="text-amber-400" />
                          </div>
                          <span className="rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-widest" style={{ background: "rgba(245,158,11,0.1)", color: "#f59e0b", border: "1px solid rgba(245,158,11,0.2)" }}>
                            {upsellDict?.statsBadge || "Bientot"}
                          </span>
                        </div>
                        <p className="text-3xl font-black text-white">{upsellDict?.statsTitle || "Statistiques"}</p>
                        <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/60">{upsellDict?.statsSubtitle || "Vues, clics, performances"}</p>
                      </div>
                    </>
                  )}
                </div>
              </motion.section>
            </div>
          </>
        ) : view === "list" ?(
          <>
            {/* Header liste */}
            <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 mb-8" style={makeVisualTileStyle(firstPropertyImage || heroPreviewImage, brandColor, 0.64)}>
              <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="relative flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5">
                <div>
                  <p className="mb-2 text-[10px] font-black uppercase tracking-[0.32em]" style={{ color: brandColor }}>
                    Property Manager
                  </p>
                  <h2 className="text-3xl sm:text-4xl font-black text-white">{dict.myProperties}</h2>
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/25 px-3 py-1.5 backdrop-blur-md">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: brandColor }} />
                    <p className="text-xs font-bold text-white/70">
                      {properties.length} {properties.length <= 1 ?dict.published : dict.publishedPlural}
                    </p>
                  </div>
                </div>
                <button type="button"
                  onClick={() => { setEditing(null); setView("form"); }}
                  className="flex items-center justify-center gap-2 px-5 py-3 rounded-2xl text-sm font-black text-black transition-all hover:opacity-90 active:scale-[0.97] w-full sm:w-auto"
                  style={{ backgroundColor: brandColor, boxShadow: `0 8px 24px ${brandColor}40` }}>
                  <Plus size={18} strokeWidth={2.5} /> {dict.addProperty}
                </button>
              </div>
            </div>

            {propLoading ?(
              /* Bento Skeleton */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : properties.length === 0 ?(
              <div className="relative overflow-hidden text-center py-28 rounded-3xl" style={premiumPanelStyle(brandColor)}>
                <div className="absolute -right-16 -top-16 h-44 w-44 rounded-full blur-3xl opacity-30" style={{ backgroundColor: brandColor }} />
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
                    className={`group relative rounded-3xl overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${idx === 0 ?"lg:col-span-2" : ""}`}
                    style={{
                      ...premiumPanelStyle(brandColor),
                    }}
                  >
                    <div className={`relative overflow-hidden ${idx === 0 ?"aspect-[4/3] sm:aspect-[16/7]" : "aspect-[4/3]"} bg-white/5`}>
                      {p.images?.[0]
                        ?<img src={p.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={p.titre_fr} />
                        : <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                            <ImageIcon size={32} className="text-white/10" />
                          </div>
                      }
                      <div className="absolute inset-0" style={{ background: "linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 50%)" }} />
                      <div className="absolute top-3 left-3 flex flex-wrap gap-2">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-black/60 text-white backdrop-blur-sm">{p.type}</span>
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest backdrop-blur-sm" style={{ backgroundColor: `${brandColor}cc`, color: "#050505" }}>
                          {p.listing_type === "rent" ?"Location" : "Vente"}
                        </span>
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
                        <p className="text-xs text-white/30 truncate">{[p.town, p.region].filter(Boolean).join(", ") || "-"}</p>
                      </div>
                      <p className="text-xl font-black" style={{ color: brandColor }}>
                        {p.price ?`${Number(p.price).toLocaleString("fr-FR")} EUR${p.listing_type === "rent" ? p.rental_period === "week" ? " / sem." : p.rental_period === "day" ? " / jour" : " / mois" : ""}` : "-"}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-white/30 font-medium">
                        {p.beds > 0 && <span className="flex items-center gap-1"><BedDouble size={12} /> {p.beds}</span>}
                        {p.baths > 0 && <span className="flex items-center gap-1"><Bath size={12} /> {p.baths}</span>}
                        {p.surface_built && <span className="flex items-center gap-1"><Maximize2 size={12} /> {p.surface_built} m2</span>}
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
          <div className="max-w-4xl mx-auto">
            <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 mb-6" style={makeVisualTileStyle(editing?.images?.[0] || firstPropertyImage || heroPreviewImage, brandColor, 0.68)}>
              <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="relative flex items-start justify-between gap-4">
                <div>
                  <p className="mb-2 text-[10px] font-black uppercase tracking-[0.32em]" style={{ color: brandColor }}>
                    {editing?.id ?"Edition" : "Creation"}
                  </p>
                  <h2 className="text-2xl sm:text-4xl font-black text-white">{editing?.id ?dict.editProperty : dict.newProperty}</h2>
                  <p className="text-sm text-white/55 mt-2 max-w-xl">{dict.fillInfo}</p>
                </div>
                <button type="button" onClick={() => { setView("list"); setEditing(null); }}
                  className="rounded-2xl border border-white/10 bg-black/20 p-3 text-white/45 backdrop-blur-md transition-all hover:bg-white/10 hover:text-white">
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-3xl p-4 sm:p-8" style={premiumPanelStyle(brandColor)}>
              <div className="pointer-events-none absolute -right-20 top-20 h-52 w-52 rounded-full blur-3xl opacity-20" style={{ backgroundColor: brandColor }} />
              <PropertyForm
                initial={editing}
                agencyId={session.agencyId}
                pmToken={session.token || ""}
                slug={slug}
                brandColor={brandColor}
                dict={dict}
                immersiveEnabled={integrations.immersive_tours_enabled === true}
                onSaved={() => { setView("list"); setEditing(null); loadProperties(); }}
                onCancel={() => { setView("list"); setEditing(null); }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Modale modules disponibles */}
      {showModules && (
        <div className="fixed inset-0 z-[210] flex items-center justify-center px-4 py-8" style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(10px)" }}>
          <div className="relative overflow-hidden rounded-3xl p-6 md:p-8 max-w-5xl w-full max-h-[88vh] overflow-y-auto" style={{ ...premiumPanelStyle("#B859C5"), boxShadow: "0 40px 90px rgba(0,0,0,0.65)" }}>
            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-fuchsia-500/20 blur-3xl" />
            <div className="absolute left-10 bottom-0 h-44 w-44 rounded-full bg-cyan-500/10 blur-3xl" />
            <div className="relative flex items-start justify-between gap-4 mb-7">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.25em] mb-2" style={{ color: brandColor }}>
                  Catalogue premium
                </p>
                <h3 className="text-2xl font-bold text-white">Modules disponibles</h3>
                <p className="text-sm text-white/35 mt-2 max-w-2xl">
                  Selectionnez les options a activer pour faire evoluer votre espace DataHome.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowModules(false)}
                className="p-2.5 hover:bg-white/5 rounded-xl transition-all shrink-0"
                aria-label="Fermer"
              >
                <X size={18} className="text-white/40" />
              </button>
            </div>

            {moduleRequestMsg && (
              <div className={`mb-5 flex items-center gap-2 rounded-2xl border px-4 py-3 ${moduleRequestMsg.type === "ok" ?"bg-emerald-500/10 border-emerald-500/25 text-emerald-300" : "bg-red-500/10 border-red-500/25 text-red-300"}`}>
                {moduleRequestMsg.type === "ok" ?<CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                <p className="text-xs font-bold">{moduleRequestMsg.text}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {moduleCatalog.map((module) => {
                const Icon = module.icon;
                const canRequest = !module.comingSoon && (!module.active || module.requestableWhenActive);
                return (
                  <div
                    key={module.id}
                    className="group relative overflow-hidden rounded-3xl p-5 border transition-all hover:-translate-y-1"
                    style={{ background: `radial-gradient(circle at 18% 0%, ${module.color}22, transparent 38%), rgba(255,255,255,0.035)`, borderColor: "rgba(255,255,255,0.08)" }}
                  >
                    <div className="absolute -right-10 -top-10 h-24 w-24 rounded-full blur-2xl opacity-25" style={{ backgroundColor: module.color }} />
                    <div className="flex items-start justify-between gap-3 mb-5">
                      <div className="relative w-12 h-12 rounded-2xl flex items-center justify-center border border-white/10" style={{ backgroundColor: `${module.color}18` }}>
                        <Icon size={22} style={{ color: module.color }} />
                      </div>
                      <span
                        className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-widest"
                        style={{
                          background: module.active ?"rgba(34,197,94,0.12)" : module.comingSoon ?"rgba(245,158,11,0.12)" : "rgba(255,255,255,0.06)",
                          color: module.active ?"#22c55e" : module.comingSoon ?"#f59e0b" : "rgba(255,255,255,0.45)",
                          border: "1px solid rgba(255,255,255,0.08)",
                        }}
                      >
                        {module.active ?"Actif" : module.status}
                      </span>
                    </div>
                    <h4 className="text-white font-bold text-lg mb-1">{module.name}</h4>
                    <p className="text-white/35 text-sm leading-relaxed min-h-[44px]">{module.description}</p>
                    <div className="flex items-center justify-between gap-3 mt-5 pt-5 border-t border-white/5">
                      <p className="text-white font-black">{module.price}</p>
                      {module.active && !module.requestableWhenActive ?(
                        <span className="px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10">
                          Deja actif
                        </span>
                      ) : module.comingSoon ?(
                        <span className="px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-amber-400 bg-amber-500/10">
                          Bientot
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={() => canRequest && requestModule(module)}
                          disabled={!canRequest || moduleRequestLoading === module.id}
                          className="px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest text-black transition-all hover:opacity-90 disabled:opacity-60"
                          style={{ backgroundColor: brandColor }}
                        >
                          {moduleRequestLoading === module.id ?"Envoi..." : "Demander"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Modale suppression */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-6" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
          <div className="relative overflow-hidden rounded-3xl p-8 max-w-sm w-full" style={{ ...premiumPanelStyle("#ef4444"), boxShadow: "0 40px 80px rgba(0,0,0,0.6)" }}>
            <div className="absolute -right-14 -top-14 h-36 w-36 rounded-full bg-red-500/20 blur-3xl" />
            <div className="relative w-14 h-14 rounded-2xl bg-red-900/20 flex items-center justify-center mx-auto mb-4 border border-red-500/15">
              <Trash2 size={24} className="text-red-400" />
            </div>
            <h3 className="relative text-center font-bold text-white text-lg mb-1">{dict.deleteTitle}</h3>
            <p className="relative text-center text-sm text-white/35 mb-7">{dict.deleteWarning}</p>
            <div className="relative flex gap-3">
              <button type="button" onClick={() => setDeleteId(null)}
                className="flex-1 py-3.5 rounded-2xl border border-white/10 text-sm font-bold text-white/40 hover:bg-white/5 transition-all">
                {dict.cancel}
              </button>
              <button type="button" onClick={() => handleDelete(deleteId)} disabled={deleting}
                className="flex-1 py-3.5 rounded-2xl bg-red-600 hover:bg-red-500 text-white text-sm font-bold flex items-center justify-center gap-2 transition-all">
                {deleting ?<Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                {dict.delete}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale changement mot de passe */}
      {showChangePw && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center px-6" style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)" }}>
          <div className="relative overflow-hidden rounded-3xl p-8 max-w-sm w-full" style={{ ...premiumPanelStyle(brandColor), boxShadow: "0 40px 80px rgba(0,0,0,0.6)" }}>
            <div className="absolute -right-14 -top-14 h-36 w-36 rounded-full blur-3xl opacity-25" style={{ backgroundColor: brandColor }} />
            <div className="relative flex items-center justify-between mb-6">
              <h3 className="font-bold text-white text-lg">{dict.changePwTitle}</h3>
              <button type="button" onClick={() => { setShowChangePw(false); setCpMsg(null); }}
                className="p-2 hover:bg-white/5 rounded-xl transition-all">
                <X size={16} className="text-white/30" />
              </button>
            </div>
            <div className="relative space-y-4">
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
                <div className={`flex items-center gap-2 p-3 rounded-xl border ${cpMsg.type === "ok" ?"bg-green-900/10 border-green-900/30" : "bg-red-900/10 border-red-900/30"}`}>
                  {cpMsg.type === "ok" ?<CheckCircle2 size={14} className="text-green-400" /> : <AlertCircle size={14} className="text-red-400" />}
                  <p className={`text-xs font-medium ${cpMsg.type === "ok" ?"text-green-400" : "text-red-400"}`}>{cpMsg.text}</p>
                </div>
              )}
              <button type="button" onClick={handleChangePw} disabled={cpLoading}
                className="w-full py-4 rounded-2xl text-sm font-black flex items-center justify-center gap-2 transition-all hover:opacity-90"
                style={{ backgroundColor: brandColor, color: "#000", boxShadow: `0 8px 24px ${brandColor}40` }}>
                {cpLoading ?<Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {dict.updateBtn}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

