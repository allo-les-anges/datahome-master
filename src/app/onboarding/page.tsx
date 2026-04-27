'use client';

import React, { Suspense, useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2, Palette, Globe, Rocket,
  ShieldCheck, ArrowRight, Loader2, AlertCircle,
  Upload, Sparkles, Clock, Star, Zap, Lock,
} from 'lucide-react';

// ─── i18n ──────────────────────────────────────────────────────────────────────
const i18n = {
  fr: {
    title: "Vérification de sécurité", welcome: "Bonjour", otp_instruction: "veuillez saisir le code reçu par email pour votre agence",
    otp_placeholder: "Code à 6 chiffres", validate: "Valider l'accès Premium",
    step_branding: "Identité Visuelle", step_branding_title: "Personnalisez votre espace",
    field_agency: "Nom de l'agence", field_subdomain: "Sous-domaine (URL)", field_color: "Couleur primaire",
    field_lang: "Langue par défaut", field_logo: "Logo (optionnel)",
    step_content: "Contenu & Flux", step_content_title: "Détails de l'Agence",
    field_hero: "Slogan (Hero Title)", field_xml: "Flux XML Propriétés",
    field_whatsapp: "WhatsApp", field_facebook: "Lien Facebook",
    next: "Étape suivante", back: "Retour", launch: "Lancer mon essai gratuit",
    trial_title: "Votre essai démarre !", trial_sub: "Notre équipe met votre agence en ligne sous 24h.",
    trial_days: "15 jours offerts", trial_f1: "Site immobilier personnalisé", trial_f2: "Property Manager",
    trial_f3: "Mini CRM inclus", trial_f4: "Support prioritaire",
    trial_expires: "Essai valable jusqu'au",
    go_dashboard: "Accéder à mon espace",
    error_otp: "Code invalide ou expiré.", error_subdomain: "Ce sous-domaine est déjà utilisé.",
    error_generic: "Une erreur est survenue.",
    step_of: "Étape {current} sur {total}",
  },
  en: {
    title: "Security Verification", welcome: "Hello", otp_instruction: "please enter the code received by email for your agency",
    otp_placeholder: "6-digit code", validate: "Validate Premium Access",
    step_branding: "Visual Identity", step_branding_title: "Personalize your space",
    field_agency: "Agency Name", field_subdomain: "Subdomain (URL)", field_color: "Primary color",
    field_lang: "Default language", field_logo: "Logo (optional)",
    step_content: "Content & Feeds", step_content_title: "Agency Details",
    field_hero: "Tagline (Hero Title)", field_xml: "XML Property Feed",
    field_whatsapp: "WhatsApp", field_facebook: "Facebook Link",
    next: "Next step", back: "Back", launch: "Start my free trial",
    trial_title: "Your trial starts!", trial_sub: "Our team will set up your agency within 24 hours.",
    trial_days: "15 days free", trial_f1: "Custom real estate site", trial_f2: "Property Manager",
    trial_f3: "Mini CRM included", trial_f4: "Priority support",
    trial_expires: "Trial valid until",
    go_dashboard: "Access my space",
    error_otp: "Invalid or expired code.", error_subdomain: "This subdomain is already taken.",
    error_generic: "An error occurred.",
    step_of: "Step {current} of {total}",
  },
  es: {
    title: "Verificación de seguridad", welcome: "Hola", otp_instruction: "ingrese el código recibido por correo electrónico para su agencia",
    otp_placeholder: "Código de 6 dígitos", validate: "Validar acceso Premium",
    step_branding: "Identidad Visual", step_branding_title: "Personalice su espacio",
    field_agency: "Nombre de la agencia", field_subdomain: "Subdominio (URL)", field_color: "Color primario",
    field_lang: "Idioma predeterminado", field_logo: "Logo (opcional)",
    step_content: "Contenido y Feeds", step_content_title: "Detalles de la Agencia",
    field_hero: "Eslogan (Hero Title)", field_xml: "Feed XML de propiedades",
    field_whatsapp: "WhatsApp", field_facebook: "Enlace de Facebook",
    next: "Siguiente paso", back: "Atrás", launch: "Iniciar mi prueba gratuita",
    trial_title: "¡Su prueba comienza!", trial_sub: "Nuestro equipo publicará su agencia en 24 horas.",
    trial_days: "15 días gratuitos", trial_f1: "Sitio inmobiliario personalizado", trial_f2: "Property Manager",
    trial_f3: "Mini CRM incluido", trial_f4: "Soporte prioritario",
    trial_expires: "Prueba válida hasta el",
    go_dashboard: "Acceder a mi espacio",
    error_otp: "Código inválido o expirado.", error_subdomain: "Este subdominio ya está en uso.",
    error_generic: "Se produjo un error.",
    step_of: "Paso {current} de {total}",
  },
  nl: {
    title: "Beveiligingscontrole", welcome: "Hallo", otp_instruction: "voer de code in die u per e-mail hebt ontvangen voor uw agentschap",
    otp_placeholder: "6-cijferige code", validate: "Premium toegang valideren",
    step_branding: "Visuele Identiteit", step_branding_title: "Personaliseer uw ruimte",
    field_agency: "Naam van het agentschap", field_subdomain: "Subdomein (URL)", field_color: "Primaire kleur",
    field_lang: "Standaardtaal", field_logo: "Logo (optioneel)",
    step_content: "Inhoud & Feeds", step_content_title: "Details van het Agentschap",
    field_hero: "Slogan (Hero Title)", field_xml: "XML Vastgoedfeed",
    field_whatsapp: "WhatsApp", field_facebook: "Facebook-link",
    next: "Volgende stap", back: "Terug", launch: "Start mijn gratis proefperiode",
    trial_title: "Uw proef begint!", trial_sub: "Ons team zet uw agentschap binnen 24 uur online.",
    trial_days: "15 dagen gratis", trial_f1: "Gepersonaliseerde vastgoedsite", trial_f2: "Property Manager",
    trial_f3: "Mini CRM inbegrepen", trial_f4: "Prioriteitsondersteuning",
    trial_expires: "Proef geldig tot",
    go_dashboard: "Toegang tot mijn ruimte",
    error_otp: "Ongeldige of verlopen code.", error_subdomain: "Dit subdomein is al in gebruik.",
    error_generic: "Er is een fout opgetreden.",
    step_of: "Stap {current} van {total}",
  },
  de: {
    title: "Sicherheitsüberprüfung", welcome: "Hallo", otp_instruction: "bitte geben Sie den per E-Mail erhaltenen Code für Ihre Agentur ein",
    otp_placeholder: "6-stelliger Code", validate: "Premium-Zugang validieren",
    step_branding: "Visuelle Identität", step_branding_title: "Personalisieren Sie Ihren Bereich",
    field_agency: "Name der Agentur", field_subdomain: "Subdomain (URL)", field_color: "Primärfarbe",
    field_lang: "Standardsprache", field_logo: "Logo (optional)",
    step_content: "Inhalt & Feeds", step_content_title: "Agenturdetails",
    field_hero: "Slogan (Hero Title)", field_xml: "XML-Immobilien-Feed",
    field_whatsapp: "WhatsApp", field_facebook: "Facebook-Link",
    next: "Nächster Schritt", back: "Zurück", launch: "Meine kostenlose Testversion starten",
    trial_title: "Ihre Testversion beginnt!", trial_sub: "Unser Team richtet Ihre Agentur innerhalb von 24 Stunden ein.",
    trial_days: "15 Tage kostenlos", trial_f1: "Personalisierte Immobilien-Website", trial_f2: "Property Manager",
    trial_f3: "Mini CRM inklusive", trial_f4: "Prioritäts-Support",
    trial_expires: "Test gültig bis",
    go_dashboard: "Zugang zu meinem Bereich",
    error_otp: "Ungültiger oder abgelaufener Code.", error_subdomain: "Diese Subdomain ist bereits vergeben.",
    error_generic: "Ein Fehler ist aufgetreten.",
    step_of: "Schritt {current} von {total}",
  },
  pl: {
    title: "Weryfikacja bezpieczeństwa", welcome: "Witaj", otp_instruction: "wprowadź kod otrzymany e-mailem dla swojej agencji",
    otp_placeholder: "Kod 6-cyfrowy", validate: "Zatwierdź dostęp Premium",
    step_branding: "Tożsamość wizualna", step_branding_title: "Personalizuj swój obszar",
    field_agency: "Nazwa agencji", field_subdomain: "Subdomena (URL)", field_color: "Kolor podstawowy",
    field_lang: "Język domyślny", field_logo: "Logo (opcjonalne)",
    step_content: "Treść i kanały", step_content_title: "Szczegóły agencji",
    field_hero: "Slogan (Hero Title)", field_xml: "Kanał XML nieruchomości",
    field_whatsapp: "WhatsApp", field_facebook: "Link do Facebooka",
    next: "Następny krok", back: "Wstecz", launch: "Rozpocznij bezpłatny okres próbny",
    trial_title: "Twój okres próbny się zaczyna!", trial_sub: "Nasz zespół uruchomi Twoją agencję w ciągu 24 godzin.",
    trial_days: "15 dni za darmo", trial_f1: "Spersonalizowana strona nieruchomości", trial_f2: "Property Manager",
    trial_f3: "Mini CRM w zestawie", trial_f4: "Wsparcie priorytetowe",
    trial_expires: "Okres próbny ważny do",
    go_dashboard: "Dostęp do mojego obszaru",
    error_otp: "Nieprawidłowy lub wygasły kod.", error_subdomain: "Ta subdomena jest już zajęta.",
    error_generic: "Wystąpił błąd.",
    step_of: "Krok {current} z {total}",
  },
} as const;

