"use client";

import React, { useState, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useParams } from 'next/navigation'; // Ajout pour détecter le slug

interface CookieBannerProps {
  enabled: boolean;
  agencyName: string;
}

export default function CookieBanner({ enabled, agencyName }: CookieBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const params = useParams(); // Récupère le slug de l'URL (ex: /agency/ma-super-agence)

  useEffect(() => {
    // On vérifie si l'utilisateur a déjà fait un choix
    const consent = localStorage.getItem('cookie-consent');
    if (enabled && !consent) {
      const timer = setTimeout(() => setIsVisible(true), 2000); 
      return () => clearTimeout(timer);
    }
  }, [enabled]);

  const handleConsent = (accept: boolean) => {
    localStorage.setItem('cookie-consent', accept ? 'accepted' : 'declined');
    setIsVisible(false);
  };

  // On construit l'URL vers la page privacy relative à l'agence actuelle
  // Si on est dans /agency/[slug], cela pointera vers /agency/[slug]/privacy
  const privacyUrl = params?.slug ? `/agency/${params.slug}/privacy` : "#";

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-[100] p-4 md:p-8 animate-in slide-in-from-bottom duration-500">
      <div className="max-w-4xl mx-auto bg-slate-900 border border-white/10 rounded-[2.5rem] p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="bg-blue-500/20 p-4 rounded-2xl">
            <ShieldCheck className="text-blue-400" size={32} />
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h3 className="text-white font-bold text-lg mb-1">Respect de votre vie privée</h3>
            <p className="text-slate-400 text-sm leading-relaxed">
              {agencyName} utilise des cookies pour améliorer votre expérience et analyser le trafic. 
              Consultez notre <a href={privacyUrl} className="text-white underline underline-offset-4 hover:text-blue-400 transition-colors">politique de confidentialité</a> pour en savoir plus.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <button 
              onClick={() => handleConsent(false)}
              className="px-6 py-3 rounded-xl text-slate-400 text-xs font-bold uppercase tracking-widest hover:text-white transition-colors"
            >
              Refuser
            </button>
            <button 
              onClick={() => handleConsent(true)}
              className="px-8 py-3 bg-white text-slate-900 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-blue-400 hover:text-white transition-all shadow-lg"
            >
              Accepter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}