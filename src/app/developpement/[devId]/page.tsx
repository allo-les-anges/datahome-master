"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  ArrowLeft, Building2, MapPin, Search, X,
  ChevronLeft, ChevronRight, FileText, CheckCircle,
  Waves, Car, TreePine, Dumbbell, ShieldCheck,
  Home, Plane, Flag, Utensils, ShoppingBag, Hospital,
  Train, Eye, Trees, Baby, GraduationCap, Clapperboard,
  TrendingUp, BarChart3, Key, Euro
} from "lucide-react";

const BRAND = "#D4AF37";

// ─── Types ───────────────────────────────────────────────────────────────────

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
  region?: string;
  province?: string;
  latitude?: number | null;
  longitude?: number | null;
  development_name?: string;
  promoteur_name?: string;
  description?: string;
  status?: string;
  commission_percentage?: string | number | null;
  distance_beach?: string | number | null;
  distance_golf?: string | number | null;
  distance_town?: string | number | null;
}

interface LeadForm { name: string; email: string; phone: string; unitRef: string }

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtPrice(n: number) { return n.toLocaleString("fr-FR") + " €"; }

function fmtDist(v: string | number | null | undefined) {
  if (v === null || v === undefined || v === "" || v === "0") return null;
  const n = parseFloat(String(v));
  return isNaN(n) || n === 0 ? null : `${n} km`;
}

function unitName(unit: Unit) {
  const suffix = unit.ref?.split("-").slice(1).join("-");
  return suffix || unit.ref || unit.id?.slice(0, 8);
}

function isAvailable(unit: Unit) {
  const s = (unit.status || "").toLowerCase();
  return !s || s === "disponible" || s === "available";
}

// ─── StatusBadge ─────────────────────────────────────────────────────────────

