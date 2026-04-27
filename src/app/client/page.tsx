'use client';

import { Suspense, useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

const BRAND = '#D4AF37';

const i18n = {
  fr: {
    title: 'Votre espace est en cours de configuration',
    subtitle: 'Notre équipe valide votre dossier sous 24h.',
    back: "Retour à l'accueil",
  },
  en: {
    title: 'Your space is being set up',
    subtitle: 'Our team will validate your file within 24 hours.',
    back: 'Back to home',
  },
  nl: {
    title: 'Uw ruimte wordt geconfigureerd',
    subtitle: 'Ons team valideert uw dossier binnen 24 uur.',
    back: 'Terug naar home',
  },
} as const;

type Lang = keyof typeof i18n;

function detectLang(param: string | null): Lang {
  if (param && param in i18n) return param as Lang;
  if (typeof navigator !== 'undefined') {
    const nav = navigator.language.slice(0, 2).toLowerCase();
    if (nav in i18n) return nav as Lang;
  }
  return 'fr';
}

function ClientContent() {
  const searchParams = useSearchParams();
  const [lang, setLang] = useState<Lang>('fr');

  useEffect(() => {
    setLang(detectLang(searchParams.get('lang')));
  }, [searchParams]);

  const t = i18n[lang];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 w-full max-w-md p-8 flex flex-col items-center gap-6 text-center">

        {/* Logo */}
        <div className="text-2xl font-black tracking-tight" style={{ color: BRAND }}>
          DATA<span className="text-slate-800">home</span>
        </div>

        {/* Animated loader */}
        <Loader2
          size={48}
          className="animate-spin"
          style={{ color: BRAND }}
        />

        {/* Messages */}
        <div>
          <h1 className="text-lg font-semibold text-slate-800 mb-2">{t.title}</h1>
          <p className="text-sm text-slate-500">{t.subtitle}</p>
        </div>

        {/* Back link */}
        <a
          href="/"
          className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
        >
          {t.back} →
        </a>
      </div>
    </div>
  );
}

export default function ClientPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin" style={{ color: BRAND }} />
      </div>
    }>
      <ClientContent />
    </Suspense>
  );
}
