'use client';

import React, { useState } from 'react';
import { Loader2, CheckCircle2, ArrowRight, Globe, Shield, Zap, BarChart3, Mail } from 'lucide-react';

// ─── i18n ─────────────────────────────────────────────────────────────────────
const i18n = {
  fr: {
    badge: 'Accès Premium',
    headline: "Votre site immobilier,\nprêt en 5 minutes.",
    sub: "Rejoignez les agences qui font confiance à Data-Home pour leur présence digitale.",
    features: [
      { label: "Site web professionnel inclus" },
      { label: "Flux XML & multi-langues" },
      { label: "Dashboard de gestion" },
      { label: "Support dédié" },
    ],
    form_title: "Créer mon espace",
    label_prenom: "Prénom",
    label_nom: "Nom",
    label_email: "Email professionnel",
    label_company: "Nom de l'agence",
    label_phone: "Téléphone",
    label_lang: "Langue préférée",
    cta: "Recevoir mon code d'accès",
    cta_loading: "Envoi en cours...",
    disclaimer: "Un email de validation vous sera envoyé immédiatement.",
    error_generic: "Une erreur est survenue. Veuillez réessayer.",
    success_title: "Vérifiez votre email",
    success_body: "Un code de validation a été envoyé à",
    success_hint: "Cliquez sur le bouton dans l'email pour continuer.",
    close_instruction: "Vous pouvez maintenant fermer cette page",
  },
  en: {
    badge: 'Premium Access',
    headline: "Your real estate website,\nready in 5 minutes.",
    sub: "Join agencies that trust Data-Home for their digital presence.",
    features: [
      { label: "Professional website included" },
      { label: "XML feeds & multi-language" },
      { label: "Management dashboard" },
      { label: "Dedicated support" },
    ],
    form_title: "Create my account",
    label_prenom: "First name",
    label_nom: "Last name",
    label_email: "Professional email",
    label_company: "Agency name",
    label_phone: "Phone",
    label_lang: "Preferred language",
    cta: "Receive my access code",
    cta_loading: "Sending...",
    disclaimer: "A validation email will be sent immediately.",
    error_generic: "An error occurred. Please try again.",
    success_title: "Check your email",
    success_body: "A validation code has been sent to",
    success_hint: "Click the button in the email to continue.",
    close_instruction: "You can now close this page",
  },
  nl: {
    badge: 'Premium toegang',
    headline: "Uw vastgoedwebsite,\nklaar in 5 minuten.",
    sub: "Sluit u aan bij agentschappen die Data-Home vertrouwen voor hun digitale aanwezigheid.",
    features: [
      { label: "Professionele website inbegrepen" },
      { label: "XML-feeds & meertalig" },
      { label: "Beheerdashboard" },
      { label: "Toegewijde ondersteuning" },
    ],
    form_title: "Mijn ruimte aanmaken",
    label_prenom: "Voornaam",
    label_nom: "Achternaam",
    label_email: "Professioneel e-mailadres",
    label_company: "Naam van het agentschap",
    label_phone: "Telefoon",
    label_lang: "Voorkeurstaal",
    cta: "Mijn toegangscode ontvangen",
    cta_loading: "Verzenden...",
    disclaimer: "Er wordt onmiddellijk een validatie-e-mail verzonden.",
    error_generic: "Er is een fout opgetreden. Probeer het opnieuw.",
    success_title: "Controleer uw e-mail",
    success_body: "Een validatiecode is verzonden naar",
    success_hint: "Klik op de knop in de e-mail om door te gaan.",
    close_instruction: "U kunt deze pagina nu sluiten",
  },
  es: {
    badge: 'Acceso Premium',
    headline: "Su sitio inmobiliario,\nlisto en 5 minutos.",
    sub: "Únase a las agencias que confían en Data-Home para su presencia digital.",
    features: [
      { label: "Sitio web profesional incluido" },
      { label: "Feeds XML y multiidioma" },
      { label: "Panel de gestión" },
      { label: "Soporte dedicado" },
    ],
    form_title: "Crear mi espacio",
    label_prenom: "Nombre",
    label_nom: "Apellido",
    label_email: "Email profesional",
    label_company: "Nombre de la agencia",
    label_phone: "Teléfono",
    label_lang: "Idioma preferido",
    cta: "Recibir mi código de acceso",
    cta_loading: "Enviando...",
    disclaimer: "Se le enviará un email de validación de inmediato.",
    error_generic: "Se produjo un error. Por favor, inténtelo de nuevo.",
    success_title: "Revise su email",
    success_body: "Un código de validación ha sido enviado a",
    success_hint: "Haga clic en el botón del email para continuar.",
    close_instruction: "Ahora puede cerrar esta página",
  },
  de: {
    badge: 'Premium-Zugang',
    headline: "Ihre Immobilienwebsite,\nin 5 Minuten bereit.",
    sub: "Schließen Sie sich Agenturen an, die Data-Home für ihre digitale Präsenz vertrauen.",
    features: [
      { label: "Professionelle Website inklusive" },
      { label: "XML-Feeds & mehrsprachig" },
      { label: "Verwaltungs-Dashboard" },
      { label: "Dedizierter Support" },
    ],
    form_title: "Mein Konto erstellen",
    label_prenom: "Vorname",
    label_nom: "Nachname",
    label_email: "Geschäftliche E-Mail",
    label_company: "Name der Agentur",
    label_phone: "Telefon",
    label_lang: "Bevorzugte Sprache",
    cta: "Meinen Zugangscode erhalten",
    cta_loading: "Wird gesendet...",
    disclaimer: "Eine Bestätigungs-E-Mail wird sofort gesendet.",
    error_generic: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.",
    success_title: "Prüfen Sie Ihre E-Mail",
    success_body: "Ein Bestätigungscode wurde gesendet an",
    success_hint: "Klicken Sie auf die Schaltfläche in der E-Mail, um fortzufahren.",
    close_instruction: "Sie können diese Seite jetzt schließen",
  },
  pl: {
    badge: 'Dostęp Premium',
    headline: "Twoja strona nieruchomości,\ngotowa w 5 minut.",
    sub: "Dołącz do agencji, które ufają Data-Home w swojej obecności cyfrowej.",
    features: [
      { label: "Profesjonalna strona w zestawie" },
      { label: "Kanały XML i wielojęzyczność" },
      { label: "Panel zarządzania" },
      { label: "Dedykowane wsparcie" },
    ],
    form_title: "Utwórz moje konto",
    label_prenom: "Imię",
    label_nom: "Nazwisko",
    label_email: "Służbowy e-mail",
    label_company: "Nazwa agencji",
    label_phone: "Telefon",
    label_lang: "Preferowany język",
    cta: "Otrzymaj mój kod dostępu",
    cta_loading: "Wysyłanie...",
    disclaimer: "E-mail weryfikacyjny zostanie wysłany natychmiast.",
    error_generic: "Wystąpił błąd. Spróbuj ponownie.",
    success_title: "Sprawdź swój e-mail",
    success_body: "Kod weryfikacyjny został wysłany na",
    success_hint: "Kliknij przycisk w e-mailu, aby kontynuować.",
    close_instruction: "Możesz teraz zamknąć tę stronę",
  },
  ru: {
    badge: 'Премиум доступ',
    headline: "Ваш сайт недвижимости,\nготов за 5 минут.",
    sub: "Присоединяйтесь к агентствам, которые доверяют Data-Home своё цифровое присутствие.",
    features: [
      { label: "Профессиональный сайт включён" },
      { label: "XML-фиды и мультиязычность" },
      { label: "Панель управления" },
      { label: "Выделенная поддержка" },
    ],
    form_title: "Создать мой аккаунт",
    label_prenom: "Имя",
    label_nom: "Фамилия",
    label_email: "Рабочий email",
    label_company: "Название агентства",
    label_phone: "Телефон",
    label_lang: "Предпочтительный язык",
    cta: "Получить код доступа",
    cta_loading: "Отправка...",
    disclaimer: "Письмо с кодом будет отправлено немедленно.",
    error_generic: "Произошла ошибка. Пожалуйста, попробуйте снова.",
    success_title: "Проверьте вашу почту",
    success_body: "Код подтверждения был отправлен на",
    success_hint: "Нажмите кнопку в письме, чтобы продолжить.",
    close_instruction: "Теперь вы можете закрыть эту страницу",
  },
  no: {
    badge: 'Premium tilgang',
    headline: "Din eiendomswebsite,\nklar på 5 minutter.",
    sub: "Bli med agenturer som stoler på Data-Home for sin digitale tilstedeværelse.",
    features: [
      { label: "Profesjonelt nettsted inkludert" },
      { label: "XML-feeder og flerspråklig" },
      { label: "Administrasjonspanel" },
      { label: "Dedikert support" },
    ],
    form_title: "Opprett min konto",
    label_prenom: "Fornavn",
    label_nom: "Etternavn",
    label_email: "Profesjonell e-post",
    label_company: "Byråets navn",
    label_phone: "Telefon",
    label_lang: "Foretrukket språk",
    cta: "Motta min tilgangskode",
    cta_loading: "Sender...",
    disclaimer: "En bekreftelses-e-post vil bli sendt umiddelbart.",
    error_generic: "Det oppstod en feil. Vennligst prøv igjen.",
    success_title: "Sjekk e-posten din",
    success_body: "En bekreftelseskode er sendt til",
    success_hint: "Klikk på knappen i e-posten for å fortsette.",
    close_instruction: "Du kan nå lukke denne siden",
  },
  da: {
    badge: 'Premium adgang',
    headline: "Dit ejendomswebsite,\nklar på 5 minutter.",
    sub: "Tilslut dig bureauer, der stoler på Data-Home for deres digitale tilstedeværelse.",
    features: [
      { label: "Professionelt website inkluderet" },
      { label: "XML-feeds og flersproget" },
      { label: "Administrationspanel" },
      { label: "Dedikeret support" },
    ],
    form_title: "Opret min konto",
    label_prenom: "Fornavn",
    label_nom: "Efternavn",
    label_email: "Professionel e-mail",
    label_company: "Bureauets navn",
    label_phone: "Telefon",
    label_lang: "Foretrukket sprog",
    cta: "Modtag min adgangskode",
    cta_loading: "Sender...",
    disclaimer: "En bekræftelses-e-mail vil blive sendt med det samme.",
    error_generic: "Der opstod en fejl. Prøv venligst igen.",
    success_title: "Tjek din e-mail",
    success_body: "En bekræftelseskode er sendt til",
    success_hint: "Klik på knappen i e-mailen for at fortsætte.",
    close_instruction: "Du kan nu lukke denne side",
  },
} as const;

