"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Search, X, ChevronLeft, ChevronRight, ChevronDown, ChevronUp,
  Bed, Bath, Waves, Building2, MapPin, Map as MapIcon,
  SlidersHorizontal, RotateCcw, Plus, Minus,
} from "lucide-react";
import type { DevelopmentSummary, UnitOption } from "@/app/api/developments/route";

const BRAND = "#D4AF37";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtPrice(n: number) {
  return n.toLocaleString("fr-FR") + " €";
}

// ─── Typology map ─────────────────────────────────────────────────────────────

const TYPOLOGIES = [
  { label: "Apartment",               keys: ["apartment", "apartamento", "piso", "flat"] },
  { label: "Ground floor",            keys: ["ground floor", "planta baja", "bajo"] },
  { label: "Penthouse",               keys: ["penthouse", "atico", "ático"] },
  { label: "Duplex",                  keys: ["duplex", "dúplex"] },
  { label: "Terraced",                keys: ["terraced", "adosado", "townhouse"] },
  { label: "Semi-detached",           keys: ["semi-detached", "pareado"] },
  { label: "Detached",                keys: ["detached"] },
  { label: "Villa",                   keys: ["villa", "chalet"] },
  { label: "Bungalow",                keys: ["bungalow"] },
  { label: "High Bungalow (solarium)",keys: ["high bungalow"] },
  { label: "Low Bungalow (garden)",   keys: ["low bungalow"] },
  { label: "Estate",                  keys: ["estate", "finca", "cortijo"] },
];

function matchesTypology(devTypes: string[], filterLabel: string): boolean {
  const typo = TYPOLOGIES.find(t => t.label === filterLabel);
  if (!typo) return false;
  return devTypes.some(dt =>
    typo.keys.some(k => (dt || "").toLowerCase().includes(k))
  );
}

// ─── Filter types ─────────────────────────────────────────────────────────────

interface Filters {
  cities: string[];
  types: string[];
  priceMode: "total" | "m2";
  minPrice: string;
  maxPrice: string;
  beds: number;
  baths: number;
  surfaceMin: string;
  pool: boolean;
  seaMax: string;
  golfMax: string;
}

const DEFAULT_FILTERS: Filters = {
  cities: [],
  types: [],
  priceMode: "total",
  minPrice: "",
  maxPrice: "",
  beds: 0,
  baths: 0,
  surfaceMin: "",
  pool: false,
  seaMax: "",
  golfMax: "",
};

function countActiveFilters(f: Filters): number {
  return (
    (f.cities.length > 0 ? 1 : 0) +
    (f.types.length > 0 ? 1 : 0) +
    (f.minPrice ? 1 : 0) +
    (f.maxPrice ? 1 : 0) +
    (f.beds > 0 ? 1 : 0) +
    (f.baths > 0 ? 1 : 0) +
    (f.surfaceMin ? 1 : 0) +
    (f.pool ? 1 : 0) +
    (f.seaMax ? 1 : 0) +
    (f.golfMax ? 1 : 0)
  );
}

// ─── Filter UI primitives ─────────────────────────────────────────────────────

