'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Save, Plus, Globe, Image as ImageIcon, Loader2,
  CheckCircle2, AlertCircle, Palette, Phone, Mail, Layout, X,
  Video, Monitor, Type, UploadCloud, Trash2, Facebook, Instagram,
  Share2, FileCode, Linkedin, Video as TikTokIcon, Zap, Cpu, Languages,
  MousePointer2, MessageCircle, ShieldCheck, Users, UserPlus, Briefcase, FileText,
  ChevronDown, Lock, Bot, Home as HomeIcon, TrendingUp
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
// TOGGLE SWITCH COMPONENT
// ============================================================
function ToggleSwitch({ checked, onChange, checkedColor = '#0f172a' }: { checked: boolean; onChange: (v: boolean) => void; checkedColor?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-400"
      style={{ backgroundColor: checked ? checkedColor : '#cbd5e1' }}
    >
      <span
        aria-hidden="true"
        className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow transform transition duration-200 ease-in-out ${checked ? 'translate-x-5' : 'translate-x-0'}`}
      />
    </button>
  );
}

export default function AgencyDashboard() {
  const [lang, setLang] = useState<'fr' | 'en'>('fr');
  const t = translations[lang];

  const [agencies, setAgencies] = useState<any[]>([]);
  const [selectedAgency, setSelectedAgency] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [team, setTeam] = useState<any[]>([]);

  // Integration panel expand state
  const [intOpen, setIntOpen] = useState({ propertyManager: false, whatsapp: false, crm: false, chatbot: false, leadsCrm: false });

  // Force light mode on the admin page
  useEffect(() => {
    document.documentElement.setAttribute('data-package', 'light');
    return () => document.documentElement.removeAttribute('data-package');
  }, []);

  const [newAgency, setNewAgency] = useState({
    agency_name: '',
    subdomain: '',
    package_level: 'silver'
  });

  useEffect(() => {
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
    fetchAgencies();
  }, []);

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
      const form = new FormData();
      form.append('file', file);
      form.append('filePath', filePath);
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'x-admin-secret': process.env.NEXT_PUBLIC_ADMIN_API_SECRET || '' },
        body: form,
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error); }
      const { publicUrl } = await res.json();
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
      const form = new FormData();
      form.append('file', file);
      form.append('filePath', filePath);
      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'x-admin-secret': process.env.NEXT_PUBLIC_ADMIN_API_SECRET || '' },
        body: form,
      });
      if (!res.ok) { const err = await res.json(); throw new Error(err.error); }
      const { publicUrl } = await res.json();
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

      const form = new FormData();
      form.append('file', file);
      form.append('filePath', filePath);

      const res = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: { 'x-admin-secret': process.env.NEXT_PUBLIC_ADMIN_API_SECRET || '' },
        body: form,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'Upload échoué');
      }

      const { publicUrl } = await res.json();

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
    if (!confirm(`Supprimer définitivement l'agence "${name}" ?`)) return;
    try {
      setIsSaving(true);
      const { error } = await supabase.from('agency_settings').delete().eq('id', id);
      if (error) throw error;
      setMessage({ type: 'success', text: "Agence supprimée" });
      const { data } = await supabase.from('agency_settings').select('*');
      setAgencies(data || []);
      if (data && data.length > 0) setSelectedAgency(data[0]);
      else setSelectedAgency(null);
    } catch { setMessage({ type: 'error', text: t.error_save }); }
    finally { setIsSaving(false); setTimeout(() => setMessage(null), 3000); }
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

  if (loading) return <div className="h-screen flex items-center justify-center bg-slate-50"><Loader2 className="animate-spin text-slate-900" size={40} /></div>;

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">

      {/* SIDEBAR */}
      <aside className="w-80 bg-white border-r border-slate-200 flex flex-col shadow-sm">
        <div className="p-8 border-b border-slate-100 bg-white sticky top-0 z-10">
          <div className="flex justify-between items-center mb-6">
            <button
              onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
              className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200 transition-all"
            >
              <Languages size={12} /> {lang.toUpperCase()}
            </button>
            <button onClick={() => setShowCreateModal(true)} className="p-2 bg-slate-900 text-white rounded-xl hover:bg-blue-600 transition-all shadow-lg active:scale-95">
              <Plus size={18} />
            </button>
          </div>
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{t.admin}</h2>
          <p className="font-serif italic text-xl text-slate-900 mt-1">{t.saas_title}</p>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {agencies.map((agency) => (
            <div key={agency.id} className="relative group">
              <button onClick={() => setSelectedAgency(agency)} className={`w-full text-left px-5 py-4 rounded-2xl text-sm transition-all duration-200 ${selectedAgency?.id === agency.id ? 'bg-slate-900 text-white shadow-xl translate-x-1' : 'text-slate-600 hover:bg-slate-100'}`}>
                <div className="font-bold truncate pr-6">{agency.agency_name}</div>
                <div className="text-[10px] opacity-50 mt-1 uppercase tracking-widest">{agency.subdomain}</div>
              </button>
              <button onClick={() => handleDelete(agency.id, agency.agency_name)} className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16} /></button>
            </div>
          ))}
        </nav>
      </aside>

      {/* MAIN */}
      <main className="flex-1 overflow-y-auto">
        {selectedAgency ? (
          <form onSubmit={handleSave} className="max-w-6xl mx-auto p-12 space-y-8">

            {/* STICKY HEADER */}
            <header className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm sticky top-0 z-20">
              <div className="flex items-center gap-6">
                {selectedAgency.logo_url ? (
                  <img src={selectedAgency.logo_url} className="w-16 h-16 rounded-2xl object-contain border border-slate-100 p-2 shadow-inner bg-slate-50" alt="Logo" />
                ) : (
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-inner" style={{ backgroundColor: selectedAgency.primary_color || '#0f172a' }}>{selectedAgency.agency_name?.charAt(0)}</div>
                )}
                <div>
                  <input
                    value={selectedAgency.agency_name || ''}
                    onChange={(e) => setSelectedAgency({...selectedAgency, agency_name: e.target.value})}
                    className="text-4xl font-serif italic text-slate-900 bg-transparent border-b border-slate-200 focus:border-slate-900 outline-none"
                  />
                  <span className="inline-block mt-2 px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-bold uppercase tracking-tighter">{selectedAgency.package_level} plan</span>
                </div>
              </div>
              <div className="flex items-center gap-6">
                {message && (
                  <div className={`flex items-center gap-2 px-5 py-3 rounded-full text-[11px] font-bold uppercase tracking-widest shadow-sm ${message.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'}`}>
                    {message.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                    {message.text}
                  </div>
                )}
                <button type="submit" disabled={isSaving} className="flex items-center gap-3 px-10 py-5 bg-slate-900 text-white rounded-full font-bold text-[11px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-2xl disabled:opacity-50">
                  {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} {isSaving ? t.saving : t.save}
                </button>
              </div>
            </header>

            {/* DEFAULT LANG */}
            <div className="space-y-4 border-t border-slate-50 pt-4">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Langue par défaut du site</label>
              <div className="flex gap-2">
                {selectedAgency.footer_config?.allowed_langs?.map((code: string) => (
                  <button key={code} type="button" onClick={() => setDefaultLang(code)}
                    className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase transition-all ${selectedAgency.default_lang === code ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}>
                    {code} {selectedAgency.default_lang === code && "⭐"}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">

                {/* ① IDENTITÉ */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
                  <h3 className="flex items-center gap-3 font-bold text-slate-900 border-b border-slate-100 pb-5 uppercase text-xs tracking-widest">
                    <Palette size={18} className="text-blue-600" /> {t.sections.branding}
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">{t.fields.logo}</label>
                      <div className="relative group">
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleLogoUpload} 
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                        />
                        <div className="w-full border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center gap-2 bg-slate-50 group-hover:bg-slate-100 transition-colors">
                          <UploadCloud className="text-slate-300" size={24} />
                          <span className="text-xs text-slate-500">{selectedAgency?.logo_url ? "Changer le logo" : t.placeholders.click_upload}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">{t.fields.subdomain}</label>
                      <div className="relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input type="text" value={selectedAgency?.subdomain || ''} onChange={(e) => setSelectedAgency({...selectedAgency, subdomain: e.target.value.toLowerCase().replace(/\s+/g, '-')})} className="w-full pl-12 pr-5 py-4 rounded-2xl border border-slate-200 text-sm font-mono bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none" placeholder={t.placeholders.slug} />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">Police d'écriture</label>
                      <div className="relative">
                        <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <select value={selectedAgency?.font_family || 'Montserrat'} onChange={(e) => setSelectedAgency({...selectedAgency, font_family: e.target.value})} className="w-full pl-12 pr-5 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm appearance-none bg-white font-medium">
                          <option value="Montserrat">Montserrat (Moderne)</option>
                          <option value="Inter">Inter (Minimaliste)</option>
                          <option value="'Playfair Display', serif">Playfair (Luxe)</option>
                          <option value="Poppins">Poppins (Arrondi)</option>
                          <option value="'Roboto Mono', monospace">Roboto Mono (Tech)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">{t.fields.primary_color}</label>
                      <div className="flex gap-4">
                        <input type="color" value={selectedAgency?.primary_color || '#0f172a'} onChange={(e) => setSelectedAgency({...selectedAgency, primary_color: e.target.value})} className="h-14 w-20 rounded-2xl cursor-pointer bg-white border border-slate-200 p-1 shadow-sm" />
                        <input type="text" value={selectedAgency?.primary_color || ''} onChange={(e) => setSelectedAgency({...selectedAgency, primary_color: e.target.value})} className="flex-1 px-5 border border-slate-200 rounded-2xl text-sm font-mono uppercase" />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <label className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        <MousePointer2 size={12} /> {t.fields.button_color}
                      </label>
                      <div className="flex gap-4">
                        <input type="color" value={selectedAgency?.button_color || '#2563eb'} onChange={(e) => setSelectedAgency({...selectedAgency, button_color: e.target.value})} className="h-14 w-20 rounded-2xl cursor-pointer bg-white border border-slate-200 p-1 shadow-sm" />
                        <input type="text" value={selectedAgency?.button_color || ''} onChange={(e) => setSelectedAgency({...selectedAgency, button_color: e.target.value})} className="flex-1 px-5 border border-slate-200 rounded-2xl text-sm font-mono uppercase" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t.fields.button_style}</label>
                    <div className="grid grid-cols-2 gap-4">
                      <button type="button" onClick={() => setSelectedAgency({...selectedAgency, button_style: 'rounded-none'})} className={`p-4 border-2 transition-all ${selectedAgency.button_style === 'rounded-none' ? 'border-black bg-slate-100' : 'border-slate-100 hover:border-slate-300'}`}>
                        <div className="text-center"><div className="w-full h-10 bg-slate-800 mb-2" style={{ borderRadius: 0 }}></div><span className="text-[9px] font-bold uppercase">Bords Droits</span></div>
                      </button>
                      <button type="button" onClick={() => setSelectedAgency({...selectedAgency, button_style: 'rounded-full'})} className={`p-4 border-2 transition-all ${selectedAgency.button_style === 'rounded-full' ? 'border-black bg-slate-100' : 'border-slate-100 hover:border-slate-300'} rounded-full`}>
                        <div className="text-center"><div className="w-full h-10 bg-slate-800 mb-2 rounded-full"></div><span className="text-[9px] font-bold uppercase">Bords Arrondis</span></div>
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4 pt-4 border-t border-slate-100">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t.fields.button_animation}</label>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { value: 'none', label: 'Aucune' },
                        { value: 'scale', label: 'Scale (Zoom)' },
                        { value: 'glow', label: 'Glow (Lueur)' },
                        { value: 'slide', label: 'Slide (Glissement)' },
                      ].map(opt => (
                        <button key={opt.value} type="button" onClick={() => setSelectedAgency({...selectedAgency, button_animation: opt.value})} className={`p-4 border-2 transition-all ${selectedAgency.button_animation === opt.value ? 'border-black bg-slate-100' : 'border-slate-100 hover:border-slate-300'}`}>
                          <span className="text-[9px] font-bold uppercase">{opt.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* ② HERO HEADER */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
                  <h3 className="flex items-center gap-3 font-bold text-slate-900 border-b border-slate-100 pb-5 uppercase text-xs tracking-widest">
                    <Layout size={18} className="text-blue-600" /> {t.sections.hero}
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">{t.fields.hero_type}</label>
                      <div className="flex p-1 bg-slate-100 rounded-2xl w-fit">
                        <button type="button" onClick={() => setSelectedAgency({...selectedAgency, hero_type: 'image'})} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold transition-all ${selectedAgency.hero_type !== 'video' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}><ImageIcon size={14} /> Image</button>
                        <button type="button" onClick={() => setSelectedAgency({...selectedAgency, hero_type: 'video'})} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold transition-all ${selectedAgency.hero_type === 'video' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}><Video size={14} /> Vidéo</button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">{t.fields.hero_file}</label>
                        <div className="relative group">
                          <input
                            type="file"
                            accept="image/*,video/*,.mp4,.mov,.webm,.avi"
                            onChange={handleHeroUpload}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                          />
                          <div className="w-full border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center gap-2 bg-slate-50 group-hover:bg-slate-100 transition-colors">
                            <UploadCloud className="text-slate-300" size={24} />
                            <span className="text-xs text-slate-500 font-medium">
                              {selectedAgency?.hero_url
                                ? (selectedAgency.hero_type === 'video' ? "Changer la vidéo" : "Changer l'image")
                                : t.placeholders.media_upload}
                            </span>
                            <span className="text-[9px] text-slate-400">Image ou vidéo MP4 · max 50 Mo</span>
                          </div>
                        </div>
                        
                        {selectedAgency?.hero_url && (
                          <div className="mt-3 p-3 bg-slate-100 rounded-xl relative group">
                            {selectedAgency.hero_type === 'video' ? (
                              <video src={selectedAgency.hero_url} className="w-full h-32 object-cover rounded-lg" controls />
                            ) : (
                              <img src={selectedAgency.hero_url} className="w-full h-32 object-cover rounded-lg" alt="Hero preview" />
                            )}
                            <button
                              type="button"
                              onClick={handleRemoveHero}
                              className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-3">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">{t.fields.hero_title}</label>
                        <textarea 
                          rows={4} 
                          value={selectedAgency.hero_title || ''} 
                          onChange={(e) => setSelectedAgency({...selectedAgency, hero_title: e.target.value})} 
                          placeholder={t.placeholders.hero_text} 
                          className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-serif italic text-lg" 
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* ③ LANGUES & XML */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
                  <h3 className="flex items-center gap-3 font-bold text-slate-900 uppercase text-xs tracking-widest border-b border-slate-50 pb-4">
                    <FileCode size={18} className="text-blue-600" /> {t.sections.lang_xml}
                  </h3>
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.fields.allowed_langs}</label>
                    <div className="flex flex-wrap gap-2">
                      {SUPPORTED_LANGUAGES.map(l => (
                        <button key={l.code} type="button" onClick={() => toggleLanguage(l.code)} className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase transition-all ${selectedAgency?.footer_config?.allowed_langs?.includes(l.code) ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}>
                          {l.label}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.fields.xml_sources}</label>
                    <div className="grid grid-cols-1 gap-2">
                      {DISPONIBLE_XML_SOURCES.map((s) => (
                        <button key={s.id} type="button" onClick={() => toggleXmlSource(s.url)} className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${selectedAgency?.footer_config?.xml_urls?.includes(s.url) ? 'border-blue-500 bg-blue-50/30' : 'border-slate-50'}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded flex items-center justify-center border ${selectedAgency?.footer_config?.xml_urls?.includes(s.url) ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-200'}`}>
                              {selectedAgency?.footer_config?.xml_urls?.includes(s.url) && <CheckCircle2 size={12} className="text-white" />}
                            </div>
                            <span className="text-sm font-bold">{s.name}</span>
                          </div>
                          <span className="text-[9px] font-mono text-slate-300 truncate max-w-[150px]">{s.url}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* HabiHub Agent ID */}
                  <div className="space-y-2 pt-2 border-t border-slate-50">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <FileCode size={12} /> HabiHub Agent ID
                      <span className="text-slate-300 font-normal normal-case tracking-normal">(fourni par HabiHub)</span>
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-mono focus:ring-2 focus:ring-blue-400 outline-none"
                      placeholder="ex: 6d5cb68a-3636-4095-b0ce-7dc9ec2df2d2"
                      value={selectedAgency?.habihub_agent_id || ''}
                      onChange={(e) => setSelectedAgency({ ...selectedAgency, habihub_agent_id: e.target.value })}
                    />
                    <p className="text-[10px] text-slate-400">
                      Permet à Francisco d&apos;envoyer des flux XML sans connaître votre UUID interne.
                    </p>
                  </div>
                </div>

                {/* ④ ÉQUIPE */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
                  <div className="flex justify-between items-center border-b pb-4">
                    <h3 className="flex items-center gap-2 font-bold text-slate-900 uppercase text-xs tracking-widest">
                      <Users size={18} className="text-blue-600" /> {t.sections.team}
                    </h3>
                    <button type="button" onClick={addMember} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-all">
                      <UserPlus size={14} /> {t.buttons.add_member}
                    </button>
                  </div>
                  {team.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                      <Users size={48} className="mx-auto mb-3 opacity-50" />
                      <p className="text-sm">Aucun membre dans l'équipe.</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {team.map((member, index) => (
                        <div key={index} className="border border-slate-100 rounded-2xl p-6 space-y-4 relative bg-slate-50/30">
                          <button type="button" onClick={() => removeMember(index)} className="absolute top-4 right-4 p-2 text-red-500 hover:bg-red-50 rounded-xl transition-all"><Trash2 size={16} /></button>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest flex items-center gap-2"><ImageIcon size={12} /> {t.fields.member_photo}</label>
                              <div className="relative group">
                                <input type="file" accept="image/*" onChange={(e) => handleMemberPhotoUpload(e, index)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                <div className="flex items-center gap-4 p-3 bg-white border border-slate-200 rounded-xl">
                                  {member.photo ? (
                                    <img src={member.photo} className="w-12 h-12 rounded-full object-cover" alt={member.name} />
                                  ) : (
                                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center"><UserPlus size={20} className="text-slate-400" /></div>
                                  )}
                                  <span className="text-xs text-slate-500">Cliquer pour uploader une photo</span>
                                </div>
                              </div>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest flex items-center gap-2"><Users size={12} /> {t.fields.member_name}</label>
                              <input type="text" className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm" placeholder={t.placeholders.member_name} value={member.name || ''} onChange={(e) => updateMember(index, 'name', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest flex items-center gap-2"><Briefcase size={12} /> {t.fields.member_role}</label>
                              <input type="text" className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm" placeholder={t.placeholders.member_role} value={member.role || ''} onChange={(e) => updateMember(index, 'role', e.target.value)} />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                              <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest flex items-center gap-2"><FileText size={12} /> {t.fields.member_bio}</label>
                              <textarea rows={3} className="w-full p-3 bg-white border border-slate-200 rounded-xl text-sm" placeholder={t.placeholders.member_bio} value={member.bio || ''} onChange={(e) => updateMember(index, 'bio', e.target.value)} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* ⑤ CONTACT & RÉSEAUX SOCIAUX */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
                  <h3 className="flex items-center gap-3 font-bold text-slate-900 uppercase text-xs tracking-widest border-b border-slate-50 pb-4">
                    <Share2 size={18} className="text-blue-600" /> {t.sections.socials}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative"><Linkedin className="absolute left-4 top-4 text-slate-300" size={16} /><input placeholder={t.fields.linkedin} className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-100 text-sm" value={selectedAgency.footer_config?.socials?.linkedin || ''} onChange={(e) => updateNestedConfig('socials', 'linkedin', e.target.value)} /></div>
                    <div className="relative"><TikTokIcon className="absolute left-4 top-4 text-slate-300" size={16} /><input placeholder={t.fields.tiktok} className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-100 text-sm" value={selectedAgency.footer_config?.socials?.tiktok || ''} onChange={(e) => updateNestedConfig('socials', 'tiktok', e.target.value)} /></div>
                    <div className="relative"><Facebook className="absolute left-4 top-4 text-slate-300" size={16} /><input placeholder={t.fields.facebook} className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-100 text-sm" value={selectedAgency.footer_config?.socials?.facebook || ''} onChange={(e) => updateNestedConfig('socials', 'facebook', e.target.value)} /></div>
                    <div className="relative"><Instagram className="absolute left-4 top-4 text-slate-300" size={16} /><input placeholder={t.fields.instagram} className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-100 text-sm" value={selectedAgency.footer_config?.socials?.instagram || ''} onChange={(e) => updateNestedConfig('socials', 'instagram', e.target.value)} /></div>
                    <div className="relative md:col-span-2 border-t border-slate-50 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative"><Mail className="absolute left-4 top-4 text-slate-300" size={16} /><input placeholder={t.fields.email} className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-100 text-sm" value={selectedAgency.footer_config?.email || ''} onChange={(e) => updateRootConfig('email', e.target.value)} /></div>
                      <div className="relative"><Phone className="absolute left-4 top-4 text-slate-300" size={16} /><input placeholder={t.fields.phone} className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-100 text-sm" value={selectedAgency.footer_config?.phone || ''} onChange={(e) => updateRootConfig('phone', e.target.value)} /></div>
                    </div>
                  </div>
                </div>

                {/* ⑥ MODULES & ABONNEMENT */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 border-l-4 border-l-purple-500 shadow-sm space-y-4">
                  <div className="flex items-start justify-between border-b border-slate-50 pb-4">
                    <h3 className="flex items-center gap-3 font-bold text-slate-900 uppercase text-xs tracking-widest">
                      <Zap size={18} className="text-purple-600" /> Modules & Abonnement
                    </h3>
                    <span className="text-[9px] text-slate-400 uppercase tracking-widest text-right leading-relaxed max-w-[200px]">
                      L'activation sera conditionnée au paiement lors du lancement commercial
                    </span>
                  </div>

                  {/* MODULE: Site Web Public */}
                  {(() => {
                    const siteActive = getSub('website_active') !== false;
                    return (
                      <div className={`rounded-2xl border-2 overflow-hidden transition-all duration-200 ${siteActive ? 'border-emerald-200' : 'border-slate-200'}`}>
                        <div className={`flex items-center justify-between p-4 ${siteActive ? 'bg-emerald-50/40' : 'bg-slate-50/30'}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${siteActive ? 'bg-emerald-100' : 'bg-slate-100'}`}>
                              <Globe size={20} className={siteActive ? 'text-emerald-600' : 'text-slate-400'} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-bold text-slate-900">Site Web Public</span>
                                <span className="px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-full bg-emerald-100 text-emerald-700">Inclus</span>
                              </div>
                              <p className="text-[10px] text-slate-400 uppercase tracking-tight font-bold mt-0.5">Visibilité publique du site agence</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${siteActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                              {siteActive ? 'ACTIF' : 'INACTIF'}
                            </span>
                            <ToggleSwitch
                              checked={siteActive}
                              checkedColor="#10b981"
                              onChange={(v) => updateNestedConfig('subscription', 'website_active', v)}
                            />
                          </div>
                        </div>
                        {!siteActive && (
                          <div className="px-5 py-3 bg-amber-50 border-t border-amber-100 flex items-center gap-2">
                            <AlertCircle size={13} className="text-amber-500 shrink-0" />
                            <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wide">Le site est inaccessible aux visiteurs tant que ce module est désactivé.</p>
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
                      <div className={`rounded-2xl border-2 overflow-hidden transition-all duration-200 ${enabled ? 'border-green-200' : 'border-slate-200'}`}>
                        <div className={`flex items-center justify-between p-4 ${enabled ? 'bg-green-50/40' : 'bg-slate-50/20'}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${enabled ? 'bg-green-100' : 'bg-slate-100'}`}>
                              <HomeIcon size={20} className={enabled ? 'text-green-600' : 'text-slate-400'} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-bold text-slate-900">Property Manager</span>
                                <span className="flex items-center gap-1 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-full bg-green-100 text-green-700">
                                  <Lock size={8} /> Module
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 uppercase tracking-tight font-bold mt-0.5">Gestion manuelle des biens</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${enabled ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                              {enabled ? 'ACTIF' : 'INACTIF'}
                            </span>
                            <ToggleSwitch
                              checked={enabled}
                              checkedColor="#16a34a"
                              onChange={(v) => {
                                updateNestedConfig('integrations', 'property_manager_enabled', v);
                              }}
                            />
                          </div>
                        </div>
                        {enabled && slug && (
                          <div className="px-5 py-4 border-t border-green-100 bg-green-50/30 flex items-center justify-between gap-3">
                            <p className="text-[10px] text-green-700 font-bold uppercase tracking-wide">
                              L'agence peut gérer ses biens manuellement depuis son espace dédié
                            </p>
                            <a
                              href={`/fr/${slug}/mon-espace`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-green-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full hover:bg-green-700 transition-all"
                            >
                              <Globe size={10} /> Ouvrir l'espace agence →
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* MODULE: WhatsApp Business */}
                  {(() => {
                    const enabled = !!getInt('whatsapp_enabled');
                    return (
                      <div className={`rounded-2xl border-2 overflow-hidden transition-all duration-200 ${enabled ? 'border-green-200' : 'border-slate-200'}`}>
                        <div className={`flex items-center justify-between p-4 ${enabled ? 'bg-green-50/40' : 'bg-slate-50/20'}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${enabled ? 'bg-green-100' : 'bg-slate-100'}`}>
                              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" className={enabled ? 'text-green-600' : 'text-slate-400'}>
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                              </svg>
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-bold text-slate-900">WhatsApp Business</span>
                                <span className="flex items-center gap-1 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-full bg-purple-100 text-purple-700">
                                  <Lock size={8} /> Module
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 uppercase tracking-tight font-bold mt-0.5">Bouton de contact rapide</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${enabled ? 'bg-green-100 text-green-700' : 'bg-slate-100 text-slate-500'}`}>
                              {enabled ? 'ACTIF' : 'INACTIF'}
                            </span>
                            <ToggleSwitch
                              checked={enabled}
                              checkedColor="#22c55e"
                              onChange={(v) => {
                                updateNestedConfig('integrations', 'whatsapp_enabled', v);
                                setIntOpen(prev => ({ ...prev, whatsapp: v }));
                              }}
                            />
                            {enabled && (
                              <button type="button" onClick={() => setIntOpen(prev => ({ ...prev, whatsapp: !prev.whatsapp }))} className="p-1 hover:bg-slate-100 rounded-lg transition-all">
                                <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${intOpen.whatsapp ? 'rotate-180' : ''}`} />
                              </button>
                            )}
                          </div>
                        </div>
                        {intOpen.whatsapp && enabled && (
                          <div className="p-5 border-t border-slate-100 bg-white space-y-3">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Numéro WhatsApp</label>
                            <div className="relative">
                              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor" className="absolute left-4 top-4 text-green-400">
                                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                              </svg>
                              <input
                                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-100 text-sm bg-slate-50 focus:ring-2 focus:ring-green-400 outline-none"
                                placeholder="Ex: 33600000000 (sans +)"
                                value={getInt('whatsapp_number') || ''}
                                onChange={(e) => updateNestedConfig('integrations', 'whatsapp_number', e.target.value)}
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* MODULE: Chatbot IA */}
                  {(() => {
                    const enabled = !!getInt('chatbot_enabled');
                    return (
                      <div className={`rounded-2xl border-2 overflow-hidden transition-all duration-200 ${enabled ? 'border-purple-200' : 'border-slate-200'}`}>
                        <div className={`flex items-center justify-between p-4 ${enabled ? 'bg-purple-50/40' : 'bg-slate-50/20'}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${enabled ? 'bg-purple-100' : 'bg-slate-100'}`}>
                              <Bot size={20} className={enabled ? 'text-purple-600' : 'text-slate-400'} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-bold text-slate-900">Chatbot IA</span>
                                <span className="flex items-center gap-1 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-full bg-purple-100 text-purple-700">
                                  <Lock size={8} /> Module
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 uppercase tracking-tight font-bold mt-0.5">Qualification automatique des leads</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${enabled ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-500'}`}>
                              {enabled ? 'ACTIF' : 'INACTIF'}
                            </span>
                            <ToggleSwitch
                              checked={enabled}
                              checkedColor="#9333ea"
                              onChange={(v) => {
                                updateNestedConfig('integrations', 'chatbot_enabled', v);
                                setIntOpen(prev => ({ ...prev, chatbot: v }));
                              }}
                            />
                            {enabled && (
                              <button type="button" onClick={() => setIntOpen(prev => ({ ...prev, chatbot: !prev.chatbot }))} className="p-1 hover:bg-slate-100 rounded-lg transition-all">
                                <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${intOpen.chatbot ? 'rotate-180' : ''}`} />
                              </button>
                            )}
                          </div>
                        </div>
                        {intOpen.chatbot && enabled && (
                          <div className="p-5 border-t border-slate-100 bg-white space-y-4">
                            <div className="flex items-center gap-2 px-4 py-3 bg-purple-50 rounded-xl border border-purple-100">
                              <Cpu size={13} className="text-purple-400 shrink-0" />
                              <p className="text-[10px] text-purple-700 font-bold uppercase tracking-wide">IA propulsée par la plateforme — inclus dans l'abonnement</p>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Destination des leads</label>
                              <select
                                className="w-full px-4 py-3 rounded-2xl border border-slate-100 text-sm bg-slate-50 focus:ring-2 focus:ring-purple-500 outline-none"
                                value={getInt('leads_destination') || 'local'}
                                onChange={(e) => updateNestedConfig('integrations', 'leads_destination', e.target.value)}
                              >
                                <option value="local">Table locale (Supabase)</option>
                                <option value="zoho">Zoho CRM</option>
                                <option value="hubspot">HubSpot</option>
                              </select>
                            </div>
                            <div className="space-y-2">
                              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Couleur du chatbot</label>
                              <div className="flex gap-4">
                                <input
                                  type="color"
                                  value={getInt('chatbot_color') || '#7c3aed'}
                                  onChange={(e) => updateNestedConfig('integrations', 'chatbot_color', e.target.value)}
                                  className="h-12 w-16 rounded-xl cursor-pointer bg-white border border-slate-200 p-1 shadow-sm"
                                />
                                <input
                                  type="text"
                                  value={getInt('chatbot_color') || '#7c3aed'}
                                  onChange={(e) => updateNestedConfig('integrations', 'chatbot_color', e.target.value)}
                                  className="flex-1 px-5 border border-slate-200 rounded-2xl text-sm font-mono uppercase focus:ring-2 focus:ring-purple-500 outline-none"
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* MODULE: CRM — activation admin uniquement, credentials configurés par le client */}
                  {(() => {
                    const enabled = !!getInt('crm_enabled');
                    const slug = selectedAgency?.subdomain;
                    return (
                      <div className={`rounded-2xl border-2 overflow-hidden transition-all duration-200 ${enabled ? 'border-blue-200' : 'border-slate-200'}`}>
                        <div className={`flex items-center justify-between p-4 ${enabled ? 'bg-blue-50/30' : 'bg-slate-50/20'}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${enabled ? 'bg-blue-100' : 'bg-slate-100'}`}>
                              <Zap size={20} className={enabled ? 'text-blue-600' : 'text-slate-400'} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-bold text-slate-900">CRM (Zoho / HubSpot)</span>
                                <span className="flex items-center gap-1 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-full bg-purple-100 text-purple-700">
                                  <Lock size={8} /> Module
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 uppercase tracking-tight font-bold mt-0.5">Synchronisation des leads</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${enabled ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                              {enabled ? 'ACTIF' : 'INACTIF'}
                            </span>
                            <ToggleSwitch
                              checked={enabled}
                              checkedColor="#2563eb"
                              onChange={(v) => {
                                updateNestedConfig('integrations', 'crm_enabled', v);
                                setIntOpen(prev => ({ ...prev, crm: v }));
                              }}
                            />
                          </div>
                        </div>
                        {intOpen.crm && enabled && slug && (
                          <div className="px-5 py-3 bg-blue-50/50 border-t border-blue-100 flex items-center justify-between gap-3">
                            <p className="text-[10px] text-blue-700 font-bold uppercase tracking-wide">
                              Les identifiants CRM sont configurés par l'agence depuis sa page de paramétrage
                            </p>
                            <a
                              href={`/fr/${slug}/parametres/crm`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full hover:bg-blue-700 transition-all"
                            >
                              <Globe size={10} /> Ouvrir
                            </a>
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
                      <div className={`rounded-2xl border-2 overflow-hidden transition-all duration-200 ${enabled ? 'border-orange-200' : 'border-slate-200'}`}>
                        <div className={`flex items-center justify-between p-4 ${enabled ? 'bg-orange-50/40' : 'bg-slate-50/20'}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${enabled ? 'bg-orange-100' : 'bg-slate-100'}`}>
                              <TrendingUp size={20} className={enabled ? 'text-orange-600' : 'text-slate-400'} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm font-bold text-slate-900">Mini CRM Leads</span>
                                <span className="flex items-center gap-1 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest rounded-full bg-orange-100 text-orange-600">
                                  <Lock size={8} /> Module
                                </span>
                              </div>
                              <p className="text-[10px] text-slate-400 uppercase tracking-tight font-bold mt-0.5">Accès leads depuis le site agence</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`text-[9px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full ${enabled ? 'bg-orange-100 text-orange-700' : 'bg-slate-100 text-slate-500'}`}>
                              {enabled ? 'ACTIF' : 'INACTIF'}
                            </span>
                            <ToggleSwitch
                              checked={enabled}
                              checkedColor="#ea580c"
                              onChange={(v) => {
                                updateNestedConfig('integrations', 'leads_enabled', v);
                                setIntOpen(prev => ({ ...prev, leadsCrm: v }));
                              }}
                            />
                          </div>
                        </div>
                        {enabled && slug && (
                          <div className="px-5 py-3 bg-orange-50/50 border-t border-orange-100 flex items-center justify-between gap-3">
                            <p className="text-[10px] text-orange-700 font-bold uppercase tracking-wide">
                              Accès protégé par mot de passe — défini par l'agence à la première connexion
                            </p>
                            <a
                              href={`/fr/${slug}/mes-leads`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 bg-orange-600 text-white text-[9px] font-black uppercase tracking-widest rounded-full hover:bg-orange-700 transition-all"
                            >
                              <TrendingUp size={10} /> Ouvrir le CRM
                            </a>
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </div>

                {/* ⑦ PAGES STATIQUES (ABOUT) */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
                  <h3 className="flex items-center gap-3 font-bold text-slate-900 uppercase text-xs tracking-widest border-b border-slate-50 pb-4">
                    <Type size={18} className="text-blue-600" /> {t.sections.about}
                  </h3>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">{t.fields.about_title}</label>
                    <input type="text" className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm" placeholder={t.placeholders.about_title} value={selectedAgency?.about_title || ''} onChange={(e) => setSelectedAgency({...selectedAgency, about_title: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">{t.fields.about_text}</label>
                    <textarea rows={6} className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm" placeholder={t.placeholders.about_text} value={selectedAgency?.about_text || ''} onChange={(e) => setSelectedAgency({...selectedAgency, about_text: e.target.value})} />
                  </div>
                </div>

                {/* ⑧ CONFORMITÉ & LÉGAL */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 border-l-4 border-l-slate-900 shadow-sm space-y-6">
                  <h3 className="flex items-center gap-3 font-bold text-slate-900 uppercase text-xs tracking-widest border-b border-slate-50 pb-4">
                    <ShieldCheck size={18} className="text-slate-900" /> {t.sections.legal}
                  </h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="space-y-1">
                        <span className="text-sm font-bold text-slate-900">Bandeau de Cookies</span>
                        <p className="text-[10px] text-slate-400 uppercase tracking-tight font-bold">Conformité RGPD</p>
                      </div>
                      <ToggleSwitch
                        checked={selectedAgency.cookie_consent_enabled || false}
                        checkedColor="#0f172a"
                        onChange={(v) => setSelectedAgency({...selectedAgency, cookie_consent_enabled: v})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.fields.privacy_policy}</label>
                      <textarea rows={5} className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 text-sm focus:ring-2 focus:ring-slate-900 outline-none" placeholder="Saisissez ici les mentions légales..." value={selectedAgency.privacy_policy || ''} onChange={(e) => setSelectedAgency({...selectedAgency, privacy_policy: e.target.value})} />
                    </div>
                  </div>
                </div>

              </div>

              {/* LIVE PREVIEW */}
              <div className="lg:col-span-1">
                <div className="bg-slate-900 p-6 rounded-[2.5rem] shadow-2xl sticky top-8 overflow-hidden">
                  <div className="flex items-center gap-2 mb-4 text-white/50 text-[10px] font-bold uppercase tracking-widest">
                    <Monitor size={14} /> {t.sections.preview}
                  </div>
                  <div className="relative aspect-[4/5] rounded-[1.5rem] overflow-hidden bg-slate-800" style={{ fontFamily: selectedAgency.font_family || 'Montserrat, sans-serif' }}>
                    {selectedAgency.hero_url && selectedAgency.hero_type === 'video' && (
                      <video
                        key={selectedAgency.hero_url}
                        src={selectedAgency.hero_url}
                        autoPlay
                        loop
                        muted
                        playsInline
                        className="absolute inset-0 w-full h-full object-cover opacity-60"
                      />
                    )}
                    {selectedAgency.hero_url && selectedAgency.hero_type !== 'video' && (
                      <img src={selectedAgency.hero_url} className="absolute inset-0 w-full h-full object-cover opacity-60" alt="BG" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                    <div className="absolute inset-0 p-6 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        {selectedAgency.logo_url ? (
                          <img src={selectedAgency.logo_url} className="h-8 object-contain bg-white/10 backdrop-blur-md p-1 rounded-lg" alt="Logo" />
                        ) : (
                          <div className="w-8 h-8 rounded" style={{backgroundColor: selectedAgency.primary_color || '#3b82f6'}} />
                        )}
                      </div>
                      <div className="space-y-3">
                        <h4 className="text-white text-xl font-serif italic leading-tight" style={{ fontFamily: `${selectedAgency.font_family || 'Montserrat'}, sans-serif` }}>
                          {selectedAgency.hero_title || t.placeholders.hero_text}
                        </h4>
                        <div
                          className={`h-10 w-24 flex items-center justify-center text-[10px] font-bold text-white uppercase tracking-widest shadow-lg transition-all ${selectedAgency.button_animation === 'scale' ? 'hover:scale-105' : selectedAgency.button_animation === 'glow' ? 'hover:shadow-lg hover:shadow-white/20' : selectedAgency.button_animation === 'slide' ? 'hover:translate-x-1' : ''}`}
                          style={{ backgroundColor: selectedAgency.button_color || '#3b82f6', borderRadius: selectedAgency.button_style === 'rounded-full' ? '9999px' : '0px' }}
                        >
                          {t.placeholders.button}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </form>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center">
              <Layout size={60} strokeWidth={1} />
            </div>
            <p className="text-sm font-medium">{t.select_agency}</p>
          </div>
        )}
      </main>

      {/* CREATE MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl space-y-8 animate-in zoom-in duration-300">
            <header className="flex justify-between items-center">
              <h2 className="text-2xl font-serif italic">{t.new_agency}</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all"><X size={20} /></button>
            </header>
            <form onSubmit={handleCreateAgency} className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t.fields.agency_name}</label>
                <input required className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 text-sm" value={newAgency.agency_name} onChange={(e) => setNewAgency({...newAgency, agency_name: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{t.fields.subdomain}</label>
                <input required className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 text-sm font-mono" placeholder="slug-agence" value={newAgency.subdomain} onChange={(e) => setNewAgency({...newAgency, subdomain: e.target.value.toLowerCase().replace(/\s+/g, '-')})} />
              </div>
              <button disabled={isCreating} className="w-full py-5 bg-slate-900 text-white rounded-full font-bold text-[11px] uppercase tracking-widest shadow-xl hover:bg-blue-600 transition-all disabled:opacity-50">
                {isCreating ? <Loader2 className="animate-spin mx-auto" size={16} /> : t.generate}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}