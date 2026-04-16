"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase'; 
import { 
  Save, Plus, Globe, Image as ImageIcon, Loader2, 
  CheckCircle2, AlertCircle, Palette, Phone, Mail, Layout, X,
  Video, Monitor, Type, UploadCloud, Trash2, Facebook, Instagram, 
  Share2, FileCode, Linkedin, Video as TikTokIcon, Zap, Cpu, Languages,
  MousePointer2, MessageCircle, ShieldCheck, Users, UserPlus, Briefcase, FileText,
  Building2, ChevronRight, Settings, Plug, Eye
} from 'lucide-react';

// ============================================================
// COMPOSANTS RÉUTILISABLES
// ============================================================

const SectionHeader = ({ icon: Icon, title, description }: any) => (
  <div className="mb-8 pb-4 border-b border-slate-200">
    <div className="flex items-center gap-3 mb-2">
      <div className="p-2 bg-slate-100 rounded-xl">
        <Icon size={20} className="text-slate-700" />
      </div>
      <h2 className="text-xl font-serif italic text-slate-900">{title}</h2>
    </div>
    {description && <p className="text-slate-500 text-sm ml-11">{description}</p>}
  </div>
);

const FormField = ({ label, icon: Icon, children, helper, required }: any) => (
  <div className="space-y-2">
    <label className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
      {Icon && <Icon size={14} className="text-slate-400" />}
      {label}
      {required && <span className="text-red-500">*</span>}
    </label>
    {children}
    {helper && <p className="text-[10px] text-slate-400">{helper}</p>}
  </div>
);

const ColorPicker = ({ value, onChange, label }: any) => (
  <div className="flex items-center gap-3">
    <input 
      type="color" 
      value={value || '#0f172a'} 
      onChange={(e) => onChange(e.target.value)}
      className="w-12 h-12 rounded-xl cursor-pointer border border-slate-200 p-1 shadow-sm"
    />
    <input 
      type="text" 
      value={value || ''} 
      onChange={(e) => onChange(e.target.value)}
      className="flex-1 px-4 py-3 border border-slate-200 rounded-xl text-sm font-mono bg-slate-50 focus:ring-2 focus:ring-slate-900 outline-none"
      placeholder={label}
    />
  </div>
);

const ImageUpload = ({ value, onChange, label, accept = "image/*" }: any) => (
  <div className="relative group">
    <input 
      type="file" 
      accept={accept}
      onChange={onChange}
      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
    />
    <div className="w-full border-2 border-dashed border-slate-200 rounded-2xl p-6 flex flex-col items-center gap-2 bg-slate-50 group-hover:bg-slate-100 transition-colors">
      {value ? (
        <div className="relative">
          <img src={value} className="h-20 w-auto object-contain" alt={label} />
          <button 
            type="button"
            onClick={(e) => { e.preventDefault(); onChange(null); }}
            className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
          >
            <X size={12} />
          </button>
        </div>
      ) : (
        <>
          <UploadCloud size={32} className="text-slate-300" />
          <span className="text-xs text-slate-500">{label || "Cliquer pour uploader"}</span>
        </>
      )}
    </div>
  </div>
);

