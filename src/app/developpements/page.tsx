"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Search, X, ChevronLeft, ChevronRight,
  Bed, Bath, Waves, Building2, MapPin, Map as MapIcon
} from "lucide-react";
import type { DevelopmentSummary, UnitOption } from "@/app/api/developments/route";

const BRAND = "#D4AF37";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtPrice(n: number) {
  return n.toLocaleString("fr-FR") + " €";
}

// ─── DevCard ─────────────────────────────────────────────────────────────────

const MAX_VISIBLE = 2;

function DevCard({ dev }: { dev: DevelopmentSummary }) {
  const [imgIdx, setImgIdx] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const images = dev.images?.length ? dev.images : [];
  const hasImages = images.length > 0;
  const currentImg = images[imgIdx] ?? "/placeholder-villa.jpg";

  const visibleOptions = expanded ? dev.options : dev.options.slice(0, MAX_VISIBLE);
  const hiddenCount = dev.options.length - MAX_VISIBLE;

  // Derive amenity icons from available data
  const maxBeds = Math.max(0, ...dev.options.map(o => o.beds));
  const maxBaths = Math.max(0, ...dev.options.map(o => o.baths));
  const amenities = [
    { icon: <Building2 size={14} />, show: true },
    { icon: <Bed size={14} />,       show: maxBeds > 0 },
    { icon: <Bath size={14} />,      show: maxBaths > 0 },
    { icon: <Waves size={14} />,     show: true },
  ].filter(a => a.show).slice(0, 4);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">

      {/* ── Image ── */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        <img
          src={currentImg}
          alt={dev.name || dev.devId}
          className="w-full h-full object-cover transition-opacity duration-300"
          loading="lazy"
        />

        {/* Available badge */}
        <span className={`absolute top-2.5 left-2.5 text-white text-xs font-medium px-3 py-1 rounded-full shadow-sm ${
          dev.unitCount === 1 ? "bg-amber-500" : "bg-green-500"
        }`}>
          {dev.unitCount === 1 ? "Last available" : `${dev.unitCount} available`}
        </span>

        {/* Gold link button */}
        <Link
          href={`/developpement/${dev.devId}`}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm transition-opacity hover:opacity-90"
          style={{ backgroundColor: BRAND }}
        >
          <MapPin size={14} />
        </Link>

        {/* Image nav (only if multiple images) */}
        {images.length > 1 && (
          <>
            <button
              onClick={e => { e.preventDefault(); setImgIdx(i => (i - 1 + images.length) % images.length); }}
              className="absolute left-2 bottom-2 w-6 h-6 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
            >
              <ChevronLeft size={12} />
            </button>
            <button
              onClick={e => { e.preventDefault(); setImgIdx(i => (i + 1) % images.length); }}
              className="absolute left-10 bottom-2 w-6 h-6 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors"
            >
              <ChevronRight size={12} />
            </button>
          </>
        )}
      </div>

      {/* ── Body ── */}
      <div className="p-4">

        {/* Title */}
        <Link href={`/developpement/${dev.devId}`}>
          <h3 className="text-base font-medium text-gray-900 mb-1 hover:text-[#b8962e] transition-colors line-clamp-1">
            {dev.name || `Programme ${dev.devId}`}
          </h3>
        </Link>
        {dev.town && (
          <p className="text-xs text-gray-400 mb-3">
            {dev.town}{dev.region && dev.region !== dev.town ? ` · ${dev.region}` : ""}
          </p>
        )}

        {/* Amenity icons */}
        <div className="flex gap-2 mb-4">
          {amenities.map(({ icon }, i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-full border-2 flex items-center justify-center"
              style={{ borderColor: BRAND, color: BRAND }}
            >
              {icon}
            </div>
          ))}
        </div>

        {/* Price options */}
        {dev.options.length > 0 ? (
          <div className="border-t border-gray-100 pt-3 flex flex-col gap-2.5">
            {visibleOptions.map((opt: UnitOption, i: number) => (
              <div key={i} className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    From {fmtPrice(opt.minPrice)}
                  </p>
                  <p className="text-xs text-gray-400">
                    {opt.beds > 0 && `${opt.beds} bedro.`}
                    {opt.beds > 0 && opt.baths > 0 && " · "}
                    {opt.baths > 0 && `${opt.baths} bathr.`}
                    {opt.surface > 0 && ` · ${opt.surface} m²`}
                  </p>
                </div>
                <span className="text-xs text-gray-400 shrink-0 ml-2">(x{opt.count})</span>
              </div>
            ))}

            {hiddenCount > 0 && (
              <button
                onClick={() => setExpanded(v => !v)}
                className="text-xs font-medium mt-0.5 text-left transition-colors"
                style={{ color: BRAND }}
              >
                {expanded ? "Show less ↑" : `Show all options (+${hiddenCount})`}
              </button>
            )}
          </div>
        ) : dev.minPrice > 0 ? (
          <div className="border-t border-gray-100 pt-3">
            <p className="text-sm font-medium text-gray-900">From {fmtPrice(dev.minPrice)}</p>
          </div>
        ) : null}
      </div>

      {/* ── Footer ── */}
      <div className="border-t border-gray-100 px-4 py-3 flex justify-between items-center">
        <span className="text-xs text-gray-400">Delivery: To consult</span>
        <div className="flex gap-1">
          <button
            onClick={() => setImgIdx(i => (i - 1 + Math.max(images.length, 1)) % Math.max(images.length, 1))}
            disabled={images.length <= 1}
            className="w-6 h-6 rounded-full border border-gray-200 text-gray-400 flex items-center justify-center hover:border-gray-400 disabled:opacity-30 transition-colors"
          >
            <ChevronLeft size={12} />
          </button>
          <button
            onClick={() => setImgIdx(i => (i + 1) % Math.max(images.length, 1))}
            disabled={images.length <= 1}
            className="w-6 h-6 rounded-full border border-gray-200 text-gray-400 flex items-center justify-center hover:border-gray-400 disabled:opacity-30 transition-colors"
          >
            <ChevronRight size={12} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────────────────────

const PAGE_SIZE = 15;

function Pagination({ page, total, onChange }: { page: number; total: number; onChange: (p: number) => void }) {
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  if (totalPages <= 1) return null;

  // Build page number list: always show first, last, current ±1, with "…" gaps
  const pages: (number | "…")[] = [];
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || (p >= page - 1 && p <= page + 1)) {
      pages.push(p);
    } else if (pages[pages.length - 1] !== "…") {
      pages.push("…");
    }
  }

  return (
    <div className="flex items-center justify-center gap-1.5 mt-10 flex-wrap">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page === 1}
        className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-gray-400 disabled:opacity-30 transition-colors"
      >
        <ChevronLeft size={15} />
      </button>

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`ellipsis-${i}`} className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p)}
            className="w-9 h-9 rounded-lg border text-sm font-medium transition-colors"
            style={
              p === page
                ? { backgroundColor: BRAND, borderColor: BRAND, color: "#fff" }
                : { borderColor: "#e5e7eb", color: "#374151" }
            }
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page === totalPages}
        className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-gray-400 disabled:opacity-30 transition-colors"
      >
        <ChevronRight size={15} />
      </button>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function DevelopmentsPage() {
  const [developments, setDevelopments] = useState<DevelopmentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [hideSingle, setHideSingle] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetch("/api/developments")
      .then(r => r.json())
      .then(data => setDevelopments(data.developments || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

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
    return list;
  }, [developments, search, hideSingle]);

  // Reset to page 1 when filters change
  useEffect(() => { setPage(1); }, [search, hideSingle]);

  const totalUnits = useMemo(
    () => filtered.reduce((s, d) => s + d.unitCount, 0),
    [filtered]
  );

  const paginated = useMemo(
    () => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [filtered, page]
  );

  function goToPage(p: number) {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-20">

        {/* Page title */}
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Developments</h1>
          <Link
            href="/data-home"
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[#D4AF37] text-[#D4AF37] text-sm font-semibold hover:bg-[#D4AF37] hover:text-white transition-colors"
          >
            <MapIcon size={15} />
            Map view
          </Link>
        </div>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search"
              className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 transition-all placeholder:text-slate-400"
              style={{ "--tw-ring-color": BRAND } as React.CSSProperties}
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Hide last available toggle */}
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <div
              onClick={() => setHideSingle(v => !v)}
              className="relative w-9 h-5 rounded-full transition-colors duration-200"
              style={{ backgroundColor: hideSingle ? BRAND : "#e2e8f0" }}
            >
              <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${hideSingle ? "translate-x-4" : "translate-x-0"}`} />
            </div>
            <span className="text-sm text-slate-600">Hide last available?</span>
          </label>
        </div>

        {/* Count */}
        {!loading && (
          <p className="text-sm text-slate-500 mb-5">
            <span className="font-semibold text-slate-800">{totalUnits.toLocaleString("fr-FR")}</span> available
            <span className="ml-2 text-slate-400">
              — {filtered.length} development{filtered.length !== 1 ? "s" : ""}
              {filtered.length > PAGE_SIZE && `, page ${page} / ${Math.ceil(filtered.length / PAGE_SIZE)}`}
            </span>
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: PAGE_SIZE }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 animate-pulse">
                <div className="h-48 bg-gray-100 rounded-t-2xl" />
                <div className="p-4 space-y-3">
                  <div className="h-4 bg-gray-100 rounded w-2/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/3" />
                  <div className="flex gap-2 mt-2">
                    {[0,1,2,3].map(j => <div key={j} className="w-8 h-8 rounded-full bg-gray-100" />)}
                  </div>
                  <div className="h-10 bg-gray-100 rounded mt-2" />
                </div>
                <div className="h-10 bg-gray-50 border-t border-gray-100 rounded-b-2xl" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <p className="text-sm">No developments match your search.</p>
            {search && (
              <button onClick={() => setSearch("")} className="mt-3 text-xs hover:underline" style={{ color: BRAND }}>
                Clear search
              </button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {paginated.map(dev => (
                <DevCard key={dev.devId} dev={dev} />
              ))}
            </div>

            <Pagination page={page} total={filtered.length} onChange={goToPage} />
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
