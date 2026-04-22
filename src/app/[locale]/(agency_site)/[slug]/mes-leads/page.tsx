"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useParams } from 'next/navigation';
import {
  TrendingUp, LogOut, Key, Loader2, Eye, EyeOff,
  AlertCircle, CheckCircle2, Save, X, RefreshCw,
  Mail, Phone, MapPin, Clock, User
} from 'lucide-react';

const SESSION_KEY = 'leads_crm_session';
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
  source: string;
};

const STATUS_CYCLE: Record<string, string> = {
  new: 'contacted',
  contacted: 'converted',
  converted: 'new',
};

const STATUS_LABEL: Record<string, string> = {
  new: 'Nouveau',
  contacted: 'Contacté',
  converted: 'Converti',
};

const STATUS_COLORS: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-amber-100 text-amber-700',
  converted: 'bg-green-100 text-green-700',
};

export default function MesLeadsPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [agency, setAgency] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<CrmSession | null>(null);

  const [mode, setMode] = useState<'login' | 'create'>('login');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const [leads, setLeads] = useState<Lead[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  const [showChangePw, setShowChangePw] = useState(false);
  const [cpCurrent, setCpCurrent] = useState('');
  const [cpNew, setCpNew] = useState('');
  const [cpConfirm, setCpConfirm] = useState('');
  const [cpLoading, setCpLoading] = useState(false);
  const [cpMsg, setCpMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const brandColor = agency?.primary_color || '#ea580c';
  const fontFamily = agency?.font_family || 'Montserrat';

  useEffect(() => {
    if (!slug) return;
    supabase
      .from('agency_settings')
      .select('*')
      .eq('subdomain', slug)
      .maybeSingle()
      .then(({ data }) => {
        setAgency(data);
        setLoading(false);
      });
  }, [slug]);

  useEffect(() => {
    if (!agency) return;
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      if (!raw) return;
      const s: CrmSession = JSON.parse(raw);
      if (s.slug === slug && s.agencyId === String(agency.id) && Date.now() < s.exp) {
        setSession(s);
      } else {
        sessionStorage.removeItem(SESSION_KEY);
      }
    } catch { sessionStorage.removeItem(SESSION_KEY); }
  }, [agency, slug]);

  useEffect(() => {
    if (!agency) return;
    setMode(agency.leads_password ? 'login' : 'create');
  }, [agency]);

  const loadLeads = useCallback(async (agencyId: string) => {
    setLeadsLoading(true);
    const { data } = await supabase
      .from('leads')
      .select('*')
      .eq('agency_id', agencyId)
      .order('created_at', { ascending: false });
    setLeads(data || []);
    setLeadsLoading(false);
  }, []);

  useEffect(() => {
    if (session) loadLeads(session.agencyId);
  }, [session, loadLeads]);

  const handleAuth = async () => {
    setAuthError('');
    if (mode === 'create') {
      if (password.length < 8) { setAuthError('Minimum 8 caractères.'); return; }
      if (password !== confirm) { setAuthError('Les mots de passe ne correspondent pas.'); return; }
    }
    setAuthLoading(true);
    const res = await fetch('/api/leads-crm/auth', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: mode === 'create' ? 'set-password' : 'login', slug, password }),
    });
    const data = await res.json();
    setAuthLoading(false);
    if (!data.success) { setAuthError(data.error || 'Erreur'); return; }
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
    if (cpNew.length < 8) { setCpMsg({ type: 'err', text: 'Minimum 8 caractères.' }); return; }
    if (cpNew !== cpConfirm) { setCpMsg({ type: 'err', text: 'Les mots de passe ne correspondent pas.' }); return; }
    setCpLoading(true);
    const res = await fetch('/api/leads-crm/auth', {
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

  const cycleStatus = async (lead: Lead) => {
    const nextStatus = STATUS_CYCLE[lead.status] || 'new';
    await supabase.from('leads').update({ status: nextStatus }).eq('id', lead.id);
    setLeads(prev => prev.map(l => l.id === lead.id ? { ...l, status: nextStatus } : l));
  };

  const filteredLeads = filter === 'all' ? leads : leads.filter(l => l.status === filter);

  const stats = {
    total: leads.length,
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    converted: leads.filter(l => l.status === 'converted').length,
  };

  const formatDate = (iso: string) => {
    if (!iso) return '—';
    return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <Loader2 size={32} className="animate-spin text-slate-300" />
      </div>
    );
  }

  if (!agency) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <p className="text-slate-400 font-medium">Agence introuvable.</p>
      </div>
    );
  }

  const leadsEnabled = !!agency?.footer_config?.integrations?.leads_enabled;

  if (!leadsEnabled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6" style={{ fontFamily: `${fontFamily}, sans-serif` }}>
        <div className="text-center max-w-sm">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 text-white"
            style={{ backgroundColor: brandColor }}>
            <TrendingUp size={28} />
          </div>
          <h1 className="text-xl font-bold text-slate-900 mb-2">{agency.agency_name}</h1>
          <p className="text-sm text-slate-500">Module Mini CRM non activé.</p>
          <p className="text-xs text-slate-400 mt-1">Contactez votre administrateur pour l'activer.</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 px-6" style={{ fontFamily: `${fontFamily}, sans-serif` }}>
        <div className="w-full max-w-md">
          <div className="text-center mb-10">
            {agency.logo_url
              ? <img src={agency.logo_url} alt={agency.agency_name} className="h-12 mx-auto mb-4 object-contain" />
              : <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4 text-white" style={{ backgroundColor: brandColor }}>
                  <TrendingUp size={24} />
                </div>
            }
            <h1 className="text-2xl font-bold text-slate-900">
              {mode === 'create' ? 'Créez votre mot de passe CRM' : 'Mini CRM Leads'}
            </h1>
            <p className="text-sm text-slate-400 mt-1">{agency.agency_name}</p>
          </div>

          <div className="bg-white rounded-[2.5rem] shadow-xl p-8 space-y-5">
            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {mode === 'create' ? 'Créer un mot de passe (min. 8 caractères)' : 'Mot de passe'}
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
              className="w-full py-4 rounded-2xl text-sm font-black text-white flex items-center justify-center gap-2 transition-all hover:opacity-90"
              style={{ backgroundColor: brandColor }}>
              {authLoading ? <Loader2 size={16} className="animate-spin" /> : <Key size={16} />}
              {mode === 'create' ? 'Créer mon accès CRM' : 'Se connecter'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: `${fontFamily}, sans-serif` }}>

      {/* Header */}
      <div className="bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-3">
          {agency.logo_url
            ? <img src={agency.logo_url} alt={agency.agency_name} className="h-8 object-contain" />
            : <div className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: brandColor }}>
                <TrendingUp size={16} />
              </div>
          }
          <div>
            <p className="text-sm font-bold text-slate-900">{agency.agency_name}</p>
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">Mini CRM</p>
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

      <div className="max-w-6xl mx-auto px-6 py-10 space-y-8">

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Total leads', value: stats.total, color: 'slate' },
            { label: 'Nouveaux', value: stats.new, color: 'blue' },
            { label: 'Contactés', value: stats.contacted, color: 'amber' },
            { label: 'Convertis', value: stats.converted, color: 'green' },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-5">
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
              <p className={`text-3xl font-black mt-1 text-${color}-600`}>{value}</p>
            </div>
          ))}
        </div>

        {/* Filtres */}
        <div className="flex items-center gap-3 flex-wrap">
          {[
            { key: 'all', label: 'Tous' },
            { key: 'new', label: 'Nouveaux' },
            { key: 'contacted', label: 'Contactés' },
            { key: 'converted', label: 'Convertis' },
          ].map(({ key, label }) => (
            <button key={key}
              onClick={() => setFilter(key)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${filter === key ? 'text-white shadow-md' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              style={filter === key ? { backgroundColor: brandColor } : {}}>
              {label}
            </button>
          ))}
          <button onClick={() => loadLeads(session.agencyId)} disabled={leadsLoading}
            className="ml-auto flex items-center gap-1.5 px-4 py-2 rounded-full border border-slate-200 bg-white text-xs font-bold text-slate-600 hover:bg-slate-50 transition-all">
            <RefreshCw size={13} className={leadsLoading ? 'animate-spin' : ''} /> Actualiser
          </button>
        </div>

        {/* Liste des leads */}
        {leadsLoading ? (
          <div className="flex justify-center py-20"><Loader2 size={28} className="animate-spin text-slate-300" /></div>
        ) : filteredLeads.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-[2.5rem] border border-slate-100">
            <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
              <TrendingUp size={28} className="text-slate-300" />
            </div>
            <p className="text-slate-400 font-medium">Aucun lead{filter !== 'all' ? ' pour ce filtre' : ''}</p>
            <p className="text-xs text-slate-300 mt-1">Les leads apparaissent ici dès qu'un visiteur remplit le formulaire chatbot.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filteredLeads.map(lead => (
              <div key={lead.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-5 hover:shadow-md transition-all">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex items-start gap-4 flex-1 min-w-0">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white font-bold text-sm"
                      style={{ backgroundColor: brandColor }}>
                      {lead.full_name?.charAt(0) || <User size={16} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-slate-900 text-sm">
                          {lead.full_name || '(Sans nom)'}
                        </p>
                        <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
                          Chatbot IA
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                        {lead.email && (
                          <a href={`mailto:${lead.email}`} className="flex items-center gap-1 text-xs text-slate-500 hover:text-blue-600 transition-colors">
                            <Mail size={11} /> {lead.email}
                          </a>
                        )}
                        {lead.phone && (
                          <a href={`tel:${lead.phone}`} className="flex items-center gap-1 text-xs text-slate-500 hover:text-green-600 transition-colors">
                            <Phone size={11} /> {lead.phone}
                          </a>
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        {lead.budget && (
                          <span className="text-[10px] text-slate-400 font-medium">Budget : <strong className="text-slate-700">{lead.budget}</strong></span>
                        )}
                        {lead.location && (
                          <span className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                            <MapPin size={10} /> {lead.location}
                          </span>
                        )}
                        {lead.delay && (
                          <span className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
                            <Clock size={10} /> {lead.delay}
                          </span>
                        )}
                        {lead.project_type && (
                          <span className="text-[10px] text-slate-400 font-medium">{lead.project_type}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <button
                      onClick={() => cycleStatus(lead)}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all hover:opacity-80 cursor-pointer ${STATUS_COLORS[lead.status] || 'bg-slate-100 text-slate-500'}`}>
                      {STATUS_LABEL[lead.status] || lead.status}
                    </button>
                    <p className="text-[10px] text-slate-300 font-medium">{formatDate(lead.created_at)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

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
              {([['Mot de passe actuel', cpCurrent, setCpCurrent], ['Nouveau mot de passe', cpNew, setCpNew], ['Confirmer le nouveau', cpConfirm, setCpConfirm]] as [string, string, (v: string) => void][]).map(([label, val, setter]) => (
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
              <button onClick={handleChangePw} disabled={cpLoading}
                className="w-full py-3.5 rounded-2xl text-sm font-black text-white flex items-center justify-center gap-2 mt-2"
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
