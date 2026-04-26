"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useTranslation } from "@/contexts/I18nContext";
import PasswordGate from "@/components/PasswordGate";
import {
  ArrowLeft, Building2, MapPin, Search, X,
  ChevronLeft, ChevronRight, FileText, CheckCircle,
  Waves, Car, TreePine, Dumbbell, ShieldCheck,
  Home, Plane, Flag, Utensils, ShoppingBag, Hospital,
  Train, Eye, Trees, Baby, GraduationCap, Clapperboard,
  TrendingUp, BarChart3, Key, Euro, Calendar, FileDown
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
  delivery_date?: string | null;
  start_date?: string | null;
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
  const { t } = useTranslation() as any;
  const avail    = isAvailable(unit);
  const reserved = ["réservé", "reserved", "reservado"].includes((unit.status || "").toLowerCase());
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold ${
      reserved ? "bg-orange-50 text-orange-700 border border-orange-200"
      : avail   ? "bg-green-50 text-green-700 border border-green-200"
                : "bg-slate-100 text-slate-500 border border-slate-200"
    }`}>
      {reserved
        ? (t("developmentDetail.statusReserved") || "Reserved")
        : avail
          ? (t("developmentDetail.statusAvailable") || "Available")
          : unit.status}
    </span>
  );
}

// ─── Lead modal ───────────────────────────────────────────────────────────────

function LeadModal({ unitRef, devName, onClose }: { unitRef: string; devName: string; onClose: () => void }) {
  const { t } = useTranslation() as any;
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
            <h3 className="text-lg font-bold mb-2">{t("developmentDetail.requestSentTitle") || "Request sent!"}</h3>
            <p className="text-slate-500 text-sm">{t("developmentDetail.requestSentBody") || "Our team will contact you within 24h."}</p>
            <button onClick={onClose} className="mt-6 px-6 py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-lg">
              {t("common.close") || "Close"}
            </button>
          </div>
        ) : (
          <>
            <h3 className="text-lg font-bold text-slate-900 mb-1">{devName}</h3>
            {unitRef !== "general" && (
              <p className="text-xs text-slate-400 mb-5">
                {t("developmentDetail.leadUnit", { unitRef }) || `Unit · ${unitRef}`}
              </p>
            )}
            <p className="text-sm text-slate-500 mb-6">
              {t("developmentDetail.leadDescription") || "Receive the complete dossier: floor plans, payment schedule and availability."}
            </p>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder={t("developmentDetail.fullName") || "Full name"}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#D4AF37]" />
              <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="Email"
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#D4AF37]" />
              <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder={t("developmentDetail.phone") || "Phone (optional)"}
                className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#D4AF37]" />
              <button type="submit" disabled={sending}
                className="w-full py-3 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2"
                style={{ backgroundColor: BRAND }}>
                {sending ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <FileText size={14} />}
                {t("developmentDetail.requestDossier") || "Request dossier"}
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
  const { t } = useTranslation() as any;
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

  const headers = [
    t("developmentDetail.colName")      || "Name",
    t("developmentDetail.colRef")       || "Ref.",
    t("developmentDetail.colStatus")    || "Status",
    t("developmentDetail.colTypology")  || "Typology",
    t("developmentDetail.colPrice")     || "Price",
    t("developmentDetail.colBedrooms")  || "Bedrooms",
    t("developmentDetail.colBathrooms") || "Bathrooms",
    t("developmentDetail.colSqm")       || "Sq. meters",
    t("developmentDetail.colPool")      || "Pool",
    t("developmentDetail.colActions")   || "Actions",
  ];

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder={t("developmentDetail.searchProps") || "Search..."}
            className="pl-8 pr-8 py-2 text-sm border border-slate-200 rounded-lg outline-none focus:border-[#D4AF37] w-52" />
          {search && <button onClick={() => { setSearch(""); setPage(1); }} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"><X size={12} /></button>}
        </div>
        <span className="text-xs text-slate-500">{filtered.length} {t("developmentDetail.statsProperties") || "properties"}</span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {headers.map(h => (
                <th key={h} className="px-3 py-2.5 text-left text-xs font-semibold text-slate-500 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.length === 0 ? (
              <tr><td colSpan={10} className="text-center py-10 text-slate-400 text-sm">
                {t("developmentDetail.noProperties") || "No properties found."}
              </td></tr>
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
                      <Link href={`/bien/${unit.id}`} className="text-xs hover:underline" style={{ color: BRAND }}>
                        {t("developmentDetail.view") || "View"}
                      </Link>
                      <button onClick={() => onRequest(unit.ref || unit.id)} className="text-xs text-slate-500 hover:text-slate-800 hover:underline">
                        {t("developmentDetail.dossier") || "Dossier"}
                      </button>
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
          <span>{t("developmentDetail.rowPerPage") || "Row per page"}</span>
          <span className="px-2 py-1 border border-slate-200 rounded font-medium">{PAGE_SIZE}</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={safePage === 1} className="p-1.5 rounded border border-slate-200 disabled:opacity-30"><ChevronLeft size={14} /></button>
          <span className="text-xs text-slate-600 font-medium">{safePage} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} className="p-1.5 rounded border border-slate-200 disabled:opacity-30"><ChevronRight size={14} /></button>
          <div className="flex items-center gap-1.5 text-xs text-slate-500 ml-2">
            <span>{t("developmentDetail.goTo") || "Go to"}</span>
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
  const { t } = useTranslation() as any;
  const hasCoords = unit.latitude && unit.longitude;
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div>
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
          {t("developmentDetail.locationITitle") || "Location I"}
        </h3>
        <dl>
          {[
            [t("developmentDetail.autonomousCommunity") || "Autonomous Community", unit.region || "—"],
            [t("developmentDetail.province")            || "Province",             unit.province || unit.region || "—"],
            [t("developmentDetail.city")                || "City",                 unit.town || "—"],
            [t("developmentDetail.coordinates")         || "Coordinates",          hasCoords ? `${unit.latitude}, ${unit.longitude}` : "—"],
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
            <MapPin size={12} /> {t("developmentDetail.openGoogleMaps") || "Open in Google Maps"}
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
            <p className="text-sm">{t("developmentDetail.noCoordinates") || "No coordinates available"}</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Location II tab ──────────────────────────────────────────────────────────

interface DistanceRow { icon: React.ReactNode; label: string; value: string | null }

function LocationIITab({ unit }: { unit: Unit }) {
  const { t } = useTranslation() as any;

  const rows: DistanceRow[] = [
    { icon: <Plane      size={14} />, label: t("developmentDetail.airport")      || "Airport",       value: fmtDist(null) },
    { icon: <Flag       size={14} />, label: t("developmentDetail.golfCourse")   || "Golf course",   value: fmtDist(unit.distance_golf) },
    { icon: <Waves      size={14} />, label: t("developmentDetail.nearSea")      || "Near the sea",  value: fmtDist(unit.distance_beach) },
    { icon: <Home       size={14} />, label: t("developmentDetail.townCenter")   || "Town center",   value: fmtDist(unit.distance_town) },
    { icon: <ShoppingBag size={14}/>, label: t("developmentDetail.mall")         || "Mall",          value: null },
    { icon: <Hospital   size={14} />, label: t("developmentDetail.hospital")     || "Hospital",      value: null },
    { icon: <Train      size={14} />, label: t("developmentDetail.trainStation") || "Train station", value: null },
    { icon: <Utensils   size={14} />, label: t("developmentDetail.restaurants")  || "Restaurants",   value: null },
    { icon: <Clapperboard size={14}/>,label: t("developmentDetail.cinema")       || "Cinema",        value: null },
    { icon: <GraduationCap size={14}/>,label:t("developmentDetail.university")   || "University",    value: null },
    { icon: <Trees      size={14} />, label: t("developmentDetail.naturalPark")  || "Natural park",  value: null },
    { icon: <Baby       size={14} />, label: t("developmentDetail.kindergarten") || "Kindergarten",  value: null },
  ];

  const available = rows.filter(r => r.value !== null);
  const hasAny    = available.length > 0;

  return (
    <div>
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
        {t("developmentDetail.locationIITitle") || "Location II — Distances & Features"}
      </h3>
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
          {t("developmentDetail.noDistanceData") || "No distance data available for this development."}
        </p>
      )}

      {/* Feature tags */}
      <div className="mt-6">
        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
          {t("developmentDetail.environment") || "Environment"}
        </h4>
        <div className="flex flex-wrap gap-2">
          {[
            unit.town   && { icon: <Eye   size={13} />, label: t("developmentDetail.cityViewsTag")        || "City views" },
            unit.region && { icon: <Trees size={13} />, label: t("developmentDetail.greenSurroundingsTag") || "Green surroundings" },
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

function FeaturesTab({ units }: { units: Unit[] }) {
  const { t } = useTranslation() as any;

  const ALL_FEATURES = [
    { key: "pool",      label: t("developmentDetail.swimmingPool") || "Swimming pool", icon: <Waves      size={15} /> },
    { key: "garden",    label: t("developmentDetail.gardenAreas")  || "Garden areas",  icon: <TreePine   size={15} /> },
    { key: "gym",       label: t("developmentDetail.gym")          || "Gym",           icon: <Dumbbell   size={15} /> },
    { key: "parking",   label: t("developmentDetail.parking")      || "Parking",       icon: <Car        size={15} /> },
    { key: "security",  label: "Safe urbanization",                                    icon: <ShieldCheck size={15}/> },
    { key: "elevator",  label: t("developmentDetail.elevator")     || "Elevator",      icon: <Building2  size={15} /> },
  ];

  const hasPool     = units.some(u => u.pool === "Oui" || u.pool === true || u.pool === "1");
  const types       = Array.from(new Set(units.map(u => u.type).filter(Boolean)));
  const hasApartment = types.some(ty => ty.toLowerCase().includes("apartment") || ty.toLowerCase().includes("piso"));

  const active = ALL_FEATURES.filter(f => {
    if (f.key === "pool") return hasPool;
    if (f.key === "elevator") return hasApartment;
    return false;
  });

  return (
    <div>
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
        {t("developmentDetail.devFeaturesTitle") || "Development Features"}
      </h3>
      {active.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-6">
          {active.map(f => (
            <div key={f.key} className="flex items-center gap-2.5 px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700">
              <span style={{ color: BRAND }}>{f.icon}</span> {f.label}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-400 mb-6">
          {t("developmentDetail.noFeaturesDetected") || "No specific amenities detected."}
        </p>
      )}

      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
        {t("developmentDetail.propTypesTitle") || "Property types in this development"}
      </h4>
      <div className="flex flex-wrap gap-2">
        {types.length > 0 ? types.map(ty => (
          <span key={ty} className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-700 capitalize">{ty}</span>
        )) : <p className="text-sm text-slate-400">{t("developmentDetail.noTypeData") || "No type data available."}</p>}
      </div>
    </div>
  );
}

// ─── Construction Progress bar ───────────────────────────────────────────────

function ConstructionProgress({ startDate, deliveryDate }: { startDate: string | null; deliveryDate: string | null }) {
  const { t } = useTranslation() as any;
  if (!startDate && !deliveryDate) return null;

  const now   = new Date();
  const start = startDate   ? new Date(startDate)   : null;
  const end   = deliveryDate ? new Date(deliveryDate) : null;

  let pct = 0;
  if (start && end && end > start) {
    pct = Math.min(100, Math.max(0, Math.round(((now.getTime() - start.getTime()) / (end.getTime() - start.getTime())) * 100)));
  } else if (end && now >= end) {
    pct = 100;
  }

  let badgeColor = "#10b981";
  let badgeText  = t("developmentDetail.progressOnTrack")   || "En cours";
  if (end) {
    if (now > end) {
      pct = 100; badgeColor = "#10b981"; badgeText = t("developmentDetail.progressDelivered") || "Livré";
    } else {
      const months = (end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30.5);
      if (months < 3)  { badgeColor = "#ef4444"; badgeText = t("developmentDetail.progressImminent") || "Livraison imminente"; }
      else if (months < 12) { badgeColor = "#f59e0b"; badgeText = t("developmentDetail.progressSoon")    || "Livraison proche"; }
    }
  }

  const fmtShort = (d: Date) => d.toLocaleDateString("fr-FR", { month: "short", year: "numeric" });
  const fmtMY    = (d: Date) => d.toLocaleDateString("fr-FR", { month: "2-digit", year: "numeric" });

  return (
    <div className="bg-white rounded-xl border border-slate-200 px-5 py-4 mb-6">
      <div className="flex items-center justify-between mb-3 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <Calendar size={14} style={{ color: BRAND }} />
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            {t("developmentDetail.constructionProgress") || "Avancement du chantier"}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 text-xs font-semibold rounded-full text-white" style={{ backgroundColor: badgeColor }}>
            {badgeText}
          </span>
          {end && (
            <span className="text-xs text-slate-500">
              {t("developmentDetail.deliveryExpected") || "Livraison prévue"} :{" "}
              <strong className="text-slate-700">{fmtMY(end)}</strong>
            </span>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: badgeColor }} />
        </div>
        <span className="text-sm font-bold text-slate-700 w-10 text-right">{pct}%</span>
      </div>
      {start && end && (
        <div className="flex justify-between mt-1.5">
          <span className="text-[10px] text-slate-400">{fmtShort(start)}</span>
          <span className="text-[10px] text-slate-400">{fmtShort(end)}</span>
        </div>
      )}
    </div>
  );
}

// ─── Phases tab ───────────────────────────────────────────────────────────────

function PhasesTab({ units }: { units: Unit[] }) {
  const { t } = useTranslation() as any;

  const phaseMap = new Map<string, Unit[]>();
  for (const unit of units) {
    const parts  = (unit.ref || "").split("-");
    const phase  = parts.length >= 3 && /^[A-Za-z]$/.test(parts[1]) ? parts[1].toUpperCase() : "MAIN";
    if (!phaseMap.has(phase)) phaseMap.set(phase, []);
    phaseMap.get(phase)!.push(unit);
  }

  const phases = Array.from(phaseMap.entries()).sort(([a], [b]) => a.localeCompare(b));
  const now    = new Date();

  const statusOf = (phaseUnits: Unit[]) => {
    const dates = phaseUnits.map(u => u.delivery_date).filter(Boolean) as string[];
    if (!dates.length) return "ongoing";
    const earliest = new Date(dates.sort()[0]);
    if (now > earliest) return "delivered";
    const months = (earliest.getTime() - now.getTime()) / (1000 * 60 * 60 * 24 * 30.5);
    return months < 12 ? "upcoming" : "ongoing";
  };

  const STATUS_COLOR: Record<string, string> = {
    delivered: "#10b981", upcoming: "#f59e0b", ongoing: BRAND,
  };
  const STATUS_LABEL = (s: string) => ({
    delivered: t("developmentDetail.phaseDelivered") || "Livré",
    upcoming:  t("developmentDetail.phaseUpcoming")  || "À venir",
    ongoing:   t("developmentDetail.phaseOngoing")   || "En cours",
  }[s] || s);

  return (
    <div className="space-y-4">
      <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
        {t("developmentDetail.phasesTitle") || "Phases du projet"}
      </h3>
      {phases.map(([phaseName, phaseUnits]) => {
        const prices    = phaseUnits.map(u => Number(u.price)).filter(p => p > 0);
        const minP      = prices.length ? Math.min(...prices) : null;
        const maxP      = prices.length ? Math.max(...prices) : null;
        const available = phaseUnits.filter(isAvailable).length;
        const status    = statusOf(phaseUnits);
        const dates     = phaseUnits.map(u => u.delivery_date).filter(Boolean) as string[];
        const delivDate = dates.length ? new Date(dates.sort()[0]) : null;
        const label     = phaseName === "MAIN"
          ? (t("developmentDetail.phaseMain") || "Programme principal")
          : `${t("developmentDetail.phase") || "Phase"} ${phaseName}`;

        return (
          <div key={phaseName} className="bg-white border border-slate-200 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                  style={{ backgroundColor: BRAND }}>
                  {phaseName === "MAIN" ? "1" : phaseName}
                </div>
                <h4 className="font-semibold text-slate-800">{label}</h4>
              </div>
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full text-white" style={{ backgroundColor: STATUS_COLOR[status] }}>
                {STATUS_LABEL(status)}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">
                  {t("developmentDetail.phaseAvailable") || "Disponibles"}
                </p>
                <p className="font-semibold text-slate-800">
                  {available} <span className="text-slate-400 font-normal">/ {phaseUnits.length}</span>
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">
                  {t("developmentDetail.phasePriceRange") || "Fourchette"}
                </p>
                <p className="font-semibold text-slate-800">
                  {minP ? `${minP.toLocaleString("fr-FR")} €` : "—"}
                  {maxP && maxP !== minP ? <span className="text-slate-400 font-normal"> – {maxP.toLocaleString("fr-FR")} €</span> : ""}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-0.5">
                  {t("developmentDetail.deliveryExpected") || "Livraison"}
                </p>
                <p className="font-semibold text-slate-800">
                  {delivDate ? delivDate.toLocaleDateString("fr-FR", { month: "2-digit", year: "numeric" }) : "—"}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Payment Method tab ───────────────────────────────────────────────────────

function PaymentMethodTab({ units, startDate, deliveryDate }: { units: Unit[]; startDate: string | null; deliveryDate: string | null }) {
  const { t } = useTranslation() as any;

  const SPAIN_PLAN = [
    { step: 1, label: t("developmentDetail.reservation")    || "Reservation",    icon: <Key        size={16} />, pct: 10, color: BRAND,     desc: t("developmentDetail.signingReservation")  || "Signing the reservation contract" },
    { step: 2, label: t("developmentDetail.startOfWorks")   || "Start of works",  icon: <TrendingUp size={16} />, pct: 20, color: "#10b981", desc: t("developmentDetail.effectiveLaunch")     || "Effective launch of construction" },
    { step: 3, label: t("developmentDetail.keyHandover")    || "Key handover",    icon: <Home       size={16} />, pct: 70, color: "#3b82f6", desc: t("developmentDetail.deliveryNotarial")    || "Delivery & notarial deed" },
  ];

  const exampleUnit = units.find(u => Number(u.price) > 0);
  const price       = exampleUnit ? Number(exampleUnit.price) : 0;

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
          {t("developmentDetail.spainVefaTitle") || "Spain VEFA Payment Plan"}
        </h3>
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
            {t("developmentDetail.exampleLabel", { name: exampleUnit?.titre || unitName(exampleUnit!) }) || `Example — ${exampleUnit?.titre || unitName(exampleUnit!)}`}
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
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{t("developments.total") || "Total"}</span>
              <span className="font-bold text-slate-900 text-base">{fmtPrice(price)}</span>
            </div>
          </div>
        </div>
      )}

      {/* ── Payment Timeline ── */}
      {(startDate || deliveryDate) && (() => {
        const start = startDate   ? new Date(startDate)   : null;
        const end   = deliveryDate ? new Date(deliveryDate) : null;
        const fmtMY = (d: Date | null) => d ? d.toLocaleDateString("fr-FR", { month: "short", year: "numeric" }) : t("developmentDetail.dateTBD") || "À définir";

        const timelineSteps = [
          { label: t("developmentDetail.reservation") || "Réservation",     color: BRAND,      date: start, pct: 10 },
          { label: t("developmentDetail.startOfWorks") || "Début des travaux", color: "#10b981", date: start, pct: 20 },
          { label: t("developmentDetail.keyHandover") || "Remise des clés",  color: "#3b82f6",  date: end,   pct: 70 },
        ];

        return (
          <>
            <div>
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
                {t("developmentDetail.paymentTimelineTitle") || "Timeline des paiements"}
              </h4>
              {/* Horizontal timeline */}
              <div className="relative flex items-start justify-between px-4">
                <div className="absolute top-3 left-4 right-4 h-0.5 bg-slate-200" />
                {timelineSteps.map((step, i) => (
                  <div key={i} className="relative flex flex-col items-center gap-2 w-1/3">
                    <div className="w-6 h-6 rounded-full border-2 border-white shadow flex items-center justify-center z-10"
                      style={{ backgroundColor: step.color }}>
                      <span className="text-white text-[8px] font-bold">{step.pct}%</span>
                    </div>
                    <p className="text-xs font-semibold text-slate-700 text-center leading-tight">{step.label}</p>
                    <p className="text-[10px] text-slate-400 text-center">{fmtMY(step.date)}</p>
                  </div>
                ))}
              </div>
            </div>

            {price > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                  {t("developmentDetail.paymentCashflowTitle") || "Vue cashflow estimée"}
                </h4>
                <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                  {/* header */}
                  <div className="grid grid-cols-4 bg-slate-50 border-b border-slate-200 px-4 py-2">
                    {[
                      t("developmentDetail.paymentDate")       || "Date estimée",
                      t("developmentDetail.colName")           || "Étape",
                      t("developmentDetail.paymentAmount")     || "Montant",
                      t("developmentDetail.paymentCumulative") || "Cumul",
                    ].map(h => (
                      <span key={h} className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{h}</span>
                    ))}
                  </div>
                  {timelineSteps.map((step, i) => {
                    const amount  = Math.round(price * step.pct / 100);
                    const cumPct  = timelineSteps.slice(0, i + 1).reduce((s, ss) => s + ss.pct, 0);
                    const cumAmt  = Math.round(price * cumPct / 100);
                    return (
                      <div key={i} className={`grid grid-cols-4 px-4 py-3 text-sm ${i < timelineSteps.length - 1 ? "border-b border-slate-100" : ""}`}>
                        <span className="text-slate-500 text-xs">{fmtMY(step.date)}</span>
                        <span className="flex items-center gap-1.5 text-slate-700">
                          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: step.color }} />
                          {step.label}
                        </span>
                        <span className="font-semibold text-slate-800">{fmtPrice(amount)}</span>
                        <span className="text-slate-500">{fmtPrice(cumAmt)} <span className="text-[10px]">({cumPct}%)</span></span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        );
      })()}
    </div>
  );
}

// ─── Metrics tab ──────────────────────────────────────────────────────────────

function MetricsTab({ units }: { units: Unit[] }) {
  const { t } = useTranslation() as any;
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
    { label: t("developmentDetail.averagePrice")  || "Average price",   value: avgPrice   ? fmtPrice(avgPrice)      : "—", icon: <Euro    size={16} /> },
    { label: t("developmentDetail.averagePerM2")  || "Average €/m²",    value: avgPriceM2 ? `${avgPriceM2.toLocaleString("fr-FR")} €/m²` : "—", icon: <BarChart3 size={16} /> },
    { label: t("developmentDetail.stockAvailable")|| "Stock available",  value: `${available} / ${units.length}`,    icon: <Home    size={16} /> },
    { label: t("developmentDetail.cumulSold")     || "Cumul. % sold",    value: `${pctSold}%`,                       icon: <TrendingUp size={16} /> },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
          {t("developmentDetail.metricsTitle") || "Development Metrics"}
        </h3>
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
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            {t("developmentDetail.priceRangeTitle") || "Price range"}
          </h4>
          <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
            {[
              [t("developmentDetail.minimumPrice") || "Minimum price", minPrice ? fmtPrice(minPrice) : "—"],
              [t("developmentDetail.maximumPrice") || "Maximum price", maxPrice ? fmtPrice(maxPrice) : "—"],
              [t("developmentDetail.averagePrice") || "Average price", avgPrice ? fmtPrice(avgPrice) : "—"],
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
        {t("developmentDetail.metricsDisclaimer") || "The information provided is subject to changes. Commissions must be confirmed directly with the developer."}
      </p>
    </div>
  );
}

// ─── Sales Information tab ────────────────────────────────────────────────────

function SalesTab({ unit }: { unit: Unit }) {
  const { t } = useTranslation() as any;
  const commission = unit.commission_percentage;
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">
          {t("developmentDetail.salesTitle") || "Sales Information"}
        </h3>
        <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
          {[
            [t("developmentDetail.commissionType")   || "Commission type",     t("developmentDetail.fixedPercentage") || "Fixed percentage"],
            [t("developmentDetail.commission")        || "Commission",          commission ? `${commission}%` : (t("developmentDetail.toConfirmDeveloper") || "To confirm with developer")],
            [t("developmentDetail.referralCommission")|| "Referral commission", t("developmentDetail.toConfirm") || "To confirm"],
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
          {t("developmentDetail.salesDisclaimer") || "The information provided regarding prices, commissions and specifications is subject to changes depending on the source. It has no contractual value. Commissions must be confirmed directly with the developer."}
        </p>
      </div>
    </div>
  );
}

// ─── PDF Modal ───────────────────────────────────────────────────────────────

function PdfModal({ units, devName, startDate, deliveryDate, onClose }: {
  units: Unit[];
  devName: string;
  startDate: string | null;
  deliveryDate: string | null;
  onClose: () => void;
}) {
  const { t } = useTranslation() as any;
  const [selectedId, setSelectedId] = useState(units[0]?.id || "");
  const [form, setForm]     = useState({ name: "", email: "", phone: "" });
  const [generating, setGenerating] = useState(false);
  const [done, setDone]     = useState(false);

  const selectedUnit = units.find(u => u.id === selectedId) || units[0];

  async function handleGenerate(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedUnit) return;
    setGenerating(true);
    try {
      await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, unitRef: selectedUnit.ref || selectedUnit.id,
          subject: `PDF Dossier – ${devName} – ${selectedUnit.ref}` }),
      });

      const { default: jsPDF } = await import("jspdf");
      const { default: autoTable } = await import("jspdf-autotable");
      const doc = new jsPDF();
      const price = Number(selectedUnit.price) || 0;

      const gold: [number, number, number]      = [212, 175, 55];
      const darkC: [number, number, number]     = [30, 30, 30];
      const grayC: [number, number, number]     = [110, 110, 110];
      const lightG: [number, number, number]    = [245, 245, 245];

      // Header band
      doc.setFillColor(...gold);
      doc.rect(0, 0, 210, 28, "F");
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.text("DATAhome", 14, 12);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(devName, 14, 21);
      doc.setFontSize(9);
      doc.text(`Réf: ${selectedUnit.ref || selectedUnit.id}`, 196, 12, { align: "right" });

      let y = 38;
      const sectionTitle = (txt: string) => {
        doc.setFontSize(11); doc.setFont("helvetica", "bold"); doc.setTextColor(...darkC);
        doc.text(txt, 14, y); y += 2;
        doc.setDrawColor(...gold); doc.setLineWidth(0.5); doc.line(14, y, 196, y); y += 7;
      };

      // Unit details
      sectionTitle("DÉTAILS DE L'UNITÉ");
      const surf = parseFloat(String(selectedUnit.surface_built || "0")) || 0;
      const detailRows = [
        ["Référence",        selectedUnit.ref || selectedUnit.id],
        ["Type",             selectedUnit.type || "—"],
        ["Prix",             price > 0 ? fmtPrice(price) : "—"],
        ["Surface",          surf > 0 ? `${surf} m²` : "—"],
        ["Chambres",         String(selectedUnit.beds ?? "—")],
        ["Salles de bains",  String(selectedUnit.baths ?? "—")],
        ["Ville",            selectedUnit.town || "—"],
      ];
      doc.setFontSize(9);
      for (const [label, value] of detailRows) {
        doc.setFont("helvetica", "bold"); doc.setTextColor(...grayC); doc.text(label, 16, y);
        doc.setFont("helvetica", "normal"); doc.setTextColor(...darkC); doc.text(String(value), 90, y);
        y += 7;
      }
      y += 4;

      // Payment plan table
      sectionTitle("PLAN DE PAIEMENT VEFA");
      if (price > 0) {
        const planBody = [
          ["Réservation",       "10%", fmtPrice(Math.round(price * 0.10))],
          ["Début des travaux", "20%", fmtPrice(Math.round(price * 0.20))],
          ["Remise des clés",   "70%", fmtPrice(Math.round(price * 0.70))],
        ];
        autoTable(doc, {
          startY: y,
          head: [["Étape", "%", "Montant"]],
          body: planBody,
          foot: [["Total", "100%", fmtPrice(price)]],
          theme: "plain",
          styles: { fontSize: 9, cellPadding: 3 },
          headStyles: { fillColor: gold, textColor: [255, 255, 255], fontStyle: "bold" },
          footStyles: { fillColor: lightG, fontStyle: "bold" },
          columnStyles: { 2: { halign: "right" } },
        });
        y = (doc as any).lastAutoTable.finalY + 8;
      }

      // Timeline
      if (startDate || deliveryDate) {
        sectionTitle("TIMELINE DES PAIEMENTS");
        const fmtD = (d: string | null) =>
          d ? new Date(d).toLocaleDateString("fr-FR", { month: "short", year: "numeric" }) : "À définir";
        const tlBody = [
          ["Réservation",       fmtD(startDate),    price > 0 ? fmtPrice(Math.round(price * 0.10)) : "—"],
          ["Début des travaux", fmtD(startDate),    price > 0 ? fmtPrice(Math.round(price * 0.20)) : "—"],
          ["Remise des clés",   fmtD(deliveryDate), price > 0 ? fmtPrice(Math.round(price * 0.70)) : "—"],
        ];
        autoTable(doc, {
          startY: y,
          head: [["Étape", "Date estimée", "Montant"]],
          body: tlBody,
          theme: "plain",
          styles: { fontSize: 9, cellPadding: 3 },
          headStyles: { fillColor: gold, textColor: [255, 255, 255], fontStyle: "bold" },
          columnStyles: { 2: { halign: "right" } },
        });
        y = (doc as any).lastAutoTable.finalY + 8;
      }

      // Footer
      const pageH = doc.internal.pageSize.getHeight();
      doc.setFillColor(...lightG);
      doc.rect(0, pageH - 18, 210, 18, "F");
      doc.setFontSize(7); doc.setFont("helvetica", "italic"); doc.setTextColor(...grayC);
      const disc = "Les informations fournies sont indicatives et ne constituent pas un engagement contractuel. Commissions à confirmer directement avec le promoteur.";
      doc.text(disc, 14, pageH - 10, { maxWidth: 140 });
      doc.setFont("helvetica", "bold");
      doc.text("DATAhome · datahome.fr", 196, pageH - 6, { align: "right" });

      const fname = `dossier-${String(devName).replace(/\s+/g, "-")}-${(selectedUnit.ref || selectedUnit.id).slice(-6)}.pdf`.toLowerCase();
      doc.save(fname);
      setDone(true);
    } catch (err) {
      console.error("PDF error:", err);
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative overflow-y-auto max-h-[90vh]">
        <button onClick={onClose} className="absolute top-5 right-5 text-slate-400 hover:text-slate-700"><X size={18} /></button>
        {done ? (
          <div className="text-center py-6">
            <CheckCircle size={44} className="mx-auto mb-4 text-green-500" />
            <h3 className="text-lg font-bold mb-2">{t("developmentDetail.pdfGenerated") || "PDF généré !"}</h3>
            <p className="text-slate-500 text-sm mb-6">{t("developmentDetail.pdfSaved") || "Votre dossier a été téléchargé."}</p>
            <button onClick={onClose} className="px-6 py-2.5 bg-slate-900 text-white text-xs font-semibold rounded-lg">
              {t("common.close") || "Fermer"}
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${BRAND}20` }}>
                <FileDown size={18} style={{ color: BRAND }} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">{t("developmentDetail.generatePdf") || "Générer mon dossier PDF"}</h3>
                <p className="text-xs text-slate-400">{devName}</p>
              </div>
            </div>
            <form onSubmit={handleGenerate} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  {t("developmentDetail.selectUnit") || "Sélectionner une unité"}
                </label>
                <select value={selectedId} onChange={e => setSelectedId(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#D4AF37] bg-white">
                  {units.map(u => (
                    <option key={u.id} value={u.id}>
                      {unitName(u)} — {u.type || "—"} — {u.price ? fmtPrice(Number(u.price)) : "—"}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                  {t("developmentDetail.yourDetails") || "Vos coordonnées"}
                </label>
                <div className="space-y-2.5">
                  <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    placeholder={t("developmentDetail.fullName") || "Nom complet"}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#D4AF37]" />
                  <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="Email"
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#D4AF37]" />
                  <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                    placeholder={t("developmentDetail.phone") || "Téléphone (facultatif)"}
                    className="w-full border border-slate-200 rounded-lg px-4 py-2.5 text-sm outline-none focus:border-[#D4AF37]" />
                </div>
              </div>
              <button type="submit" disabled={generating}
                className="w-full py-3 text-white text-sm font-semibold rounded-lg flex items-center justify-center gap-2 transition-opacity hover:opacity-90"
                style={{ backgroundColor: BRAND }}>
                {generating
                  ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  : <FileDown size={14} />}
                {generating
                  ? (t("developmentDetail.pdfGenerating") || "Génération en cours...")
                  : (t("developmentDetail.generatePdf")   || "Générer le PDF")}
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

type Tab = "properties" | "location" | "location2" | "features" | "phases" | "payment" | "metrics" | "sales";

export default function DevelopmentPage() {
  const { t } = useTranslation() as any;
  const { devId }    = useParams();
  const router       = useRouter();
  const [units, setUnits]           = useState<Unit[]>([]);
  const [loading, setLoading]       = useState(true);
  const [activeTab, setActiveTab]   = useState<Tab>("properties");
  const [leadUnit, setLeadUnit]     = useState<string | null>(null);
  const [galleryIdx, setGalleryIdx] = useState(0);
  const [showPdfModal, setShowPdfModal] = useState(false);

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
  const startDate    = units.find(u => u.start_date)?.start_date    || null;
  const deliveryDate = units.find(u => u.delivery_date)?.delivery_date || null;
  const availableCount = units.filter(isAvailable).length;
  const prices         = units.map(u => Number(u.price || 0)).filter(Boolean);
  const minPrice       = prices.length ? Math.min(...prices) : 0;
  const maxPrice       = prices.length ? Math.max(...prices) : 0;

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
    { key: "properties", label: t("developmentDetail.tabProperties")  || "Properties",       count: units.length },
    { key: "location",   label: t("developmentDetail.tabLocation1")   || "Location I" },
    { key: "location2",  label: t("developmentDetail.tabLocation2")   || "Location II" },
    { key: "features",   label: t("developmentDetail.tabFeatures")    || "Features" },
    { key: "phases",     label: t("developmentDetail.tabPhases")      || "Phases" },
    { key: "payment",    label: t("developmentDetail.tabPayment")     || "Payment Method" },
    { key: "metrics",    label: t("developmentDetail.tabMetrics")     || "Metrics" },
    { key: "sales",      label: t("developmentDetail.tabSales")       || "Sales Information" },
  ];

  if (loading) return (
    <PasswordGate>
    <div className="min-h-screen bg-slate-50"><Navbar />
      <div className="h-[60vh] flex flex-col items-center justify-center mt-32">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-[#D4AF37] rounded-full animate-spin mb-3" />
        <p className="text-sm text-slate-400">{t("developmentDetail.loading") || "Loading development..."}</p>
      </div>
    </div>
    </PasswordGate>
  );

  if (!units.length) return (
    <PasswordGate>
    <div className="min-h-screen bg-slate-50"><Navbar />
      <div className="h-[60vh] flex flex-col items-center justify-center text-center px-6 mt-32">
        <Building2 size={36} className="mb-4 text-slate-300" />
        <h1 className="text-xl font-bold text-slate-700 mb-2">{t("developmentDetail.notFound") || "Development not found"}</h1>
        <p className="text-sm text-slate-400 mb-6">
          {t("developmentDetail.noUnitsFound", { id: String(devId) }) || `No units found for ID: ${devId}`}
        </p>
        <Link href="/developpements" className="text-sm flex items-center gap-1 hover:underline" style={{ color: BRAND }}>
          <ArrowLeft size={14} /> {t("nav.back") || "Back"}
        </Link>
      </div>
    </div>
    </PasswordGate>
  );

  return (
    <PasswordGate>
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-36 pb-16">

        {/* Back button */}
        <div className="mb-4">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-sm"
          >
            <ArrowLeft size={14} /> {t("nav.back") || "Back"}
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
              <div className="flex items-center gap-2 shrink-0">
                <button onClick={() => setLeadUnit("general")}
                  className="flex items-center gap-2 px-4 py-2.5 text-white text-sm font-semibold rounded-lg transition-opacity hover:opacity-90 shadow-lg"
                  style={{ backgroundColor: BRAND }}>
                  <FileText size={14} /> {t("developmentDetail.requestDossier") || "Request dossier"}
                </button>
                <button onClick={() => setShowPdfModal(true)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white/20 backdrop-blur-sm text-white text-sm font-semibold rounded-lg transition-opacity hover:bg-white/30 shadow-lg border border-white/30">
                  <FileDown size={14} /> {t("developmentDetail.generatePdf") || "Générer PDF"}
                </button>
              </div>
            </div>
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
                <div className="absolute top-3 right-3 bg-black/40 text-white text-xs px-2 py-1 rounded-full">
                  {galleryIdx + 1} / {allImages.length}
                </div>
              </>
            )}
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
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => setLeadUnit("general")}
                className="flex items-center gap-2 px-4 py-2.5 text-white text-sm font-semibold rounded-lg transition-opacity hover:opacity-90"
                style={{ backgroundColor: BRAND }}>
                <FileText size={14} /> {t("developmentDetail.requestDossier") || "Request dossier"}
              </button>
              <button onClick={() => setShowPdfModal(true)}
                className="flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg border transition-opacity hover:opacity-80"
                style={{ borderColor: BRAND, color: BRAND }}>
                <FileDown size={14} /> {t("developmentDetail.generatePdf") || "Générer PDF"}
              </button>
            </div>
          </div>
        )}

        {/* Stats bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-slate-200 px-4 py-3">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              {t("developmentDetail.statsProperties") || "Properties"}
            </p>
            <p className="text-base font-bold text-slate-900">{availableCount} <span className="text-slate-400 font-normal">/ {units.length}</span></p>
            <p className="text-[10px] text-slate-400">{t("developmentDetail.statsAvailableTotal") || "Available / Total"}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 px-4 py-3">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              {t("developmentDetail.statsPriceEur") || "Price (€)"}
            </p>
            <p className="text-base font-bold text-slate-900">
              {minPrice ? minPrice.toLocaleString("fr-FR") : "—"}
              {maxPrice && maxPrice !== minPrice ? <span className="text-slate-400 font-normal text-sm">–{maxPrice.toLocaleString("fr-FR")}</span> : ""}
            </p>
            <p className="text-[10px] text-slate-400">{t("developmentDetail.statsFromTo") || "From – To"}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 px-4 py-3">
            <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
              {t("developmentDetail.statsDevCompany") || "Development Company"}
            </p>
            <p className="text-sm font-bold text-slate-900 truncate">{company || "—"}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-center justify-between">
            <div>
              <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                {t("developmentDetail.statsContact") || "Contact"}
              </p>
              <p className="text-sm font-bold text-slate-900">{t("developmentDetail.statsSalesTeam") || "Sales team"}</p>
            </div>
            <button onClick={() => setLeadUnit("general")} className="p-2 rounded-lg hover:opacity-80" style={{ backgroundColor: `${BRAND}20`, color: BRAND }}>
              <Home size={16} />
            </button>
          </div>
        </div>

        {/* Construction progress */}
        <ConstructionProgress startDate={startDate} deliveryDate={deliveryDate} />

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
            {activeTab === "phases"     && <PhasesTab units={units} />}
            {activeTab === "payment"    && <PaymentMethodTab units={units} startDate={startDate} deliveryDate={deliveryDate} />}
            {activeTab === "metrics"    && <MetricsTab units={units} />}
            {activeTab === "sales"      && <SalesTab unit={dev} />}
          </div>
        </div>
      </div>

      <Footer />
      {leadUnit && <LeadModal unitRef={leadUnit} devName={devName} onClose={() => setLeadUnit(null)} />}
      {showPdfModal && <PdfModal units={units} devName={devName} startDate={startDate} deliveryDate={deliveryDate} onClose={() => setShowPdfModal(false)} />}
    </div>
    </PasswordGate>
  );
}
