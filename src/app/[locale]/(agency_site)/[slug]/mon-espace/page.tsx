"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams } from 'next/navigation';
import {
  Home, LogOut, Plus, Pencil, Trash2, X, Eye, EyeOff,
  Loader2, CheckCircle2, AlertCircle, Upload, Key, Save,
  BedDouble, Bath, Maximize2, MapPin, ChevronDown, Image as ImageIcon
} from 'lucide-react';

const SESSION_KEY = 'pm_session';
const SESSION_DURATION = 8 * 60 * 60 * 1000; // 8h

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

const PROPERTY_TYPES = ['Villa', 'Appartement', 'Penthouse', 'Bungalow', 'Maison', 'Terrain', 'Commercial'];

const emptyForm = {
  titre_fr: '', titre_en: '', price: '', town: '', region: '',
  beds: '', baths: '', surface_built: '', type: 'Villa',
  pool: 'Non', description_fr: '', description_en: '',
};

// ─── Sous-composant : formulaire bien ─────────────────────────────────────────
function PropertyForm({
  initial, agencyId, slug, brandColor, onSaved, onCancel,
}: {
  initial?: Partial<Property> | null;
  agencyId: string;
  slug: string;
  brandColor: string;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState({ ...emptyForm, ...(initial || {}) });
  const [images, setImages] = useState<string[]>(initial?.images || []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleUpload = async (files: FileList) => {
    setUploading(true);
    const newUrls: string[] = [];
    for (const file of Array.from(files)) {
      const ext = file.name.split('.').pop();
      const path = `${slug}/properties/${initial?.id || 'new'}_${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('agencies').upload(path, file, { upsert: true });
      if (!upErr) {
        const { data } = supabase.storage.from('agencies').getPublicUrl(path);
        newUrls.push(data.publicUrl);
      }
    }
    setImages(prev => [...prev, ...newUrls]);
    setUploading(false);
  };

  const handleSave = async () => {
    if (!form.titre_fr || !form.price || !form.town) {
      setError('Titre (FR), prix et ville sont obligatoires.');
      return;
    }
    setSaving(true);
    setError('');
    const payload = {
      ...form,
      price: Number(form.price),
      beds: Number(form.beds) || 0,
      baths: Number(form.baths) || 0,
      images,
      agency_id: agencyId,
      ...(initial?.id ? { id: initial.id } : {}),
    };
    const res = await fetch(
      `/api/property-manager/properties`,
      { method: initial?.id ? 'PUT' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) }
    );
    const data = await res.json();
    setSaving(false);
    if (data.error) { setError(data.error); return; }
    onSaved();
  };

  const field = (label: string, key: string, type = 'text', placeholder = '') => (
    <div className="space-y-1.5">
      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={(form as any)[key] || ''}
        onChange={e => set(key, e.target.value)}
        className="w-full px-4 py-3 rounded-2xl border border-slate-100 bg-slate-50 text-sm focus:outline-none focus:ring-2 transition-all"
        style={{ '--tw-ring-color': brandColor } as any}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {field('Titre (Français) *', 'titre_fr', 'text', 'Belle villa avec vue mer...')}
        {field('Titre (Anglais)', 'titre_en', 'text', 'Stunning sea view villa...')}
        {field('Prix (€) *', 'price', 'number', '350000')}
        {field('Ville *', 'town', 'text', 'Marbella')}
        {field('Région', 'region', 'text', 'Andalousie')}
        {field('Chambres', 'beds', 'number', '3')}
        {field('Salles de bain', 'baths', 'number', '2')}
        {field('Surface (m²)', 'surface_built', 'number', '180')}
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Type</label>
          <select value={form.type} onChange={e => set('type', e.target.value)}
            className="w-full px-4 py-3 rounded-2xl border border-slate-100 bg-slate-50 text-sm focus:outline-none">
            {PROPERTY_TYPES.map(t => <option key={t}>{t}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Piscine</label>
          <div className="flex gap-3">
            {['Oui', 'Non'].map(v => (
              <button key={v} type="button"
                onClick={() => set('pool', v)}
                className={`flex-1 py-3 rounded-2xl text-sm font-bold transition-all ${form.pool === v ? 'text-white shadow-md' : 'bg-slate-100 text-slate-500'}`}
                style={{ backgroundColor: form.pool === v ? brandColor : undefined }}>
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-1.5">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description (Français)</label>
        <textarea rows={4} value={form.description_fr} onChange={e => set('description_fr', e.target.value)}
          className="w-full px-4 py-3 rounded-2xl border border-slate-100 bg-slate-50 text-sm focus:outline-none resize-none" />
      </div>
      <div className="space-y-1.5">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Description (Anglais)</label>
        <textarea rows={4} value={form.description_en} onChange={e => set('description_en', e.target.value)}
          className="w-full px-4 py-3 rounded-2xl border border-slate-100 bg-slate-50 text-sm focus:outline-none resize-none" />
      </div>

      {/* Upload photos */}
      <div className="space-y-3">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Photos</label>
        <button type="button" onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="w-full py-4 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center gap-2 text-sm text-slate-400 hover:border-slate-300 transition-all">
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
          {uploading ? 'Upload en cours...' : 'Cliquez pour ajouter des photos'}
        </button>
        <input ref={fileRef} type="file" multiple accept="image/*" className="hidden"
          onChange={e => e.target.files && handleUpload(e.target.files)} />
        {images.length > 0 && (
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
            {images.map((url, i) => (
              <div key={i} className="relative group aspect-square rounded-xl overflow-hidden bg-slate-100">
                <img src={url} className="w-full h-full object-cover" alt="" />
                <button type="button" onClick={() => setImages(imgs => imgs.filter((_, j) => j !== i))}
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                  <X size={16} className="text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl border border-red-100">
          <AlertCircle size={14} className="text-red-500 shrink-0" />
          <p className="text-xs text-red-600 font-medium">{error}</p>
        </div>
      )}

      <div className="flex gap-3 pt-2">
        <button type="button" onClick={onCancel}
          className="flex-1 py-3.5 rounded-2xl border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all">
          Annuler
        </button>
        <button type="button" onClick={handleSave} disabled={saving}
          className="flex-1 py-3.5 rounded-2xl text-sm font-black text-black flex items-center justify-center gap-2 transition-all hover:opacity-90"
          style={{ backgroundColor: brandColor }}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {initial?.id ? 'Enregistrer' : 'Ajouter le bien'}
        </button>
      </div>
    </div>
  );
}

// ─── Composant principal ───────────────────────────────────────────────────────
export default function MonEspacePage() {
  const params = useParams();
  const slug = params?.slug as string;
  const locale = (params?.locale as string) || 'fr';

  const [agency, setAgency] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<PmSession | null>(null);

  // Auth states
  const [mode, setMode] = useState<'login' | 'create'>('login');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // Dashboard states
  const [properties, setProperties] = useState<Property[]>([]);
  const [propLoading, setPropLoading] = useState(false);
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editing, setEditing] = useState<Partial<Property> | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Change password modal
  const [showChangePw, setShowChangePw] = useState(false);
  const [cpCurrent, setCpCurrent] = useState('');
  const [cpNew, setCpNew] = useState('');
  const [cpConfirm, setCpConfirm] = useState('');
  const [cpLoading, setCpLoading] = useState(false);
  const [cpMsg, setCpMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const brandColor = agency?.primary_color || '#D4AF37';
  const fontFamily = agency?.font_family || 'Montserrat';

  // Charge l'agence
  useEffect(() => {
    if (!slug) return;
    supabase
      .from('agency_settings')
      .select('id, agency_name, primary_color, font_family, logo_url, property_manager_enabled, property_manager_password')
      .eq('subdomain', slug)
      .maybeSingle()
      .then(({ data }) => { setAgency(data); setLoading(false); });
  }, [slug]);

  // Vérifie la session
  useEffect(() => {
    if (!agency) return;
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return;
      const s: PmSession = JSON.parse(raw);
      if (s.slug === slug && s.agencyId === String(agency.id) && Date.now() < s.exp) {
        setSession(s);
      } else {
        sessionStorage.removeItem(SESSION_KEY);
      }
    } catch { sessionStorage.removeItem(SESSION_KEY); }
  }, [agency, slug]);

  // Détermine le mode (création ou connexion)
  useEffect(() => {
    if (!agency) return;
    setMode(agency.property_manager_password ? 'login' : 'create');
  }, [agency]);

  // Charge les biens
  const loadProperties = useCallback(async () => {
    if (!session) return;
    setPropLoading(true);
    const res = await fetch(`/api/property-manager/properties?agency_id=${session.agencyId}`);
    const { data } = await res.json();
    setProperties(data || []);
    setPropLoading(false);
  }, [session]);

  useEffect(() => { if (session) loadProperties(); }, [session, loadProperties]);

  const handleAuth = async () => {
    setAuthError('');
    if (mode === 'create') {
      if (password.length < 8) { setAuthError('Minimum 8 caractères.'); return; }
      if (password !== confirm) { setAuthError('Les mots de passe ne correspondent pas.'); return; }
    }
    setAuthLoading(true);
    const res = await fetch('/api/property-manager/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: mode === 'create' ? 'set-password' : 'login', slug, password }),
    });
    const data = await res.json();
    setAuthLoading(false);
    if (!data.success) { setAuthError(data.error || 'Erreur'); return; }
    const s: PmSession = { agencyId: String(data.agencyId || agency.id), slug, exp: Date.now() + SESSION_DURATION };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(s));
    setSession(s);
  };

  const handleLogout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setSession(null);
    setProperties([]);
  };

  const handleDelete = async (id: number) => {
    if (!session) return;
    setDeleting(true);
    await fetch(`/api/property-manager/properties?id=${id}&agency_id=${session.agencyId}`, { method: 'DELETE' });
    setDeleteId(null);
    setDeleting(false);
    loadProperties();
  };

  const handleChangePw = async () => {
    setCpMsg(null);
    if (cpNew.length < 8) { setCpMsg({ type: 'err', text: 'Minimum 8 caractères.' }); return; }
    if (cpNew !== cpConfirm) { setCpMsg({ type: 'err', text: 'Les mots de passe ne correspondent pas.' }); return; }
    setCpLoading(true);
    const res = await fetch('/api/property-manager/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'change-password', slug, password: cpCurrent, currentPassword: cpCurrent, newPassword: cpNew }),
    });
    const data = await res.json();
    setCpLoading(false);
    if (!data.success) { setCpMsg({ type: 'err', text: data.error || 'Erreur' }); return; }
    setCpMsg({ type: 'ok', text: 'Mot de passe mis à jour !' });
    setCpCurrent(''); setCpNew(''); setCpConfirm('');
  };

  // ── Loading ──
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 size={32} className="animate-spin text-slate-300" />
      </div>
    );
  }

  // ── Agence introuvable ──
  if (!agency) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-400 font-medium">Agence introuvable.</p>
      </div>
    );
  }

  // ── Module non activé ──
  if (!agency.property_manager_enabled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6" style={{ fontFamily: `${fontFamily}, sans-serif` }}>
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white text-2xl font-bold"
            style={{ backgroundColor: brandColor }}>
            {agency.agency_name?.charAt(0)}
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">{agency.agency_name}</h1>
          <p className="text-sm text-slate-500">Module Property Manager non activé.</p>
          <p className="text-xs text-slate-400 mt-1">Contactez votre administrateur pour l'activer.</p>
        </div>
      </div>
    );
  }

  // ── Formulaire d'authentification ──
  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6" style={{ fontFamily: `${fontFamily}, sans-serif` }}>
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            {agency.logo_url
              ? <img src={agency.logo_url} alt={agency.agency_name} className="h-12 mx-auto mb-4 object-contain" />
              : <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white text-2xl font-bold" style={{ backgroundColor: brandColor }}>{agency.agency_name?.charAt(0)}</div>
            }
            <h1 className="text-2xl font-bold text-slate-900">Espace Agence</h1>
            <p className="text-sm text-slate-400 mt-1">
              {mode === 'create' ? 'Bienvenue ! Créez votre mot de passe.' : agency.agency_name}
            </p>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-xl p-8 space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {mode === 'create' ? 'Créer un mot de passe' : 'Mot de passe'}
              </label>
              <div className="relative">
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAuth()}
                  placeholder="••••••••"
                  className="w-full px-4 py-3.5 pr-12 rounded-2xl border border-slate-100 bg-slate-50 text-sm focus:outline-none"
                />
                <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {mode === 'create' && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Confirmer le mot de passe</label>
                <input
                  type="password"
                  value={confirm}
                  onChange={e => setConfirm(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAuth()}
                  placeholder="••••••••"
                  className="w-full px-4 py-3.5 rounded-2xl border border-slate-100 bg-slate-50 text-sm focus:outline-none"
                />
              </div>
            )}

            {authError && (
              <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl border border-red-100">
                <AlertCircle size={14} className="text-red-500 shrink-0" />
                <p className="text-xs text-red-600 font-medium">{authError}</p>
              </div>
            )}

            <button onClick={handleAuth} disabled={authLoading}
              className="w-full py-4 rounded-2xl text-sm font-black text-black flex items-center justify-center gap-2 transition-all hover:opacity-90"
              style={{ backgroundColor: brandColor }}>
              {authLoading ? <Loader2 size={16} className="animate-spin" /> : <Key size={16} />}
              {mode === 'create' ? 'Créer mon accès' : 'Se connecter'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Dashboard ──
  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: `${fontFamily}, sans-serif` }}>

      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          {agency.logo_url
            ? <img src={agency.logo_url} alt={agency.agency_name} className="h-8 object-contain" />
            : <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: brandColor }}>{agency.agency_name?.charAt(0)}</div>
          }
          <div>
            <p className="text-sm font-bold text-slate-900">{agency.agency_name}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Property Manager</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setShowChangePw(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">
            <Key size={13} /> Mot de passe
          </button>
          <button onClick={handleLogout}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-200 text-xs font-bold text-slate-600 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all">
            <LogOut size={13} /> Déconnexion
          </button>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-6xl mx-auto px-6 py-10">

        {view === 'list' ? (
          <>
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Mes biens</h2>
                <p className="text-sm text-slate-400 mt-0.5">{properties.length} bien{properties.length !== 1 ? 's' : ''} publié{properties.length !== 1 ? 's' : ''}</p>
              </div>
            </div>

            {propLoading ? (
              <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-slate-300" /></div>
            ) : properties.length === 0 ? (
              <div className="text-center py-24 bg-white rounded-[2.5rem] border border-slate-100">
                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                  <Home size={28} className="text-slate-300" />
                </div>
                <p className="text-slate-400 font-medium">Aucun bien pour l'instant</p>
                <p className="text-xs text-slate-300 mt-1">Ajoutez votre premier bien avec le bouton +</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {properties.map(p => (
                  <div key={p.id} className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-all group">
                    <div className="aspect-video bg-slate-100 relative overflow-hidden">
                      {p.images?.[0]
                        ? <img src={p.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={p.titre_fr} />
                        : <div className="w-full h-full flex items-center justify-center"><ImageIcon size={28} className="text-slate-200" /></div>
                      }
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/90 text-slate-700">{p.type}</span>
                      </div>
                    </div>
                    <div className="p-5">
                      <p className="font-bold text-slate-900 text-sm leading-tight line-clamp-1">{p.titre_fr || '(Sans titre)'}</p>
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin size={11} className="text-slate-300" />
                        <p className="text-xs text-slate-400">{p.town || '—'}</p>
                      </div>
                      <p className="text-lg font-black mt-3" style={{ color: brandColor }}>
                        {p.price ? Number(p.price).toLocaleString('fr-FR') + ' €' : '—'}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-400 font-medium">
                        {p.beds > 0 && <span className="flex items-center gap-1"><BedDouble size={12} /> {p.beds}</span>}
                        {p.baths > 0 && <span className="flex items-center gap-1"><Bath size={12} /> {p.baths}</span>}
                        {p.surface_built && <span className="flex items-center gap-1"><Maximize2 size={12} /> {p.surface_built} m²</span>}
                      </div>
                      <div className="flex gap-2 mt-4 pt-4 border-t border-slate-50">
                        <button onClick={() => { setEditing(p); setView('form'); }}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-600 transition-all">
                          <Pencil size={13} /> Modifier
                        </button>
                        <button onClick={() => setDeleteId(p.id)}
                          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-xs font-bold text-red-500 transition-all">
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* FAB Ajouter */}
            <button
              onClick={() => { setEditing(null); setView('form'); }}
              className="fixed bottom-8 right-8 w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-black transition-all hover:scale-110 active:scale-95"
              style={{ backgroundColor: brandColor }}>
              <Plus size={24} strokeWidth={2.5} />
            </button>
          </>
        ) : (
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center gap-3 mb-8">
              <button onClick={() => { setView('list'); setEditing(null); }}
                className="p-2 rounded-xl hover:bg-slate-100 transition-all text-slate-400">
                <X size={20} />
              </button>
              <div>
                <h2 className="text-xl font-bold text-slate-900">{editing?.id ? 'Modifier le bien' : 'Nouveau bien'}</h2>
                <p className="text-xs text-slate-400 mt-0.5">Remplissez les informations ci-dessous</p>
              </div>
            </div>
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
              <PropertyForm
                initial={editing}
                agencyId={session.agencyId}
                slug={slug}
                brandColor={brandColor}
                onSaved={() => { setView('list'); setEditing(null); loadProperties(); }}
                onCancel={() => { setView('list'); setEditing(null); }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Modale suppression */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 px-6">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl">
            <div className="w-12 h-12 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={22} className="text-red-500" />
            </div>
            <h3 className="text-center font-bold text-slate-900 mb-1">Supprimer ce bien ?</h3>
            <p className="text-center text-xs text-slate-400 mb-6">Cette action est irréversible.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-3 rounded-2xl border border-slate-200 text-sm font-bold text-slate-500">Annuler</button>
              <button onClick={() => handleDelete(deleteId)} disabled={deleting}
                className="flex-1 py-3 rounded-2xl bg-red-500 text-white text-sm font-bold flex items-center justify-center gap-2">
                {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale changement mot de passe */}
      {showChangePw && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 px-6">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-900">Changer le mot de passe</h3>
              <button onClick={() => { setShowChangePw(false); setCpMsg(null); }} className="p-1 hover:bg-slate-100 rounded-lg">
                <X size={16} className="text-slate-400" />
              </button>
            </div>
            <div className="space-y-4">
              {[['Mot de passe actuel', cpCurrent, setCpCurrent], ['Nouveau mot de passe', cpNew, setCpNew], ['Confirmer le nouveau', cpConfirm, setCpConfirm]].map(([label, val, setter]: any) => (
                <div key={label as string} className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label as string}</label>
                  <input type="password" value={val as string} onChange={e => setter(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-100 bg-slate-50 text-sm focus:outline-none" />
                </div>
              ))}
              {cpMsg && (
                <div className={`flex items-center gap-2 p-3 rounded-xl border ${cpMsg.type === 'ok' ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                  {cpMsg.type === 'ok' ? <CheckCircle2 size={14} className="text-green-500" /> : <AlertCircle size={14} className="text-red-500" />}
                  <p className={`text-xs font-medium ${cpMsg.type === 'ok' ? 'text-green-700' : 'text-red-600'}`}>{cpMsg.text}</p>
                </div>
              )}
              <button onClick={handleChangePw} disabled={cpLoading}
                className="w-full py-3.5 rounded-2xl text-sm font-black text-black flex items-center justify-center gap-2 mt-2"
                style={{ backgroundColor: brandColor }}>
                {cpLoading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                Mettre à jour
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
