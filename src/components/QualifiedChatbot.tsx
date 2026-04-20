"use client";

import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User, Loader2, CheckCircle2, Home, MapPin, Clock, DollarSign } from 'lucide-react';

// ─────────────────────────────────────────────
// TYPES
// ─────────────────────────────────────────────
interface PropertyResult {
  id: string;
  title: string;
  price: number;
  town: string;
  beds: number;
  pool: boolean;
  image: string;
}

interface Message {
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
  properties?: PropertyResult[];
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
// DÉTECTION DE LOCALE
// ─────────────────────────────────────────────
const LOCALE_LANGUAGES: Record<string, string> = {
  fr: 'French', en: 'English', es: 'Spanish', nl: 'Dutch',
  pl: 'Polish', ar: 'Arabic', de: 'German', pt: 'Portuguese',
  it: 'Italian', ru: 'Russian', zh: 'Chinese', ja: 'Japanese', ko: 'Korean',
};

const BUTTON_LABELS: Record<string, string> = {
  fr: 'Un projet immobilier ?',
  en: 'A real estate project?',
  es: '¿Un proyecto inmobiliario?',
  nl: 'Een vastgoedproject?',
  pl: 'Projekt nieruchomości?',
  ar: 'مشروع عقاري؟',
  de: 'Ein Immobilienprojekt?',
  pt: 'Um projeto imobiliário?',
  it: 'Un progetto immobiliare?',
  ru: 'Проект недвижимости?',
  zh: '房地产项目？',
  ja: '不動産プロジェクト？',
  ko: '부동산 프로젝트?',
};

const WELCOME_MESSAGES: Record<string, string> = {
  fr: "Bonjour ! 👋 Je suis l'assistant de **{agency}**. Quel est votre projet immobilier ? (achat, location, investissement...)",
  en: "Hello! 👋 I'm the assistant of **{agency}**. What is your real estate project? (purchase, rental, investment...)",
  es: "¡Hola! 👋 Soy el asistente de **{agency}**. ¿Cuál es su proyecto inmobiliario? (compra, alquiler, inversión...)",
  nl: "Hallo! 👋 Ik ben de assistent van **{agency}**. Wat is uw vastgoedproject? (aankoop, huur, investering...)",
  pl: "Cześć! 👋 Jestem asystentem **{agency}**. Jaki jest Twój projekt nieruchomości? (zakup, wynajem, inwestycja...)",
  ar: "مرحباً! 👋 أنا مساعد **{agency}**. ما هو مشروعك العقاري؟ (شراء، إيجار، استثمار...)",
  de: "Hallo! 👋 Ich bin der Assistent von **{agency}**. Was ist Ihr Immobilienprojekt? (Kauf, Miete, Investition...)",
  pt: "Olá! 👋 Sou o assistente de **{agency}**. Qual é o seu projeto imobiliário? (compra, aluguel, investimento...)",
  it: "Ciao! 👋 Sono l'assistente di **{agency}**. Qual è il suo progetto immobiliare? (acquisto, affitto, investimento...)",
  ru: "Здравствуйте! 👋 Я ассистент **{agency}**. Каков ваш проект в сфере недвижимости? (покупка, аренда, инвестиции...)",
  zh: "你好！👋 我是 **{agency}** 的助手。您的房地产项目是什么？（购买、租赁、投资...）",
  ja: "こんにちは！👋 **{agency}** のアシスタントです。不動産プロジェクトは何ですか？（購入、賃貸、投資...）",
  ko: "안녕하세요! 👋 **{agency}** 의 어시스턴트입니다. 부동산 프로젝트가 무엇인가요? (구매, 임대, 투자...)",
};

function detectLocale(): string {
  if (typeof window === 'undefined') return '';
  const match = window.location.pathname.match(/^\/([a-z]{2})\//);
  const code = match?.[1] ?? '';
  return LOCALE_LANGUAGES[code] ? code : '';
}

// ─────────────────────────────────────────────
// SYSTEM PROMPT DE QUALIFICATION
// ─────────────────────────────────────────────
const buildSystemPrompt = (agencyName: string, locale: string) => {
  const langName = LOCALE_LANGUAGES[locale];
  const langRule = langName
    ? `CRITICAL: You MUST respond exclusively in ${langName}. Never switch to another language regardless of what the user writes.`
    : `Detect the user's language from their first message and respond consistently in that language throughout the conversation.`;

  return `You are the virtual assistant of "${agencyName}", a real estate agency. You are warm, professional and concise.

## CONVERSATION FLOW (strictly follow this order):

PHASE 1 — COLLECT CRITERIA (1-2 exchanges max):
- In your FIRST message: greet and ask in ONE question: their project type (purchase/rental/investment), desired location, budget, and number of bedrooms.
- If they give partial info, accept it and ask only what's missing.
- As soon as you have AT LEAST ONE of (location, budget, number of bedrooms): IMMEDIATELY output <search_criteria> (see format below).

PHASE 2 — SHOW PROPERTIES:
- Tell the user you found matching properties and that they appear below.
- Do NOT ask for contact details yet.

PHASE 3 — COLLECT CONTACT INFO:
- After showing properties, ask for their first name + email + phone to schedule a visit or callback.
- Ask for timeline (urgent < 3 months / medium 3-6 months / long-term > 6 months).
- Once you have name + email + phone: output <lead_data> (see format below).

## RULES:
- Maximum 2-3 sentences per response.
- Stay natural, not like a form.
- ${langRule}

## MANDATORY OUTPUT — search criteria tag (invisible to user, stripped before display):
IMPORTANT: Output this tag in THE SAME response where the user first mentions location, budget OR bedrooms. Do not wait.
<search_criteria>{"budget_max": 500000, "town": "Marbella", "beds": 2}</search_criteria>
Only include the fields you know. Omit unknown fields. Use the city name in the original language as typed by the user.

## MANDATORY OUTPUT — lead data tag (invisible to user, only when you have name + email + phone):
<lead_data>{"name":"...","email":"...","phone":"...","budget":"...","location":"...","delay":"...","projectType":"..."}</lead_data>`;
};

// ─────────────────────────────────────────────
// HOOK: appel à l'API OpenAI via notre route Next.js
// ─────────────────────────────────────────────
async function callChatAPI(
  messages: { role: string; content: string }[],
  systemPrompt: string,
  agencyId?: string,
  locale?: string,
): Promise<{ rawContent: string; properties: PropertyResult[] }> {
  const res = await fetch('/api/chatbot', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ messages, systemPrompt, agencyId, locale }),
  });

  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    console.error('[Chatbot] API error:', res.status, errBody);
    throw new Error(`API error ${res.status}: ${errBody.detail || errBody.error || 'unknown'}`);
  }
  const data = await res.json();
  return { rawContent: data.content || '', properties: data.properties || [] };
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
  return text
    .replace(/<lead_data>[\s\S]*?<\/lead_data>/g, '')
    .replace(/<search_criteria>[\s\S]*?<\/search_criteria>/g, '')
    .trim();
}

