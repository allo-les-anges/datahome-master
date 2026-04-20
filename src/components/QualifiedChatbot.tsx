"use client";

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2, CheckCircle2, Home, MapPin, Clock, DollarSign } from 'lucide-react';

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
interface Message {
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
}

interface LeadData {
  name?: string;
  email?: string;
  phone?: string;
  budget?: string;
  location?: string;
  delay?: string;
  projectType?: string;
}

interface ChatbotConfig {
  primaryColor?: string;
  agencyName?: string;
  logoUrl?: string;
  webhookUrl?: string;     // CRM webhook (Zoho, HubSpot, etc.)
  crmType?: 'zoho' | 'hubspot' | 'local' | 'none';
  openaiApiKey?: string;   // optionnel si passé côté serveur
  agencyId?: string;
}

interface QualifiedChatbotProps {
  config?: ChatbotConfig;
  enabled?: boolean;
}

// ─────────────────────────────────────────────
// SYSTEM PROMPT DE QUALIFICATION
// ─────────────────────────────────────────────
const buildSystemPrompt = (agencyName: string) => `
Tu es l'assistant virtuel de "${agencyName}", une agence immobilière. Tu es chaleureux, professionnel et concis.

Ton objectif est de qualifier les visiteurs en 4 étapes naturelles dans la conversation :
1. Accueillir et demander leur prénom + type de projet (achat, location, investissement)
2. Demander leur localisation souhaitée (région, ville)
3. Demander leur budget approximatif
4. Demander leur délai de concrétisation (urgent < 3 mois / moyen 3-6 mois / long terme > 6 mois)
5. Demander email ET téléphone pour programmer un rappel ou une visite
6. Confirmer qu'un conseiller va les contacter sous 24h et remercier

Règles :
- Pose UNE seule question à la fois
- Reste naturel, ne ressemble pas à un formulaire
- Si l'utilisateur donne plusieurs infos en une fois, prends-les toutes et passe à la suite
- Quand tu as le nom, email, téléphone, budget, localisation et délai → termine par le JSON de synthèse entre balises <lead_data>
- Ne dépasse pas 2-3 phrases par réponse
- Réponds toujours dans la langue de l'utilisateur

Format JSON final (invisible pour l'utilisateur, entre balises) :
<lead_data>{"name":"...","email":"...","phone":"...","budget":"...","location":"...","delay":"...","projectType":"..."}</lead_data>
`;

// ─────────────────────────────────────────────
// HOOK: appel à l'API OpenAI via notre route Next.js
// ─────────────────────────────────────────────
async function callChatAPI(
  messages: { role: string; content: string }[],
  systemPrompt: string
): Promise<string> {
  // On passe par notre propre API route pour ne pas exposer la clé OpenAI côté client
  const res = await fetch('/api/chatbot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, systemPrompt }),
  });

  if (!res.ok) throw new Error('API error');
  const data = await res.json();
  return data.content || '';
}

// ─────────────────────────────────────────────
// EXTRACTION DES DONNÉES LEAD
// ─────────────────────────────────────────────
function extractLeadData(text: string): LeadData | null {
  const match = text.match(/<lead_data>([\s\S]*?)<\/lead_data>/);
  if (!match) return null;
  try {
    return JSON.parse(match[1]);
  } catch {
    return null;
  }
}

function cleanMessage(text: string): string {
  return text.replace(/<lead_data>[\s\S]*?<\/lead_data>/g, '').trim();
}

