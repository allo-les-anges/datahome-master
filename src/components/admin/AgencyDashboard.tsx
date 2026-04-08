"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase'; 
import { 
  Save, Plus, Globe, Image as ImageIcon, Loader2, 
  CheckCircle2, AlertCircle, Palette, Phone, Mail, Layout, X,
  Video, Monitor, Type, UploadCloud, Trash2, Facebook, Instagram, 
  Share2, FileCode, Linkedin, Video as TikTokIcon, Zap, Cpu, Languages,
  MousePointer2, MessageCircle, ShieldCheck, Users, UserPlus, UserMinus, Briefcase, FileText,
  Sparkles, TrendingUp, Building2, Settings2, CreditCard, BarChart3, HelpCircle, LogOut,
  ChevronLeft, ChevronRight
} from 'lucide-react';

// ============================================================
// DICTIONNAIRE DE TRADUCTION COMPLET (garder l'existant)
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
    sections: {
      lang_xml: "Langues & Flux XML",
      socials: "Réseaux Sociaux & Contact",
      integrations: "Intégrations (CRM & IA)",
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
    sections: {
      lang_xml: "Languages & XML Feeds",
      socials: "Social Networks & Contact",
      integrations: "Integrations (CRM & AI)",
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
  es: { /* garder l'existant */ },
  pl: { /* garder l'existant */ },
  nl: { /* garder l'existant */ },
  ar: { /* garder l'existant */ }
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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

  const [team, setTeam] = useState<any[]>([]);

  // ============================================================
  // TOUS LES useEffect et fonctions existants (à conserver)
  // ============================================================
  
  useEffect(() => {
    const fetchAgencies = async () => {
      try {
        const { data, error } = await supabase
          .from('agency_settings')
          .select('*');
        
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
    }
  }, [selectedAgency]);

  const updateNestedConfig = (section: string, field: string, value: any) => {
    if (!selectedAgency) return;
    
    setSelectedAgency((prev: any) => {
      let currentConfig: any = {};
      
      if (typeof prev.footer_config === 'string') {
        try {
          currentConfig = JSON.parse(prev.footer_config);
        } catch (e) {
          currentConfig = {};
        }
      } else {
        currentConfig = prev.footer_config || {};
      }

      const currentSection = currentConfig[section] || {};

      return {
        ...prev,
        footer_config: {
          ...currentConfig,
          [section]: {
            ...currentSection,
            [field]: value
          }
        }
      };
    });
  };

  const updateRootConfig = (field: string, value: any) => {
    if (!selectedAgency) return;
    
    setSelectedAgency((prev: any) => {
      let currentConfig: any = {};
      
      if (typeof prev.footer_config === 'string') {
        try {
          currentConfig = JSON.parse(prev.footer_config);
        } catch (e) {
          currentConfig = {};
        }
      } else {
        currentConfig = prev.footer_config || {};
      }
      
      return {
        ...prev,
        footer_config: {
          ...currentConfig,
          [field]: value
        }
      };
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

      return {
        ...prev,
        footer_config: {
          ...currentFooterConfig,
          xml_urls: newXmlUrls
        }
      };
    });
  };

  const addMember = () => {
    const newMember = { name: "", role: "", bio: "", photo: "" };
    const newTeam = [...team, newMember];
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
      const fileName = `team_${Date.now()}_${Math.random()}.${fileExt}`;
      const filePath = `${selectedAgency.subdomain}/team/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('agencies').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('agencies').getPublicUrl(filePath);
      
      const newTeam = [...team];
      newTeam[index].photo = publicUrl;
      setTeam(newTeam);
      setSelectedAgency({ ...selectedAgency, team_data: newTeam });
    } catch (err) { 
      setMessage({ type: 'error', text: "Upload Error" }); 
    } finally { 
      setIsSaving(false); 
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Supprimer définitivement l'agence "${name}" ?`)) return;
    try {
      setIsSaving(true);
      
      const { error } = await supabase
        .from('agency_settings')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setMessage({ type: 'success', text: "Agence supprimée" });
      
      const { data } = await supabase.from('agency_settings').select('*');
      setAgencies(data || []);
      if (data && data.length > 0) setSelectedAgency(data[0]);
      else setSelectedAgency(null);
      
    } catch (err) { 
      setMessage({ type: 'error', text: t.error_save }); 
    } finally { 
      setIsSaving(false); 
      setTimeout(() => setMessage(null), 3000); 
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (!selectedAgency || !selectedAgency.id) {
      console.error("❌ ID de l'agence manquant");
      setMessage({ type: 'error', text: "ID de l'agence manquant" });
      return;
    }

    setIsSaving(true);

    try {
      const teamDataToSave = JSON.parse(JSON.stringify(team));

      const { data, error, status } = await supabase
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
          hero_type: selectedAgency.hero_type,
          hero_url: selectedAgency.hero_url,
          logo_url: selectedAgency.logo_url,
          default_lang: selectedAgency.default_lang,
          cookie_consent_enabled: selectedAgency.cookie_consent_enabled,
          privacy_policy: selectedAgency.privacy_policy,
          about_title: selectedAgency.about_title,
          about_text: selectedAgency.about_text,
          whatsapp_number: selectedAgency.whatsapp_number,
          footer_config: selectedAgency.footer_config,
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
      }
    } catch (err: any) {
      console.error("❌ ERREUR:", err.message);
      setMessage({ type: 'error', text: t.error_save + " : " + err.message });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(null), 3000);
    }
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
      const { data, error } = await supabase
        .from('agency_settings')
        .insert({
          agency_name: newAgency.agency_name,
          subdomain: newAgency.subdomain,
          package_level: newAgency.package_level,
          button_style: 'rounded-full',
          button_animation: 'none',
          footer_config: {
            allowed_langs: ['fr', 'en'],
            xml_urls: [],
            socials: {},
            integrations: {}
          },
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
    } finally { 
      setIsCreating(false); 
    }
  };

  const setDefaultLang = (code: string) => {
    setSelectedAgency({
      ...selectedAgency,
      default_lang: code
    });
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="text-center">
        <Loader2 className="animate-spin text-indigo-600 mx-auto mb-4" size={48} />
        <p className="text-slate-500 font-medium">Chargement du dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-gradient-to-br from-slate-50 to-slate-100 font-sans">
      
      {/* SIDEBAR REDESIGNÉE */}
      <aside className={`${sidebarCollapsed ? 'w-20' : 'w-72'} bg-white border-r border-slate-200 flex flex-col shadow-xl transition-all duration-300 z-20 relative`}>
        {/* Logo Section */}
        <div className={`p-5 border-b border-slate-100 ${sidebarCollapsed ? 'px-3' : ''}`}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-xl flex items-center justify-center shadow-lg">
              <Sparkles className="text-white" size={20} />
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 className="font-bold text-lg text-slate-800">HabiHub</h1>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider">SaaS Platform</p>
              </div>
            )}
          </div>
        </div>

        {/* Bouton collapse */}
        <button 
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          className="absolute -right-3 top-20 bg-white border border-slate-200 rounded-full p-1.5 shadow-md hover:shadow-lg transition-all z-30"
        >
          {sidebarCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>

        {/* Stats */}
        <div className={`p-4 ${sidebarCollapsed ? 'px-2' : ''}`}>
          <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-2xl p-4 mb-4">
            <div className="flex items-center justify-between mb-2">
              {!sidebarCollapsed && <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Total Agences</span>}
              <BarChart3 size={sidebarCollapsed ? 20 : 16} className="text-indigo-600" />
            </div>
            {!sidebarCollapsed && (
              <>
                <p className="text-2xl font-bold text-indigo-900">{agencies.length}</p>
                <p className="text-[10px] text-indigo-500 mt-1">Configurées</p>
              </>
            )}
            {sidebarCollapsed && <p className="text-center font-bold text-indigo-900 mt-1">{agencies.length}</p>}
          </div>
        </div>

        {/* Liste des agences */}
        <nav className="flex-1 overflow-y-auto px-3 space-y-1 pb-4">
          {!sidebarCollapsed && <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-2 mb-2">Agences</p>}
          {agencies.map((agency) => (
            <button
              key={agency.id}
              onClick={() => setSelectedAgency(agency)}
              className={`w-full text-left transition-all duration-200 rounded-xl mb-1 group ${
                selectedAgency?.id === agency.id 
                  ? 'bg-indigo-600 text-white shadow-lg' 
                  : 'text-slate-600 hover:bg-slate-100'
              } ${sidebarCollapsed ? 'p-2 flex justify-center' : 'p-3'}`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                  selectedAgency?.id === agency.id 
                    ? 'bg-white/20 text-white' 
                    : 'bg-slate-100 text-slate-600'
                }`}>
                  {agency.agency_name?.charAt(0) || 'A'}
                </div>
                {!sidebarCollapsed && (
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{agency.agency_name}</p>
                    <p className="text-[9px] opacity-60 truncate">{agency.subdomain}</p>
                  </div>
                )}
              </div>
            </button>
          ))}
          
          <button
            onClick={() => setShowCreateModal(true)}
            className={`w-full mt-3 transition-all rounded-xl border-2 border-dashed border-indigo-200 text-indigo-600 hover:bg-indigo-50 ${
              sidebarCollapsed ? 'p-2 flex justify-center' : 'p-3'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Plus size={16} />
              {!sidebarCollapsed && <span className="text-xs font-medium">Nouvelle Agence</span>}
            </div>
          </button>
        </nav>

        {/* Footer Sidebar */}
        <div className={`p-4 border-t border-slate-100 ${sidebarCollapsed ? 'px-2' : ''}`}>
          <div className="flex items-center justify-between">
            {!sidebarCollapsed && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-slate-600">AD</span>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-700">Admin User</p>
                  <p className="text-[9px] text-slate-400">admin@habihub.com</p>
                </div>
              </div>
            )}
            <button className="text-slate-400 hover:text-red-500 transition-colors">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto">
        {selectedAgency ? (
          <div className="max-w-7xl mx-auto p-6 lg:p-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-2xl flex items-center justify-center shadow-lg">
                    {selectedAgency.logo_url ? (
                      <img src={selectedAgency.logo_url} className="w-8 h-8 object-contain" alt="Logo" />
                    ) : (
                      <Building2 className="text-white" size={28} />
                    )}
                  </div>
                  <div>
                    <input 
                      value={selectedAgency.agency_name || ''} 
                      onChange={(e) => setSelectedAgency({...selectedAgency, agency_name: e.target.value})}
                      className="text-2xl font-bold text-slate-800 bg-transparent border-b-2 border-slate-200 focus:border-indigo-500 outline-none px-2"
                    />
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                        selectedAgency.package_level === 'premium' ? 'bg-amber-100 text-amber-700' :
                        selectedAgency.package_level === 'ultimate' ? 'bg-purple-100 text-purple-700' :
                        'bg-slate-100 text-slate-600'
                      }`}>
                        {selectedAgency.package_level || 'silver'}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{selectedAgency.subdomain}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  {message && (
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-full text-[11px] font-semibold ${
                      message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {message.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                      {message.text}
                    </div>
                  )}
                  <button 
                    onClick={handleSave}
                    disabled={isSaving} 
                    className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-xl font-semibold text-sm hover:bg-indigo-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50"
                  >
                    {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />} 
                    {isSaving ? 'Sauvegarde...' : 'Enregistrer'}
                  </button>
                </div>
              </div>
            </div>

            {/* Formulaire avec toutes les sections originales */}
            <form onSubmit={handleSave} className="space-y-6">
              
              {/* SECTION 1: LANGUES & FLUX XML */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <FileCode size={18} className="text-indigo-600" />
                    <h3 className="font-semibold text-slate-800">{t.sections.lang_xml}</h3>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                      {t.fields.allowed_langs}
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {SUPPORTED_LANGUAGES.map(l => (
                        <button 
                          key={l.code} 
                          type="button" 
                          onClick={() => toggleLanguage(l.code)} 
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            selectedAgency?.footer_config?.allowed_langs?.includes(l.code) 
                              ? 'bg-indigo-600 text-white shadow-sm' 
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {l.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                      Langue par défaut
                    </label>
                    <div className="flex gap-2">
                      {selectedAgency.footer_config?.allowed_langs?.map((code: string) => (
                        <button
                          key={code}
                          type="button"
                          onClick={() => setDefaultLang(code)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            selectedAgency.default_lang === code 
                              ? 'bg-emerald-600 text-white shadow-sm' 
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {code.toUpperCase()} {selectedAgency.default_lang === code && "✓"}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                      {t.fields.xml_sources}
                    </label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {DISPONIBLE_XML_SOURCES.map((s) => (
                        <button 
                          key={s.id} 
                          type="button" 
                          onClick={() => toggleXmlSource(s.url)} 
                          className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                            selectedAgency?.footer_config?.xml_urls?.includes(s.url) 
                              ? 'border-indigo-500 bg-indigo-50' 
                              : 'border-slate-200 hover:border-slate-300'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div className={`w-5 h-5 rounded flex items-center justify-center border ${
                              selectedAgency?.footer_config?.xml_urls?.includes(s.url) 
                                ? 'bg-indigo-600 border-indigo-600' 
                                : 'bg-white border-slate-300'
                            }`}>
                              {selectedAgency?.footer_config?.xml_urls?.includes(s.url) && <CheckCircle2 size={12} className="text-white" />}
                            </div>
                            <span className="font-medium text-slate-700">{s.name}</span>
                          </div>
                          <span className="text-[10px] font-mono text-slate-400 truncate max-w-[200px]">{s.url.split('/').pop()}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 2: BRANDING & POLICE (complète) */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <Palette size={18} className="text-indigo-600" />
                    <h3 className="font-semibold text-slate-800">{t.sections.branding}</h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t.fields.logo}</label>
                      <div className="relative group">
                        <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, 'branding', 'logo_url')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                        <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center gap-2 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                          {selectedAgency?.logo_url ? (
                            <img src={selectedAgency.logo_url} className="h-16 object-contain" alt="Logo" />
                          ) : (
                            <UploadCloud className="text-slate-400" size={32} />
                          )}
                          <span className="text-xs text-slate-500">{selectedAgency?.logo_url ? "Changer le logo" : t.placeholders.click_upload}</span>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t.fields.subdomain}</label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <input 
                          type="text" 
                          value={selectedAgency?.subdomain || ''} 
                          onChange={(e) => setSelectedAgency({...selectedAgency, subdomain: e.target.value.toLowerCase().replace(/\s+/g, '-')})} 
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all font-mono" 
                          placeholder={t.placeholders.slug} 
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Police d'écriture</label>
                      <div className="relative">
                        <Type className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                        <select 
                          value={selectedAgency?.font_family || 'Montserrat'} 
                          onChange={(e) => setSelectedAgency({...selectedAgency, font_family: e.target.value})} 
                          className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none appearance-none bg-white"
                        >
                          <option value="Montserrat">Montserrat (Moderne)</option>
                          <option value="Inter">Inter (Minimaliste)</option>
                          <option value="'Playfair Display', serif">Playfair (Luxe)</option>
                          <option value="Poppins">Poppins (Arrondi)</option>
                          <option value="'Roboto Mono', monospace">Roboto Mono (Tech)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t.fields.primary_color}</label>
                      <div className="flex gap-3">
                        <input 
                          type="color" 
                          value={selectedAgency?.primary_color || '#6366f1'} 
                          onChange={(e) => setSelectedAgency({...selectedAgency, primary_color: e.target.value})} 
                          className="h-12 w-16 rounded-xl cursor-pointer border border-slate-200" 
                        />
                        <input 
                          type="text" 
                          value={selectedAgency?.primary_color || ''} 
                          onChange={(e) => setSelectedAgency({...selectedAgency, primary_color: e.target.value})} 
                          className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-sm font-mono" 
                        />
                      </div>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                        <MousePointer2 size={12} /> {t.fields.button_color}
                      </label>
                      <div className="flex gap-3">
                        <input 
                          type="color" 
                          value={selectedAgency?.button_color || '#6366f1'} 
                          onChange={(e) => setSelectedAgency({...selectedAgency, button_color: e.target.value})} 
                          className="h-12 w-16 rounded-xl cursor-pointer border border-slate-200" 
                        />
                        <input 
                          type="text" 
                          value={selectedAgency?.button_color || ''} 
                          onChange={(e) => setSelectedAgency({...selectedAgency, button_color: e.target.value})} 
                          className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-sm font-mono" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* Style des boutons */}
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 block">
                      {t.fields.button_style}
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => setSelectedAgency({...selectedAgency, button_style: 'rounded-none'})}
                        className={`p-4 border-2 rounded-xl transition-all ${
                          selectedAgency.button_style === 'rounded-none' 
                            ? 'border-indigo-500 bg-indigo-50' 
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="text-center">
                          <div className="w-full h-10 bg-slate-800 mb-2" style={{ borderRadius: 0 }}></div>
                          <span className="text-[11px] font-medium">Bords Droits</span>
                        </div>
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedAgency({...selectedAgency, button_style: 'rounded-full'})}
                        className={`p-4 border-2 rounded-xl transition-all ${
                          selectedAgency.button_style === 'rounded-full' 
                            ? 'border-indigo-500 bg-indigo-50' 
                            : 'border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="text-center">
                          <div className="w-full h-10 bg-slate-800 mb-2 rounded-full"></div>
                          <span className="text-[11px] font-medium">Bords Arrondis</span>
                        </div>
                      </button>
                    </div>
                  </div>

                  {/* Animation des boutons */}
                  <div className="mt-6 pt-6 border-t border-slate-100">
                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 block">
                      {t.fields.button_animation}
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                        { id: 'none', label: 'Aucune' },
                        { id: 'scale', label: 'Scale (Zoom)' },
                        { id: 'glow', label: 'Glow (Lueur)' },
                        { id: 'slide', label: 'Slide (Glissement)' }
                      ].map(anim => (
                        <button
                          key={anim.id}
                          type="button"
                          onClick={() => setSelectedAgency({...selectedAgency, button_animation: anim.id})}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                            selectedAgency.button_animation === anim.id 
                              ? 'bg-indigo-600 text-white' 
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {anim.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 3: PAGES STATIQUES (ABOUT) */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <FileText size={18} className="text-indigo-600" />
                    <h3 className="font-semibold text-slate-800">{t.sections.about}</h3>
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      {t.fields.about_title}
                    </label>
                    <input 
                      type="text"
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                      placeholder={t.placeholders.about_title}
                      value={selectedAgency?.about_title || ''}
                      onChange={(e) => setSelectedAgency({...selectedAgency, about_title: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      {t.fields.about_text}
                    </label>
                    <textarea 
                      rows={6}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                      placeholder={t.placeholders.about_text}
                      value={selectedAgency?.about_text || ''}
                      onChange={(e) => setSelectedAgency({...selectedAgency, about_text: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 4: GESTION DE L'ÉQUIPE */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Users size={18} className="text-indigo-600" />
                    <h3 className="font-semibold text-slate-800">{t.sections.team}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={addMember}
                    className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-semibold hover:bg-indigo-700 transition-all"
                  >
                    <UserPlus size={14} /> {t.buttons.add_member}
                  </button>
                </div>
                <div className="p-6">
                  {team.length === 0 ? (
                    <div className="text-center py-12">
                      <Users size={48} className="mx-auto mb-3 text-slate-300" />
                      <p className="text-slate-400">Aucun membre dans l'équipe</p>
                      <button onClick={addMember} className="mt-4 text-indigo-600 text-sm font-medium">+ Ajouter un membre</button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {team.map((member, index) => (
                        <div key={index} className="border border-slate-200 rounded-xl p-4 relative">
                          <button onClick={() => removeMember(index)} className="absolute top-3 right-3 p-1 text-slate-400 hover:text-red-500 transition-colors">
                            <Trash2 size={16} />
                          </button>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Photo</label>
                              <div className="relative group mt-1">
                                <input type="file" accept="image/*" onChange={(e) => handleMemberPhotoUpload(e, index)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-lg border border-slate-200">
                                  {member.photo ? (
                                    <img src={member.photo} className="w-10 h-10 rounded-full object-cover" alt={member.name} />
                                  ) : (
                                    <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center">
                                      <UserPlus size={16} className="text-slate-500" />
                                    </div>
                                  )}
                                  <span className="text-xs text-slate-500">Changer la photo</span>
                                </div>
                              </div>
                            </div>
                            <div>
                              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Nom</label>
                              <input className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 text-sm" value={member.name} onChange={(e) => updateMember(index, 'name', e.target.value)} />
                            </div>
                            <div>
                              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Rôle</label>
                              <input className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 text-sm" value={member.role} onChange={(e) => updateMember(index, 'role', e.target.value)} />
                            </div>
                            <div className="md:col-span-2">
                              <label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Bio</label>
                              <textarea rows={2} className="w-full mt-1 px-3 py-2 rounded-lg border border-slate-200 text-sm" value={member.bio} onChange={(e) => updateMember(index, 'bio', e.target.value)} />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* SECTION 5: HERO HEADER */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <Layout size={18} className="text-indigo-600" />
                    <h3 className="font-semibold text-slate-800">{t.sections.hero}</h3>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  <div className="flex gap-3">
                    <button type="button" onClick={() => setSelectedAgency({...selectedAgency, hero_type: 'image'})} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedAgency.hero_type !== 'video' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <ImageIcon size={14} /> Image
                    </button>
                    <button type="button" onClick={() => setSelectedAgency({...selectedAgency, hero_type: 'video'})} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${selectedAgency.hero_type === 'video' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
                      <Video size={14} /> Vidéo
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t.fields.hero_file}</label>
                      <div className="relative group">
                        <input type="file" accept={selectedAgency.hero_type === 'video' ? 'video/mp4' : 'image/*'} onChange={(e) => handleFileUpload(e, 'hero', 'hero_url')} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                        <div className="border-2 border-dashed border-slate-200 rounded-xl p-4 flex items-center justify-center gap-2 bg-slate-50 hover:bg-slate-100 transition-colors cursor-pointer">
                          <UploadCloud size={20} className="text-slate-400" />
                          <span className="text-sm text-slate-500">{t.placeholders.media_upload}</span>
                        </div>
                      </div>
                      {selectedAgency.hero_url && (
                        <p className="text-[10px] text-slate-400 mt-2 truncate">{selectedAgency.hero_url.split('/').pop()}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t.fields.hero_title}</label>
                      <textarea 
                        rows={3} 
                        value={selectedAgency.hero_title || ''} 
                        onChange={(e) => setSelectedAgency({...selectedAgency, hero_title: e.target.value})} 
                        placeholder={t.placeholders.hero_text} 
                        className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none resize-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 6: INTEGRATIONS */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden border-l-4 border-l-purple-500">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <Zap size={18} className="text-purple-600" />
                    <h3 className="font-semibold text-slate-800">{t.sections.integrations}</h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t.fields.zoho}</label>
                      <input className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all" placeholder="Zoho ID / Token" value={selectedAgency.footer_config?.integrations?.zoho_id || ''} onChange={(e) => updateNestedConfig('integrations', 'zoho_id', e.target.value)} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">{t.fields.taskade}</label>
                      <input className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all" placeholder="Taskade Agent ID" value={selectedAgency.footer_config?.integrations?.taskade_id || ''} onChange={(e) => updateNestedConfig('integrations', 'taskade_id', e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 7: CONTACT & SOCIALS */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <Share2 size={18} className="text-indigo-600" />
                    <h3 className="font-semibold text-slate-800">{t.sections.socials}</h3>
                  </div>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="relative">
                      <Linkedin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input placeholder={t.fields.linkedin} className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all" value={selectedAgency.footer_config?.socials?.linkedin || ''} onChange={(e) => updateNestedConfig('socials', 'linkedin', e.target.value)} />
                    </div>
                    <div className="relative">
                      <TikTokIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input placeholder={t.fields.tiktok} className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all" value={selectedAgency.footer_config?.socials?.tiktok || ''} onChange={(e) => updateNestedConfig('socials', 'tiktok', e.target.value)} />
                    </div>
                    <div className="relative">
                      <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input placeholder={t.fields.facebook} className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all" value={selectedAgency.footer_config?.socials?.facebook || ''} onChange={(e) => updateNestedConfig('socials', 'facebook', e.target.value)} />
                    </div>
                    <div className="relative">
                      <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input placeholder={t.fields.instagram} className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all" value={selectedAgency.footer_config?.socials?.instagram || ''} onChange={(e) => updateNestedConfig('socials', 'instagram', e.target.value)} />
                    </div>
                    <div className="relative">
                      <MessageCircle className="absolute left-3 top-1/2 -translate-y-1/2 text-green-500" size={16} />
                      <input 
                        placeholder={t.placeholders.whatsapp} 
                        className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all" 
                        value={selectedAgency.footer_config?.socials?.whatsapp || ''} 
                        onChange={(e) => updateNestedConfig('socials', 'whatsapp', e.target.value)} 
                      />
                    </div>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input placeholder={t.fields.email} className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all" value={selectedAgency.footer_config?.email || ''} onChange={(e) => updateRootConfig('email', e.target.value)} />
                    </div>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                      <input placeholder={t.fields.phone} className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all" value={selectedAgency.footer_config?.phone || ''} onChange={(e) => updateRootConfig('phone', e.target.value)} />
                    </div>
                  </div>
                </div>
              </div>

              {/* SECTION 8: CONFORMITÉ & LÉGAL */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden border-l-4 border-l-slate-800">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                  <div className="flex items-center gap-2">
                    <ShieldCheck size={18} className="text-slate-800" />
                    <h3 className="font-semibold text-slate-800">{t.sections.legal || "Conformité & Légal"}</h3>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div>
                      <span className="font-medium text-slate-800">Bandeau de Cookies</span>
                      <p className="text-[10px] text-slate-400 mt-1">Conformité RGPD</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        className="sr-only peer"
                        checked={selectedAgency.cookie_consent_enabled || false}
                        onChange={(e) => setSelectedAgency({...selectedAgency, cookie_consent_enabled: e.target.checked})}
                      />
                      <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                      {t.fields.privacy_policy || "Politique de confidentialité"}
                    </label>
                    <textarea 
                      rows={5}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all"
                      placeholder="Saisissez ici les mentions légales..."
                      value={selectedAgency.privacy_policy || ''}
                      onChange={(e) => setSelectedAgency({...selectedAgency, privacy_policy: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              {/* LIVE PREVIEW (STICKY) - Version compacte mais élégante */}
              <div className="lg:col-span-1 hidden lg:block">
                <div className="bg-slate-900 p-5 rounded-2xl shadow-2xl sticky top-8 overflow-hidden">
                  <div className="flex items-center gap-2 mb-3 text-white/50 text-[10px] font-bold uppercase tracking-widest">
                    <Monitor size={14} /> {t.sections.preview}
                  </div>
                  <div 
                    className="relative aspect-[4/5] rounded-xl overflow-hidden bg-slate-800" 
                    style={{ fontFamily: selectedAgency.font_family || 'Montserrat, sans-serif' }}
                  >
                    {selectedAgency.hero_url && selectedAgency.hero_type !== 'video' && (
                      <img src={selectedAgency.hero_url} className="absolute inset-0 w-full h-full object-cover opacity-60" alt="BG" />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
                    <div className="absolute inset-0 p-4 flex flex-col justify-between">
                      <div className="flex justify-between items-start">
                        {selectedAgency.logo_url ? (
                          <img src={selectedAgency.logo_url} className="h-6 object-contain bg-white/10 backdrop-blur-md p-1 rounded" alt="Logo" />
                        ) : (
                          <div className="w-6 h-6 rounded" style={{backgroundColor: selectedAgency.primary_color || '#6366f1'}} />
                        )}
                      </div>
                      <div className="space-y-2">
                        <h4 
                          className="text-white text-sm font-serif italic leading-tight"
                          style={{ fontFamily: `${selectedAgency.font_family || 'Montserrat'}, sans-serif` }}
                        >
                          {selectedAgency.hero_title || t.placeholders.hero_text}
                        </h4>
                        <div 
                          className={`h-8 w-20 flex items-center justify-center text-[8px] font-bold text-white uppercase tracking-wider shadow-lg transition-all ${
                            selectedAgency.button_animation === 'scale' ? 'hover:scale-105' : 
                            selectedAgency.button_animation === 'glow' ? 'hover:shadow-lg hover:shadow-white/20' : 
                            selectedAgency.button_animation === 'slide' ? 'hover:translate-x-1' : ''
                          }`}
                          style={{ 
                            backgroundColor: selectedAgency.button_color || '#6366f1',
                            borderRadius: selectedAgency.button_style === 'rounded-full' ? '9999px' : '4px'
                          }}
                        >
                          {t.placeholders.button}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center">
            <div className="w-20 h-20 bg-slate-100 rounded-2xl flex items-center justify-center mb-4">
              <Building2 size={40} className="text-slate-400" />
            </div>
            <p className="text-slate-500 font-medium">{t.select_agency}</p>
            <button onClick={() => setShowCreateModal(true)} className="mt-4 text-indigo-600 text-sm font-medium">+ Créer une nouvelle agence</button>
          </div>
        )}
      </main>

      {/* Modal de création */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-indigo-600 to-indigo-800">
              <h2 className="text-xl font-semibold text-white">{t.new_agency}</h2>
              <p className="text-indigo-200 text-sm mt-1">Créez une nouvelle agence sur la plateforme</p>
            </div>
            <form onSubmit={handleCreateAgency} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t.fields.agency_name}</label>
                <input required className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all" value={newAgency.agency_name} onChange={(e) => setNewAgency({...newAgency, agency_name: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t.fields.subdomain}</label>
                <input required className="w-full px-4 py-2.5 rounded-lg border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition-all font-mono" placeholder="nom-de-lagence" value={newAgency.subdomain} onChange={(e) => setNewAgency({...newAgency, subdomain: e.target.value.toLowerCase().replace(/\s+/g, '-')})} />
              </div>
              <div className="flex gap-3 pt-3">
                <button type="button" onClick={() => setShowCreateModal(false)} className="flex-1 px-4 py-2.5 border border-slate-200 rounded-lg text-slate-600 font-medium hover:bg-slate-50 transition-all">Annuler</button>
                <button type="submit" disabled={isCreating} className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
                  {isCreating ? <Loader2 className="animate-spin" size={16} /> : <Plus size={16} />}
                  {isCreating ? 'Création...' : t.generate}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}