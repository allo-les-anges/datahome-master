"use client";

import React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Mail,
  Phone,
  Instagram,
  Facebook,
  MapPin,
  Linkedin,
  ShieldCheck,
  Scale,
  TrendingUp,
  Home as HomeIcon
} from "lucide-react";
import { useTranslation } from "@/contexts/I18nContext";

interface FooterProps {
  isLight?: boolean;
  agency?: any;
}

export default function Footer({ isLight = true, agency }: FooterProps) {
  const { t } = useTranslation();
  const params = useParams();
  const slug = (params?.slug as string) || agency?.subdomain || "";
  const locale = (params?.locale as string) || "fr";
  
  const bgColor = isLight ? "bg-slate-50 border-t border-slate-200" : "bg-[#020617] border-t border-white/5";
  const textColor = isLight ? "text-slate-900" : "text-white";
  const mutedText = isLight ? "text-slate-500" : "text-slate-400";
  
  const footerData = typeof agency?.footer_config === 'string' 
    ? JSON.parse(agency.footer_config || '{}') 
    : (agency?.footer_config || {});

  const brandColor = agency?.primary_color || '#10b981';

  // Logique SaaS : Nom légal vs Nom commercial
  const legalName = agency?.legal_name || agency?.agency_name || "Datahome";

  return (
    <footer 
      className={`${bgColor} py-16 transition-colors duration-500`}
      style={{ '--brand-primary': brandColor } as React.CSSProperties}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">
          
          {/* Identité & Copyrighting */}
          <div className="col-span-1 md:col-span-1 space-y-6">
            {agency?.logo_url ? (
              <Link href={`/${locale}/${slug}`} className="inline-flex items-center">
                <img
                  src={agency.logo_url}
                  alt={agency?.agency_name || "Agency logo"}
                  className="max-h-20 max-w-[180px] object-contain"
                />
              </Link>
            ) : (
              <h3 className={`text-xl font-serif italic ${textColor}`}>
                {agency?.agency_name || t('footer.excellence')}
              </h3>
            )}
            <div className="w-12 h-0.5" style={{ backgroundColor: brandColor }}></div>
            <p className={`${mutedText} text-[10px] leading-relaxed uppercase tracking-widest max-w-[200px]`}>
              {t('footer.description')}
            </p>
          </div>

          {/* Navigation */}
          <div className="space-y-6">
            <h4 className={`text-[10px] font-bold uppercase tracking-[0.3em] ${textColor}`}>Navigation</h4>
            <ul className={`space-y-4 text-[10px] uppercase tracking-widest ${mutedText}`}>
              <li>
                <Link href={`/${locale}/${slug}`} className="hover:text-primary transition-colors">
                  {t('nav.home')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/${slug}/contact`} className="hover:text-primary transition-colors">
                  {t('nav.contact')}
                </Link>
              </li>
            </ul>
          </div>

          {/* Légal & Privacy */}
          <div className="space-y-6">
            <h4 className={`text-[10px] font-bold uppercase tracking-[0.3em] ${textColor}`}>Légal</h4>
            <ul className={`space-y-4 text-[10px] uppercase tracking-widest ${mutedText}`}>
              <li>
                <Link href={`/${locale}/${slug}/privacy`} className="hover:text-primary transition-colors flex items-center gap-2">
                  <ShieldCheck size={12} className="shrink-0" />
                  {t('footer.privacy')}
                </Link>
              </li>
              <li>
                <Link href={`/${locale}/${slug}/terms`} className="hover:text-primary transition-colors flex items-center gap-2">
                  <Scale size={12} className="shrink-0" />
                  {t('footer.terms')}
                </Link>
              </li>
              {agency?.license_number && (
                <li className="text-[9px] normal-case opacity-70 flex items-center gap-2">
                  <span className="w-1 h-1 rounded-full bg-current opacity-30" />
                  Licence: {agency.license_number}
                </li>
              )}
            </ul>
          </div>

          {/* Contact & Réseaux */}
          <div className="space-y-6">
            <h4 className={`text-[10px] font-bold uppercase tracking-[0.3em] ${textColor}`}>Contact</h4>
            <div className={`space-y-4 text-[10px] uppercase tracking-widest ${mutedText}`}>
              <div className="flex items-start gap-3">
                <MapPin size={14} className="shrink-0" style={{ color: brandColor }} />
                <span className="leading-tight">{footerData?.address || agency?.address}</span>
              </div>
              <div className="flex gap-4 pt-2">
                {(footerData?.socials?.facebook || agency?.facebook_url) && (
                   <a href={footerData?.socials?.facebook || agency?.facebook_url} target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                     <Facebook size={18} />
                   </a>
                )}
                {(footerData?.socials?.instagram || agency?.instagram_url) && (
                   <a href={footerData?.socials?.instagram || agency?.instagram_url} target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                     <Instagram size={18} />
                   </a>
                )}
                {(footerData?.socials?.linkedin || agency?.linkedin_url) && (
                   <a href={footerData?.socials?.linkedin || agency?.linkedin_url} target="_blank" rel="noopener noreferrer" className="hover:opacity-70 transition-opacity">
                     <Linkedin size={18} />
                   </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom : Copyright & Attribution Datahome */}
        <div className={`mt-16 pt-8 border-t ${isLight ? 'border-slate-200' : 'border-white/5'} flex flex-col md:flex-row justify-between items-center gap-4`}>
          <p className={`${mutedText} text-[8px] uppercase tracking-[0.4em]`}>
            © {new Date().getFullYear()} {legalName} — {t('footer.eliteEdition')}
          </p>

          <div className="flex items-center gap-3">
            {agency?.property_manager_enabled && slug && (
              <Link
                href={`/${locale}/${slug}/mon-espace`}
                className={`${mutedText} text-[9px] uppercase tracking-widest font-bold opacity-50 hover:opacity-100 transition-opacity flex items-center gap-1.5 border border-current rounded-full px-3 py-1`}
              >
                <HomeIcon size={10} /> {t('nav.mySpace')}
              </Link>
            )}
            {footerData?.integrations?.leads_enabled && slug && (
              <Link
                href={`/${locale}/${slug}/mes-leads`}
                className={`${mutedText} text-[9px] uppercase tracking-widest font-bold opacity-50 hover:opacity-100 transition-opacity flex items-center gap-1.5 border border-current rounded-full px-3 py-1`}
              >
                <TrendingUp size={10} /> {t('nav.myLeads')}
              </Link>
            )}
            <p className={`${mutedText} text-[8px] uppercase tracking-[0.4em] opacity-50 hover:opacity-100 transition-opacity`}>
              Powered by{" "}
              <a
                href="https://datahome.fr"
                className="hover:text-primary transition-colors underline decoration-dotted underline-offset-4"
                target="_blank"
                rel="noopener noreferrer"
              >
                Datahome
              </a>
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
