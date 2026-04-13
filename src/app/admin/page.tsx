// src/app/admin/page.tsx
"use client";

import { useState, useEffect } from "react";

export default function AdminRoot() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    // Vérifier si déjà authentifié dans cette session
    const isAuth = sessionStorage.getItem('admin_auth');
    if (isAuth === 'true') {
      setIsAuthorized(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === "Lea_Iris_171213!") {
      sessionStorage.setItem('admin_auth', 'true');
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
          <p className="text-slate-500 text-sm text-center mb-6">Espace sécurisé HabiHub</p>
          
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
    <div className="p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Tableau de bord Administration</h1>
        <button
          onClick={() => {
            sessionStorage.removeItem('admin_auth');
            setIsAuthorized(false);
          }}
          className="text-sm text-slate-500 hover:text-red-500 transition-colors"
        >
          Se déconnecter
        </button>
      </div>
      <p className="text-slate-600">Bienvenue dans votre espace de gestion HabiHub.</p>
      {/* Vous pouvez ajouter ici vos composants de statistiques ou de raccourcis */}
    </div>
  );
}