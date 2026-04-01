"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Globe, Menu, X, User } from "lucide-react";
import { createBrowserClient } from '@supabase/ssr';
import { useTranslation } from "@/contexts/I18nContext";

// Logo SVG par défaut avec gestion de la couleur dynamique
const DataHomeLogo = ({ className, style }: { className?: string, style?: React.CSSProperties }) => (
  <svg viewBox="0 0 150 35" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} style={style}>
    <path d="M15 12L20 5L25 12H15Z" fill="currentColor" />
    <text x="10" y="28" fontFamily="sans-serif" fontSize="22" fontWeight="300" fill="currentColor" letterSpacing="-0.02em">data home</text>
  </svg>
);

const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface NavbarProps {
  agency?: any;
}

export default function Navbar({ agency }: NavbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { t, locale, setLocale } = useTranslation() as any;

  // Récupération de la couleur du Dashboard (doré par défaut si vide)
  const brandColor = agency?.primary_color || "#D4AF37";

  const [mounted, setMounted] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");
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

  // Logique de couleur dynamique selon le scroll
  const textColor = isScrolled ? "text-slate-900" : "text-white";
  const logoHexColor = isScrolled ? "#000000" : "#FFFFFF";

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput === "1234") {
      setIsLoginModalOpen(false);
      setPasswordInput("");
      router.push("/admin");
    } else {
      alert("PIN incorrect");
    }
  };

  const navLinks = [
    { name: t('nav.home') || "Accueil", href: "/" },
    { name: t('nav.solution') || "Solution", href: "/solution" },
    { name: t('nav.contact') || "Contact", href: "/contact" },
  ];

  return (
    <>
      <nav 
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 flex items-center ${
          isScrolled ? 'h-20 border-b border-black/5 shadow-lg' : 'h-28 border-none'
        }`}
        style={{
          backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.90)' : 'transparent',
          backdropFilter: isScrolled ? 'blur(16px)' : 'none',
          WebkitBackdropFilter: isScrolled ? 'blur(16px)' : 'none',
        }}
      >
        <div className="max-w-7xl mx-auto px-6 md:px-12 w-full flex items-center justify-between">
          
          {/* LOGO DYNAMIQUE */}
          <Link href="/" className="relative z-10 block transition-transform hover:scale-105 active:scale-95">
            {agency?.logo_url ? (
               <img 
                 src={agency.logo_url} 
                 alt={agency?.name || "Logo"} 
                 className={`h-10 md:h-12 w-auto object-contain transition-all duration-500 ${
                   !isScrolled ? 'brightness-0 invert' : '' 
                 }`} 
               />
            ) : (
               <DataHomeLogo 
                 className="h-8 w-auto transition-colors duration-500" 
                 style={{ color: logoHexColor }}
               />
            )}
          </Link>

          {/* DESKTOP NAV */}
          <div className="hidden md:flex items-center gap-12">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                style={{ color: isScrolled ? undefined : 'white' }}
                className={`text-[10px] font-black uppercase tracking-[0.4em] transition-all hover:opacity-70 ${textColor}`}
              >
                <span className="hover:border-b-2" style={{ borderColor: brandColor }}>
                  {link.name}
                </span>
              </Link>
            ))}

            {/* LANG SELECTOR */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setIsLangOpen(!isLangOpen)}
                className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.4em] transition-all ${textColor}`}
              >
                <Globe size={14} style={{ color: brandColor }} />
                {locale}
              </button>
              
              {isLangOpen && (
                <div className="absolute right-0 mt-6 py-3 w-32 bg-slate-900/95 backdrop-blur-md border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
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

            {/* BOUTON CLIENT ACCESS - Couleur Dashboard */}
            <button 
              onClick={() => setIsLoginModalOpen(true)}
              style={{ backgroundColor: brandColor, boxShadow: `0 0 20px ${brandColor}4d` }}
              className="group relative p-3 rounded-full text-black hover:scale-110 hover:bg-white transition-all duration-300"
            >
              <User size={18} />
            </button>
          </div>

          {/* MOBILE TOGGLE */}
          <button 
            className={`md:hidden p-2 transition-colors ${textColor}`} 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      {/* MOBILE MENU FULLSCREEN */}
      {isMenuOpen && (
        <div className="fixed inset-0 bg-slate-950/98 backdrop-blur-3xl flex flex-col items-center justify-center gap-8 md:hidden z-[150] animate-in fade-in duration-300">
          <button onClick={() => setIsMenuOpen(false)} className="absolute top-10 right-10 text-white">
            <X size={35} />
          </button>
          {navLinks.map((link) => (
            <Link 
              key={link.href}
              href={link.href} 
              onClick={() => setIsMenuOpen(false)} 
              className="text-xl font-black uppercase tracking-[0.5em] text-white hover:opacity-60 transition-colors"
            >
              {link.name}
            </Link>
          ))}
          
          <div className="flex gap-4 mt-4">
            {['fr', 'en', 'es'].map((lang) => (
              <button 
                key={lang} 
                onClick={() => { setLocale(lang as any); setIsMenuOpen(false); }}
                style={{ 
                  backgroundColor: locale === lang ? brandColor : 'transparent',
                  borderColor: locale === lang ? brandColor : 'rgba(255,255,255,0.2)'
                }}
                className={`text-[10px] font-black uppercase tracking-widest px-4 py-2 border rounded-full ${
                  locale === lang ? 'text-black' : 'text-white'
                }`}
              >
                {lang}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* MODAL PIN LOGIN */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-6 bg-black/90 backdrop-blur-xl">
           <div className="absolute inset-0" onClick={() => { setIsLoginModalOpen(false); setPasswordInput(""); }} />
           <div 
             className="relative p-12 max-w-md w-full border bg-slate-900 text-white rounded-[2.5rem] shadow-2xl"
             style={{ borderColor: `${brandColor}33` }}
           >
              <h3 className="text-2xl font-serif italic mb-8 text-center">{t('nav.clientAccess') || "Accès Client"}</h3>
              <form onSubmit={handleAuthSubmit} className="space-y-8">
                <input 
                  type="password" 
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  placeholder="PIN" 
                  className="w-full bg-transparent border-b border-white/10 py-4 text-center text-3xl tracking-[0.5em] outline-none transition-all text-white"
                  style={{ borderBottomColor: passwordInput ? brandColor : 'rgba(255,255,255,0.1)' }}
                  autoFocus
                />
                <button 
                  type="submit" 
                  style={{ backgroundColor: brandColor }}
                  className="w-full text-black py-5 rounded-2xl font-black uppercase text-[10px] tracking-[0.4em] hover:bg-white transition-all transform active:scale-95 shadow-lg"
                >
                  Accéder
                </button>
              </form>
           </div>
        </div>
      )}
    </>
  );
}