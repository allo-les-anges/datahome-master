"use client";

import React, { useState, useMemo } from "react";
import { Send, CheckCircle, Loader2, User, Mail, MessageSquare, AlertCircle } from "lucide-react";
import { useTranslation } from "@/contexts/I18nContext";

interface ContactFormProps {
  agency: any;
  propertyRef: string;
  isLight?: boolean;
}

export default function ContactForm({ agency, propertyRef, isLight }: ContactFormProps) {
  // On s'assure de récupérer t correctement
  const { t } = useTranslation();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  // Extraction de la couleur de l'agence
  const primaryColor = useMemo(() => {
    return agency?.theme?.primary || 
           agency?.colors?.primary || 
           agency?.color || 
           "#D4AF37"; 
  }, [agency]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus('loading');

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      message: formData.get('message'),
      property_ref: propertyRef, 
    };

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (res.ok) {
        setStatus('success');
      } else {
        setStatus('error');
      }
    } catch (err) {
      setStatus('error');
    }
  };

  // Écran de Succès
  if (status === 'success') {
    return (
      <div className="p-10 text-center space-y-4 animate-in fade-in zoom-in duration-500">
        <CheckCircle className="mx-auto text-green-500" size={48} />
        <h3 className={`text-xl font-serif italic ${isLight ? 'text-slate-900' : 'text-white'}`}>
          {t('contact.success_title')}
        </h3>
        <p className="text-xs text-slate-400">
          {t('contact.ref_label')} {propertyRef} {t('contact.success_message')}
        </p>
        <button 
          onClick={() => setStatus('idle')}
          className="text-[10px] uppercase tracking-widest font-bold underline mt-4 text-slate-500"
        >
          {t('common.back')}
        </button>
      </div>
    );
  }

  // Correction : On définit les styles ici pour plus de clarté
  const inputBaseStyles = `w-full h-14 px-12 rounded-2xl border text-sm outline-none transition-all flex items-center`;
  
  // Correction de la visibilité : on force placeholder-shown et on ajuste l'opacité
  const themeStyles = isLight 
    ? 'bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus:border-slate-400' 
    : 'bg-white/5 border-white/10 text-white placeholder:text-zinc-500 focus:bg-white/10 focus:border-white/20';

  return (
    <form onSubmit={handleSubmit} className="p-8 space-y-5">
      <div className="mb-4">
        <h3 className={`text-xl font-serif italic mb-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>
          {t('contact.title')}
        </h3>
        <p className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold">
          {t('contact.ref_label')} : {propertyRef}
        </p>
      </div>

      <div className="space-y-4">
        {/* Champ Nom */}
        <div className="relative">
          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            name="name"
            type="text" 
            placeholder={String(t('contact.placeholder_name'))} 
            required
            className={`${inputBaseStyles} ${themeStyles}`}
          />
        </div>

        {/* Champ Email */}
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            name="email"
            type="email" 
            placeholder={String(t('contact.placeholder_email'))} 
            required
            className={`${inputBaseStyles} ${themeStyles}`}
          />
        </div>

        {/* Champ Message */}
        <div className="relative">
          <MessageSquare className="absolute left-4 top-4 text-slate-400" size={18} />
          <textarea 
            name="message"
            placeholder={String(t('contact.placeholder_message'))} 
            rows={4}
            required
            className={`w-full p-4 pl-12 rounded-2xl border text-sm outline-none transition-all resize-none ${themeStyles} h-auto`}
          ></textarea>
        </div>
      </div>

      {status === 'error' && (
        <div className="flex items-center gap-2 text-red-500 text-[10px] uppercase font-bold tracking-wider">
          <AlertCircle size={14} /> {t('contact.error_message')}
        </div>
      )}
      
      <button 
        type="submit"
        disabled={status === 'loading'}
        className="w-full py-5 text-black rounded-2xl font-black uppercase text-[11px] tracking-[0.2em] flex items-center justify-center gap-3 hover:brightness-110 active:scale-95 transition-all mt-4"
        style={{ backgroundColor: primaryColor }}
      >
        {status === 'loading' ? (
          <Loader2 className="animate-spin" size={18} />
        ) : (
          <>
            <Send size={16} /> 
            {t('contact.send_btn')}
          </>
        )}
      </button>
    </form>
  );
}