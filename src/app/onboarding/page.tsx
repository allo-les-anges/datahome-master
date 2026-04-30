'use client';

import React, { Suspense, useState, useEffect, useRef, useReducer, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  Palette,
  Globe,
  Rocket,
  ShieldCheck,
  ArrowRight,
  Loader2,
  AlertCircle,
  Upload,
  Lock,
  Eye,
  EyeOff,
  Check,
  X,
  Globe2,
  Facebook,
  Link2,
  Brush,
  Home,
  Sparkles,
  Zap,
  Award,
  Crown,
  MessageCircle,
  Phone
} from 'lucide-react';

// ─── i18n CONFIGURATION COMPLÈTE ────────────────────────────────────────────────
const i18n = {
  fr: {
    title: "Vérification de sécurité", 
    welcome: "Bonjour", 
    otp_instruction: "veuillez saisir le code reçu par email pour votre agence",
    otp_placeholder: "Code à 6 chiffres", 
    validate: "Valider l'accès Premium",
    step_branding: "Identité Visuelle", 
    step_branding_title: "Personnalisez votre espace",
    field_agency: "Nom de l'agence", 
    field_subdomain: "Sous-domaine (URL)", 
    field_color: "Couleur primaire",
    field_lang: "Langue par défaut", 
    field_logo: "Logo (optionnel)",
    step_content: "Contenu & Flux", 
    step_content_title: "Détails de l'Agence",
    field_hero: "Slogan (Hero Title)", 
    field_xml: "Flux XML Propriétés",
    field_whatsapp: "WhatsApp", 
    field_facebook: "Lien Facebook",
    next: "Étape suivante", 
    back: "Retour", 
    launch: "Lancer mon essai gratuit",
    error_otp: "Code invalide ou expiré.", 
    error_subdomain: "Ce sous-domaine est déjà utilisé.",
    error_generic: "Une erreur est survenue.",
    error_required: "Ce champ est requis.",
    error_invalid_url: "URL invalide.",
    step_of: "Étape {current} sur {total}",
    validating: "Vérification...",
    available: "Disponible !",
    not_available: "Déjà utilisé",
    drag_drop: "Glissez-déposez ou cliquez",
    supported_formats: "PNG, JPG, SVG max 2MB",
    preview: "Aperçu",
    remove: "Supprimer",
    save_progress: "Progression sauvegardée",
    welcome_back: "Bon retour !",
    continue_onboarding: "Continuer où vous vous étiez arrêté",
  },
  en: {
    title: "Security Verification", 
    welcome: "Hello", 
    otp_instruction: "please enter the code received by email for your agency",
    otp_placeholder: "6-digit code", 
    validate: "Validate Premium Access",
    step_branding: "Visual Identity", 
    step_branding_title: "Personalize your space",
    field_agency: "Agency Name", 
    field_subdomain: "Subdomain (URL)", 
    field_color: "Primary color",
    field_lang: "Default language", 
    field_logo: "Logo (optional)",
    step_content: "Content & Feeds", 
    step_content_title: "Agency Details",
    field_hero: "Tagline (Hero Title)", 
    field_xml: "XML Property Feed",
    field_whatsapp: "WhatsApp", 
    field_facebook: "Facebook Link",
    next: "Next step", 
    back: "Back", 
    launch: "Start my free trial",
    error_otp: "Invalid or expired code.", 
    error_subdomain: "This subdomain is already taken.",
    error_generic: "An error occurred.",
    error_required: "This field is required.",
    error_invalid_url: "Invalid URL.",
    step_of: "Step {current} of {total}",
    validating: "Checking...",
    available: "Available!",
    not_available: "Already taken",
    drag_drop: "Drag & drop or click",
    supported_formats: "PNG, JPG, SVG max 2MB",
    preview: "Preview",
    remove: "Remove",
    save_progress: "Progress saved",
    welcome_back: "Welcome back!",
    continue_onboarding: "Continue where you left off",
  },
  es: {
    title: "Verificación de seguridad", 
    welcome: "Hola", 
    otp_instruction: "ingrese el código recibido por correo electrónico para su agencia",
    otp_placeholder: "Código de 6 dígitos", 
    validate: "Validar acceso Premium",
    step_branding: "Identidad Visual", 
    step_branding_title: "Personalice su espacio",
    field_agency: "Nombre de la agencia", 
    field_subdomain: "Subdominio (URL)", 
    field_color: "Color primario",
    field_lang: "Idioma predeterminado", 
    field_logo: "Logo (opcional)",
    step_content: "Contenido y Feeds", 
    step_content_title: "Detalles de la Agencia",
    field_hero: "Eslogan (Hero Title)", 
    field_xml: "Feed XML de propiedades",
    field_whatsapp: "WhatsApp", 
    field_facebook: "Enlace de Facebook",
    next: "Siguiente paso", 
    back: "Atrás", 
    launch: "Iniciar mi prueba gratuita",
    error_otp: "Código inválido o expirado.", 
    error_subdomain: "Este subdominio ya está en uso.",
    error_generic: "Se produjo un error.",
    error_required: "Ce champ est requis.",
    error_invalid_url: "URL invalide.",
    step_of: "Paso {current} de {total}",
    validating: "Verificando...",
    available: "¡Disponible!",
    not_available: "Ya está en uso",
    drag_drop: "Arrastre o haga clic",
    supported_formats: "PNG, JPG, SVG máx 2MB",
    preview: "Vista previa",
    remove: "Eliminar",
    save_progress: "Progreso guardado",
    welcome_back: "¡Bienvenido de nuevo!",
    continue_onboarding: "Continúa donde lo dejaste",
  }
} as const;

