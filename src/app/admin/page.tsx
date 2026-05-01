// src/app/admin/page.tsx
"use client";

import { useEffect, useState } from "react";

export default function AdminRoot() {
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const checkAuth = async (pwd: string) => {
    try {
      const res = await fetch('/api/admin/check', {
        headers: {
          'x-admin-secret': pwd
        }
      });
      
      if (res.ok) {
        sessionStorage.setItem('admin_auth', 'true');
        sessionStorage.setItem('admin_secret', pwd);
        setIsAuthorized(true);
        setError("");
      } else {
        setError("Mot de passe incorrect");
      }
    } catch (err) {
      setError("Erreur de connexion");
    }
  };

  useEffect(() => {
    const isAuth = sessionStorage.getItem('admin_auth');
    const savedSecret = sessionStorage.getItem('admin_secret');
    
    if (isAuth === 'true' && savedSecret) {
      // Vérifier que le secret est toujours valide
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
          <h1 className="text-2xl font-bold mb-2 text-center">Accès Administration</h1>
          <p className="text-slate-500 text-sm text-center mb-6">Espace sécurisé DataHome</p>
          
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
        <div className="flex items-center gap-3">
          <img src="/logo-data-home.jpeg" alt="DataHome" className="h-10 w-10 rounded-xl object-cover" />
          <h1 className="text-2xl font-bold">Tableau de bord Administration</h1>
        </div>
        <button
          onClick={() => {
            sessionStorage.removeItem('admin_auth');
            sessionStorage.removeItem('admin_secret');
            setIsAuthorized(false);
          }}
          className="text-sm text-slate-500 hover:text-red-500 transition-colors"
        >
          Se déconnecter
        </button>
      </div>
      <p className="text-slate-600">Bienvenue dans votre espace de gestion DataHome.</p>
    </div>
  );
}