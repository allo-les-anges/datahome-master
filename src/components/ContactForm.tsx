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
  const { t } = useTranslation();
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const primaryColor = useMemo(() => {
    return agency?.primary_color || 
           agency?.theme?.primary || 
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

  if (status === 'success') {
    return (
      <div className="p-10 text-center space-y-4 animate-in fade-in zoom-in duration-500">
        <CheckCircle className="mx-auto text-green-500" size={48} />
        <h3 className={`text-xl font-serif italic ${isLight ? 'text-slate-900' : 'text-white'}`}>
          {t('contact.success_title') || "Message envoyé avec succès !"}
        </h3>
        <p className="text-xs text-slate-400">
          {t('contact.ref_label') || "Réf"} {propertyRef} {t('contact.success_message') || "bien reçue."}
        </p>
        <button 
          onClick={() => setStatus('idle')}
          className="text-[10px] uppercase tracking-widest font-bold underline mt-4 text-slate-500 hover:text-slate-700 transition-colors"
        >
          {t('common.back') || "Retour"}
        </button>
      </div>
    );
  }

  // Styles inline pour garantir l'application
  const containerStyle = {
    backgroundColor: isLight ? '#ffffff' : '#0A0A0A',
    borderRadius: '2rem',
    overflow: 'hidden',
  };

  const inputStyle = {
    width: '100%',
    height: '56px',
    paddingLeft: '48px',
    paddingRight: '16px',
    borderRadius: '16px',
    border: `1px solid ${isLight ? '#e2e8f0' : 'rgba(255,255,255,0.1)'}`,
    backgroundColor: isLight ? '#ffffff' : 'rgba(255,255,255,0.05)',
    color: isLight ? '#0f172a' : '#ffffff',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s ease',
  };

  const textareaStyle = {
    width: '100%',
    padding: '16px',
    paddingLeft: '48px',
    borderRadius: '16px',
    border: `1px solid ${isLight ? '#e2e8f0' : 'rgba(255,255,255,0.1)'}`,
    backgroundColor: isLight ? '#ffffff' : 'rgba(255,255,255,0.05)',
    color: isLight ? '#0f172a' : '#ffffff',
    fontSize: '14px',
    outline: 'none',
    transition: 'all 0.2s ease',
    resize: 'none' as const,
  };

  const buttonStyle = {
    width: '100%',
    padding: '20px',
    backgroundColor: primaryColor,
    color: '#000000',
    borderRadius: '16px',
    fontWeight: 900,
    fontSize: '11px',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.2em',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '12px',
    border: 'none',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    marginTop: '16px',
  };

  return (
    <div style={containerStyle}>
      <form onSubmit={handleSubmit} style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <div style={{ marginBottom: '16px' }}>
          <h3 style={{ 
            fontSize: '24px', 
            fontFamily: 'serif', 
            fontStyle: 'italic', 
            marginBottom: '4px',
            color: isLight ? '#0f172a' : '#ffffff'
          }}>
            {t('contact.title') || "Contactez-nous"}
          </h3>
          <p style={{ 
            fontSize: '10px', 
            textTransform: 'uppercase' as const, 
            letterSpacing: '0.2em',
            color: '#64748b',
            fontWeight: 'bold'
          }}>
            {t('contact.ref_label') || "Réf"} : {propertyRef}
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* Champ Nom */}
          <div style={{ position: 'relative' }}>
            <User style={{ 
              position: 'absolute', 
              left: '16px', 
              top: '50%', 
              transform: 'translateY(-50%)',
              color: '#94a3b8',
              width: '18px',
              height: '18px'
            }} />
            <input 
              name="name"
              type="text" 
              placeholder={t('contact.placeholder_name') || "VOTRE NOM"} 
              required
              style={inputStyle}
              onFocus={(e) => {
                e.target.style.borderColor = primaryColor;
                e.target.style.boxShadow = `0 0 0 2px ${primaryColor}20`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = isLight ? '#e2e8f0' : 'rgba(255,255,255,0.1)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Champ Email */}
          <div style={{ position: 'relative' }}>
            <Mail style={{ 
              position: 'absolute', 
              left: '16px', 
              top: '50%', 
              transform: 'translateY(-50%)',
              color: '#94a3b8',
              width: '18px',
              height: '18px'
            }} />
            <input 
              name="email"
              type="email" 
              placeholder={t('contact.placeholder_email') || "VOTRE EMAIL"} 
              required
              style={inputStyle}
              onFocus={(e) => {
                e.target.style.borderColor = primaryColor;
                e.target.style.boxShadow = `0 0 0 2px ${primaryColor}20`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = isLight ? '#e2e8f0' : 'rgba(255,255,255,0.1)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          {/* Champ Message */}
          <div style={{ position: 'relative' }}>
            <MessageSquare style={{ 
              position: 'absolute', 
              left: '16px', 
              top: '16px',
              color: '#94a3b8',
              width: '18px',
              height: '18px'
            }} />
            <textarea 
              name="message"
              placeholder={t('contact.placeholder_message') || "DÉTAILS DE VOTRE PROJET..."} 
              rows={4}
              required
              style={textareaStyle}
              onFocus={(e) => {
                e.target.style.borderColor = primaryColor;
                e.target.style.boxShadow = `0 0 0 2px ${primaryColor}20`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = isLight ? '#e2e8f0' : 'rgba(255,255,255,0.1)';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
        </div>

        {status === 'error' && (
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '8px',
            color: '#ef4444',
            fontSize: '10px',
            textTransform: 'uppercase' as const,
            fontWeight: 'bold',
            letterSpacing: '0.05em'
          }}>
            <AlertCircle size={14} /> {t('contact.error_message') || "Erreur lors de l'envoi."}
          </div>
        )}
        
        <button 
          type="submit"
          disabled={status === 'loading'}
          style={buttonStyle}
          onMouseEnter={(e) => {
            e.currentTarget.style.filter = 'brightness(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.filter = 'brightness(1)';
          }}
        >
          {status === 'loading' ? (
            <Loader2 style={{ animation: 'spin 1s linear infinite' }} size={18} />
          ) : (
            <>
              <Send size={16} /> 
              {t('contact.send_btn') || "Envoyer la demande"}
            </>
          )}
        </button>
      </form>

      {/* Ajout de l'animation spin pour le loader */}
      <style jsx global>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}