const successText = {
  fr: {
    title: "Félicitations !",
    subtitle: "Votre demande a bien été reçue.",
    body: "Notre équipe configure votre espace sous 24h. Vous recevrez un email à {email} dès que votre site {company} sera en ligne.",
    close_instruction: "Vous pouvez maintenant fermer cette page",
    what_now: "Et maintenant ?",
    next_steps: "Vous recevrez un email de confirmation avec vos identifiants",
    support: "Besoin d'aide ? Contactez notre support",
  },
  en: {
    title: "Congratulations!",
    subtitle: "Your request has been received.",
    body: "Our team will set up your space within 24 hours. You will receive an email at {email} once your {company} site is live.",
    close_instruction: "You can now close this page",
    what_now: "What's next?",
    next_steps: "You will receive a confirmation email with your credentials",
    support: "Need help? Contact our support",
  },
  es: {
    title: "¡Felicidades!",
    subtitle: "Su solicitud ha sido recibida.",
    body: "Nuestro equipo configurará su espacio en 24 horas. Recibirá un correo en {email} cuando su sitio {company} esté en línea.",
    close_instruction: "Ahora puede cerrar esta page",
    what_now: "¿Y ahora qué?",
    next_steps: "Recibirá un correo de confirmation con sus credenciales",
    support: "¿Necesita ayuda? Contacte a nuestro soporte",
  }
} as const;

type Lang = keyof typeof i18n;
const LANGS = Object.keys(i18n) as Lang[];
type SuccessLang = keyof typeof successText;

// ─── REDUCER POUR STATE MANAGEMENT ────────────────────────────────────────────
interface OnboardingState {
  step: number;
  loading: boolean;
  error: string;
  otp: string;
  logoPreview: string;
  subdomainAvailable: boolean | null;
  checkingSubdomain: boolean;
  formErrors: Record<string, string>;
  touched: Record<string, boolean>;
  isDirty: boolean;
  autoSaveStatus: 'idle' | 'saving' | 'saved' | 'error';
}

type OnboardingAction =
  | { type: 'SET_STEP'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'SET_OTP'; payload: string }
  | { type: 'SET_LOGO_PREVIEW'; payload: string }
  | { type: 'SET_SUBDOMAIN_AVAILABLE'; payload: boolean | null }
  | { type: 'SET_CHECKING_SUBDOMAIN'; payload: boolean }
  | { type: 'SET_FORM_ERRORS'; payload: Record<string, string> }
  | { type: 'SET_TOUCHED'; payload: Record<string, boolean> }
  | { type: 'SET_DIRTY'; payload: boolean }
  | { type: 'SET_AUTOSAVE_STATUS'; payload: 'idle' | 'saving' | 'saved' | 'error' }
  | { type: 'RESET_FORM' };

const onboardingReducer = (state: OnboardingState, action: OnboardingAction): OnboardingState => {
  switch (action.type) {
    case 'SET_STEP':
      return { ...state, step: action.payload };
    case 'SET_LOADING':
      return { ...state, loading: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_OTP':
      return { ...state, otp: action.payload };
    case 'SET_LOGO_PREVIEW':
      return { ...state, logoPreview: action.payload };
    case 'SET_SUBDOMAIN_AVAILABLE':
      return state.subdomainAvailable === action.payload ? state : { ...state, subdomainAvailable: action.payload };
    case 'SET_CHECKING_SUBDOMAIN':
      return { ...state, checkingSubdomain: action.payload };
    case 'SET_FORM_ERRORS':
      return { ...state, formErrors: action.payload };
    case 'SET_TOUCHED':
      return { ...state, touched: action.payload };
    case 'SET_DIRTY':
      return { ...state, isDirty: action.payload };
    case 'SET_AUTOSAVE_STATUS':
      return { ...state, autoSaveStatus: action.payload };
    case 'RESET_FORM':
      return {
        ...state,
        formErrors: {},
        touched: {},
        isDirty: false,
        autoSaveStatus: 'idle'
      };
    default:
      return state;
  }
};

// ─── HOOK PERSONNALISÉ POUR MEDIA QUERY ────────────────────────────────────────
const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) setMatches(media.matches);
    const listener = (e: MediaQueryListEvent) => setMatches(e.matches);
    media.addEventListener('change', listener);
    return () => media.removeEventListener('change', listener);
  }, [matches, query]);
  return matches;
};

