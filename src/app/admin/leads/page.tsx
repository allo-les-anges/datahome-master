"use client";

import { useState, useEffect, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { Users, UserCheck, TrendingUp, Phone, Mail, MapPin, Clock, Briefcase, RefreshCw, ChevronDown, Building2 } from "lucide-react";
import Link from "next/link";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const PASSWORD = "Lea_Iris_171213!";

const STATUS_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  new:       { label: "Nouveau",   color: "text-blue-700",  bg: "bg-blue-50 border-blue-200" },
  contacted: { label: "Contacté",  color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
  converted: { label: "Converti",  color: "text-green-700", bg: "bg-green-50 border-green-200" },
};

const STATUS_NEXT: Record<string, string> = {
  new: "contacted",
  contacted: "converted",
  converted: "new",
};

export default function LeadsDashboard() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const [agencies, setAgencies] = useState<any[]>([]);
  const [selectedAgencyId, setSelectedAgencyId] = useState<string>("all");
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === PASSWORD) {
      sessionStorage.setItem("admin_leads_auth", "true");
      setIsAuthorized(true);
      setError("");
    } else {
      setError("Mot de passe incorrect");
      setPassword("");
    }
  };

  useEffect(() => {
    if (sessionStorage.getItem("admin_leads_auth") === "true") setIsAuthorized(true);
  }, []);

  useEffect(() => {
    if (!isAuthorized) return;
    supabase
      .from("agency_settings")
      .select("id, agency_name, subdomain")
      .order("agency_name")
      .then(({ data }) => setAgencies(data || []));
  }, [isAuthorized]);

  const fetchLeads = useCallback(async () => {
    setLoading(true);
    let query = supabase
      .from("leads")
      .select("*, agency_settings(agency_name, subdomain)")
      .order("created_at", { ascending: false });

    if (selectedAgencyId !== "all") query = query.eq("agency_id", selectedAgencyId);
    if (statusFilter !== "all") query = query.eq("status", statusFilter);

    const { data } = await query.limit(200);
    setLeads(data || []);
    setLoading(false);
  }, [selectedAgencyId, statusFilter]);

  useEffect(() => {
    if (isAuthorized) fetchLeads();
  }, [isAuthorized, fetchLeads]);

  const updateStatus = async (leadId: string, newStatus: string) => {
    setUpdatingId(leadId);
    await supabase.from("leads").update({ status: newStatus }).eq("id", leadId);
    setLeads(prev => prev.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
    setUpdatingId(null);
  };

  const allLeads = leads;
  const stats = {
    total: allLeads.length,
    new: allLeads.filter(l => l.status === "new").length,
    contacted: allLeads.filter(l => l.status === "contacted").length,
    converted: allLeads.filter(l => l.status === "converted").length,
  };

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-lg w-96">
          <h1 className="text-2xl font-bold mb-2 text-center">Accès Leads</h1>
          <p className="text-slate-500 text-sm text-center mb-6">Dashboard leads qualifiés</p>
          <input
            type="password"
            placeholder="Mot de passe"
            className="w-full p-3 border border-slate-200 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-slate-900"
            value={password}
            onChange={e => setPassword(e.target.value)}
            autoFocus
          />
          {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}
          <button type="submit" className="w-full bg-slate-900 text-white py-3 rounded-xl hover:bg-slate-800 transition-colors font-bold">
            Se connecter
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-6">
          <h1 className="text-lg font-black uppercase tracking-widest text-slate-900">Leads Dashboard</h1>
          <nav className="flex items-center gap-1">
            <Link href="/admin/agencies" className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-xl transition-all flex items-center gap-2">
              <Building2 size={14} /> Agences
            </Link>
            <span className="px-4 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-900 bg-slate-100 rounded-xl flex items-center gap-2">
              <Users size={14} /> Leads
            </span>
          </nav>
        </div>
        <button
          onClick={() => { sessionStorage.removeItem("admin_leads_auth"); setIsAuthorized(false); }}
          className="text-xs text-slate-400 hover:text-red-500 transition-colors"
        >
          Déconnexion
        </button>
      </div>

      <div className="max-w-7xl mx-auto px-8 py-10 space-y-8">

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Total leads", value: stats.total, icon: Users, color: "text-slate-700", bg: "bg-white" },
            { label: "Nouveaux", value: stats.new, icon: UserCheck, color: "text-blue-700", bg: "bg-blue-50" },
            { label: "Contactés", value: stats.contacted, icon: Phone, color: "text-amber-700", bg: "bg-amber-50" },
            { label: "Convertis", value: stats.converted, icon: TrendingUp, color: "text-green-700", bg: "bg-green-50" },
          ].map(s => (
            <div key={s.label} className={`${s.bg} p-6 rounded-[2rem] border border-slate-200 shadow-sm flex items-center gap-4`}>
              <div className={`w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm`}>
                <s.icon size={22} className={s.color} />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{s.label}</p>
                <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Filtres */}
        <div className="bg-white p-6 rounded-[2rem] border border-slate-200 shadow-sm flex flex-wrap items-center gap-4">
          {/* Agence */}
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Agence</label>
            <div className="relative">
              <select
                value={selectedAgencyId}
                onChange={e => setSelectedAgencyId(e.target.value)}
                className="appearance-none bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold text-slate-700 pr-8 focus:outline-none focus:ring-2 focus:ring-slate-900"
              >
                <option value="all">Toutes les agences</option>
                {agencies.map(a => (
                  <option key={a.id} value={a.id}>{a.agency_name}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Statut */}
          <div className="flex items-center gap-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Statut</label>
            <div className="flex gap-1">
              {[
                { value: "all", label: "Tous" },
                { value: "new", label: "Nouveaux" },
                { value: "contacted", label: "Contactés" },
                { value: "converted", label: "Convertis" },
              ].map(f => (
                <button
                  key={f.value}
                  onClick={() => setStatusFilter(f.value)}
                  className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${statusFilter === f.value ? "bg-slate-900 text-white" : "bg-slate-50 text-slate-400 hover:text-slate-700"}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={fetchLeads}
            className="ml-auto flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-[10px] font-bold uppercase tracking-widest text-slate-500 transition-all"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} /> Actualiser
          </button>
        </div>

        {/* Table */}
        <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <RefreshCw size={24} className="animate-spin text-slate-300" />
            </div>
          ) : leads.length === 0 ? (
            <div className="text-center py-24">
              <Users size={40} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-400 text-sm font-bold uppercase tracking-widest">Aucun lead trouvé</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-100">
                    {["Nom", "Contact", "Projet", "Budget", "Localisation", "Délai", "Agence", "Date", "Statut"].map(h => (
                      <th key={h} className="px-5 py-4 text-left text-[9px] font-black uppercase tracking-widest text-slate-400">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead, i) => {
                    const s = STATUS_LABELS[lead.status] || STATUS_LABELS.new;
                    return (
                      <tr key={lead.id} className={`border-b border-slate-50 hover:bg-slate-50/50 transition-colors ${i % 2 === 0 ? "" : "bg-slate-50/30"}`}>
                        <td className="px-5 py-4">
                          <p className="font-bold text-slate-900 text-sm">{lead.full_name || "—"}</p>
                        </td>
                        <td className="px-5 py-4 space-y-1">
                          {lead.email && (
                            <a href={`mailto:${lead.email}`} className="flex items-center gap-1.5 text-xs text-blue-600 hover:underline">
                              <Mail size={11} /> {lead.email}
                            </a>
                          )}
                          {lead.phone && (
                            <a href={`tel:${lead.phone}`} className="flex items-center gap-1.5 text-xs text-slate-600 hover:underline">
                              <Phone size={11} /> {lead.phone}
                            </a>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <span className="flex items-center gap-1.5 text-xs text-slate-600">
                            <Briefcase size={11} /> {lead.project_type || "—"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs font-bold text-slate-700">{lead.budget || "—"}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="flex items-center gap-1.5 text-xs text-slate-600">
                            <MapPin size={11} /> {lead.location || "—"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="flex items-center gap-1.5 text-xs text-slate-600">
                            <Clock size={11} /> {lead.delay || "—"}
                          </span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs text-slate-400">{lead.agency_settings?.agency_name || "—"}</span>
                        </td>
                        <td className="px-5 py-4">
                          <span className="text-xs text-slate-400 whitespace-nowrap">{formatDate(lead.created_at)}</span>
                        </td>
                        <td className="px-5 py-4">
                          <button
                            onClick={() => updateStatus(lead.id, STATUS_NEXT[lead.status] || "new")}
                            disabled={updatingId === lead.id}
                            className={`px-3 py-1.5 rounded-xl border text-[10px] font-bold uppercase tracking-widest transition-all hover:scale-105 active:scale-95 ${s.bg} ${s.color} ${updatingId === lead.id ? "opacity-50" : ""}`}
                          >
                            {updatingId === lead.id ? "..." : s.label}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