function FilterSection({
  title, children, defaultOpen = true,
}: {
  title: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-100 last:border-b-0">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex items-center justify-between w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors"
      >
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{title}</span>
        {open
          ? <ChevronUp size={12} className="text-slate-400 shrink-0" />
          : <ChevronDown size={12} className="text-slate-400 shrink-0" />}
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

function CheckRow({
  label, checked, onChange, disabled = false,
}: {
  label: string; checked: boolean; onChange: () => void; disabled?: boolean;
}) {
  return (
    <label
      className={`flex items-center gap-2.5 py-[3px] group select-none ${
        disabled ? "opacity-40 pointer-events-none" : "cursor-pointer"
      }`}
    >
      <div
        onClick={onChange}
        className={`w-[15px] h-[15px] rounded border flex items-center justify-center shrink-0 transition-colors ${
          checked ? "bg-[#D4AF37] border-[#D4AF37]" : "border-slate-300 group-hover:border-[#D4AF37]"
        }`}
      >
        {checked && (
          <svg width="8" height="6" viewBox="0 0 8 6" fill="none">
            <path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </div>
      <span className="text-[13px] text-slate-600 leading-tight">{label}</span>
    </label>
  );
}

function Counter({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <div className="flex items-center justify-between py-1.5">
      <span className="text-[13px] text-slate-600">{label}</span>
      <div className="flex items-center">
        <button
          onClick={() => onChange(Math.max(0, value - 1))}
          disabled={value === 0}
          className="w-7 h-6 rounded-l border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 disabled:opacity-30 transition-colors"
        >
          <Minus size={10} />
        </button>
        <span className="w-8 h-6 border-t border-b border-slate-200 flex items-center justify-center text-[13px] font-medium text-slate-800">
          {value}
        </span>
        <button
          onClick={() => onChange(value + 1)}
          className="w-7 h-6 rounded-r border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-slate-50 transition-colors"
        >
          <Plus size={10} />
        </button>
      </div>
    </div>
  );
}

function FilterChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 border border-amber-200 rounded-full text-xs font-medium text-amber-800">
      {label}
      <button onClick={onRemove} className="hover:text-amber-600 leading-none">
        <X size={10} />
      </button>
    </span>
  );
}

// ─── FilterSidebar ────────────────────────────────────────────────────────────

interface FilterSidebarProps {
  filters: Filters;
  onChange: (f: Filters) => void;
  allCities: string[];
  allTypes: string[];
}

function FilterSidebar({ filters, onChange, allCities, allTypes }: FilterSidebarProps) {
  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });
  const activeCount = countActiveFilters(filters);

  const toggleCity = (city: string) =>
    set({ cities: filters.cities.includes(city) ? filters.cities.filter(c => c !== city) : [...filters.cities, city] });

  const toggleType = (label: string) =>
    set({ types: filters.types.includes(label) ? filters.types.filter(t => t !== label) : [...filters.types, label] });

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
        <span className="text-sm font-semibold text-slate-800 flex items-center gap-2">
          <SlidersHorizontal size={13} style={{ color: BRAND }} />
          Filters
          {activeCount > 0 && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white leading-none" style={{ backgroundColor: BRAND }}>
              {activeCount}
            </span>
          )}
        </span>
        {activeCount > 0 && (
          <button
            onClick={() => onChange(DEFAULT_FILTERS)}
            className="text-[11px] text-slate-400 hover:text-slate-700 flex items-center gap-1 transition-colors"
          >
            <RotateCcw size={10} /> Reset
          </button>
        )}
      </div>

      {/* LOCATION */}
      <FilterSection title="Location">
        {allCities.length === 0 ? (
          <p className="text-xs text-slate-400">Loading…</p>
        ) : (
          <div className="max-h-44 overflow-y-auto pr-1 space-y-0">
            {allCities.map(city => (
              <CheckRow
                key={city}
                label={city}
                checked={filters.cities.includes(city)}
                onChange={() => toggleCity(city)}
              />
            ))}
          </div>
        )}
      </FilterSection>

      {/* TYPOLOGY */}
      <FilterSection title="Typology" defaultOpen={false}>
        <div className="space-y-0">
          {TYPOLOGIES.map(t => {
            const available = allTypes.some(dt =>
              t.keys.some(k => (dt || "").toLowerCase().includes(k))
            );
            return (
              <CheckRow
                key={t.label}
                label={t.label}
                checked={filters.types.includes(t.label)}
                onChange={() => toggleType(t.label)}
                disabled={!available}
              />
            );
          })}
        </div>
      </FilterSection>

      {/* PRICE */}
      <FilterSection title="Price">
        <div className="flex rounded-lg border border-slate-200 overflow-hidden text-[12px] font-medium mb-3">
          {(["total", "m2"] as const).map(mode => (
            <button
              key={mode}
              onClick={() => set({ priceMode: mode })}
              className="flex-1 py-1.5 transition-colors"
              style={filters.priceMode === mode ? { backgroundColor: BRAND, color: "#fff" } : { color: "#94a3b8" }}
            >
              {mode === "total" ? "Total" : "Per m²"}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <div className="flex-1">
            <p className="text-[10px] text-slate-400 mb-1">Min</p>
            <input
              type="number" placeholder="50 000"
              value={filters.minPrice}
              onChange={e => set({ minPrice: e.target.value })}
              className="w-full px-2.5 py-1.5 text-[13px] border border-slate-200 rounded-lg outline-none focus:border-[#D4AF37] transition-colors"
            />
          </div>
          <div className="flex-1">
            <p className="text-[10px] text-slate-400 mb-1">Max</p>
            <input
              type="number" placeholder="30 000 000"
              value={filters.maxPrice}
              onChange={e => set({ maxPrice: e.target.value })}
              className="w-full px-2.5 py-1.5 text-[13px] border border-slate-200 rounded-lg outline-none focus:border-[#D4AF37] transition-colors"
            />
          </div>
        </div>
      </FilterSection>

      {/* DISTRIBUTION */}
      <FilterSection title="Distribution" defaultOpen={false}>
        <Counter label="Bedrooms"  value={filters.beds}  onChange={v => set({ beds: v })} />
        <Counter label="Bathrooms" value={filters.baths} onChange={v => set({ baths: v })} />
        <div className="mt-2.5">
          <p className="text-[10px] text-slate-400 mb-1">Surface from (m²)</p>
          <input
            type="number" placeholder="0"
            value={filters.surfaceMin}
            onChange={e => set({ surfaceMin: e.target.value })}
            className="w-full px-2.5 py-1.5 text-[13px] border border-slate-200 rounded-lg outline-none focus:border-[#D4AF37] transition-colors"
          />
        </div>
        <div className="mt-3 pt-3 border-t border-slate-100">
          <p className="text-[10px] text-slate-400 mb-1.5">Living room from (m²)</p>
          <input type="number" placeholder="0" disabled
            className="w-full px-2.5 py-1.5 text-[13px] border border-slate-200 rounded-lg opacity-40 cursor-not-allowed mb-2.5" />
          <p className="text-[10px] text-slate-400 mb-1.5">Solarium from (m²)</p>
          <input type="number" placeholder="0" disabled
            className="w-full px-2.5 py-1.5 text-[13px] border border-slate-200 rounded-lg opacity-40 cursor-not-allowed mb-2.5" />
          <div className="space-y-0 mt-1">
            {["Garage", "Outdoor kitchen", "Balcony", "Garden", "Solarium", "Terrace", "Storage room"].map(f => (
              <CheckRow key={f} label={f} checked={false} onChange={() => {}} disabled />
            ))}
          </div>
        </div>
      </FilterSection>

      {/* FEATURES (PROPERTY) */}
      <FilterSection title="Features (Property)" defaultOpen={false}>
        <div className="space-y-0">
          {[
            "Air conditioner", "Built-in cabinets", "Elevator", "Heating",
            "Home appliances", "Gym", "Barbecue", "Climatized pool",
            "Saltwater pool", "Indoor pool", "Outdoor pool", "Furnished",
            "Floor heating", "Furnished kitchen", "Pergola", "Solar water panels",
            "Solar light panels", "Automatic watering", "SPA", "Adapted housing",
            "Wood floor", "Ceramic floor", "Parquet floor", "Marble floor",
          ].map(f => <CheckRow key={f} label={f} checked={false} onChange={() => {}} disabled />)}
        </div>
      </FilterSection>

      {/* FEATURES (DEVELOPMENT) */}
      <FilterSection title="Features (Development)" defaultOpen={false}>
        <CheckRow
          label="Swimming pool"
          checked={filters.pool}
          onChange={() => set({ pool: !filters.pool })}
        />
        {[
          "Paddle or tennis court", "Garden areas", "Gym", "Parking",
          "Elevator", "Investment opportunity", "Vacation rental", "VR", "Show property",
        ].map(f => <CheckRow key={f} label={f} checked={false} onChange={() => {}} disabled />)}
      </FilterSection>

      {/* FEATURES (AREA) */}
      <FilterSection title="Features (Area)" defaultOpen={false}>
        <div className="space-y-2.5 mb-3">
          <div>
            <p className="text-[10px] text-slate-400 mb-1">Airport up to (km)</p>
            <input type="number" placeholder="0" disabled
              className="w-full px-2.5 py-1.5 text-[13px] border border-slate-200 rounded-lg opacity-40 cursor-not-allowed" />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 mb-1">Sea up to (km)</p>
            <input
              type="number" placeholder="0"
              value={filters.seaMax}
              onChange={e => set({ seaMax: e.target.value })}
              className="w-full px-2.5 py-1.5 text-[13px] border border-slate-200 rounded-lg outline-none focus:border-[#D4AF37] transition-colors"
            />
          </div>
          <div>
            <p className="text-[10px] text-slate-400 mb-1">Golf up to (km)</p>
            <input
              type="number" placeholder="0"
              value={filters.golfMax}
              onChange={e => set({ golfMax: e.target.value })}
              className="w-full px-2.5 py-1.5 text-[13px] border border-slate-200 rounded-lg outline-none focus:border-[#D4AF37] transition-colors"
            />
          </div>
        </div>
        <div className="space-y-0">
          {["Sea views", "Mountain views", "City views", "Residential area", "Sports areas", "Green areas"].map(f => (
            <CheckRow key={f} label={f} checked={false} onChange={() => {}} disabled />
          ))}
        </div>
      </FilterSection>

      {/* DELIVERY DATE */}
      <FilterSection title="Delivery Date" defaultOpen={false}>
        <div className="grid grid-cols-2 gap-2">
          {[["From (Month)", "MM"], ["From (Year)", "YYYY"], ["To (Month)", "MM"], ["To (Year)", "YYYY"]].map(([label, ph]) => (
            <div key={label}>
              <p className="text-[10px] text-slate-400 mb-1">{label}</p>
              <input type="number" placeholder={ph} disabled
                className="w-full px-2.5 py-1.5 text-[13px] border border-slate-200 rounded-lg opacity-40 cursor-not-allowed" />
            </div>
          ))}
        </div>
      </FilterSection>
    </div>
  );
}

// ─── DevCard ──────────────────────────────────────────────────────────────────

const MAX_VISIBLE = 2;

function DevCard({ dev }: { dev: DevelopmentSummary }) {
  const [imgIdx, setImgIdx] = useState(0);
  const [expanded, setExpanded] = useState(false);

  const images = dev.images?.length ? dev.images : [];
  const currentImg = images[imgIdx] ?? "/placeholder-villa.jpg";

  const visibleOptions = expanded ? dev.options : dev.options.slice(0, MAX_VISIBLE);
  const hiddenCount = dev.options.length - MAX_VISIBLE;

  const maxBeds = Math.max(0, ...dev.options.map(o => o.beds));
  const maxBaths = Math.max(0, ...dev.options.map(o => o.baths));
  const amenities = [
    { icon: <Building2 size={14} />, show: true },
    { icon: <Bed size={14} />,       show: maxBeds > 0 },
    { icon: <Bath size={14} />,      show: maxBaths > 0 },
    { icon: <Waves size={14} />,     show: dev.hasPool },
  ].filter(a => a.show).slice(0, 4);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg transition-shadow duration-300">

      {/* Image */}
      <div className="relative h-48 bg-gray-100 overflow-hidden">
        <img
          src={currentImg}
          alt={dev.name || dev.devId}
          className="w-full h-full object-cover transition-opacity duration-300"
          loading="lazy"
        />
        <span className={`absolute top-2.5 left-2.5 text-white text-xs font-medium px-3 py-1 rounded-full shadow-sm ${
          dev.unitCount === 1 ? "bg-amber-500" : "bg-green-500"
        }`}>
          {dev.unitCount === 1 ? "Last available" : `${dev.unitCount} available`}
        </span>
        <Link
          href={`/developpement/${dev.devId}`}
          className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center text-white shadow-sm transition-opacity hover:opacity-90"
          style={{ backgroundColor: BRAND }}
        >
          <MapPin size={14} />
        </Link>
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

      {/* Body */}
      <div className="p-4">
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
        {dev.options.length > 0 ? (
          <div className="border-t border-gray-100 pt-3 flex flex-col gap-2.5">
            {visibleOptions.map((opt: UnitOption, i: number) => (
              <div key={i} className="flex justify-between items-start">
                <div>
                  <p className="text-sm font-medium text-gray-900">From {fmtPrice(opt.minPrice)}</p>
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

      {/* Footer */}
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
        onClick={() => onChange(page - 1)} disabled={page === 1}
        className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-gray-400 disabled:opacity-30 transition-colors"
      >
        <ChevronLeft size={15} />
      </button>
      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`e-${i}`} className="w-9 h-9 flex items-center justify-center text-gray-400 text-sm">…</span>
        ) : (
          <button
            key={p} onClick={() => onChange(p)}
            className="w-9 h-9 rounded-lg border text-sm font-medium transition-colors"
            style={p === page
              ? { backgroundColor: BRAND, borderColor: BRAND, color: "#fff" }
              : { borderColor: "#e5e7eb", color: "#374151" }}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={() => onChange(page + 1)} disabled={page === totalPages}
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
  const [loading, setLoading]           = useState(true);
  const [search, setSearch]             = useState("");
  const [hideSingle, setHideSingle]     = useState(false);
  const [filters, setFilters]           = useState<Filters>(DEFAULT_FILTERS);
  const [page, setPage]                 = useState(1);
  const [showFilters, setShowFilters]   = useState(false);

  useEffect(() => {
    fetch("/api/developments")
      .then(r => r.json())
      .then(data => setDevelopments(data.developments || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const allCities = useMemo(
    () => [...new Set(developments.map(d => d.town).filter(Boolean))].sort() as string[],
    [developments]
  );

  const allTypes = useMemo(
    () => [...new Set(developments.flatMap(d => d.types || []).filter(Boolean))],
    [developments]
  );

  const filtered = useMemo(() => {
    let list = [...developments];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(d =>
        (d.name || "").toLowerCase().includes(q) ||
        (d.town || "").toLowerCase().includes(q) ||
        (d.region || "").toLowerCase().includes(q)
      );
    }

    if (hideSingle) list = list.filter(d => d.unitCount > 1);

    if (filters.cities.length) {
      list = list.filter(d => filters.cities.includes(d.town));
    }

    if (filters.types.length) {
      list = list.filter(d => filters.types.some(ft => matchesTypology(d.types || [], ft)));
    }

    const minP = parseFloat(filters.minPrice);
    if (!isNaN(minP) && minP > 0) list = list.filter(d => d.maxPrice >= minP);

    const maxP = parseFloat(filters.maxPrice);
    if (!isNaN(maxP) && maxP > 0) list = list.filter(d => d.minPrice <= maxP);

    if (filters.beds > 0) {
      list = list.filter(d => d.options.some(o => o.beds >= filters.beds));
    }

    if (filters.baths > 0) {
      list = list.filter(d => d.options.some(o => o.baths >= filters.baths));
    }

    const minSurf = parseFloat(filters.surfaceMin);
    if (!isNaN(minSurf) && minSurf > 0) {
      list = list.filter(d => d.options.some(o => o.surface >= minSurf));
    }

    if (filters.pool) list = list.filter(d => d.hasPool);

    const seaMax = parseFloat(filters.seaMax);
    if (!isNaN(seaMax) && seaMax > 0) {
      list = list.filter(d => d.minDistanceBeach != null && d.minDistanceBeach <= seaMax);
    }

    const golfMax = parseFloat(filters.golfMax);
    if (!isNaN(golfMax) && golfMax > 0) {
      list = list.filter(d => d.minDistanceGolf != null && d.minDistanceGolf <= golfMax);
    }

    return list;
  }, [developments, search, hideSingle, filters]);

  useEffect(() => { setPage(1); }, [search, hideSingle, filters]);

  const totalUnits = useMemo(() => filtered.reduce((s, d) => s + d.unitCount, 0), [filtered]);
  const paginated  = useMemo(() => filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE), [filtered, page]);

  function goToPage(p: number) {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const activeFilterCount = countActiveFilters(filters);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-36 pb-20">

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

        <div className="flex gap-6 items-start">

          {/* ── Desktop sidebar ── */}
          <div className="hidden lg:block w-60 xl:w-64 shrink-0 sticky top-36 max-h-[calc(100vh-160px)] overflow-y-auto rounded-xl">
            <FilterSidebar
              filters={filters}
              onChange={setFilters}
              allCities={allCities}
              allTypes={allTypes}
            />
          </div>

          {/* ── Content ── */}
          <div className="flex-1 min-w-0">

            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-3 mb-4">

              {/* Mobile filter button */}
              <button
                onClick={() => setShowFilters(true)}
                className="lg:hidden inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50 transition-colors"
              >
                <SlidersHorizontal size={14} />
                Filters
                {activeFilterCount > 0 && (
                  <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white leading-none" style={{ backgroundColor: BRAND }}>
                    {activeFilterCount}
                  </span>
                )}
              </button>

              {/* Search */}
              <div className="relative flex-1 max-w-sm">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search developments…"
                  className="w-full pl-9 pr-8 py-2 text-sm bg-white border border-slate-200 rounded-lg outline-none focus:ring-2 transition-all placeholder:text-slate-400"
                  style={{ "--tw-ring-color": BRAND } as React.CSSProperties}
                />
                {search && (
                  <button onClick={() => setSearch("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Hide last available */}
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div
                  onClick={() => setHideSingle(v => !v)}
                  className="relative w-9 h-5 rounded-full transition-colors duration-200"
                  style={{ backgroundColor: hideSingle ? BRAND : "#e2e8f0" }}
                >
                  <span className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform duration-200 ${hideSingle ? "translate-x-4" : ""}`} />
                </div>
                <span className="text-sm text-slate-600 whitespace-nowrap">Hide last available</span>
              </label>
            </div>

            {/* Count */}
            {!loading && (
              <p className="text-sm text-slate-500 mb-4">
                <span className="font-semibold text-slate-800">{totalUnits.toLocaleString("fr-FR")}</span> available
                <span className="ml-2 text-slate-400">
                  — {filtered.length} development{filtered.length !== 1 ? "s" : ""}
                  {filtered.length > PAGE_SIZE && `, page ${page} / ${Math.ceil(filtered.length / PAGE_SIZE)}`}
                </span>
              </p>
            )}

            {/* Active filter chips */}
            {activeFilterCount > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {filters.cities.map(c => (
                  <FilterChip key={c} label={c} onRemove={() => setFilters(f => ({ ...f, cities: f.cities.filter(x => x !== c) }))} />
                ))}
                {filters.types.map(t => (
                  <FilterChip key={t} label={t} onRemove={() => setFilters(f => ({ ...f, types: f.types.filter(x => x !== t) }))} />
                ))}
                {filters.minPrice && (
                  <FilterChip label={`Min ${parseInt(filters.minPrice).toLocaleString("fr-FR")} €`} onRemove={() => setFilters(f => ({ ...f, minPrice: "" }))} />
                )}
                {filters.maxPrice && (
                  <FilterChip label={`Max ${parseInt(filters.maxPrice).toLocaleString("fr-FR")} €`} onRemove={() => setFilters(f => ({ ...f, maxPrice: "" }))} />
                )}
                {filters.beds > 0 && (
                  <FilterChip label={`${filters.beds}+ beds`} onRemove={() => setFilters(f => ({ ...f, beds: 0 }))} />
                )}
                {filters.baths > 0 && (
                  <FilterChip label={`${filters.baths}+ baths`} onRemove={() => setFilters(f => ({ ...f, baths: 0 }))} />
                )}
                {filters.surfaceMin && (
                  <FilterChip label={`≥ ${filters.surfaceMin} m²`} onRemove={() => setFilters(f => ({ ...f, surfaceMin: "" }))} />
                )}
                {filters.pool && (
                  <FilterChip label="Pool" onRemove={() => setFilters(f => ({ ...f, pool: false }))} />
                )}
                {filters.seaMax && (
                  <FilterChip label={`Sea ≤ ${filters.seaMax} km`} onRemove={() => setFilters(f => ({ ...f, seaMax: "" }))} />
                )}
                {filters.golfMax && (
                  <FilterChip label={`Golf ≤ ${filters.golfMax} km`} onRemove={() => setFilters(f => ({ ...f, golfMax: "" }))} />
                )}
              </div>
            )}

            {/* Grid */}
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl border border-gray-100 animate-pulse">
                    <div className="h-48 bg-gray-100 rounded-t-2xl" />
                    <div className="p-4 space-y-3">
                      <div className="h-4 bg-gray-100 rounded w-2/3" />
                      <div className="h-3 bg-gray-100 rounded w-1/3" />
                      <div className="flex gap-2 mt-2">
                        {[0, 1, 2, 3].map(j => <div key={j} className="w-8 h-8 rounded-full bg-gray-100" />)}
                      </div>
                      <div className="h-10 bg-gray-100 rounded mt-2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20 text-slate-400">
                <p className="text-sm">No developments match your filters.</p>
                {(search || activeFilterCount > 0) && (
                  <button
                    onClick={() => { setSearch(""); setFilters(DEFAULT_FILTERS); }}
                    className="mt-3 text-xs hover:underline"
                    style={{ color: BRAND }}
                  >
                    Clear all filters
                  </button>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {paginated.map(dev => <DevCard key={dev.devId} dev={dev} />)}
                </div>
                <Pagination page={page} total={filtered.length} onChange={goToPage} />
              </>
            )}
          </div>
        </div>
      </div>

      <Footer />

      {/* Mobile filter drawer */}
      {showFilters && (
        <div className="fixed inset-0 z-[200] lg:hidden">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowFilters(false)}
          />
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[90vw] bg-white flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 shrink-0">
              <span className="font-semibold text-slate-800">Filters</span>
              <button onClick={() => setShowFilters(false)} className="text-slate-400 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <FilterSidebar
                filters={filters}
                onChange={setFilters}
                allCities={allCities}
                allTypes={allTypes}
              />
            </div>
            <div className="px-4 py-3 border-t border-slate-100 shrink-0">
              <button
                onClick={() => setShowFilters(false)}
                className="w-full py-2.5 text-white text-sm font-semibold rounded-lg transition-opacity hover:opacity-90"
                style={{ backgroundColor: BRAND }}
              >
                Show {filtered.length} result{filtered.length !== 1 ? "s" : ""}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
