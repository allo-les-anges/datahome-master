"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase'; 
import { 
  Save, Plus, Globe, Image as ImageIcon, Loader2, 
  CheckCircle2, AlertCircle, Palette, Phone, Mail, Layout, X,
  Video, Monitor, Type, UploadCloud, Trash2, Facebook, Instagram, 
  Share2, FileCode, Linkedin, Video as TikTokIcon, Zap, Cpu, Languages,
  MousePointer2, MessageCircle, ShieldCheck
} from 'lucide-react';

// --- DICTIONNAIRE DE TRADUCTION ---
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
    sections: {
      lang_xml: "Langues & Flux XML",
      socials: "Réseaux Sociaux & Contact",
      integrations: "Intégrations (CRM & IA)",
      branding: "Identité Visuelle & Couleurs",
      hero: "Configuration du Hero Header",
      preview: "Aperçu en temps réel",
      legal: "Conformité & Légal"
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
      hero_title: "Titre d'accroche (Hero)",
      hero_type: "Type de média",
      hero_file: "Fichier Média (Image/Vidéo)",
      email: "Email de contact",
      phone: "Téléphone Fixe",
      whatsapp: "Numéro WhatsApp (GSM)",
      about_title: "Titre de la page À Propos",
      about_text: "Texte de la page À Propos",
      privacy_policy: "Politique de confidentialité"
    },
    placeholders: {
      slug: "nom-de-lagence",
      hero_text: "Découvrez nos biens d'exception...",
      click_upload: "Cliquer pour uploader",
      media_upload: "Charger le média",
      button: "Bouton",
      whatsapp: "Ex: 33600000000 (sans +)"
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
    sections: {
      lang_xml: "Languages & XML Feeds",
      socials: "Social Networks & Contact",
      integrations: "Integrations (CRM & AI)",
      branding: "Visual Identity & Colors",
      hero: "Hero Header Setup",
      preview: "Live Preview",
      legal: "Compliance & Legal"
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
      hero_title: "Hero Title",
      hero_type: "Media Type",
      hero_file: "Hero Media (Image/Video)",
      email: "Contact Email",
      phone: "Landline Phone",
      whatsapp: "WhatsApp Number (Mobile)",
      about_title: "About Page Title",
      about_text: "About Page Text",
      privacy_policy: "Privacy Policy"
    },
    placeholders: {
      slug: "agency-name",
      hero_text: "Discover our exceptional properties...",
      click_upload: "Click to upload",
      media_upload: "Upload media",
      button: "Button",
      whatsapp: "Ex: 44600000000 (no +)"
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
    sections: {
      lang_xml: "Idiomas y Flujos XML",
      socials: "Redes Sociales y Contacto",
      integrations: "Integraciones (CRM e IA)",
      branding: "Identidad Visual y Colores",
      hero: "Configuración del Hero Header",
      preview: "Vista previa en tiempo real",
      legal: "Cumplimiento y Legal"
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
      hero_title: "Título de cabecera (Hero)",
      hero_type: "Tipo de medio",
      hero_file: "Archivo multimedia (Imagen/Video)",
      email: "Correo de contacto",
      phone: "Teléfono fijo",
      whatsapp: "Número WhatsApp (Móvil)",
      about_title: "Título de la página Sobre Nosotros",
      about_text: "Texto de la página Sobre Nosotros",
      privacy_policy: "Política de Privacidad"
    },
    placeholders: {
      slug: "nombre-de-la-agencia",
      hero_text: "Descubra nuestras propiedades excepcionales...",
      click_upload: "Clic para subir",
      media_upload: "Cargar medio",
      button: "Botón",
      whatsapp: "Ej: 34600000000 (sin +)"
    }
  },
  pl: {
    admin: "Administracja",
    saas_title: "SaaS Agencje",
    new_agency: "Nowa Agencja",
    select_agency: "Wybierz agencję, aby skonfigurować jej branding.",
    save: "Zapisz zmiany",
    saving: "Zapisywanie...",
    success_save: "Konfiguracja zapisana pomyślnie!",
    error_save: "Błąd podczas zapisywania.",
    generate: "Generuj Agencję",
    sections: {
      lang_xml: "Języki i kanały XML",
      socials: "Media społecznościowe i kontakt",
      integrations: "Integracje (CRM i AI)",
      branding: "Tożsamość wizualna i kolory",
      hero: "Konfiguracja nagłówka Hero",
      preview: "Podgląd na żywo",
      legal: "Zgodność i prawo"
    },
    fields: {
      allowed_langs: "Dozwolone języki witryny",
      xml_sources: "Kanały nieruchomości (XML)",
      facebook: "Link do Facebooka",
      instagram: "Link do Instagrama",
      linkedin: "Link do LinkedIn",
      tiktok: "Link do TikToka",
      zoho: "Zoho CRM (ID / Token)",
      taskade: "Taskade AI Agent ID",
      agency_name: "Nazwa agencji",
      subdomain: "URL witryny (Slug)",
      logo: "Logo agencji",
      font: "Czcionka",
      font_family: "Czcionka",
      primary_color: "Kolor główny (Akcenty)",
      button_color: "Kolor przycisków (CTA)",
      hero_title: "Tytuł nagłówka (Hero)",
      hero_type: "Typ mediów",
      hero_file: "Plik multimedialny (Obraz/Wideo)",
      email: "E-mail kontaktowy",
      phone: "Telefon stacjonarny",
      whatsapp: "Numer WhatsApp (Komórkowy)",
      about_title: "Tytuł strony O nas",
      about_text: "Tekst strony O nas",
      privacy_policy: "Polityka prywatności"
    },
    placeholders: {
      slug: "nazwa-agencji",
      hero_text: "Odkryj nasze wyjątkowe nieruchomości...",
      click_upload: "Kliknij, aby przesłać",
      media_upload: "Prześlij media",
      button: "Przycisk",
      whatsapp: "Np: 48600000000 (bez +)"
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
    sections: {
      lang_xml: "Talen & XML-feeds",
      socials: "Sociale netwerken & Contact",
      integrations: "Integraties (CRM & AI)",
      branding: "Visuele identiteit & Kleuren",
      hero: "Hero Header configuratie",
      preview: "Live voorbeeld",
      legal: "Compliance & Wettelijk"
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
      hero_title: "Hero titel",
      hero_type: "Mediatype",
      hero_file: "Mediabestand (Afbeelding/Video)",
      email: "Contact e-mail",
      phone: "Vaste lijn",
      whatsapp: "WhatsApp-nummer (Mobiel)",
      about_title: "Titel over ons pagina",
      about_text: "Tekst over ons pagina",
      privacy_policy: "Privacybeleid"
    },
    placeholders: {
      slug: "naam-van-agentschap",
      hero_text: "Ontdek onze exclusieve panden...",
      click_upload: "Klik om te uploaden",
      media_upload: "Media uploaden",
      button: "Knop",
      whatsapp: "Bijv: 31600000000 (zonder +)"
    }
  },
  ar: {
    admin: "الإدارة",
    saas_title: "نظام إدارة الوكالات",
    new_agency: "وكالة جديدة",
    select_agency: "اختر وكالة لتكوين هويتها التجارية.",
    save: "حفظ التغييرات",
    saving: "جاري الحفظ...",
    success_save: "تم حفظ الإعدادات بنجاح!",
    error_save: "خطأ أثناء الحفظ.",
    generate: "إنشاء الوكالة",
    sections: {
      lang_xml: "اللغات وخلاصات XML",
      socials: "شبكات التواصل والاتصال",
      integrations: "التكاملات (CRM وذكاء اصطناعي)",
      branding: "الهوية البصرية والألوان",
      hero: "إعداد واجهة العرض (Hero)",
      preview: "معاينة مباشرة",
      legal: "المطابقة والقانوني"
    },
    fields: {
      allowed_langs: "اللغات المسموح بها في الموقع",
      xml_sources: "خلاصات العقارات (XML)",
      facebook: "رابط فيسبوك",
      instagram: "رابط إنستغرام",
      linkedin: "رابط لينكد إن",
      tiktok: "رابط تيك توك",
      zoho: "Zoho CRM (ID / Token)",
      taskade: "Taskade AI Agent ID",
      agency_name: "اسم الوكالة",
      subdomain: "رابط الموقع (Slug)",
      logo: "شعار الوكالة",
      font: "نوع الخط",
      font_family: "نوع الخط",
      primary_color: "اللون الأساسي",
      button_color: "لؤن الأزرار",
      hero_title: "عنوان واجهة العرض",
      hero_type: "نوع الوسائط",
      hero_file: "ملف الوسائط (صورة/فيديو)",
      email: "البريد الإلكتروني للاتصال",
      phone: "الهاتف الثابت",
      whatsapp: "رقم الواتساب (الجوال)",
      about_title: "عنوان صفحة 'من نحن'",
      about_text: "نص صفحة 'من نحن'",
      privacy_policy: "سياسة الخصوصية"
    },
    placeholders: {
      slug: "اسم-الوكالة",
      hero_text: "اكتشف عقاراتنا الاستثنائية...",
      click_upload: "انقر للتحميل",
      media_upload: "تحميل الوسائط",
      button: "زر",
      whatsapp: "مثال: 966500000000 (بدون +)"
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

  const [newAgency, setNewAgency] = useState({
    agency_name: '',
    subdomain: '',
    package_level: 'silver'
  });

  useEffect(() => {
    fetchAgencies();
  }, []);

  const fetchAgencies = async () => {
    try {
      const res = await fetch('/api/admin/agencies');
      if (!res.ok) throw new Error();
      const data = await res.json();
      setAgencies(data);
      if (data.length > 0 && !selectedAgency) setSelectedAgency(data[0]);
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Supprimer définitivement l'agence "${name}" ?`)) return;
    try {
      setIsSaving(true);
      const res = await fetch(`/api/admin/agencies/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error();
      setMessage({ type: 'success', text: "Agence supprimée" });
      fetchAgencies();
    } catch (err) { setMessage({ type: 'error', text: t.error_save }); }
    finally { setIsSaving(false); setTimeout(() => setMessage(null), 3000); }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAgency) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/agencies/${selectedAgency.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedAgency),
      });
      if (!res.ok) throw new Error();
      setMessage({ type: 'success', text: t.success_save });
      fetchAgencies(); 
    } catch (err) {
      setMessage({ type: 'error', text: t.error_save });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
  };

  const updateNestedConfig = (category: string, field: string, value: any) => {
    const currentConfig = selectedAgency.footer_config || {};
    setSelectedAgency({
      ...selectedAgency,
      footer_config: {
        ...currentConfig,
        [category]: { ...(currentConfig[category] || {}), [field]: value }
      }
    });
  };

  const updateRootConfig = (field: string, value: any) => {
    const currentConfig = selectedAgency.footer_config || {};
    setSelectedAgency({
      ...selectedAgency,
      footer_config: { ...currentConfig, [field]: value }
    });
  };

  const toggleXmlSource = (url: string) => {
    const currentConfig = selectedAgency.footer_config || {};
    const currentUrls = currentConfig.xml_urls || [];
    const newUrls = currentUrls.includes(url) 
      ? currentUrls.filter((u: string) => u !== url) 
      : [...currentUrls, url];
    setSelectedAgency({ ...selectedAgency, footer_config: { ...currentConfig, xml_urls: newUrls } });
  };

  const toggleLanguage = (code: string) => {
    const currentConfig = selectedAgency.footer_config || {};
    const currentLangs = currentConfig.allowed_langs || ['fr'];
    const newLangs = currentLangs.includes(code)
      ? currentLangs.filter((l: string) => l !== code)
      : [...currentLangs, code];
    setSelectedAgency({ ...selectedAgency, footer_config: { ...currentConfig, allowed_langs: newLangs } });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, folder: string, field: string) => {
    const file = e.target.files?.[0];
    if (!file || !selectedAgency) return;
    try {
      setIsSaving(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random()}.${fileExt}`;
      const filePath = `${selectedAgency.subdomain}/${folder}/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('agencies').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('agencies').getPublicUrl(filePath);
      setSelectedAgency({ ...selectedAgency, [field]: publicUrl });
    } catch (err) { setMessage({ type: 'error', text: "Upload Error" }); }
    finally { setIsSaving(false); }
  };

  const handleCreateAgency = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const res = await fetch('/api/admin/agencies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newAgency),
      });
      if (!res.ok) throw new Error();
      setShowCreateModal(false);
      setNewAgency({ agency_name: '', subdomain: '', package_level: 'silver' });
      fetchAgencies();
    } catch (err) { setMessage({ type: 'error', text: "Create Error" }); }
    finally { setIsCreating(false); }
  };

  const setDefaultLang = (code: string) => {
    setSelectedAgency({
      ...selectedAgency,
      default_lang: code
    });
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

      {/* MAIN FORM */}
      <main className="flex-1 overflow-y-auto">
        {selectedAgency ? (
          <form onSubmit={handleSave} className="max-w-6xl mx-auto p-12 space-y-8">
            <header className="flex justify-between items-center bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm sticky top-0 z-20">
              <div className="flex items-center gap-6">
                {selectedAgency.logo_url ? (
                  <img src={selectedAgency.logo_url} className="w-16 h-16 rounded-2xl object-contain border border-slate-100 p-2 shadow-inner bg-slate-50" alt="Logo" />
                ) : (
                  <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl shadow-inner" style={{ backgroundColor: selectedAgency.primary_color || '#0f172a' }}>{selectedAgency.agency_name?.charAt(0)}</div>
                )}
                <div>
                  <h1 className="text-4xl font-serif italic text-slate-900">{selectedAgency.agency_name}</h1>
                  <span className="inline-block mt-2 px-3 py-1 bg-slate-100 text-slate-500 rounded-full text-[10px] font-bold uppercase tracking-tighter">{selectedAgency.package_level} plan</span>
                </div>
              </div>
              <div className="flex items-center gap-6">
                {message && (
                  <div className={`flex items-center gap-2 px-5 py-3 rounded-full text-[11px] font-bold uppercase tracking-widest shadow-sm ${
                    message.type === 'success' ? 'bg-green-50 text-green-600 border border-green-100' : 'bg-red-50 text-red-600 border border-red-100'
                  }`}>
                    {message.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                    {message.text}
                  </div>
                )}
                <button type="submit" disabled={isSaving} className="flex items-center gap-3 px-10 py-5 bg-slate-900 text-white rounded-full font-bold text-[11px] uppercase tracking-widest hover:bg-blue-600 transition-all shadow-2xl disabled:opacity-50">
                  {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} {isSaving ? t.saving : t.save}
                </button>
              </div>
            </header>

            {/* LANGUE PAR DÉFAUT */}
            <div className="space-y-4 border-t border-slate-50 pt-4">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                Langue par défaut du site
              </label>
              <div className="flex gap-2">
                {selectedAgency.footer_config?.allowed_langs?.map((code: string) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setDefaultLang(code)}
                    className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase transition-all ${
                      selectedAgency.default_lang === code 
                      ? 'bg-slate-900 text-white shadow-lg' 
                      : 'bg-slate-100 text-slate-400 hover:bg-slate-200'
                    }`}
                  >
                    {code} {selectedAgency.default_lang === code && "⭐"}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                
                {/* SECTION 1: LANGUES & FLUX */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
                  <h3 className="flex items-center gap-3 font-bold text-slate-900 uppercase text-xs tracking-widest border-b border-slate-50 pb-4">
                    <FileCode size={18} className="text-blue-600" /> {t.sections.lang_xml}
                  </h3>
                  
                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {t.fields.allowed_langs}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {SUPPORTED_LANGUAGES.map(l => (
                        <button 
                          key={l.code} 
                          type="button" 
                          onClick={() => toggleLanguage(l.code)} 
                          className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase transition-all ${selectedAgency?.footer_config?.allowed_langs?.includes(l.code) ? 'bg-blue-600 text-white shadow-lg' : 'bg-slate-50 text-slate-400'}`}
                        >
                          {l.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      {t.fields.xml_sources}
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {DISPONIBLE_XML_SOURCES.map((s) => (
                        <button 
                          key={s.id} 
                          type="button" 
                          onClick={() => toggleXmlSource(s.url)} 
                          className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${selectedAgency?.footer_config?.xml_urls?.includes(s.url) ? 'border-blue-500 bg-blue-50/30' : 'border-slate-50'}`}
                        >
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
                </div>

                {/* SECTION 2: BRANDING & POLICE */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
                  <h3 className="flex items-center gap-3 font-bold text-slate-900 uppercase text-xs tracking-widest border-b border-slate-50 pb-4">
                    <Palette size={18} className="text-blue-600" /> {t.sections.branding}
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Logo Upload */}
                    <div className="space-y-3">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">{t.fields.logo}</label>
                      <div className="relative group">
                        <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'branding', 'logo_url')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                        <div className="w-full border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center gap-2 bg-slate-50 group-hover:bg-slate-100 transition-colors">
                          <UploadCloud className="text-slate-300" size={24} />
                          <span className="text-xs text-slate-500">{selectedAgency?.logo_url ? "Changer le logo" : t.placeholders.click_upload}</span>
                        </div>
                      </div>
                    </div>

                    {/* Subdomain */}
                    <div className="space-y-3">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">{t.fields.subdomain}</label>
                      <div className="relative">
                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <input 
                          type="text" 
                          value={selectedAgency?.subdomain || ''} 
                          onChange={(e) => setSelectedAgency({...selectedAgency, subdomain: e.target.value.toLowerCase().replace(/\s+/g, '-')})} 
                          className="w-full pl-12 pr-5 py-4 rounded-2xl border border-slate-200 text-sm font-mono bg-slate-50 focus:ring-2 focus:ring-blue-500 outline-none" 
                          placeholder={t.placeholders.slug} 
                        />
                      </div>
                    </div>

                    {/* FONT SELECTOR */}
                    <div className="space-y-3">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">
                        Police d'écriture
                      </label>
                      <div className="relative">
                        <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                        <select 
                          value={selectedAgency?.font_family || 'Montserrat'} 
                          onChange={(e) => setSelectedAgency({...selectedAgency, font_family: e.target.value})} 
                          className="w-full pl-12 pr-5 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm appearance-none bg-white font-medium"
                        >
                          <option value="Montserrat">Montserrat (Moderne)</option>
                          <option value="Inter">Inter (Minimaliste)</option>
                          <option value="'Playfair Display', serif">Playfair (Luxe)</option>
                          <option value="Poppins">Poppins (Arrondi)</option>
                          <option value="'Roboto Mono', monospace">Roboto Mono (Tech)</option>
                        </select>
                      </div>
                    </div>

                    {/* Couleur Primaire */}
                    <div className="space-y-3">
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">{t.fields.primary_color}</label>
                      <div className="flex gap-4">
                        <input type="color" value={selectedAgency?.primary_color || '#0f172a'} onChange={(e) => setSelectedAgency({...selectedAgency, primary_color: e.target.value})} className="h-14 w-20 rounded-2xl cursor-pointer bg-white border border-slate-200 p-1 shadow-sm" />
                        <input type="text" value={selectedAgency?.primary_color || ''} onChange={(e) => setSelectedAgency({...selectedAgency, primary_color: e.target.value})} className="flex-1 px-5 border border-slate-200 rounded-2xl text-sm font-mono uppercase" />
                      </div>
                    </div>

                    {/* Couleur Boutons */}
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
                </div>

                {/* SECTION 3: CONTENU DES PAGES (Nouveau) */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
                  <h3 className="flex items-center gap-3 font-bold text-slate-900 uppercase text-xs tracking-widest border-b border-slate-50 pb-4">
                    <FileCode size={18} className="text-blue-600" /> Pages Statiques (About & Contact)
                  </h3>
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Titre Page À Propos</label>
                        <input 
                          className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 text-sm"
                          placeholder="Ex: Notre Vision de l'Immobilier"
                          value={selectedAgency.footer_config?.about_page?.title || ''}
                          onChange={(e) => updateNestedConfig('about_page', 'title', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Contenu Page À Propos</label>
                        <textarea 
                          rows={6}
                          className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 text-sm"
                          placeholder="Décrivez votre agence..."
                          value={selectedAgency.footer_config?.about_page?.content || ''}
                          onChange={(e) => updateNestedConfig('about_page', 'content', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 4: HERO HEADER */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-8">
                  <h3 className="flex items-center gap-3 font-bold text-slate-900 border-b border-slate-100 pb-5 uppercase text-xs tracking-widest">
                    <Layout size={18} className="text-blue-600" /> {t.sections.hero}
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">{t.fields.hero_type}</label>
                      <div className="flex p-1 bg-slate-100 rounded-2xl w-fit">
                        <button type="button" onClick={() => setSelectedAgency({...selectedAgency, hero_type: 'image'})} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold transition-all ${selectedAgency.hero_type !== 'video' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>
                          <ImageIcon size={14} /> Image
                        </button>
                        <button type="button" onClick={() => setSelectedAgency({...selectedAgency, hero_type: 'video'})} className={`flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold transition-all ${selectedAgency.hero_type === 'video' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>
                          <Video size={14} /> Vidéo
                        </button>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">{t.fields.hero_file}</label>
                        <div className="relative group">
                          <input type="file" accept={selectedAgency.hero_type === 'video' ? 'video/mp4' : 'image/*'} onChange={(e) => handleFileUpload(e, 'hero', 'hero_url')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                          <div className="w-full border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center gap-2 bg-slate-50 group-hover:bg-slate-100 transition-colors">
                            <UploadCloud className="text-slate-300" size={24} />
                            <span className="text-xs text-slate-500 font-medium">{t.placeholders.media_upload}</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        <label className="block text-[10px] font-bold uppercase tracking-widest text-slate-400">{t.fields.hero_title}</label>
                        <textarea rows={4} value={selectedAgency.hero_title || ''} onChange={(e) => setSelectedAgency({...selectedAgency, hero_title: e.target.value})} placeholder={t.placeholders.hero_text} className="w-full px-5 py-4 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-blue-500 outline-none font-serif italic text-lg" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 5: INTEGRATIONS */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6 border-l-4 border-l-purple-500">
                  <h3 className="flex items-center gap-3 font-bold text-slate-900 uppercase text-xs tracking-widest border-b border-slate-50 pb-4"><Zap size={18} className="text-purple-600" /> {t.sections.integrations}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.fields.zoho}</label>
                      <div className="relative">
                        <Mail className="absolute left-4 top-4 text-slate-300" size={16} />
                        <input className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-100 text-sm bg-slate-50" placeholder="Zoho ID" value={selectedAgency.footer_config?.integrations?.zoho_id || ''} onChange={(e) => updateNestedConfig('integrations', 'zoho_id', e.target.value)} />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{t.fields.taskade}</label>
                      <div className="relative">
                        <Cpu className="absolute left-4 top-4 text-slate-300" size={16} />
                        <input className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-100 text-sm bg-slate-50" placeholder="Taskade ID" value={selectedAgency.footer_config?.integrations?.taskade_id || ''} onChange={(e) => updateNestedConfig('integrations', 'taskade_id', e.target.value)} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 6: CONTACT & SOCIALS */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6">
                  <h3 className="flex items-center gap-3 font-bold text-slate-900 uppercase text-xs tracking-widest border-b border-slate-50 pb-4">
                    <Share2 size={18} className="text-blue-600" /> {t.sections.socials}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <Linkedin className="absolute left-4 top-4 text-slate-300" size={16} />
                      <input placeholder={t.fields.linkedin} className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-100 text-sm" value={selectedAgency.footer_config?.socials?.linkedin || ''} onChange={(e) => updateNestedConfig('socials', 'linkedin', e.target.value)} />
                    </div>
                    <div className="relative">
                      <TikTokIcon className="absolute left-4 top-4 text-slate-300" size={16} />
                      <input placeholder={t.fields.tiktok} className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-100 text-sm" value={selectedAgency.footer_config?.socials?.tiktok || ''} onChange={(e) => updateNestedConfig('socials', 'tiktok', e.target.value)} />
                    </div>
                    <div className="relative">
                      <Facebook className="absolute left-4 top-4 text-slate-300" size={16} />
                      <input placeholder={t.fields.facebook} className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-100 text-sm" value={selectedAgency.footer_config?.socials?.facebook || ''} onChange={(e) => updateNestedConfig('socials', 'facebook', e.target.value)} />
                    </div>
                    <div className="relative">
                      <Instagram className="absolute left-4 top-4 text-slate-300" size={16} />
                      <input placeholder={t.fields.instagram} className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-100 text-sm" value={selectedAgency.footer_config?.socials?.instagram || ''} onChange={(e) => updateNestedConfig('socials', 'instagram', e.target.value)} />
                    </div>
                    
                    {/* WHATSAPP */}
                    <div className="relative">
                      <MessageCircle className="absolute left-4 top-4 text-green-500" size={16} />
                      <input 
                        placeholder={t.placeholders.whatsapp} 
                        className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-100 text-sm bg-green-50/20 focus:ring-2 focus:ring-green-500 outline-none" 
                        value={selectedAgency.footer_config?.socials?.whatsapp || ''} 
                        onChange={(e) => updateNestedConfig('socials', 'whatsapp', e.target.value)} 
                      />
                    </div>

                    <div className="relative md:col-span-2 border-t border-slate-50 pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="relative">
                        <Mail className="absolute left-4 top-4 text-slate-300" size={16} />
                        <input placeholder={t.fields.email} className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-100 text-sm" value={selectedAgency.footer_config?.email || ''} onChange={(e) => updateRootConfig('email', e.target.value)} />
                      </div>
                      <div className="relative">
                        <Phone className="absolute left-4 top-4 text-slate-300" size={16} />
                        <input placeholder={t.fields.phone} className="w-full pl-12 pr-4 py-4 rounded-2xl border border-slate-100 text-sm" value={selectedAgency.footer_config?.phone || ''} onChange={(e) => updateRootConfig('phone', e.target.value)} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* SECTION 7: CONFORMITÉ & LÉGAL */}
                <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-6 border-l-4 border-l-slate-900">
                  <h3 className="flex items-center gap-3 font-bold text-slate-900 uppercase text-xs tracking-widest border-b border-slate-50 pb-4">
                    <ShieldCheck size={18} className="text-slate-900" /> {t.sections.legal || "Conformité & Légal"}
                  </h3>
                  
                  <div className="space-y-6">
                    {/* Toggle Cookie Banner */}
                    <div className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <div className="space-y-1">
                        <span className="text-sm font-bold text-slate-900">Bandeau de Cookies</span>
                        <p className="text-[10px] text-slate-400 uppercase tracking-tight font-bold">Conformité RGPD</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                          type="checkbox" 
                          className="sr-only peer"
                          checked={selectedAgency.cookie_consent_enabled || false}
                          onChange={(e) => setSelectedAgency({...selectedAgency, cookie_consent_enabled: e.target.checked})}
                        />
                        <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-slate-900"></div>
                      </label>
                    </div>

                    {/* Privacy Policy Textarea */}
                    <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        {t.fields.privacy_policy || "Politique de confidentialité"}
                      </label>
                      <textarea 
                        rows={5}
                        className="w-full px-5 py-4 rounded-2xl border border-slate-100 bg-slate-50 text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                        placeholder="Saisissez ici les mentions légales..."
                        value={selectedAgency.privacy_policy || ''}
                        onChange={(e) => setSelectedAgency({...selectedAgency, privacy_policy: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              {/* LIVE PREVIEW (STICKY) */}
              <div className="lg:col-span-1">
                <div className="bg-slate-900 p-6 rounded-[2.5rem] shadow-2xl sticky top-8 overflow-hidden">
                  <div className="flex items-center gap-2 mb-4 text-white/50 text-[10px] font-bold uppercase tracking-widest"><Monitor size={14} /> {t.sections.preview}</div>
                  <div className="relative aspect-[4/5] rounded-[1.5rem] overflow-hidden bg-slate-800" style={{ fontFamily: selectedAgency.font_family || 'Montserrat, sans-serif' }}>
                    {selectedAgency.hero_url && selectedAgency.hero_type !== 'video' && <img src={selectedAgency.hero_url} className="absolute inset-0 w-full h-full object-cover opacity-60" alt="BG" />}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                    <div className="absolute inset-0 p-6 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        {selectedAgency.logo_url ? <img src={selectedAgency.logo_url} className="h-8 object-contain bg-white/10 backdrop-blur-md p-1 rounded-lg" alt="Logo" /> : <div className="w-8 h-8 rounded" style={{backgroundColor: selectedAgency.primary_color || '#3b82f6'}} />}
                      </div>
                      <div className="space-y-3">
                        <h4 className="text-white text-xl font-serif italic leading-tight">{selectedAgency.hero_title || t.placeholders.hero_text}</h4>
                        <div className="h-10 w-24 rounded-full flex items-center justify-center text-[10px] font-bold text-white uppercase tracking-widest shadow-lg transition-all" 
                             style={{ backgroundColor: selectedAgency.button_color || '#3b82f6' }}>
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