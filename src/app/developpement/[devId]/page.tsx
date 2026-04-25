"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  ArrowLeft, Building2, MapPin, Search, X,
  ChevronLeft, ChevronRight, FileText, CheckCircle,
  Waves, Car, TreePine, Dumbbell, ShieldCheck, Wifi,
  Euro, Home, SquareAsterisk
} from "lucide-react";

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
  latitude?: number;
  longitude?: number;
  development_name?: string;
  promoteur_name?: string;
  description?: string;
  status?: string;
  commission_percentage?: string | number;
}

interface LeadForm { name: string; email: string; phone: string; unitRef: string }

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtPrice(n: number) {
  return n.toLocaleString("fr-FR") + " €";
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
  const avail = isAvailable(unit);
  const reserved = ["réservé", "reserved", "reservado"].includes((unit.status || "").toLowerCase());
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
      reserved ? "bg-orange-50 text-orange-700 border border-orange-200"
      : avail    ? "bg-green-50 text-green-700 border border-green-200"
                 : "bg-slate-100 text-slate-500 border border-slate-200"
    }`}>
      {reserved ? "Reserved" : avail ? "Available" : unit.status}
    </span>
  );
}

// ─── Lead modal ───────────────────────────────────────────────────────────────

function LeadModal({ unitRef, devName, onClose }: { unitRef: string; devName: string; onClose: () => void }) {
  const [form, setForm] = useState<LeadForm>({ name: "", email: "", phone: "", unitRef });
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSending(true);
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, subject: `Dossier – ${devName} – ${unitRef}` }),
      });
      setSent(true);
    } finally { setSending(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative">
        <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-slate-700">
          <X size={18} />
        </button>
        {sent ? (
          <div className="text-center py-6">
            <CheckCircle size={44} className="mx-auto mb-4 text-green-500" />
            <h3 className="text-lg font-bold text-slate-900 mb-2">Request sent!</h3>
            <p className="text-slate-500 text-sm">Our team will contact you within 24h.</p>
            <button onClick={onClose} className="mt-6 px-6 py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-700 transition-colors">
              Close
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-bold text-slate-900 mb-1">{devName}</h3>
            {unitRef !== "general" && <p className="text-xs text-slate-400 mb-5">Unit · {unitRef}</p>}
            <p className="text-sm text-slate-500 mb-6">Receive the complete dossier: floor plans, payment schedule and availability.</p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Full name" className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-400" />
              <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="Email" className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-400" />
              <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="Phone (optional)" className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-blue-400" />
              <button type="submit" disabled={sending} className="w-full py-3 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
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

// ─── Properties table ─────────────────────────────────────────────────────────

const PAGE_SIZE = 10;

function PropertiesTab({ units, onRequest }: { units: Unit[]; onRequest: (ref: string) => void }) {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [goTo, setGoTo] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return units;
    return units.filter(u =>
      (u.ref || "").toLowerCase().includes(q) ||
      (u.type || "").toLowerCase().includes(q) ||
      String(u.price).includes(q)
    );
  }, [units, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const slice = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search"
            className="pl-8 pr-8 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-blue-400 w-52"
          />
          {search && (
            <button onClick={() => { setSearch(""); setPage(1); }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
              <X size={12} />
            </button>
          )}
        </div>
        <span className="text-xs text-slate-500">{filtered.length} properties</span>
      </div>

      {/* Table */}
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
              <tr>
                <td colSpan={10} className="text-center py-10 text-slate-400 text-sm">No properties found.</td>
              </tr>
            ) : slice.map((unit, i) => {
              const surf = parseFloat(String(unit.surface_built || "0")) || 0;
              const hasPool = unit.pool === "Oui" || unit.pool === true || unit.pool === "1";
              return (
                <tr key={unit.id} className={`border-b border-slate-100 hover:bg-blue-50/30 transition-colors ${i % 2 === 0 ? "" : "bg-slate-50/50"}`}>
                  <td className="px-3 py-2.5 font-medium text-slate-800 whitespace-nowrap">{unitName(unit)}</td>
                  <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap">{unit.ref?.split("-").slice(1).join("-") || "—"}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap"><StatusBadge unit={unit} /></td>
                  <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap capitalize">{unit.type || "—"}</td>
                  <td className="px-3 py-2.5 font-semibold text-slate-800 whitespace-nowrap">
                    {unit.price ? fmtPrice(Number(unit.price)) : "—"}
                  </td>
                  <td className="px-3 py-2.5 text-center text-slate-600">{unit.beds ?? "—"}</td>
                  <td className="px-3 py-2.5 text-center text-slate-600">{unit.baths ?? "—"}</td>
                  <td className="px-3 py-2.5 text-slate-600 whitespace-nowrap">{surf > 0 ? `${surf} m²` : "—"}</td>
                  <td className="px-3 py-2.5 text-center">
                    {hasPool ? <span className="text-blue-500 text-base">✓</span> : <span className="text-slate-300 text-base">—</span>}
                  </td>
                  <td className="px-3 py-2.5 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <Link href={`/bien/${unit.id}`} className="text-xs text-blue-600 hover:underline">View</Link>
                      <button onClick={() => onRequest(unit.ref || unit.id)} className="text-xs text-slate-500 hover:text-slate-800 hover:underline">Dossier</button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span>Row per page</span>
          <span className="px-2 py-1 border border-slate-200 rounded font-medium">{PAGE_SIZE}</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1} className="p-1.5 rounded border border-slate-200 disabled:opacity-30 hover:bg-slate-50">
            <ChevronLeft size={14} />
          </button>
          <span className="text-xs text-slate-600 font-medium">{safePage} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} className="p-1.5 rounded border border-slate-200 disabled:opacity-30 hover:bg-slate-50">
            <ChevronRight size={14} />
          </button>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 ml-2">
            <span>Go to</span>
            <input
              value={goTo}
              onChange={e => setGoTo(e.target.value)}
              onKeyDown={e => {
                if (e.key === "Enter") {
                  const n = parseInt(goTo);
                  if (!isNaN(n)) setPage(Math.min(Math.max(1, n), totalPages));
                  setGoTo("");
                }
              }}
              className="w-10 px-2 py-1 border border-slate-200 rounded text-center outline-none focus:border-blue-400"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Location tab ─────────────────────────────────────────────────────────────

function LocationTab({ unit }: { unit: Unit }) {
  const hasCoords = unit.latitude && unit.longitude;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Address */}
      <div>
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Location I</h3>
        <dl className="space-y-3">
          {[
            ["Autonomous Community", unit.region || "—"],
            ["Province", unit.province || unit.region || "—"],
            ["City", unit.town || "—"],
            ["Coordinates", hasCoords ? `${unit.latitude}, ${unit.longitude}` : "—"],
          ].map(([label, value]) => (
            <div key={label} className="flex gap-4 py-2 border-b border-slate-100">
              <dt className="text-xs text-slate-400 w-44 shrink-0">{label}</dt>
              <dd className="text-sm text-slate-800 font-medium">{value}</dd>
            </div>
          ))}
        </dl>

        {hasCoords && (
          <a
            href={`https://maps.google.com/?q=${unit.latitude},${unit.longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 text-xs text-blue-600 hover:underline"
          >
            <MapPin size={12} /> Open in Google Maps
          </a>
        )}
      </div>

      {/* Map placeholder */}
      <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 min-h-[240px] flex items-center justify-center">
        {hasCoords ? (
          <iframe
            title="map"
            width="100%"
            height="280"
            style={{ border: 0 }}
            loading="lazy"
            src={`https://maps.google.com/maps?q=${unit.latitude},${unit.longitude}&z=14&output=embed`}
          />
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

// ─── Features tab ─────────────────────────────────────────────────────────────

const FEATURE_ICONS: Record<string, React.ReactNode> = {
  "Pool": <Waves size={16} />, "Piscine": <Waves size={16} />,
  "Gym": <Dumbbell size={16} />, "Salle de sport": <Dumbbell size={16} />,
  "Garden": <TreePine size={16} />, "Jardin": <TreePine size={16} />,
  "Garage": <Car size={16} />, "Parking": <Car size={16} />,
  "Security": <ShieldCheck size={16} />, "Sécurité": <ShieldCheck size={16} />,
  "WiFi": <Wifi size={16} />,
};

function FeaturesTab({ units }: { units: Unit[] }) {
  const hasPool = units.some(u => u.pool === "Oui" || u.pool === true || u.pool === "1");
  const types = Array.from(new Set(units.map(u => u.type).filter(Boolean)));

  const features = [
    hasPool && "Swimming pool",
    types.length > 0 && `Types: ${types.join(", ")}`,
  ].filter(Boolean) as string[];

  return (
    <div>
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Development Features</h3>
      {features.length > 0 ? (
        <div className="flex flex-wrap gap-3">
          {features.map(f => (
            <div key={f} className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700">
              {FEATURE_ICONS[f] || <SquareAsterisk size={14} className="text-slate-400" />}
              {f}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-400">No feature data available for this development.</p>
      )}
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

type Tab = "properties" | "location" | "features" | "sales";

export default function DevelopmentPage() {
  const { devId } = useParams();
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("properties");
  const [leadUnit, setLeadUnit] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/properties?reference=${devId}&limit=200`);
        const data = await res.json();
        const all: Unit[] = data.properties || data || [];
        const devPrefix = String(devId).toLowerCase();
        const devUnits = all.filter(p => {
          const refPrefix = (p.ref?.split("-")[0] || "").toLowerCase();
          return refPrefix === devPrefix;
        });
        setUnits(devUnits);
      } catch (err) {
        console.error("Erreur API:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [devId]);

  const dev = units[0];
  const devName = dev?.development_name || `Programme ${devId}`;
  const company = dev?.promoteur_name || null;
  const availableCount = units.filter(isAvailable).length;
  const prices = units.map(u => Number(u.price || 0)).filter(Boolean);
  const minPrice = prices.length ? Math.min(...prices) : 0;
  const maxPrice = prices.length ? Math.max(...prices) : 0;

  const TABS: { key: Tab; label: string; count?: number }[] = [
    { key: "properties", label: "Properties", count: units.length },
    { key: "location",   label: "Location" },
    { key: "features",   label: "Features" },
    { key: "sales",      label: "Sales Information" },
  ];

  if (loading) return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="h-[60vh] flex flex-col items-center justify-center">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-blue-500 rounded-full animate-spin mb-3" />
        <p className="text-sm text-slate-400">Loading development…</p>
      </div>
    </div>
  );

  if (!units.length) return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="h-[60vh] flex flex-col items-center justify-center text-center px-6">
        <Building2 size={36} className="mb-4 text-slate-300" />
        <h1 className="text-xl font-bold text-slate-700 mb-2">Development not found</h1>
        <p className="text-sm text-slate-400 mb-6">No units found for ID: {devId}</p>
        <Link href="/developpements" className="text-sm text-blue-600 hover:underline flex items-center gap-1">
          <ArrowLeft size={14} /> Back to developments
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-20 pb-16">

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-4 pt-4">
          <Link href="/developpements" className="hover:text-blue-600 transition-colors flex items-center gap-1">
            <ArrowLeft size={12} /> Developments
          </Link>
          <span>/</span>
          <span className="text-slate-600 font-medium">{devName}</span>
        </div>

        {/* Header */}
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
          <button
            onClick={() => setLeadUnit("general")}
            className="shrink-0 flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FileText size={14} /> Request dossier
          </button>
        </div>

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 px-4 py-3">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Properties</p>
            <p className="text-base font-bold text-slate-900">
              {availableCount} <span className="text-slate-400 font-normal">/ {units.length}</span>
            </p>
            <p className="text-[10px] text-slate-400">Available / Total</p>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 px-4 py-3">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">Price (€)</p>
            <p className="text-base font-bold text-slate-900">
              {minPrice ? minPrice.toLocaleString("fr-FR") : "—"}
              {maxPrice && maxPrice !== minPrice ? <span className="text-slate-400 font-normal">–{maxPrice.toLocaleString("fr-FR")}</span> : ""}
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
            <button
              onClick={() => setLeadUnit("general")}
              className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
            >
              <Home size={16} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
          {/* Tab bar */}
          <div className="flex border-b border-slate-200 overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-5 py-3.5 text-sm font-medium whitespace-nowrap transition-colors border-b-2 -mb-px ${
                  activeTab === tab.key
                    ? "border-blue-500 text-blue-600"
                    : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                    activeTab === tab.key ? "bg-blue-100 text-blue-600" : "bg-slate-100 text-slate-500"
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-6">
            {activeTab === "properties" && (
              <PropertiesTab units={units} onRequest={setLeadUnit} />
            )}
            {activeTab === "location" && <LocationTab unit={dev} />}
            {activeTab === "features" && <FeaturesTab units={units} />}
            {activeTab === "sales" && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Sales Information</h3>
                  <dl className="space-y-0">
                    {[
                      ["Commission type", "Fixed percentage"],
                      ["Percentage", dev.commission_percentage ? `${dev.commission_percentage}%` : "To confirm"],
                    ].map(([label, value]) => (
                      <div key={label} className="flex gap-4 py-2.5 border-b border-slate-100">
                        <dt className="text-xs text-slate-400 w-44 shrink-0">{label}</dt>
                        <dd className="text-sm text-slate-800 font-medium">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <p className="text-xs text-amber-800 leading-relaxed">
                    The information provided regarding prices, commissions, specifications, and details of this development is subject to changes and variations depending on the source. Commissions must be confirmed directly with the developer.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />

      {leadUnit && (
        <LeadModal unitRef={leadUnit} devName={devName} onClose={() => setLeadUnit(null)} />
      )}
    </div>
  );
}
