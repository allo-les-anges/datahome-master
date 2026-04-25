"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Search, X, ChevronLeft, ChevronRight,
  MapPin, LayoutGrid, Map as MapIcon
} from "lucide-react";
import type { DevelopmentSummary, UnitOption } from "@/app/api/developments/route";
import type L from "leaflet";

// ─── Lazy-load Leaflet (SSR: false) ──────────────────────────────────────────

const DevelopmentMap = dynamic(
  () => import("@/components/DevelopmentMap"),
  { ssr: false, loading: () => <div className="w-full h-full bg-slate-100 animate-pulse rounded-xl" /> }
);

// ─── Constants ───────────────────────────────────────────────────────────────

const BRAND     = "#D4AF37";
const PAGE_SIZE = 15;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtPrice(n: number) {
  return n.toLocaleString("fr-FR") + " €";
}

// ─── DevCard (compact) ───────────────────────────────────────────────────────

function DevCard({ dev }: { dev: DevelopmentSummary }) {
  const [imgIdx, setImgIdx]   = useState(0);
  const [expanded, setExpanded] = useState(false);
  const images      = dev.images?.length ? dev.images : [];
  const currentImg  = images[imgIdx] ?? "/placeholder-villa.jpg";
  const visible     = expanded ? dev.options : dev.options.slice(0, 2);
  const hiddenCount = dev.options.length - 2;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Image */}
      <div className="relative h-44 bg-gray-100 overflow-hidden">
        <img src={currentImg} alt={dev.name || dev.devId} className="w-full h-full object-cover" loading="lazy" />
        <span className={`absolute top-2.5 left-2.5 text-white text-xs font-medium px-3 py-1 rounded-full shadow-sm ${dev.unitCount === 1 ? "bg-amber-500" : "bg-green-500"}`}>
          {dev.unitCount === 1 ? "Last available" : `${dev.unitCount} available`}
        </span>
        <Link href={`/developpement/${dev.devId}`}
          className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center text-white shadow-sm"
          style={{ backgroundColor: BRAND }}>
          <MapPin size={12} />
        </Link>
        {images.length > 1 && (
          <>
            <button onClick={e => { e.preventDefault(); setImgIdx(i => (i - 1 + images.length) % images.length); }}
              className="absolute left-2 bottom-2 w-6 h-6 rounded-full bg-black/40 text-white flex items-center justify-center">
              <ChevronLeft size={11} />
            </button>
            <button onClick={e => { e.preventDefault(); setImgIdx(i => (i + 1) % images.length); }}
              className="absolute left-10 bottom-2 w-6 h-6 rounded-full bg-black/40 text-white flex items-center justify-center">
              <ChevronRight size={11} />
            </button>
          </>
        )}
      </div>

      {/* Body */}
      <div className="p-4">
        <Link href={`/developpement/${dev.devId}`}>
          <h3 className="text-sm font-semibold text-gray-900 hover:text-[#b8962e] transition-colors line-clamp-1 mb-0.5">
            {dev.name || `Programme ${dev.devId}`}
          </h3>
        </Link>
        {dev.town && <p className="text-xs text-gray-400 mb-3">{dev.town}{dev.region && dev.region !== dev.town ? ` · ${dev.region}` : ""}</p>}

        {dev.options.length > 0 ? (
          <div className="border-t border-gray-100 pt-2.5 space-y-2">
            {visible.map((opt: UnitOption, i: number) => (
              <div key={i} className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-gray-900">From {fmtPrice(opt.minPrice)}</p>
                  <p className="text-[10px] text-gray-400">
                    {opt.beds > 0 && `${opt.beds}bd`}
                    {opt.beds > 0 && opt.baths > 0 && " · "}
                    {opt.baths > 0 && `${opt.baths}ba`}
                    {opt.surface > 0 && ` · ${opt.surface}m²`}
                  </p>
                </div>
                <span className="text-[10px] text-gray-400 ml-2">(x{opt.count})</span>
              </div>
            ))}
            {hiddenCount > 0 && (
              <button onClick={() => setExpanded(v => !v)} className="text-[10px] font-medium" style={{ color: BRAND }}>
                {expanded ? "Show less ↑" : `+${hiddenCount} more options`}
              </button>
            )}
          </div>
        ) : dev.minPrice > 0 ? (
          <p className="text-xs font-semibold text-gray-900 border-t border-gray-100 pt-2.5">From {fmtPrice(dev.minPrice)}</p>
        ) : null}
      </div>

      <div className="border-t border-gray-100 px-4 py-2.5 flex justify-between items-center">
        <span className="text-[10px] text-gray-400">Delivery: To consult</span>
        <div className="flex gap-1">
          {[ChevronLeft, ChevronRight].map((Icon, i) => (
            <button key={i}
              onClick={() => setImgIdx(idx => images.length <= 1 ? idx : (idx + (i === 0 ? -1 : 1) + images.length) % images.length)}
              disabled={images.length <= 1}
              className="w-5 h-5 rounded-full border border-gray-200 text-gray-400 flex items-center justify-center disabled:opacity-30">
              <Icon size={10} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

function Pagination({ page, total, onChange }: { page: number; total: number; onChange: (p: number) => void }) {
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (totalPages <= 1) return null;

  const pages: (number | "…")[] = [];
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) pages.push(p);
    else if (pages[pages.length - 1] !== "…") pages.push("…");
  }

  return (
    <div className="flex items-center justify-center gap-1.5 mt-8 flex-wrap">
      <button onClick={() => onChange(page - 1)} disabled={page === 1}
        className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 disabled:opacity-30">
        <ChevronLeft size={14} />
      </button>
      {pages.map((p, i) =>
        p === "…"
          ? <span key={`e${i}`} className="w-8 h-8 flex items-center justify-center text-gray-400 text-sm">…</span>
          : <button key={p} onClick={() => onChange(p)}
              className="w-8 h-8 rounded-lg border text-sm font-medium transition-colors"
              style={p === page ? { backgroundColor: BRAND, borderColor: BRAND, color: "#fff" } : { borderColor: "#e5e7eb", color: "#374151" }}>
              {p}
            </button>
      )}
      <button onClick={() => onChange(page + 1)} disabled={page === totalPages}
        className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 disabled:opacity-30">
        <ChevronRight size={14} />
      </button>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type View = "split" | "cards";

export default function DataHomePage() {
  const [developments, setDevelopments] = useState<DevelopmentSummary[]>([]);
  const [loading,      setLoading]      = useState(true);
  const [search,       setSearch]       = useState("");
  const [hideSingle,   setHideSingle]   = useState(false);
  const [page,         setPage]         = useState(1);
  const [view,         setView]         = useState<View>("split");
  const [areaBounds,   setAreaBounds]   = useState<L.LatLngBounds | null>(null);

  useEffect(() => {
    fetch("/api/developments")
      .then(r => r.json())
      .then(d => setDevelopments(d.developments || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Reset page on any filter change
  useEffect(() => { setPage(1); }, [search, hideSingle, areaBounds]);

  const filtered = useMemo(() => {
    let list = [...developments];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(d =>
        (d.name || "").toLowerCase().includes(q) ||
        d.town?.toLowerCase().includes(q) ||
        d.region?.toLowerCase().includes(q)
      );
    }

    if (hideSingle) list = list.filter(d => d.unitCount > 1);

    if (areaBounds) {
      list = list.filter(d =>
        d.lat !== null && d.lng !== null &&
        areaBounds.contains([d.lat!, d.lng!])
      );
    }

    return list;
  }, [developments, search, hideSingle, areaBounds]);

  const paginated = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page]
  );

  const totalUnits = useMemo(() => filtered.reduce((s, d) => s + d.unitCount, 0), [filtered]);

  const handleAreaSelect = useCallback((bounds: L.LatLngBounds | null) => {
    setAreaBounds(bounds);
  }, []);

  function goToPage(p: number) {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 pt-24 pb-20">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Development Map</h1>
            {!loading && (
              <p className="text-sm text-slate-400 mt-1">
                <span className="font-semibold text-slate-700">{totalUnits.toLocaleString("fr-FR")}</span> units available
                {" · "}{filtered.length} development{filtered.length !== 1 ? "s" : ""}
                {areaBounds && <span className="ml-2 text-amber-600 font-medium">· filtered by area</span>}
              </p>
            )}
          </div>

          {/* View toggle */}
          <div className="flex items-center gap-2">
            <Link
              href="/developpements"
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[#D4AF37] text-[#D4AF37] text-xs font-semibold hover:bg-[#D4AF37] hover:text-white transition-colors"
            >
              <LayoutGrid size={13} /> List view
            </Link>
          <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
            <button
              onClick={() => setView("split")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${view === "split" ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-800"}`}
            >
              <MapIcon size={13} /> Map
            </button>
            <button
              onClick={() => setView("cards")}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${view === "cards" ? "bg-slate-900 text-white" : "text-slate-500 hover:text-slate-800"}`}
            >
              <LayoutGrid size={13} /> Cards
            </button>
          </div>
          </div>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5">
          <div className="relative flex-1 max-w-sm">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search developments, city…"
              className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none placeholder:text-slate-400 focus:border-[#D4AF37] transition-colors"
            />
            {search && (
              <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                <X size={12} />
              </button>
            )}
          </div>

          <label className="flex items-center gap-2 cursor-pointer select-none">
            <div onClick={() => setHideSingle(v => !v)}
              className="relative w-9 h-5 rounded-full transition-colors duration-200"
              style={{ backgroundColor: hideSingle ? BRAND : "#e2e8f0" }}>
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${hideSingle ? "translate-x-4" : ""}`} />
            </div>
            <span className="text-sm text-slate-600">Hide last available?</span>
          </label>

          {areaBounds && (
            <button
              onClick={() => setAreaBounds(null)}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-100 transition-colors"
            >
              <X size={11} /> Clear area filter
            </button>
          )}
        </div>

        {/* Main content */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 animate-pulse">
                <div className="h-44 bg-gray-100 rounded-t-2xl" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-2/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                  <div className="h-8 bg-gray-100 rounded mt-3" />
                </div>
              </div>
            ))}
          </div>
        ) : view === "split" ? (
          /* ── Split view: map + cards side by side ── */
          <div className="flex gap-5" style={{ minHeight: "70vh" }}>
            {/* Map */}
            <div className="flex-1 min-w-0 sticky top-24" style={{ height: "calc(100vh - 220px)" }}>
              <DevelopmentMap
                developments={filtered}
                hideSold={hideSingle}
                onHideSoldChange={setHideSingle}
                onAreaSelect={handleAreaSelect}
              />
            </div>

            {/* Card list */}
            <div className="w-80 xl:w-96 shrink-0 overflow-y-auto" style={{ maxHeight: "calc(100vh - 220px)" }}>
              {filtered.length === 0 ? (
                <div className="text-center py-16 text-slate-400">
                  <p className="text-sm">No developments match your criteria.</p>
                  {(search || areaBounds) && (
                    <button onClick={() => { setSearch(""); setAreaBounds(null); }} className="mt-3 text-xs hover:underline" style={{ color: BRAND }}>
                      Clear filters
                    </button>
                  )}
                </div>
              ) : (
                <>
                  <div className="space-y-3 pr-1">
                    {paginated.map(dev => <DevCard key={dev.devId} dev={dev} />)}
                  </div>
                  <Pagination page={page} total={filtered.length} onChange={goToPage} />
                </>
              )}
            </div>
          </div>
        ) : (
          /* ── Cards only view ── */
          filtered.length === 0 ? (
            <div className="text-center py-20 text-slate-400">
              <p className="text-sm">No developments match your criteria.</p>
              {(search || areaBounds) && (
                <button onClick={() => { setSearch(""); setAreaBounds(null); }} className="mt-3 text-xs hover:underline" style={{ color: BRAND }}>
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {paginated.map(dev => <DevCard key={dev.devId} dev={dev} />)}
              </div>
              <Pagination page={page} total={filtered.length} onChange={goToPage} />
            </>
          )
        )}
      </div>

      <Footer />
    </div>
  );
}
