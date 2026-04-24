'use client';

import React, { Suspense, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  CheckCircle2, Palette, Globe, Rocket,
  ShieldCheck, ArrowRight, Loader2, AlertCircle,
} from 'lucide-react';

// ─── i18n ─────────────────────────────────────────────────────────────────────
const i18n = {
  fr: { title: "Vérification de sécurité", welcome: "Bonjour", otp_instruction: "veuillez saisir le code reçu par email pour votre agence", otp_placeholder: "Code à 6 chiffres", validate: "Valider l'accès Premium", step_branding: "Identité Visuelle", step_branding_title: "Configurez votre Branding", field_agency: "Nom de l'agence", field_subdomain: "Sous-domaine", field_color: "Couleur Primaire", field_lang: "Langue par défaut", step_content: "Contenu & Flux", step_content_title: "Détails de l'Agence", field_hero: "Titre Principal (Hero Title)", field_xml: "Flux XML Propriétés", field_whatsapp: "WhatsApp", field_facebook: "Lien Facebook", next: "Étape suivante", back: "Retour", launch: "Lancer mon Dashboard", congrats: "Félicitations !", success_msg: "Votre agence est en cours de déploiement.", access_dash: "Accéder à mon Dashboard", error_otp: "Code invalide ou expiré. Vérifiez votre email.", error_subdomain: "Ce sous-domaine est déjà utilisé.", error_generic: "Une erreur est survenue, veuillez réessayer." },
  nl: { title: "Beveiligingscontrole", welcome: "Hallo", otp_instruction: "voer de code in die u per e-mail heeft ontvangen voor uw kantoor", otp_placeholder: "6-cijferige code", validate: "Premium toegang valideren", step_branding: "Visuele Identiteit", step_branding_title: "Configureer uw Branding", field_agency: "Naam van het agentschap", field_subdomain: "Subdomein", field_color: "Primaire kleur", field_lang: "Standaardtaal", step_content: "Inhoud & Feeds", step_content_title: "Details van het Agentschap", field_hero: "Hoofdtitel (Hero Title)", field_xml: "XML Vastgoedfeed", field_whatsapp: "WhatsApp", field_facebook: "Facebook-link", next: "Volgende stap", back: "Terug", launch: "Start mijn Dashboard", congrats: "Gefeliciteerd!", success_msg: "Uw agentschap wordt momenteel geïmplementeerd.", access_dash: "Ga naar mijn Dashboard", error_otp: "Ongeldige of verlopen code.", error_subdomain: "Dit subdomein is al in gebruik.", error_generic: "Er is een fout opgetreden, probeer het opnieuw." },
  en: { title: "Security Verification", welcome: "Hello", otp_instruction: "please enter the code received by email for your agency", otp_placeholder: "6-digit code", validate: "Validate Premium Access", step_branding: "Visual Identity", step_branding_title: "Configure your Branding", field_agency: "Agency Name", field_subdomain: "Subdomain", field_color: "Primary Color", field_lang: "Default Language", step_content: "Content & Feeds", step_content_title: "Agency Details", field_hero: "Hero Title", field_xml: "XML Property Feed", field_whatsapp: "WhatsApp", field_facebook: "Facebook Link", next: "Next Step", back: "Back", launch: "Launch my Dashboard", congrats: "Congratulations!", success_msg: "Your agency is being deployed.", access_dash: "Access my Dashboard", error_otp: "Invalid or expired code. Check your email.", error_subdomain: "This subdomain is already taken.", error_generic: "An error occurred, please try again." },
  es: { title: "Verificación de seguridad", welcome: "Hola", otp_instruction: "por favor ingrese el código recibido por correo electrónico para su agencia", otp_placeholder: "Código de 6 dígitos", validate: "Validar acceso Premium", step_branding: "Identidad Visual", step_branding_title: "Configure su Branding", field_agency: "Nombre de la agencia", field_subdomain: "Subdominio", field_color: "Color primario", field_lang: "Idioma por defecto", step_content: "Contenido y Feeds", step_content_title: "Detalles de la Agencia", field_hero: "Título principal", field_xml: "Feed XML de propiedades", field_whatsapp: "WhatsApp", field_facebook: "Enlace de Facebook", next: "Siguiente paso", back: "Atrás", launch: "Lanzar mi Dashboard", congrats: "¡Felicidades!", success_msg: "Su agencia está siendo desplegada.", access_dash: "Acceder a mi Dashboard", error_otp: "Código inválido o expirado.", error_subdomain: "Este subdominio ya está en uso.", error_generic: "Se produjo un error, inténtelo de nuevo." },
  de: { title: "Sicherheitsüberprüfung", welcome: "Hallo", otp_instruction: "bitte geben Sie den Code ein, den Sie per E-Mail erhalten haben", otp_placeholder: "6-stelliger Code", validate: "Premium-Zugang validieren", step_branding: "Visuelle Identität", step_branding_title: "Konfigurieren Sie Ihr Branding", field_agency: "Name der Agentur", field_subdomain: "Subdomain", field_color: "Primärfarbe", field_lang: "Standardsprache", step_content: "Inhalt & Feeds", step_content_title: "Agenturdetails", field_hero: "Haupttitel (Hero Title)", field_xml: "XML-Immobilien-Feed", field_whatsapp: "WhatsApp", field_facebook: "Facebook-Link", next: "Nächster Schritt", back: "Zurück", launch: "Mein Dashboard starten", congrats: "Herzlichen Glückwunsch!", success_msg: "Ihre Agentur wird gerade bereitgestellt.", access_dash: "Zum Dashboard gehen", error_otp: "Ungültiger oder abgelaufener Code.", error_subdomain: "Diese Subdomain ist bereits vergeben.", error_generic: "Ein Fehler ist aufgetreten, bitte versuchen Sie es erneut." },
  pl: { title: "Weryfikacja bezpieczeństwa", welcome: "Witaj", otp_instruction: "wprowadź kod otrzymany e-mailem dla swojej agencji", otp_placeholder: "Kod 6-cyfrowy", validate: "Zatwierdź dostęp Premium", step_branding: "Tożsamość wizualna", step_branding_title: "Skonfiguruj swój Branding", field_agency: "Nazwa agencji", field_subdomain: "Subdomena", field_color: "Kolor podstawowy", field_lang: "Język domyślny", step_content: "Treść i kanały", step_content_title: "Szczegóły agencji", field_hero: "Tytuł główny", field_xml: "Kanał XML nieruchomości", field_whatsapp: "WhatsApp", field_facebook: "Link do Facebooka", next: "Następny krok", back: "Wstecz", launch: "Uruchom mój Panel", congrats: "Gratulacje!", success_msg: "Twoja agencja jest w trakcie wdrażania.", access_dash: "Przejdź do Panelu", error_otp: "Nieprawidłowy lub wygasły kod.", error_subdomain: "Ta subdomena jest już zajęta.", error_generic: "Wystąpił błąd, spróbuj ponownie." },
  ru: { title: "Проверка безопасности", welcome: "Здравствуйте", otp_instruction: "введите код, полученный по электронной почте", otp_placeholder: "6-значный код", validate: "Подтвердить Премиум доступ", step_branding: "Визуальный стиль", step_branding_title: "Настройте ваш брендинг", field_agency: "Название агентства", field_subdomain: "Поддомен", field_color: "Основной цвет", field_lang: "Язык по умолчанию", step_content: "Контент и фиды", step_content_title: "Детали агентства", field_hero: "Главный заголовок", field_xml: "XML-фид недвижимости", field_whatsapp: "WhatsApp", field_facebook: "Ссылка на Facebook", next: "Следующий шаг", back: "Назад", launch: "Запустить панель управления", congrats: "Поздравляем!", success_msg: "Ваше агентство находится в процессе развертывания.", access_dash: "Перейти в панель управления", error_otp: "Неверный или просроченный код.", error_subdomain: "Этот поддомен уже занят.", error_generic: "Произошла ошибка, попробуйте ещё раз." },
  no: { title: "Sikkerhetsverifisering", welcome: "Hallo", otp_instruction: "vennligst skriv inn koden du mottok på e-post", otp_placeholder: "6-sifret kode", validate: "Valider Premium-tilgang", step_branding: "Visuell identitet", step_branding_title: "Konfigurer din merkevarebygging", field_agency: "Byrånavn", field_subdomain: "Subdomene", field_color: "Hovedfarge", field_lang: "Standardspråk", step_content: "Innhold og feeder", step_content_title: "Byrådetaljer", field_hero: "Hovedtittel", field_xml: "XML Eiendomsfeed", field_whatsapp: "WhatsApp", field_facebook: "Facebook-lenke", next: "Neste steg", back: "Tilbake", launch: "Start mitt Dashboard", congrats: "Gratulerer!", success_msg: "Byrået ditt blir distribuert.", access_dash: "Gå til Dashboard", error_otp: "Ugyldig eller utløpt kode.", error_subdomain: "Dette underdomenet er allerede i bruk.", error_generic: "Det oppstod en feil, prøv igjen." },
  da: { title: "Sikkerhedsbekræftelse", welcome: "Hej", otp_instruction: "indtast venligst koden modtaget via e-mail", otp_placeholder: "6-cifret kode", validate: "Valider Premium-adgang", step_branding: "Visuel identitet", step_branding_title: "Konfigurer din branding", field_agency: "Bureaunavn", field_subdomain: "Subdomæne", field_color: "Primær farve", field_lang: "Standardsprog", step_content: "Indhold & feeds", step_content_title: "Bureau detaljer", field_hero: "Hovedtitel", field_xml: "XML Ejendomsfeed", field_whatsapp: "WhatsApp", field_facebook: "Facebook link", next: "Næste trin", back: "Tilbage", launch: "Start mit Dashboard", congrats: "Tillykke!", success_msg: "Dit bureau er under udrulning.", access_dash: "Gå til Dashboard", error_otp: "Ugyldig eller udløbet kode.", error_subdomain: "Dette subdomæne er allerede i brug.", error_generic: "Der opstod en fejl, prøv venligst igen." },
} as const;