// ─── HOOK PERSONNALISÉ POUR AUTOSAVE ───────────────────────────────────────────
const useAutoSave = (data: any, delay: number = 3000) => {
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  
  useEffect(() => {
    if (!data) return;
    
    const timeoutId = setTimeout(async () => {
      setStatus('saving');
      try {
        // Sauvegarde dans localStorage
        localStorage.setItem('onboarding_progress', JSON.stringify({
          ...data,
          savedAt: new Date().toISOString()
        }));
        setStatus('saved');
        setTimeout(() => setStatus('idle'), 2000);
      } catch (error) {
        console.error('Auto-save failed:', error);
        setStatus('error');
      }
    }, delay);
    
    return () => clearTimeout(timeoutId);
  }, [data, delay]);
  
  return { status, clearSaved: () => localStorage.removeItem('onboarding_progress') };
};

// ─── COMPOSANT STEP INDICATOR ──────────────────────────────────────────────────
function StepIndicator({ current, total, color }: { current: number; total: number; color: string }) {
  return (
    <div className="flex items-center justify-center gap-2 mb-6">
      {Array.from({ length: total }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: i + 1 === current ? 1.1 : 1, opacity: 1 }}
          transition={{ delay: i * 0.1 }}
          className="h-1 rounded-full transition-all duration-300"
          style={{
            width: i + 1 === current ? '2rem' : '1.5rem',
            backgroundColor: i + 1 <= current ? color : 'rgba(255,255,255,0.1)',
          }}
        />
      ))}
    </div>
  );
}

// ─── COMPOSANT LOGO UPLOADER ───────────────────────────────────────────────────
function LogoUploader({ 
  onUpload, 
  preview, 
  onRemove,
  lang 
}: { 
  onUpload: (file: File) => void; 
  preview: string; 
  onRemove: () => void;
  lang: Lang;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const t = i18n[lang];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && (file.type.startsWith('image/'))) {
      onUpload(file);
    }
  };

  const compressImage = (file: File): Promise<File> => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const maxWidth = 400;
          const maxHeight = 400;
          let width = img.width;
          let height = img.height;
          
          if (width > height) {
            if (width > maxWidth) {
              height *= maxWidth / width;
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width *= maxHeight / height;
              height = maxHeight;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);
          
          canvas.toBlob((blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, { type: 'image/jpeg' });
              resolve(compressedFile);
            } else {
              resolve(file);
            }
          }, 'image/jpeg', 0.8);
        };
        img.src = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (file: File) => {
    if (file.size > 2 * 1024 * 1024) {
      alert('File too large, max 2MB');
      return;
    }
    const compressed = await compressImage(file);
    onUpload(compressed);
  };

  return (
    <div className="space-y-2">
      <label className="text-[10px] font-bold tracking-wider text-white/40 uppercase flex items-center gap-2">
        <Upload size={10} /> {t.field_logo}
      </label>
      
      {preview ? (
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative group"
        >
          <div className="w-full aspect-video rounded-xl overflow-hidden border border-white/10 bg-white/[0.02]">
            <img src={preview} alt="Logo preview" className="w-full h-full object-contain p-4" />
          </div>
          <button
            onClick={onRemove}
            className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/80 backdrop-blur text-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X size={14} />
          </button>
        </motion.div>
      ) : (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
          className={`
            w-full p-6 rounded-xl border-2 border-dashed text-center cursor-pointer transition-all
            ${isDragging ? 'border-[#c5a059] bg-[#c5a059]/10' : 'border-white/10 bg-white/[0.02]'}
            hover:border-white/20 hover:bg-white/[0.04]
          `}
        >
          <Upload size={20} className="mx-auto mb-2 text-white/40" />
          <p className="text-xs text-white/40">{t.drag_drop}</p>
          <p className="text-[10px] text-white/20 mt-1">{t.supported_formats}</p>
        </div>
      )}
      
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
        className="hidden"
      />
    </div>
  );
}

