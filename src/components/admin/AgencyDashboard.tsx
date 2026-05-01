'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/lib/supabase';
import ModuleMarketplace from '@/components/admin/ModuleMarketplace';
import {
  Save, Plus, Globe, Image as ImageIcon, Loader2,
  CheckCircle2, AlertCircle, Palette, Phone, Mail, Layout, X,
  Video, Monitor, Type, UploadCloud, Trash2, Facebook, Instagram,
  Share2, FileCode, Linkedin, Video as TikTokIcon, Zap, Cpu, Languages,
  MousePointer2, MessageCircle, ShieldCheck, Users, UserPlus, Briefcase, FileText,
  ChevronDown, Lock, Bot, Home as HomeIcon, TrendingUp, Sparkles, Activity, Clock,
  Rocket, Sun, Moon
} from 'lucide-react';

// ============================================================
// DICTIONNAIRE DE TRADUCTION COMPLET
// ============================================================
const translations = {
  fr: {
    admin: "Administration",
    saas_title: "SaaS Agences",
    new_agency: "Nouvelle Agence",
    select_agency: "Sélectionnez une agence pour configurer son branding.",
    save: "Enregistrer les modifications",
    saving: "Enregistrement en cours...",
    success_save: "Configuration enregistrée avec succès !",
    error_save: "Erreur lors de la sauvegarde.",
    generate: "Générer l'agence",
    upload_video_error: "Erreur lors de l'upload vidéo. La vidéo doit être au format MP4 et ne pas dépasser 50 Mo.",
    upload_image_error: "Erreur lors de l'upload image. L'image ne doit pas dépasser 5 Mo.",
    sections: {
      lang_xml: "Langues & Flux XML",
      socials: "Réseaux Sociaux & Contact",
      integrations: "Intégrations",
      branding: "Identité Visuelle & Couleurs",
      hero: "Configuration du Hero Header",
      preview: "Aperçu en temps réel",
      legal: "Conformité & Légal",
      about: "Pages Statiques (About)",
      team: "Gestion de l'Équipe"
    },
    fields: {
      allowed_langs: "Langues autorisées sur le site",
      xml_sources: "Flux Immobilier (XML)",
      facebook: "Lien Facebook",
      instagram: "Lien Instagram",
      linkedin: "Lien LinkedIn",
      tiktok: "Lien TikTok",
      zoho: "Zoho CRM (ID / Token)",
      taskade: "Taskade AI Agent ID",
      agency_name: "Nom de l'enseigne",
      subdomain: "URL du site (Slug)",
      logo: "Logo de l'agence",
      font: "Police de caractères",
      font_family: "Police de caractères",
      primary_color: "Couleur Principale (Accents)",
      button_color: "Couleur des Boutons (CTA)",
      button_style: "Style des boutons",
      button_animation: "Animation des boutons",
      hero_title: "Titre d'accroche (Hero)",
      hero_type: "Type de média",
      hero_file: "Fichier Média (Image/Vidéo)",
      email: "Email de contact",
      phone: "Téléphone Fixe",
      whatsapp: "Numéro WhatsApp (GSM)",
      about_title: "Titre Page À Propos",
      about_text: "Contenu Page À Propos",
      privacy_policy: "Politique de confidentialité",
      member_name: "Nom complet",
      member_role: "Poste / Rôle",
      member_bio: "Biographie",
      member_photo: "Photo du membre"
    },
    placeholders: {
      slug: "nom-de-lagence",
      hero_text: "Découvrez nos biens d'exception...",
      about_title: "L'art de vivre l'exceptionnel...",
      about_text: "Décrivez votre agence...",
      click_upload: "Cliquer pour uploader",
      media_upload: "Charger le média",
      button: "Bouton",
      whatsapp: "Ex: 33600000000 (sans +)",
      member_name: "Jean Dupont",
      member_role: "Agent Commercial",
      member_bio: "Expert en immobilier depuis 15 ans..."
    },
    buttons: {
      add_member: "Ajouter un membre",
      remove_member: "Supprimer"
    }
  },
  en: {
    admin: "Administration",
    saas_title: "SaaS Agencies",
    new_agency: "New Agency",
    select_agency: "Select an agency to configure its branding.",
    save: "Save Settings",
    saving: "Saving...",
    success_save: "Settings saved successfully!",
    error_save: "Error while saving.",
    generate: "Generate Agency",
    upload_video_error: "Video upload error. Video must be MP4 format and less than 50MB.",
    upload_image_error: "Image upload error. Image must be less than 5MB.",
    sections: {
      lang_xml: "Languages & XML Feeds",
      socials: "Social Networks & Contact",
      integrations: "Integrations",
      branding: "Visual Identity & Colors",
      hero: "Hero Header Setup",
      preview: "Live Preview",
      legal: "Compliance & Legal",
      about: "Static Pages (About)",
      team: "Team Management"
    },
    fields: {
      allowed_langs: "Allowed site languages",
      xml_sources: "Real Estate Feeds (XML)",
      facebook: "Facebook Link",
      instagram: "Instagram Link",
      linkedin: "LinkedIn Link",
      tiktok: "TikTok Link",
      zoho: "Zoho CRM (ID / Token)",
      taskade: "Taskade AI Agent ID",
      agency_name: "Agency Name",
      subdomain: "Site URL (Slug)",
      logo: "Agency Logo",
      font: "Font Family",
      font_family: "Font Family",
      primary_color: "Primary Color (Accents)",
      button_color: "Button Color (CTA)",
      button_style: "Button Style",
      button_animation: "Button Animation",
      hero_title: "Hero Title",
      hero_type: "Media Type",
      hero_file: "Hero Media (Image/Video)",
      email: "Contact Email",
      phone: "Landline Phone",
      whatsapp: "WhatsApp Number (Mobile)",
      about_title: "About Page Title",
      about_text: "About Page Content",
      privacy_policy: "Privacy Policy",
      member_name: "Full Name",
      member_role: "Position / Role",
      member_bio: "Biography",
      member_photo: "Member Photo"
    },
    placeholders: {
      slug: "agency-name",
      hero_text: "Discover our exceptional properties...",
      about_title: "The art of exceptional living...",
      about_text: "Describe your agency...",
      click_upload: "Click to upload",
      media_upload: "Upload media",
      button: "Button",
      whatsapp: "Ex: 44600000000 (no +)",
      member_name: "John Doe",
      member_role: "Real Estate Agent",
      member_bio: "Real estate expert for 15 years..."
    },
    buttons: {
      add_member: "Add member",
      remove_member: "Remove"
    }
  },
  es: {
    admin: "Administración",
    saas_title: "SaaS Agencias",
    new_agency: "Nueva Agencia",
    select_agency: "Seleccione una agencia para configurar su branding.",
    save: "Guardar cambios",
    saving: "Guardando...",
    success_save: "¡Configuración guardada con éxito!",
    error_save: "Error al guardar.",
    generate: "Generar Agencia",
    upload_video_error: "Error al subir el video. El video debe ser MP4 y no superar los 50 MB.",
    upload_image_error: "Error al subir la imagen. La imagen no debe superar los 5 MB.",
    sections: {
      lang_xml: "Idiomas y Flujos XML",
      socials: "Redes Sociales y Contacto",
      integrations: "Integraciones",
      branding: "Identidad Visual y Colores",
      hero: "Configuración del Hero Header",
      preview: "Vista previa en tiempo real",
      legal: "Cumplimiento y Legal",
      about: "Páginas Estáticas (About)",
      team: "Gestión de Equipo"
    },
    fields: {
      allowed_langs: "Idiomas permitidos en el sitio",
      xml_sources: "Flujos Inmobiliarios (XML)",
      facebook: "Enlace Facebook",
      instagram: "Enlace Instagram",
      linkedin: "Enlace LinkedIn",
      tiktok: "Enlace TikTok",
      zoho: "Zoho CRM (ID / Token)",
      taskade: "Taskade AI Agent ID",
      agency_name: "Nombre de la agencia",
      subdomain: "URL del sitio (Slug)",
      logo: "Logo de la agencia",
      font: "Fuente tipográfica",
      font_family: "Fuente tipográfica",
      primary_color: "Color principal (Acentos)",
      button_color: "Color de botones (CTA)",
      button_style: "Estilo de botones",
      button_animation: "Animación de botones",
      hero_title: "Título de cabecera (Hero)",
      hero_type: "Tipo de medio",
      hero_file: "Archivo multimedia (Imagen/Video)",
      email: "Correo de contacto",
      phone: "Teléfono fijo",
      whatsapp: "Número WhatsApp (Móvil)",
      about_title: "Título de la página Sobre Nosotros",
      about_text: "Texto de la página Sobre Nosotros",
      privacy_policy: "Política de Privacidad",
      member_name: "Nombre completo",
      member_role: "Puesto / Rol",
      member_bio: "Biografía",
      member_photo: "Foto del miembro"
    },
    placeholders: {
      slug: "nombre-de-la-agencia",
      hero_text: "Descubra nuestras propiedades excepcionales...",
      about_title: "El arte de vivir excepcionalmente...",
      about_text: "Describa su agencia...",
      click_upload: "Clic para subir",
      media_upload: "Cargar medio",
      button: "Botón",
      whatsapp: "Ej: 34600000000 (sin +)",
      member_name: "Juan Pérez",
      member_role: "Agente Inmobiliario",
      member_bio: "Experto en bienes raíces desde hace 15 años..."
    },
    buttons: {
      add_member: "Añadir miembro",
      remove_member: "Eliminar"
    }
  },
  nl: {
    admin: "Administratie",
    saas_title: "SaaS Agentschappen",
    new_agency: "Nieuw Agentschap",
    select_agency: "Selecteer een agentschap om de branding te configureren.",
    save: "Wijzigingen opslaan",
    saving: "Opslaan...",
    success_save: "Configuratie succesvol opgeslagen!",
    error_save: "Fout bij het opslaan.",
    generate: "Agentschap genereren",
    upload_video_error: "Fout bij uploaden video. Video moet MP4 zijn en mag niet groter zijn dan 50 MB.",
    upload_image_error: "Fout bij uploaden afbeelding. Afbeelding mag niet groter zijn dan 5 MB.",
    sections: {
      lang_xml: "Talen & XML-feeds",
      socials: "Sociale netwerken & Contact",
      integrations: "Integraties",
      branding: "Visuele identiteit & Kleuren",
      hero: "Hero Header configuratie",
      preview: "Live voorbeeld",
      legal: "Compliance & Wettelijk",
      about: "Statische Pagina's (Over ons)",
      team: "Teambeheer"
    },
    fields: {
      allowed_langs: "Toegestane talen op de site",
      xml_sources: "Vastgoedfeeds (XML)",
      facebook: "Facebook-link",
      instagram: "Instagram-link",
      linkedin: "LinkedIn-link",
      tiktok: "TikTok-link",
      zoho: "Zoho CRM (ID / Token)",
      taskade: "Taskade AI Agent ID",
      agency_name: "Naam van het agentschap",
      subdomain: "Website URL (Slug)",
      logo: "Logo van het agentschap",
      font: "Lettertype",
      font_family: "Lettertype",
      primary_color: "Hoofdkleur (Accenten)",
      button_color: "Kleur van knoppen (CTA)",
      button_style: "Stijl van knoppen",
      button_animation: "Animatie van knoppen",
      hero_title: "Hero titel",
      hero_type: "Mediatype",
      hero_file: "Mediabestand (Afbeelding/Video)",
      email: "Contact e-mail",
      phone: "Vaste lijn",
      whatsapp: "WhatsApp-nummer (Mobiel)",
      about_title: "Titel over ons pagina",
      about_text: "Tekst over ons pagina",
      privacy_policy: "Privacybeleid",
      member_name: "Volledige naam",
      member_role: "Functie / Rol",
      member_bio: "Biografie",
      member_photo: "Foto van het lid"
    },
    placeholders: {
      slug: "naam-van-agentschap",
      hero_text: "Ontdek onze exclusieve panden...",
      about_title: "De kunst van exceptioneel wonen...",
      about_text: "Beschrijf uw agentschap...",
      click_upload: "Klik om te uploaden",
      media_upload: "Media uploaden",
      button: "Knop",
      whatsapp: "Bijv: 31600000000 (zonder +)",
      member_name: "Jan Jansen",
      member_role: "Makelaar",
      member_bio: "Vastgoedexpert sinds 15 jaar..."
    },
    buttons: {
      add_member: "Lid toevoegen",
      remove_member: "Verwijderen"
    }
  }
};

