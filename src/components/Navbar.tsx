"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Globe, Menu, X } from "lucide-react";
import { useTranslation } from "@/contexts/I18nContext";

const DataHomeLogo = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <svg viewBox="0 0 150 35" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <path d="M15 12L20 5L25 12H15Z" fill="currentColor" />
    <text x="10" y="28" fontFamily="sans-serif" fontSize="22" fontWeight="300" fill="currentColor" letterSpacing="-0.02em">data home</text>
  </svg>
);

interface NavbarProps {
  agency?: any;
}

export default function Navbar({ agency }: NavbarProps) {
  const pathname = usePathname();
  const { t, locale, setLocale } = useTranslation() as any;
  const brandColor = agency?.primary_color || "#D4AF37";

  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
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

  // --- MISE À JOUR DES LIENS ---
  const navLinks = [
    { name: t('nav.about') || "Qui sommes-nous", href: "#about" },
    { name: t('nav.contact') || "Contact", href: "#contact-section" },
  ];

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 flex items-center ${
          isScrolled ? 'h-20 border-b border-black/5 shadow-lg bg-white/90' : 'h-28 border-none bg-transparent'
        }`}
        style={{
          backdropFilter: isScrolled ? 'blur(16px)' : 'none',
          WebkitBackdropFilter: isScrolled ? 'blur(16px)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full flex items-center justify-between">
          
          <Link href="/" className="relative z-10 block transition-transform hover:scale-105 active:scale-95">
            {agency?.logo_url ? (
               <img 
                 src={agency.logo_url} 
                 alt={agency?.name || "Logo"} 
                 className="h-10 md:h-12 w-auto object-contain transition-all duration-500" 
               />
            ) : (
               <DataHomeLogo 
                 className="h-8 w-auto transition-colors duration-500" 
                 style={{ color: logoHexColor }}
               />
            )}
          </Link>

          <div className="hidden md:flex items-center gap-12">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                className={`text-[10px] font-black uppercase tracking-[0.4em] transition-all hover:opacity-70 ${textColor}`}
              >
                <span className="pb-1" style={{ borderBottom: pathname === link.href ? `2px solid ${brandColor}` : 'none' }}>
                  {link.name}
                </span>
              </Link>
            ))}

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
                      onClick={() => { setLocale(lang as any); setIsLangOpen(false); }}
                      className="w-full px-6 py-2 text-left text-[10px] font-black uppercase tracking-widest text-white hover:bg-white/10 transition-colors"
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <button 
            className={`md:hidden p-2 transition-colors ${textColor}`} 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      {isMenuOpen && (
        <div className="fixed inset-0 bg-slate-950/98 backdrop-blur-3xl flex flex-col items-center justify-center gap-8 md:hidden z-[150]">
          <button onClick={() => setIsMenuOpen(false)} className="absolute top-10 right-10 text-white">
            <X size={35} />
          </button>
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
        </div>
      )}
    </>
  );
}