"use client";

import React, { useState } from "react";
import {
  ArrowLeft, Save, Loader2, CheckCircle2, AlertCircle,
  Palette, Layout, Share2, Users, Type, ShieldCheck,
  UploadCloud, Trash2, UserPlus, Image as ImageIcon, Mail, Phone,
  Facebook, Instagram, Linkedin, Briefcase, FileText, Sun, Moon, Globe,
} from "lucide-react";

function TikTokIcon({ size = 15, className = "" }: { size?: number; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" className={className}>
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.63a8.25 8.25 0 004.84 1.54V6.72a4.85 4.85 0 01-1.07-.03z" />
    </svg>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border border-transparent transition-all duration-300 focus:outline-none"
      style={{ backgroundColor: checked ? '#6366f1' : 'rgba(255,255,255,0.08)', boxShadow: checked ? '0 0 14px #6366f155' : 'none' }}
    >
      <span className={`pointer-events-none inline-block h-5 w-5 rounded-full shadow-lg transform transition duration-300 ease-in-out ${checked ? 'translate-x-5 bg-white' : 'translate-x-0 bg-white/40'}`} />
    </button>
  );
}

type Member = { name: string; role: string; bio: string; photo: string };

interface Props {
  agency: any;
  slug: string;
  agencyId: string;
  pmToken?: string;
  locale: string;
  onBack: () => void;
  onSaved: (updated: any) => void;
}

const dashboardText: Record<string, Record<string, string>> = {
  fr: {
    settings: "Parametres",
    save: "Sauvegarder",
    saving: "Sauvegarde...",
    saved: "Modifications sauvegardees !",
    serverError: "Erreur serveur",
    vercelError: "Erreur Vercel",
    domainAdded: "Domaine ajoute. Les instructions DNS ont ete envoyees par e-mail.",
    domainError: "Erreur configuration domaine",
    domainRequired: "Ajoutez d'abord un domaine.",
    branding: "Identite visuelle & couleurs",
    logo: "Logo de l'agence",
    clickUpload: "Cliquer pour uploader",
    font: "Police d'ecriture",
    primaryColor: "Couleur principale",
    buttonColor: "Couleur des boutons",
    buttonStyle: "Style des boutons",
    squareButtons: "Bords droits",
    roundedButtons: "Bords arrondis",
    buttonAnimation: "Animation des boutons",
    none: "Aucune",
    propertyDisplay: "Affichage des biens",
    villasPerRow: "Villas par ligne",
    threePerRow: "3 par ligne",
    fourPerRow: "4 par ligne",
    cardCorners: "Forme des vignettes",
    roundedCards: "Bords ronds",
    squareCards: "Bords carres",
    hero: "Affichage du site & Hero",
    mediaType: "Type de media",
    image: "Image",
    video: "Video",
    file: "Fichier",
    changeMedia: "Changer le media",
    uploadMedia: "Uploader un media",
    mediaHint: "Image ou video MP4 - max 50 Mo",
    heroTitle: "Titre d'accroche",
    heroPlaceholder: "Decouvrez nos biens d'exception...",
    contactSocials: "Reseaux sociaux & contact",
    phone: "Telephone",
    customDomain: "Domaine personnalise",
    domainName: "Nom de domaine",
    status: "Statut",
    verified: "Verifie",
    dnsToConfigure: "DNS a configurer",
    notConfigured: "Non configure",
    domainHelp: "Ajoutez votre domaine, puis lancez la configuration Vercel. Vous recevrez aussi les instructions DNS par e-mail.",
    configureDomain: "Configurer mon domaine",
    vercelVerification: "Verification Vercel",
    team: "Gestion de l'equipe",
    add: "Ajouter",
    noTeam: "Aucun membre dans l'equipe.",
    name: "Nom",
    role: "Poste",
    bio: "Bio",
    about: "Page a propos",
    title: "Titre",
    content: "Contenu",
    aboutPlaceholder: "Decrivez votre agence...",
    legal: "Conformite & legal",
    cookies: "Bandeau de cookies",
    rgpd: "Conformite RGPD",
    privacy: "Mentions legales & politique de confidentialite",
    privacyPlaceholder: "Saisissez ici les mentions legales...",
    discover: "Decouvrir",
    livePreview: "Apercu en temps reel",
    lightMode: "Mode clair",
    darkMode: "Mode sombre",
    photo: "Photo",
    bioPlaceholder: "Courte biographie...",
    uploadLogoError: "Erreur upload logo",
    uploadHeroError: "Erreur upload hero",
    uploadPhotoError: "Erreur upload photo",
    imageMax: "Image max 5 Mo",
    videoMax: "Video max 50 Mo",
  },
  en: {
    settings: "Settings",
    save: "Save",
    saving: "Saving...",
    saved: "Changes saved!",
    serverError: "Server error",
    vercelError: "Vercel error",
    domainAdded: "Domain added. DNS instructions have been sent by email.",
    domainError: "Domain setup error",
    domainRequired: "Add a domain first.",
    branding: "Visual identity & colors",
    logo: "Agency logo",
    clickUpload: "Click to upload",
    font: "Font",
    primaryColor: "Primary color",
    buttonColor: "Button color",
    buttonStyle: "Button style",
    squareButtons: "Sharp corners",
    roundedButtons: "Rounded buttons",
    buttonAnimation: "Button animation",
    none: "None",
    propertyDisplay: "Property display",
    villasPerRow: "Properties per row",
    threePerRow: "3 per row",
    fourPerRow: "4 per row",
    cardCorners: "Card shape",
    roundedCards: "Rounded corners",
    squareCards: "Square corners",
    hero: "Site display & hero",
    mediaType: "Media type",
    image: "Image",
    video: "Video",
    file: "File",
    changeMedia: "Change media",
    uploadMedia: "Upload media",
    mediaHint: "Image or MP4 video - max 50 MB",
    heroTitle: "Hero title",
    heroPlaceholder: "Discover our exceptional properties...",
    contactSocials: "Social networks & contact",
    phone: "Phone",
    customDomain: "Custom domain",
    domainName: "Domain name",
    status: "Status",
    verified: "Verified",
    dnsToConfigure: "DNS to configure",
    notConfigured: "Not configured",
    domainHelp: "Add your domain, then launch the Vercel setup. You will also receive the DNS instructions by email.",
    configureDomain: "Configure my domain",
    vercelVerification: "Vercel verification",
    team: "Team management",
    add: "Add",
    noTeam: "No team member yet.",
    name: "Name",
    role: "Role",
    bio: "Bio",
    about: "About page",
    title: "Title",
    content: "Content",
    aboutPlaceholder: "Describe your agency...",
    legal: "Compliance & legal",
    cookies: "Cookie banner",
    rgpd: "GDPR compliance",
    privacy: "Legal notice & privacy policy",
    privacyPlaceholder: "Enter your legal notice here...",
    discover: "Discover",
    livePreview: "Live preview",
    lightMode: "Light mode",
    darkMode: "Dark mode",
    photo: "Photo",
    bioPlaceholder: "Short biography...",
    uploadLogoError: "Logo upload error",
    uploadHeroError: "Hero upload error",
    uploadPhotoError: "Photo upload error",
    imageMax: "Image max 5 MB",
    videoMax: "Video max 50 MB",
  },
};