// ============================================================
// DICTIONNAIRE DE TRADUCTION
// ============================================================
const translations = {
  fr: {
    admin: "Administration",
    saas_title: "SaaS Agences",
    new_agency: "Nouvelle Agence",
    select_agency: "Sélectionnez une agence pour commencer",
    save: "Enregistrer",
    saving: "Enregistrement...",
    success_save: "Configuration enregistrée !",
    error_save: "Erreur lors de la sauvegarde",
    generate: "Créer l'agence",
    tabs: {
      general: "Général",
      appearance: "Apparence",
      hero: "Bannière",
      pages: "Pages",
      team: "Équipe",
      social: "Réseaux",
      integrations: "Intégrations",
      languages: "Langues & XML"
    },
    fields: {
      agency_name: "Nom de l'agence",
      subdomain: "Adresse du site",
      logo: "Logo",
      package: "Abonnement",
      primary_color: "Couleur principale",
      button_color: "Couleur des boutons",
      button_style: "Style des boutons",
      button_animation: "Animation",
      font_family: "Police",
      hero_title: "Titre d'accroche",
      hero_type: "Type de média",
      hero_file: "Fichier média",
      about_title: "Titre de la page À propos",
      about_text: "Contenu",
      privacy_policy: "Politique de confidentialité",
      email: "Email",
      phone: "Téléphone",
      whatsapp: "WhatsApp",
      facebook: "Facebook",
      instagram: "Instagram",
      linkedin: "LinkedIn",
      tiktok: "TikTok",
      zoho: "Zoho CRM",
      taskade: "Taskade AI",
      allowed_langs: "Langues disponibles",
      default_lang: "Langue par défaut",
      xml_sources: "Flux XML",
      member_name: "Nom",
      member_role: "Poste",
      member_bio: "Biographie",
      member_photo: "Photo"
    },
    placeholders: {
      agency_name: "Ex: Prestige Immobilier",
      subdomain: "mon-agence",
      hero_title: "Découvrez l'excellence immobilière...",
      about_title: "Notre histoire",
      about_text: "Décrivez votre agence...",
      member_name: "Jean Dupont",
      member_role: "Agent Commercial",
      member_bio: "Expert en immobilier depuis 15 ans...",
      whatsapp: "33600000000",
      email: "contact@agence.fr",
      phone: "+33 1 23 45 67 89"
    },
    buttons: {
      add_member: "Ajouter un membre",
      save: "Enregistrer",
      create: "Créer"
    }
  },
  en: {
    admin: "Administration",
    saas_title: "SaaS Agencies",
    new_agency: "New Agency",
    select_agency: "Select an agency to start",
    save: "Save",
    saving: "Saving...",
    success_save: "Settings saved!",
    error_save: "Error saving",
    generate: "Create Agency",
    tabs: {
      general: "General",
      appearance: "Appearance",
      hero: "Hero",
      pages: "Pages",
      team: "Team",
      social: "Social",
      integrations: "Integrations",
      languages: "Languages & XML"
    },
    fields: {
      agency_name: "Agency Name",
      subdomain: "Website Address",
      logo: "Logo",
      package: "Plan",
      primary_color: "Primary Color",
      button_color: "Button Color",
      button_style: "Button Style",
      button_animation: "Animation",
      font_family: "Font",
      hero_title: "Hero Title",
      hero_type: "Media Type",
      hero_file: "Media File",
      about_title: "About Page Title",
      about_text: "Content",
      privacy_policy: "Privacy Policy",
      email: "Email",
      phone: "Phone",
      whatsapp: "WhatsApp",
      facebook: "Facebook",
      instagram: "Instagram",
      linkedin: "LinkedIn",
      tiktok: "TikTok",
      zoho: "Zoho CRM",
      taskade: "Taskade AI",
      allowed_langs: "Available Languages",
      default_lang: "Default Language",
      xml_sources: "XML Feeds",
      member_name: "Name",
      member_role: "Role",
      member_bio: "Bio",
      member_photo: "Photo"
    },
    placeholders: {
      agency_name: "Ex: Prestige Real Estate",
      subdomain: "my-agency",
      hero_title: "Discover real estate excellence...",
      about_title: "Our story",
      about_text: "Describe your agency...",
      member_name: "John Doe",
      member_role: "Real Estate Agent",
      member_bio: "Real estate expert for 15 years...",
      whatsapp: "447000000000",
      email: "contact@agency.com",
      phone: "+44 20 1234 5678"
    },
    buttons: {
      add_member: "Add Member",
      save: "Save",
      create: "Create"
    }
  }
};

// ============================================================
// SECTIONS DU DASHBOARD
// ============================================================