function StatusBadge({ unit }: { unit: Unit }) {
  const avail    = isAvailable(unit);
  const reserved = ["réservé", "reserved", "reservado"].includes((unit.status || "").toLowerCase());
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
      reserved ? "bg-orange-50 text-orange-700 border border-orange-200"
      : avail   ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-slate-100 text-slate-500 border border-slate-200"
    }`}>
      {reserved ? "Reserved" : avail ? "Available" : unit.status}
    </span>
  );
}

// ─── Lead modal ───────────────────────────────────────────────────────────────

function LeadModal({ unitRef, devName, onClose }: { unitRef: string; devName: string; onClose: () => void }) {
  const [form, setForm]     = useState<LeadForm>({ name: "", email: "", phone: "", unitRef });
  const [sent, setSent]     = useState(false);
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); setSending(true);
    try {
      await fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, subject: `Dossier – ${devName} – ${unitRef}` }) });
      setSent(true);
    } finally { setSending(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative">
        <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-slate-700"><X size={18} /></button>
        {sent ? (
          <div className="text-center py-6">
            <CheckCircle size={44} className="mx-auto mb-4 text-green-500" />
            <h3 className="text-lg font-bold mb-2">Request sent!</h3>
            <p className="text-slate-500 text-sm">Our team will contact you within 24h.</p>
            <button onClick={onClose} className="mt-6 px-6 py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-lg">Close</button>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-bold text-slate-900 mb-1">{devName}</h3>
            {unitRef !== "general" && <p className="text-xs text-slate-400 mb-5">Unit · {unitRef}</p>}
            <p className="text-sm text-slate-500 mb-6">Receive the complete dossier: floor plans, payment schedule and availability.</p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name" className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#D4AF37]" />
              <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Email" className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#D4AF37]" />
              <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="Phone (optional)" className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#D4AF37]" />
              <button type="submit" disabled={sending} className="w-full py-3 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2" style={{ backgroundColor: BRAND }}>
                {sending ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FileText size={14} />}
                Request dossier
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Properties tab ───────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

function PropertiesTab({ units, onRequest }: { units: Unit[]; onRequest: (ref: string) => void }) {
  const [search, setSearch] = useState("");
  const [page, setPage]     = useState(1);
  const [goTo, setGoTo]     = useState("");

  const filtered    = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return units;
    return units.filter(u => (u.ref || "").toLowerCase().includes(q) || (u.type || "").toLowerCase().includes(q) || String(u.price).includes(q));
  }, [units, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages);
  const slice      = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} placeholder="Search"
            className="pl-8 pr-8 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-[#D4AF37] w-52" />
          {search && <button onClick={() => { setSearch(""); setPage(1); }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"><X size={12} /></button>}
        </div>
        <span className="text-xs text-slate-500">{filtered.length} properties</span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {["Name", "Ref.", "Status", "Typology", "Price", "Bedrooms", "Bathrooms", "Sq. meters", "Pool", "Actions"].map(h => (
                <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.length === 0 ? (
              <tr><td colSpan={10} className="text-center py-10 text-slate-400 text-sm">No properties found.</td></tr>
            ) : slice.map((unit, i) => {
              const surf    = parseFloat(String(unit.surface_built || "0")) || 0;
              const hasPool = unit.pool === "Oui" || unit.pool === true || unit.pool === "1";
              return (
                <tr key={unit.id} className={`border-b border-slate-100 hover:bg-amber-50/20 transition-colors ${i % 2 === 0 ? "" : "bg-slate-50/50"}`}>
                  <td className="px-3 py-2.5 font-medium text-slate-800 whitespace-nowrap">{unitName(unit)}</td>
                  <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap">{unit.ref?.split("-").slice(1).join("-") || "—"}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap"><StatusBadge unit={unit} /></td>
                  <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap capitalize">{unit.type || "—"}</td>
                  <td className="px-3 py-2.5 font-semibold text-slate-800 whitespace-nowrap">{unit.price ? fmtPrice(Number(unit.price)) : "—"}</td>
                  <td className="px-3 py-2.5 text-center text-slate-600">{unit.beds ?? "—"}</td>
                  <td className="px-3 py-2.5 text-center text-slate-600">{unit.baths ?? "—"}</td>
                  <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">{surf > 0 ? `${surf} m²` : "—"}</td>
                  <td className="px-3 py-2.5 text-center">{hasPool ? <span className="text-green-500">✓</span> : <span className="text-slate-300">—</span>}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Link href={`/bien/${unit.id}`} className="text-xs hover:underline" style={{ color: BRAND }}>View</Link>
                      <button onClick={() => onRequest(unit.ref || unit.id)} className="text-xs text-slate-500 hover:text-slate-800 hover:underline">Dossier</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span>Row per page</span>
          <span className="px-2 py-1 border border-slate-200 rounded font-medium">{PAGE_SIZE}</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1} className="p-1.5 rounded border border-slate-200 disabled:opacity-30"><ChevronLeft size={14} /></button>
          <span className="text-xs text-slate-600 font-medium">{safePage} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} className="p-1.5 rounded border border-slate-200 disabled:opacity-30"><ChevronRight size={14} /></button>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 ml-2">
            <span>Go to</span>
            <input value={goTo} onChange={e => setGoTo(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") { const n = parseInt(goTo); if (!isNaN(n)) setPage(Math.min(Math.max(1, n), totalPages)); setGoTo(""); }}}
              className="w-10 px-2 py-1 border border-slate-200 rounded text-center outline-none" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Location I tab ───────────────────────────────────────────────────────────

function LocationTab({ unit }: { unit: Unit }) {
  const hasCoords = unit.latitude && unit.longitude;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Location I</h3>
        <dl>
          {[
            ["Autonomous Community", unit.region || "—"],
            ["Province",            unit.province || unit.region || "—"],
            ["City",                unit.town || "—"],
            ["Coordinates",         hasCoords ? `${unit.latitude}, ${unit.longitude}` : "—"],
          ].map(([label, value]) => (
            <div key={label} className="flex gap-4 py-2.5 border-b border-slate-100">
              <dt className="text-xs text-slate-400 w-44 shrink-0">{label}</dt>
              <dd className="text-sm text-slate-800 font-medium">{value}</dd>
            </div>
          ))}
        </dl>
        {hasCoords && (
          <a href={`https://maps.google.com/?q=${unit.latitude},${unit.longitude}`} target="_blank" rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-xs hover:underline" style={{ color: BRAND }}>
            <MapPin size={12} /> Open in Google Maps
          </a>
        )}
      </div>
      <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 min-h-[240px] flex items-center justify-center">
        {hasCoords ? (
          <iframe title="map" width="100%" height="280" style={{ border: 0 }} loading="lazy"
            src={`https://maps.google.com/maps?q=${unit.latitude},${unit.longitude}&z=14&output=embed`} />
        ) : (
          <div className="text-center text-slate-400 p-8">
            <MapPin size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No coordinates available</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Location II tab ──────────────────────────────────────────────────────────

interface DistanceRow { icon: React.ReactNode; label: string; value: string | null }

function LocationIITab({ unit }: { unit: Unit }) {
  const rows: DistanceRow[] = [
    { icon: <Plane      size={14} />, label: "Airport",         value: fmtDist(null) },
    { icon: <Flag       size={14} />, label: "Golf course",     value: fmtDist(unit.distance_golf) },
    { icon: <Waves      size={14} />, label: "Near the sea",    value: fmtDist(unit.distance_beach) },
    { icon: <Home       size={14} />, label: "Town center",     value: fmtDist(unit.distance_town) },
    { icon: <ShoppingBag size={14}/>, label: "Mall",            value: null },
    { icon: <Hospital   size={14} />, label: "Hospital",        value: null },
    { icon: <Train      size={14} />, label: "Train station",   value: null },
    { icon: <Utensils   size={14} />, label: "Restaurants",     value: null },
    { icon: <Clapperboard size={14}/>,label: "Cinema",          value: null },
    { icon: <GraduationCap size={14}/>,label:"University",      value: null },
    { icon: <Trees      size={14} />, label: "Natural park",    value: null },
    { icon: <Baby       size={14} />, label: "Kindergarten",    value: null },
  ];

  const available = rows.filter(r => r.value !== null);
  const hasAny    = available.length > 0;

  return (
    <div>
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Location II — Distances & Features</h3>
      {hasAny ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0">
          {available.map(row => (
            <div key={row.label} className="flex items-center gap-3 py-2.5 border-b border-slate-100">
              <span className="text-slate-400 shrink-0">{row.icon}</span>
              <span className="text-sm text-slate-600 flex-1">{row.label}</span>
              <span className="text-sm font-medium text-slate-800">{row.value}</span>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-400">
          No distance data available for this development.
          Distance information is sourced from the property feed.
        </p>
      )}

      {/* Feature tags (city view, residential area, etc.) */}
      <div className="mt-6">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Environment</h4>
        <div className="flex flex-wrap gap-2">
          {[
            unit.town && { icon: <Eye size={13} />,   label: "City views" },
            unit.region && { icon: <Trees size={13} />, label: "Green surroundings" },
          ].filter(Boolean).map((tag: any) => (
            <span key={tag.label} className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-600">
              {tag.icon} {tag.label}
            </span>
          ))}
          {!unit.town && <p className="text-sm text-slate-400">No environment tags available.</p>}
        </div>
      </div>
    </div>
  );
}

// ─── Features tab ─────────────────────────────────────────────────────────────

const ALL_FEATURES = [
  { key: "pool",      label: "Swimming pool",     icon: <Waves      size={15} /> },
  { key: "garden",    label: "Garden areas",       icon: <TreePine   size={15} /> },
  { key: "gym",       label: "Gym",                icon: <Dumbbell   size={15} /> },
  { key: "parking",   label: "Parking / Garage",   icon: <Car        size={15} /> },
  { key: "security",  label: "Safe urbanization",  icon: <ShieldCheck size={15}/> },
  { key: "elevator",  label: "Elevator",           icon: <Building2  size={15} /> },
];

function FeaturesTab({ units }: { units: Unit[] }) {
  const hasPool     = units.some(u => u.pool === "Oui" || u.pool === true || u.pool === "1");
  const types       = Array.from(new Set(units.map(u => u.type).filter(Boolean)));
  const hasApartment = types.some(t => t.toLowerCase().includes("apartment") || t.toLowerCase().includes("piso"));
  const hasVilla    = types.some(t => t.toLowerCase().includes("villa"));

  const active = ALL_FEATURES.filter(f => {
    if (f.key === "pool") return hasPool;
    if (f.key === "elevator") return hasApartment;
    return false;
  });

  return (
    <div>
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Development Features</h3>
      {active.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
          {active.map(f => (
            <div key={f.key} className="flex items-center gap-2.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700">
              <span style={{ color: BRAND }}>{f.icon}</span> {f.label}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-400 mb-6">Feature data is sourced from the property feed — no specific amenities detected.</p>
      )}

      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Property types in this development</h4>
      <div className="flex flex-wrap gap-2">
        {types.length > 0 ? types.map(t => (
          <span key={t} className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-700 capitalize">{t}</span>
        )) : <p className="text-sm text-slate-400">No type data available.</p>}
      </div>
    </div>
  );
}

// ─── Payment Method tab ───────────────────────────────────────────────────────

const SPAIN_PLAN = [
  { step: 1, label: "Reservation",      icon: <Key size={16} />,       pct: 10, color: BRAND,      desc: "Signing the reservation contract" },
  { step: 2, label: "Start of works",   icon: <TrendingUp size={16} />, pct: 20, color: "#10b981",  desc: "Effective launch of construction" },
  { step: 3, label: "Key handover",     icon: <Home size={16} />,       pct: 70, color: "#3b82f6",  desc: "Delivery & notarial deed" },
];

function PaymentMethodTab({ units }: { units: Unit[] }) {
  const exampleUnit = units.find(u => Number(u.price) > 0);
  const price       = exampleUnit ? Number(exampleUnit.price) : 0;

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Spain VEFA Payment Plan</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {SPAIN_PLAN.map(s => (
            <div key={s.step} className="bg-slate-50 border border-slate-200 rounded-xl p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-full flex items-center justify-center text-white" style={{ backgroundColor: s.color }}>
                  {s.icon}
                </div>
                <span className="text-3xl font-bold" style={{ color: s.color }}>{s.pct}%</span>
              </div>
              <p className="font-semibold text-slate-800 text-sm mb-1">{s.label}</p>
              <p className="text-xs text-slate-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {price > 0 && (
        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
            Example — {exampleUnit?.titre || unitName(exampleUnit!)}
          </h4>
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            {SPAIN_PLAN.map((s, i) => {
              const amount = Math.round(price * s.pct / 100);
              return (
                <div key={s.step} className={`flex items-center justify-between px-5 py-3.5 ${i < SPAIN_PLAN.length - 1 ? "border-b border-slate-100" : ""}`}>
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                    <span className="text-sm text-slate-700">{s.label}</span>
                    <span className="text-xs text-slate-400">({s.pct}%)</span>
                  </div>
                  <span className="font-semibold text-slate-900">{fmtPrice(amount)}</span>
                </div>
              );
            })}
            <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50 border-t border-slate-200">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total</span>
              <span className="font-bold text-slate-900 text-base">{fmtPrice(price)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Metrics tab ──────────────────────────────────────────────────────────────

function MetricsTab({ units }: { units: Unit[] }) {
  const prices     = units.map(u => Number(u.price || 0)).filter(Boolean);
  const surfaces   = units.map(u => parseFloat(String(u.surface_built || "0"))).filter(n => n > 0);
  const available  = units.filter(isAvailable).length;
  const sold       = units.length - available;

  const avgPrice   = prices.length   ? Math.round(prices.reduce((a, b) => a + b, 0) / prices.length)    : null;
  const avgSurf    = surfaces.length ? Math.round(surfaces.reduce((a, b) => a + b, 0) / surfaces.length) : null;
  const avgPriceM2 = avgPrice && avgSurf ? Math.round(avgPrice / avgSurf) : null;
  const pctSold    = units.length > 0 ? Math.round((sold / units.length) * 100) : 0;
  const minPrice   = prices.length ? Math.min(...prices) : null;
  const maxPrice   = prices.length ? Math.max(...prices) : null;

  const stats = [
    { label: "Average price",     value: avgPrice   ? fmtPrice(avgPrice)      : "—", icon: <Euro    size={16} /> },
    { label: "Average €/m²",      value: avgPriceM2 ? `${avgPriceM2.toLocaleString("fr-FR")} €/m²` : "—", icon: <BarChart3 size={16} /> },
    { label: "Stock available",   value: `${available} / ${units.length}`,             icon: <Home    size={16} /> },
    { label: "Cumul. % sold",     value: `${pctSold}%`,                                icon: <TrendingUp size={16} /> },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Development Metrics</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {stats.map(s => (
            <div key={s.label} className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-4">
              <div className="flex items-center gap-2 mb-2" style={{ color: BRAND }}>{s.icon}</div>
              <p className="text-lg font-bold text-slate-900">{s.value}</p>
              <p className="text-xs text-slate-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {(minPrice || maxPrice) && (
        <div>
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Price range</h4>
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            {[
              ["Minimum price", minPrice ? fmtPrice(minPrice) : "—"],
              ["Maximum price", maxPrice ? fmtPrice(maxPrice) : "—"],
              ["Average price", avgPrice ? fmtPrice(avgPrice) : "—"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between items-center px-5 py-3 border-b border-slate-100 last:border-0">
                <span className="text-sm text-slate-500">{label}</span>
                <span className="font-semibold text-slate-800">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <p className="text-xs text-slate-400 italic">
        The information provided regarding prices, commissions, specifications, and details of this development is subject to changes. Commissions must be confirmed directly with the developer.
      </p>
    </div>
  );
}

// ─── Sales Information tab ────────────────────────────────────────────────────

function SalesTab({ unit }: { unit: Unit }) {
  const commission = unit.commission_percentage;
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Sales Information</h3>
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          {[
            ["Commission type", "Fixed percentage"],
            ["Commission", commission ? `${commission}%` : "To confirm with developer"],
            ["Referral commission", "To confirm"],
          ].map(([label, value]) => (
            <div key={label} className="flex gap-4 py-3 px-5 border-b border-slate-100 last:border-0">
              <span className="text-xs text-slate-400 w-44 shrink-0">{label}</span>
              <span className="text-sm text-slate-800 font-medium">{value}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
        <p className="text-xs text-amber-800 leading-relaxed">
          The information provided regarding prices, commissions, specifications, and details of this development is subject to changes and variations depending on the source. It has no contractual or commercial value by itself. Commissions must be confirmed directly with the developer.
        </p>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

type Tab = "properties" | "location" | "location2" | "features" | "payment" | "metrics" | "sales";

export default function DevelopmentPage() {
  const { devId }    = useParams();
  const router       = useRouter();
  const [units, setUnits]         = useState<Unit[]>([]);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("properties");
  const [leadUnit, setLeadUnit]   = useState<string | null>(null);
  const [galleryIdx, setGalleryIdx] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const res  = await fetch(`/api/properties?reference=${devId}&limit=200`);
        const data = await res.json();
        const all: Unit[] = data.properties || data || [];
        const devPrefix   = String(devId).toLowerCase();
        setUnits(all.filter(p => (p.ref?.split("-")[0] || "").toLowerCase() === devPrefix));
      } catch (err) { console.error("Erreur API:", err); }
      finally { setLoading(false); }
    }
    load();
  }, [devId]);

  const dev          = units[0];
  const devName      = dev?.development_name || `Programme ${devId}`;
  const company      = dev?.promoteur_name   || null;
  const availableCount = units.filter(isAvailable).length;
  const prices         = units.map(u => Number(u.price || 0)).filter(Boolean);
  const minPrice       = prices.length ? Math.min(...prices) : 0;
  const maxPrice       = prices.length ? Math.max(...prices) : 0;

  // Collect unique images from all units
  const allImages = useMemo(() => {
    const seen = new Set<string>();
    const imgs: string[] = [];
    for (const u of units) {
      for (const img of (u.images || [])) {
        if (img && !seen.has(img)) { seen.add(img); imgs.push(img); }
      }
    }
    return imgs.slice(0, 20);
  }, [units]);

  const TABS: { key: Tab; label: string; count?: number }[] = [
    { key: "properties", label: "Properties",       count: units.length },
    { key: "location",   label: "Location I" },
    { key: "location2",  label: "Location II" },
    { key: "features",   label: "Features" },
    { key: "payment",    label: "Payment Method" },
    { key: "metrics",    label: "Metrics" },
    { key: "sales",      label: "Sales Information" },
  ];

  if (loading) return (
    <div className="min-h-screen bg-slate-50"><Navbar />
      <div className="h-[60vh] flex flex-col items-center justify-center mt-32">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-[#D4AF37] rounded-full animate-spin mb-3" />
        <p className="text-sm text-slate-400">Loading development…</p>
      </div>
    </div>
  );

  if (!units.length) return (
    <div className="min-h-screen bg-slate-50"><Navbar />
      <div className="h-[60vh] flex flex-col items-center justify-center text-center px-6 mt-32">
        <Building2 size={36} className="mb-4 text-slate-300" />
        <h1 className="text-xl font-bold text-slate-700 mb-2">Development not found</h1>
        <p className="text-sm text-slate-400 mb-6">No units found for ID: {devId}</p>
        <Link href="/developpements" className="text-sm flex items-center gap-1 hover:underline" style={{ color: BRAND }}>
          <ArrowLeft size={14} /> Back to developments
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-36 pb-16">

        {/* Back button */}
        <div className="mb-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-sm"
          >
            <ArrowLeft size={14} /> Back
          </button>
        </div>

        {/* Image gallery */}
        {allImages.length > 0 && (
          <div className="mb-6 rounded-2xl overflow-hidden bg-slate-900 relative" style={{ height: 340 }}>
            <img
              src={allImages[galleryIdx]}
              alt={devName}
              className="w-full h-full object-cover"
            />
            {/* Gradient overlay with title */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
              <div>
                <h1 className="text-white text-xl font-bold drop-shadow">{devName}</h1>
                {dev.town && (
                  <p className="text-white/80 text-sm flex items-center gap-1 mt-0.5">
                    <MapPin size={12} /> {dev.town}{dev.region && dev.region !== dev.town ? ` · ${dev.region}` : ""}
                  </p>
                )}
              </div>
              <button onClick={() => setLeadUnit("general")}
                className="shrink-0 flex items-center gap-2 px-4 py-2.5 text-white text-sm font-semibold rounded-lg transition-opacity hover:opacity-90 shadow-lg"
                style={{ backgroundColor: BRAND }}>
                <FileText size={14} /> Request dossier
              </button>
            </div>
            {/* Nav arrows */}
            {allImages.length > 1 && (
              <>
                <button onClick={() => setGalleryIdx(i => (i - 1 + allImages.length) % allImages.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors">
                  <ChevronLeft size={16} />
                </button>
                <button onClick={() => setGalleryIdx(i => (i + 1) % allImages.length)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors">
                  <ChevronRight size={16} />
                </button>
                {/* Dot counter */}
                <div className="absolute top-3 right-3 bg-black/40 text-white text-xs px-2 py-1 rounded-full">
                  {galleryIdx + 1} / {allImages.length}
                </div>
              </>
            )}
            {/* Thumbnail strip */}
            {allImages.length > 1 && (
              <div className="absolute bottom-0 left-0 right-0 flex gap-1.5 px-4 pb-2 justify-center overflow-hidden">
                {allImages.slice(0, 8).map((img, i) => (
                  <button key={i} onClick={() => setGalleryIdx(i)}
                    className={`shrink-0 w-10 h-7 rounded overflow-hidden border-2 transition-all ${i === galleryIdx ? "border-white opacity-100" : "border-transparent opacity-50 hover:opacity-75"}`}>
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Header (when no images) */}
        {allImages.length === 0 && (
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
            <div>
              {dev.town && (
                <p className="text-sm text-slate-500 mb-1 flex items-center gap-1.5">
                  <MapPin size={12} className="text-slate-400" />
                  {dev.town}{dev.region && dev.region !== dev.town ? ` · ${dev.region}` : ""}
                </p>
              )}
              <h1 className="text-2xl font-bold text-slate-900">{devName}</h1>
            </div>
            <button onClick={() => setLeadUnit("general")}
              className="shrink-0 flex items-center gap-2 px-4 py-2.5 text-white text-sm font-semibold rounded-lg transition-opacity hover:opacity-90"
              style={{ backgroundColor: BRAND }}>
              <FileText size={14} /> Request dossier
            </button>
          </div>
        )}

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 px-4 py-3">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Properties</p>
            <p className="text-base font-bold text-slate-900">{availableCount} <span className="text-slate-400 font-normal">/ {units.length}</span></p>
            <p className="text-[10px] text-slate-400">Available / Total</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 px-4 py-3">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Price (€)</p>
            <p className="text-base font-bold text-slate-900">
              {minPrice ? minPrice.toLocaleString("fr-FR") : "—"}
              {maxPrice && maxPrice !== minPrice ? <span className="text-slate-400 font-normal text-sm">–{maxPrice.toLocaleString("fr-FR")}</span> : ""}
            </p>
            <p className="text-[10px] text-slate-400">From – To</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 px-4 py-3">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Development Company</p>
            <p className="text-sm font-bold text-slate-900 truncate">{company || "—"}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Contact</p>
              <p className="text-sm font-bold text-slate-900">Sales team</p>
            </div>
            <button onClick={() => setLeadUnit("general")} className="p-2 rounded-lg hover:opacity-80" style={{ backgroundColor: `${BRAND}20`, color: BRAND }}>
              <Home size={16} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          <div className="flex border-b border-slate-200 overflow-x-auto">
            {TABS.map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-4 py-3.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                  activeTab === tab.key ? "border-[#D4AF37] text-[#b8962e]" : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}>
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                    activeTab === tab.key ? "text-[#b8962e]" : "bg-slate-100 text-slate-500"
                  }`} style={activeTab === tab.key ? { backgroundColor: `${BRAND}20` } : {}}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="p-6">
            {activeTab === "properties" && <PropertiesTab units={units} onRequest={setLeadUnit} />}
            {activeTab === "location"   && <LocationTab unit={dev} />}
            {activeTab === "location2"  && <LocationIITab unit={dev} />}
            {activeTab === "features"   && <FeaturesTab units={units} />}
            {activeTab === "payment"    && <PaymentMethodTab units={units} />}
            {activeTab === "metrics"    && <MetricsTab units={units} />}
            {activeTab === "sales"      && <SalesTab unit={dev} />}
          </div>
        </div>
      </div>

      <Footer />
      {leadUnit && <LeadModal unitRef={leadUnit} devName={devName} onClose={() => setLeadUnit(null)} />}
    </div>
  );
}
