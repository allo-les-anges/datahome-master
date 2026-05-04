"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AgencyDashboard from "@/components/admin/AgencyDashboard";

export default function AgenciesPage() {
  const [password, setPassword] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState("");

  const checkAuth = async (pwd: string) => {
    const res = await fetch('/api/admin/check', { headers: { 'x-admin-secret': pwd } });
    if (res.ok) {
      sessionStorage.setItem('admin_auth', 'true');
      sessionStorage.setItem('admin_secret', pwd);
      setIsAuthorized(true);
      setError("");
    } else {
      setError("Mot de passe incorrect");
      setPassword("");
    }
  };

  useEffect(() => {
    const savedSecret = sessionStorage.getItem('admin_secret');
    if (sessionStorage.getItem('admin_auth') === 'true' && savedSecret) {
      checkAuth(savedSecret);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    checkAuth(password);
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-lg w-96">
          <img src="/logo-data-home.jpeg" alt="DataHome" className="h-20 w-auto object-contain mx-auto mb-5 rounded-xl" />
          <h1 className="text-2xl font-bold mb-2 text-center">AccÃ¨s Administration</h1>
          <p className="text-slate-500 text-sm text-center mb-6">Configuration des agences</p>
          
          <input
            type="password"
            placeholder="Mot de passe"
            className="w-full p-3 border border-slate-200 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-slate-900"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoFocus
          />
          
          {error && (
            <p className="text-red-500 text-sm mb-4 text-center">{error}</p>
          )}
          
          <button 
            type="submit" 
            className="w-full bg-slate-900 text-white py-3 rounded-xl hover:bg-slate-800 transition-colors font-bold"
          >
            Se connecter
          </button>
        </form>
      </div>
    );
  }

  return (
    <main className="p-4">
      <div className="flex justify-end mb-2 px-4">
        <Link
          href="/admin/leads"
          className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl hover:bg-slate-700 transition-all"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          Leads
        </Link>
      </div>
      <AgencyDashboard />
    </main>
  );
}

