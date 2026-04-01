"use client";

import React from "react";
import Link from "next/link";
import { Mail, Phone, Instagram, Facebook, MapPin, Linkedin } from "lucide-react";
// CORRECTION : Utilisation du bon chemin (@/contexts) et du bon nom (useTranslation)
import { useTranslation } from "@/contexts/I18nContext";

interface FooterProps {
  isLight?: boolean;
  agency?: any;
}

export default function Footer({ isLight = true, agency }: FooterProps) {
  // CORRECTION : Appel du hook useTranslation
  const { t } = useTranslation();
  
  const bgColor = isLight ? "bg-slate-50 border-t border-slate-200" : "bg-[#020617] border-t border-white/5";
  const textColor = isLight ? "text-slate-900" : "text-white";
  const mutedText = isLight ? "text-slate-500" : "text-slate-400";
  
  // On parse la config de contact stockée en JSON dans Supabase
  const footerData = typeof agency?.footer_config === 'string' 
    ? JSON.parse(agency.footer_config) 
    : (agency?.footer_config || {});

  return (
    <footer className={`${bgColor} py-16 transition-colors duration-500`}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          
          {/* Identité */}
          <div className="col-span-1 md:col-span-1 space-y-6">
            <h3 className={`text-xl font-serif italic ${textColor}`}>
              {agency?.agency_name || t('footer.excellence')}
            </h3>
            <div className="w-12 h-0.5 bg-primary"></div>
            <p className={`${mutedText} text-[10px] leading-relaxed uppercase tracking-widest max-w-[200px]`}>
              {t('footer.description')}
            </p>
          </div>

          {/* Navigation */}
          <div className="space-y-6">
            <h4 className={`text-[10px] font-bold uppercase tracking-[0.3em] ${textColor}`}>Navigation</h4>
            <ul className={`space-y-4 text-[10px] uppercase tracking-widest ${mutedText}`}>
              <li>
                <Link href="/" className="hover:text-primary transition-colors">
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link href="#collection" className="hover:text-primary transition-colors">
                  {t('nav.search')}
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-primary transition-colors">
                  {t('nav.contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact & Localisation */}
          <div className="space-y-6">
            <h4 className={`text-[10px] font-bold uppercase tracking-[0.3em] ${textColor}`}>Contact</h4>
            <ul className={`space-y-4 text-[10px] uppercase tracking-widest ${mutedText}`}>
              <li className="flex items-start gap-3">
                <MapPin size={14} className="text-primary shrink-0" /> 
                <span className="leading-tight">
                  {footerData?.address || t('footer.address')}
                  <br />
                  {footerData?.city || t('footer.city')}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Mail size={14} className="text-primary shrink-0" /> 
                <a href={`mailto:${footerData?.email || t('footer.email')}`} className="hover:underline lowercase tracking-normal italic text-[11px]">
                  {footerData?.email || t('footer.email')}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Phone size={14} className="text-primary shrink-0" /> 
                {footerData?.phone || t('footer.phone')}
              </li>
            </ul>
          </div>

          {/* Réseaux Sociaux */}
          <div className="space-y-6">
            <h4 className={`text-[10px] font-bold uppercase tracking-[0.3em] ${textColor}`}>Suivez-nous</h4>
            <div className="flex gap-6">
              {(footerData?.socials?.facebook || agency?.facebook_url) && (
                <a href={footerData?.socials?.facebook || agency?.facebook_url} target="_blank" rel="noopener noreferrer" className={`${mutedText} hover:text-primary transition-all`}>
                  <Facebook size={18} />
                </a>
              )}
              {(footerData?.socials?.instagram || agency?.instagram_url) && (
                <a href={footerData?.socials?.instagram || agency?.instagram_url} target="_blank" rel="noopener noreferrer" className={`${mutedText} hover:text-primary transition-all`}>
                  <Instagram size={18} />
                </a>
              )}
              {(footerData?.socials?.linkedin || agency?.linkedin_url) && (
                <a href={footerData?.socials?.linkedin || agency?.linkedin_url} target="_blank" rel="noopener noreferrer" className={`${mutedText} hover:text-primary transition-all`}>
                  <Linkedin size={18} />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className={`mt-16 pt-8 border-t ${isLight ? 'border-slate-200' : 'border-white/5'} text-center`}>
          <p className={`${mutedText} text-[8px] uppercase tracking-[0.4em]`}>
            © {new Date().getFullYear()} {agency?.agency_name || "AMARU"} — {t('footer.eliteEdition')}
          </p>
        </div>
      </div>
    </footer>
  );
}