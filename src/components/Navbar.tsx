"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Globe, Menu, X } from "lucide-react";
import { useTranslation } from "@/contexts/I18nContext";
import { useAgency } from "@/contexts/AgencyContext";

const DataHomeLogo = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <svg viewBox="0 0 150 35" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <path d="M15 12L20 5L25 12H15Z" fill="currentColor" />
    <text x="10" y="28" fontFamily="sans-serif" fontSize="22" fontWeight="300" fill="currentColor" letterSpacing="-0.02em">data home</text>
  </svg>
);

interface NavbarProps {
  agency?: any;
}

export default function Navbar({ agency: propsAgency }: NavbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { t, locale } = useTranslation() as any;
  
  const { agency: contextAgency } = useAgency();
  const agency = propsAgency || contextAgency;

  const brandColor = agency?.primary_color || "#D4AF37";

  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  const agencySlug = agency?.slug || agency?.subdomain || "schmidt-privilege";
  const baseUrl = `/${locale}/${agencySlug}`;

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!mounted) return null;

  const textColor = isScrolled ? "text-slate-900" : "text-white";
  const logoHexColor = isScrolled ? "#000000" : "#FFFFFF";

  const navLinks = [
    { name: t('nav.about') || "Qui sommes-nous", href: `${baseUrl}/about` },
    { name: t('nav.contact') || "Contact", href: `${baseUrl}/contact` },
  ];

  const handleLangChange = (newLang: string) => {
    const pathSegments = pathname.split('/').filter(Boolean);
    const slug = agency?.subdomain || pathSegments[1] || "default";
    const remainingPath = pathSegments.slice(2).join('/');
    const newPath = `/${newLang}/${slug}${remainingPath ? '/' + remainingPath : ''}`;
    
    setIsMenuOpen(false); // Ferme le menu mobile après changement
    setIsLangOpen(false); // Ferme le dropdown desktop
    router.push(newPath);
  };

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 flex items-center ${
          isScrolled ? 'h-24 border-b border-black/5 shadow-lg bg-white/90' : 'h-32 border-none bg-transparent'
        }`}
        style={{
          backdropFilter: isScrolled ? 'blur(16px)' : 'none',
          WebkitBackdropFilter: isScrolled ? 'blur(16px)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full flex items-center justify-between">
          
          {/* Logo */}
          <Link href={baseUrl} className="relative z-10 block transition-transform hover:scale-105 active:scale-95">
            {agency?.logo_url ? (
               <img 
                 src={agency.logo_url} 
                 alt={agency?.agency_name || "Logo"} 
                 className="h-16 md:h-20 w-auto object-contain transition-all duration-500" 
               />
            ) : (
               <DataHomeLogo 
                 className="h-12 md:h-16 w-auto transition-colors duration-500" 
                 style={{ color: logoHexColor }}
               />
            )}
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-12">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                className={`text-[10px] font-black uppercase tracking-[0.4em] transition-all hover:opacity-70 ${textColor}`}
              >
                <span 
                  className="pb-1" 
                  style={{ borderBottom: pathname === link.href ? `2px solid ${brandColor}` : 'none' }}
                >
                  {link.name}
                </span>
              </Link>
            ))}

            {/* Language Selector Desktop */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsLangOpen(!isLangOpen)}
                className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] transition-all ${textColor}`}
              >
                <Globe size={14} style={{ color: brandColor }} />
                {locale}
              </button>
              
              {isLangOpen && (
                <div className="absolute right-0 mt-6 py-3 w-32 bg-slate-900/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
                  {['fr', 'nl', 'en', 'es', 'ar'].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => handleLangChange(lang)}
                      className={`w-full px-6 py-2 text-left text-[10px] font-black uppercase tracking-widest transition-colors ${
                        locale === lang ? 'text-blue-400' : 'text-white hover:bg-white/10'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className={`md:hidden p-2 transition-colors relative z-[160] ${textColor}`} 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={28} className="text-white" /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-slate-950/98 backdrop-blur-3xl flex flex-col items-center justify-center z-[150] md:hidden"
          >
            <div className="flex flex-col items-center gap-10">
              <Link 
                href={baseUrl} 
                onClick={() => setIsMenuOpen(false)} 
                className="text-xl font-black uppercase tracking-[0.5em] text-white"
              >
                {t('nav.home') || 'Accueil'}
              </Link>

              {navLinks.map((link) => (
                <Link 
                  key={link.href}
                  href={link.href} 
                  onClick={() => setIsMenuOpen(false)} 
                  className="text-xl font-black uppercase tracking-[0.5em] text-white"
                >
                  {link.name}
                </Link>
              ))}

              {/* SECTION LANGUE MOBILE */}
              <div className="mt-12 flex flex-col items-center gap-6 border-t border-white/10 pt-10 w-64">
                <div className="flex items-center gap-3 text-slate-500">
                  <Globe size={16} style={{ color: brandColor }} />
                  <span className="text-[10px] font-black uppercase tracking-[0.3em]">{t('common.language') || 'Language'}</span>
                </div>
                
                <div className="flex flex-wrap justify-center gap-6">
                  {['fr', 'nl', 'en', 'es', 'ar'].map((lang) => (
                    <button
                      key={lang}
                      onClick={() => handleLangChange(lang)}
                      className={`text-sm font-black uppercase tracking-widest transition-all ${
                        locale === lang 
                          ? 'text-white scale-125' 
                          : 'text-slate-500 hover:text-white'
                      }`}
                      style={{ color: locale === lang ? brandColor : '' }}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}