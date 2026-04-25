"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Footer from "@/components/Footer";
import {
  Building2, MapPin, Search, SlidersHorizontal,
  ChevronRight, Sparkles, Home, X, ArrowUpDown
} from "lucide-react";
import type { DevelopmentSummary } from "@/app/api/developments/route";

// ─── Dev card ────────────────────────────────────────────────────────────────

function DevCard({ dev, isHighlighted }: { dev: DevelopmentSummary; isHighlighted: boolean }) {
  const priceRange = dev.minPrice === dev.maxPrice
    ? `${dev.minPrice.toLocaleString("fr-FR")} €`
    : `${dev.minPrice.toLocaleString("fr-FR")} — ${dev.maxPrice.toLocaleString("fr-FR")} €`;

  return (
    <Link
      href={`/developpement/${dev.devId}`}
      className="group relative flex flex-col bg-white rounded-[2rem] overflow-hidden border border-slate-100 hover:border-[#D4AF37]/40 hover:shadow-2xl transition-all duration-500"
    >
      {/* Image stack */}
      <div className="relative h-64 overflow-hidden bg-slate-100">
        <img
          src={dev.images?.[0] || "/placeholder-villa.jpg"}
          alt={dev.name || dev.devId}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* NOUVEAU badge */}
        {dev.isNew && (
          <div className="absolute top-5 left-5 flex items-center gap-1.5 px-3 py-1.5 bg-[#D4AF37] text-[#0A0A0A] rounded-full text-[9px] font-black uppercase tracking-widest shadow-lg">
            <Sparkles size={10} />
            Nouveau
          </div>
        )}

        {/* Unit count */}
        <div className="absolute top-5 right-5 px-3 py-1.5 bg-black/60 backdrop-blur-md text-white rounded-full text-[9px] font-bold border border-white/10">
          {dev.unitCount} unité{dev.unitCount > 1 ? "s" : ""}
        </div>

        {/* Location bottom */}
        <div className="absolute bottom-5 left-5 flex items-center gap-1.5 text-white text-[10px] font-bold uppercase tracking-widest">
          <MapPin size={12} className="text-[#D4AF37]" />
          <span>{dev.town}</span>
          {dev.region && <><span className="opacity-40">·</span><span className="opacity-70">{dev.region}</span></>}
        </div>
      </div>

      {/* Body */}
      <div className="p-7 flex flex-col flex-1">
        <h3 className="text-xl font-serif italic text-slate-900 mb-1 line-clamp-1 group-hover:text-[#D4AF37] transition-colors duration-300">
          {dev.name || `Programme ${dev.devId}`}
        </h3>

        {/* Price range */}
        <p className="text-sm text-slate-400 font-medium mb-4">
          {dev.minPrice > 0 ? priceRange : "Prix sur demande"}
        </p>

        {/* Types pills */}
        {dev.types.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-5">
            {dev.types.slice(0, 3).map(type => (
              <span key={type} className="px-2.5 py-1 bg-slate-50 border border-slate-100 text-[8px] font-black uppercase tracking-widest text-slate-500 rounded-full">
                {type}
              </span>
            ))}
            {dev.types.length > 3 && (
              <span className="px-2.5 py-1 bg-slate-50 border border-slate-100 text-[8px] font-black uppercase tracking-widest text-slate-400 rounded-full">
                +{dev.types.length - 3}
              </span>
            )}
          </div>
        )}

        {/* CTA */}
        <div className="mt-auto flex items-center justify-between pt-5 border-t border-slate-50">
          <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">
            Voir le programme
          </span>
          <div className="w-9 h-9 rounded-full border border-slate-200 flex items-center justify-center group-hover:bg-[#D4AF37] group-hover:border-[#D4AF37] transition-all duration-300">
            <ChevronRight size={14} className="text-slate-400 group-hover:text-white transition-colors duration-300" />
          </div>
        </div>
      </div>

      {/* Highlight ring */}
      {isHighlighted && (
        <div className="absolute inset-0 rounded-[2rem] ring-2 ring-[#D4AF37]/30 pointer-events-none" />
      )}
    </Link>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

const SORT_OPTIONS = [
  { label: "Plus récents", value: "recent" },
  { label: "Prix croissant", value: "price_asc" },
  { label: "Prix décroissant", value: "price_desc" },
  { label: "Nb unités", value: "units" },
];

