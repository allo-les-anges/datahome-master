"use client";

import { useState, useEffect } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";

const STORAGE_KEY = "dev_portal_access";
const PASSWORD    = "Test123=";
const BRAND       = "#D4AF37";

export default function PasswordGate({ children }: { children: React.ReactNode }) {
  const [unlocked, setUnlocked] = useState(false);
  const [input, setInput]       = useState("");
  const [error, setError]       = useState(false);
  const [showPw, setShowPw]     = useState(false);
  const [mounted, setMounted]   = useState(false);

  useEffect(() => {
    setMounted(true);
    if (sessionStorage.getItem(STORAGE_KEY) === "1") {
      setUnlocked(true);
    }
  }, []);

  if (!mounted) return null;
  if (unlocked) return <>{children}</>;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (input === PASSWORD) {
      sessionStorage.setItem(STORAGE_KEY, "1");
      setUnlocked(true);
    } else {
      setError(true);
      setInput("");
      setTimeout(() => setError(false), 2500);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        {/* Logo area */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mb-4 shadow-md"
            style={{ backgroundColor: BRAND }}
          >
            <Lock size={22} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Accès restreint</h1>
          <p className="text-sm text-slate-500 mt-1 text-center">Entrez le mot de passe pour accéder à cette section.</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-4">
          <div className="relative">
            <input
              autoFocus
              type={showPw ? "text" : "password"}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Mot de passe"
              className={`w-full px-4 py-3 pr-10 text-sm border rounded-xl outline-none transition-colors ${
                error
                  ? "border-red-400 bg-red-50 placeholder:text-red-300"
                  : "border-slate-200 focus:border-[#D4AF37]"
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPw(v => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
            </button>
          </div>

          {error && (
            <p className="text-xs text-red-500 text-center -mt-1">Mot de passe incorrect.</p>
          )}

          <button
            type="submit"
            className="w-full py-3 text-white text-sm font-semibold rounded-xl transition-opacity hover:opacity-90"
            style={{ backgroundColor: BRAND }}
          >
            Accéder
          </button>
        </form>
      </div>
    </div>
  );
}