export default function ClientDashboard({ agency, slug, agencyId, pmToken = "", locale, onBack, onSaved }: Props) {
  const [form, setForm] = useState<any>({ ...agency });
  const [team, setTeam] = useState<Member[]>(agency.team_data || []);
  const [isSaving, setIsSaving] = useState(false);
  const [isConfiguringDomain, setIsConfiguringDomain] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);
  const [isDark, setIsDark] = useState(true);

  const brandColor = form.primary_color || "#D4AF37";
  const fontFamily = form.font_family || "Montserrat";
  const ui = dashboardText[locale] || dashboardText.en;
  let footerConfig = form.footer_config || {};
  if (typeof footerConfig === "string") {
    try { footerConfig = JSON.parse(footerConfig); } catch { footerConfig = {}; }
  }
  const propertiesPerRow = footerConfig?.layout?.properties_per_row === 4 ? 4 : 3;
  const propertyCardCorners = footerConfig?.layout?.property_card_corners === "square" ? "square" : "rounded";

  const inp = `w-full px-4 py-3.5 rounded-2xl border text-sm focus:outline-none transition-all ${isDark ? "text-white placeholder:text-white/20 bg-white/[0.04] border-white/[0.07] focus:border-white/20" : "text-slate-900 placeholder:text-slate-400 bg-slate-50 border-slate-200 focus:border-slate-400"}`;
  const lbl = `block text-[10px] font-bold uppercase tracking-widest mb-2 ${isDark ? "text-white/40" : "text-slate-500"}`;
  const sHdr = `flex items-center gap-3 font-bold uppercase text-xs tracking-widest border-b pb-4 mb-5 ${isDark ? "text-white/80 border-white/[0.06]" : "text-slate-700 border-slate-200"}`;
  const card = isDark
    ? { background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(12px)" }
    : { background: "#ffffff", border: "1px solid rgba(0,0,0,0.08)", boxShadow: "0 1px 3px rgba(0,0,0,0.07)" };

  const updateNested = (section: string, field: string, value: any) =>
    setForm((prev: any) => {
      let fc = prev.footer_config || {};
      if (typeof fc === "string") try { fc = JSON.parse(fc); } catch { fc = {}; }
      return { ...prev, footer_config: { ...fc, [section]: { ...(fc[section] || {}), [field]: value } } };
    });

  const updateRoot = (field: string, value: any) =>
    setForm((prev: any) => {
      let fc = prev.footer_config || {};
      if (typeof fc === "string") try { fc = JSON.parse(fc); } catch { fc = {}; }
      return { ...prev, footer_config: { ...fc, [field]: value } };
    });

  const uploadFile = async (file: File, path: string): Promise<string> => {
    const res = await fetch("/api/admin/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ filePath: path }),
    });
    if (!res.ok) throw new Error("Upload init failed");
    const { signedUrl, publicUrl } = await res.json();
    const up = await fetch(signedUrl, { method: "PUT", headers: { "Content-Type": file.type }, body: file });
    if (!up.ok) throw new Error("Upload failed");
    return publicUrl;
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { setMessage({ type: "err", text: ui.imageMax }); return; }
    setIsSaving(true);
    try {
      const ext = file.name.split(".").pop();
      const url = await uploadFile(file, `${slug}/branding/logo_${Date.now()}.${ext}`);
      setForm((p: any) => ({ ...p, logo_url: url }));
    } catch { setMessage({ type: "err", text: ui.uploadLogoError }); }
    finally { setIsSaving(false); }
  };

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isVideo = file.type.startsWith("video/");
    if (file.size > (isVideo ? 50 : 5) * 1024 * 1024) {
      setMessage({ type: "err", text: isVideo ? ui.videoMax : ui.imageMax });
      return;
    }
    setIsSaving(true);
    try {
      const ext = file.name.split(".").pop();
      const url = await uploadFile(file, `${slug}/${isVideo ? "hero-video" : "hero"}/${Date.now()}.${ext}`);
      setForm((p: any) => ({ ...p, hero_url: url, hero_type: isVideo ? "video" : "image" }));
    } catch { setMessage({ type: "err", text: ui.uploadHeroError }); }
    finally { setIsSaving(false); e.target.value = ""; }
  };

  const handleMemberPhoto = async (e: React.ChangeEvent<HTMLInputElement>, idx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsSaving(true);
    try {
      const ext = file.name.split(".").pop();
      const url = await uploadFile(file, `${slug}/team/member_${idx}_${Date.now()}.${ext}`);
      const newTeam = [...team];
      newTeam[idx] = { ...newTeam[idx], photo: url };
      setTeam(newTeam);
      setForm((p: any) => ({ ...p, team_data: newTeam }));
    } catch { setMessage({ type: "err", text: ui.uploadPhotoError }); }
    finally { setIsSaving(false); }
  };

  const addMember = () => {
    const newTeam = [...team, { name: "", role: "", bio: "", photo: "" }];
    setTeam(newTeam);
    setForm((p: any) => ({ ...p, team_data: newTeam }));
  };

  const updateMember = (idx: number, field: string, value: string) => {
    const newTeam = [...team];
    newTeam[idx] = { ...newTeam[idx], [field]: value };
    setTeam(newTeam);
    setForm((p: any) => ({ ...p, team_data: newTeam }));
  };

  const removeMember = (idx: number) => {
    const newTeam = team.filter((_, i) => i !== idx);
    setTeam(newTeam);
    setForm((p: any) => ({ ...p, team_data: newTeam }));
  };

  const normalizeCustomDomain = (value: string) => value
    .trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/\/.*$/, "");

  const configureVercelDomain = async () => {
    const domain = normalizeCustomDomain(form.custom_domain || "");
    if (!domain) {
      setMessage({ type: "err", text: ui.domainRequired });
      setTimeout(() => setMessage(null), 4000);
      return;
    }

    setIsConfiguringDomain(true);
    setMessage(null);
    try {
      const res = await fetch("/api/admin/vercel-domain", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-pm-session": pmToken },
        body: JSON.stringify({ agency_id: agencyId, domain, lang: locale }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || ui.vercelError);
      setForm((prev: any) => ({ ...prev, ...json.agency }));
      onSaved(json.agency);
      setMessage({ type: "ok", text: ui.domainAdded });
      setTimeout(() => setMessage(null), 6000);
    } catch (err: any) {
      setMessage({ type: "err", text: err.message || ui.domainError });
      setTimeout(() => setMessage(null), 6000);
    } finally {
      setIsConfiguringDomain(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      let fc = form.footer_config || {};
      if (typeof fc === "string") try { fc = JSON.parse(fc); } catch { fc = {}; }
      const res = await fetch("/api/property-manager/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-pm-session": pmToken },
        body: JSON.stringify({
          slug,
          agencyId,
          data: {
            agency_name: form.agency_name,
            primary_color: form.primary_color,
            button_color: form.button_color,
            button_style: form.button_style,
            button_animation: form.button_animation,
            font_family: form.font_family,
            logo_url: form.logo_url,
            hero_title: form.hero_title,
            hero_type: form.hero_type,
            hero_url: form.hero_url,
            about_title: form.about_title,
            about_text: form.about_text,
            cookie_consent_enabled: form.cookie_consent_enabled,
            privacy_policy: form.privacy_policy,
            custom_domain: normalizeCustomDomain(form.custom_domain || "") || null,
            custom_domain_status: form.custom_domain ? "pending" : "not_configured",
            custom_domain_verified_at: form.custom_domain_verified_at || null,
            custom_domain_verification: form.custom_domain_verification || null,
            custom_domain_dns: form.custom_domain_dns || null,
            team_data: team,
            footer_config: fc,
            updated_at: new Date().toISOString(),
          },
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || ui.serverError);
      setMessage({ type: "ok", text: ui.saved });
      onSaved(json.agency);
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: "err", text: err.message || ui.serverError });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${isDark ? "dash-dark bg-[#0d0d0d] text-white" : "dash-light bg-slate-100 text-slate-900"}`}
      style={{ fontFamily: `${fontFamily}, sans-serif` }}
    >

      {/* Header */}
      <div
        className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between"
        style={isDark
          ? { background: "rgba(13,13,13,0.9)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }
          : { background: "rgba(255,255,255,0.95)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(0,0,0,0.08)" }
        }
      >
        <div className="flex items-center gap-3">
          <button type="button" onClick={onBack} className={`p-2 rounded-xl transition-all ${isDark ? "hover:bg-white/5 text-white/40 hover:text-white/70" : "hover:bg-black/5 text-slate-400 hover:text-slate-700"}`}>
            <ArrowLeft size={18} />
          </button>
          {form.logo_url
            ? <img src={form.logo_url} alt="" className="h-8 object-contain" />
            : <div className="w-9 h-9 rounded-xl flex items-center justify-center text-black font-bold" style={{ backgroundColor: brandColor }}>{form.agency_name?.charAt(0)}</div>
          }
          <div>
            <p className={`text-sm font-bold ${isDark ? "text-white" : "text-slate-900"}`}>{form.agency_name}</p>
            <p className={`text-[10px] uppercase tracking-widest font-bold ${isDark ? "text-white/25" : "text-slate-400"}`}>{ui.settings}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <img src="/logo-data-home.jpeg" alt="DataHome" className="h-9 w-9 rounded-xl object-cover" />
          <button
            type="button"
            onClick={() => setIsDark(v => !v)}
            title={isDark ? ui.lightMode : ui.darkMode}
            className={`p-2 rounded-xl transition-all ${isDark ? "hover:bg-white/5 text-white/40" : "hover:bg-black/5 text-slate-400"}`}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          {message && (
            <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase ${message.type === "ok" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-red-500/10 text-red-400 border border-red-500/20"}`}>
              {message.type === "ok" ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
              {message.text}
            </div>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 text-black rounded-xl font-bold text-[11px] uppercase tracking-widest hover:opacity-90 transition-all shadow-lg disabled:opacity-50 active:scale-95"
            style={{ backgroundColor: brandColor }}
          >
            {isSaving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
            {isSaving ? ui.saving : ui.save}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">

            {/* ① Identité Visuelle */}
            <div className="rounded-2xl p-7 space-y-5" style={card}>
              <h3 className={sHdr}><Palette size={15} style={{ color: brandColor }} /> {ui.branding}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className={lbl}>{ui.logo}</label>
                  <div className="relative group cursor-pointer">
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    <div className="w-full border-2 border-dashed border-white/[0.08] rounded-xl p-5 flex flex-col items-center gap-2 bg-white/[0.02] group-hover:bg-white/[0.04] group-hover:border-white/20 transition-all">
                      {form.logo_url
                        ? <img src={form.logo_url} className="h-12 object-contain" alt="Logo" />
                        : <><UploadCloud className="text-white/20 group-hover:text-white/50 transition-colors" size={20} /><span className="text-xs text-white/30">{ui.clickUpload}</span></>
                      }
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className={lbl}>{ui.font}</label>
                  <select
                    value={form.font_family || "Montserrat"}
                    onChange={(e) => setForm((p: any) => ({ ...p, font_family: e.target.value }))}
                    className={`${inp} appearance-none [&>option]:bg-[#0d0d0d]`}
                  >
                    <option value="Montserrat">Montserrat (Moderne)</option>
                    <option value="Inter">Inter (Minimaliste)</option>
                    <option value="'Playfair Display', serif">Playfair (Luxe)</option>
                    <option value="Poppins">Poppins (Arrondi)</option>
                    <option value="'Roboto Mono', monospace">Roboto Mono (Tech)</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className={lbl}>{ui.primaryColor}</label>
                  <div className="flex gap-3">
                    <input type="color" value={form.primary_color || "#D4AF37"} onChange={(e) => setForm((p: any) => ({ ...p, primary_color: e.target.value }))} className="h-[52px] w-16 rounded-xl cursor-pointer bg-white/[0.05] border border-white/[0.08] p-1" />
                    <input type="text" value={form.primary_color || ""} onChange={(e) => setForm((p: any) => ({ ...p, primary_color: e.target.value }))} className={`${inp} flex-1 font-mono uppercase`} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className={lbl}>{ui.buttonColor}</label>
                  <div className="flex gap-3">
                    <input type="color" value={form.button_color || "#2563eb"} onChange={(e) => setForm((p: any) => ({ ...p, button_color: e.target.value }))} className="h-[52px] w-16 rounded-xl cursor-pointer bg-white/[0.05] border border-white/[0.08] p-1" />
                    <input type="text" value={form.button_color || ""} onChange={(e) => setForm((p: any) => ({ ...p, button_color: e.target.value }))} className={`${inp} flex-1 font-mono uppercase`} />
                  </div>
                </div>
              </div>
              <div className="space-y-3 pt-4 border-t border-white/[0.05]">
                <label className={lbl}>{ui.buttonStyle}</label>
                <div className="grid grid-cols-2 gap-3">
                  {[{ value: "rounded-none", label: ui.squareButtons }, { value: "rounded-full", label: ui.roundedButtons }].map(opt => (
                    <button key={opt.value} type="button" onClick={() => setForm((p: any) => ({ ...p, button_style: opt.value }))} className={`p-4 border rounded-xl transition-all ${form.button_style === opt.value ? "bg-white/10 border-white/20" : "border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]"}`}>
                      <div className="text-center">
                        <div className="w-full h-8 bg-white/10 mb-2" style={{ borderRadius: opt.value === "rounded-full" ? "9999px" : "0" }} />
                        <span className="text-[9px] font-bold uppercase text-white/50">{opt.label}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3 pt-4 border-t border-white/[0.05]">
                <label className={lbl}>{ui.buttonAnimation}</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "none", label: ui.none },
                    { value: "scale", label: "Scale (Zoom)" },
                    { value: "glow", label: "Glow (Lueur)" },
                    { value: "slide", label: "Slide" },
                  ].map(opt => (
                    <button key={opt.value} type="button" onClick={() => setForm((p: any) => ({ ...p, button_animation: opt.value }))} className={`p-3 border rounded-xl transition-all text-[9px] font-bold uppercase ${form.button_animation === opt.value ? "bg-white/10 border-white/20 text-white" : "border-white/[0.06] bg-white/[0.02] text-white/40 hover:border-white/[0.12]"}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ② {ui.hero} */}
            <div className="rounded-2xl p-7 space-y-5" style={card}>
              <h3 className={sHdr}><Layout size={15} style={{ color: brandColor }} /> {ui.hero}</h3>
              <div className="space-y-3">
                <label className={lbl}>{ui.propertyDisplay}</label>
                <div className={`rounded-2xl border p-4 ${isDark ? "border-white/[0.06] bg-white/[0.02]" : "border-slate-200 bg-slate-50"}`}>
                  <div className="mb-3 flex items-center justify-between gap-4">
                    <span className={`text-sm font-semibold ${isDark ? "text-white/80" : "text-slate-800"}`}>{ui.villasPerRow}</span>
                    <span className={`text-[10px] font-black uppercase tracking-widest ${isDark ? "text-white/30" : "text-slate-400"}`}>{propertiesPerRow}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 3, label: ui.threePerRow },
                      { value: 4, label: ui.fourPerRow },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => updateNested("layout", "properties_per_row", opt.value)}
                        className={`rounded-xl border px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                          propertiesPerRow === opt.value
                            ? "border-white/20 bg-white/15 text-white"
                            : isDark
                              ? "border-white/[0.06] bg-white/[0.02] text-white/40 hover:border-white/[0.12]"
                              : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <div className="mt-5 border-t border-white/[0.06] pt-4">
                    <div className="mb-3 flex items-center justify-between gap-4">
                      <span className={`text-sm font-semibold ${isDark ? "text-white/80" : "text-slate-800"}`}>{ui.cardCorners}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: "rounded", label: ui.roundedCards },
                        { value: "square", label: ui.squareCards },
                      ].map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => updateNested("layout", "property_card_corners", opt.value)}
                          className={`rounded-xl border px-4 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${
                            propertyCardCorners === opt.value
                              ? "border-white/20 bg-white/15 text-white"
                              : isDark
                                ? "border-white/[0.06] bg-white/[0.02] text-white/40 hover:border-white/[0.12]"
                                : "border-slate-200 bg-white text-slate-500 hover:border-slate-300"
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <label className={lbl}>{ui.mediaType}</label>
                <div className="flex p-1 bg-white/[0.04] border border-white/[0.06] rounded-xl w-fit">
                  <button type="button" onClick={() => setForm((p: any) => ({ ...p, hero_type: "image" }))} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all ${form.hero_type !== "video" ? "bg-white/15 text-white" : "text-white/40 hover:text-white/60"}`}><ImageIcon size={13} /> {ui.image}</button>
                  <button type="button" onClick={() => setForm((p: any) => ({ ...p, hero_type: "video" }))} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all ${form.hero_type === "video" ? "bg-white/15 text-white" : "text-white/40 hover:text-white/60"}`}>{ui.video}</button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className={lbl}>{ui.file} {form.hero_type === "video" ? ui.video.toLowerCase() : ui.image.toLowerCase()}</label>
                  <div className="relative group">
                    <input type="file" accept="image/*,video/mp4" onChange={handleHeroUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    <div className="w-full border-2 border-dashed border-white/[0.08] rounded-xl p-5 flex flex-col items-center gap-2 bg-white/[0.02] group-hover:bg-white/[0.04] group-hover:border-white/20 transition-all">
                      <UploadCloud className="text-white/20 group-hover:text-white/50 transition-colors" size={20} />
                      <span className="text-xs text-white/30">{form.hero_url ? ui.changeMedia : ui.uploadMedia}</span>
                      <span className="text-[9px] text-white/20">{ui.mediaHint}</span>
                    </div>
                  </div>
                  {form.hero_url && (
                    <div className="mt-2 rounded-xl overflow-hidden relative group border border-white/[0.06]">
                      {form.hero_type === "video"
                        ? <video src={form.hero_url} className="w-full h-28 object-cover" controls />
                        : <img src={form.hero_url} className="w-full h-28 object-cover" alt="Hero" />
                      }
                      <button type="button" onClick={() => setForm((p: any) => ({ ...p, hero_url: null }))} className="absolute top-2 right-2 p-1.5 bg-red-500/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12} /></button>
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <label className={lbl}>{ui.heroTitle}</label>
                  <textarea rows={4} value={form.hero_title || ""} onChange={(e) => setForm((p: any) => ({ ...p, hero_title: e.target.value }))} placeholder={ui.heroPlaceholder} className={`${inp} resize-none font-serif italic text-base`} />
                </div>
              </div>
            </div>

            {/* ③ Contact & Réseaux Sociaux */}
            <div className="rounded-2xl p-7 space-y-5" style={card}>
              <h3 className={sHdr}><Share2 size={15} style={{ color: brandColor }} /> {ui.contactSocials}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative"><Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" size={15} /><input placeholder="LinkedIn" className={`${inp} pl-11`} value={form.footer_config?.socials?.linkedin || ""} onChange={(e) => updateNested("socials", "linkedin", e.target.value)} /></div>
                <div className="relative"><TikTokIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" size={15} /><input placeholder="TikTok" className={`${inp} pl-11`} value={form.footer_config?.socials?.tiktok || ""} onChange={(e) => updateNested("socials", "tiktok", e.target.value)} /></div>
                <div className="relative"><Facebook className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" size={15} /><input placeholder="Facebook" className={`${inp} pl-11`} value={form.footer_config?.socials?.facebook || ""} onChange={(e) => updateNested("socials", "facebook", e.target.value)} /></div>
                <div className="relative"><Instagram className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" size={15} /><input placeholder="Instagram" className={`${inp} pl-11`} value={form.footer_config?.socials?.instagram || ""} onChange={(e) => updateNested("socials", "instagram", e.target.value)} /></div>
                <div className="md:col-span-2 pt-3 border-t border-white/[0.05] grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" size={15} /><input placeholder="Email de contact" className={`${inp} pl-11`} value={form.footer_config?.email || ""} onChange={(e) => updateRoot("email", e.target.value)} /></div>
                  <div className="relative"><Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" size={15} /><input placeholder={ui.phone} className={`${inp} pl-11`} value={form.footer_config?.phone || ""} onChange={(e) => updateRoot("phone", e.target.value)} /></div>
                </div>
              </div>
            </div>

            {/* ④ Équipe */}
            <div className="rounded-2xl p-7 space-y-5" style={card}>
              <h3 className={sHdr}><Globe size={15} style={{ color: brandColor }} /> {ui.customDomain}</h3>
              <div className="space-y-2">
                <label className={lbl}>{ui.domainName}</label>
                <div className="relative">
                  <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" size={15} />
                  <input
                    type="text"
                    className={`${inp} pl-11 font-mono`}
                    placeholder="www.votre-agence.com"
                    value={form.custom_domain || ""}
                    onChange={(e) => setForm((p: any) => ({
                      ...p,
                      custom_domain: normalizeCustomDomain(e.target.value),
                      custom_domain_status: e.target.value.trim() ? "pending" : "not_configured",
                    }))}
                  />
                </div>
              </div>
              <div className={`rounded-2xl border p-4 text-xs leading-relaxed ${isDark ? "bg-white/[0.03] border-white/[0.06] text-white/40" : "bg-slate-50 border-slate-200 text-slate-500"}`}>
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className="text-[10px] font-black uppercase tracking-widest">{ui.status}</span>
                  <span className={`px-2 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${form.custom_domain_status === "verified" ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20" : form.custom_domain ? "bg-amber-500/15 text-amber-300 border border-amber-500/20" : "bg-white/[0.05] text-white/35 border border-white/[0.08]"}`}>
                    {form.custom_domain_status === "verified" ? ui.verified : form.custom_domain ? ui.dnsToConfigure : ui.notConfigured}
                  </span>
                </div>
                <p>{ui.domainHelp}</p>
                <button
                  type="button"
                  onClick={configureVercelDomain}
                  disabled={isConfiguringDomain || !form.custom_domain}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-widest text-black transition hover:opacity-90 disabled:opacity-50"
                  style={{ backgroundColor: brandColor }}
                >
                  {isConfiguringDomain ? <Loader2 size={13} className="animate-spin" /> : <Globe size={13} />}
                  {ui.configureDomain}
                </button>
                {form.custom_domain_dns?.records?.length > 0 && (
                  <div className="mt-5 space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-white/45">{ui.dnsToConfigure}</p>
                    {form.custom_domain_dns.records.map((record: any, idx: number) => (
                      <div key={`${record.type}-${idx}`} className="grid grid-cols-1 md:grid-cols-3 gap-2 rounded-xl border border-white/[0.06] bg-black/20 p-3 font-mono text-[10px] text-white/55">
                        <span>{record.type}</span>
                        <span>{record.name}</span>
                        <span className="break-all">{record.value}</span>
                      </div>
                    ))}
                  </div>
                )}
                {form.custom_domain_dns?.verificationRecords?.length > 0 && (
                  <div className="mt-5 space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-amber-300/80">{ui.vercelVerification}</p>
                    {form.custom_domain_dns.verificationRecords.map((record: any, idx: number) => (
                      <div key={`${record.type}-verify-${idx}`} className="grid grid-cols-1 md:grid-cols-3 gap-2 rounded-xl border border-amber-500/15 bg-amber-500/5 p-3 font-mono text-[10px] text-amber-100/70">
                        <span>{record.type}</span>
                        <span className="break-all">{record.name}</span>
                        <span className="break-all">{record.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-2xl p-7 space-y-5" style={card}>
              <div className="flex justify-between items-center border-b border-white/[0.06] pb-4">
                <h3 className="flex items-center gap-3 font-bold text-white/80 uppercase text-xs tracking-widest"><Users size={15} style={{ color: brandColor }} /> {ui.team}</h3>
                <button type="button" onClick={addMember} className="flex items-center gap-2 px-4 py-2 border border-white/10 text-white rounded-xl text-xs font-bold hover:bg-white/5 transition-all">
                  <UserPlus size={13} /> {ui.add}
                </button>
              </div>
              {team.length === 0 ? (
                <div className="text-center py-10 text-white/20">
                  <Users size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">{ui.noTeam}</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {team.map((member, idx) => (
                    <div key={idx} className="border border-white/[0.06] rounded-xl p-5 space-y-4 relative bg-white/[0.02]">
                      <button type="button" onClick={() => removeMember(idx)} className="absolute top-4 right-4 p-1.5 text-red-400/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"><Trash2 size={13} /></button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className={`${lbl} flex items-center gap-1.5`}><ImageIcon size={11} /> {ui.photo}</label>
                          <div className="relative group cursor-pointer">
                            <input type="file" accept="image/*" onChange={(e) => handleMemberPhoto(e, idx)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                            <div className="flex items-center gap-3 p-3 bg-white/[0.03] border border-white/[0.07] rounded-xl group-hover:border-white/20 transition-all">
                              {member.photo ? <img src={member.photo} className="w-10 h-10 rounded-full object-cover" alt={member.name} /> : <div className="w-10 h-10 rounded-full bg-white/[0.05] flex items-center justify-center"><UserPlus size={16} className="text-white/20" /></div>}
                              <span className="text-xs text-white/30">{ui.clickUpload}</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className={`${lbl} flex items-center gap-1.5`}><Users size={11} /> {ui.name}</label>
                          <input type="text" className={inp} placeholder="" value={member.name || ""} onChange={(e) => updateMember(idx, "name", e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <label className={`${lbl} flex items-center gap-1.5`}><Briefcase size={11} /> {ui.role}</label>
                          <input type="text" className={inp} placeholder="" value={member.role || ""} onChange={(e) => updateMember(idx, "role", e.target.value)} />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <label className={`${lbl} flex items-center gap-1.5`}><FileText size={11} /> {ui.bio}</label>
                          <textarea rows={3} className={`${inp} resize-none`} placeholder={ui.bioPlaceholder} value={member.bio || ""} onChange={(e) => updateMember(idx, "bio", e.target.value)} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ⑤ Page About */}
            <div className="rounded-2xl p-7 space-y-5" style={card}>
              <h3 className={sHdr}><Type size={15} style={{ color: brandColor }} /> {ui.about}</h3>
              <div className="space-y-2">
                <label className={lbl}>{ui.title}</label>
                <input type="text" className={inp} placeholder="L'art de vivre l'exceptionnel..." value={form.about_title || ""} onChange={(e) => setForm((p: any) => ({ ...p, about_title: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <label className={lbl}>{ui.content}</label>
                <textarea rows={5} className={`${inp} resize-none`} placeholder={ui.aboutPlaceholder} value={form.about_text || ""} onChange={(e) => setForm((p: any) => ({ ...p, about_text: e.target.value }))} />
              </div>
            </div>

            {/* ⑥ {ui.legal} */}
            <div className="rounded-2xl p-7 space-y-5" style={card}>
              <h3 className={sHdr}><ShieldCheck size={15} style={{ color: brandColor }} /> {ui.legal}</h3>
              <div className="flex items-center justify-between p-4 bg-white/[0.03] rounded-xl border border-white/[0.05]">
                <div>
                  <p className="text-sm font-semibold text-white/80">{ui.cookies}</p>
                  <p className="text-[9px] text-white/30 uppercase tracking-tight font-bold mt-0.5">{ui.rgpd}</p>
                </div>
                <Toggle checked={!!form.cookie_consent_enabled} onChange={(v) => setForm((p: any) => ({ ...p, cookie_consent_enabled: v }))} />
              </div>
              <div className="space-y-2">
                <label className={lbl}>{ui.privacy}</label>
                <textarea rows={5} className={`${inp} resize-none`} placeholder={ui.privacyPlaceholder} value={form.privacy_policy || ""} onChange={(e) => setForm((p: any) => ({ ...p, privacy_policy: e.target.value }))} />
              </div>
            </div>

          </div>

          {/* Live Preview */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <div className="rounded-2xl overflow-hidden" style={{ border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)", boxShadow: isDark ? "none" : "0 2px 8px rgba(0,0,0,0.06)" }}>
                <div className={`flex items-center gap-2 px-4 py-3 border-b ${isDark ? "border-white/[0.05] bg-white/[0.02]" : "border-slate-100 bg-slate-50"}`}>
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                  <div className={`flex-1 ml-2 rounded-md px-3 py-1.5 text-[9px] font-mono truncate border ${isDark ? "bg-white/[0.04] text-white/25 border-white/[0.04]" : "bg-white text-slate-400 border-slate-200"}`}>
                    {slug}.habihub.io
                  </div>
                </div>
                <div className="p-1">
                  <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-slate-900" style={{ fontFamily: form.font_family || "Montserrat, sans-serif" }}>
                    {form.hero_url && form.hero_type === "video" && (
                      <video key={form.hero_url} src={form.hero_url} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-60" />
                    )}
                    {form.hero_url && form.hero_type !== "video" && (
                      <img src={form.hero_url} className="absolute inset-0 w-full h-full object-cover opacity-60" alt="BG" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                    <div className="absolute inset-0 p-5 flex flex-col justify-between">
                      <div>
                        {form.logo_url
                          ? <img src={form.logo_url} className="h-7 object-contain bg-white/10 backdrop-blur-md p-1 rounded-lg" alt="Logo" />
                          : <div className="w-7 h-7 rounded-lg" style={{ backgroundColor: form.primary_color || "#D4AF37" }} />
                        }
                      </div>
                      <div className="space-y-2.5">
                        <h4 className="text-white text-base font-serif italic leading-tight">{form.hero_title || ui.heroPlaceholder}</h4>
                        <div
                          className="h-8 w-20 flex items-center justify-center text-[9px] font-bold text-white uppercase tracking-widest"
                          style={{ backgroundColor: form.button_color || "#2563eb", borderRadius: form.button_style === "rounded-full" ? "9999px" : "4px" }}
                        >
                          {ui.discover}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className={`px-4 py-3 border-t ${isDark ? "border-white/[0.05]" : "border-slate-100"}`}>
                  <span className={`text-[9px] font-mono uppercase tracking-widest ${isDark ? "text-white/20" : "text-slate-400"}`}>{ui.livePreview}</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