// ─────────────────────────────────────────────
// ENVOI VERS CRM
// ─────────────────────────────────────────────
async function sendToCRM(lead: LeadData, config: ChatbotConfig) {
  if (!config.webhookUrl || config.crmType === 'none') return;

  const payload = {
    ...lead,
    source: 'chatbot',
    agency_id: config.agencyId,
    created_at: new Date().toISOString(),
  };

  try {
    await fetch(config.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    console.error('CRM webhook error:', e);
  }
}

// ─────────────────────────────────────────────
// COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────
export default function QualifiedChatbot({ config = {}, enabled = true }: QualifiedChatbotProps) {
  const agencyName = config.agencyName || 'Notre Agence';
  const primaryColor = config.primaryColor || '#0f172a';

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isQualified, setIsQualified] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState<LeadData | null>(null);
  const [hasOpened, setHasOpened] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Message de bienvenue à l'ouverture
  useEffect(() => {
    if (isOpen && !hasOpened) {
      setHasOpened(true);
      const welcome: Message = {
        role: 'assistant',
        content: `Bonjour ! 👋 Je suis l'assistant de **${agencyName}**. Je suis là pour vous aider à trouver le bien immobilier idéal.\n\nPour commencer, puis-je avoir votre prénom et me dire quel est votre projet ? (achat, location, investissement...)`,
        timestamp: new Date(),
      };
      setMessages([welcome]);
    }
  }, [isOpen, hasOpened, agencyName]);

  // Scroll auto vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus sur l'input quand ouvert
  useEffect(() => {
    if (isOpen) setTimeout(() => inputRef.current?.focus(), 100);
  }, [isOpen]);

  if (!enabled) return null;

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    try {
      const history = newMessages.map(m => ({ role: m.role, content: m.content }));
      const systemPrompt = buildSystemPrompt(agencyName);
      const rawResponse = await callChatAPI(history, systemPrompt);

      // Extraction lead data si présente
      const lead = extractLeadData(rawResponse);
      const cleanedResponse = cleanMessage(rawResponse);

      const assistantMessage: Message = {
        role: 'assistant',
        content: cleanedResponse,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (lead && lead.email) {
        setLeadCaptured(lead);
        setIsQualified(true);
        await sendToCRM(lead, config);
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: 'Désolé, une erreur est survenue. Veuillez réessayer ou nous contacter directement.',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {!isOpen && (
        <button
          onClick={handleOpen}
          className="group fixed bottom-6 right-6 z-[9998] flex items-center gap-3 px-5 py-4 rounded-full shadow-2xl text-white text-sm font-bold transition-all duration-300 hover:scale-105 hover:shadow-3xl active:scale-95"
          style={{ backgroundColor: primaryColor }}
          aria-label="Ouvrir le chat"
        >
          <div className="relative">
            <MessageCircle size={22} />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse" />
          </div>
          <span className="hidden sm:block">Un projet immobilier ?</span>
        </button>
      )}

      {isOpen && (
        <div className="fixed bottom-6 right-6 z-[9999] w-[380px] max-w-[calc(100vw-2rem)] h-[580px] max-h-[calc(100vh-5rem)] flex flex-col bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in slide-in-from-bottom-4 duration-300">

          {/* Header */}
          <div
            className="flex items-center justify-between px-5 py-4 text-white flex-shrink-0"
            style={{ backgroundColor: primaryColor }}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                <Bot size={18} />
              </div>
              <div>
                <p className="font-bold text-sm leading-tight">{agencyName}</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-[11px] opacity-80">Assistant en ligne</span>
                </div>
              </div>
            </div>
            <button
              onClick={handleClose}
              className="p-1.5 rounded-full hover:bg-white/20 transition-colors"
              aria-label="Fermer"
            >
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-slate-50/50">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div
                  className={`w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5 ${
                    msg.role === 'assistant' ? 'text-white' : 'bg-slate-200 text-slate-600'
                  }`}
                  style={msg.role === 'assistant' ? { backgroundColor: primaryColor } : {}}
                >
                  {msg.role === 'assistant' ? <Bot size={14} /> : <User size={14} />}
                </div>
                <div
                  className={`max-w-[78%] px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user'
                      ? 'text-white rounded-tr-sm'
                      : 'bg-white text-slate-800 rounded-tl-sm border border-slate-100'
                  }`}
                  style={msg.role === 'user' ? { backgroundColor: primaryColor } : {}}
                >
                  {msg.content.split('\n').map((line, j) => (
                    <p key={j} className={j > 0 ? 'mt-1' : ''}>
                      {line.split(/\*\*(.*?)\*\*/g).map((part, k) =>
                        k % 2 === 1 ? <strong key={k}>{part}</strong> : part
                      )}
                    </p>
                  ))}
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex gap-2.5">
                <div
                  className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center text-white"
                  style={{ backgroundColor: primaryColor }}
                >
                  <Bot size={14} />
                </div>
                <div className="bg-white border border-slate-100 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm">
                  <div className="flex gap-1 items-center h-4">
                    {[0, 1, 2].map(i => (
                      <span
                        key={i}
                        className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"
                        style={{ animationDelay: `${i * 150}ms` }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}

            {isQualified && (
              <div className="bg-green-50 border border-green-100 rounded-2xl p-4 flex items-start gap-3">
                <CheckCircle2 className="text-green-500 flex-shrink-0 mt-0.5" size={18} />
                <div>
                  <p className="text-sm font-bold text-green-800">Demande enregistrée ✓</p>
                  <p className="text-xs text-green-600 mt-1">
                    Un conseiller vous contactera sous 24h au {leadCaptured?.phone || leadCaptured?.email}.
                  </p>
                  {leadCaptured && (
                    <div className="mt-3 space-y-1">
                      {leadCaptured.budget && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <DollarSign size={11} /> Budget : {leadCaptured.budget}
                        </div>
                      )}
                      {leadCaptured.location && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <MapPin size={11} /> Zone : {leadCaptured.location}
                        </div>
                      )}
                      {leadCaptured.delay && (
                        <div className="flex items-center gap-1.5 text-xs text-slate-600">
                          <Clock size={11} /> Délai : {leadCaptured.delay}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          {!isQualified && (
            <div className="px-4 py-3 bg-white border-t border-slate-100 flex-shrink-0">
              <div className="flex items-center gap-2 bg-slate-50 rounded-2xl border border-slate-100 px-4 py-2 focus-within:border-slate-300 transition-colors">
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Votre message..."
                  disabled={isLoading}
                  className="flex-1 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none disabled:opacity-50"
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-30"
                  style={{ backgroundColor: primaryColor }}
                  aria-label="Envoyer"
                >
                  {isLoading ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                </button>
              </div>
              <p className="text-center text-[10px] text-slate-300 mt-2">Propulsé par IA · Données sécurisées</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