// 1. SECTION GÉNÉRALE
const GeneralSection = ({ agency, setSelectedAgency, onFileUpload, t }: any) => (
  <div className="space-y-8">
    <SectionHeader icon={Building2} title={t.tabs.general} description="Informations principales de votre agence" />
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField label={t.fields.agency_name} icon={Building2} required>
        <input 
          type="text"
          value={agency?.agency_name || ''}
          onChange={(e) => setSelectedAgency({...agency, agency_name: e.target.value})}
          className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-slate-900 outline-none"
          placeholder={t.placeholders.agency_name}
        />
      </FormField>

      <FormField label={t.fields.subdomain} icon={Globe} helper="https://[slug].datahome.fr">
        <input 
          type="text"
          value={agency?.subdomain || ''}
          onChange={(e) => setSelectedAgency({...agency, subdomain: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
          className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-slate-900 outline-none"
          placeholder={t.placeholders.subdomain}
        />
      </FormField>

      <FormField label={t.fields.logo} icon={ImageIcon}>
        <ImageUpload 
          value={agency?.logo_url}
          onChange={(e) => onFileUpload(e, 'branding', 'logo_url')}
          label="Logo"
        />
      </FormField>

      <FormField label={t.fields.package} icon={Settings}>
        <select 
          value={agency?.package_level || 'silver'}
          onChange={(e) => setSelectedAgency({...agency, package_level: e.target.value})}
          className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium bg-white focus:ring-2 focus:ring-slate-900 outline-none"
        >
          <option value="light">Light (Démarrage)</option>
          <option value="premium">Premium (Professionnel)</option>
          <option value="ultimate">Ultimate (Agence)</option>
        </select>
      </FormField>
    </div>
  </div>
);

// 2. SECTION APPARENCE
const AppearanceSection = ({ agency, setSelectedAgency, t }: any) => {
  const fontOptions = [
    { value: 'Montserrat', label: 'Montserrat' },
    { value: 'Inter', label: 'Inter' },
    { value: "'Playfair Display', serif", label: 'Playfair Display' },
    { value: 'Poppins', label: 'Poppins' },
  ];

  const presets = [
    { name: 'Luxe Doré', colors: { primary: '#D4AF37', button: '#D4AF37' } },
    { name: 'Bleu Méditerranée', colors: { primary: '#1E90FF', button: '#1E90FF' } },
    { name: 'Nature & Bois', colors: { primary: '#8B4513', button: '#8B4513' } },
    { name: 'Minimal Élégant', colors: { primary: '#1A1A1A', button: '#1A1A1A' } },
  ];

  return (
    <div className="space-y-8">
      <SectionHeader icon={Palette} title={t.tabs.appearance} description="Personnalisez l'identité visuelle" />
      
      {/* Thèmes prédéfinis */}
      <div>
        <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3 block">Thèmes prédéfinis</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {presets.map((theme, i) => (
            <button
              key={i}
              onClick={() => {
                setSelectedAgency({...agency, primary_color: theme.colors.primary, button_color: theme.colors.button});
              }}
              className="p-3 border border-slate-200 rounded-xl text-center hover:shadow-lg transition-all hover:border-slate-300"
            >
              <div className="flex gap-2 justify-center mb-2">
                <div className="w-8 h-8 rounded-full" style={{ backgroundColor: theme.colors.primary }} />
              </div>
              <span className="text-[10px] font-bold text-slate-600">{theme.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField label={t.fields.primary_color} icon={Palette}>
          <ColorPicker 
            value={agency?.primary_color}
            onChange={(color) => setSelectedAgency({...agency, primary_color: color})}
            label="#D4AF37"
          />
        </FormField>

        <FormField label={t.fields.button_color} icon={MousePointer2}>
          <ColorPicker 
            value={agency?.button_color}
            onChange={(color) => setSelectedAgency({...agency, button_color: color})}
            label="#3b82f6"
          />
        </FormField>

        <FormField label={t.fields.font_family} icon={Type}>
          <select 
            value={agency?.font_family || 'Montserrat'}
            onChange={(e) => setSelectedAgency({...agency, font_family: e.target.value})}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-medium bg-white focus:ring-2 focus:ring-slate-900 outline-none"
            style={{ fontFamily: agency?.font_family || 'Montserrat' }}
          >
            {fontOptions.map(font => (
              <option key={font.value} value={font.value} style={{ fontFamily: font.value }}>
                {font.label}
              </option>
            ))}
          </select>
        </FormField>

        <FormField label={t.fields.button_style} icon={Monitor}>
          <div className="flex gap-3">
            <button
              onClick={() => setSelectedAgency({...agency, button_style: 'rounded-none'})}
              className={`flex-1 py-3 px-4 border-2 rounded-xl transition-all text-center ${
                agency?.button_style === 'rounded-none' ? 'border-slate-900 bg-slate-50' : 'border-slate-200'
              }`}
            >
              <div className="w-full h-3 bg-slate-800 mb-2" style={{ borderRadius: 0 }} />
              <span className="text-[9px] font-bold uppercase">Carrés</span>
            </button>
            <button
              onClick={() => setSelectedAgency({...agency, button_style: 'rounded-full'})}
              className={`flex-1 py-3 px-4 border-2 rounded-xl transition-all text-center ${
                agency?.button_style === 'rounded-full' ? 'border-slate-900 bg-slate-50' : 'border-slate-200'
              }`}
            >
              <div className="w-full h-3 bg-slate-800 mb-2 rounded-full" />
              <span className="text-[9px] font-bold uppercase">Arrondis</span>
            </button>
          </div>
        </FormField>

        <FormField label={t.fields.button_animation} icon={Zap}>
          <div className="grid grid-cols-2 gap-2">
            {[
              { value: 'none', label: 'Aucune' },
              { value: 'scale', label: 'Zoom' },
              { value: 'glow', label: 'Lueur' },
              { value: 'slide', label: 'Glissement' }
            ].map(anim => (
              <button
                key={anim.value}
                onClick={() => setSelectedAgency({...agency, button_animation: anim.value})}
                className={`py-2 px-3 rounded-lg text-[9px] font-bold uppercase tracking-wider transition-all ${
                  agency?.button_animation === anim.value ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {anim.label}
              </button>
            ))}
          </div>
        </FormField>
      </div>
    </div>
  );
};

// 3. SECTION HERO
const HeroSection = ({ agency, setSelectedAgency, onFileUpload, t }: any) => (
  <div className="space-y-8">
    <SectionHeader icon={ImageIcon} title={t.tabs.hero} description="La première chose que voient vos visiteurs" />
    
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField label={t.fields.hero_type} icon={Video}>
        <div className="flex gap-3">
          <button
            onClick={() => setSelectedAgency({...agency, hero_type: 'image'})}
            className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
              agency?.hero_type !== 'video' ? 'border-slate-900 bg-slate-50' : 'border-slate-200'
            }`}
          >
            <ImageIcon size={16} /> Image
          </button>
          <button
            onClick={() => setSelectedAgency({...agency, hero_type: 'video'})}
            className={`flex-1 py-3 px-4 rounded-xl border-2 transition-all flex items-center justify-center gap-2 ${
              agency?.hero_type === 'video' ? 'border-slate-900 bg-slate-50' : 'border-slate-200'
            }`}
          >
            <Video size={16} /> Vidéo
          </button>
        </div>
      </FormField>

      <FormField label={t.fields.hero_title} icon={Type}>
        <textarea 
          rows={3}
          value={agency?.hero_title || ''}
          onChange={(e) => setSelectedAgency({...agency, hero_title: e.target.value})}
          className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 outline-none resize-none"
          placeholder={t.placeholders.hero_title}
        />
      </FormField>

      <div className="md:col-span-2">
        <FormField label={t.fields.hero_file} icon={agency?.hero_type === 'video' ? Video : ImageIcon}>
          <ImageUpload 
            value={agency?.hero_url}
            onChange={(e) => onFileUpload(e, 'hero', 'hero_url')}
            label={agency?.hero_type === 'video' ? "MP4, WebM" : "JPG, PNG, WebP"}
            accept={agency?.hero_type === 'video' ? 'video/*' : 'image/*'}
          />
        </FormField>
      </div>
    </div>
  </div>
);

// 4. SECTION PAGES STATIQUES
const StaticPagesSection = ({ agency, setSelectedAgency, t }: any) => (
  <div className="space-y-8">
    <SectionHeader icon={FileText} title={t.tabs.pages} description="Contenu des pages statiques" />
    
    <div className="space-y-6">
      <FormField label={t.fields.about_title} icon={Type}>
        <input 
          type="text"
          value={agency?.about_title || ''}
          onChange={(e) => setSelectedAgency({...agency, about_title: e.target.value})}
          className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 outline-none"
          placeholder={t.placeholders.about_title}
        />
      </FormField>

      <FormField label={t.fields.about_text}>
        <textarea 
          rows={6}
          value={agency?.about_text || ''}
          onChange={(e) => setSelectedAgency({...agency, about_text: e.target.value})}
          className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 outline-none"
          placeholder={t.placeholders.about_text}
        />
      </FormField>

      <FormField label={t.fields.privacy_policy} icon={ShieldCheck}>
        <textarea 
          rows={5}
          value={agency?.privacy_policy || ''}
          onChange={(e) => setSelectedAgency({...agency, privacy_policy: e.target.value})}
          className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-slate-900 outline-none"
          placeholder="Mentions légales et politique de confidentialité..."
        />
      </FormField>
    </div>
  </div>
);

// 5. SECTION ÉQUIPE
const TeamSection = ({ team, setTeam, agency, setSelectedAgency, onMemberPhotoUpload, t }: any) => (
  <div className="space-y-8">
    <SectionHeader icon={Users} title={t.tabs.team} description="Présentez les membres de votre agence" />
    
    <div className="flex justify-end">
      <button
        onClick={() => {
          const newTeam = [...team, { name: "", role: "", bio: "", photo: "" }];
          setTeam(newTeam);
          setSelectedAgency({ ...agency, team_data: newTeam });
        }}
        className="flex items-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800 transition-all"
      >
        <UserPlus size={14} /> {t.buttons.add_member}
      </button>
    </div>

    {team.length === 0 ? (
      <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-100">
        <Users size={48} className="mx-auto mb-3 text-slate-300" />
        <p className="text-sm text-slate-400">Aucun membre dans l'équipe</p>
        <button
          onClick={() => {
            const newTeam = [{ name: "", role: "", bio: "", photo: "" }];
            setTeam(newTeam);
            setSelectedAgency({ ...agency, team_data: newTeam });
          }}
          className="mt-4 text-slate-600 text-sm underline"
        >
          Ajouter un premier membre
        </button>
      </div>
    ) : (
      <div className="space-y-6">
        {team.map((member: any, index: number) => (
          <div key={index} className="relative border border-slate-200 rounded-2xl p-6 bg-white">
            <button
              onClick={() => {
                const newTeam = team.filter((_: any, i: number) => i !== index);
                setTeam(newTeam);
                setSelectedAgency({ ...agency, team_data: newTeam });
              }}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-red-500 transition-colors"
            >
              <Trash2 size={16} />
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField label={t.fields.member_photo} icon={ImageIcon}>
                <div className="relative">
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={(e) => onMemberPhotoUpload(e, index)}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
                  />
                  <div className="flex items-center gap-4 p-3 border border-slate-200 rounded-xl bg-slate-50 cursor-pointer hover:bg-slate-100 transition-colors">
                    {member.photo ? (
                      <img src={member.photo} className="w-12 h-12 rounded-full object-cover" alt={member.name} />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center">
                        <UserPlus size={20} className="text-slate-400" />
                      </div>
                    )}
                    <span className="text-xs text-slate-500">Cliquer pour uploader</span>
                  </div>
                </div>
              </FormField>

              <FormField label={t.fields.member_name} icon={Users}>
                <input
                  type="text"
                  value={member.name || ''}
                  onChange={(e) => {
                    const newTeam = [...team];
                    newTeam[index].name = e.target.value;
                    setTeam(newTeam);
                    setSelectedAgency({ ...agency, team_data: newTeam });
                  }}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                  placeholder={t.placeholders.member_name}
                />
              </FormField>

              <FormField label={t.fields.member_role} icon={Briefcase}>
                <input
                  type="text"
                  value={member.role || ''}
                  onChange={(e) => {
                    const newTeam = [...team];
                    newTeam[index].role = e.target.value;
                    setTeam(newTeam);
                    setSelectedAgency({ ...agency, team_data: newTeam });
                  }}
                  className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                  placeholder={t.placeholders.member_role}
                />
              </FormField>

              <div className="md:col-span-2">
                <FormField label={t.fields.member_bio} icon={FileText}>
                  <textarea
                    rows={3}
                    value={member.bio || ''}
                    onChange={(e) => {
                      const newTeam = [...team];
                      newTeam[index].bio = e.target.value;
                      setTeam(newTeam);
                      setSelectedAgency({ ...agency, team_data: newTeam });
                    }}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 outline-none"
                    placeholder={t.placeholders.member_bio}
                  />
                </FormField>
              </div>
            </div>
          </div>
        ))}
      </div>
    )}
  </div>
);

// 6. SECTION RÉSEAUX SOCIAUX
const SocialSection = ({ agency, updateNestedConfig, updateRootConfig, t }: any) => {
  const socials = agency?.footer_config?.socials || {};
  
  return (
    <div className="space-y-8">
      <SectionHeader icon={Share2} title={t.tabs.social} description="Connectez vos profils sociaux" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField label={t.fields.facebook} icon={Facebook}>
          <input
            type="url"
            value={socials.facebook || ''}
            onChange={(e) => updateNestedConfig('socials', 'facebook', e.target.value)}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 outline-none"
            placeholder="https://facebook.com/votre-agence"
          />
        </FormField>

        <FormField label={t.fields.instagram} icon={Instagram}>
          <input
            type="url"
            value={socials.instagram || ''}
            onChange={(e) => updateNestedConfig('socials', 'instagram', e.target.value)}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 outline-none"
            placeholder="https://instagram.com/votre-agence"
          />
        </FormField>

        <FormField label={t.fields.linkedin} icon={Linkedin}>
          <input
            type="url"
            value={socials.linkedin || ''}
            onChange={(e) => updateNestedConfig('socials', 'linkedin', e.target.value)}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 outline-none"
            placeholder="https://linkedin.com/company/votre-agence"
          />
        </FormField>

        <FormField label={t.fields.tiktok} icon={TikTokIcon}>
          <input
            type="url"
            value={socials.tiktok || ''}
            onChange={(e) => updateNestedConfig('socials', 'tiktok', e.target.value)}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 outline-none"
            placeholder="https://tiktok.com/@votre-agence"
          />
        </FormField>

        <FormField label={t.fields.email} icon={Mail}>
          <input
            type="email"
            value={agency?.footer_config?.email || agency?.email || ''}
            onChange={(e) => updateRootConfig('email', e.target.value)}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 outline-none"
            placeholder={t.placeholders.email}
          />
        </FormField>

        <FormField label={t.fields.phone} icon={Phone}>
          <input
            type="tel"
            value={agency?.footer_config?.phone || agency?.phone || ''}
            onChange={(e) => updateRootConfig('phone', e.target.value)}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-slate-900 outline-none"
            placeholder={t.placeholders.phone}
          />
        </FormField>

        <FormField label={t.fields.whatsapp} icon={MessageCircle} helper="Numéro sans espaces, sans le +">
          <input
            type="tel"
            value={socials.whatsapp || agency?.whatsapp_number || ''}
            onChange={(e) => updateNestedConfig('socials', 'whatsapp', e.target.value)}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-green-500 outline-none"
            placeholder={t.placeholders.whatsapp}
          />
        </FormField>
      </div>
    </div>
  );
};

// 7. SECTION INTÉGRATIONS
const IntegrationsSection = ({ agency, updateNestedConfig, t }: any) => {
  const integrations = agency?.footer_config?.integrations || {};
  
  return (
    <div className="space-y-8">
      <SectionHeader icon={Plug} title={t.tabs.integrations} description="Connectez vos outils externes" />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <FormField label={t.fields.zoho} icon={Zap} helper="Identifiant ou token d'API">
          <input
            type="text"
            value={integrations.zoho_id || ''}
            onChange={(e) => updateNestedConfig('integrations', 'zoho_id', e.target.value)}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-slate-900 outline-none"
            placeholder="zoho_id_123456"
          />
        </FormField>

        <FormField label={t.fields.taskade} icon={Cpu} helper="ID de l'agent IA Taskade">
          <input
            type="text"
            value={integrations.taskade_id || ''}
            onChange={(e) => updateNestedConfig('integrations', 'taskade_id', e.target.value)}
            className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm font-mono focus:ring-2 focus:ring-slate-900 outline-none"
            placeholder="taskade_agent_123"
          />
        </FormField>
      </div>
    </div>
  );
};

// 8. SECTION LANGUES & XML
const LanguagesXmlSection = ({ agency, toggleLanguage, toggleXmlSource, setDefaultLang, t }: any) => {
  const allowedLangs = agency?.footer_config?.allowed_langs || ['fr'];
  const xmlUrls = agency?.footer_config?.xml_urls || [];
  const defaultLang = agency?.default_lang || 'fr';

  const languages = [
    { code: 'fr', label: 'Français' },
    { code: 'en', label: 'English' },
    { code: 'es', label: 'Español' },
    { code: 'nl', label: 'Nederlands' },
    { code: 'pl', label: 'Polski' },
    { code: 'ar', label: 'العربية' },
  ];

  const xmlSources = [
    { id: 'cb', name: "Costa Blanca", url: "https://medianewbuild.com/file/hh-media-bucket/agents/6d5cb68a-3636-4095-b0ce-7dc9ec2df2d2/feed_blanca_calida.xml" },
    { id: 'cs', name: "Costa del Sol", url: "https://medianewbuild.com/file/hh-media-bucket/agents/6d5cb68a-3636-4095-b0ce-7dc9ec2df2d2/feed_sol.xml" }
  ];

  return (
    <div className="space-y-8">
      <SectionHeader icon={Globe} title={t.tabs.languages} description="Configurez les langues et sources de biens" />
      
      <div className="space-y-6">
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3 block">{t.fields.allowed_langs}</label>
          <div className="flex flex-wrap gap-2">
            {languages.map(lang => (
              <button
                key={lang.code}
                onClick={() => toggleLanguage(lang.code)}
                className={`px-4 py-2 rounded-full text-[11px] font-bold transition-all ${
                  allowedLangs.includes(lang.code) 
                    ? 'bg-slate-900 text-white shadow-md' 
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {allowedLangs.length > 0 && (
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3 block">{t.fields.default_lang}</label>
            <div className="flex flex-wrap gap-2">
              {allowedLangs.map(code => {
                const lang = languages.find(l => l.code === code);
                return (
                  <button
                    key={code}
                    onClick={() => setDefaultLang(code)}
                    className={`px-4 py-2 rounded-full text-[11px] font-bold transition-all ${
                      defaultLang === code 
                        ? 'bg-emerald-600 text-white shadow-md' 
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {lang?.label || code} {defaultLang === code && "⭐"}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-3 block">{t.fields.xml_sources}</label>
          <div className="space-y-2">
            {xmlSources.map(source => (
              <button
                key={source.id}
                onClick={() => toggleXmlSource(source.url)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition-all ${
                  xmlUrls.includes(source.url) ? 'border-slate-900 bg-slate-50' : 'border-slate-200'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                    xmlUrls.includes(source.url) ? 'bg-slate-900 border-slate-900' : 'border-slate-300'
                  }`}>
                    {xmlUrls.includes(source.url) && <CheckCircle2 size={12} className="text-white" />}
                  </div>
                  <span className="text-sm font-bold">{source.name}</span>
                </div>
                <span className="text-[10px] text-slate-400 truncate max-w-[200px]">{source.url}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// 8. APERÇU EN TEMPS RÉEL
const LivePreview = ({ agency, t }: any) => (
  <div className="sticky top-8">
    <div className="bg-slate-900 rounded-2xl p-4 shadow-xl">
      <div className="flex items-center gap-2 text-white/50 text-[10px] font-bold uppercase tracking-wider mb-3">
        <Eye size={14} /> {t.tabs.preview || "Aperçu"}
      </div>
      <div 
        className="relative aspect-[16/9] rounded-xl overflow-hidden bg-slate-800"
        style={{ fontFamily: agency?.font_family || 'Montserrat' }}
      >
        {agency?.hero_url && agency?.hero_type !== 'video' && (
          <img src={agency.hero_url} className="absolute inset-0 w-full h-full object-cover opacity-50" alt="aperçu" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent" />
        <div className="absolute inset-0 p-5 flex flex-col justify-end">
          {agency?.logo_url && (
            <img src={agency.logo_url} className="h-8 w-auto object-contain mb-3" alt="logo" />
          )}
          <h3 className="text-white text-lg font-serif italic mb-2 line-clamp-2">
            {agency?.hero_title || t.placeholders.hero_title}
          </h3>
          <div 
            className="inline-block px-5 py-2 text-[9px] font-bold text-white uppercase tracking-wider shadow-lg"
            style={{ 
              backgroundColor: agency?.button_color || agency?.primary_color || '#3b82f6',
              borderRadius: agency?.button_style === 'rounded-full' ? '9999px' : '0px'
            }}
          >
            Découvrir
          </div>
        </div>
      </div>
    </div>
  </div>
);

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
export default function AgencyDashboard() {
  const [lang, setLang] = useState<'fr' | 'en'>('fr');
  const t = translations[lang];

  const [activeTab, setActiveTab] = useState('general');
  const [agencies, setAgencies] = useState<any[]>([]);
  const [selectedAgency, setSelectedAgency] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [newAgency, setNewAgency] = useState({ agency_name: '', subdomain: '', package_level: 'silver' });
  const [team, setTeam] = useState<any[]>([]);

  // TABS DE NAVIGATION
  const tabs = [
    { id: 'general', label: t.tabs.general, icon: Building2 },
    { id: 'appearance', label: t.tabs.appearance, icon: Palette },
    { id: 'hero', label: t.tabs.hero, icon: ImageIcon },
    { id: 'pages', label: t.tabs.pages, icon: FileText },
    { id: 'team', label: t.tabs.team, icon: Users },
    { id: 'social', label: t.tabs.social, icon: Share2 },
    { id: 'integrations', label: t.tabs.integrations, icon: Plug },
    { id: 'languages', label: t.tabs.languages, icon: Globe },
  ];

  // Chargement des agences
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
    if (selectedAgency) setTeam(selectedAgency.team_data || []);
  }, [selectedAgency]);

  // Fonctions utilitaires
  const updateNestedConfig = (section: string, field: string, value: any) => {
    if (!selectedAgency) return;
    setSelectedAgency((prev: any) => {
      let currentConfig: any = {};
      if (typeof prev.footer_config === 'string') {
        try { currentConfig = JSON.parse(prev.footer_config); } catch { currentConfig = {}; }
      } else { currentConfig = prev.footer_config || {}; }
      const currentSection = currentConfig[section] || {};
      return {
        ...prev,
        footer_config: { ...currentConfig, [section]: { ...currentSection, [field]: value } }
      };
    });
  };

  const updateRootConfig = (field: string, value: any) => {
    if (!selectedAgency) return;
    setSelectedAgency((prev: any) => {
      let currentConfig: any = {};
      if (typeof prev.footer_config === 'string') {
        try { currentConfig = JSON.parse(prev.footer_config); } catch { currentConfig = {}; }
      } else { currentConfig = prev.footer_config || {}; }
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

  const setDefaultLang = (code: string) => {
    setSelectedAgency({ ...selectedAgency, default_lang: code });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, folder: string, field: string) => {
    const file = e.target.files?.[0];
    if (!file || !selectedAgency) return;
    try {
      setIsSaving(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random()}.${fileExt}`;
      const filePath = `${selectedAgency.subdomain}/${folder}/${fileName}`;
      const { error: uploadError } = await supabase.storage.from('agencies').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data: { publicUrl } } = supabase.storage.from('agencies').getPublicUrl(filePath);
      setSelectedAgency({ ...selectedAgency, [field]: publicUrl });
    } catch (err) { 
      setMessage({ type: 'error', text: "Erreur d'upload" }); 
    } finally { 
      setIsSaving(false); 
    }
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
      setMessage({ type: 'error', text: "Erreur d'upload" }); 
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
    } catch (err) { 
      setMessage({ type: 'error', text: "Erreur lors de la suppression" }); 
    } finally { 
      setIsSaving(false); 
      setTimeout(() => setMessage(null), 3000); 
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e?.preventDefault?.();
    if (!selectedAgency || !selectedAgency.id) {
      setMessage({ type: 'error', text: "ID de l'agence manquant" });
      return;
    }
    setIsSaving(true);
    try {
      const teamDataToSave = JSON.parse(JSON.stringify(team));
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
      setMessage({ type: 'error', text: "Erreur lors de la création" }); 
    } finally { 
      setIsCreating(false); 
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'general':
        return <GeneralSection agency={selectedAgency} setSelectedAgency={setSelectedAgency} onFileUpload={handleFileUpload} t={t} />;
      case 'appearance':
        return <AppearanceSection agency={selectedAgency} setSelectedAgency={setSelectedAgency} t={t} />;
      case 'hero':
        return <HeroSection agency={selectedAgency} setSelectedAgency={setSelectedAgency} onFileUpload={handleFileUpload} t={t} />;
      case 'pages':
        return <StaticPagesSection agency={selectedAgency} setSelectedAgency={setSelectedAgency} t={t} />;
      case 'team':
        return <TeamSection team={team} setTeam={setTeam} agency={selectedAgency} setSelectedAgency={setSelectedAgency} onMemberPhotoUpload={handleMemberPhotoUpload} t={t} />;
      case 'social':
        return <SocialSection agency={selectedAgency} updateNestedConfig={updateNestedConfig} updateRootConfig={updateRootConfig} t={t} />;
      case 'integrations':
        return <IntegrationsSection agency={selectedAgency} updateNestedConfig={updateNestedConfig} t={t} />;
      case 'languages':
        return <LanguagesXmlSection agency={selectedAgency} toggleLanguage={toggleLanguage} toggleXmlSource={toggleXmlSource} setDefaultLang={setDefaultLang} t={t} />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-slate-50">
        <Loader2 className="animate-spin text-slate-900" size={40} />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-900">
      {/* BANDEAU DE VERSION */}
      <div className="bg-red-600 text-white text-[10px] py-1 text-center font-bold uppercase z-[9999] fixed top-0 left-0 right-0">
        V2 ACTIVE - TABLE: AGENCY_SETTINGS
      </div>

      {/* SIDEBAR */}
      <aside className="w-80 bg-white border-r border-slate-200 flex flex-col shadow-sm mt-6">
        <div className="p-6 border-b border-slate-100">
          <div className="flex justify-between items-center mb-4">
            <button 
              onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
              className="flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-[10px] font-bold uppercase tracking-widest hover:bg-slate-200"
            >
              <Languages size={12} /> {lang.toUpperCase()}
            </button>
            <button onClick={() => setShowCreateModal(true)} className="p-2 bg-slate-900 text-white rounded-xl hover:bg-slate-800 transition-all shadow-lg">
              <Plus size={18} />
            </button>
          </div>
          <h2 className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{t.admin}</h2>
          <p className="font-serif italic text-xl text-slate-900 mt-1">{t.saas_title}</p>
        </div>
        
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {agencies.map((agency) => (
            <div key={agency.id} className="relative group">
              <button 
                onClick={() => setSelectedAgency(agency)} 
                className={`w-full text-left px-4 py-3 rounded-xl text-sm transition-all ${
                  selectedAgency?.id === agency.id 
                    ? 'bg-slate-900 text-white shadow-md' 
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <div className="font-bold truncate pr-6">{agency.agency_name}</div>
                <div className="text-[10px] opacity-60 mt-0.5">{agency.subdomain}</div>
              </button>
              <button 
                onClick={() => handleDelete(agency.id, agency.agency_name)} 
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto mt-6">
        {selectedAgency ? (
          <div className="max-w-7xl mx-auto p-8">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-200">
              <div className="flex items-center gap-4">
                {selectedAgency.logo_url ? (
                  <img src={selectedAgency.logo_url} className="w-12 h-12 rounded-xl object-contain" alt="Logo" />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-slate-200 flex items-center justify-center text-slate-500 font-bold text-xl">
                    {selectedAgency.agency_name?.charAt(0)}
                  </div>
                )}
                <div>
                  <h1 className="text-2xl font-serif italic text-slate-900">{selectedAgency.agency_name}</h1>
                  <p className="text-sm text-slate-500">{selectedAgency.subdomain}.datahome.fr</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                {message && (
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-[10px] font-bold ${
                    message.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
                  }`}>
                    {message.type === 'success' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                    {message.text}
                  </div>
                )}
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl font-bold text-[11px] uppercase tracking-wider hover:bg-slate-800 transition-all disabled:opacity-50"
                >
                  {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Save size={16} />}
                  {isSaving ? t.saving : t.save}
                </button>
              </div>
            </div>

            {/* TABS */}
            <div className="flex gap-1 mb-8 border-b border-slate-200 overflow-x-auto">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-t-xl text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-white text-slate-900 border-x border-t border-slate-200'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  <tab.icon size={16} />
                  {tab.label}
                </button>
              ))}
            </div>

            {/* CONTENU + APERÇU */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200 p-8 shadow-sm">
                {renderContent()}
              </div>
              <div className="lg:col-span-1">
                <LivePreview agency={selectedAgency} t={t} />
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center text-slate-300 space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center">
              <Layout size={60} strokeWidth={1} />
            </div>
            <p className="text-sm font-medium">{t.select_agency}</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold hover:bg-slate-800 transition-all"
            >
              <Plus size={16} className="inline mr-2" />
              Créer une agence
            </button>
          </div>
        )}
      </main>

      {/* MODAL DE CRÉATION */}
      {showCreateModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl p-8 shadow-2xl space-y-6 animate-in zoom-in duration-300">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-serif italic">{t.new_agency}</h2>
              <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-all">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateAgency} className="space-y-5">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">
                  {t.fields.agency_name}
                </label>
                <input 
                  required 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-slate-900 outline-none" 
                  value={newAgency.agency_name} 
                  onChange={(e) => setNewAgency({...newAgency, agency_name: e.target.value})} 
                  placeholder={t.placeholders.agency_name}
                />
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">
                  {t.fields.subdomain}
                </label>
                <input 
                  required 
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-mono focus:ring-2 focus:ring-slate-900 outline-none" 
                  placeholder={t.placeholders.subdomain}
                  value={newAgency.subdomain} 
                  onChange={(e) => setNewAgency({...newAgency, subdomain: e.target.value.toLowerCase().replace(/\s+/g, '-')})} 
                />
                <p className="text-[10px] text-slate-400 mt-1">.datahome.fr</p>
              </div>
              <button 
                type="submit" 
                disabled={isCreating} 
                className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold text-[11px] uppercase tracking-wider shadow-lg hover:bg-slate-800 transition-all disabled:opacity-50"
              >
                {isCreating ? <Loader2 className="animate-spin mx-auto" size={16} /> : t.generate}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}