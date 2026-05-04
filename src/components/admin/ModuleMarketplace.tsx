'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  X, CheckCircle2, Loader2,
  Users, MessageCircle, Building2, TrendingUp, Briefcase, Bot,
  Video, LucideIcon,
} from 'lucide-react';
import { MODULES, PLANS } from '@/lib/modules';

const BRAND = '#D4AF37';

const iconMap: Record<string, LucideIcon> = {
  Users,
  MessageCircle,
  Building2,
  TrendingUp,
  Briefcase,
  Bot,
  Video,
};

const planColorMap: Record<string, { bg: string; border: string; text: string }> = {
  teal:   { bg: 'bg-teal-500/10',   border: 'border-teal-500/30',   text: 'text-teal-400' },
  amber:  { bg: 'bg-amber-500/10',  border: 'border-amber-500/30',  text: 'text-amber-400' },
  purple: { bg: 'bg-purple-500/10', border: 'border-purple-500/30', text: 'text-purple-400' },
};

const ALL_MODULE_IDS = ['site_web', 'mini_crm', 'whatsapp', 'property_manager', 'seo', 'immersive-tours', 'crm_sync', 'chatbot'] as const;
const MODULE_LABELS: Record<string, string> = {
  site_web:         'Site web',
  mini_crm:         'Mini CRM Leads',
  whatsapp:         'WhatsApp Business',
  property_manager: 'Property Manager',
  seo:              'Module SEO',
  'immersive-tours': 'Visites immersives',
  crm_sync:         'CRM Zoho / HubSpot',
  chatbot:          'Chatbot IA',
};

interface Props {
  moduleId: string;
  agencyId: string;
  agencyName: string;
  agencyEmail: string;
  currentPlan: string;
  onClose: () => void;
}

