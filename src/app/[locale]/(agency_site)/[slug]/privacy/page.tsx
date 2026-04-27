import { supabase } from "@/lib/supabase";
import { notFound } from "next/navigation";
import { Shield, ChevronLeft, Lock } from "lucide-react";
import Link from "next/link";

import fr from "../../../../../dictionaries/fr.json";
import en from "../../../../../dictionaries/en.json";
import es from "../../../../../dictionaries/es.json";
import nl from "../../../../../dictionaries/nl.json";
import pl from "../../../../../dictionaries/pl.json";
import ar from "../../../../../dictionaries/ar.json";

export const revalidate = 0;

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;

  const translations: any =
    locale === "en" ? en :
    locale === "es" ? es :
    locale === "nl" ? nl :
    locale === "pl" ? pl :
    locale === "ar" ? ar : fr;

  const { data: agency } = await supabase
    .from("agency_settings")
    .select("*")
    .eq("subdomain", slug)
    .single();

  if (!agency) return notFound();

  const brandColor = agency.primary_color || "#c5a059";
  const fontFamily = agency.font_family || "Montserrat";
  const content: string = agency.privacy_policy || translations.legal?.privacy_default || "";

  const sections = content
    .split(/\n(?=[A-Z\d])/g)
    .map((s: string) => s.trim())
    .filter((s: string) => s.length > 0)
    .slice(0, 8);

  return (
    <div
      className="min-h-screen bg-[#0d0d0d] text-white"
      style={{ fontFamily: `${fontFamily}, 'Helvetica Neue', Arial, sans-serif` }}
    >
      {/* Hero Header */}
      <header className="relative overflow-hidden pt-20 pb-16 px-6">
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: `radial-gradient(circle at 30% 50%, ${brandColor} 0%, transparent 60%)` }}
        />
        <div className="max-w-5xl mx-auto relative z-10">
          <div className="flex items-start gap-6 mb-6">
            <div
              className="p-4 rounded-2xl shrink-0"
              style={{ backgroundColor: `${brandColor}18`, border: `1px solid ${brandColor}30` }}
            >
              <Shield size={28} style={{ color: brandColor }} />
            </div>
            <div>
              <p
                className="text-[9px] uppercase tracking-[0.3em] font-black mb-2"
                style={{ color: brandColor }}
              >
                {agency.agency_name}
              </p>
              <h1
                className="text-3xl md:text-5xl font-light"
                style={{
                  fontFamily: `${fontFamily}, 'Playfair Display', serif`,
                  letterSpacing: "-0.02em",
                }}
              >
                {translations.footer?.privacy || "Politique de confidentialité"}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 ml-20">
            <Lock size={12} className="text-white/20" />
            <p className="text-[10px] uppercase tracking-[0.2em] font-black text-white/20">
              Document légal · {agency.agency_name}
            </p>
          </div>
        </div>

        {/* Separator */}
        <div className="max-w-5xl mx-auto mt-12">
          <div
            className="h-px w-full"
            style={{ background: `linear-gradient(to right, ${brandColor}40, transparent)` }}
          />
        </div>
      </header>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-6 pb-24 flex gap-16">

        {/* Sidebar navigation */}
        <aside className="hidden lg:block w-52 shrink-0">
          <div className="sticky top-24 space-y-1">
            <p className="text-[8px] uppercase tracking-[0.3em] font-black text-white/20 mb-5">Sections</p>
            {sections.slice(0, 6).map((section: string, i: number) => {
              const title = section.split("\n")[0].slice(0, 40);
              return (
                <a
                  key={i}
                  href={`#section-${i}`}
                  className="group flex items-center gap-3 py-2 transition-all duration-200"
                >
                  <div
                    className="w-4 h-px transition-all duration-300 group-hover:w-6"
                    style={{ backgroundColor: `${brandColor}50` }}
                  />
                  <span
                    className="text-[9px] uppercase tracking-[0.15em] font-bold text-white/25 group-hover:text-white/50 transition-colors duration-200 line-clamp-1"
                  >
                    {title}
                  </span>
                </a>
              );
            })}
          </div>
        </aside>

        {/* Main text */}
        <main className="flex-1">
          <div
            className="rounded-3xl p-8 md:p-12"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.03) 0%, rgba(255,255,255,0.01) 100%)",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            {sections.length > 1 ? (
              <div className="space-y-10">
                {sections.map((section: string, i: number) => {
                  const lines = section.split("\n");
                  const title = lines[0];
                  const body = lines.slice(1).join("\n").trim();
                  return (
                    <div key={i} id={`section-${i}`} className="scroll-mt-24">
                      {title && (
                        <h2
                          className="text-sm font-black uppercase tracking-widest mb-4"
                          style={{ color: brandColor, fontSize: "0.65rem", letterSpacing: "0.2em" }}
                        >
                          {title}
                        </h2>
                      )}
                      {body && (
                        <p className="text-sm text-white/45 leading-[1.9] whitespace-pre-wrap font-light">
                          {body}
                        </p>
                      )}
                      {i < sections.length - 1 && (
                        <div
                          className="mt-10 h-px"
                          style={{ background: "rgba(255,255,255,0.04)" }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="prose-invert max-w-none">
                <p className="text-sm text-white/45 leading-[1.9] whitespace-pre-wrap font-light">{content}</p>
              </div>
            )}
          </div>

          <div className="mt-12 flex justify-between items-center">
            <Link
              href={`/${locale}/${slug}`}
              className="inline-flex items-center gap-2 text-white/30 hover:text-white/60 transition-colors text-[10px] font-black uppercase tracking-widest"
            >
              <ChevronLeft size={14} />
              {translations.common?.backToHome || "Retour"}
            </Link>
            <p className="text-[9px] text-white/15 uppercase tracking-widest font-black">
              {agency.agency_name} · {new Date().getFullYear()}
            </p>
          </div>
        </main>
      </div>
    </div>
  );
}