type Lang = keyof typeof i18n;
const LANGS = Object.keys(i18n) as Lang[];

// ─── Inner component (uses useSearchParams) ───────────────────────────────────
function OnboardingContent() {
  const searchParams = useSearchParams();

  const [lang, setLang]     = useState<Lang>('fr');
  const [step, setStep]     = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState('');
  const [otp, setOtp]       = useState('');

  const [params, setParams] = useState({ email: '', name: '', company: '' });
  const [config, setConfig] = useState({
    agency_name: '', subdomain: '', primary_color: '#e5992e',
    hero_title: 'PROFESSIONALS AT YOUR SERVICE',
    default_lang: 'fr' as Lang,
    facebook: '', whatsapp: '', xml_url: '',
  });

  // Pré-rempli depuis l'URL
  useEffect(() => {
    const urlLang = (searchParams.get('lang') || 'fr') as Lang;
    const email   = searchParams.get('email')   || '';
    const name    = searchParams.get('name')    || '';
    const company = searchParams.get('company') || '';
    const safeLang: Lang = LANGS.includes(urlLang) ? urlLang : 'fr';

    setLang(safeLang);
    setParams({ email, name, company });
    setConfig(prev => ({
      ...prev,
      agency_name:  company,
      subdomain:    company.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      default_lang: safeLang,
    }));
  }, [searchParams]);

  const t = i18n[lang];

  // ── Step 1 : vérification OTP ───────────────────────────────────────────────
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/verify-otp', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ email: params.email, otp_code: otp }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error?.includes('sous-domaine') ? t.error_subdomain : t.error_otp);
        return;
      }
      // Pré-remplit les champs depuis la réponse Supabase si disponible
      if (json.data?.company_name) {
        setConfig(prev => ({
          ...prev,
          agency_name: json.data.company_name,
          subdomain:   json.data.company_name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        }));
      }
      setStep(2);
    } catch {
      setError(t.error_generic);
    } finally {
      setLoading(false);
    }
  };

  // ── Step 3 : création de l'agence ───────────────────────────────────────────
  const handleFinalize = async () => {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/create-agency-premium', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email:         params.email,
          agency_name:   config.agency_name,
          subdomain:     config.subdomain,
          primary_color: config.primary_color,
          hero_title:    config.hero_title,
          default_lang:  config.default_lang,
          xml_url:       config.xml_url,
          whatsapp:      config.whatsapp,
          facebook:      config.facebook,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error?.includes('sous-domaine') ? t.error_subdomain : t.error_generic);
        return;
      }
      setStep(4);
    } catch {
      setError(t.error_generic);
    } finally {
      setLoading(false);
    }
  };

  const progressWidth = { 1: 'w-1/4', 2: 'w-2/4', 3: 'w-3/4', 4: 'w-full' }[step] || 'w-1/4';

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col items-center justify-center p-4">

      {/* Sélecteur de langue */}
      <div className="absolute top-4 right-4 flex flex-wrap gap-1 max-w-[200px] justify-end">
        {LANGS.map(l => (
          <button
            key={l}
            onClick={() => setLang(l)}
            className={`px-2 py-1 text-[10px] font-bold rounded border transition-all ${lang === l ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-200 hover:border-slate-400'}`}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">

        {/* Barre de progression */}
        <div className="h-2 bg-slate-100">
          <div className={`h-full bg-blue-600 transition-all duration-700 ${progressWidth}`} />
        </div>

        <div className="p-8 md:p-12">

          {/* Erreur globale */}
          {error && (
            <div className="mb-6 flex items-center gap-3 px-4 py-3 bg-red-50 border border-red-100 rounded-2xl text-sm text-red-700">
              <AlertCircle size={16} className="shrink-0" />
              {error}
            </div>
          )}

          {/* ── STEP 1 : OTP ─────────────────────────────────────────────────── */}
          {step === 1 && (
            <div className="space-y-6 text-center">
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                <ShieldCheck size={40} />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
              <p className="text-slate-500">
                {t.welcome} <span className="font-semibold text-slate-800">{params.name}</span>,{' '}
                {t.otp_instruction}{' '}
                <span className="font-semibold text-slate-800">{params.company}</span>.
              </p>
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <input
                  type="text"
                  inputMode="numeric"
                  placeholder={t.otp_placeholder}
                  className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 outline-none text-center text-2xl tracking-[0.5em] font-mono transition-colors"
                  maxLength={6}
                  value={otp}
                  onChange={e => { setOtp(e.target.value.replace(/\D/g, '')); setError(''); }}
                  required
                />
                <button
                  type="submit"
                  disabled={loading || otp.length !== 6}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-blue-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? <Loader2 className="animate-spin" size={20} /> : t.validate}
                </button>
              </form>
            </div>
          )}

          {/* ── STEP 2 : BRANDING ────────────────────────────────────────────── */}
          {step === 2 && (
            <div className="space-y-8">
              <header className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                  <Palette size={14} /> {t.step_branding}
                </div>
                <h2 className="text-2xl font-bold">{t.step_branding_title}</h2>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t.field_agency}</label>
                  <input
                    className="w-full px-5 py-4 rounded-xl border border-slate-100 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={config.agency_name}
                    onChange={e => setConfig({ ...config, agency_name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t.field_subdomain}</label>
                  <input
                    className="w-full px-5 py-4 rounded-xl border border-slate-100 bg-slate-50 font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={config.subdomain}
                    onChange={e => setConfig({ ...config, subdomain: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '') })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t.field_color}</label>
                  <div className="flex gap-3 items-center">
                    <input
                      type="color"
                      className="h-12 w-16 rounded-lg cursor-pointer border border-slate-100 p-1"
                      value={config.primary_color}
                      onChange={e => setConfig({ ...config, primary_color: e.target.value })}
                    />
                    <input
                      className="flex-1 px-4 py-3 rounded-xl border border-slate-100 bg-slate-50 uppercase font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                      value={config.primary_color}
                      onChange={e => setConfig({ ...config, primary_color: e.target.value })}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t.field_lang}</label>
                  <select
                    className="w-full px-5 py-4 rounded-xl border border-slate-100 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={config.default_lang}
                    onChange={e => {
                      const l = e.target.value as Lang;
                      setConfig({ ...config, default_lang: l });
                      setLang(l);
                    }}
                  >
                    {LANGS.map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
                  </select>
                </div>
              </div>

              <button
                onClick={() => setStep(3)}
                disabled={!config.agency_name || !config.subdomain}
                className="w-full py-5 bg-blue-600 text-white rounded-2xl font-bold shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {t.next} <ArrowRight size={20} />
              </button>
            </div>
          )}

          {/* ── STEP 3 : CONTENT ──────────────────────────────────────────────── */}
          {step === 3 && (
            <div className="space-y-8">
              <header className="text-center">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
                  <Globe size={14} /> {t.step_content}
                </div>
                <h2 className="text-2xl font-bold">{t.step_content_title}</h2>
              </header>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t.field_hero}</label>
                  <input
                    className="w-full px-5 py-4 rounded-xl border border-slate-100 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
                    value={config.hero_title}
                    onChange={e => setConfig({ ...config, hero_title: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t.field_xml}</label>
                  <input
                    placeholder="https://..."
                    className="w-full px-5 py-4 rounded-xl border border-slate-100 bg-slate-50 font-mono text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                    value={config.xml_url}
                    onChange={e => setConfig({ ...config, xml_url: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t.field_whatsapp}</label>
                    <input
                      placeholder="336XXXXXXXX"
                      className="w-full px-5 py-4 rounded-xl border border-slate-100 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
                      value={config.whatsapp}
                      onChange={e => setConfig({ ...config, whatsapp: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t.field_facebook}</label>
                    <input
                      placeholder="https://facebook.com/..."
                      className="w-full px-5 py-4 rounded-xl border border-slate-100 bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none"
                      value={config.facebook}
                      onChange={e => setConfig({ ...config, facebook: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={() => { setStep(2); setError(''); }}
                  className="flex-1 py-5 border border-slate-200 text-slate-500 rounded-2xl font-bold hover:bg-slate-50 transition-all"
                >
                  {t.back}
                </button>
                <button
                  onClick={handleFinalize}
                  disabled={loading}
                  className="flex-[2] py-5 bg-slate-900 text-white rounded-2xl font-bold shadow-xl hover:bg-green-600 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {loading
                    ? <Loader2 className="animate-spin" size={20} />
                    : <><Rocket size={20} /> {t.launch}</>
                  }
                </button>
              </div>
            </div>
          )}

          {/* ── STEP 4 : SUCCESS ──────────────────────────────────────────────── */}
          {step === 4 && (
            <div className="text-center py-10 space-y-6">
              <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={50} />
              </div>
              <h1 className="text-4xl font-black text-slate-900">{t.congrats}</h1>
              <p className="text-lg text-slate-500 max-w-sm mx-auto">
                {t.success_msg}{' '}
                <span className="text-slate-900 font-bold">({config.agency_name})</span>
              </p>
              <div className="pt-8">
                <a
                  href={`/fr/${config.subdomain}`}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-full font-bold hover:bg-blue-600 transition-all shadow-xl"
                >
                  {t.access_dash} <ArrowRight size={18} />
                </a>
              </div>
            </div>
          )}

        </div>
      </div>

      <p className="mt-8 text-slate-400 text-[10px] uppercase tracking-[0.3em] font-bold">
        HabiHub Premium Onboarding • {lang.toUpperCase()}
      </p>
    </div>
  );
}

// ─── Page wrapper avec Suspense (requis par useSearchParams) ─────────────────
export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="animate-spin text-slate-400" size={40} />
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  );
}
