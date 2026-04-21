"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Zap, Save, CheckCircle2, AlertCircle, Globe, Loader2, ShieldCheck } from 'lucide-react';
import { useParams } from 'next/navigation';

const CRM_TYPES = [
  { value: 'zoho', label: 'Zoho CRM' },
  { value: 'hubspot', label: 'HubSpot' },
  { value: 'other', label: 'Autre / Webhook personnalisé' },
];

export default function CrmSettingsPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [agency, setAgency] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [crmType, setCrmType] = useState('zoho');
  const [crmToken, setCrmToken] = useState('');
  const [crmWebhook, setCrmWebhook] = useState('');

  useEffect(() => {
    if (!slug) return;
    supabase
      .from('agency_settings')
      .select('id, agency_name, primary_color, footer_config')
      .eq('subdomain', slug)
      .maybeSingle()
      .then(({ data }) => {
        if (!data) { setLoading(false); return; }
        setAgency(data);
        const ints = data.footer_config?.integrations || {};
        if (!ints.crm_enabled) { setLoading(false); return; }
        setCrmType(ints.crm_type || 'zoho');
        setCrmToken(ints.crm_token || '');
        setCrmWebhook(ints.crm_webhook || '');
        setLoading(false);
      });
  }, [slug]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agency) return;
    setSaving(true);

    const currentConfig = typeof agency.footer_config === 'string'
      ? JSON.parse(agency.footer_config || '{}')
      : (agency.footer_config || {});

    const updatedConfig = {
      ...currentConfig,
      integrations: {
        ...(currentConfig.integrations || {}),
        crm_type: crmType,
        crm_token: crmToken,
        crm_webhook: crmWebhook,
      },
    };

    const { error } = await supabase
      .from('agency_settings')
      .update({ footer_config: updatedConfig, updated_at: new Date().toISOString() })
      .eq('id', agency.id);

    setSaving(false);
    if (error) {
      setMessage({ type: 'error', text: 'Erreur lors de la sauvegarde.' });
    } else {
      setMessage({ type: 'success', text: 'Paramètres CRM enregistrés.' });
      setAgency({ ...agency, footer_config: updatedConfig });
    }
    setTimeout(() => setMessage(null), 3000);
  };

  const brandColor = agency?.primary_color || '#0f172a';
  const crmEnabled = agency?.footer_config?.integrations?.crm_enabled;

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
        <p className="text-slate-400 text-sm">Agence introuvable.</p>
      </div>
    );
  }

  if (!crmEnabled) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
          <Zap size={24} className="text-slate-300" />
        </div>
        <h1 className="text-lg font-bold text-slate-900 mb-2">Module CRM non activé</h1>
        <p className="text-sm text-slate-400 max-w-sm">
          Le module CRM doit être activé par votre administrateur HabiHub avant que vous puissiez configurer vos identifiants.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-32 pb-20 px-6">
      <div className="max-w-xl mx-auto">

        {/* Header */}
        <div className="mb-10">
          <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-3">
            {agency.agency_name}
          </span>
          <h1 className="text-3xl font-serif italic text-slate-900 mb-2">Connexion CRM</h1>
          <p className="text-sm text-slate-500">
            Renseignez vos identifiants pour synchroniser automatiquement vos leads avec votre CRM.
          </p>
        </div>

        {/* Security notice */}
        <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-2xl border border-blue-100 mb-8">
          <ShieldCheck size={16} className="text-blue-500 shrink-0 mt-0.5" />
          <p className="text-[11px] text-blue-700 font-medium leading-relaxed">
            Ces informations sont stockées de façon sécurisée et ne sont jamais partagées. Seuls vos leads y transitent.
          </p>
        </div>

        <form onSubmit={handleSave} className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-8 space-y-6">

          {/* Type CRM */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Type de CRM
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CRM_TYPES.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setCrmType(opt.value)}
                  className={`p-3 rounded-xl border-2 text-[11px] font-bold uppercase tracking-wide transition-all ${
                    crmType === opt.value
                      ? 'border-blue-500 bg-blue-50 text-blue-700'
                      : 'border-slate-100 text-slate-400 hover:border-slate-200'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Token / ID */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {crmType === 'zoho' ? 'Zoho Auth Token' : crmType === 'hubspot' ? 'HubSpot API Key' : 'Clé / Token API'}
            </label>
            <div className="relative">
              <Zap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={15} />
              <input
                type="password"
                className="w-full pl-11 pr-4 py-4 rounded-2xl border border-slate-200 text-sm bg-slate-50 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all"
                placeholder={crmType === 'zoho' ? '1000.xxxxxx...' : crmType === 'hubspot' ? 'pat-eu-xxxxxx...' : 'sk-...'}
                value={crmToken}
                onChange={(e) => setCrmToken(e.target.value)}
              />
            </div>
            <p className="text-[10px] text-slate-400 pl-1">
              {crmType === 'zoho' && 'Générez un token dans Zoho CRM → Paramètres → Intégrations → API.'}
              {crmType === 'hubspot' && 'Trouvez votre clé dans HubSpot → Paramètres → Intégrations → Clés API privées.'}
              {crmType === 'other' && 'Entrez la clé d\'authentification fournie par votre CRM.'}
            </p>
          </div>

          {/* Webhook URL */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              URL Webhook (optionnel)
            </label>
            <div className="relative">
              <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={15} />
              <input
                type="url"
                className="w-full pl-11 pr-4 py-4 rounded-2xl border border-slate-200 text-sm bg-slate-50 focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none transition-all"
                placeholder="https://hooks.zoho.com/..."
                value={crmWebhook}
                onChange={(e) => setCrmWebhook(e.target.value)}
              />
            </div>
            <p className="text-[10px] text-slate-400 pl-1">Si votre CRM supporte les webhooks entrants, collez l'URL ici.</p>
          </div>

          {/* Message feedback */}
          {message && (
            <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-[11px] font-bold uppercase tracking-wide ${
              message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-red-50 text-red-700 border border-red-100'
            }`}>
              {message.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
              {message.text}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={saving}
            className="w-full flex items-center justify-center gap-3 py-4 rounded-2xl text-white text-[11px] font-black uppercase tracking-widest shadow-lg transition-all hover:opacity-90 active:scale-95 disabled:opacity-50"
            style={{ backgroundColor: brandColor }}
          >
            {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
            {saving ? 'Enregistrement...' : 'Enregistrer les identifiants'}
          </button>
        </form>

        <p className="text-center text-[10px] text-slate-300 mt-6 uppercase tracking-widest">
          Propulsé par HabiHub
        </p>
      </div>
    </div>
  );
}