type Lang = keyof typeof i18n;
const LANGS = Object.keys(i18n) as Lang[];

function ShimmerButton({ onClick, disabled, loading, children, color = '#c5a059' }: {
  onClick?: () => void; disabled?: boolean; loading?: boolean; children: React.ReactNode; color?: string;
}) {
  return (
    <button type="button" onClick={onClick} disabled={disabled}
      className="relative w-full py-4 rounded-2xl font-black text-[11px] tracking-[0.2em] uppercase overflow-hidden transition-all duration-300 active:scale-[0.97] disabled:opacity-40 flex items-center justify-center gap-2 text-black"
      style={{ backgroundColor: color, boxShadow: `0 8px 32px ${color}50` }}>
      <span className="absolute inset-0 pointer-events-none" style={{ background: `linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.4) 50%, transparent 60%)`, backgroundSize: '200% 100%', animation: 'shimmer 2.4s infinite' }} />
      <span className="relative z-10 flex items-center gap-2">{loading ? <Loader2 size={16} className="animate-spin" /> : children}</span>
      <style>{`@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }`}</style>
    </button>
  );
}

function FloatInput({ label, value, onChange, type = 'text', placeholder, mono }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; mono?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const active = focused || value.length > 0;
  return (
    <div className="relative">
      <div className="absolute inset-0 rounded-2xl pointer-events-none transition-all duration-300"
        style={{ boxShadow: focused ? '0 0 0 1.5px rgba(197,160,89,0.5)' : '0 0 0 1px rgba(255,255,255,0.06)' }} />
      <label className="absolute left-4 pointer-events-none select-none transition-all duration-200"
        style={{ top: active ? '0.35rem' : '50%', transform: active ? 'translateY(0) scale(0.72)' : 'translateY(-50%) scale(1)', transformOrigin: 'left top', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: active ? '#c5a059' : 'rgba(255,255,255,0.25)' }}>
        {label}
      </label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
        placeholder={focused ? (placeholder || '') : ''}
        className={`w-full rounded-2xl bg-white/[0.04] border border-white/[0.06] text-white text-sm outline-none transition-all duration-300 placeholder:text-white/20 ${mono ? 'font-mono' : ''}`}
        style={{ paddingTop: '1.5rem', paddingBottom: '0.6rem', paddingLeft: '1rem', paddingRight: '1rem' }} />
    </div>
  );
}