// ─── COMPOSANT SUBDOMAIN CHECKER ───────────────────────────────────────────────
function SubdomainChecker({ 
  subdomain, 
  onAvailabilityChange,
  lang 
}: { 
  subdomain: string; 
  onAvailabilityChange: (available: boolean | null) => void;
  lang: Lang;
}) {
  const [status, setStatus] = useState<'checking' | 'available' | 'unavailable' | null>(null);
  const t = i18n[lang];

  useEffect(() => {
    if (!subdomain || subdomain.length < 3) {
      setStatus(null);
      onAvailabilityChange(null);
      return;
    }

    const checkAvailability = async () => {
      setStatus('checking');
      try {
        const res = await fetch(`/api/check-subdomain?subdomain=${encodeURIComponent(subdomain)}`);
        if (!res.ok) throw new Error('Subdomain check failed');
        const data = await res.json();
        const isAvailable = data.available;
        setStatus(isAvailable ? 'available' : 'unavailable');
        onAvailabilityChange(isAvailable);
      } catch {
        setStatus(null);
        onAvailabilityChange(null);
      }
    };

    const timeoutId = setTimeout(checkAvailability, 500);
    return () => clearTimeout(timeoutId);
  }, [subdomain, onAvailabilityChange]);

  if (!status) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`text-xs flex items-center gap-1 mt-1 ${
        status === 'available' ? 'text-green-400' : status === 'unavailable' ? 'text-red-400' : 'text-white/40'
      }`}
    >
      {status === 'checking' && <Loader2 size={10} className="animate-spin" />}
      {status === 'available' && <Check size={10} />}
      {status === 'unavailable' && <X size={10} />}
      <span>
        {status === 'checking' && t.validating}
        {status === 'available' && t.available}
        {status === 'unavailable' && t.not_available}
      </span>
    </motion.div>
  );
}

// ─── COMPOSANT SHIMMER BUTTON ──────────────────────────────────────────────────
function ShimmerButton({ onClick, disabled, loading, children, color = '#c5a059', variant = 'primary' }: {
  onClick?: () => void; disabled?: boolean; loading?: boolean; children: React.ReactNode; color?: string; variant?: 'primary' | 'secondary';
}) {
  return (
    <button 
      type={onClick ? "button" : "submit"} 
      onClick={onClick} 
      disabled={disabled || loading}
      className={`
        relative w-full py-4 rounded-2xl font-black text-[11px] tracking-[0.2em] uppercase 
        overflow-hidden transition-all duration-300 active:scale-[0.97] disabled:opacity-40 
        flex items-center justify-center gap-2
        ${variant === 'primary' ? 'text-black' : 'text-white bg-white/5 border border-white/10'}
      `}
      style={variant === 'primary' ? { backgroundColor: color, boxShadow: `0 8px 32px ${color}50` } : {}}
    >
      <span 
        className="absolute inset-0 pointer-events-none" 
        style={{ 
          background: `linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.4) 50%, transparent 60%)`, 
          backgroundSize: '200% 100%', 
          animation: 'shimmer 2.4s infinite' 
        }} 
      />
      <span className="relative z-10 flex items-center gap-2">
        {loading ? <Loader2 size={16} className="animate-spin" /> : children}
      </span>
      <style>{`@keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }`}</style>
    </button>
  );
}

// ─── COMPOSANT FLOAT INPUT ─────────────────────────────────────────────────────
function FloatInput({ label, value, onChange, type = 'text', placeholder, mono, error, touched, required }: {
  label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; mono?: boolean;
  error?: string; touched?: boolean; required?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const active = focused || value.length > 0;
  const isPassword = type === 'password';
  
  return (
    <div className="relative">
      <div className="absolute inset-0 rounded-2xl pointer-events-none transition-all duration-300"
        style={{ boxShadow: focused ? '0 0 0 1.5px rgba(197,160,89,0.5)' : error && touched ? '0 0 0 1px rgba(239,68,68,0.5)' : '0 0 0 1px rgba(255,255,255,0.06)' }} />
      <label className="absolute left-4 pointer-events-none select-none transition-all duration-200"
        style={{ top: active ? '0.35rem' : '50%', transform: active ? 'translateY(0) scale(0.72)' : 'translateY(-50%) scale(1)', transformOrigin: 'left top', fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase', color: focused ? '#c5a059' : error && touched ? '#ef4444' : 'rgba(255,255,255,0.25)' }}>
        {label} {required && <span className="text-[#c5a059]">*</span>}
      </label>
      <div className="relative">
        <input 
          type={isPassword && showPassword ? 'text' : type} 
          value={value} 
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)} 
          onBlur={() => setFocused(false)}
          placeholder={focused ? (placeholder || '') : ''}
          className={`
            w-full rounded-2xl bg-white/[0.04] border border-white/[0.06] text-white text-sm outline-none 
            transition-all duration-300 placeholder:text-white/20
            ${mono ? 'font-mono' : ''}
            ${error && touched ? 'border-red-500/50' : ''}
          `}
          style={{ paddingTop: '1.5rem', paddingBottom: '0.6rem', paddingLeft: '1rem', paddingRight: isPassword ? '2.5rem' : '1rem' }} 
        />
        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
          >
            {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
          </button>
        )}
      </div>
      {error && touched && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[10px] text-red-400 mt-1 ml-1">
          {error}
        </motion.p>
      )}
    </div>
  );
}

