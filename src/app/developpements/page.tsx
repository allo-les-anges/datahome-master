"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Search, ChevronDown, ChevronUp, Calendar, X } from "lucide-react";
import type { DevelopmentSummary, UnitOption } from "@/app/api/developments/route";

// ─── Helpers ─────────────────────────────────────────────────────────────────

function fmtPrice(n: number) {
  return n.toLocaleString("fr-FR") + " €";
}

// ─── AvailabilityBadge ────────────────────────────────────────────────────────

function AvailabilityBadge({ count }: { count: number }) {
  if (count === 1) {
    return (
      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
        Last available
      </span>
    );
  }
  return (
    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
      {count} available
    </span>
  );
}

// ─── OptionRow ────────────────────────────────────────────────────────────────

function OptionRow({ opt }: { opt: UnitOption }) {
  return (
    <div className="py-2.5 border-b border-slate-100 last:border-0">
      <div className="flex items-baseline gap-1.5 mb-0.5">
        <span className="text-sm font-semibold text-slate-800">
          From {fmtPrice(opt.minPrice)}
        </span>
        <span className="text-xs text-slate-500 font-medium">(x{opt.count})</span>
      </div>
      <div className="text-xs text-slate-500">
        {opt.beds > 0 && <span>{opt.beds} bedro.</span>}
        {opt.beds > 0 && opt.baths > 0 && <span className="mx-1 opacity-40">-</span>}
        {opt.baths > 0 && <span>{opt.baths} bathr.</span>}
        {opt.surface > 0 && (
          <>
            {(opt.beds > 0 || opt.baths > 0) && <span className="mx-1 opacity-40">-</span>}
            <span>{opt.surface} m²</span>
          </>
        )}
      </div>
    </div>
  );
}

// ─── DevCard ─────────────────────────────────────────────────────────────────

const MAX_VISIBLE_OPTIONS = 2;

function DevCard({ dev }: { dev: DevelopmentSummary }) {
  const [expanded, setExpanded] = useState(false);

  const visibleOptions = expanded ? dev.options : dev.options.slice(0, MAX_VISIBLE_OPTIONS);
  const hiddenCount = dev.options.length - MAX_VISIBLE_OPTIONS;

  return (
    <div className="bg-white rounded-xl border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-200 overflow-hidden">
      <div className="p-5">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <Link
            href={`/developpement/${dev.devId}`}
            className="text-base font-bold text-slate-900 hover:text-blue-600 transition-colors leading-tight line-clamp-2"
          >
            {dev.name || `Programme ${dev.devId}`}
          </Link>
          <AvailabilityBadge count={dev.unitCount} />
        </div>

        {/* Location */}
        {dev.town && (
          <p className="text-xs text-slate-400 mb-3">
            {dev.town}{dev.region && dev.region !== dev.town ? ` · ${dev.region}` : ""}
          </p>
        )}

        {/* Options */}
        {dev.options.length > 0 ? (
          <div className="mt-1">
            {visibleOptions.map((opt, i) => (
              <OptionRow key={i} opt={opt} />
            ))}

            {hiddenCount > 0 && (
              <button
                onClick={() => setExpanded(v => !v)}
                className="mt-2 flex items-center gap-1 text-[11px] font-semibold text-blue-600 hover:text-blue-700 transition-colors"
              >
                {expanded ? (
                  <>Show less <ChevronUp size={12} /></>
                ) : (
                  <>Show all options (+{hiddenCount}) <ChevronDown size={12} /></>
                )}
              </button>
            )}
          </div>
        ) : dev.minPrice > 0 ? (
          <p className="text-sm font-semibold text-slate-800 py-2">
            From {fmtPrice(dev.minPrice)}
          </p>
        ) : null}
      </div>

      {/* Footer */}
      <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <Calendar size={11} className="text-slate-400" />
          <span>To consult</span>
        </div>
        <Link
          href={`/developpement/${dev.devId}`}
          className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 transition-colors"
        >
          View →
        </Link>
      </div>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function DevelopmentsPage() {
  const [developments, setDevelopments] = useState<DevelopmentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [hideSingle, setHideSingle] = useState(false);

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

  const totalUnits = useMemo(
    () => filtered.reduce((s, d) => s + d.unitCount, 0),
    [filtered]
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-24 pb-20">

        {/* Page title */}
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Developments</h1>

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 mb-5">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search"
              className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all placeholder:text-slate-400"
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
              className={`relative w-9 h-5 rounded-full transition-colors duration-200 ${hideSingle ? "bg-blue-500" : "bg-slate-200"}`}
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
            {search && <span className="ml-2 text-slate-400">({filtered.length} developments)</span>}
          </p>
        )}

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl border border-slate-200 animate-pulse">
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-slate-100 rounded w-2/3" />
                  <div className="h-3 bg-slate-100 rounded w-1/3" />
                  <div className="h-10 bg-slate-100 rounded mt-4" />
                  <div className="h-10 bg-slate-100 rounded" />
                </div>
                <div className="h-10 bg-slate-50 border-t border-slate-100" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 text-slate-400">
            <p className="text-sm">No developments match your search.</p>
            {search && (
              <button onClick={() => setSearch("")} className="mt-3 text-xs text-blue-500 hover:underline">
                Clear search
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map(dev => (
              <DevCard key={dev.devId} dev={dev} />
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