type Lang = keyof typeof i18n;
const LANG_OPTIONS: { code: Lang; label: string; flag: string }[] = [
  { code: 'fr', label: 'Français',    flag: '🇫🇷' },
  { code: 'en', label: 'English',     flag: '🇬🇧' },
  { code: 'nl', label: 'Nederlands',  flag: '🇳🇱' },
  { code: 'es', label: 'Español',     flag: '🇪🇸' },
  { code: 'de', label: 'Deutsch',     flag: '🇩🇪' },
  { code: 'pl', label: 'Polski',      flag: '🇵🇱' },
  { code: 'ru', label: 'Русский',     flag: '🇷🇺' },
  { code: 'no', label: 'Norsk',       flag: '🇳🇴' },
  { code: 'da', label: 'Dansk',       flag: '🇩🇰' },
];

const FEATURE_ICONS = [Globe, Shield, BarChart3, Zap];

// ─── Component ────────────────────────────────────────────────────────────────
export default function RegisterPage() {
  const [lang, setLang]     = useState<Lang>('fr');
  const [loading, setLoading] = useState(false);
  const [done, setDone]     = useState(false);
  const [error, setError]   = useState('');

  const [form, setForm] = useState({
    prenom:             '',
    nom:                '',
    email:              '',
    entreprise:         '',
    telephone:          '',
    preferred_language: 'fr' as Lang,
  });

  const t = i18n[lang];
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleLangChange = (l: Lang) => {
    setLang(l);
    setForm(f => ({ ...f, preferred_language: l }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res  = await fetch('/api/register-premium', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok || !json.success) {
        setError(json.error || t.error_generic);
        return;
      }
      setDone(true);
    } catch {
      setError(t.error_generic);
    } finally {
      setLoading(false);
    }
  };

  // ── Success screen ───────────────────────────────────────────────────────────
  if (done) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-8">
          <div className="w-24 h-24 bg-green-500/10 border border-green-500/20 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={48} className="text-green-400" />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-3">
              Data-Home Premium
            </p>
            <h1 className="text-3xl font-black text-white mb-4">{t.success_title}</h1>
            <p className="text-slate-400 leading-relaxed">
              {t.success_body}{' '}
              <span className="text-white font-semibold">{form.email}</span>.
              <br /><br />
              {t.success_hint}
            </p>
          </div>
          <div className="flex items-center gap-3 px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-left">
            <Mail size={18} className="text-blue-400 shrink-0" />
            <p className="text-slate-400 text-sm">{form.email}</p>
          </div>
          <p className="text-[10px] text-slate-400 uppercase tracking-[0.3em] font-bold">
            {t.close_instruction}
          </p>
        </div>
      </div>
    );
  }

  // ── Main layout ──────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-slate-900 flex">

      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex flex-col justify-between w-[45%] p-14 border-r border-white/5">

        {/* Logo */}
        <div>
          <div className="flex items-center gap-3 mb-16">
            <div className="w-8 h-8 bg-blue-600 rounded-lg" />
            <span className="text-white font-black text-lg tracking-tight">DATA-HOME</span>
          </div>

          {/* Headline */}
          <div className="mb-12">
            <span className="inline-block px-3 py-1 bg-blue-600/20 text-blue-400 text-[10px] font-black uppercase tracking-[0.2em] rounded-full mb-6">
              {t.badge}
            </span>
            <h1 className="text-4xl xl:text-5xl font-black text-white leading-[1.1] mb-5 whitespace-pre-line">
              {t.headline}
            </h1>
            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              {t.sub}
            </p>
          </div>

          {/* Features */}
          <div className="space-y-4">
            {t.features.map((f, i) => {
              const Icon = FEATURE_ICONS[i];
              return (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                    <Icon size={15} className="text-blue-400" />
                  </div>
                  <span className="text-slate-300 text-sm font-medium">{f.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bottom */}
        <p className="text-[10px] text-slate-600 uppercase tracking-[0.3em] font-bold">
          © {new Date().getFullYear()} Data-Home
        </p>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="flex-1 flex flex-col justify-center px-6 py-12 lg:px-16 xl:px-24">

        {/* Lang switcher */}
        <div className="flex flex-wrap gap-1.5 mb-10">
          {LANG_OPTIONS.map(l => (
            <button
              key={l.code}
              onClick={() => handleLangChange(l.code)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                lang === l.code
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/10'
              }`}
            >
              <span>{l.flag}</span> {l.code.toUpperCase()}
            </button>
          ))}
        </div>

        {/* Form card */}
        <div className="max-w-md w-full">
          <h2 className="text-2xl font-black text-white mb-8">{t.form_title}</h2>

          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{t.label_prenom}</label>
                <input
                  required
                  className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Alice"
                  value={form.prenom}
                  onChange={e => set('prenom', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{t.label_nom}</label>
                <input
                  required
                  className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="Martin"
                  value={form.nom}
                  onChange={e => set('nom', e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{t.label_email}</label>
              <input
                required
                type="email"
                className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="alice@monagence.com"
                value={form.email}
                onChange={e => set('email', e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{t.label_company}</label>
              <input
                required
                className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="Mon Agence Immo"
                value={form.entreprise}
                onChange={e => set('entreprise', e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">{t.label_phone}</label>
              <input
                type="tel"
                className="w-full px-4 py-3.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                placeholder="+33 6 00 00 00 00"
                value={form.telephone}
                onChange={e => set('telephone', e.target.value)}
              />
            </div>

            {error && (
              <div className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                <div className="w-1.5 h-1.5 rounded-full bg-red-400 shrink-0" />
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading
                  ? <><Loader2 className="animate-spin" size={16} /> {t.cta_loading}</>
                  : <>{t.cta} <ArrowRight size={16} /></>
                }
              </button>
            </div>

            <p className="text-center text-[10px] text-slate-600 uppercase tracking-widest font-bold pt-1">
              {t.disclaimer}
            </p>

          </form>
        </div>
      </div>
    </div>
  );
}