// ─── COMPOSANT SUCCESS SCREEN ──────────────────────────────────────────────────
function SuccessScreen({ lang, params, company, onClose }: { 
  lang: SuccessLang; 
  params: { email: string }; 
  company: string;
  onClose?: () => void;
}) {
  const t = successText[lang];
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex-1 flex flex-col items-center justify-center gap-6 text-center"
    >
      <motion.div 
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: "spring", stiffness: 200, damping: 15 }}
        className="relative"
      >
        <div className="absolute inset-0 rounded-full bg-green-500/20 blur-xl animate-pulse" />
        <div className="relative w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-br from-green-500/20 to-emerald-500/10 border-2 border-green-500/30">
          <motion.div
            initial={{ rotate: -180, scale: 0 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 150 }}
          >
            <CheckCircle2 size={40} className="text-green-500" strokeWidth={1.5} />
          </motion.div>
        </div>
      </motion.div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-3"
      >
        <h1 className="text-2xl text-white font-light tracking-tight">{t.title}</h1>
        <div className="w-12 h-px bg-gradient-to-r from-transparent via-green-500/50 to-transparent mx-auto" />
        <p className="text-sm font-medium text-white/60">{t.subtitle}</p>
        
        <div className="bg-white/[0.02] rounded-2xl p-4 border border-white/[0.05] mt-4 space-y-2">
          <p className="text-xs text-white/40 leading-relaxed">
            {t.body.replace('{email}', params.email).replace('{company}', company)}
          </p>
          <div className="pt-2 border-t border-white/[0.03]">
            <p className="text-[10px] text-white/30 font-mono">{t.what_now}</p>
            <p className="text-[11px] text-white/40 mt-1">{t.next_steps}</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="mt-4 space-y-3"
      >
        <div className="px-4 py-2 rounded-full bg-white/[0.03] border border-white/[0.05]">
          <p className="text-[10px] text-white/30 font-mono tracking-widest uppercase flex items-center gap-2">
            <Lock size={10} />
            {t.close_instruction}
          </p>
        </div>
        <p className="text-[9px] text-white/20">
          {t.support}
        </p>
      </motion.div>
    </motion.div>
  );
}

