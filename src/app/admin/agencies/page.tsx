"use client";

import { useState } from "react";
import AgencyDashboard from "@/components/admin/AgencyDashboard";

export default function AgenciesPage() {
  const [password, setPassword] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // ✅ Le mot de passe est directement vérifié ici
    if (password === "Lea_Iris_171213!") {
      setIsAuthorized(true);
      setError("");
    } else {
      setError("Mot de passe incorrect");
      setPassword("");
    }
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <form onSubmit={handleLogin} className="bg-white p-8 rounded-2xl shadow-lg w-96">
          <h1 className="text-2xl font-bold mb-2 text-center">Accès Administration</h1>
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
      <AgencyDashboard />
    </main>
  );
}