const DISPONIBLE_XML_SOURCES = [
  { id: 'cb', name: "Costa Blanca", url: "https://medianewbuild.com/file/hh-media-bucket/agents/6d5cb68a-3636-4095-b0ce-7dc9ec2df2d2/feed_blanca_calida.xml" },
  { id: 'cs', name: "Costa del Sol", url: "https://medianewbuild.com/file/hh-media-bucket/agents/6d5cb68a-3636-4095-b0ce-7dc9ec2df2d2/feed_sol.xml" }
];

const SUPPORTED_LANGUAGES = [
  { code: 'fr', label: 'Français' },
  { code: 'en', label: 'English' },
  { code: 'es', label: 'Español' },
  { code: 'nl', label: 'Nederlands' },
];

// ============================================================
// ANIMATION VARIANTS
// ============================================================
const stagger = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.07 } }
};
const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } }
};

// ============================================================
// TOGGLE SWITCH COMPONENT — neon glow dark mode
// ============================================================
function ToggleSwitch({ checked, onChange, checkedColor = '#6366f1' }: { checked: boolean; onChange: (v: boolean) => void; checkedColor?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border border-transparent transition-all duration-300 focus:outline-none"
      style={{
        backgroundColor: checked ? checkedColor : 'rgba(255,255,255,0.08)',
        boxShadow: checked ? `0 0 14px ${checkedColor}55` : 'none'
      }}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-5 w-5 rounded-full shadow-lg transform transition duration-300 ease-in-out ${checked ? 'translate-x-5 bg-white' : 'translate-x-0 bg-white/40'}`}
      />
    </button>
  );
}

export default function AgencyDashboard() {
  const [lang, setLang] = useState<'fr' | 'en'>('fr');
  const [isDark, setIsDark] = useState(true);
  const t = translations[lang];

  const [agencies, setAgencies] = useState<any[]>([]);
  const [pendingAgencies, setPendingAgencies] = useState<any[]>([]);
  const [pendingRegistrations, setPendingRegistrations] = useState<any[]>([]);
  const [preRegistrations, setPreRegistrations] = useState<any[]>([]);
  const [selectedPreRegistration, setSelectedPreRegistration] = useState<any>(null);
  const [activePanel, setActivePanel] = useState<'agency' | 'preregistration'>('agency');
  const [preRegForm, setPreRegForm] = useState({ subdomain: '', packageLevel: 'silver', defaultLang: 'fr', xmlUrl: '', whatsapp: '' });
  const [isPublishing, setIsPublishing] = useState(false);
  const [selectedAgency, setSelectedAgency] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [marketplaceModule, setMarketplaceModule] = useState<string | null>(null);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [team, setTeam] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'agencies' | 'pending'>('agencies');
  const [publishingId, setPublishingId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [loadingPending, setLoadingPending] = useState(false);

  // Integration panel expand state
  const [intOpen, setIntOpen] = useState({ propertyManager: false, whatsapp: false, crm: false, chatbot: false, leadsCrm: false });

  const [newAgency, setNewAgency] = useState({
    agency_name: '',
    subdomain: '',
    package_level: 'silver'
  });

  const fetchPendingAgencies = async () => {
    setLoadingPending(true);
    try {
      const [agenciesRes, regsRes, preRegsRes] = await Promise.all([
        supabase
          .from('agency_settings')
          .select('*')
          .eq('website_status', 'pending')
          .order('created_at', { ascending: false }),
        fetch('/api/admin/pending-registrations'),
        supabase
          .from('register_premium')
          .select('*')
          .neq('status', 'published')
          .order('created_at', { ascending: false }),
      ]);
      if (agenciesRes.error) throw agenciesRes.error;
      setPendingAgencies(agenciesRes.data || []);
      setPreRegistrations(preRegsRes.data || []);
      if (regsRes.ok) {
        const regs = await regsRes.json();
        setPendingRegistrations(Array.isArray(regs) ? regs : []);
      }
    } catch (err) {
      console.error('fetchPendingAgencies error:', err);
    } finally {
      setLoadingPending(false);
    }
  };

  const fetchAgencies = async () => {
    try {
      const { data, error } = await supabase.from('agency_settings').select('*');
      if (error) throw error;
      setAgencies(data || []);
      if (data && data.length > 0 && !selectedAgency) {
        setSelectedAgency(data[0]);
        setTeam(data[0].team_data || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgencies();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (activeTab === 'pending') fetchPendingAgencies();
  }, [activeTab]);

  useEffect(() => {
    if (selectedAgency) {
      setTeam(selectedAgency.team_data || []);
      const ints = selectedAgency?.footer_config?.integrations || {};
      setIntOpen({
        propertyManager: !!ints.property_manager_enabled,
        whatsapp: false,
        crm: false,
        chatbot: false,
        leadsCrm: false,
      });
    }
  }, [selectedAgency?.id]);

  useEffect(() => {
    if (selectedPreRegistration) {
      setPreRegForm({
        subdomain: selectedPreRegistration.company_name?.toLowerCase().replace(/\s+/g, '-') || '',
        packageLevel: 'silver',
        defaultLang: selectedPreRegistration.preferred_language || 'fr',
        xmlUrl: '',
        whatsapp: '',
      });
    }
  }, [selectedPreRegistration?.id]);

  // ---- Helpers ----

  const getInt = (field: string) => selectedAgency?.footer_config?.integrations?.[field];
  const getSub = (field: string) => selectedAgency?.footer_config?.subscription?.[field];

  const updateNestedConfig = (section: string, field: string, value: any) => {
    if (!selectedAgency) return;
    setSelectedAgency((prev: any) => {
      let currentConfig: any = {};
      if (typeof prev.footer_config === 'string') {
        try { currentConfig = JSON.parse(prev.footer_config); } catch { currentConfig = {}; }
      } else {
        currentConfig = prev.footer_config || {};
      }
      return {
        ...prev,
        footer_config: {
          ...currentConfig,
          [section]: { ...(currentConfig[section] || {}), [field]: value }
        }
      };
    });
  };

  const updateRootConfig = (field: string, value: any) => {
    if (!selectedAgency) return;
    setSelectedAgency((prev: any) => {
      let currentConfig: any = {};
      if (typeof prev.footer_config === 'string') {
        try { currentConfig = JSON.parse(prev.footer_config); } catch { currentConfig = {}; }
      } else {
        currentConfig = prev.footer_config || {};
      }
      return { ...prev, footer_config: { ...currentConfig, [field]: value } };
    });
  };

  const toggleXmlSource = (url: string) => {
    if (!selectedAgency) return;
    setSelectedAgency((prev: any) => {
      const currentFooterConfig = prev.footer_config || {};
      const currentXmlUrls = currentFooterConfig.xml_urls || [];
      const newXmlUrls = currentXmlUrls.includes(url)
        ? currentXmlUrls.filter((u: string) => u !== url)
        : [...currentXmlUrls, url];
      return { ...prev, footer_config: { ...currentFooterConfig, xml_urls: newXmlUrls } };
    });
  };

  const toggleLanguage = (code: string) => {
    const currentConfig = selectedAgency.footer_config || {};
    const currentLangs = currentConfig.allowed_langs || ['fr'];
    const newLangs = currentLangs.includes(code)
      ? currentLangs.filter((l: string) => l !== code)
      : [...currentLangs, code];
    setSelectedAgency({ ...selectedAgency, footer_config: { ...currentConfig, allowed_langs: newLangs } });
  };

  const setDefaultLang = (code: string) => setSelectedAgency({ ...selectedAgency, default_lang: code });

  const addMember = () => {
    const newTeam = [...team, { name: "", role: "", bio: "", photo: "" }];
    setTeam(newTeam);
    setSelectedAgency({ ...selectedAgency, team_data: newTeam });
  };

  const uploadToStorage = async (file: File, filePath: string): Promise<string> => {
    const res = await fetch('/api/admin/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filePath }),
    });
    if (!res.ok) { const err = await res.json(); throw new Error(err.error); }
    const { signedUrl, publicUrl } = await res.json();
    const uploadRes = await fetch(signedUrl, {
      method: 'PUT',
      headers: { 'Content-Type': file.type },
      body: file,
    });
    if (!uploadRes.ok) throw new Error('Upload direct échoué');
    return publicUrl;
  };

  const updateMember = (index: number, field: string, value: string) => {
    const newTeam = [...team];
    newTeam[index][field] = value;
    setTeam(newTeam);
    setSelectedAgency({ ...selectedAgency, team_data: newTeam });
  };

  const removeMember = (index: number) => {
    const newTeam = team.filter((_, i) => i !== index);
    setTeam(newTeam);
    setSelectedAgency({ ...selectedAgency, team_data: newTeam });
  };

  const handleMemberPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file || !selectedAgency) return;
    try {
      setIsSaving(true);
      const fileExt = file.name.split('.').pop();
      const filePath = `${selectedAgency.subdomain}/team/team_${Date.now()}_${Math.random()}.${fileExt}`;
      const publicUrl = await uploadToStorage(file, filePath);
      const newTeam = [...team];
      newTeam[index].photo = publicUrl;
      setTeam(newTeam);
      setSelectedAgency({ ...selectedAgency, team_data: newTeam });
    } catch { setMessage({ type: 'error', text: "Upload Error" }); }
    finally { setIsSaving(false); }
  };

  // Fonction pour gérer l'upload du logo
  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedAgency) return;
    
    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: t.upload_image_error });
      setTimeout(() => setMessage(null), 5000);
      return;
    }
    
    try {
      setIsSaving(true);
      const fileExt = file.name.split('.').pop();
      const filePath = `${selectedAgency.subdomain}/branding/logo_${Date.now()}.${fileExt}`;
      const publicUrl = await uploadToStorage(file, filePath);
      setSelectedAgency({ ...selectedAgency, logo_url: publicUrl });
      setMessage({ type: 'success', text: "Logo téléchargé avec succès !" });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ type: 'error', text: "Erreur lors de l'upload du logo" });
    } finally {
      setIsSaving(false);
    }
  };

  // Fonction pour gérer l'upload du média héros (image ou vidéo)
  const handleHeroUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedAgency) return;

    const isVideo = file.type.startsWith('video/');
    
    // Validation pour les vidéos
    if (isVideo) {
      if (!file.type.includes('mp4')) {
        setMessage({ type: 'error', text: t.upload_video_error || "Format vidéo non supporté. Utilisez MP4." });
        setTimeout(() => setMessage(null), 5000);
        return;
      }
      if (file.size > 50 * 1024 * 1024) {
        setMessage({ type: 'error', text: t.upload_video_error || "La vidéo ne doit pas dépasser 50 Mo." });
        setTimeout(() => setMessage(null), 5000);
        return;
      }
    } else {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: t.upload_image_error || "L'image ne doit pas dépasser 5 Mo." });
        setTimeout(() => setMessage(null), 5000);
        return;
      }
    }

    try {
      setIsSaving(true);
      const fileExt = file.name.split('.').pop();
      const timestamp = Date.now();
      const randomId = Math.random().toString(36).substring(2, 8);
      const folder = isVideo ? 'hero-video' : 'hero';
      const filePath = `${selectedAgency.subdomain}/${folder}/${timestamp}_${randomId}.${fileExt}`;

      const publicUrl = await uploadToStorage(file, filePath);

      setSelectedAgency({
        ...selectedAgency,
        hero_url: publicUrl,
        hero_type: isVideo ? 'video' : 'image'
      });

      setMessage({ type: 'success', text: isVideo ? "Vidéo téléchargée avec succès !" : "Image téléchargée avec succès !" });
      setTimeout(() => setMessage(null), 3000);

    } catch (error: any) {
      console.error('Upload error:', error);
      setMessage({ type: 'error', text: error.message || "Erreur lors de l'upload." });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setIsSaving(false);
      e.target.value = '';
    }
  };

  // Fonction pour supprimer le média héros
  const handleRemoveHero = async () => {
    if (!selectedAgency?.hero_url) return;
    
    try {
      setIsSaving(true);
      const urlParts = selectedAgency.hero_url.split('/object/public/agencies/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage.from('agencies').remove([filePath]);
      }
      setSelectedAgency({ ...selectedAgency, hero_url: null, hero_type: 'image' });
      setMessage({ type: 'success', text: "Média supprimé avec succès !" });
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      console.error('Delete error:', error);
      setMessage({ type: 'error', text: "Erreur lors de la suppression" });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    setDeleteConfirmId(null);
    try {
      setIsSaving(true);
      const res = await fetch(`/api/admin/delete-agency?id=${encodeURIComponent(id)}`, { method: 'DELETE' });
      const json = await res.json();
      console.log('[delete-agency] réponse API:', json);
      if (!res.ok || !json.success) {
        const detail = json.code ? `[${json.code}] ${json.error}` : (json.error || `HTTP ${res.status}`);
        throw new Error(detail);
      }
      const { data } = await supabase.from('agency_settings').select('*');
      setAgencies(data || []);
      if (selectedAgency?.id === id) {
        setSelectedAgency(data && data.length > 0 ? data[0] : null);
        setTeam(data?.[0]?.team_data || []);
      }
      setMessage({ type: 'success', text: `"${name}" supprimée` });
    } catch (err: any) {
      console.error('handleDelete error:', err);
      const msg = err?.message || t.error_save;
      setDeleteError(msg);
      setTimeout(() => setDeleteError(null), 6000);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    if (e) { e.preventDefault(); e.stopPropagation(); }
    if (!selectedAgency?.id) {
      setMessage({ type: 'error', text: "ID de l'agence manquant" });
      return;
    }
    setIsSaving(true);
    try {
      const teamDataToSave = JSON.parse(JSON.stringify(team));
      
      let footerConfig = selectedAgency.footer_config;
      if (typeof footerConfig === 'string') {
        try { footerConfig = JSON.parse(footerConfig); } catch { footerConfig = {}; }
      }
      
      const { data, error } = await supabase
        .from('agency_settings')
        .update({
          agency_name: selectedAgency.agency_name,
          subdomain: selectedAgency.subdomain,
          primary_color: selectedAgency.primary_color,
          button_color: selectedAgency.button_color,
          button_style: selectedAgency.button_style || 'rounded-full',
          button_animation: selectedAgency.button_animation || 'none',
          font_family: selectedAgency.font_family,
          hero_title: selectedAgency.hero_title,
          hero_type: selectedAgency.hero_type || 'image',
          hero_url: selectedAgency.hero_url,
          logo_url: selectedAgency.logo_url,
          default_lang: selectedAgency.default_lang,
          cookie_consent_enabled: selectedAgency.cookie_consent_enabled,
          privacy_policy: selectedAgency.privacy_policy,
          about_title: selectedAgency.about_title,
          about_text: selectedAgency.about_text,
          whatsapp_number: selectedAgency.whatsapp_number,
          footer_config: footerConfig,
          habihub_agent_id: selectedAgency.habihub_agent_id || null,
          team_data: teamDataToSave,
          updated_at: new Date().toISOString(),
        })
        .eq('id', selectedAgency.id)
        .select();

      if (error) throw error;

      if (data && data.length > 0) {
        setMessage({ type: 'success', text: t.success_save });
        setSelectedAgency(data[0]);
        setTeam(data[0].team_data || []);
        setAgencies(prev => prev.map(a => a.id === selectedAgency.id ? data[0] : a));
      } else {
        setMessage({ type: 'error', text: "Erreur: Agence non trouvée avec cet ID" });
      }
    } catch (err: any) {
      console.error('Save error:', err);
      setMessage({ type: 'error', text: t.error_save + " : " + err.message });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const handleCreateAgency = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from('agency_settings')
        .insert({
          agency_name: newAgency.agency_name,
          subdomain: newAgency.subdomain,
          package_level: newAgency.package_level,
          button_style: 'rounded-full',
          button_animation: 'none',
          hero_type: 'image',
          footer_config: { allowed_langs: ['fr', 'en'], xml_urls: [], socials: {}, integrations: {} },
          team_data: [],
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select();
      if (error) throw error;
      setShowCreateModal(false);
      setNewAgency({ agency_name: '', subdomain: '', package_level: 'silver' });
      const { data: agenciesData } = await supabase.from('agency_settings').select('*');
      setAgencies(agenciesData || []);
      if (data && data[0]) setSelectedAgency(data[0]);
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: "Create Error" });
    } finally { setIsCreating(false); }
  };

  const handlePublish = async (agency: any) => {
    if (!confirm(`Publier le site de "${agency.agency_name}" ?`)) return;
    setPublishingId(agency.id);
    try {
      const currentFooter = typeof agency.footer_config === 'string'
        ? JSON.parse(agency.footer_config)
        : (agency.footer_config || {});
      const updatedFooter = {
        ...currentFooter,
        subscription: { ...(currentFooter.subscription || {}), website_active: true },
      };
      const { error } = await supabase
        .from('agency_settings')
        .update({ website_status: 'active', footer_config: updatedFooter, updated_at: new Date().toISOString() })
        .eq('id', agency.id);
      if (error) throw error;
      setPendingAgencies((prev) => prev.filter((a) => a.id !== agency.id));
      setAgencies((prev) => prev.map((a) => a.id === agency.id ? { ...a, website_status: 'active', footer_config: updatedFooter } : a));
      setMessage({ type: 'success', text: `${agency.agency_name} est maintenant en ligne !` });
      setTimeout(() => setMessage(null), 4000);
    } catch (err: any) {
      console.error('Publish error:', err);
      setMessage({ type: 'error', text: 'Erreur lors de la publication : ' + err.message });
      setTimeout(() => setMessage(null), 4000);
    } finally {
      setPublishingId(null);
    }
  };

  const handlePublishPreRegistration = async () => {
    if (!selectedPreRegistration) return;
    if (!preRegForm.subdomain.trim()) {
      setMessage({ type: 'error', text: 'Le sous-domaine est requis' });
      setTimeout(() => setMessage(null), 4000);
      return;
    }
    setIsPublishing(true);
    try {
      // Ensure status is 'verified' so the API check passes
      if (selectedPreRegistration.status !== 'verified') {
        const { error: verifyErr } = await supabase
          .from('register_premium')
          .update({ status: 'verified' })
          .eq('id', selectedPreRegistration.id);
        if (verifyErr) throw verifyErr;
      }

      const primaryColor = selectedPreRegistration.primary_color || '#D4AF37';
      const res = await fetch('/api/create-agency-premium', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: selectedPreRegistration.email,
          agency_name: selectedPreRegistration.company_name,
          subdomain: preRegForm.subdomain,
          primary_color: primaryColor,
          logo_url: selectedPreRegistration.logo_url || '',
          default_lang: preRegForm.defaultLang,
          xml_url: preRegForm.xmlUrl,
          whatsapp: preRegForm.whatsapp,
          package_level: preRegForm.packageLevel,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.success) throw new Error(json.error || 'Erreur création agence');

      // Envoyer l'email de bienvenue avec les identifiants provisoires (non bloquant)
      fetch('/api/admin/send-welcome-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          agency_id:       json.agency_id,
          email:           selectedPreRegistration.email,
          first_name:      selectedPreRegistration.first_name,
          company_name:    selectedPreRegistration.company_name,
          subdomain:       preRegForm.subdomain,
          default_lang:    preRegForm.defaultLang,
          package_level:   preRegForm.packageLevel,
          trial_expires_at: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString(),
        }),
      }).catch(err => console.error('[welcome-email]', err));

      // Mark pre-registration as converted (removed from DEMANDES)
      await supabase
        .from('register_premium')
        .update({ status: 'published' })
        .eq('id', selectedPreRegistration.id);

      // Remove from DEMANDES lists
      setPreRegistrations(prev => prev.filter(r => r.id !== selectedPreRegistration.id));
      setPendingRegistrations(prev => prev.filter(r => r.id !== selectedPreRegistration.id));
      setSelectedPreRegistration(null);

      // Refresh agencies list, switch to AGENCES tab and open the new agency
      const { data: refreshedAgencies } = await supabase.from('agency_settings').select('*');
      if (refreshedAgencies) {
        setAgencies(refreshedAgencies);
        const newAgencyData = refreshedAgencies.find((a: any) => a.subdomain === preRegForm.subdomain);
        if (newAgencyData) {
          setSelectedAgency(newAgencyData);
          setTeam(newAgencyData.team_data || []);
        }
      }
      setLoading(false);
      setActiveTab('agencies');
      setActivePanel('agency');

      setMessage({ type: 'success', text: '✅ Agence créée — complétez la configuration avant la mise en ligne' });
      setTimeout(() => setMessage(null), 6000);
    } catch (err: any) {
      console.error('Convert preregistration error:', err);
      setMessage({ type: 'error', text: err.message || 'Erreur lors de la création de l\'agence' });
      setTimeout(() => setMessage(null), 5000);
    } finally {
      setIsPublishing(false);
    }
  };

  // KPI computed values
  const activeModulesCount = selectedAgency ? [
    getSub('website_active') !== false,
    getSub('blur_listings') === true,
    !!getInt('property_manager_enabled'),
    !!getInt('whatsapp_enabled'),
    !!getInt('chatbot_enabled'),
    !!getInt('crm_enabled'),
    !!getInt('leads_enabled'),
  ].filter(Boolean).length : 0;

  const siteIsActive = !selectedAgency || getSub('website_active') !== false;

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-[#070c1a]">
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-14 h-14">
          <div className="absolute inset-0 rounded-full border border-indigo-500/20 animate-ping" />
          <div className="absolute inset-2 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
        </div>
        <span className="text-white/30 text-[10px] font-bold uppercase tracking-widest">Chargement...</span>
      </div>
    </div>
  );

  const inp = `w-full border rounded-xl px-5 py-4 text-sm focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-500/40 outline-none transition-all ${isDark ? 'bg-white/[0.05] border-white/[0.08] text-white placeholder-white/25' : 'bg-[var(--d-inp-bg)] border-[var(--d-inp-border)] text-[var(--d-text)] placeholder:text-[var(--d-text-25)]'}`;
  const lbl = `block text-[10px] font-bold uppercase tracking-widest mb-2 ${isDark ? 'text-white/40' : 'text-[var(--d-text-40)]'}`;
  const cardCls = `border rounded-2xl p-7 space-y-6 transition-all duration-300 ${isDark ? 'bg-white/[0.03] border-white/[0.06] hover:border-white/[0.10]' : 'bg-[var(--d-card)] border-[var(--d-card-border)] shadow-sm hover:shadow-md'}`;
  const sHdr = `flex items-center gap-3 font-bold uppercase text-xs tracking-widest border-b pb-4 ${isDark ? 'text-white/80 border-white/[0.06]' : 'text-[var(--d-text-80)] border-[var(--d-divider)]'}`;

  return (
    <div
      className={`flex h-screen font-sans overflow-hidden transition-colors duration-300 ${isDark ? 'dash-dark text-white bg-[#070c1a]' : 'dash-light text-slate-900 bg-slate-100'}`}
    >

      {/* SIDEBAR — glass morphism */}
      <aside className={`w-72 flex-shrink-0 backdrop-blur-2xl flex flex-col transition-colors duration-300 ${isDark ? 'bg-[#0d1528]/70 border-r border-white/[0.06]' : 'bg-white border-r border-slate-200 shadow-sm'}`}>
        <div className="p-6 border-b border-white/[0.05]">
          <div className="flex justify-between items-center mb-5">
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white/[0.06] border border-white/[0.06] rounded-lg text-[9px] font-bold uppercase tracking-widest hover:bg-white/[0.10] transition-all text-white/50"
              >
                <Languages size={11} /> {lang.toUpperCase()}
              </button>
              <button
                onClick={() => setIsDark(v => !v)}
                title={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
                className="p-1.5 rounded-lg bg-white/[0.06] border border-white/[0.06] hover:bg-white/[0.10] transition-all text-white/50"
              >
                {isDark ? <Sun size={13} /> : <Moon size={13} />}
              </button>
            </div>
            <button onClick={() => setShowCreateModal(true)} className="p-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/30 active:scale-95">
              <Plus size={16} />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <img src="/logo-data-home.jpeg" alt="DataHome" className="w-11 h-11 rounded-xl object-cover border border-white/[0.08] shadow-lg shadow-black/30" />
            <div>
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/25">DataHome</p>
              <p className="font-bold text-sm text-white leading-tight">{t.saas_title}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-3 pt-2 pb-1 flex gap-1">
          <button
            onClick={() => { setActiveTab('agencies'); setActivePanel('agency'); setSelectedPreRegistration(null); }}
            className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === 'agencies' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-white/30 hover:text-white/50 hover:bg-white/[0.04]'}`}
          >
            Agences
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`flex-1 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-1 ${activeTab === 'pending' ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30' : 'text-white/30 hover:text-white/50 hover:bg-white/[0.04]'}`}
          >
            <Clock size={9} />
            Demandes
            {(pendingAgencies.length + preRegistrations.length) > 0 && (
              <span className="bg-orange-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center leading-none">
                {pendingAgencies.length + preRegistrations.length}
              </span>
            )}
          </button>
        </div>

        {/* Toast erreur suppression — toujours visible dans la sidebar */}
        <AnimatePresence>
          {deleteError && (
            <motion.div
              initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }}
              className="mx-3 mt-1 px-3 py-2 bg-red-500/15 border border-red-500/30 rounded-xl flex items-start gap-2"
            >
              <AlertCircle size={12} className="text-red-400 mt-0.5 flex-shrink-0" />
              <span className="text-[10px] text-red-300 font-semibold leading-tight">{deleteError}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {activeTab === 'agencies' ? (
          <nav className="flex-1 overflow-y-auto p-3 space-y-1">
            {agencies.map((agency) => (
              <div key={agency.id} className="relative group">
                {deleteConfirmId === agency.id ? (
                  /* Confirmation inline — remplace le bouton de sélection */
                  <div className="w-full px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-between gap-2">
                    <span className="text-[10px] text-red-300 font-semibold truncate">Supprimer «&nbsp;{agency.agency_name}&nbsp;» ?</span>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => handleDelete(agency.id, agency.agency_name)}
                        className="px-2.5 py-1 bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold rounded-lg transition-all"
                      >
                        Oui
                      </button>
                      <button
                        onClick={() => setDeleteConfirmId(null)}
                        className="px-2.5 py-1 bg-white/[0.08] hover:bg-white/[0.14] text-white/60 text-[10px] font-bold rounded-lg transition-all"
                      >
                        Non
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <button
                      onClick={() => { setSelectedAgency(agency); setTeam(agency.team_data || []); setActivePanel('agency'); setSelectedPreRegistration(null); }}
                      className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all duration-200 relative ${selectedAgency?.id === agency.id ? 'text-white' : 'text-white/40 hover:text-white/70 hover:bg-white/[0.03]'}`}
                    >
                      {selectedAgency?.id === agency.id && (
                        <motion.div layoutId="sidebar-indicator" className="absolute inset-0 rounded-xl bg-indigo-500/10 border border-indigo-500/25" />
                      )}
                      <div className="relative z-10">
                        <div className="font-semibold text-[13px] flex items-center gap-1 pr-6">
                          <span className="truncate">{agency.agency_name}</span>
                          {agency.website_status === 'pending' && (
                            <span className="text-[8px] bg-orange-100 text-orange-600 font-bold px-1.5 py-0.5 rounded-full ml-1">
                              En attente
                            </span>
                          )}
                        </div>
                        <div className="text-[9px] opacity-40 mt-0.5 uppercase tracking-wider">{agency.subdomain}</div>
                      </div>
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(agency.id); }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-white/15 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                    >
                      <Trash2 size={13} />
                    </button>
                  </>
                )}
              </div>
            ))}
          </nav>
        ) : (
          <nav className="flex-1 overflow-y-auto p-3 space-y-2">
            <div className="flex justify-end mb-1">
              <button
                onClick={fetchPendingAgencies}
                disabled={loadingPending}
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[9px] font-bold uppercase tracking-widest text-white/30 hover:text-white/60 hover:bg-white/[0.05] transition-all disabled:opacity-40"
              >
                {loadingPending ? <Loader2 size={9} className="animate-spin" /> : <Activity size={9} />}
                Actualiser
              </button>
            </div>
            {loadingPending ? (
              <div className="flex justify-center pt-6"><Loader2 size={18} className="animate-spin text-orange-400/50" /></div>
            ) : (
              <>
                {/* Agences prêtes à publier */}
                {pendingAgencies.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-[8px] font-black uppercase tracking-widest text-emerald-400/60 px-1 pb-0.5 border-b border-emerald-500/10">
                      À publier ({pendingAgencies.length})
                    </p>
                    {pendingAgencies.map((agency) => (
                      <div key={agency.id} className="relative group">
                        {deleteConfirmId === agency.id ? (
                          <div className="w-full px-3 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-between gap-2">
                            <span className="text-[10px] text-red-300 font-semibold truncate">Supprimer «&nbsp;{agency.agency_name}&nbsp;» ?</span>
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <button
                                onClick={() => handleDelete(agency.id, agency.agency_name)}
                                className="px-2.5 py-1 bg-red-500 hover:bg-red-600 text-white text-[10px] font-bold rounded-lg transition-all"
                              >
                                Oui
                              </button>
                              <button
                                onClick={() => setDeleteConfirmId(null)}
                                className="px-2.5 py-1 bg-white/[0.08] hover:bg-white/[0.14] text-white/60 text-[10px] font-bold rounded-lg transition-all"
                              >
                                Non
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div
                            className={`border rounded-xl p-3 space-y-2 cursor-pointer transition-all ${selectedAgency?.id === agency.id ? 'bg-emerald-500/10 border-emerald-500/40' : 'bg-white/[0.03] border-emerald-500/20 hover:border-emerald-500/35'}`}
                            onClick={() => { setSelectedAgency(agency); setTeam(agency.team_data || []); setActivePanel('agency'); setSelectedPreRegistration(null); }}
                          >
                            <div className="pr-5">
                              <div className="font-semibold text-[13px] text-white truncate">{agency.agency_name}</div>
                              <div className="text-[9px] text-white/30 uppercase tracking-wider font-mono">{agency.subdomain}</div>
                              <div className="text-[9px] text-white/20 mt-0.5">
                                {agency.created_at ? new Date(agency.created_at).toLocaleDateString('fr-FR') : '—'}
                              </div>
                            </div>
                            <button
                              onClick={(e) => { e.stopPropagation(); handlePublish(agency); }}
                              disabled={publishingId === agency.id}
                              className="w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all disabled:opacity-50"
                            >
                              {publishingId === agency.id ? <Loader2 size={11} className="animate-spin" /> : <CheckCircle2 size={11} />}
                              Publier
                            </button>
                            <button
                              onClick={(e) => { e.stopPropagation(); setDeleteConfirmId(agency.id); }}
                              className="absolute right-2 top-2 p-1.5 text-white/15 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Pré-inscriptions (register_premium) */}
                {preRegistrations.length > 0 && (
                  <div className="space-y-2 mt-3">
                    <p className="text-[8px] font-black uppercase tracking-widest text-orange-400/60 px-1 pb-0.5 border-b border-orange-500/10">
                      Pré-inscriptions ({preRegistrations.length})
                    </p>
                    {preRegistrations.map((reg) => (
                      <div
                        key={reg.id}
                        className={`rounded-xl p-3 cursor-pointer transition-all ${
                          selectedPreRegistration?.id === reg.id
                            ? 'bg-amber-500/10 border border-amber-500/40'
                            : 'bg-white/[0.02] border border-orange-500/15 hover:border-orange-500/35'
                        }`}
                        onClick={() => { setSelectedPreRegistration(reg); setActivePanel('preregistration'); }}
                      >
                        <div className="font-semibold text-[12px] text-white/80 truncate">{reg.company_name || '—'}</div>
                        <div className="text-[9px] text-white/40 mt-0.5">{reg.first_name} {reg.last_name}</div>
                        <div className="text-[9px] text-white/25 font-mono truncate">{reg.email}</div>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-[8px] text-white/20">
                            {reg.created_at ? new Date(reg.created_at).toLocaleDateString('fr-FR') : '—'}
                          </span>
                          <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full ${reg.status === 'verified' ? 'bg-blue-500/20 text-blue-300' : 'bg-orange-500/20 text-orange-300'}`}>
                            {reg.status === 'verified' ? 'OTP ✓' : 'En attente OTP'}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {pendingAgencies.length === 0 && preRegistrations.length === 0 && (
                  <p className="text-center text-white/20 text-[10px] uppercase tracking-widest pt-6">Aucune demande</p>
                )}
              </>
            )}
          </nav>
        )}
      </aside>

      {/* MAIN */}
      <main className="flex-1 overflow-y-auto">
        {activePanel === 'preregistration' && selectedPreRegistration ? (
          <div className="max-w-4xl mx-auto px-8 py-6 space-y-6">
            {/* STICKY HEADER */}
            <div className="sticky top-0 z-20 -mx-8 px-8 pb-5 pt-5 bg-[#070c1a]/90 backdrop-blur-xl border-b border-white/[0.04]">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg"
                    style={{ backgroundColor: '#D4AF37' }}
                  >
                    {selectedPreRegistration.company_name?.charAt(0)?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <div className="text-xl font-bold text-white">{selectedPreRegistration.company_name || '—'}</div>
                    <div className="mt-1">
                      <span className="px-2 py-0.5 bg-orange-500/15 text-orange-400 rounded-md text-[9px] font-bold uppercase tracking-wider border border-orange-500/20">
                        Pré-inscription
                      </span>
                      <span className="ml-2 text-[9px] text-white/25 uppercase tracking-wider">À valider</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <AnimatePresence>
                    {message && (
                      <motion.div
                        initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wide ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}
                      >
                        {message.type === 'success' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                        {message.text}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <button
                    type="button"
                    onClick={handlePublishPreRegistration}
                    disabled={isPublishing}
                    className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-50 active:scale-95"
                  >
                    {isPublishing ? <Loader2 className="animate-spin" size={14} /> : <UserPlus size={14} />}
                    {isPublishing ? 'Création...' : 'Créer l\'agence'}
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* INFORMATIONS DE CONTACT */}
              <div className={cardCls}>
                <h3 className={sHdr}><Mail size={15} className="text-orange-400" /> Informations de Contact</h3>
                <div className="space-y-3">
                  {[
                    { label: 'Prénom & Nom', value: `${selectedPreRegistration.first_name || ''} ${selectedPreRegistration.last_name || ''}`.trim() || '—' },
                    { label: 'Email', value: selectedPreRegistration.email || '—', mono: true },
                    { label: 'Langue', value: selectedPreRegistration.preferred_language || '—' },
                    { label: "Date d'inscription", value: selectedPreRegistration.created_at ? new Date(selectedPreRegistration.created_at).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : '—' },
                  ].map(({ label, value, mono }) => (
                    <div key={label} className="flex justify-between items-center py-1.5 border-b border-white/[0.04]">
                      <span className="text-white/40 text-xs">{label}</span>
                      <span className={`text-white text-xs font-semibold ${mono ? 'font-mono' : ''}`}>{value}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center py-1.5">
                    <span className="text-white/40 text-xs">Statut OTP</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      selectedPreRegistration.status === 'verified'
                        ? 'bg-blue-500/20 text-blue-300'
                        : selectedPreRegistration.otp_expires_at && new Date(selectedPreRegistration.otp_expires_at) > new Date()
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-red-500/20 text-red-300'
                    }`}>
                      {selectedPreRegistration.status === 'verified'
                        ? 'OTP ✓ Vérifié'
                        : selectedPreRegistration.otp_expires_at && new Date(selectedPreRegistration.otp_expires_at) > new Date()
                          ? 'OTP valide'
                          : 'OTP expiré'}
                    </span>
                  </div>
                </div>
              </div>

              {/* IDENTITÉ VISUELLE */}
              <div className={cardCls}>
                <h3 className={sHdr}><Palette size={15} className="text-orange-400" /> Identité Visuelle</h3>
                <div className="space-y-5">
                  <div>
                    <label className={lbl}>Couleur principale</label>
                    <div className="flex items-center gap-3 mt-2">
                      <div
                        className="w-10 h-10 rounded-xl border border-white/10 flex-shrink-0"
                        style={{ backgroundColor: selectedPreRegistration.primary_color || '#D4AF37' }}
                      />
                      <span className="text-white font-mono text-sm">
                        {selectedPreRegistration.primary_color || '#D4AF37'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className={lbl}>Logo</label>
                    {selectedPreRegistration.logo_url ? (
                      <img
                        src={selectedPreRegistration.logo_url}
                        className="h-16 object-contain bg-white/[0.04] border border-white/[0.08] rounded-xl p-2 mt-2"
                        alt="Logo pré-inscription"
                      />
                    ) : (
                      <p className="text-white/25 text-xs italic mt-2">Pas encore uploadé</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* CONFIGURATION DU SITE */}
            <div className={cardCls}>
              <h3 className={sHdr}><Globe size={15} className="text-orange-400" /> Configuration du Site</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className={lbl}>Sous-domaine *</label>
                  <div className="relative">
                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={15} />
                    <input
                      type="text"
                      value={preRegForm.subdomain}
                      onChange={(e) => setPreRegForm(f => ({ ...f, subdomain: e.target.value.toLowerCase().replace(/\s+/g, '-') }))}
                      className={`${inp} pl-11 font-mono`}
                      placeholder="nom-agence"
                    />
                  </div>
                  {preRegForm.subdomain && (
                    <p className="text-[10px] text-white/25 font-mono">{preRegForm.subdomain}.habihub.io</p>
                  )}
                </div>
                <div className="space-y-2">
                  <label className={lbl}>Package</label>
                  <select
                    value={preRegForm.packageLevel}
                    onChange={(e) => setPreRegForm(f => ({ ...f, packageLevel: e.target.value }))}
                    className={`${inp} appearance-none [&>option]:bg-[#0d1528]`}
                  >
                    <option value="silver">Silver</option>
                    <option value="gold">Gold</option>
                    <option value="platinum">Platinum</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className={lbl}>Langue par défaut</label>
                  <select
                    value={preRegForm.defaultLang}
                    onChange={(e) => setPreRegForm(f => ({ ...f, defaultLang: e.target.value }))}
                    className={`${inp} appearance-none [&>option]:bg-[#0d1528]`}
                  >
                    {SUPPORTED_LANGUAGES.map(l => (
                      <option key={l.code} value={l.code}>{l.label}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className={lbl}>Flux XML</label>
                  <input
                    type="url"
                    value={preRegForm.xmlUrl}
                    onChange={(e) => setPreRegForm(f => ({ ...f, xmlUrl: e.target.value }))}
                    className={inp}
                    placeholder="https://..."
                  />
                </div>
                <div className="space-y-2">
                  <label className={lbl}>WhatsApp</label>
                  <input
                    type="text"
                    value={preRegForm.whatsapp}
                    onChange={(e) => setPreRegForm(f => ({ ...f, whatsapp: e.target.value }))}
                    className={inp}
                    placeholder="Ex: 33600000000 (sans +)"
                  />
                </div>
              </div>
            </div>
          </div>
        ) : selectedAgency ? (
          <form onSubmit={handleSave} className="max-w-5xl mx-auto px-8 py-6 space-y-6">

            {/* STICKY HEADER + KPI STRIP */}
            <div className="sticky top-0 z-20 -mx-8 px-8 pb-5 pt-5 bg-[#070c1a]/90 backdrop-blur-xl border-b border-white/[0.04]">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-4">
                  {selectedAgency.logo_url ? (
                    <img src={selectedAgency.logo_url} className="w-11 h-11 rounded-xl object-contain bg-white/[0.04] border border-white/[0.08] p-1" alt="Logo" />
                  ) : (
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-black text-lg shadow-lg" style={{ background: `linear-gradient(135deg, ${selectedAgency.primary_color || '#6366f1'}, ${selectedAgency.button_color || '#8b5cf6'})` }}>
                      {selectedAgency.agency_name?.charAt(0)}
                    </div>
                  )}
                  <div>
                    <input
                      value={selectedAgency.agency_name || ''}
                      onChange={(e) => setSelectedAgency({...selectedAgency, agency_name: e.target.value})}
                      className="text-xl font-bold text-white bg-transparent border-b border-white/[0.08] focus:border-indigo-500 outline-none transition-colors"
                    />
                    <div className="mt-1">
                      <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded-md text-[9px] font-bold uppercase tracking-wider border border-indigo-500/20">{selectedAgency.package_level} plan</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <AnimatePresence>
                    {message && (
                      <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}
                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wide ${message.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-red-500/10 text-red-400 border border-red-500/20'}`}>
                        {message.type === 'success' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                        {message.text}
                      </motion.div>
                    )}
                  </AnimatePresence>
                  <button type="submit" disabled={isSaving} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white rounded-xl font-bold text-[11px] uppercase tracking-widest hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-500/25 disabled:opacity-50 active:scale-95">
                    {isSaving ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />}
                    {isSaving ? t.saving : t.save}
                  </button>
                </div>
              </div>
              {/* KPI Strip */}
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "Agences", value: agencies.length, icon: <Users size={12} />, accent: "text-indigo-400" },
                  { label: "Modules actifs", value: `${activeModulesCount}/7`, icon: <Zap size={12} />, accent: "text-emerald-400" },
                  { label: "Plan", value: (selectedAgency.package_level || "—").toUpperCase(), icon: <Sparkles size={12} />, accent: "text-violet-400" },
                  { label: "Statut site", value: siteIsActive ? "Live" : "Offline", icon: <Activity size={12} />, accent: siteIsActive ? "text-emerald-400" : "text-red-400" },
                ].map((kpi) => (
                  <div key={kpi.label} className="bg-white/[0.03] border border-white/[0.05] rounded-xl px-4 py-3">
                    <div className={`flex items-center gap-1.5 ${kpi.accent} text-[9px] uppercase tracking-widest mb-1.5`}>{kpi.icon} {kpi.label}</div>
                    <div className="text-base font-bold text-white">{kpi.value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* DEFAULT LANG */}
            <div className="space-y-3">
              <label className={lbl}>Langue par défaut du site</label>
              <div className="flex gap-2">
                {selectedAgency.footer_config?.allowed_langs?.map((code: string) => (
                  <button key={code} type="button" onClick={() => setDefaultLang(code)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all border ${selectedAgency.default_lang === code ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-white/[0.04] text-white/40 border-white/[0.06] hover:bg-white/[0.07]'}`}>
                    {code} {selectedAgency.default_lang === code && "★"}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <motion.div className="lg:col-span-2 space-y-5" variants={stagger} initial="hidden" animate="visible">

                {/* ① IDENTITÉ VISUELLE */}
                <motion.div variants={fadeUp} className={cardCls}>
                  <h3 className={sHdr}><Palette size={15} className="text-indigo-400" /> {t.sections.branding}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className={lbl}>{t.fields.logo}</label>
                      <div className="relative group">
                        <input type="file" accept="image/*" onChange={handleLogoUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                        <div className="w-full border-2 border-dashed border-white/[0.08] rounded-xl p-5 flex flex-col items-center gap-2 bg-white/[0.02] group-hover:bg-white/[0.04] group-hover:border-indigo-500/30 transition-all">
                          <UploadCloud className="text-white/20 group-hover:text-indigo-400 transition-colors" size={20} />
                          <span className="text-xs text-white/30">{selectedAgency?.logo_url ? "Changer le logo" : t.placeholders.click_upload}</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className={lbl}>{t.fields.subdomain}</label>
                      <div className="relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={15} />
                        <input type="text" value={selectedAgency?.subdomain || ''} onChange={(e) => setSelectedAgency({...selectedAgency, subdomain: e.target.value.toLowerCase().replace(/\s+/g, '-')})} className={`${inp} pl-11 font-mono`} placeholder={t.placeholders.slug} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className={lbl}>Police d'écriture</label>
                      <div className="relative">
                        <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={15} />
                        <select value={selectedAgency?.font_family || 'Montserrat'} onChange={(e) => setSelectedAgency({...selectedAgency, font_family: e.target.value})} className={`${inp} pl-11 appearance-none [&>option]:bg-[#0d1528]`}>
                          <option value="Montserrat">Montserrat (Moderne)</option>
                          <option value="Inter">Inter (Minimaliste)</option>
                          <option value="'Playfair Display', serif">Playfair (Luxe)</option>
                          <option value="Poppins">Poppins (Arrondi)</option>
                          <option value="'Roboto Mono', monospace">Roboto Mono (Tech)</option>
                        </select>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className={lbl}>{t.fields.primary_color}</label>
                      <div className="flex gap-3">
                        <input type="color" value={selectedAgency?.primary_color || '#0f172a'} onChange={(e) => setSelectedAgency({...selectedAgency, primary_color: e.target.value})} className="h-[52px] w-16 rounded-xl cursor-pointer bg-white/[0.05] border border-white/[0.08] p-1" />
                        <input type="text" value={selectedAgency?.primary_color || ''} onChange={(e) => setSelectedAgency({...selectedAgency, primary_color: e.target.value})} className={`${inp} flex-1 font-mono uppercase`} />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className={`${lbl} flex items-center gap-2`}><MousePointer2 size={11} /> {t.fields.button_color}</label>
                      <div className="flex gap-3">
                        <input type="color" value={selectedAgency?.button_color || '#2563eb'} onChange={(e) => setSelectedAgency({...selectedAgency, button_color: e.target.value})} className="h-[52px] w-16 rounded-xl cursor-pointer bg-white/[0.05] border border-white/[0.08] p-1" />
                        <input type="text" value={selectedAgency?.button_color || ''} onChange={(e) => setSelectedAgency({...selectedAgency, button_color: e.target.value})} className={`${inp} flex-1 font-mono uppercase`} />
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3 pt-4 border-t border-white/[0.05]">
                    <label className={lbl}>{t.fields.button_style}</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button type="button" onClick={() => setSelectedAgency({...selectedAgency, button_style: 'rounded-none'})} className={`p-4 border rounded-xl transition-all ${selectedAgency.button_style === 'rounded-none' ? 'border-indigo-500/40 bg-indigo-500/10' : 'border-white/[0.06] hover:border-white/[0.12] bg-white/[0.02]'}`}>
                        <div className="text-center"><div className="w-full h-8 bg-white/10 mb-2" style={{ borderRadius: 0 }}></div><span className="text-[9px] font-bold uppercase text-white/50">Bords Droits</span></div>
                      </button>
                      <button type="button" onClick={() => setSelectedAgency({...selectedAgency, button_style: 'rounded-full'})} className={`p-4 border rounded-xl transition-all ${selectedAgency.button_style === 'rounded-full' ? 'border-indigo-500/40 bg-indigo-500/10' : 'border-white/[0.06] hover:border-white/[0.12] bg-white/[0.02]'}`}>
                        <div className="text-center"><div className="w-full h-8 bg-white/10 rounded-full mb-2"></div><span className="text-[9px] font-bold uppercase text-white/50">Bords Arrondis</span></div>
                      </button>
                    </div>
                  </div>
                  <div className="space-y-3 pt-4 border-t border-white/[0.05]">
                    <label className={lbl}>{t.fields.button_animation}</label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { value: 'none', label: 'Aucune' },
                        { value: 'scale', label: 'Scale (Zoom)' },
                        { value: 'glow', label: 'Glow (Lueur)' },
                        { value: 'slide', label: 'Slide' },
                      ].map(opt => (
                        <button key={opt.value} type="button" onClick={() => setSelectedAgency({...selectedAgency, button_animation: opt.value})} className={`p-3 border rounded-xl transition-all text-[9px] font-bold uppercase ${selectedAgency.button_animation === opt.value ? 'border-indigo-500/40 bg-indigo-500/10 text-indigo-300' : 'border-white/[0.06] hover:border-white/[0.12] bg-white/[0.02] text-white/40'}`}>
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>

                {/* ② HERO HEADER */}
                <motion.div variants={fadeUp} className={cardCls}>
                  <h3 className={sHdr}><Layout size={15} className="text-indigo-400" /> {t.sections.hero}</h3>
                  <div className="space-y-5">
                    <div>
                      <label className={lbl}>{t.fields.hero_type}</label>
                      <div className="flex p-1 bg-white/[0.04] border border-white/[0.06] rounded-xl w-fit">
                        <button type="button" onClick={() => setSelectedAgency({...selectedAgency, hero_type: 'image'})} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all ${selectedAgency.hero_type !== 'video' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-white/40 hover:text-white/60'}`}><ImageIcon size={13} /> Image</button>
                        <button type="button" onClick={() => setSelectedAgency({...selectedAgency, hero_type: 'video'})} className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all ${selectedAgency.hero_type === 'video' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' : 'text-white/40 hover:text-white/60'}`}><Video size={13} /> Vidéo</button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <label className={lbl}>{t.fields.hero_file}</label>
                        <div className="relative group">
                          <input type="file" accept="image/*,video/*,.mp4,.mov,.webm,.avi" onChange={handleHeroUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                          <div className="w-full border-2 border-dashed border-white/[0.08] rounded-xl p-5 flex flex-col items-center gap-2 bg-white/[0.02] group-hover:bg-white/[0.04] group-hover:border-indigo-500/30 transition-all">
                            <UploadCloud className="text-white/20 group-hover:text-indigo-400 transition-colors" size={20} />
                            <span className="text-xs text-white/30">{selectedAgency?.hero_url ? (selectedAgency.hero_type === 'video' ? "Changer la vidéo" : "Changer l'image") : t.placeholders.media_upload}</span>
                            <span className="text-[9px] text-white/20">Image ou vidéo MP4 · max 50 Mo</span>
                          </div>
                        </div>
                        {selectedAgency?.hero_url && (
                          <div className="mt-2 rounded-xl overflow-hidden relative group border border-white/[0.06]">
                            {selectedAgency.hero_type === 'video' ? (
                              <video src={selectedAgency.hero_url} className="w-full h-28 object-cover" controls />
                            ) : (
                              <img src={selectedAgency.hero_url} className="w-full h-28 object-cover" alt="Hero preview" />
                            )}
                            <button type="button" onClick={handleRemoveHero} className="absolute top-2 right-2 p-1.5 bg-red-500/90 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"><Trash2 size={12} /></button>
                          </div>
                        )}
                      </div>
                      <div className="space-y-2">
                        <label className={lbl}>{t.fields.hero_title}</label>
                        <textarea rows={4} value={selectedAgency.hero_title || ''} onChange={(e) => setSelectedAgency({...selectedAgency, hero_title: e.target.value})} placeholder={t.placeholders.hero_text} className={`${inp} resize-none font-serif italic text-base`} />
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* ③ LANGUES & XML */}
                <motion.div variants={fadeUp} className={cardCls}>
                  <h3 className={sHdr}><FileCode size={15} className="text-indigo-400" /> {t.sections.lang_xml}</h3>
                  <div className="space-y-3">
                    <label className={lbl}>{t.fields.allowed_langs}</label>
                    <div className="flex flex-wrap gap-2">
                      {SUPPORTED_LANGUAGES.map(l => (
                        <button key={l.code} type="button" onClick={() => toggleLanguage(l.code)} className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase transition-all border ${selectedAgency?.footer_config?.allowed_langs?.includes(l.code) ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' : 'bg-white/[0.04] text-white/40 border-white/[0.06] hover:bg-white/[0.07]'}`}>
                          {l.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <label className={lbl}>{t.fields.xml_sources}</label>
                    <div className="space-y-2">
                      {DISPONIBLE_XML_SOURCES.map((s) => (
                        <button key={s.id} type="button" onClick={() => toggleXmlSource(s.url)} className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${selectedAgency?.footer_config?.xml_urls?.includes(s.url) ? 'border-indigo-500/40 bg-indigo-500/[0.07]' : 'border-white/[0.06] bg-white/[0.02] hover:border-white/[0.12]'}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${selectedAgency?.footer_config?.xml_urls?.includes(s.url) ? 'bg-indigo-600 border-indigo-600' : 'bg-white/[0.05] border-white/[0.15]'}`}>
                              {selectedAgency?.footer_config?.xml_urls?.includes(s.url) && <CheckCircle2 size={11} className="text-white" />}
                            </div>
                            <span className="text-sm font-semibold text-white/80">{s.name}</span>
                          </div>
                          <span className="text-[9px] font-mono text-white/20 truncate max-w-[140px]">{s.url}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-2 pt-3 border-t border-white/[0.05]">
                    <label className={`${lbl} flex items-center gap-2`}><FileCode size={11} /> HabiHub Agent ID <span className="text-white/20 font-normal normal-case tracking-normal">(fourni par HabiHub)</span></label>
                    <input type="text" className={`${inp} font-mono`} placeholder="ex: 6d5cb68a-3636-4095-b0ce-7dc9ec2df2d2" value={selectedAgency?.habihub_agent_id || ''} onChange={(e) => setSelectedAgency({ ...selectedAgency, habihub_agent_id: e.target.value })} />
                    <p className="text-[10px] text-white/25">Permet à Francisco d&apos;envoyer des flux XML sans connaître votre UUID interne.</p>
                  </div>
                </motion.div>

                {/* ④ ÉQUIPE */}
                <motion.div variants={fadeUp} className={cardCls}>
                  <div className="flex justify-between items-center border-b border-white/[0.05] pb-4">
                    <h3 className="flex items-center gap-3 font-bold text-white/80 uppercase text-xs tracking-widest"><Users size={15} className="text-indigo-400" /> {t.sections.team}</h3>
                    <button type="button" onClick={addMember} className="flex items-center gap-2 px-4 py-2 bg-indigo-600/80 border border-indigo-500/30 text-white rounded-xl text-xs font-bold hover:bg-indigo-600 transition-all shadow-lg shadow-indigo-500/20">
                      <UserPlus size={13} /> {t.buttons.add_member}
                    </button>
                  </div>
                  {team.length === 0 ? (
                    <div className="text-center py-10 text-white/20">
                      <Users size={40} className="mx-auto mb-3 opacity-30" />
                      <p className="text-sm">Aucun membre dans l'équipe.</p>
                    </div>
                  ) : (
                    <div className="space-y-5">
                      {team.map((member, index) => (
                        <div key={index} className="border border-white/[0.06] rounded-xl p-5 space-y-4 relative bg-white/[0.02]">
                          <button type="button" onClick={() => removeMember(index)} className="absolute top-4 right-4 p-1.5 text-red-400/50 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"><Trash2 size={13} /></button>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className={`${lbl} flex items-center gap-1.5`}><ImageIcon size={11} /> {t.fields.member_photo}</label>
                              <div className="relative group">
                                <input type="file" accept="image/*" onChange={(e) => handleMemberPhotoUpload(e, index)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                <div className="flex items-center gap-3 p-3 bg-white/[0.03] border border-white/[0.07] rounded-xl group-hover:border-indigo-500/30 transition-all">
                                  {member.photo ? (<img src={member.photo} className="w-10 h-10 rounded-full object-cover" alt={member.name} />) : (<div className="w-10 h-10 rounded-full bg-white/[0.05] flex items-center justify-center"><UserPlus size={16} className="text-white/20" /></div>)}
                                  <span className="text-xs text-white/30">Cliquer pour uploader</span>
                                </div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className={`${lbl} flex items-center gap-1.5`}><Users size={11} /> {t.fields.member_name}</label>
                              <input type="text" className={inp} placeholder={t.placeholders.member_name} value={member.name || ''} onChange={(e) => updateMember(index, 'name', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                              <label className={`${lbl} flex items-center gap-1.5`}><Briefcase size={11} /> {t.fields.member_role}</label>
                              <input type="text" className={inp} placeholder={t.placeholders.member_role} value={member.role || ''} onChange={(e) => updateMember(index, 'role', e.target.value)} />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                              <label className={`${lbl} flex items-center gap-1.5`}><FileText size={11} /> {t.fields.member_bio}</label>
                              <textarea rows={3} className={`${inp} resize-none`} placeholder={t.placeholders.member_bio} value={member.bio || ''} onChange={(e) => updateMember(index, 'bio', e.target.value)} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>

                {/* ⑤ CONTACT & RÉSEAUX SOCIAUX */}
                <motion.div variants={fadeUp} className={cardCls}>
                  <h3 className={sHdr}><Share2 size={15} className="text-indigo-400" /> {t.sections.socials}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative"><Linkedin className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" size={15} /><input placeholder={t.fields.linkedin} className={`${inp} pl-11`} value={selectedAgency.footer_config?.socials?.linkedin || ''} onChange={(e) => updateNestedConfig('socials', 'linkedin', e.target.value)} /></div>
                    <div className="relative"><TikTokIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" size={15} /><input placeholder={t.fields.tiktok} className={`${inp} pl-11`} value={selectedAgency.footer_config?.socials?.tiktok || ''} onChange={(e) => updateNestedConfig('socials', 'tiktok', e.target.value)} /></div>
                    <div className="relative"><Facebook className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" size={15} /><input placeholder={t.fields.facebook} className={`${inp} pl-11`} value={selectedAgency.footer_config?.socials?.facebook || ''} onChange={(e) => updateNestedConfig('socials', 'facebook', e.target.value)} /></div>
                    <div className="relative"><Instagram className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" size={15} /><input placeholder={t.fields.instagram} className={`${inp} pl-11`} value={selectedAgency.footer_config?.socials?.instagram || ''} onChange={(e) => updateNestedConfig('socials', 'instagram', e.target.value)} /></div>
                    <div className="md:col-span-2 pt-3 border-t border-white/[0.05] grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative"><Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" size={15} /><input placeholder={t.fields.email} className={`${inp} pl-11`} value={selectedAgency.footer_config?.email || ''} onChange={(e) => updateRootConfig('email', e.target.value)} /></div>
                      <div className="relative"><Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-white/25" size={15} /><input placeholder={t.fields.phone} className={`${inp} pl-11`} value={selectedAgency.footer_config?.phone || ''} onChange={(e) => updateRootConfig('phone', e.target.value)} /></div>
                    </div>
                  </div>
                </motion.div>

                {/* ⑥ MODULES & ABONNEMENT */}
                <motion.div variants={fadeUp} className="bg-white/[0.03] border border-white/[0.06] rounded-2xl p-7 space-y-4 hover:border-indigo-500/20 transition-all duration-300">
                  <div className="flex items-start justify-between border-b border-white/[0.05] pb-4">
                    <h3 className="flex items-center gap-3 font-bold text-white/80 uppercase text-xs tracking-widest"><Zap size={15} className="text-violet-400" /> Modules & Abonnement</h3>
                    <span className="text-[9px] text-white/25 uppercase tracking-widest text-right leading-relaxed max-w-[180px]">Activation conditionnée au paiement</span>
                  </div>

                  {/* MODULE: Site Web Public */}
                  {(() => {
                    const siteActive = getSub('website_active') !== false;
                    return (
                      <div className={`rounded-xl border overflow-hidden transition-all duration-300 ${siteActive ? 'border-emerald-500/30 bg-emerald-500/[0.05]' : 'border-white/[0.06] bg-white/[0.02]'}`}>
                        <div className="flex items-center justify-between p-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${siteActive ? 'bg-emerald-500/20' : 'bg-white/[0.05]'}`}><Globe size={17} className={siteActive ? 'text-emerald-400' : 'text-white/30'} /></div>
                            <div>
                              <div className="flex items-center gap-2"><span className="text-sm font-semibold text-white/80">Site Web Public</span><span className="px-1.5 py-0.5 text-[8px] font-black uppercase rounded-md bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">Inclus</span></div>
                              <p className="text-[9px] text-white/30 uppercase tracking-tight font-bold mt-0.5">Visibilité publique du site agence</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${siteActive ? 'bg-emerald-500/15 text-emerald-400' : 'bg-white/[0.05] text-white/30'}`}>{siteActive ? 'ACTIF' : 'INACTIF'}</span>
                            <ToggleSwitch checked={siteActive} checkedColor="#10b981" onChange={(v) => updateNestedConfig('subscription', 'website_active', v)} />
                          </div>
                        </div>
                        {!siteActive && (
                          <div className="px-4 py-2.5 bg-amber-500/[0.08] border-t border-amber-500/20 flex items-center gap-2">
                            <AlertCircle size={12} className="text-amber-400 shrink-0" />
                            <p className="text-[9px] text-amber-400/80 font-bold uppercase tracking-wide">Le site est inaccessible aux visiteurs tant que ce module est désactivé.</p>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* MODULE: Flou vignettes après 6 */}
                  {(() => {
                    const enabled = getSub('blur_listings') === true;
                    return (
                      <div className={`rounded-xl border overflow-hidden transition-all duration-300 ${enabled ? 'border-cyan-500/30 bg-cyan-500/[0.04]' : 'border-white/[0.06] bg-white/[0.02]'}`}>
                        <div className="flex items-center justify-between p-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${enabled ? 'bg-cyan-500/20' : 'bg-white/[0.05]'}`}><Monitor size={17} className={enabled ? 'text-cyan-400' : 'text-white/30'} /></div>
                            <div>
                              <div className="flex items-center gap-2"><span className="text-sm font-semibold text-white/80">Flou des vignettes (après 6)</span><span className="px-1.5 py-0.5 text-[8px] font-black uppercase rounded-md bg-cyan-500/15 text-cyan-400 border border-cyan-500/20">Visibilité</span></div>
                              <p className="text-[9px] text-white/30 uppercase tracking-tight font-bold mt-0.5">Masque les biens au-delà des 6 premiers</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${enabled ? 'bg-cyan-500/15 text-cyan-400' : 'bg-white/[0.05] text-white/30'}`}>{enabled ? 'ACTIF' : 'INACTIF'}</span>
                            <ToggleSwitch checked={enabled} checkedColor="#06b6d4" onChange={(v) => updateNestedConfig('subscription', 'blur_listings', v)} />
                          </div>
                        </div>
                        {enabled && (
                          <div className="px-4 py-2.5 bg-cyan-500/[0.07] border-t border-cyan-500/20 flex items-center gap-2">
                            <AlertCircle size={12} className="text-cyan-400 shrink-0" />
                            <p className="text-[9px] text-cyan-400/80 font-bold uppercase tracking-wide">Les vignettes au-delà de la 6ème apparaissent floutées avec un message &quot;Contactez-nous&quot;.</p>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* MODULE: Property Manager */}
                  {(() => {
                    const enabled = !!getInt('property_manager_enabled');
                    const slug = selectedAgency?.subdomain;
                    return (
                      <div className={`rounded-xl border overflow-hidden transition-all duration-300 ${enabled ? 'border-green-500/30 bg-green-500/[0.04]' : 'border-white/[0.06] bg-white/[0.02]'}`}>
                        <div className="flex items-center justify-between p-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${enabled ? 'bg-green-500/20' : 'bg-white/[0.05]'}`}>
                              <HomeIcon size={17} className={enabled ? 'text-green-400' : 'text-white/30'} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2"><span className="text-sm font-semibold text-white/80">Property Manager</span><span onClick={() => setMarketplaceModule('property_manager')} className="cursor-pointer flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-black uppercase rounded-md bg-green-500/15 text-green-400 border border-green-500/20 hover:bg-green-500/25 transition-colors"><Lock size={7} /> Module</span></div>
                              <p className="text-[9px] text-white/30 uppercase tracking-tight font-bold mt-0.5">Gestion manuelle des biens</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${enabled ? 'bg-green-500/15 text-green-400' : 'bg-white/[0.05] text-white/30'}`}>{enabled ? 'ACTIF' : 'INACTIF'}</span>
                            <ToggleSwitch checked={enabled} checkedColor="#22c55e" onChange={(v) => updateNestedConfig('integrations', 'property_manager_enabled', v)} />
                          </div>
                        </div>
                        {enabled && slug && (
                          <div className="px-4 py-3 bg-green-500/[0.07] border-t border-green-500/20 flex items-center justify-between gap-3">
                            <p className="text-[9px] text-green-400/80 font-bold uppercase tracking-wide">L'agence peut gérer ses biens manuellement depuis son espace dédié</p>
                            <a href={`/fr/${slug}/mon-espace`} target="_blank" rel="noopener noreferrer" className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-green-500 transition-all"><Globe size={9} /> Ouvrir →</a>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* MODULE: WhatsApp Business */}
                  {(() => {
                    const enabled = !!getInt('whatsapp_enabled');
                    return (
                      <div className={`rounded-xl border overflow-hidden transition-all duration-300 ${enabled ? 'border-green-500/30 bg-green-500/[0.04]' : 'border-white/[0.06] bg-white/[0.02]'}`}>
                        <div className="flex items-center justify-between p-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${enabled ? 'bg-green-500/20' : 'bg-white/[0.05]'}`}>
                              <svg viewBox="0 0 24 24" width="17" height="17" fill="currentColor" className={enabled ? 'text-green-400' : 'text-white/30'}>
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                              </svg>
                            </div>
                            <div>
                              <div className="flex items-center gap-2"><span className="text-sm font-semibold text-white/80">WhatsApp Business</span><span onClick={() => setMarketplaceModule('whatsapp')} className="cursor-pointer flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-black uppercase rounded-md bg-violet-500/15 text-violet-400 border border-violet-500/20 hover:bg-violet-500/25 transition-colors"><Lock size={7} /> Module</span></div>
                              <p className="text-[9px] text-white/30 uppercase tracking-tight font-bold mt-0.5">Bouton de contact rapide</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${enabled ? 'bg-green-500/15 text-green-400' : 'bg-white/[0.05] text-white/30'}`}>{enabled ? 'ACTIF' : 'INACTIF'}</span>
                            <ToggleSwitch checked={enabled} checkedColor="#22c55e" onChange={(v) => { updateNestedConfig('integrations', 'whatsapp_enabled', v); setIntOpen(prev => ({ ...prev, whatsapp: v })); }} />
                            {enabled && <button type="button" onClick={() => setIntOpen(prev => ({ ...prev, whatsapp: !prev.whatsapp }))} className="p-1 hover:bg-white/[0.07] rounded-lg transition-all"><ChevronDown size={14} className={`text-white/30 transition-transform duration-200 ${intOpen.whatsapp ? 'rotate-180' : ''}`} /></button>}
                          </div>
                        </div>
                        {intOpen.whatsapp && enabled && (
                          <div className="p-4 border-t border-white/[0.05] bg-white/[0.02] space-y-3">
                            <label className={lbl}>Numéro WhatsApp</label>
                            <input className={inp} placeholder="Ex: 33600000000 (sans +)" value={getInt('whatsapp_number') || ''} onChange={(e) => updateNestedConfig('integrations', 'whatsapp_number', e.target.value)} />
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* MODULE: Chatbot IA */}
                  {(() => {
                    const enabled = !!getInt('chatbot_enabled');
                    return (
                      <div className={`rounded-xl border overflow-hidden transition-all duration-300 ${enabled ? 'border-violet-500/30 bg-violet-500/[0.04]' : 'border-white/[0.06] bg-white/[0.02]'}`}>
                        <div className="flex items-center justify-between p-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${enabled ? 'bg-violet-500/20' : 'bg-white/[0.05]'}`}>
                              <Bot size={17} className={enabled ? 'text-violet-400' : 'text-white/30'} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2"><span className="text-sm font-semibold text-white/80">Chatbot IA</span><span onClick={() => setMarketplaceModule('chatbot')} className="cursor-pointer flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-black uppercase rounded-md bg-violet-500/15 text-violet-400 border border-violet-500/20 hover:bg-violet-500/25 transition-colors"><Lock size={7} /> Module</span></div>
                              <p className="text-[9px] text-white/30 uppercase tracking-tight font-bold mt-0.5">Qualification automatique des leads</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${enabled ? 'bg-violet-500/15 text-violet-400' : 'bg-white/[0.05] text-white/30'}`}>{enabled ? 'ACTIF' : 'INACTIF'}</span>
                            <ToggleSwitch checked={enabled} checkedColor="#8b5cf6" onChange={(v) => { updateNestedConfig('integrations', 'chatbot_enabled', v); setIntOpen(prev => ({ ...prev, chatbot: v }));
                              }}
                            />
                            {enabled && <button type="button" onClick={() => setIntOpen(prev => ({ ...prev, chatbot: !prev.chatbot }))} className="p-1 hover:bg-white/[0.07] rounded-lg transition-all"><ChevronDown size={14} className={`text-white/30 transition-transform duration-200 ${intOpen.chatbot ? 'rotate-180' : ''}`} /></button>}
                          </div>
                        </div>
                        {intOpen.chatbot && enabled && (
                          <div className="p-4 border-t border-white/[0.05] bg-white/[0.02] space-y-4">
                            <div className="flex items-center gap-2 px-4 py-3 bg-violet-500/[0.08] rounded-xl border border-violet-500/20">
                              <Cpu size={12} className="text-violet-400 shrink-0" />
                              <p className="text-[9px] text-violet-400/80 font-bold uppercase tracking-wide">IA propulsée par la plateforme — inclus dans l'abonnement</p>
                            </div>
                            <div className="space-y-2">
                              <label className={lbl}>Destination des leads</label>
                              <select className={`${inp} [&>option]:bg-[#0d1528]`} value={getInt('leads_destination') || 'local'} onChange={(e) => updateNestedConfig('integrations', 'leads_destination', e.target.value)}>
                                <option value="local">Table locale (Supabase)</option>
                                <option value="zoho">Zoho CRM</option>
                                <option value="hubspot">HubSpot</option>
                              </select>
                            </div>
                            <div className="space-y-2">
                              <label className={lbl}>Couleur du chatbot</label>
                              <div className="flex gap-3">
                                <input type="color" value={getInt('chatbot_color') || '#7c3aed'} onChange={(e) => updateNestedConfig('integrations', 'chatbot_color', e.target.value)} className="h-[52px] w-16 rounded-xl cursor-pointer bg-white/[0.05] border border-white/[0.08] p-1" />
                                <input type="text" value={getInt('chatbot_color') || '#7c3aed'} onChange={(e) => updateNestedConfig('integrations', 'chatbot_color', e.target.value)} className={`${inp} flex-1 font-mono uppercase`} />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* MODULE: CRM */}
                  {(() => {
                    const enabled = !!getInt('crm_enabled');
                    const slug = selectedAgency?.subdomain;
                    return (
                      <div className={`rounded-xl border overflow-hidden transition-all duration-300 ${enabled ? 'border-blue-500/30 bg-blue-500/[0.04]' : 'border-white/[0.06] bg-white/[0.02]'}`}>
                        <div className="flex items-center justify-between p-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${enabled ? 'bg-blue-500/20' : 'bg-white/[0.05]'}`}>
                              <Zap size={17} className={enabled ? 'text-blue-400' : 'text-white/30'} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2"><span className="text-sm font-semibold text-white/80">CRM (Zoho / HubSpot)</span><span onClick={() => setMarketplaceModule('crm_sync')} className="cursor-pointer flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-black uppercase rounded-md bg-violet-500/15 text-violet-400 border border-violet-500/20 hover:bg-violet-500/25 transition-colors"><Lock size={7} /> Module</span></div>
                              <p className="text-[9px] text-white/30 uppercase tracking-tight font-bold mt-0.5">Synchronisation des leads</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${enabled ? 'bg-blue-500/15 text-blue-400' : 'bg-white/[0.05] text-white/30'}`}>{enabled ? 'ACTIF' : 'INACTIF'}</span>
                            <ToggleSwitch checked={enabled} checkedColor="#3b82f6" onChange={(v) => { updateNestedConfig('integrations', 'crm_enabled', v); setIntOpen(prev => ({ ...prev, crm: v })); }} />
                          </div>
                        </div>
                        {intOpen.crm && enabled && slug && (
                          <div className="px-4 py-3 bg-blue-500/[0.07] border-t border-blue-500/20 flex items-center justify-between gap-3">
                            <p className="text-[9px] text-blue-400/80 font-bold uppercase tracking-wide">Les identifiants CRM sont configurés par l'agence depuis sa page de paramétrage</p>
                            <a href={`/fr/${slug}/parametres/crm`} target="_blank" rel="noopener noreferrer" className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-blue-500 transition-all"><Globe size={9} /> Ouvrir</a>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* MODULE: Mini CRM Leads */}
                  {(() => {
                    const enabled = !!getInt('leads_enabled');
                    const slug = selectedAgency?.subdomain;
                    return (
                      <div className={`rounded-xl border overflow-hidden transition-all duration-300 ${enabled ? 'border-orange-500/30 bg-orange-500/[0.04]' : 'border-white/[0.06] bg-white/[0.02]'}`}>
                        <div className="flex items-center justify-between p-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${enabled ? 'bg-orange-500/20' : 'bg-white/[0.05]'}`}>
                              <TrendingUp size={17} className={enabled ? 'text-orange-400' : 'text-white/30'} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2"><span className="text-sm font-semibold text-white/80">Mini CRM Leads</span><span onClick={() => setMarketplaceModule('mini_crm')} className="cursor-pointer flex items-center gap-1 px-1.5 py-0.5 text-[8px] font-black uppercase rounded-md bg-orange-500/15 text-orange-400 border border-orange-500/20 hover:bg-orange-500/25 transition-colors"><Lock size={7} /> Module</span></div>
                              <p className="text-[9px] text-white/30 uppercase tracking-tight font-bold mt-0.5">Accès leads depuis le site agence</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${enabled ? 'bg-orange-500/15 text-orange-400' : 'bg-white/[0.05] text-white/30'}`}>{enabled ? 'ACTIF' : 'INACTIF'}</span>
                            <ToggleSwitch checked={enabled} checkedColor="#f97316" onChange={(v) => { updateNestedConfig('integrations', 'leads_enabled', v); setIntOpen(prev => ({ ...prev, leadsCrm: v })); }} />
                          </div>
                        </div>
                        {enabled && slug && (
                          <div className="px-4 py-3 bg-orange-500/[0.07] border-t border-orange-500/20 flex items-center justify-between gap-3">
                            <p className="text-[9px] text-orange-400/80 font-bold uppercase tracking-wide">Accès protégé par mot de passe — défini par l'agence à la première connexion</p>
                            <a href={`/fr/${slug}/mes-leads`} target="_blank" rel="noopener noreferrer" className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 text-white text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-orange-500 transition-all"><TrendingUp size={9} /> Ouvrir le CRM</a>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </motion.div>

                {/* ⑦ PAGES STATIQUES (ABOUT) */}
                <motion.div variants={fadeUp} className={cardCls}>
                  <h3 className={sHdr}><Type size={15} className="text-indigo-400" /> {t.sections.about}</h3>
                  <div className="space-y-2">
                    <label className={lbl}>{t.fields.about_title}</label>
                    <input type="text" className={inp} placeholder={t.placeholders.about_title} value={selectedAgency?.about_title || ''} onChange={(e) => setSelectedAgency({...selectedAgency, about_title: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className={lbl}>{t.fields.about_text}</label>
                    <textarea rows={5} className={`${inp} resize-none`} placeholder={t.placeholders.about_text} value={selectedAgency?.about_text || ''} onChange={(e) => setSelectedAgency({...selectedAgency, about_text: e.target.value})} />
                  </div>
                </motion.div>

                {/* ⑧ CONFORMITÉ & LÉGAL */}
                <motion.div variants={fadeUp} className="bg-white/[0.03] border border-white/[0.07] border-l-2 border-l-indigo-500/60 rounded-2xl p-7 space-y-5">
                  <h3 className={sHdr}><ShieldCheck size={15} className="text-indigo-400" /> {t.sections.legal}</h3>
                  <div className="flex items-center justify-between p-4 bg-white/[0.03] rounded-xl border border-white/[0.05]">
                    <div className="space-y-1">
                      <span className="text-sm font-semibold text-white/80">Bandeau de Cookies</span>
                      <p className="text-[9px] text-white/30 uppercase tracking-tight font-bold">Conformité RGPD</p>
                    </div>
                    <ToggleSwitch checked={selectedAgency.cookie_consent_enabled || false} checkedColor="#6366f1" onChange={(v) => setSelectedAgency({...selectedAgency, cookie_consent_enabled: v})} />
                  </div>
                  <div className="space-y-2">
                    <label className={lbl}>{t.fields.privacy_policy}</label>
                    <textarea rows={5} className={`${inp} resize-none`} placeholder="Saisissez ici les mentions légales..." value={selectedAgency.privacy_policy || ''} onChange={(e) => setSelectedAgency({...selectedAgency, privacy_policy: e.target.value})} />
                  </div>
                </motion.div>

              </motion.div>

              {/* LIVE PREVIEW — browser chrome mockup */}
              <div className="lg:col-span-1">
                <div className="sticky top-52">
                  <div className="bg-white/[0.03] border border-white/[0.07] rounded-2xl overflow-hidden">
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-white/[0.05] bg-white/[0.02]">
                      <div className="w-2.5 h-2.5 rounded-full bg-red-500/60" />
                      <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/60" />
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/60" />
                      <div className="flex-1 ml-2 bg-white/[0.04] rounded-md px-3 py-1.5 text-[9px] text-white/25 font-mono truncate border border-white/[0.04]">
                        {selectedAgency.subdomain ? `${selectedAgency.subdomain}.habihub.io` : 'preview.habihub.io'}
                      </div>
                    </div>
                    <div className="p-1">
                      <div className="relative aspect-[4/5] rounded-xl overflow-hidden bg-slate-900" style={{ fontFamily: selectedAgency.font_family || 'Montserrat, sans-serif' }}>
                        {selectedAgency.hero_url && selectedAgency.hero_type === 'video' && (
                          <video key={selectedAgency.hero_url} src={selectedAgency.hero_url} autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover opacity-60" />
                        )}
                        {selectedAgency.hero_url && selectedAgency.hero_type !== 'video' && (
                          <img src={selectedAgency.hero_url} className="absolute inset-0 w-full h-full object-cover opacity-60" alt="BG" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                        <div className="absolute inset-0 p-5 flex flex-col justify-between">
                          <div>
                            {selectedAgency.logo_url ? (
                              <img src={selectedAgency.logo_url} className="h-7 object-contain bg-white/10 backdrop-blur-md p-1 rounded-lg" alt="Logo" />
                            ) : (
                              <div className="w-7 h-7 rounded-lg" style={{ backgroundColor: selectedAgency.primary_color || '#6366f1' }} />
                            )}
                          </div>
                          <div className="space-y-2.5">
                            <h4 className="text-white text-base font-serif italic leading-tight">{selectedAgency.hero_title || t.placeholders.hero_text}</h4>
                            <div className="h-8 w-20 flex items-center justify-center text-[9px] font-bold text-white uppercase tracking-widest" style={{ backgroundColor: selectedAgency.button_color || '#6366f1', borderRadius: selectedAgency.button_style === 'rounded-full' ? '9999px' : '4px' }}>
                              {t.placeholders.button}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="px-4 py-3 border-t border-white/[0.05] flex items-center justify-between">
                      <span className="text-[9px] text-white/20 font-mono uppercase tracking-widest">{t.sections.preview}</span>
                      <div className="flex items-center gap-1.5">
                        <div className={`w-1.5 h-1.5 rounded-full ${siteIsActive ? 'bg-emerald-400 animate-pulse' : 'bg-red-400'}`} />
                        <span className={`text-[9px] font-bold uppercase tracking-widest ${siteIsActive ? 'text-emerald-400' : 'text-red-400'}`}>{siteIsActive ? 'Live' : 'Offline'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="h-full flex flex-col items-center justify-center space-y-4">
            <div className="w-20 h-20 rounded-2xl bg-white/[0.03] flex items-center justify-center border border-white/[0.06]">
              <Layout size={32} strokeWidth={1} className="text-white/20" />
            </div>
            <p className="text-sm font-medium text-white/30">{t.select_agency}</p>
          </div>
        )}
      </main>

      {/* CREATE MODAL — AnimatePresence spring */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 8 }}
              transition={{ type: "spring", duration: 0.4, bounce: 0.2 }}
              className="bg-[#0d1528] border border-white/[0.10] w-full max-w-md rounded-2xl p-8 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <header className="flex justify-between items-center mb-7">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
                    <Plus size={16} className="text-white" />
                  </div>
                  <h2 className="text-lg font-bold text-white">{t.new_agency}</h2>
                </div>
                <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-white/[0.06] rounded-xl transition-all text-white/40 hover:text-white/70"><X size={18} /></button>
              </header>
              <form onSubmit={handleCreateAgency} className="space-y-5">
                <div className="space-y-2">
                  <label className={lbl}>{t.fields.agency_name}</label>
                  <input required className={inp} value={newAgency.agency_name} onChange={(e) => setNewAgency({...newAgency, agency_name: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className={lbl}>{t.fields.subdomain}</label>
                  <input required className={`${inp} font-mono`} placeholder="slug-agence" value={newAgency.subdomain} onChange={(e) => setNewAgency({...newAgency, subdomain: e.target.value.toLowerCase().replace(/\s+/g, '-')})} />
                </div>
                <button disabled={isCreating} className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold text-[11px] uppercase tracking-widest shadow-lg shadow-indigo-500/25 hover:bg-indigo-500 transition-all disabled:opacity-50 active:scale-[0.99]">
                  {isCreating ? <Loader2 className="animate-spin mx-auto" size={16} /> : t.generate}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {marketplaceModule && selectedAgency && (
        <ModuleMarketplace
          moduleId={marketplaceModule}
          agencyId={selectedAgency.id}
          agencyName={selectedAgency.agency_name}
          agencyEmail={selectedAgency.email || ''}
          currentPlan={selectedAgency.package_level || 'silver'}
          onClose={() => setMarketplaceModule(null)}
        />
      )}
    </div>
  );
}