"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Footer from "@/components/Footer";
import {
  Bed, Bath, Maximize, ArrowLeft, Building2,
  MapPin, ChevronRight, Hash, CheckCircle, Clock, Key, Lock,
  Phone, Mail, X, FileText, Waves, TrendingUp
} from "lucide-react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Unit {
  id: string;
  ref?: string;
  titre: string;
  price: number;
  beds: number;
  baths: number;
  surface_built: string | number;
  surface_plot?: string | number;
  pool?: string | boolean;
  type: string;
  images: string[];
  town?: string;
  development_name?: string;
  description?: string;
  status?: string;
}

interface LeadForm {
  name: string;
  email: string;
  phone: string;
  unitRef: string;
}

// ─── Payment plan model ────────────────────────────────────────────────────────

const SPAIN_PLAN = [
  { label: "Réservation", pct: 10, icon: Key, color: "#D4AF37", desc: "Signature du contrat de réservation" },
  { label: "Début des travaux", pct: 20, icon: TrendingUp, color: "#10b981", desc: "Lancement effectif du chantier" },
  { label: "Remise des clés", pct: 70, icon: Building2, color: "#3b82f6", desc: "Livraison & acte notarial" },
];

// ─── Slugify helper ────────────────────────────────────────────────────────────

function slugify(text: string) {
  return text?.toString().toLowerCase().trim()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/\s+/g, "-").replace(/[^\w-]+/g, "");
}

// ─── Lead modal ───────────────────────────────────────────────────────────────

