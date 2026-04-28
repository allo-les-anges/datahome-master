"use client";

import React, { useState } from "react";
import {
  ArrowLeft, Save, Loader2, CheckCircle2, AlertCircle,
  Palette, Layout, Share2, Users, Type, ShieldCheck,
  UploadCloud, Trash2, UserPlus, Image as ImageIcon, Mail, Phone,
  Facebook, Instagram, Linkedin, Briefcase, FileText,
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
  locale: string;
  onBack: () => void;
  onSaved: (updated: any) => void;
}

export default function ClientDashboard({ agency, slug, agencyId, onBack, onSaved }: Props) {
  const [form, setForm] = useState<any>({ ...agency });
  const [team, setTeam] = useState<Member[]>(agency.team_data || []);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const brandColor = form.primary_color || "#D4AF37";
  const fontFamily = form.font_family || "Montserrat";

  const inp = "w-full px-4 py-3.5 rounded-2xl border text-sm text-white placeholder:text-white/20 focus:outline-none transition-all bg-white/[0.04] border-white/[0.07] focus:border-white/20";
  const lbl = "block text-[10px] font-bold uppercase tracking-widest text-white/40 mb-2";
  const sHdr = "flex items-center gap-3 font-bold text-white/80 uppercase text-xs tracking-widest border-b border-white/[0.06] pb-4 mb-5";
  const card = {
    background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%)",
    border: "1px solid rgba(255,255,255,0.08)",
    backdropFilter: "blur(12px)",
  };

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
    if (file.size > 5 * 1024 * 1024) { setMessage({ type: "err", text: "Image max 5 Mo" }); return; }
    setIsSaving(true);
    try {
      const ext = file.name.split(".").pop();
      const url = await uploadFile(file, `${slug}/branding/logo_${Date.now()}.${ext}`);
      setForm((p: any) => ({ ...p, logo_url: url }));
    } catch { setMessage({ type: "err", text: "Erreur upload logo" }); }
    finally { setIsSaving(false); }
  };

  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const isVideo = file.type.startsWith("video/");
    if (file.size > (isVideo ? 50 : 5) * 1024 * 1024) {
      setMessage({ type: "err", text: isVideo ? "Vidéo max 50 Mo" : "Image max 5 Mo" });
      return;
    }
    setIsSaving(true);
    try {
      const ext = file.name.split(".").pop();
      const url = await uploadFile(file, `${slug}/${isVideo ? "hero-video" : "hero"}/${Date.now()}.${ext}`);
      setForm((p: any) => ({ ...p, hero_url: url, hero_type: isVideo ? "video" : "image" }));
    } catch { setMessage({ type: "err", text: "Erreur upload hero" }); }
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
    } catch { setMessage({ type: "err", text: "Erreur upload photo" }); }
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

  const handleSave = async () => {
    setIsSaving(true);
    setMessage(null);
    try {
      let fc = form.footer_config || {};
      if (typeof fc === "string") try { fc = JSON.parse(fc); } catch { fc = {}; }
      const res = await fetch("/api/property-manager/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
            team_data: team,
            footer_config: fc,
            updated_at: new Date().toISOString(),
          },
        }),
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || "Erreur");
      setMessage({ type: "ok", text: "Modifications sauvegardées !" });
      onSaved(json.agency);
      setTimeout(() => setMessage(null), 3000);
    } catch (err: any) {
      setMessage({ type: "err", text: err.message || "Erreur serveur" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d]" style={{ fontFamily: `${fontFamily}, sans-serif` }}>

      {/* Header */}
      <div
        className="sticky top-0 z-50 px-6 py-4 flex items-center justify-between"
        style={{ background: "rgba(13,13,13,0.9)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.06)" }}
      >
        <div className="flex items-center gap-3">
          <button type="button" onClick={onBack} className="p-2 rounded-xl hover:bg-white/5 transition-all text-white/40 hover:text-white/70">
            <ArrowLeft size={18} />
          </button>
          {form.logo_url
            ? <img src={form.logo_url} alt="" className="h-8 object-contain" />
            : <div className="w-9 h-9 rounded-xl flex items-center justify-center text-black font-bold" style={{ backgroundColor: brandColor }}>{form.agency_name?.charAt(0)}</div>
          }
          <div>
            <p className="text-sm font-bold text-white">{form.agency_name}</p>
            <p className="text-[10px] text-white/25 uppercase tracking-widest font-bold">Paramètres</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
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
            {isSaving ? "Sauvegarde..." : "Sauvegarder"}
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-5">

            {/* ① Identité Visuelle */}
            <div className="rounded-2xl p-7 space-y-5" style={card}>
              <h3 className={sHdr}><Palette size={15} style={{ color: brandColor }} /> Identité Visuelle & Couleurs</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className={lbl}>Logo de l'agence</label>
                  <div className="relative group cursor-pointer">
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    <div className="w-full border-2 border-dashed border-white/[0.08] rounded-xl p-5 flex flex-col items-center gap-2 bg-white/[0.02] group-hover:bg-white/[0.04] group-hover:border-white/20 transition-all">
                      {form.logo_url
                        ? <img src={form.logo_url} className="h-12 object-contain" alt="Logo" />
                        : <><UploadCloud className="text-white/20 group-hover:text-white/50 transition-colors" size={20} /><span className="text-xs text-white/30">Cliquer pour uploader</span></>
                      }
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className={lbl}>Police d'écriture</label>
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
                  <label className={lbl}>Couleur principale</label>
                  <div className="flex gap-3">
                    <input type="color" value={form.primary_color || "#D4AF37"} onChange={(e) => setForm((p: any) => ({ ...p, primary_color: e.target.value }))} className="h-[52px] w-16 rounded-xl cursor-pointer bg-white/[0.05] border border-white/[0.08] p-1" />
                    <input type="text" value={form.primary_color || ""} onChange={(e) => setForm((p: any) => ({ ...p, primary_color: e.target.value }))} className={`${inp} flex-1 font-mono uppercase`} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className={lbl}>Couleur des boutons</label>
                  <div className="flex gap-3">
                    <input type="color" value={form.button_color || "#2563eb"} onChange={(e) => setForm((p: any) => ({ ...p, button_color: e.target.value }))} className="h-[52px] w-16 rounded-xl cursor-pointer bg-white/[0.05] border border-white/[0.08] p-1" />
                    <input type="text" value={form.button_color || ""} onChange={(e) => setForm((p: any) => ({ ...p, button_color: e.target.value }))} className={`${inp} flex-1 font-mono uppercase`} />
                  </div>
                </div>
              </div>
              <div className="space-y-3 pt-4 border-t border-white/[0.05]">
                <label className={lbl}>Style des boutons</label>
                <div className="grid grid-cols-2 gap-3">
                  {[{ value: "rounded-none", label: "Bords Droits" }, { value: "rounded-full", label: "Bords Arrondis" }].map(opt => (
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
                <label className={lbl}>Animation des boutons</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: "none", label: "Aucune" },
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

            {/* ② Hero Header */}
            <div className="rounded-2xl p-7 space-y-5" style={card}>
              <h3 className={sHdr}><Layout size={15} style={{ color: brandColor }} /> Hero Header</h3>
              <div>
                <label className={lbl}>Type de média</label>
                <div className="flex p-1 bg-white/[0.04] border border-white/[0.06] rounded-xl w-fit">
                  <button type="button" onClick={() => setForm((p: any) => ({ ...p, hero_type: "image" }))} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all ${form.hero_type !== "video" ? "bg-white/15 text-white" : "text-white/40 hover:text-white/60"}`}><ImageIcon size={13} /> Image</button>
                  <button type="button" onClick={() => setForm((p: any) => ({ ...p, hero_type: "video" }))} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all ${form.hero_type === "video" ? "bg-white/15 text-white" : "text-white/40 hover:text-white/60"}`}>🎬 Vidéo</button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className={lbl}>Fichier {form.hero_type === "video" ? "vidéo" : "image"}</label>
                  <div className="relative group">
                    <input type="file" accept="image/*,video/mp4" onChange={handleHeroUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                    <div className="w-full border-2 border-dashed border-white/[0.08] rounded-xl p-5 flex flex-col items-center gap-2 bg-white/[0.02] group-hover:bg-white/[0.04] group-hover:border-white/20 transition-all">
                      <UploadCloud className="text-white/20 group-hover:text-white/50 transition-colors" size={20} />
                      <span className="text-xs text-white/30">{form.hero_url ? "Changer le média" : "Uploader un média"}</span>
                      <span className="text-[9px] text-white/20">Image ou vidéo MP4 · max 50 Mo</span>
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
                  <label className={lbl}>Titre d'accroche</label>
                  <textarea rows={4} value={form.hero_title || ""} onChange={(e) => setForm((p: any) => ({ ...p, hero_title: e.target.value }))} placeholder="Découvrez nos biens d'exception..." className={`${inp} resize-none font-serif italic text-base`} />
                </div>
              </div>
            </div>

            {/* ③ Contact & Réseaux Sociaux */}
            <div className="rounded-2xl p-7 space-y-5" style={card}>
              <h3 className={sHdr}><Share2 size={15} style={{ color: brandColor }} /> Réseaux Sociaux & Contact</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative"><Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" size={15} /><input placeholder="LinkedIn" className={`${inp} pl-11`} value={form.footer_config?.socials?.linkedin || ""} onChange={(e) => updateNested("socials", "linkedin", e.target.value)} /></div>
                <div className="relative"><TikTokIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" size={15} /><input placeholder="TikTok" className={`${inp} pl-11`} value={form.footer_config?.socials?.tiktok || ""} onChange={(e) => updateNested("socials", "tiktok", e.target.value)} /></div>
                <div className="relative"><Facebook className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" size={15} /><input placeholder="Facebook" className={`${inp} pl-11`} value={form.footer_config?.socials?.facebook || ""} onChange={(e) => updateNested("socials", "facebook", e.target.value)} /></div>
                <div className="relative"><Instagram className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" size={15} /><input placeholder="Instagram" className={`${inp} pl-11`} value={form.footer_config?.socials?.instagram || ""} onChange={(e) => updateNested("socials", "instagram", e.target.value)} /></div>
                <div className="md:col-span-2 pt-3 border-t border-white/[0.05] grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" size={15} /><input placeholder="Email de contact" className={`${inp} pl-11`} value={form.footer_config?.email || ""} onChange={(e) => updateRoot("email", e.target.value)} /></div>
                  <div className="relative"><Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" size={15} /><input placeholder="Téléphone" className={`${inp} pl-11`} value={form.footer_config?.phone || ""} onChange={(e) => updateRoot("phone", e.target.value)} /></div>
                </div>
              </div>
            </div>

            {/* ④ Équipe */}
            <div className="rounded-2xl p-7 space-y-5" style={card}>
              <div className="flex justify-between items-center border-b border-white/[0.06] pb-4">
                <h3 className="flex items-center gap-3 font-bold text-white/80 uppercase text-xs tracking-widest"><Users size={15} style={{ color: brandColor }} /> Gestion de l'Équipe</h3>
                <button type="button" onClick={addMember} className="flex items-center gap-2 px-4 py-2 border border-white/10 text-white rounded-xl text-xs font-bold hover:bg-white/5 transition-all">
                  <UserPlus size={13} /> Ajouter
                </button>
              </div>
              {team.length === 0 ? (
                <div className="text-center py-10 text-white/20">
                  <Users size={40} className="mx-auto mb-3 opacity-30" />
                  <p className="text-sm">Aucun membre dans l'équipe.</p>
                </div>
              ) : (
                <div className="space-y-5">
                  {team.map((member, idx) => (
                    <div key={idx} className="border border-white/[0.06] rounded-xl p-5 space-y-4 relative bg-white/[0.02]">
                      <button type="button" onClick={() => removeMember(idx)} className="absolute top-4 right-4 p-1.5 text-red-400/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"><Trash2 size={13} /></button>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className={`${lbl} flex items-center gap-1.5`}><ImageIcon size={11} /> Photo</label>
                          <div className="relative group cursor-pointer">
                            <input type="file" accept="image/*" onChange={(e) => handleMemberPhoto(e, idx)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                            <div className="flex items-center gap-3 p-3 bg-white/[0.03] border border-white/[0.07] rounded-xl group-hover:border-white/20 transition-all">
                              {member.photo ? <img src={member.photo} className="w-10 h-10 rounded-full object-cover" alt={member.name} /> : <div className="w-10 h-10 rounded-full bg-white/[0.05] flex items-center justify-center"><UserPlus size={16} className="text-white/20" /></div>}
                              <span className="text-xs text-white/30">Cliquer pour uploader</span>
                            </div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className={`${lbl} flex items-center gap-1.5`}><Users size={11} /> Nom</label>
                          <input type="text" className={inp} placeholder="Prénom Nom" value={member.name || ""} onChange={(e) => updateMember(idx, "name", e.target.value)} />
                        </div>
                        <div className="space-y-2">
                          <label className={`${lbl} flex items-center gap-1.5`}><Briefcase size={11} /> Poste</label>
                          <input type="text" className={inp} placeholder="Agent immobilier" value={member.role || ""} onChange={(e) => updateMember(idx, "role", e.target.value)} />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <label className={`${lbl} flex items-center gap-1.5`}><FileText size={11} /> Bio</label>
                          <textarea rows={3} className={`${inp} resize-none`} placeholder="Courte biographie..." value={member.bio || ""} onChange={(e) => updateMember(idx, "bio", e.target.value)} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ⑤ Page About */}
            <div className="rounded-2xl p-7 space-y-5" style={card}>
              <h3 className={sHdr}><Type size={15} style={{ color: brandColor }} /> Page À Propos</h3>
              <div className="space-y-2">
                <label className={lbl}>Titre</label>
                <input type="text" className={inp} placeholder="L'art de vivre l'exceptionnel..." value={form.about_title || ""} onChange={(e) => setForm((p: any) => ({ ...p, about_title: e.target.value }))} />
              </div>
              <div className="space-y-2">
                <label className={lbl}>Contenu</label>
                <textarea rows={5} className={`${inp} resize-none`} placeholder="Décrivez votre agence..." value={form.about_text || ""} onChange={(e) => setForm((p: any) => ({ ...p, about_text: e.target.value }))} />
              </div>
            </div>

            {/* ⑥ Conformité & Légal */}
            <div className="rounded-2xl p-7 space-y-5" style={card}>
              <h3 className={sHdr}><ShieldCheck size={15} style={{ color: brandColor }} /> Conformité & Légal</h3>
              <div className="flex items-center justify-between p-4 bg-white/[0.03] rounded-xl border border-white/[0.05]">
                <div>
                  <p className="text-sm font-semibold text-white/80">Bandeau de Cookies</p>
                  <p className="text-[9px] text-white/30 uppercase tracking-tight font-bold mt-0.5">Conformité RGPD</p>
                </div>
                <Toggle checked={!!form.cookie_consent_enabled} onChange={(v) => setForm((p: any) => ({ ...p, cookie_consent_enabled: v }))} />
              </div>
              <div className="space-y-2">
                <label className={lbl}>Mentions légales & Politique de confidentialité</label>
                <textarea rows={5} className={`${inp} resize-none`} placeholder="Saisissez ici les mentions légales..." value={form.privacy_policy || ""} onChange={(e) => setForm((p: any) => ({ ...p, privacy_policy: e.target.value }))} />
              </div>
            </div>

          </div>

          {/* Live Preview */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <div className="rounded-2xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.05] bg-white/[0.02]">
                  <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                  <div className="flex-1 ml-2 bg-white/[0.04] rounded-md px-3 py-1.5 text-[9px] text-white/25 font-mono truncate border border-white/[0.04]">
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
                        <h4 className="text-white text-base font-serif italic leading-tight">{form.hero_title || "Découvrez nos biens d'exception..."}</h4>
                        <div
                          className="h-8 w-20 flex items-center justify-center text-[9px] font-bold text-white uppercase tracking-widest"
                          style={{ backgroundColor: form.button_color || "#2563eb", borderRadius: form.button_style === "rounded-full" ? "9999px" : "4px" }}
                        >
                          Découvrir
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="px-4 py-3 border-t border-white/[0.05]">
                  <span className="text-[9px] text-white/20 font-mono uppercase tracking-widest">Aperçu en temps réel</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
