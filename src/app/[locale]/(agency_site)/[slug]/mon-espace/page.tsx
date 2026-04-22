"use client";

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams } from 'next/navigation';
import {
  Home, LogOut, Plus, Pencil, Trash2, X, Eye, EyeOff,
  Loader2, CheckCircle2, AlertCircle, Upload, Key, Save,
  BedDouble, Bath, Maximize2, MapPin, Image as ImageIcon,
  ArrowLeft, Building2
} from 'lucide-react';

import fr from '@/dictionaries/fr.json';
import en from '@/dictionaries/en.json';
import es from '@/dictionaries/es.json';
import nl from '@/dictionaries/nl.json';
import pl from '@/dictionaries/pl.json';
import ar from '@/dictionaries/ar.json';

const dicts: Record<string, any> = { fr, en, es, nl, pl, ar };

const SESSION_KEY = 'pm_session';
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

const PROPERTY_TYPES = ['Villa', 'Appartement', 'Penthouse', 'Bungalow', 'Maison', 'Terrain', 'Commercial'];

const emptyForm = {
  titre_fr: '', titre_en: '', price: '', town: '', region: '',
  beds: '', baths: '', surface_built: '', type: 'Villa',
  pool: 'Non', description_fr: '', description_en: '',
};

// ─── Form ──────────────────────────────────────────────────────────────────────
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
      setError(dict.requiredFields);
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
    const res = await fetch('/api/property-manager/properties', {
      method: initial?.id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
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
        className="w-full px-4 py-3 rounded-2xl border border-slate-100 bg-white text-sm focus:outline-none focus:ring-2 transition-all shadow-sm"
        style={{ '--tw-ring-color': brandColor } as any}
      />
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Infos principales */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-4">Informations</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {field(dict.titleFr, 'titre_fr', 'text', 'Belle villa avec vue mer...')}
          {field(dict.titleEn, 'titre_en', 'text', 'Stunning sea view villa...')}
          {field(dict.price, 'price', 'number', '350000')}
          {field(dict.city, 'town', 'text', 'Marbella')}
          {field(dict.region, 'region', 'text', 'Andalousie')}
          {field(dict.beds, 'beds', 'number', '3')}
          {field(dict.baths, 'baths', 'number', '2')}
          {field(dict.surface, 'surface_built', 'number', '180')}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{dict.type}</label>
            <select value={form.type} onChange={e => set('type', e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-100 bg-white text-sm focus:outline-none shadow-sm">
              {PROPERTY_TYPES.map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{dict.pool}</label>
            <div className="flex gap-3">
              {[dict.yes, dict.no].map((v, i) => (
                <button key={v} type="button"
                  onClick={() => set('pool', i === 0 ? 'Oui' : 'Non')}
                  className={`flex-1 py-3 rounded-2xl text-sm font-bold transition-all shadow-sm ${(i === 0 ? form.pool === 'Oui' : form.pool === 'Non') ? 'text-white shadow-md' : 'bg-slate-50 text-slate-500 border border-slate-100'}`}
                  style={{ backgroundColor: (i === 0 ? form.pool === 'Oui' : form.pool === 'Non') ? brandColor : undefined }}>
                  {v}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Descriptions */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-4">Description</p>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{dict.descFr}</label>
            <textarea rows={4} value={form.description_fr} onChange={e => set('description_fr', e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-100 bg-white text-sm focus:outline-none resize-none shadow-sm" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{dict.descEn}</label>
            <textarea rows={4} value={form.description_en} onChange={e => set('description_en', e.target.value)}
              className="w-full px-4 py-3 rounded-2xl border border-slate-100 bg-white text-sm focus:outline-none resize-none shadow-sm" />
          </div>
        </div>
      </div>

      {/* Photos */}
      <div>
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-300 mb-4">{dict.photos}</p>
        <button type="button" onClick={() => fileRef.current?.click()} disabled={uploading}
          className="w-full py-5 rounded-2xl border-2 border-dashed border-slate-200 flex items-center justify-center gap-2 text-sm text-slate-400 hover:border-slate-300 hover:bg-slate-50 transition-all">
          {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
          {uploading ? dict.uploading : dict.addPhotos}
        </button>
        <input ref={fileRef} type="file" multiple accept="image/*" className="hidden"
          onChange={e => e.target.files && handleUpload(e.target.files)} />
        {images.length > 0 && (
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mt-3">
            {images.map((url, i) => (
              <div key={i} className="relative group aspect-square rounded-xl overflow-hidden bg-slate-100 shadow-sm">
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
          {dict.cancel}
        </button>
        <button type="button" onClick={handleSave} disabled={saving}
          className="flex-1 py-3.5 rounded-2xl text-sm font-black text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 shadow-lg"
          style={{ backgroundColor: brandColor }}>
          {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          {initial?.id ? dict.save : dict.addProperty}
        </button>
      </div>
    </div>
  );
}

// ─── Page principale ───────────────────────────────────────────────────────────
export default function MonEspacePage() {
  const params = useParams();
  const slug = params?.slug as string;
  const locale = (params?.locale as string) || 'fr';
  const dict = (dicts[locale] || dicts.fr).propertyManager;
  const isRtl = locale === 'ar';

  const [agency, setAgency] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<PmSession | null>(null);

  const [mode, setMode] = useState<'login' | 'create'>('login');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const [properties, setProperties] = useState<Property[]>([]);
  const [propLoading, setPropLoading] = useState(false);
  const [view, setView] = useState<'list' | 'form'>('list');
  const [editing, setEditing] = useState<Partial<Property> | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [showChangePw, setShowChangePw] = useState(false);
  const [cpCurrent, setCpCurrent] = useState('');
  const [cpNew, setCpNew] = useState('');
  const [cpConfirm, setCpConfirm] = useState('');
  const [cpLoading, setCpLoading] = useState(false);
  const [cpMsg, setCpMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const brandColor = agency?.primary_color || '#D4AF37';
  const fontFamily = agency?.font_family || 'Montserrat';

  useEffect(() => {
    if (!slug) return;
    supabase.from('agency_settings').select('*').eq('subdomain', slug).maybeSingle()
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
    setMode(agency.property_manager_password ? 'login' : 'create');
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

  const handleAuth = async () => {
    setAuthError('');
    if (mode === 'create') {
      if (password.length < 8) { setAuthError('Min. 8 chars'); return; }
      if (password !== confirm) { setAuthError('Passwords do not match'); return; }
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

  const handleLogout = () => { sessionStorage.removeItem(SESSION_KEY); setSession(null); setProperties([]); };

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
    if (cpNew.length < 8) { setCpMsg({ type: 'err', text: 'Min. 8 chars' }); return; }
    if (cpNew !== cpConfirm) { setCpMsg({ type: 'err', text: 'Passwords do not match' }); return; }
    setCpLoading(true);
    const res = await fetch('/api/property-manager/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'change-password', slug, password: cpCurrent, currentPassword: cpCurrent, newPassword: cpNew }),
    });
    const data = await res.json();
    setCpLoading(false);
    if (!data.success) { setCpMsg({ type: 'err', text: data.error || 'Erreur' }); return; }
    setCpMsg({ type: 'ok', text: dict.pwUpdated });
    setCpCurrent(''); setCpNew(''); setCpConfirm('');
  };

  // ── Loading ──
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <Loader2 size={32} className="animate-spin text-slate-300" />
    </div>
  );

  if (!agency) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <p className="text-slate-400 font-medium">Agency not found.</p>
    </div>
  );

  // ── Module non activé ──
  if (!agency.property_manager_enabled) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6" dir={isRtl ? 'rtl' : 'ltr'} style={{ fontFamily: `${fontFamily}, sans-serif` }}>
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white font-bold text-2xl" style={{ backgroundColor: brandColor }}>
          {agency.agency_name?.charAt(0)}
        </div>
        <h1 className="text-xl font-bold text-slate-900 mb-2">{agency.agency_name}</h1>
        <p className="text-sm text-slate-500">{dict.moduleOff}</p>
        <p className="text-xs text-slate-400 mt-1">{dict.moduleOffContact}</p>
      </div>
    </div>
  );

  // ── Auth ──
  if (!session) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-6" dir={isRtl ? 'rtl' : 'ltr'} style={{ fontFamily: `${fontFamily}, sans-serif` }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          {agency.logo_url
            ? <img src={agency.logo_url} alt={agency.agency_name} className="h-14 mx-auto mb-5 object-contain" />
            : <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 text-white text-2xl font-bold shadow-lg" style={{ backgroundColor: brandColor }}>{agency.agency_name?.charAt(0)}</div>
          }
          <h1 className="text-2xl font-bold text-slate-900">{dict.title}</h1>
          <p className="text-sm text-slate-400 mt-1">{mode === 'create' ? dict.welcome : agency.agency_name}</p>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-slate-200 p-8 space-y-5">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {mode === 'create' ? dict.createPwLabel : dict.pwLabel}
            </label>
            <div className="relative">
              <input type={showPw ? 'text' : 'password'} value={password}
                onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAuth()}
                placeholder="••••••••"
                className="w-full px-4 py-4 pr-12 rounded-2xl border border-slate-100 bg-slate-50 text-sm focus:outline-none focus:ring-2 transition-all"
                style={{ '--tw-ring-color': brandColor } as any} />
              <button type="button" onClick={() => setShowPw(v => !v)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {mode === 'create' && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{dict.confirmLabel}</label>
              <input type="password" value={confirm}
                onChange={e => setConfirm(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAuth()}
                placeholder="••••••••"
                className="w-full px-4 py-4 rounded-2xl border border-slate-100 bg-slate-50 text-sm focus:outline-none" />
            </div>
          )}

          {authError && (
            <div className="flex items-center gap-2 p-3 bg-red-50 rounded-xl border border-red-100">
              <AlertCircle size={14} className="text-red-500 shrink-0" />
              <p className="text-xs text-red-600 font-medium">{authError}</p>
            </div>
          )}

          <button type="button" onClick={handleAuth} disabled={authLoading}
            className="w-full py-4 rounded-2xl text-sm font-black text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 shadow-lg"
            style={{ backgroundColor: brandColor }}>
            {authLoading ? <Loader2 size={16} className="animate-spin" /> : <Key size={16} />}
            {mode === 'create' ? dict.createBtn : dict.loginBtn}
          </button>
        </div>
      </div>
    </div>
  );

  // ── Dashboard ──
  return (
    <div className="min-h-screen bg-slate-50" dir={isRtl ? 'rtl' : 'ltr'} style={{ fontFamily: `${fontFamily}, sans-serif` }}>

      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          {view === 'form' && (
            <button type="button" onClick={() => { setView('list'); setEditing(null); }}
              className="p-2 rounded-xl hover:bg-slate-100 transition-all text-slate-400 mr-1">
              <ArrowLeft size={18} />
            </button>
          )}
          {agency.logo_url
            ? <img src={agency.logo_url} alt={agency.agency_name} className="h-8 object-contain" />
            : <div className="w-9 h-9 rounded-xl flex items-center justify-center text-white font-bold shadow-sm" style={{ backgroundColor: brandColor }}>{agency.agency_name?.charAt(0)}</div>
          }
          <div>
            <p className="text-sm font-bold text-slate-900">{agency.agency_name}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">{dict.badge}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setShowChangePw(true)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">
            <Key size={13} /> {dict.changePwBtn}
          </button>
          <button type="button" onClick={handleLogout}
            className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-200 text-xs font-bold text-slate-600 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all">
            <LogOut size={13} /> {dict.logout}
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-10">

        {view === 'list' ? (
          <>
            {/* Titre + stats */}
            <div className="flex items-end justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-slate-900">{dict.myProperties}</h2>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: brandColor }} />
                  <p className="text-sm text-slate-400">
                    {properties.length} {properties.length <= 1 ? dict.published : dict.publishedPlural}
                  </p>
                </div>
              </div>
              <button type="button"
                onClick={() => { setEditing(null); setView('form'); }}
                className="flex items-center gap-2 px-5 py-3 rounded-2xl text-sm font-black text-white shadow-lg hover:opacity-90 transition-all active:scale-95"
                style={{ backgroundColor: brandColor }}>
                <Plus size={18} strokeWidth={2.5} /> {dict.addProperty}
              </button>
            </div>

            {propLoading ? (
              <div className="flex justify-center py-24"><Loader2 size={28} className="animate-spin text-slate-300" /></div>
            ) : properties.length === 0 ? (
              <div className="text-center py-28 bg-white rounded-[2.5rem] border border-slate-100 shadow-sm">
                <div className="w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-inner" style={{ backgroundColor: `${brandColor}15` }}>
                  <Building2 size={32} style={{ color: brandColor }} />
                </div>
                <p className="text-slate-700 font-bold text-lg">{dict.noProperties}</p>
                <p className="text-sm text-slate-400 mt-1">{dict.noPropertiesHint}</p>
                <button type="button"
                  onClick={() => { setEditing(null); setView('form'); }}
                  className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-black text-white shadow-md hover:opacity-90 transition-all"
                  style={{ backgroundColor: brandColor }}>
                  <Plus size={16} /> {dict.addProperty}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {properties.map(p => (
                  <div key={p.id} className="bg-white rounded-[2rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 group">
                    <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
                      {p.images?.[0]
                        ? <img src={p.images[0]} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={p.titre_fr} />
                        : <div className="w-full h-full flex flex-col items-center justify-center gap-2">
                            <ImageIcon size={32} className="text-slate-200" />
                          </div>
                      }
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute top-3 left-3">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-white/95 text-slate-700 shadow-sm">{p.type}</span>
                      </div>
                      {p.pool === 'Oui' && (
                        <div className="absolute top-3 right-3">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-500/90 text-white shadow-sm">Pool</span>
                        </div>
                      )}
                    </div>
                    <div className="p-5">
                      <p className="font-bold text-slate-900 text-sm leading-tight line-clamp-1 mb-1">{p.titre_fr || '(Sans titre)'}</p>
                      <div className="flex items-center gap-1 mb-3">
                        <MapPin size={11} className="text-slate-300 shrink-0" />
                        <p className="text-xs text-slate-400 truncate">{[p.town, p.region].filter(Boolean).join(', ') || '—'}</p>
                      </div>
                      <p className="text-xl font-black" style={{ color: brandColor }}>
                        {p.price ? Number(p.price).toLocaleString('fr-FR') + ' €' : '—'}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-400 font-medium">
                        {p.beds > 0 && <span className="flex items-center gap-1"><BedDouble size={12} /> {p.beds}</span>}
                        {p.baths > 0 && <span className="flex items-center gap-1"><Bath size={12} /> {p.baths}</span>}
                        {p.surface_built && <span className="flex items-center gap-1"><Maximize2 size={12} /> {p.surface_built} m²</span>}
                      </div>
                      <div className="flex gap-2 mt-4 pt-4 border-t border-slate-50">
                        <button type="button" onClick={() => { setEditing(p); setView('form'); }}
                          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-xs font-bold text-slate-600 transition-all">
                          <Pencil size={13} /> {dict.modify}
                        </button>
                        <button type="button" onClick={() => setDeleteId(p.id)}
                          className="flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-50 hover:bg-red-100 text-xs font-bold text-red-400 transition-all">
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
              <h2 className="text-2xl font-bold text-slate-900">{editing?.id ? dict.editProperty : dict.newProperty}</h2>
              <p className="text-sm text-slate-400 mt-1">{dict.fillInfo}</p>
            </div>
            <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm p-8">
              <PropertyForm
                initial={editing}
                agencyId={session.agencyId}
                slug={slug}
                brandColor={brandColor}
                dict={dict}
                onSaved={() => { setView('list'); setEditing(null); loadProperties(); }}
                onCancel={() => { setView('list'); setEditing(null); }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Modale suppression */}
      {deleteId !== null && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 px-6 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl">
            <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-500" />
            </div>
            <h3 className="text-center font-bold text-slate-900 text-lg mb-1">{dict.deleteTitle}</h3>
            <p className="text-center text-sm text-slate-400 mb-7">{dict.deleteWarning}</p>
            <div className="flex gap-3">
              <button type="button" onClick={() => setDeleteId(null)}
                className="flex-1 py-3.5 rounded-2xl border border-slate-200 text-sm font-bold text-slate-500 hover:bg-slate-50 transition-all">
                {dict.cancel}
              </button>
              <button type="button" onClick={() => handleDelete(deleteId)} disabled={deleting}
                className="flex-1 py-3.5 rounded-2xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold flex items-center justify-center gap-2 transition-all">
                {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                {dict.delete}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale changement mot de passe */}
      {showChangePw && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 px-6 backdrop-blur-sm">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-900 text-lg">{dict.changePwTitle}</h3>
              <button type="button" onClick={() => { setShowChangePw(false); setCpMsg(null); }}
                className="p-2 hover:bg-slate-100 rounded-xl transition-all">
                <X size={16} className="text-slate-400" />
              </button>
            </div>
            <div className="space-y-4">
              {([
                [dict.currentPw, cpCurrent, setCpCurrent],
                [dict.newPw, cpNew, setCpNew],
                [dict.confirmNewPw, cpConfirm, setCpConfirm],
              ] as [string, string, (v: string) => void][]).map(([label, val, setter]) => (
                <div key={label} className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</label>
                  <input type="password" value={val} onChange={e => setter(e.target.value)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-100 bg-slate-50 text-sm focus:outline-none" />
                </div>
              ))}
              {cpMsg && (
                <div className={`flex items-center gap-2 p-3 rounded-xl border ${cpMsg.type === 'ok' ? 'bg-green-50 border-green-100' : 'bg-red-50 border-red-100'}`}>
                  {cpMsg.type === 'ok' ? <CheckCircle2 size={14} className="text-green-500" /> : <AlertCircle size={14} className="text-red-500" />}
                  <p className={`text-xs font-medium ${cpMsg.type === 'ok' ? 'text-green-700' : 'text-red-600'}`}>{cpMsg.text}</p>
                </div>
              )}
              <button type="button" onClick={handleChangePw} disabled={cpLoading}
                className="w-full py-4 rounded-2xl text-sm font-black text-white flex items-center justify-center gap-2 shadow-lg transition-all hover:opacity-90"
                style={{ backgroundColor: brandColor }}>
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