// ─────────────────────────────────────────────
// ENVOI VERS CRM
// ─────────────────────────────────────────────
async function sendToCRM(lead: LeadData, config: ChatbotConfig) {
  if (!config.webhookUrl || config.crmType === 'none') return;
  try {
    await fetch(config.webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...lead, source: 'chatbot', agency_id: config.agencyId, created_at: new Date().toISOString() }),
    });
  } catch (e) {
    console.error('CRM webhook error:', e);
  }
}

async function saveLeadToSupabase(lead: LeadData, config: ChatbotConfig, sessionId: string) {
  try {
    const res = await fetch('/api/leads', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        agency_id: config.agencyId || null,
        session_id: sessionId,
        full_name: lead.name || null,
        email: lead.email || null,
        phone: lead.phone || null,
        budget: lead.budget || null,
        location: lead.location || null,
        delay: lead.delay || null,
        project_type: lead.projectType || null,
        source: 'chatbot',
      }),
    });
    if (!res.ok) console.error('[Leads] Save failed:', await res.text());
  } catch (e) {
    console.error('[Leads] Save error:', e);
  }
}

// ─────────────────────────────────────────────
// COMPOSANT PRINCIPAL
// ─────────────────────────────────────────────
export default function QualifiedChatbot({ config = {}, enabled = true }: QualifiedChatbotProps) {
  const agencyName = config.agencyName || 'Notre Agence';
  const primaryColor = config.primaryColor || '#0f172a';
  const locale = detectLocale();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isQualified, setIsQualified] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState<LeadData | null>(null);
  const [hasOpened, setHasOpened] = useState(false);
  const sessionId = React.useRef<string>(
    typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).slice(2)
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Message de bienvenue à l'ouverture
  useEffect(() => {
    if (isOpen && !hasOpened) {
      setHasOpened(true);
      const template = WELCOME_MESSAGES[locale] || WELCOME_MESSAGES['fr'];
      const welcome: Message = {
        role: 'assistant',
        content: template.replace('{agency}', agencyName),
        timestamp: new Date(),
      };
      setMessages([welcome]);
    }
  }, [isOpen, hasOpened, agencyName, locale]);

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
      const systemPrompt = buildSystemPrompt(agencyName, locale);
      console.log('[Chatbot] Sending message, history length:', history.length);
      const { rawContent, properties } = await callChatAPI(history, systemPrompt, config.agencyId, locale);
      console.log('[Chatbot] Response received, properties:', properties.length);

      const lead = extractLeadData(rawContent);
      const cleanedResponse = cleanMessage(rawContent);

      const assistantMessage: Message = {
        role: 'assistant',
        content: cleanedResponse,
        timestamp: new Date(),
        properties: properties.length > 0 ? properties : undefined,
      };

      setMessages(prev => [...prev, assistantMessage]);

      if (lead && lead.email) {
        setLeadCaptured(lead);
        setIsQualified(true);
        await Promise.all([
          sendToCRM(lead, config),
          saveLeadToSupabase(lead, config, sessionId.current),
        ]);
      }
    } catch (err: any) {
      console.error('[Chatbot] handleSend catch:', err?.message, err);
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
          <span className="hidden sm:block">{BUTTON_LABELS[locale] || BUTTON_LABELS['fr']}</span>
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

                {/* Cartes propriétés */}
                {msg.properties && msg.properties.length > 0 && (
                  <div className="mt-3 space-y-2 w-full max-w-[320px]">
                    {msg.properties.map(p => (
                      <div key={p.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                        {p.image && (
                          <img
                            src={p.image}
                            alt={p.title}
                            className="w-full h-28 object-cover"
                            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                          />
                        )}
                        <div className="p-3">
                          <p className="text-xs font-bold text-slate-900 line-clamp-1">{p.title}</p>
                          <p className="text-sm font-black mt-0.5" style={{ color: primaryColor }}>
                            {p.price.toLocaleString('fr-FR')} €
                          </p>
                          <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                            <span>{p.town}</span>
                            <span>·</span>
                            <span>{p.beds} ch.</span>
                            {p.pool && <><span>·</span><span>🏊</span></>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