export default function ModuleMarketplace({
  moduleId,
  agencyId,
  agencyName,
  agencyEmail,
  onClose,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [successPlan, setSuccessPlan] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState<'module' | 'plans'>('module');

  const module = MODULES.find((m) => m.id === moduleId);
  const Icon = module ? iconMap[module.icon] : null;

  const handleClose = useCallback(() => onClose(), [onClose]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [handleClose]);

  async function handleRequestModule() {
    if (!module) return;
    setLoading(true);
    try {
      await fetch('/api/admin/request-module', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          moduleName: module.name,
          modulePrice: module.price,
          agencyId,
          moduleId: module.id,
          agencyName,
          agencyEmail,
        }),
      });
      setSuccess(true);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  async function handleRequestPlan(plan: (typeof PLANS)[number]) {
    setLoading(true);
    try {
      await fetch('/api/admin/request-module', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agencyId,
          moduleId: `plan-${plan.id}`,
          moduleName: `Plan ${plan.name}`,
          modulePrice: plan.price,
          agencyName,
          agencyEmail,
        }),
      });
      setSuccessPlan(plan.id);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center overflow-y-auto py-8 px-4"
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div className="bg-slate-900 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.07]">
          <div className="flex items-center gap-4">
            <h2 className="text-base font-bold text-white">Activer un module</h2>
            <div className="flex gap-1">
              {(['module', 'plans'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSelectedTab(tab)}
                  className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                  style={selectedTab === tab
                    ? { backgroundColor: BRAND, color: '#000' }
                    : { color: 'rgba(255,255,255,0.4)', background: 'rgba(255,255,255,0.05)' }}
                >
                  {tab === 'module' ? 'Module sélectionné' : 'Voir tous les plans'}
                </button>
              ))}
            </div>
          </div>
          <button onClick={handleClose} className="p-2 rounded-lg text-white/40 hover:text-white hover:bg-white/[0.07] transition-all">
            <X size={18} />
          </button>
        </div>

        {/* TAB 1 — Module sélectionné */}
        {selectedTab === 'module' && module && Icon && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

              {/* Left column */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: `${BRAND}20`, border: `1px solid ${BRAND}40` }}>
                    <Icon size={22} style={{ color: BRAND }} />
                  </div>
                  <h3 className="text-xl font-bold text-white">{module.name}</h3>
                </div>
                <p className="text-sm text-slate-400 leading-relaxed">{module.description}</p>
                <ul className="space-y-2">
                  {module.benefits.map((b) => (
                    <li key={b} className="flex items-start gap-2 text-sm text-slate-300">
                      <span className="mt-0.5 shrink-0 font-bold" style={{ color: BRAND }}>✓</span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Right column — pricing card */}
              <div className="bg-slate-800 rounded-xl p-6 flex flex-col gap-4">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-widest font-semibold mb-1">Prix mensuel</p>
                  <div className="flex items-end gap-1">
                    <span className="text-4xl font-bold text-white">{module.price} €</span>
                    <span className="text-slate-400 mb-1">/mois</span>
                  </div>
                </div>
                <div className="h-px bg-white/[0.07]" />
                {success ? (
                  <div className="flex flex-col items-center gap-2 py-4">
                    <CheckCircle2 size={32} className="text-green-400" />
                    <p className="text-sm font-semibold text-green-400 text-center">Demande envoyée ! Vous serez contacté sous 24h.</p>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={handleRequestModule}
                      disabled={loading}
                      className="w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      style={{ backgroundColor: BRAND, color: '#000' }}
                    >
                      {loading ? <Loader2 size={16} className="animate-spin" /> : `Activer ce module — ${module.price} €/mois`}
                    </button>
                    <p className="text-xs text-slate-500 text-center">Notre équipe activera ce module sous 24h après confirmation.</p>
                  </>
                )}
              </div>
            </div>

            {/* Plans upsell */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-white/[0.07]" />
                <span className="text-xs text-slate-500 font-semibold uppercase tracking-widest">Ou économisez avec un plan complet</span>
                <div className="flex-1 h-px bg-white/[0.07]" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {PLANS.map((plan) => {
                  const c = planColorMap[plan.color] ?? planColorMap['teal'];
                  const includesModule = plan.modules.includes(moduleId as never);
                  return (
                    <button
                      key={plan.id}
                      onClick={() => setSelectedTab('plans')}
                      className={`rounded-xl p-4 text-left border transition-all hover:border-opacity-60 ${c.bg} ${c.border}`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-sm font-bold ${c.text}`}>{plan.name}</span>
                        <span className={`text-xs font-bold text-white`}>{plan.price} €/mois</span>
                      </div>
                      <p className="text-[10px] text-slate-500">{plan.description}</p>
                      {includesModule && (
                        <span className="inline-block mt-2 text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md" style={{ backgroundColor: `${BRAND}20`, color: BRAND }}>
                          Inclus ✓
                        </span>
                      )}
                      {'savings' in plan && plan.savings && plan.savings > 0 ? (
                        <p className="text-[10px] mt-1" style={{ color: BRAND }}>Économie {plan.savings} €/mois</p>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2 — Plans */}
        {selectedTab === 'plans' && (
          <div className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {PLANS.map((plan) => {
                const c = planColorMap[plan.color] ?? planColorMap['teal'];
                const isDone = successPlan === plan.id;
                return (
                  <div
                    key={plan.id}
                    className={`rounded-xl p-6 border flex flex-col gap-4 relative ${c.bg} ${'recommended' in plan && plan.recommended ? `border-2` : c.border}`}
                    style={'recommended' in plan && plan.recommended ? { borderColor: BRAND } : {}}
                  >
                    {'recommended' in plan && plan.recommended && (
                      <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full" style={{ backgroundColor: BRAND, color: '#000' }}>
                        Recommandé
                      </span>
                    )}
                    <div>
                      <h3 className={`text-xl font-bold ${c.text}`}>{plan.name}</h3>
                      <div className="flex items-end gap-1 mt-1">
                        <span className="text-3xl font-bold text-white">{plan.price} €</span>
                        <span className="text-slate-400 mb-0.5">/mois</span>
                      </div>
                      {'savings' in plan && plan.savings && plan.savings > 0 ? (
                        <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-md" style={{ backgroundColor: `${BRAND}20`, color: BRAND }}>
                          Économisez {plan.savings} €/mois
                        </span>
                      ) : null}
                    </div>
                    <ul className="space-y-1.5 flex-1">
                      {plan.modules.map((mid) => (
                        <li key={mid} className="flex items-center gap-2 text-sm text-slate-300">
                          <span className="font-bold shrink-0" style={{ color: BRAND }}>✓</span>
                          {MODULE_LABELS[mid] ?? mid}
                        </li>
                      ))}
                    </ul>
                    {isDone ? (
                      <div className="flex items-center gap-2 justify-center py-2">
                        <CheckCircle2 size={18} className="text-green-400" />
                        <span className="text-sm font-semibold text-green-400">Demande envoyée !</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleRequestPlan(plan)}
                        disabled={loading}
                        className="w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50"
                        style={{ backgroundColor: BRAND, color: '#000' }}
                      >
                        {loading ? <Loader2 size={16} className="animate-spin mx-auto" /> : 'Choisir ce plan'}
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Comparison table */}
            <div className="overflow-x-auto rounded-xl border border-white/[0.07]">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.07]">
                    <th className="text-left px-4 py-3 text-slate-400 font-semibold text-xs uppercase tracking-widest">Module</th>
                    {PLANS.map((plan) => (
                      <th key={plan.id} className="px-4 py-3 text-center">
                        <span className={`text-xs font-bold uppercase tracking-widest ${planColorMap[plan.color]?.text ?? 'text-slate-400'}`}>{plan.name}</span>
                        <span className="block text-[10px] text-slate-500">{plan.price} €</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ALL_MODULE_IDS.map((mid, i) => (
                    <tr key={mid} className={i % 2 === 0 ? 'bg-white/[0.02]' : ''}>
                      <td className="px-4 py-2.5 text-slate-300 text-xs font-medium">{MODULE_LABELS[mid]}</td>
                      {PLANS.map((plan) => (
                        <td key={plan.id} className="px-4 py-2.5 text-center text-sm">
                          {plan.modules.includes(mid as never)
                            ? <span className="font-bold" style={{ color: BRAND }}>✓</span>
                            : <span className="text-slate-600">—</span>}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