// ─── MAIN CONTENT COMPLET ──────────────────────────────────────────────────────
function OnboardingContent() {
  useEffect(() => {
    // Ignorer silencieusement l'erreur de contexte
    const originalError = console.error;
    console.error = (...args) => {
      if (args[0]?.includes?.('Agence non trouvée')) {
        return;
      }
      originalError.apply(console, args);
    };
    return () => {
      console.error = originalError;
    };
  }, []);
  const searchParams = useSearchParams();
  const [state, dispatch] = useReducer(onboardingReducer, {
    step: 1,
    loading: false,
    error: '',
    otp: '',
    logoPreview: '',
    subdomainAvailable: null,
    checkingSubdomain: false,
    formErrors: {},
    touched: {},
    isDirty: false,
    autoSaveStatus: 'idle'
  });

  const [lang, setLang] = useState<Lang>('fr');
  const [successLang, setSuccessLang] = useState<SuccessLang>('fr');
  const [params, setParams] = useState({ email: '', name: '', company: '' });
  const [config, setConfig] = useState({
    agency_name: '', 
    subdomain: '', 
    primary_color: '#c5a059',
    hero_title: 'PROFESSIONNELS À VOTRE SERVICE',
    default_lang: 'fr' as Lang,
    facebook: '', 
    whatsapp: '', 
    xml_url: '',
  });

  const isMobile = useMediaQuery('(max-width: 640px)');
  
  // Auto-save progress
  const { status: autoSaveStatus, clearSaved } = useAutoSave({ step: state.step, config, params }, 5000);

  const urlLang = (searchParams.get('lang') || 'fr') as Lang;
  const urlEmail = searchParams.get('email') || '';
  const urlName = searchParams.get('name') || '';
  const urlCompany = (searchParams.get('company') || '').trim();
  const urlSubdomain = urlCompany.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const safeLang: Lang = LANGS.includes(urlLang) ? urlLang : 'fr';

  // Load saved progress on mount, but never let an old agency draft override URL branding.
  useEffect(() => {
    const saved = localStorage.getItem('onboarding_progress');
    if (saved) {
      try {
        const { step, config: savedConfig, params: savedParams, savedAt } = JSON.parse(saved);
        const savedTime = new Date(savedAt);
        const now = new Date();
        const hoursDiff = (now.getTime() - savedTime.getTime()) / (1000 * 60 * 60);
        const savedCompany = (savedParams?.company || savedConfig?.agency_name || '').trim();
        
        // Only restore if less than 24 hours old and it belongs to the same agency context.
        if (hoursDiff < 24 && (!urlCompany || savedCompany === urlCompany)) {
          setStep(step);
          if (savedConfig) setConfig(savedConfig);
          if (savedParams) setParams(savedParams);
          dispatch({ type: 'SET_AUTOSAVE_STATUS', payload: 'saved' });
        } else {
          localStorage.removeItem('onboarding_progress');
        }
      } catch (e) {
        console.error('Failed to load saved progress:', e);
      }
    }
  }, [urlCompany]);

  useEffect(() => {
    setLang(safeLang);
    setSuccessLang(safeLang as SuccessLang);
    setParams({ email: urlEmail, name: urlName, company: urlCompany });
    setConfig((prev) => ({
      ...prev, 
      agency_name: urlCompany || prev.agency_name,
      subdomain: urlSubdomain || prev.subdomain,
      default_lang: safeLang,
    }));
  }, [safeLang, urlEmail, urlName, urlCompany, urlSubdomain]);

  const t = i18n[lang];
  
  const setStep = (step: number) => dispatch({ type: 'SET_STEP', payload: step });
  const setLoading = (loading: boolean) => dispatch({ type: 'SET_LOADING', payload: loading });
  const setError = (error: string) => dispatch({ type: 'SET_ERROR', payload: error });
  const setOtp = (otp: string) => dispatch({ type: 'SET_OTP', payload: otp });
  const handleSubdomainAvailabilityChange = useCallback((available: boolean | null) => {
    dispatch({ type: 'SET_SUBDOMAIN_AVAILABLE', payload: available });
  }, []);

  const validateStep = useCallback((step: number): boolean => {
    const errors: Record<string, string> = {};
    
    if (step === 2) {
      if (!config.agency_name.trim()) errors.agency_name = t.error_required;
      if (!config.subdomain.trim()) errors.subdomain = t.error_required;
      if (state.subdomainAvailable === false) errors.subdomain = t.error_subdomain;
    }
    
    if (step === 3) {
      if (config.xml_url && !config.xml_url.match(/^https?:\/\/.+/)) errors.xml_url = t.error_invalid_url;
      if (config.facebook && !config.facebook.match(/^https?:\/\/(www\.)?facebook\.com\/.+/)) errors.facebook = t.error_invalid_url;
      if (config.whatsapp && !config.whatsapp.match(/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/)) errors.whatsapp = 'Numéro invalide';
    }
    
    dispatch({ type: 'SET_FORM_ERRORS', payload: errors });
    return Object.keys(errors).length === 0;
  }, [config, state.subdomainAvailable, t]);

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/verify-otp', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: params.email, otp_code: state.otp }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) { 
        setError(t.error_otp); 
        return; 
      }
      setStep(2);
    } catch { 
      setError(t.error_generic); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleFinalize = async () => {
    if (!validateStep(3)) return;
    
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/create-agency-premium', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...config, 
          email: params.email,
          logo: state.logoPreview,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) { 
        setError(json.error || t.error_generic); 
        return; 
      }
      clearSaved(); // Clear saved progress on success
      setStep(4);
    } catch { 
      setError(t.error_generic); 
    } finally { 
      setLoading(false); 
    }
  };

  const handleNextStep = () => {
    if (validateStep(state.step)) {
      setStep(state.step + 1);
      dispatch({ type: 'SET_TOUCHED', payload: {} });
    } else {
      // Mark all fields as touched to show errors
      const allTouched: Record<string, boolean> = {};
      if (state.step === 2) {
        allTouched.agency_name = true;
        allTouched.subdomain = true;
      }
      if (state.step === 3) {
        allTouched.xml_url = true;
        allTouched.facebook = true;
        allTouched.whatsapp = true;
      }
      dispatch({ type: 'SET_TOUCHED', payload: allTouched });
    }
  };

  const pageVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 20 }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden" style={{ background: '#0a0a0a' }}>
      
      {/* Background ambient glow */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full opacity-[0.07] blur-3xl"
          style={{ background: `radial-gradient(circle, ${config.primary_color} 0%, transparent 70%)` }} />
      </div>

      {/* Auto-save indicator */}
      {autoSaveStatus !== 'idle' && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed top-4 right-4 z-50 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur border border-white/10 text-[10px] text-white/60 flex items-center gap-2"
        >
          {autoSaveStatus === 'saving' && <Loader2 size={10} className="animate-spin" />}
          {autoSaveStatus === 'saved' && <Check size={10} className="text-green-400" />}
          {autoSaveStatus === 'error' && <AlertCircle size={10} className="text-red-400" />}
          <span>{autoSaveStatus === 'saving' ? 'Sauvegarde...' : autoSaveStatus === 'saved' ? t.save_progress : 'Erreur'}</span>
        </motion.div>
      )}

      <motion.div 
        initial={{ opacity: 0, y: 30 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="relative w-full max-w-[420px]"
      >
        <div className="relative rounded-[3.2rem] p-[3px] shadow-2xl"
          style={{ background: `linear-gradient(145deg, rgba(255,255,255,0.1), rgba(255,255,255,0.02))`, boxShadow: `0 40px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.07)` }}>
          <div className="rounded-[3rem] overflow-hidden" style={{ background: '#111' }}>

            {/* Notch & Header */}
            <div className="flex justify-center pt-4 pb-1">
              <div className="w-28 h-7 rounded-full bg-black flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-white/10" />
                <div className="w-10 h-1.5 rounded-full bg-white/10" />
              </div>
            </div>

            <div className="px-6 pb-10 min-h-[560px] flex flex-col">
              {state.step < 4 && <StepIndicator current={state.step} total={3} color={config.primary_color} />}
              
              <AnimatePresence mode="wait">
                {state.step === 1 && (
                  <motion.div 
                    key="s1" 
                    variants={pageVariants}
                    initial="initial" 
                    animate="animate" 
                    exit="exit"
                    className="flex-1 flex flex-col"
                  >
                    <div className="text-center mb-8">
                      <div className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5" style={{ backgroundColor: `${config.primary_color}18`, border: `1px solid ${config.primary_color}30` }}>
                        <ShieldCheck size={28} style={{ color: config.primary_color }} />
                      </div>
                      <h1 className="text-xl font-light text-white mb-2">{t.title}</h1>
                      <p className="text-xs text-white/40">
                        {t.welcome} <span className="text-white/70 font-semibold">{params.name}</span>, {t.otp_instruction}.
                      </p>
                    </div>
                    
                    <form onSubmit={handleVerifyOTP} className="space-y-4">
                      <input 
                        type="text" 
                        maxLength={6} 
                        value={state.otp} 
                        onChange={(e) => setOtp(e.target.value)} 
                        placeholder={t.otp_placeholder} 
                        className="w-full py-5 rounded-2xl bg-white/[0.04] text-white text-center text-2xl tracking-[0.5em] outline-none border border-white/10 font-mono"
                        autoFocus
                      />
                      <ShimmerButton loading={state.loading} disabled={state.otp.length < 6} color={config.primary_color}>
                        {t.validate}
                      </ShimmerButton>
                    </form>
                    
                    {state.error && (
                      <motion.div 
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-2"
                      >
                        <AlertCircle size={14} className="text-red-400 flex-shrink-0" />
                        <p className="text-xs text-red-400">{state.error}</p>
                      </motion.div>
                    )}
                  </motion.div>
                )}

                {state.step === 2 && (
                  <motion.div 
                    key="s2" 
                    variants={pageVariants}
                    initial="initial" 
                    animate="animate" 
                    exit="exit"
                    className="space-y-4"
                  >
                    <div className="text-center">
                      <h2 className="text-lg text-white font-light flex items-center justify-center gap-2">
                        <Brush size={18} className="text-[#c5a059]" />
                        {t.step_branding_title}
                      </h2>
                      <p className="text-[10px] text-white/30 mt-1">
                        {t.step_of.replace('{current}', '1').replace('{total}', '3')}
                      </p>
                    </div>
                    
                    <FloatInput 
                      label={t.field_agency} 
                      value={config.agency_name} 
                      onChange={(v) => setConfig({...config, agency_name: v})}
                      error={state.formErrors.agency_name}
                      touched={state.touched.agency_name}
                      required
                    />
                    
                    <div>
                      <FloatInput 
                        label={t.field_subdomain} 
                        value={config.subdomain} 
                        onChange={(v) => setConfig({...config, subdomain: v.toLowerCase().replace(/[^a-z0-9-]/g, '-')})}
                        error={state.formErrors.subdomain}
                        touched={state.touched.subdomain}
                        required
                        mono
                      />
                      <SubdomainChecker 
                        subdomain={config.subdomain} 
                        onAvailabilityChange={handleSubdomainAvailabilityChange}
                        lang={lang}
                      />
                    </div>
                    
                    <FloatInput 
                      label={t.field_color} 
                      value={config.primary_color} 
                      onChange={(v) => setConfig({...config, primary_color: v})}
                      type="color"
                    />
                    
                    <FloatInput 
                      label={t.field_lang} 
                      value={config.default_lang} 
                      onChange={(v) => setConfig({...config, default_lang: v as Lang})}
                    />
                    
                    <LogoUploader 
                      onUpload={(file) => {
                        const reader = new FileReader();
                        reader.onloadend = () => dispatch({ type: 'SET_LOGO_PREVIEW', payload: reader.result as string });
                        reader.readAsDataURL(file);
                      }}
                      preview={state.logoPreview}
                      onRemove={() => dispatch({ type: 'SET_LOGO_PREVIEW', payload: '' })}
                      lang={lang}
                    />
                    
                    <ShimmerButton onClick={handleNextStep} color={config.primary_color}>
                      {t.next}
                    </ShimmerButton>
                  </motion.div>
                )}

                {state.step === 3 && (
                  <motion.div 
                    key="s3" 
                    variants={pageVariants}
                    initial="initial" 
                    animate="animate" 
                    exit="exit"
                    className="space-y-4"
                  >
                    <div className="text-center">
                      <h2 className="text-lg text-white font-light flex items-center justify-center gap-2">
                        <Zap size={18} className="text-[#c5a059]" />
                        {t.step_content_title}
                      </h2>
                      <p className="text-[10px] text-white/30 mt-1">
                        {t.step_of.replace('{current}', '2').replace('{total}', '3')}
                      </p>
                    </div>
                    
                    <FloatInput 
                      label={t.field_hero} 
                      value={config.hero_title} 
                      onChange={(v) => setConfig({...config, hero_title: v})}
                    />
                    
                    <FloatInput 
                      label={t.field_xml} 
                      value={config.xml_url} 
                      onChange={(v) => setConfig({...config, xml_url: v})}
                      error={state.formErrors.xml_url}
                      touched={state.touched.xml_url}
                      placeholder="https://..."
                    />
                    
                    <FloatInput 
                      label={t.field_whatsapp} 
                      value={config.whatsapp} 
                      onChange={(v) => setConfig({...config, whatsapp: v})}
                      error={state.formErrors.whatsapp}
                      touched={state.touched.whatsapp}
                      placeholder="+33 6 12 34 56 78"
                    />
                    
                    <FloatInput 
                      label={t.field_facebook} 
                      value={config.facebook} 
                      onChange={(v) => setConfig({...config, facebook: v})}
                      error={state.formErrors.facebook}
                      touched={state.touched.facebook}
                      placeholder="https://facebook.com/..."
                    />
                    
                    <div className="flex gap-3">
                      <ShimmerButton onClick={() => setStep(2)} color={config.primary_color} variant="secondary">
                        {t.back}
                      </ShimmerButton>
                      <ShimmerButton onClick={handleFinalize} loading={state.loading} color={config.primary_color}>
                        {t.launch}
                      </ShimmerButton>
                    </div>
                  </motion.div>
                )}

                {state.step === 4 && (
                  <SuccessScreen 
                    lang={successLang}
                    params={{ email: params.email }}
                    company={config.agency_name || params.company}
                  />
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

      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="mt-8 text-[9px] uppercase tracking-[0.3em] font-black text-center"
        style={{ color: 'rgba(255,255,255,0.15)' }}
      >
        DATA HOME PREMIUM ONBOARDING • {lang.toUpperCase()}
      </motion.p>
    </div>
  );
}

// ─── EXPORT WITH SUSPENSE ─────────────────────────────────────────────────────
export default function OnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#0a0a0a' }}>
        <div className="text-center space-y-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="text-[#c5a059]" size={40} />
          </motion.div>
          <p className="text-xs text-white/30 font-mono tracking-widest uppercase">
            Chargement de l'espace sécurisé...
          </p>
        </div>
      </div>
    }>
      <OnboardingContent />
    </Suspense>
  );
}