export default function DevelopmentsPage() {
  const [developments, setDevelopments] = useState<DevelopmentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeType, setActiveType] = useState("Tous");
  const [activeTown, setActiveTown] = useState("Toutes");
  const [sortBy, setSortBy] = useState("recent");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetch("/api/developments")
      .then(r => r.json())
      .then(data => setDevelopments(data.developments || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const allTypes = useMemo(() => {
    const set = new Set<string>();
    developments.forEach(d => d.types.forEach(t => set.add(t)));
    return ["Tous", ...Array.from(set).sort()];
  }, [developments]);

  const allTowns = useMemo(() => {
    const set = new Set(developments.map(d => d.town).filter(Boolean));
    return ["Toutes", ...Array.from(set).sort()];
  }, [developments]);

  const filtered = useMemo(() => {
    let list = [...developments];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(d =>
        (d.name || "").toLowerCase().includes(q) ||
        d.town?.toLowerCase().includes(q) ||
        d.region?.toLowerCase().includes(q) ||
        d.devId.includes(q)
      );
    }
    if (activeType !== "Tous") list = list.filter(d => d.types.includes(activeType));
    if (activeTown !== "Toutes") list = list.filter(d => d.town === activeTown);

    switch (sortBy) {
      case "price_asc": list.sort((a, b) => a.minPrice - b.minPrice); break;
      case "price_desc": list.sort((a, b) => b.maxPrice - a.maxPrice); break;
      case "units": list.sort((a, b) => b.unitCount - a.unitCount); break;
      default: break; // "recent" — API already sorted
    }

    return list;
  }, [developments, search, activeType, activeTown, sortBy]);

  const newOnes = useMemo(() => developments.filter(d => d.isNew), [developments]);
  const hasActiveFilters = search || activeType !== "Tous" || activeTown !== "Toutes";

  return (
    <main className="bg-[#F9F8F6] min-h-screen">

      {/* ── HERO ──────────────────────────────────────────────────────────────── */}
      <section className="relative bg-[#0A0A0A] pt-32 pb-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,#D4AF3720,transparent_70%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_50%,#10b98115,transparent_70%)]" />
        </div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex items-center gap-3 text-[#D4AF37] mb-6">
            <Building2 size={18} />
            <span className="text-[10px] font-black uppercase tracking-[0.4em]">Programmes neufs</span>
          </div>
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-10">
            <div>
              <h1 className="text-5xl md:text-6xl font-serif italic leading-tight text-white mb-4">
                Tous les développements
              </h1>
              <p className="text-slate-400 text-base max-w-xl leading-relaxed">
                {loading ? "Chargement…" : `${developments.length} programme${developments.length > 1 ? "s" : ""} immobiliers · acquérez sur plan, en toute sérénité`}
              </p>
            </div>

            {/* Stats strip */}
            {!loading && (
              <div className="flex gap-4">
                {[
                  { label: "Programmes", value: developments.length },
                  { label: "Nouveaux", value: newOnes.length },
                  { label: "Unités dispo.", value: developments.reduce((s, d) => s + d.unitCount, 0) },
                ].map(s => (
                  <div key={s.label} className="text-center bg-white/5 border border-white/10 rounded-2xl px-6 py-4 min-w-[90px]">
                    <p className="text-2xl font-serif italic text-white">{s.value}</p>
                    <p className="text-[8px] font-black uppercase tracking-widest text-slate-500 mt-1">{s.label}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── NOUVEAUX EN AVANT ─────────────────────────────────────────────────── */}
      {!loading && newOnes.length > 0 && (
        <section className="py-16 border-b border-slate-200/60">
          <div className="max-w-7xl mx-auto px-6">
            <div className="flex items-center justify-between mb-10">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-[#D4AF37]">
                  <Sparkles size={16} />
                  <span className="text-[10px] font-black uppercase tracking-[0.4em]">Derniers arrivés</span>
                </div>
                <span className="w-16 h-px bg-[#D4AF37]/40" />
              </div>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{newOnes.length} nouveaux programmes</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5">
              {newOnes.map(dev => (
                <Link
                  key={dev.devId}
                  href={`/developpement/${dev.devId}`}
                  className="group relative rounded-[1.5rem] overflow-hidden aspect-[3/4] border border-[#D4AF37]/20 hover:border-[#D4AF37]/60 hover:shadow-xl transition-all duration-500"
                >
                  <img
                    src={dev.images?.[0] || "/placeholder-villa.jpg"}
                    alt={dev.name || dev.devId}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />

                  <div className="absolute top-4 left-4">
                    <span className="flex items-center gap-1 px-2.5 py-1 bg-[#D4AF37] text-[#0A0A0A] rounded-full text-[8px] font-black uppercase tracking-widest">
                      <Sparkles size={8} /> Nouveau
                    </span>
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 p-5">
                    <p className="text-white font-serif italic text-lg leading-tight mb-1 line-clamp-2 group-hover:text-[#D4AF37] transition-colors duration-300">
                      {dev.name || `Programme ${dev.devId}`}
                    </p>
                    <p className="text-slate-400 text-[10px] flex items-center gap-1">
                      <MapPin size={10} className="text-[#D4AF37]" /> {dev.town}
                    </p>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-[10px] text-white/70 font-medium">
                        {dev.unitCount} unité{dev.unitCount > 1 ? "s" : ""}
                      </span>
                      <span className="text-[10px] text-[#D4AF37] font-bold">
                        {dev.minPrice > 0 ? `${dev.minPrice.toLocaleString("fr-FR")} €` : "Sur dem."}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FILTERS + GRID ────────────────────────────────────────────────────── */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-6">

          {/* Filter bar */}
          <div className="bg-white rounded-[1.5rem] border border-slate-100 shadow-sm p-5 mb-10">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center">

              {/* Search */}
              <div className="relative flex-1 min-w-0">
                <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Nom, ville, région…"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-100 rounded-xl text-sm outline-none focus:border-[#D4AF37] transition-colors placeholder:text-slate-400"
                />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900">
                    <X size={14} />
                  </button>
                )}
              </div>

              {/* Town filter */}
              <div className="flex items-center gap-2 flex-wrap">
                <MapPin size={13} className="text-slate-400 shrink-0" />
                <div className="flex flex-wrap gap-1.5">
                  {allTowns.map(town => (
                    <button
                      key={town}
                      onClick={() => setActiveTown(town)}
                      className={`px-3.5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border ${
                        activeTown === town
                          ? "bg-[#0A0A0A] text-white border-transparent"
                          : "bg-slate-50 text-slate-500 border-slate-100 hover:border-slate-300"
                      }`}
                    >
                      {town}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort */}
              <div className="flex items-center gap-2 shrink-0">
                <ArrowUpDown size={13} className="text-slate-400" />
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="text-[9px] font-black uppercase tracking-widest text-slate-600 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 outline-none cursor-pointer hover:border-slate-300 transition-colors"
                >
                  {SORT_OPTIONS.map(o => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Type pills — second row */}
            {allTypes.length > 1 && (
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-slate-50 flex-wrap">
                <Home size={13} className="text-slate-400 shrink-0" />
                <div className="flex flex-wrap gap-1.5">
                  {allTypes.map(type => (
                    <button
                      key={type}
                      onClick={() => setActiveType(type)}
                      className={`px-3.5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest transition-all border ${
                        activeType === type
                          ? "bg-[#D4AF37] text-[#0A0A0A] border-transparent"
                          : "bg-slate-50 text-slate-500 border-slate-100 hover:border-slate-300"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>

                {hasActiveFilters && (
                  <button
                    onClick={() => { setSearch(""); setActiveType("Tous"); setActiveTown("Toutes"); }}
                    className="ml-auto flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-colors"
                  >
                    <X size={12} /> Effacer filtres
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Results count */}
          <div className="flex items-center justify-between mb-6">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              {loading ? "Chargement…" : `${filtered.length} programme${filtered.length > 1 ? "s" : ""}`}
              {hasActiveFilters && <span className="text-[#D4AF37] ml-2">· filtré</span>}
            </p>
          </div>

          {/* Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-white rounded-[2rem] overflow-hidden border border-slate-100 animate-pulse">
                  <div className="h-64 bg-slate-100" />
                  <div className="p-7 space-y-3">
                    <div className="h-5 bg-slate-100 rounded-full w-3/4" />
                    <div className="h-4 bg-slate-100 rounded-full w-1/2" />
                    <div className="h-3 bg-slate-100 rounded-full w-1/3 mt-4" />
                  </div>
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-32">
              <Building2 size={40} className="mx-auto mb-4 text-slate-200" />
              <p className="text-slate-400 text-sm">Aucun programme ne correspond à vos critères.</p>
              <button
                onClick={() => { setSearch(""); setActiveType("Tous"); setActiveTown("Toutes"); }}
                className="mt-6 text-[10px] font-black uppercase tracking-widest text-[#D4AF37] border-b border-[#D4AF37]/40"
              >
                Effacer les filtres
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map(dev => (
                <DevCard key={dev.devId} dev={dev} isHighlighted={dev.isNew} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── BOTTOM CTA ────────────────────────────────────────────────────────── */}
      <section className="py-24 bg-[#0A0A0A] text-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <Building2 size={36} className="mx-auto mb-6 text-[#D4AF37]" />
          <h2 className="text-4xl font-serif italic mb-4">Investir sur plan en Espagne</h2>
          <p className="text-slate-400 text-sm leading-relaxed mb-10 max-w-lg mx-auto">
            Bénéficiez du plan de paiement VEFA espagnol : 10 % à la réservation, 20 % au démarrage des travaux, 70 % à la remise des clés.
          </p>
          <Link
            href="/#contact"
            className="inline-flex items-center gap-3 px-10 py-5 bg-[#D4AF37] text-[#0A0A0A] text-[10px] font-black uppercase tracking-widest rounded-2xl hover:bg-white transition-all shadow-2xl"
          >
            Parler à un conseiller <ChevronRight size={16} />
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