function OnboardingContent() {
  const searchParams = useSearchParams();
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [lang, setLang] = useState<Lang>('fr');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [otp, setOtp] = useState('');
  const [logoPreview, setLogoPreview] = useState<string>('');
  const [trialEndDate, setTrialEndDate] = useState('');

  const [params, setParams] = useState({ email: '', name: '', company: '' });
  const [config, setConfig] = useState({
    agency_name: '', subdomain: '', primary_color: '#c5a059',
    hero_title: 'PROFESSIONALS AT YOUR SERVICE',
    default_lang: 'fr' as Lang,
    facebook: '', whatsapp: '', xml_url: '',
  });

  useEffect(() => {
    const urlLang = (searchParams.get('lang') || 'fr') as Lang;
    const email = searchParams.get('email') || '';
    const name = searchParams.get('name') || '';
    const company = searchParams.get('company') || '';
    const safeLang: Lang = LANGS.includes(urlLang) ? urlLang : 'fr';
    setLang(safeLang);
    setParams({ email, name, company });
    setConfig((prev) => ({
      ...prev, agency_name: company,
      subdomain: company.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      default_lang: safeLang,
    }));
  }, [searchParams]);

  useEffect(() => {
    const d = new Date(Date.now() + 15 * 24 * 60 * 60 * 1000);
    const localeMap: Record<string, string> = { fr: 'fr-FR', en: 'en-GB', es: 'es-ES', nl: 'nl-NL', de: 'de-DE', pl: 'pl-PL' };
    setTrialEndDate(d.toLocaleDateString(localeMap[lang] || 'fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }));
  }, [lang, step]);

  const t = i18n[lang];

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setLogoPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: params.email, otp_code: otp }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) { setError(json.error?.includes('sous-domaine') ? t.error_subdomain : t.error_otp); return; }
      if (json.data?.company_name) {
        setConfig((prev) => ({ ...prev, agency_name: json.data.company_name, subdomain: json.data.company_name.toLowerCase().replace(/[^a-z0-9]+/g, '-') }));
      }
      setStep(2);
    } catch { setError(t.error_generic); } finally { setLoading(false); }
  };

  const handleFinalize = async () => {
    setError(''); setLoading(true);
    try {
      const res = await fetch('/api/create-agency-premium', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: params.email, agency_name: config.agency_name, subdomain: config.subdomain, primary_color: config.primary_color, hero_title: config.hero_title, default_lang: config.default_lang, xml_url: config.xml_url, whatsapp: config.whatsapp, facebook: config.facebook }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) { setError(json.error?.includes('sous-domaine') ? t.error_subdomain : t.error_generic); return; }
      setStep(4);
    } catch { setError(t.error_generic); } finally { setLoading(false); }
  };

  const glassCard = { background: 'linear-gradient(135deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)', border: '1px solid rgba(255,255,255,0.08)' };
  const stepLabel = (t.step_of as string).replace('{current}', String(Math.min(step, 3))).replace('{total}', '3');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden" style={{ background: '#0a0a0a' }}>

      {/* Background ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-[0.07] blur-3xl"
          style={{ background: `radial-gradient(circle, ${config.primary_color} 0%, transparent 70%)` }} />
      </div>

      {/* Lang selector */}
      <div className="absolute top-5 right-5 flex flex-wrap gap-1 max-w-[180px] justify-end z-10">
        {LANGS.map((l) => (
          <button key={l} onClick={() => setLang(l)}
            className="px-2 py-1 text-[9px] font-black rounded-lg border transition-all"
            style={lang === l
              ? { backgroundColor: config.primary_color, color: '#000', border: `1px solid ${config.primary_color}` }
              : { backgroundColor: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.08)' }
            }>
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Phone shell */}
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} className="relative w-full max-w-[420px]">
        <div className="absolute -inset-6 rounded-full opacity-15 blur-3xl pointer-events-none -z-10"
          style={{ background: `radial-gradient(circle, ${config.primary_color} 0%, transparent 70%)` }} />

        <div className="relative rounded-[3.2rem] p-[3px] shadow-2xl"
          style={{ background: `linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02))`, boxShadow: `0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.07)` }}>
          <div className="rounded-[3rem] overflow-hidden" style={{ background: '#111' }}>

            {/* Notch */}
            <div className="flex justify-center pt-4 pb-1">
              <div className="w-28 h-7 rounded-full bg-black flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-white/10" />
                <div className="w-10 h-1.5 rounded-full bg-white/10" />
              </div>
            </div>

            {/* Step indicator */}
            {step < 4 && (
              <div className="mx-6 mb-3 mt-1">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/25">{stepLabel}</p>
                  <div className="flex gap-1">
                    {[1, 2, 3].map((s) => (
                      <div key={s} className="h-1 rounded-full transition-all duration-500"
                        style={{ width: s === step ? '1.5rem' : '0.5rem', backgroundColor: s <= step ? config.primary_color : 'rgba(255,255,255,0.1)' }} />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Content */}
            <div className="px-6 pb-10 min-h-[560px] flex flex-col">
              <AnimatePresence mode="wait">

                {/* STEP 1 : OTP */}
                {step === 1 && (
                  <motion.div key="s1" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="flex-1 flex flex-col">
                    <div className="text-center mb-8">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5"
                        style={{ backgroundColor: `${config.primary_color}18`, border: `1px solid ${config.primary_color}30` }}>
                        <ShieldCheck size={28} style={{ color: config.primary_color }} />
                      </div>
                      <h1 className="text-xl font-light text-white mb-2" style={{ fontFamily: '"Playfair Display", serif', letterSpacing: '-0.02em' }}>
                        {t.title}
                      </h1>
                      <p className="text-xs text-white/40 leading-relaxed">
                        {t.welcome} <span className="text-white/70 font-semibold">{params.name || 'vous'}</span>, {t.otp_instruction}.
                      </p>
                    </div>
                    {error && (
                      <div className="mb-4 flex items-center gap-2 px-4 py-3 rounded-2xl border border-red-900/30 bg-red-900/10 text-red-400 text-xs">
                        <AlertCircle size={14} className="shrink-0" /> {error}
                      </div>
                    )}
                    <form onSubmit={handleVerifyOTP} className="flex flex-col gap-4 flex-1">
                      <div className="relative">
                        <div className="absolute inset-0 rounded-2xl pointer-events-none transition-all duration-300"
                          style={{ boxShadow: otp ? `0 0 0 1.5px ${config.primary_color}60` : '0 0 0 1px rgba(255,255,255,0.06)' }} />
                        <input type="text" inputMode="numeric" placeholder={t.otp_placeholder}
                          className="w-full px-6 py-5 rounded-2xl bg-white/[0.04] text-white text-center text-2xl tracking-[0.5em] font-mono outline-none"
                          maxLength={6} value={otp}
                          onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '')); setError(''); }} required />
                      </div>
                      <ShimmerButton disabled={loading || otp.length !== 6} loading={loading} color={config.primary_color}>
                        <Lock size={15} /> {t.validate}
                      </ShimmerButton>
                    </form>
                  </motion.div>
                )}

                {/* STEP 2 : BRANDING */}
                {step === 2 && (
                  <motion.div key="s2" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="flex-1 flex flex-col gap-4">
                    <div className="text-center">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest mb-3"
                        style={{ backgroundColor: `${config.primary_color}18`, color: config.primary_color, border: `1px solid ${config.primary_color}30` }}>
                        <Palette size={11} /> {t.step_branding}
                      </div>
                      <h2 className="text-lg font-light text-white" style={{ fontFamily: '"Playfair Display", serif' }}>{t.step_branding_title}</h2>
                    </div>
                    {error && (
                      <div className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-red-900/30 bg-red-900/10 text-red-400 text-xs">
                        <AlertCircle size={14} className="shrink-0" /> {error}
                      </div>
                    )}
                    <FloatInput label={t.field_agency} value={config.agency_name} onChange={(v) => setConfig({ ...config, agency_name: v })} />
                    <FloatInput label={t.field_subdomain} value={config.subdomain} mono placeholder="mon-agence"
                      onChange={(v) => setConfig({ ...config, subdomain: v.toLowerCase().replace(/[^a-z0-9-]/g, '') })} />

                    {/* Color + Logo */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-2">{t.field_color}</p>
                        <div className="flex items-center gap-2 p-3 rounded-2xl" style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                          <input type="color" className="w-8 h-8 rounded-lg cursor-pointer border-0 bg-transparent" value={config.primary_color}
                            onChange={(e) => setConfig({ ...config, primary_color: e.target.value })} />
                          <input className="flex-1 bg-transparent text-white text-xs font-mono outline-none uppercase" value={config.primary_color}
                            onChange={(e) => setConfig({ ...config, primary_color: e.target.value })} />
                        </div>
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-2">{t.field_logo}</p>
                        <button type="button" onClick={() => logoInputRef.current?.click()}
                          className="w-full h-[52px] rounded-2xl flex items-center justify-center gap-2 transition-all hover:bg-white/10"
                          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                          {logoPreview
                            ? <img src={logoPreview} className="h-8 w-full object-contain" alt="logo" />
                            : <><Upload size={14} className="text-white/30" /><span className="text-[10px] text-white/30">Upload</span></>}
                        </button>
                        <input ref={logoInputRef} type="file" accept="image/*" className="hidden" onChange={handleLogoChange} />
                      </div>
                    </div>

                    {/* Lang pills */}
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-white/30 mb-2">{t.field_lang}</p>
                      <div className="flex gap-1.5 flex-wrap">
                        {(['fr', 'en', 'es', 'nl', 'de', 'pl'] as Lang[]).map((l) => (
                          <button key={l} type="button" onClick={() => { setConfig({ ...config, default_lang: l }); setLang(l); }}
                            className="px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all"
                            style={config.default_lang === l
                              ? { backgroundColor: config.primary_color, color: '#000' }
                              : { background: 'rgba(255,255,255,0.04)', color: 'rgba(255,255,255,0.3)', border: '1px solid rgba(255,255,255,0.06)' }
                            }>
                            {l}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mt-auto">
                      <ShimmerButton disabled={!config.agency_name || !config.subdomain} onClick={() => setStep(3)} color={config.primary_color}>
                        {t.next} <ArrowRight size={15} />
                      </ShimmerButton>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3 : CONTENT */}
                {step === 3 && (
                  <motion.div key="s3" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }} className="flex-1 flex flex-col gap-4">
                    <div className="text-center">
                      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest mb-3"
                        style={{ backgroundColor: `${config.primary_color}18`, color: config.primary_color, border: `1px solid ${config.primary_color}30` }}>
                        <Globe size={11} /> {t.step_content}
                      </div>
                      <h2 className="text-lg font-light text-white" style={{ fontFamily: '"Playfair Display", serif' }}>{t.step_content_title}</h2>
                    </div>
                    {error && (
                      <div className="flex items-center gap-2 px-4 py-3 rounded-2xl border border-red-900/30 bg-red-900/10 text-red-400 text-xs">
                        <AlertCircle size={14} className="shrink-0" /> {error}
                      </div>
                    )}
                    <FloatInput label={t.field_hero} value={config.hero_title} onChange={(v) => setConfig({ ...config, hero_title: v })} />
                    <FloatInput label={t.field_xml} value={config.xml_url} placeholder="https://..." mono onChange={(v) => setConfig({ ...config, xml_url: v })} />
                    <FloatInput label={t.field_whatsapp} value={config.whatsapp} placeholder="336XXXXXXXX" onChange={(v) => setConfig({ ...config, whatsapp: v })} />
                    <FloatInput label={t.field_facebook} value={config.facebook} placeholder="https://facebook.com/..." onChange={(v) => setConfig({ ...config, facebook: v })} />
                    <div className="mt-auto flex gap-3">
                      <button type="button" onClick={() => { setStep(2); setError(''); }}
                        className="px-5 py-4 rounded-2xl text-xs font-bold text-white/40 hover:bg-white/5 transition-all border border-white/10">
                        {t.back}
                      </button>
                      <div className="flex-1">
                        <ShimmerButton onClick={handleFinalize} loading={loading} color={config.primary_color}>
                          <Rocket size={15} /> {t.launch}
                        </ShimmerButton>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* STEP 4 : SUCCESS */}
                {step === 4 && (
                  <motion.div key="s4" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }} className="flex-1 flex flex-col items-center justify-start pt-2 gap-5">
                    <div className="relative">
                      <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                        className="w-20 h-20 rounded-full flex items-center justify-center mx-auto"
                        style={{ backgroundColor: `${config.primary_color}20`, border: `1px solid ${config.primary_color}40` }}>
                        <CheckCircle2 size={36} style={{ color: config.primary_color }} />
                      </motion.div>
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="absolute -top-1 -right-1">
                        <Sparkles size={18} style={{ color: config.primary_color }} className="animate-pulse" />
                      </motion.div>
                    </div>
                    <div className="text-center">
                      <h1 className="text-2xl font-light text-white mb-1" style={{ fontFamily: '"Playfair Display", serif', letterSpacing: '-0.02em' }}>{t.trial_title}</h1>
                      <p className="text-xs text-white/40 leading-relaxed">{t.trial_sub}</p>
                    </div>

                    {/* Trial card */}
                    <div className="w-full rounded-3xl p-5" style={glassCard}>
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Clock size={13} style={{ color: config.primary_color }} />
                          <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: config.primary_color }}>{t.trial_days}</span>
                        </div>
                        <span className="text-[8px] text-white/25 uppercase tracking-widest font-bold">{t.trial_expires} {trialEndDate}</span>
                      </div>
                      <div className="h-1 rounded-full bg-white/10 mb-4">
                        <div className="h-full w-full rounded-full" style={{ backgroundColor: config.primary_color }} />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {[t.trial_f1, t.trial_f2, t.trial_f3, t.trial_f4].map((feat, i) => (
                          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.08 }} className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0" style={{ backgroundColor: `${config.primary_color}20` }}>
                              <Star size={8} style={{ color: config.primary_color }} />
                            </div>
                            <span className="text-[9px] text-white/50 font-medium">{feat}</span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <div className="w-full">
                      <a href={`/${config.default_lang}/${config.subdomain}/mon-espace`}>
                        <ShimmerButton color={config.primary_color}>
                          <Zap size={15} /> {t.go_dashboard}
                        </ShimmerButton>
                      </a>
                    </div>
                    <p className="text-[9px] text-white/20 text-center uppercase tracking-widest font-bold">{config.agency_name} · {config.subdomain}</p>
                  </motion.div>
                )}

              </AnimatePresence>
            </div>

            {/* Home indicator */}
            <div className="flex justify-center pb-3">
              <div className="w-28 h-1 rounded-full bg-white/10" />
            </div>
          </div>
        </div>
      </motion.div>

      <p className="mt-8 text-[9px] uppercase tracking-[0.3em] font-black" style={{ color: 'rgba(255,255,255,0.15)' }}>
        HabiHub Premium · {lang.toUpperCase()}
      </p>
    </div>
  );
}

export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0a' }}>
        <Loader2 className="animate-spin text-white/20" size={40} />
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  );
}
