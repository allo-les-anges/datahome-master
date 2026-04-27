"use client";

import { useEffect, useState, use, useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { useTranslation } from "@/contexts/I18nContext";
import { useAgency } from "@/contexts/AgencyContext";
import { Loader2, Quote } from "lucide-react";

interface AboutPageProps {
  params: Promise<{ slug: string; locale: string }>;
}

const NAV_ITEMS = [
  { id: "histoire", label: "Notre Histoire" },
  { id: "valeurs", label: "Nos Valeurs" },
  { id: "temoignage", label: "Témoignage" },
];

function SideNav({
  active,
  onSelect,
  brandColor,
}: {
  active: string;
  onSelect: (id: string) => void;
  brandColor: string;
}) {
  return (
    <nav className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => {
        const isActive = active === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onSelect(item.id)}
            className="group flex items-center gap-3 text-left transition-all duration-300 py-2"
          >
            <div
              className="transition-all duration-300 rounded-full shrink-0"
              style={{
                width: isActive ? "2.5rem" : "1rem",
                height: "2px",
                backgroundColor: isActive ? brandColor : "rgba(255,255,255,0.15)",
              }}
            />
            <span
              className="text-[10px] uppercase tracking-[0.2em] font-black transition-all duration-300"
              style={{ color: isActive ? brandColor : "rgba(255,255,255,0.3)" }}
            >
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}

function SkeletonAbout() {
  return (
    <div className="min-h-screen bg-[#0d0d0d] flex flex-col items-center justify-center gap-6">
      <Loader2 size={36} className="animate-spin text-white/20" />
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20">Chargement…</p>
    </div>
  );
}

export default function AboutPage({ params }: AboutPageProps) {
  const resolvedParams = use(params);
  const { t } = useTranslation();
  const { agency, loading, setAgencyBySlug } = useAgency();
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState("histoire");

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const heroY = useTransform(scrollYProgress, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0]);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const currentSlug = resolvedParams.slug;
    if (currentSlug && agency?.subdomain !== currentSlug && !loading) {
      setAgencyBySlug(currentSlug);
    }
  }, [resolvedParams.slug, agency?.subdomain, loading, setAgencyBySlug]);

  useEffect(() => {
    const ids = ["histoire", "valeurs", "temoignage"];
    const observers: IntersectionObserver[] = [];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const obs = new IntersectionObserver(
        ([entry]) => { if (entry.isIntersecting) setActiveSection(id); },
        { threshold: 0.4 }
      );
      obs.observe(el);
      observers.push(obs);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, [mounted]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const brandColor = agency?.primary_color || "#c5a059";
  const fontFamily = agency?.font_family || "Montserrat";

  if (loading || !mounted) return <SkeletonAbout />;

  return (
    <div
      className="min-h-screen bg-[#0d0d0d] text-white"
      style={{ fontFamily: `${fontFamily}, 'Helvetica Neue', Arial, sans-serif` }}
    >
      {/* Parallax Hero */}
      <section ref={heroRef} className="relative h-[75vh] min-h-[500px] overflow-hidden flex items-center justify-center">
        {agency?.hero_url && (
          <motion.div className="absolute inset-0" style={{ y: heroY }}>
            <img
              src={agency.hero_url}
              alt={agency.agency_name}
              className="w-full h-[120%] object-cover"
              loading="eager"
            />
          </motion.div>
        )}
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(13,13,13,0.3) 0%, rgba(13,13,13,0.65) 60%, #0d0d0d 100%)" }} />

        <motion.div
          style={{ opacity: heroOpacity }}
          className="relative z-10 text-center px-6 max-w-3xl mx-auto"
        >
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="text-[10px] uppercase tracking-[0.35em] font-black mb-5"
            style={{ color: brandColor }}
          >
            {agency?.agency_name}
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.1 }}
            className="text-4xl md:text-6xl lg:text-7xl font-light mb-8"
            style={{ fontFamily: `${fontFamily}, 'Playfair Display', serif`, letterSpacing: "-0.03em" }}
          >
            {agency?.about_title || t("about.title") || "Notre Histoire"}
          </motion.h1>
          <motion.div
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="h-px w-24 mx-auto origin-left"
            style={{ backgroundColor: brandColor }}
          />
        </motion.div>
      </section>

      {/* Content with sidebar */}
      <div className="max-w-7xl mx-auto px-6 py-20 flex gap-16">

        {/* Sticky sidebar */}
        <aside className="hidden lg:block w-48 shrink-0">
          <div className="sticky top-24">
            <p className="text-[8px] uppercase tracking-[0.3em] font-black text-white/20 mb-6">Sommaire</p>
            <SideNav active={activeSection} onSelect={scrollTo} brandColor={brandColor} />
          </div>
        </aside>

        {/* Main content */}
        <main className="flex-1 space-y-28">

          {/* Section Histoire */}
          <section id="histoire">
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center gap-4 mb-10">
                <div className="w-px h-10 shrink-0" style={{ backgroundColor: brandColor }} />
                <div>
                  <p className="text-[9px] uppercase tracking-[0.3em] font-black mb-1" style={{ color: brandColor }}>01</p>
                  <h2
                    className="text-3xl md:text-4xl font-light"
                    style={{ fontFamily: `${fontFamily}, 'Playfair Display', serif` }}
                  >
                    {agency?.agency_name}
                  </h2>
                </div>
              </div>

              <div
                className="text-white/55 leading-[1.9] text-lg font-light whitespace-pre-wrap"
                style={{ fontFamily: `${fontFamily}, sans-serif`, fontWeight: 300 }}
              >
                {agency?.about_text || t("about.text") || "L'excellence immobilière à votre service."}
              </div>
            </motion.div>
          </section>

          {/* Section Valeurs */}
          <section id="valeurs">
            <motion.div
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="flex items-center gap-4 mb-10">
                <div className="w-px h-10 shrink-0" style={{ backgroundColor: brandColor }} />
                <div>
                  <p className="text-[9px] uppercase tracking-[0.3em] font-black mb-1" style={{ color: brandColor }}>02</p>
                  <h2
                    className="text-3xl md:text-4xl font-light"
                    style={{ fontFamily: `${fontFamily}, 'Playfair Display', serif` }}
                  >
                    Nos Valeurs
                  </h2>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                  { num: "I", label: "Excellence", text: "Un standard d'exigence inégalé dans chaque transaction." },
                  { num: "II", label: "Confiance", text: "Une relation durable fondée sur la transparence et l'intégrité." },
                  { num: "III", label: "Sur-mesure", text: "Un accompagnement personnalisé adapté à chaque projet." },
                ].map((val, i) => (
                  <motion.div
                    key={val.num}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: i * 0.12 }}
                    className="rounded-3xl p-8 group hover:-translate-y-1 transition-transform duration-300"
                    style={{
                      background: "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.01) 100%)",
                      border: "1px solid rgba(255,255,255,0.06)",
                    }}
                  >
                    <p
                      className="text-3xl font-light mb-3 opacity-30"
                      style={{ fontFamily: `${fontFamily}, 'Playfair Display', serif`, color: brandColor }}
                    >
                      {val.num}
                    </p>
                    <h3
                      className="text-base font-bold mb-2 uppercase tracking-widest"
                      style={{ color: brandColor, fontSize: "0.7rem", letterSpacing: "0.2em" }}
                    >
                      {val.label}
                    </h3>
                    <p className="text-sm text-white/45 leading-relaxed font-light">{val.text}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </section>

          {/* Section Témoignage */}
          {agency?.testimonial_text && (
            <section id="temoignage">
              <motion.div
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-px h-10 shrink-0" style={{ backgroundColor: brandColor }} />
                  <div>
                    <p className="text-[9px] uppercase tracking-[0.3em] font-black mb-1" style={{ color: brandColor }}>03</p>
                    <h2
                      className="text-3xl md:text-4xl font-light"
                      style={{ fontFamily: `${fontFamily}, 'Playfair Display', serif` }}
                    >
                      Témoignage
                    </h2>
                  </div>
                </div>

                <div
                  className="relative rounded-3xl p-10 md:p-14 overflow-hidden"
                  style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%)",
                    border: "1px solid rgba(255,255,255,0.07)",
                  }}
                >
                  <div
                    className="absolute top-0 left-0 w-1 h-full rounded-l-3xl"
                    style={{ backgroundColor: brandColor }}
                  />
                  <Quote
                    className="absolute top-8 right-8 opacity-[0.06]"
                    size={80}
                    style={{ color: brandColor }}
                  />
                  <p
                    className="text-2xl md:text-3xl font-light italic text-white/70 leading-relaxed mb-8 relative z-10"
                    style={{ fontFamily: `${fontFamily}, 'Playfair Display', serif` }}
                  >
                    "{agency.testimonial_text}"
                  </p>
                  <div className="relative z-10">
                    <p className="text-sm font-bold" style={{ color: brandColor }}>
                      {agency.testimonial_author || agency.agency_name}
                    </p>
                    {agency.testimonial_role && (
                      <p className="text-[10px] uppercase tracking-widest font-black text-white/30 mt-0.5">
                        {agency.testimonial_role}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}
