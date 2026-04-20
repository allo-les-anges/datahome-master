"use client";

import React from 'react';
import { MessageCircle } from 'lucide-react';

interface FloatingWhatsAppProps {
  phone?: string;
  color?: string;
}

export default function FloatingWhatsApp({ phone, color = "#25D366" }: FloatingWhatsAppProps) {
  if (!phone) return null;

  // Nettoyage du numéro (enlever les espaces, +, etc. pour l'URL)
  const cleanPhone = phone.replace(/\D/g, '');

  return (
    <a
      href={`https://wa.me/${cleanPhone}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-24 right-6 z-[99] p-4 rounded-full shadow-2xl transition-transform hover:scale-110 active:scale-95 flex items-center justify-center text-white"
      style={{ backgroundColor: color }}
      aria-label="Contactez-nous sur WhatsApp"
    >
      <MessageCircle size={28} fill="currentColor" className="text-white" />
      <span className="absolute -top-1 -right-1 flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
      </span>
    </a>
  );
}