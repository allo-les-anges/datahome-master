'use client';

import React, { useState } from 'react';
import { Loader2, CheckCircle2, ArrowRight, Zap } from 'lucide-react';

const LANGS = [
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
  { code: 'nl', label: 'Nederlands' },
  { code: 'es', label: 'Español' },
  { code: 'de', label: 'Deutsch' },
  { code: 'pl', label: 'Polski' },
  { code: 'ru', label: 'Русский' },
  { code: 'no', label: 'Norsk' },
  { code: 'da', label: 'Dansk' },
];

export default function RegisterPage() {
  const [loading, setLoading]   = useState(false);
  const [done, setDone]         = useState(false);
  const [error, setError]       = useState('');

  const [form, setForm] = useState({
    prenom:             '',
    nom:                '',
    email:              '',
    entreprise:         '',
    telephone:          '',
    preferred_language: 'fr',
  });

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res  = await fetch('/api/register-premium', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error || 'Une erreur est survenue.');
        return;
      }
      setDone(true);
    } catch {
      setError('Impossible de contacter le serveur.');
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-12 text-center space-y-6 border border-slate-100">
          <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={44} className="text-green-500" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Email envoyé !</h1>
          <p className="text-slate-500 text-sm leading-relaxed">
            Un code de validation a été envoyé à{' '}
            <span className="font-bold text-slate-800">{form.email}</span>.
            <br />Consultez votre boîte et cliquez sur le bouton dans l'email.
          </p>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
            HabiHub Premium Onboarding
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-lg w-full">

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-full text-xs font-black uppercase tracking-widest mb-4">
            <Zap size={12} /> Premium
          </div>
          <h1 className="text-3xl font-black text-slate-900">Démarrer maintenant</h1>
          <p className="text-slate-500 mt-2 text-sm">Créez votre site immobilier en quelques minutes.</p>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
          <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-5">

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Prénom *</label>
                <input
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Alice"
                  value={form.prenom}
                  onChange={e => set('prenom', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Nom *</label>
                <input
                  required
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Martin"
                  value={form.nom}
                  onChange={e => set('nom', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Email professionnel *</label>
              <input
                required
                type="email"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="alice@monagence.com"
                value={form.email}
                onChange={e => set('email', e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Nom de l'agence *</label>
              <input
                required
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Mon Agence Immo"
                value={form.entreprise}
                onChange={e => set('entreprise', e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Téléphone</label>
                <input
                  type="tel"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="+33 6 00 00 00 00"
                  value={form.telephone}
                  onChange={e => set('telephone', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Langue</label>
                <select
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={form.preferred_language}
                  onChange={e => set('preferred_language', e.target.value)}
                >
                  {LANGS.map(l => <option key={l.code} value={l.code}>{l.label}</option>)}
                </select>
              </div>
            </div>

            {error && (
              <p className="text-sm text-red-600 bg-red-50 border border-red-100 px-4 py-3 rounded-xl">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold text-sm hover:bg-blue-600 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading
                ? <Loader2 className="animate-spin" size={18} />
                : <><ArrowRight size={18} /> Recevoir mon code d'accès</>
              }
            </button>

            <p className="text-center text-[10px] text-slate-400 uppercase tracking-widest font-bold">
              Un email avec votre code vous sera envoyé immédiatement
            </p>

          </form>
        </div>

      </div>
    </div>
  );
}
