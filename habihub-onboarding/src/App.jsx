Le "grand code React", c'est celui que tu as partagé un peu plus haut : ton **dictionnaire avec les 9 langues** (FR, NL, EN, ES, DE, PL, RU, NO, DA) et toute la logique du formulaire (OTP, Branding, Contenu).

C'est lui qui contient tout le design et les fonctionnalités de ta page d'onboarding. Pour que ton projet fonctionne parfaitement avec **Vite**, voici le code **complet et nettoyé** (j'ai corrigé les petites erreurs de balises qui s'étaient glissées dans ton copier-coller).

**Copie tout ce bloc et colle-le dans ton fichier `src/App.jsx` :**

```jsx
import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  Palette, 
  Globe, 
  Rocket, 
  ShieldCheck, 
  ArrowRight,
  Loader2
} from 'lucide-react';

/**
 * DICTIONNAIRE MULTILINGUE (9 LANGUES)
 */
const i18n = {
  fr: {
    title: "Vérification de sécurité",
    welcome: "Bonjour",
    otp_instruction: "veuillez saisir le code reçu par email pour votre agence",
    otp_placeholder: "Code à 6 chiffres",
    validate: "Valider l'accès Premium",
    step_branding: "Identité Visuelle",
    step_branding_title: "Configurez votre Branding",
    field_agency: "Nom de l'agence",
    field_subdomain: "Sous-domaine",
    field_color: "Couleur Primaire",
    field_lang: "Langue par défaut",
    step_content: "Contenu & Flux",
    step_content_title: "Détails de l'Agence",
    field_hero: "Titre Principal (Hero Title)",
    field_xml: "Flux XML Propriétés",
    field_whatsapp: "WhatsApp",
    field_facebook: "Lien Facebook",
    next: "Étape suivante",
    back: "Retour",
    launch: "Lancer mon Dashboard",
    congrats: "Félicitations !",
    success_msg: "Votre agence est en cours de déploiement.",
    access_dash: "Accéder à mon Dashboard"
  },
  nl: {
    title: "Beveiligingscontrole",
    welcome: "Hallo",
    otp_instruction: "voer de code in die u per e-mail heeft ontvangen voor uw kantoor",
    otp_placeholder: "6-cijferige code",
    validate: "Premium toegang valideren",
    step_branding: "Visuele Identiteit",
    step_branding_title: "Configureer uw Branding",
    field_agency: "Naam van het agentschap",
    field_subdomain: "Subdomein",
    field_color: "Primaire kleur",
    field_lang: "Standaardtaal",
    step_content: "Inhoud & Feeds",
    step_content_title: "Details van het Agentschap",
    field_hero: "Hoofdtitel (Hero Title)",
    field_xml: "XML Vastgoedfeed",
    field_whatsapp: "WhatsApp",
    field_facebook: "Facebook-link",
    next: "Volgende stap",
    back: "Terug",
    launch: "Start mijn Dashboard",
    congrats: "Gefeliciteerd!",
    success_msg: "Uw agentschap wordt momenteel geïmplementeerd.",
    access_dash: "Ga naar mijn Dashboard"
  },
  en: {
    title: "Security Verification",
    welcome: "Hello",
    otp_instruction: "please enter the code received by email for your agency",
    otp_placeholder: "6-digit code",
    validate: "Validate Premium Access",
    step_branding: "Visual Identity",
    step_branding_title: "Configure your Branding",
    field_agency: "Agency Name",
    field_subdomain: "Subdomain",
    field_color: "Primary Color",
    field_lang: "Default Language",
    step_content: "Content & Feeds",
    step_content_title: "Agency Details",
    field_hero: "Hero Title",
    field_xml: "XML Property Feed",
    field_whatsapp: "WhatsApp",
    field_facebook: "Facebook Link",
    next: "Next Step",
    back: "Back",
    launch: "Launch my Dashboard",
    congrats: "Congratulations!",
    success_msg: "Your agency is being deployed.",
    access_dash: "Access my Dashboard"
  },
  es: {
    title: "Verificación de seguridad",
    welcome: "Hola",
    otp_instruction: "por favor ingrese el código recibido por correo electrónico para su agencia",
    otp_placeholder: "Código de 6 dígitos",
    validate: "Validar acceso Premium",
    step_branding: "Identidad Visual",
    step_branding_title: "Configure su Branding",
    field_agency: "Nombre de la agencia",
    field_subdomain: "Subdominio",
    field_color: "Color primario",
    field_lang: "Idioma por defecto",
    step_content: "Contenido y Feeds",
    step_content_title: "Detalles de la Agencia",
    field_hero: "Título principal",
    field_xml: "Feed XML de propiedades",
    field_whatsapp: "WhatsApp",
    field_facebook: "Enlace de Facebook",
    next: "Siguiente paso",
    back: "Atrás",
    launch: "Lanzar mi Dashboard",
    congrats: "¡Felicidades!",
    success_msg: "Su agencia está siendo desplegada.",
    access_dash: "Acceder a mi Dashboard"
  },
  de: {
    title: "Sicherheitsüberprüfung",
    welcome: "Hallo",
    otp_instruction: "bitte geben Sie den Code ein, den Sie per E-Mail für Ihre Agentur erhalten haben",
    otp_placeholder: "6-stelliger Code",
    validate: "Premium-Zugang validieren",
    step_branding: "Visuelle Identität",
    step_branding_title: "Konfigurieren Sie Ihr Branding",
    field_agency: "Name der Agentur",
    field_subdomain: "Subdomain",
    field_color: "Primärfarbe",
    field_lang: "Standardsprache",
    step_content: "Inhalt & Feeds",
    step_content_title: "Agenturdetails",
    field_hero: "Haupttitel (Hero Title)",
    field_xml: "XML-Immobilien-Feed",
    field_whatsapp: "WhatsApp",
    field_facebook: "Facebook-Link",
    next: "Nächster Schritt",
    back: "Zurück",
    launch: "Mein Dashboard starten",
    congrats: "Herzlichen Glückwunsch!",
    success_msg: "Ihre Agentur wird gerade bereitgestellt.",
    access_dash: "Zum Dashboard gehen"
  },
  pl: {
    title: "Weryfikacja bezpieczeństwa",
    welcome: "Witaj",
    otp_instruction: "wprowadź kod otrzymany e-mailem dla swojej agencji",
    otp_placeholder: "Kod 6-cyfrowy",
    validate: "Zatwierdź dostęp Premium",
    step_branding: "Tożsamość wizualna",
    step_branding_title: "Skonfiguruj swój Branding",
    field_agency: "Nazwa agencji",
    field_subdomain: "Subdomena",
    field_color: "Kolor podstawowy",
    field_lang: "Język domyślny",
    step_content: "Treść i kanały",
    step_content_title: "Szczegóły agencji",
    field_hero: "Tytuł główny",
    field_xml: "Kanał XML nieruchomości",
    field_whatsapp: "WhatsApp",
    field_facebook: "Link do Facebooka",
    next: "Następny krok",
    back: "Wstecz",
    launch: "Uruchom mój Panel",
    congrats: "Gratulacje!",
    success_msg: "Twoja agencja jest w trakcie wdrażania.",
    access_dash: "Przejdź do Panelu"
  },
  ru: {
    title: "Проверка безопасности",
    welcome: "Здравствуйте",
    otp_instruction: "пожалуйста, введите код, полученный по электронной почте для вашего агентства",
    otp_placeholder: "6-значный код",
    validate: "Подтвердить Премиум доступ",
    step_branding: "Визуальный стиль",
    step_branding_title: "Настройте ваш брендинг",
    field_agency: "Название агентства",
    field_subdomain: "Поддомен",
    field_color: "Основной цвет",
    field_lang: "Язык по умолчанию",
    step_content: "Контент и фиды",
    step_content_title: "Детали агентства",
    field_hero: "Главный заголовок",
    field_xml: "XML-фид недвижимости",
    field_whatsapp: "WhatsApp",
    field_facebook: "Ссылка на Facebook",
    next: "Следующий шаг",
    back: "Назад",
    launch: "Запустить панель управления",
    congrats: "Поздравляем!",
    success_msg: "Ваше агентство находится в процессе развертывания.",
    access_dash: "Перейти в панель управления"
  },
  no: {
    title: "Sikkerhetsverifisering",
    welcome: "Hallo",
    otp_instruction: "vennligst skriv inn koden du mottok på e-post for ditt byrå",
    otp_placeholder: "6-sifret kode",
    validate: "Valider Premium-tilgang",
    step_branding: "Visuell identitet",
    step_branding_title: "Konfigurer din merkevarebygging",
    field_agency: "Byrånavn",
    field_subdomain: "Subdomene",
    field_color: "Hovedfarge",
    field_lang: "Standardspråk",
    step_content: "Innhold og feeder",
    step_content_title: "Byrådetaljer",
    field_hero: "Hovedtittel",
    field_xml: "XML Eiendomsfeed",
    field_whatsapp: "WhatsApp",
    field_facebook: "Facebook-lenke",
    next: "Neste steg",
    back: "Tilbake",
    launch: "Start mitt Dashboard",
    congrats: "Gratulerer!",
    success_msg: "Byrået ditt blir distribuert.",
    access_dash: "Gå til Dashboard"
  },
  da: {
    title: "Sikkerhedsbekræftelse",
    welcome: "Hej",
    otp_instruction: "indtast venligst koden modtaget via e-mail til dit bureau",
    otp_placeholder: "6-cifret kode",
    validate: "Valider Premium-adgang",
    step_branding: "Visuel identitet",
    step_branding_title: "Konfigurer din branding",
    field_agency: "Bureaunavn",
    field_subdomain: "Subdomæne",
    field_color: "Primær farve",
    field_lang: "Standardsprog",
    step_content: "Indhold & feeds",
    step_content_title: "Bureau detaljer",
    field_hero: "Hovedtitel",
    field_xml: "XML Ejendomsfeed",
    field_whatsapp: "WhatsApp",
    field_facebook: "Facebook link",
    next: "Næste trin",
    back: "Tilbage",
    launch: "Start mit Dashboard",
    congrats: "Tillykke!",
    success_msg: "Dit bureau er under udrulning.",
    access_dash: "Gå til Dashboard"
  }
};

export default function App() {
  const [lang, setLang] = useState('fr');
  const [step, setStep] = useState(1); 
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState('');
  
  const [params, setParams] = useState({ email: '', name: '', company: '' });
  const [config, setConfig] = useState({
    agency_name: '', subdomain: '', primary_color: '#e5992e',
    font_family: 'Montserrat', hero_title: 'PROFESSIONALS AT YOUR SERVICE',
    default_lang: 'fr', facebook: '', whatsapp: '', instagram: '', xml_url: ''
  });

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const urlLang = urlParams.get('lang') || 'fr';
    const email = urlParams.get('email') || '';
    const name = urlParams.get('name') || '';
    const company = urlParams.get('company') || '';
    
    if (i18n[urlLang]) setLang(urlLang);
    
    setParams({ email, name, company });
    setConfig(prev => ({ 
      ...prev, 
      agency_name: company,
      subdomain: company.toLowerCase().replace(/\s+/g, '-'),
      default_lang: urlLang
    }));
  }, []);

  const t = i18n[lang];

  const handleVerifyOTP = (e) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(2);
    }, 1200);
  };

  const handleFinalize = async () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setStep(4);
    }, 1800);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col items-center justify-center p-4">
      {/* Selector de secours */}
      <div className="absolute top-4 right-4 flex gap-2">
        {Object.keys(i18n).map(l => (
          <button 
            key={l}
            onClick={() => setLang(l)}
            className={`px-2 py-1 text-[10px] font-bold rounded border ${lang === l ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-slate-400 border-slate-200'}`}
          >
            {l.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="max-w-2xl w-full bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100">
        <div className="h-2 bg-slate-100 flex">
          <div className={`h-full transition-all duration-700 bg-blue-600 ${step === 1 ? 'w-1/4' : step === 2 ? 'w-2/4' : step === 3 ? 'w-3/4' : 'w-full'}`}></div>
        </div>

        <div className="p-8 md:p-12">
          
          {/* STEP 1: OTP */}
          {step === 1 && (
            <div className="space-y-6 text-center">
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <ShieldCheck size={40} />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">{t.title}</h1>
              <p className="text-slate-500">
                {t.welcome} <span className="font-semibold text-slate-800">{params.name}</span>, {t.otp_instruction} <span className="font-semibold text-slate-800">{params.company}</span>.
              </p>
              <form onSubmit={handleVerifyOTP} className="space-y-4">
                <input 
                  type="text" 
                  placeholder={t.otp_placeholder}
                  className="w-full px-6 py-4 rounded-2xl border-2 border-slate-100 focus:border-blue-500 outline-none text-center text-2xl tracking-[0.5em] font-mono"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                />
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-blue-600 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" /> : t.validate}
                </button>
              </form>
            </div>
          )}

          {/* STEP 2: BRANDING */}
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
                  <input className="w-full px-5 py-4 rounded-xl border border-slate-100 bg-slate-50" value={config.agency_name} onChange={e => setConfig({...config, agency_name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t.field_subdomain}</label>
                  <input className="w-full px-5 py-4 rounded-xl border border-slate-100 bg-slate-50 font-mono text-sm" value={config.subdomain} onChange={e => setConfig({...config, subdomain: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t.field_color}</label>
                  <div className="flex gap-3">
                    <input type="color" className="h-12 w-20 rounded-lg cursor-pointer" value={config.primary_color} onChange={e => setConfig({...config, primary_color: e.target.value})} />
                    <input className="flex-1 px-5 py-3 rounded-xl border border-slate-100 bg-slate-50 uppercase font-mono" value={config.primary_color} onChange={e => setConfig({...config, primary_color: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t.field_lang}</label>
                  <select className="w-full px-5 py-4 rounded-xl border border-slate-100 bg-slate-50" value={config.default_lang} onChange={e => { setConfig({...config, default_lang: e.target.value}); setLang(e.target.value); }}>
                    <option value="fr">Français</option>
                    <option value="en">English</option>
                    <option value="nl">Nederlands</option>
                    <option value="es">Español</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>
              </div>

              <button onClick={() => setStep(3)} className="w-full py-5 bg-blue-600 text-white rounded-2xl font-bold shadow-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                {t.next} <ArrowRight size={20} />
              </button>
            </div>
          )}

          {/* STEP 3: CONTENT */}
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
                  <input className="w-full px-5 py-4 rounded-xl border border-slate-100 bg-slate-50" value={config.hero_title} onChange={e => setConfig({...config, hero_title: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t.field_xml}</label>
                  <input placeholder="https://..." className="w-full px-5 py-4 rounded-xl border border-slate-100 bg-slate-50 font-mono text-sm" value={config.xml_url} onChange={e => setConfig({...config, xml_url: e.target.value})} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t.field_whatsapp}</label>
                    <input className="w-full px-5 py-4 rounded-xl border border-slate-100 bg-slate-50" value={config.whatsapp} onChange={e => setConfig({...config, whatsapp: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t.field_facebook}</label>
                    <input className="w-full px-5 py-4 rounded-xl border border-slate-100 bg-slate-50" value={config.facebook} onChange={e => setConfig({...config, facebook: e.target.value})} />
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button onClick={() => setStep(2)} className="flex-1 py-5 border border-slate-100 text-slate-400 rounded-2xl font-bold hover:bg-slate-50 transition-all">
                  {t.back}
                </button>
                <button onClick={handleFinalize} disabled={loading} className="flex-[2] py-5 bg-slate-900 text-white rounded-2xl font-bold shadow-xl hover:bg-green-600 transition-all flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="animate-spin" /> : <><Rocket size={20} /> {t.launch}</>}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: SUCCESS */}
          {step === 4 && (
            <div className="text-center py-10 space-y-6">
              <div className="w-24 h-24 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6 scale-110">
                <CheckCircle2 size={50} />
              </div>
              <h1 className="text-4xl font-black text-slate-900">{t.congrats}</h1>
              <p className="text-lg text-slate-500 max-w-sm mx-auto">
                {t.success_msg} (<span className="text-slate-900 font-bold">{config.agency_name}</span>)
              </p>
              <div className="pt-8">
                <a 
                  href={`https://${config.subdomain}.habihub.com/admin`}
                  className="inline-flex items-center gap-3 px-8 py-4 bg-slate-900 text-white rounded-full font-bold hover:px-10 transition-all shadow-xl shadow-slate-200"
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
```