function LeadModal({ unitRef, devName, onClose }: { unitRef: string; devName: string; onClose: () => void }) {
  const [form, setForm] = useState<LeadForm>({ name: "", email: "", phone: "", unitRef });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, subject: `Plan de paiement – ${devName} – Unité ${unitRef}` }),
      });
      setSent(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md p-10 relative">
        <button onClick={onClose} className="absolute top-6 right-6 text-slate-400 hover:text-slate-900 transition-colors">
          <X size={20} />
        </button>
        {sent ? (
          <div className="text-center py-8">
            <CheckCircle size={48} className="mx-auto mb-4 text-emerald-500" />
            <h3 className="text-2xl font-serif italic text-slate-900 mb-2">Merci !</h3>
            <p className="text-slate-500 text-sm">Notre équipe vous contactera avec le dossier complet dans les 24h.</p>
            <button onClick={onClose} className="mt-8 px-8 py-3 bg-[#0A0A0A] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#D4AF37] transition-all">
              Fermer
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-2">
              <FileText size={20} className="text-[#D4AF37]" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#D4AF37]">Dossier PDF</span>
            </div>
            <h3 className="text-2xl font-serif italic text-slate-900 mb-1">{devName}</h3>
            {unitRef && <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mb-6">Unité · {unitRef}</p>}
            <p className="text-sm text-slate-500 mb-8">Recevez le plan de paiement détaillé, les plans d'étage et la brochure complète.</p>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                required
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Votre nom"
                className="w-full border border-slate-200 rounded-xl px-5 py-3 text-sm outline-none focus:border-[#D4AF37] transition-colors"
              />
              <input
                required
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="Email"
                className="w-full border border-slate-200 rounded-xl px-5 py-3 text-sm outline-none focus:border-[#D4AF37] transition-colors"
              />
              <input
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="Téléphone (optionnel)"
                className="w-full border border-slate-200 rounded-xl px-5 py-3 text-sm outline-none focus:border-[#D4AF37] transition-colors"
              />
              <button
                type="submit"
                disabled={sending}
                className="w-full py-4 bg-[#0A0A0A] text-white text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-[#D4AF37] transition-all flex items-center justify-center gap-2"
              >
                {sending ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FileText size={14} />}
                Recevoir le dossier
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Unit card ────────────────────────────────────────────────────────────────

function UnitCard({ unit, onRequestPdf }: { unit: Unit; onRequestPdf: (ref: string) => void }) {
  const price = Number(unit.price || 0);
  const isAvailable = !unit.status || unit.status === "Disponible" || unit.status === "available";
  const isReserved = unit.status === "Réservé" || unit.status === "reserved";

  return (
    <div className="group bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-slate-100 flex flex-col">
      <div className="relative h-64 overflow-hidden bg-slate-100">
        <img
          src={unit.images?.[0] || "/placeholder-villa.jpg"}
          alt={unit.titre}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
          loading="lazy"
        />
        {/* Status badge */}
        <div className={`absolute top-5 left-5 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border ${
          isReserved
            ? "bg-orange-500/90 text-white border-orange-400/30"
            : isAvailable
              ? "bg-emerald-500/90 text-white border-emerald-400/30"
              : "bg-slate-700/90 text-white border-slate-600/30"
        }`}>
          {isReserved ? "Réservé" : isAvailable ? "Disponible" : unit.status}
        </div>
        {/* Type badge */}
        <div className="absolute top-5 right-5 px-3 py-1.5 bg-white/90 backdrop-blur-md rounded-full text-[9px] font-black uppercase tracking-widest text-slate-900 border border-white/50">
          {unit.type}
        </div>
        {/* Ref */}
        <div className="absolute bottom-5 left-5 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full text-white text-[9px] font-bold border border-white/10">
          <Hash size={10} className="text-[#D4AF37]" />
          {unit.ref || unit.id?.slice(0, 8)}
        </div>
      </div>

      <div className="p-7 flex flex-col flex-1">
        <h3 className="text-xl font-serif italic text-slate-900 mb-1 line-clamp-1">{unit.titre}</h3>
        <p className="text-3xl font-serif text-slate-900 mb-5">
          {price ? price.toLocaleString("fr-FR") : "—"} <span className="text-lg text-slate-400">€</span>
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 py-5 mb-5 border-y border-slate-50 text-slate-400">
          <div className="flex flex-col items-center gap-1">
            <Bed size={16} className="text-slate-300" />
            <span className="text-sm font-bold text-slate-900">{unit.beds || 0}</span>
            <span className="text-[8px] uppercase tracking-wider">lits</span>
          </div>
          <div className="flex flex-col items-center gap-1 border-x border-slate-50">
            <Bath size={16} className="text-slate-300" />
            <span className="text-sm font-bold text-slate-900">{unit.baths || 0}</span>
            <span className="text-[8px] uppercase tracking-wider">sdb</span>
          </div>
          <div className="flex flex-col items-center gap-1">
            <Maximize size={16} className="text-slate-300" />
            <span className="text-sm font-bold text-slate-900">{unit.surface_built || 0}</span>
            <span className="text-[8px] uppercase tracking-wider">m²</span>
          </div>
        </div>

        {/* Payment plan mini preview */}
        {price > 0 && (
          <div className="mb-5 p-4 bg-slate-50 rounded-xl border border-slate-100 space-y-2">
            <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-3">Plan de paiement</p>
            {SPAIN_PLAN.map(step => (
              <div key={step.label} className="flex justify-between items-center">
                <span className="text-[10px] text-slate-500">{step.label}</span>
                <span className="text-[10px] font-bold text-slate-900">
                  {Math.round(price * step.pct / 100).toLocaleString("fr-FR")} €
                  <span className="text-slate-400 font-normal ml-1">({step.pct}%)</span>
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-auto grid grid-cols-2 gap-3">
          <Link
            href={`/bien/${unit.id}`}
            className="py-4 bg-[#0A0A0A] text-white rounded-xl flex items-center justify-center gap-2 hover:bg-[#D4AF37] transition-all text-[9px] font-black uppercase tracking-widest"
          >
            Détails <ChevronRight size={12} />
          </Link>
          <button
            onClick={() => onRequestPdf(unit.ref || unit.id)}
            className="py-4 border border-[#D4AF37] text-[#D4AF37] rounded-xl flex items-center justify-center gap-2 hover:bg-[#D4AF37] hover:text-white transition-all text-[9px] font-black uppercase tracking-widest"
          >
            <FileText size={12} /> Dossier
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────────

export default function DevelopmentPage() {
  const { devId } = useParams();
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState("Tous");
  const [leadUnit, setLeadUnit] = useState<string | null>(null);
  const [progress] = useState(35); // Construction progress % — à connecter au champ DB

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/properties?limit=200");
        const data = await res.json();
        const all: Unit[] = data.properties || data || [];
        const idInUrl = String(devId).toLowerCase();
        setUnits(all.filter(p => slugify(p.development_name || "") === idInUrl));
      } catch (err) {
        console.error("Erreur API:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [devId]);

  const types = useMemo(() => {
    const set = new Set(units.map(u => u.type).filter(Boolean));
    return ["Tous", ...Array.from(set)];
  }, [units]);

  const filtered = useMemo(() =>
    activeType === "Tous" ? units : units.filter(u => u.type === activeType),
    [units, activeType]
  );

  const dev = units[0];
  const minPrice = useMemo(() => Math.min(...units.map(u => Number(u.price || 0)).filter(Boolean)), [units]);
  const availableCount = units.filter(u => !u.status || u.status === "Disponible" || u.status === "available").length;

  if (loading) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white">
      <div className="w-12 h-12 border-4 border-slate-200 border-t-[#D4AF37] rounded-full animate-spin mb-4" />
      <p className="text-[10px] uppercase font-black tracking-widest text-slate-400">Chargement du projet…</p>
    </div>
  );

  if (!units.length) return (
    <div className="h-screen flex flex-col items-center justify-center bg-white text-center p-6">
      <h1 className="text-2xl font-serif mb-4">Projet introuvable</h1>
      <Link href="/" className="text-[#D4AF37] uppercase text-[10px] font-bold tracking-widest border-b border-[#D4AF37]">
        Retour à l'accueil
      </Link>
    </div>
  );

  return (
    <main className="bg-white min-h-screen">

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative pt-48 pb-32 bg-[#0A0A0A] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img
            src={dev.images?.[0] || "/placeholder-villa.jpg"}
            className="w-full h-full object-cover"
            alt=""
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A0A0A] via-[#0A0A0A]/80 to-[#0A0A0A]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 text-slate-500 hover:text-[#D4AF37] transition-colors mb-12 text-[10px] uppercase font-black tracking-widest"
          >
            <ArrowLeft size={12} /> Retour à la sélection
          </button>

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-12">
            <div>
              <div className="flex items-center gap-3 text-[#D4AF37] mb-4">
                <Building2 size={16} />
                <span className="text-[10px] font-black uppercase tracking-[0.3em]">Programme Exclusif</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-serif italic leading-tight mb-4">
                {dev.development_name}
              </h1>
              <p className="text-slate-400 flex items-center gap-2 text-sm">
                <MapPin size={16} className="text-[#D4AF37]" />
                {dev.town}{dev.town ? ", " : ""}Espagne
              </p>
            </div>

            {/* Key stats */}
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Unités totales", value: `${units.length}` },
                { label: "Disponibles", value: `${availableCount}` },
                { label: "À partir de", value: minPrice ? `${minPrice.toLocaleString("fr-FR")} €` : "—" },
              ].map(s => (
                <div key={s.label} className="bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-[1.5rem] text-center min-w-[120px]">
                  <p className="text-[9px] font-black uppercase tracking-widest text-[#D4AF37] mb-2">{s.label}</p>
                  <p className="text-2xl font-serif italic">{s.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Construction progress */}
          <div className="mt-16 p-8 bg-white/5 border border-white/10 rounded-[1.5rem]">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-3">
                <TrendingUp size={16} className="text-[#D4AF37]" />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-300">Avancement des travaux</span>
              </div>
              <span className="text-2xl font-serif italic text-[#D4AF37]">{progress}%</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000"
                style={{ width: `${progress}%`, background: "linear-gradient(90deg, #D4AF37, #f59e0b)" }}
              />
            </div>
            <div className="flex justify-between mt-3 text-[9px] text-slate-500 uppercase tracking-widest font-bold">
              <span>Permis obtenu</span>
              <span>En cours</span>
              <span>Livraison estimée 2026</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── DESCRIPTION ───────────────────────────────────────────────────────── */}
      {dev.description && (
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#D4AF37] mb-8 flex items-center gap-4">
                <span className="w-10 h-px bg-[#D4AF37]" /> Le Projet
              </h2>
              <div
                className="text-slate-600 font-light leading-relaxed text-xl space-y-6"
                dangerouslySetInnerHTML={{ __html: dev.description }}
              />
            </div>
            <div className="rounded-[2.5rem] overflow-hidden h-[420px] shadow-2xl border border-slate-100">
              <img
                src={dev.images?.[1] || dev.images?.[0] || "/placeholder-villa.jpg"}
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-1000"
                alt="Vue du projet"
              />
            </div>
          </div>
        </section>
      )}

      {/* ── PAYMENT PLAN ──────────────────────────────────────────────────────── */}
      <section className="py-20 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#D4AF37] mb-4 flex items-center justify-center gap-4">
              <span className="w-10 h-px bg-[#D4AF37]" /> Plan de paiement <span className="w-10 h-px bg-[#D4AF37]" />
            </h2>
            <p className="text-4xl font-serif italic text-slate-900">Structure en 3 phases</p>
            <p className="text-slate-400 text-sm mt-3">Modèle standard Espagne — programme VEFA</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {SPAIN_PLAN.map((step, i) => (
              <div key={step.label} className="relative bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between mb-6">
                  <div
                    className="w-12 h-12 rounded-full flex items-center justify-center text-white text-[10px] font-black"
                    style={{ backgroundColor: step.color }}
                  >
                    {i + 1}
                  </div>
                  <span className="text-4xl font-serif italic" style={{ color: step.color }}>{step.pct}%</span>
                </div>
                <h3 className="text-lg font-serif italic text-slate-900 mb-2">{step.label}</h3>
                <p className="text-xs text-slate-500">{step.desc}</p>
                {/* Connector line (hidden on mobile) */}
                {i < SPAIN_PLAN.length - 1 && (
                  <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 w-6 h-0.5 bg-slate-200 z-10" />
                )}
              </div>
            ))}
          </div>

          {/* Cashflow example with first available unit */}
          {units.find(u => Number(u.price) > 0) && (() => {
            const ex = units.find(u => Number(u.price) > 0)!;
            const price = Number(ex.price);
            return (
              <div className="bg-white rounded-[2rem] p-8 border border-slate-100 shadow-sm max-w-2xl mx-auto">
                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                  <Hash size={10} /> Exemple de cashflow — {ex.titre}
                </p>
                <div className="space-y-4">
                  {SPAIN_PLAN.map(step => {
                    const amount = Math.round(price * step.pct / 100);
                    return (
                      <div key={step.label} className="flex items-center gap-4">
                        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: step.color }} />
                        <div className="flex-1 flex justify-between items-center">
                          <span className="text-sm text-slate-600">{step.label}</span>
                          <div className="text-right">
                            <span className="font-bold text-slate-900">{amount.toLocaleString("fr-FR")} €</span>
                            <span className="text-[10px] text-slate-400 ml-2">({step.pct}%)</span>
                          </div>
                        </div>
                        <div
                          className="hidden md:block h-1.5 rounded-full flex-shrink-0"
                          style={{ width: `${step.pct * 2}px`, backgroundColor: step.color, opacity: 0.3 }}
                        />
                      </div>
                    );
                  })}
                  <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total</span>
                    <span className="text-2xl font-serif italic text-slate-900">{price.toLocaleString("fr-FR")} €</span>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* ── UNIT GRID ─────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12">
            <div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#D4AF37] mb-4 flex items-center gap-4">
                <span className="w-10 h-px bg-[#D4AF37]" /> Unités disponibles
              </h2>
              <p className="text-4xl font-serif italic text-slate-900">Choisissez votre lot</p>
            </div>

            {/* Type filter tabs */}
            <div className="flex flex-wrap gap-2">
              {types.map(type => (
                <button
                  key={type}
                  onClick={() => setActiveType(type)}
                  className={`px-5 py-2.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border ${
                    activeType === type
                      ? "bg-[#0A0A0A] text-white border-transparent"
                      : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <p className="text-center text-slate-400 py-20 text-sm">Aucune unité pour ce type.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map(unit => (
                <UnitCard key={unit.id} unit={unit} onRequestPdf={ref => setLeadUnit(ref)} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── BOTTOM CTA ────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-[#0A0A0A] text-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <Building2 size={40} className="mx-auto mb-6 text-[#D4AF37]" />
          <h2 className="text-4xl md:text-5xl font-serif italic mb-4">{dev.development_name}</h2>
          <p className="text-slate-400 mb-10 text-sm leading-relaxed">
            Recevez le dossier complet du projet : plans d'architecte, plan de paiement personnalisé, brochure et disponibilités.
          </p>
          <button
            onClick={() => setLeadUnit("général")}
            className="inline-flex items-center gap-3 px-10 py-5 bg-[#D4AF37] text-[#0A0A0A] text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-white transition-all shadow-2xl"
          >
            <FileText size={16} /> Recevoir le dossier complet
          </button>
        </div>
      </section>

      <Footer />

      {/* ── LEAD MODAL ────────────────────────────────────────────────────────── */}
      {leadUnit && (
        <LeadModal
          unitRef={leadUnit}
          devName={dev.development_name || ""}
          onClose={() => setLeadUnit(null)}
        />
      )}
    </main>
  );
}
