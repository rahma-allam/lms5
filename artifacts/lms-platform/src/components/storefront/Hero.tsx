import { useI18n } from "@/lib/i18n";
import { motion } from "framer-motion";
import { JoinCourseModal } from "./JoinCourseModal";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { fetchStorefront } from "@/lib/api";
import { ArrowRight, Play, Star, Users, BookOpen, Award } from "lucide-react";

function getTenantParam(): string {
  const fromUrl = new URLSearchParams(window.location.search).get("tenant");
  if (fromUrl) { localStorage.setItem("tenant_slug", fromUrl); return `?tenant=${fromUrl}`; }
  const s = localStorage.getItem("tenant_slug") ?? "";
  return s ? `?tenant=${s}` : "";
}

const stagger = {
  container: { hidden: {}, show: { transition: { staggerChildren: 0.1 } } },
  item: { hidden: { opacity: 0, y: 28 }, show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } } },
};

export default function Hero() {
  const { t, lang } = useI18n();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: profile } = useQuery<any>({
    queryKey: ["/api/storefront/profile"],
    queryFn: () => fetch(`/api/storefront/profile${getTenantParam()}`).then((r) => r.ok ? r.json() : {}),
    staleTime: 60_000,
  });

  const { data: settings } = useQuery<any>({
    queryKey: ["/api/storefront/settings"],
    queryFn: () => fetchStorefront(`/api/storefront/settings${getTenantParam()}`),
    staleTime: 60_000,
  });

  const heroTitle    = lang === "ar" ? (profile?.heroTitleAr    || null) : (profile?.heroTitleEn    || null);
  const heroSubtitle = lang === "ar" ? (profile?.heroSubtitleAr || null) : (profile?.heroSubtitleEn || null);
  const heroCta      = lang === "ar" ? (profile?.heroCtaAr || t("hero.cta.join"))  : (profile?.heroCtaEn || t("hero.cta.join"));
  const academyName  = lang === "ar" ? (settings?.academyNameAr || settings?.academyName || "") : (settings?.academyName || "");

  const stats = [
    { icon: Users,    value: "12K+", label: lang === "ar" ? "طالب نشط"     : "Active Students" },
    { icon: BookOpen, value: "150+", label: lang === "ar" ? "كورس متاح"    : "Courses"         },
    { icon: Star,     value: "4.9",  label: lang === "ar" ? "تقييم المنصة" : "Platform Rating" },
    { icon: Award,    value: "98%",  label: lang === "ar" ? "نسبة الرضا"   : "Satisfaction"    },
  ];

  return (
    <section
      dir={lang === "ar" ? "rtl" : "ltr"}
      className="relative min-h-screen flex items-center overflow-hidden"
    >
      {/* Brand glow blobs — شفافية خفيفة تشتغل على light و dark */}
      <motion.div
        className="absolute -top-40 -right-40 w-[700px] h-[700px] rounded-full pointer-events-none z-0"
        style={{ background: "radial-gradient(circle, rgba(var(--brand-primary-rgb, 109 40 217) / 0.12) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.06, 1], opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 9, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute -bottom-20 -left-20 w-[500px] h-[500px] rounded-full pointer-events-none z-0"
        style={{ background: "radial-gradient(circle, rgba(var(--brand-accent-rgb, 124 58 237) / 0.08) 0%, transparent 70%)" }}
        animate={{ scale: [1, 1.1, 1], opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 2 }}
      />

      {/* Subtle brand grid */}
      <div
        className="absolute inset-0 z-0 pointer-events-none"
        style={{
          backgroundImage: `linear-gradient(rgba(var(--brand-primary-rgb, 109 40 217) / 0.04) 1px, transparent 1px),
                            linear-gradient(90deg, rgba(var(--brand-primary-rgb, 109 40 217) / 0.04) 1px, transparent 1px)`,
          backgroundSize: "72px 72px",
        }}
      />

      <div className="container mx-auto px-4 md:px-8 py-32 md:py-48 relative z-10">
        <motion.div variants={stagger.container} initial="hidden" animate="show" className="max-w-5xl mx-auto">

          {/* Academy badge */}
          <motion.div variants={stagger.item} className="flex justify-center mb-8">
            <span
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium border"
              style={{
                background: "rgba(var(--brand-primary-rgb, 109 40 217) / 0.08)",
                borderColor: "rgba(var(--brand-primary-rgb, 109 40 217) / 0.25)",
                color: "var(--brand-primary, #6d28d9)",
              }}
            >
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: "var(--brand-primary, #6d28d9)" }} />
              {academyName || (lang === "ar" ? "منصة التعلم الذكي" : "Smart Learning Platform")}
            </span>
          </motion.div>

          {/* Heading — يستخدم foreground الطبيعي للـ theme */}
          <motion.h1
            variants={stagger.item}
            className="text-center font-black tracking-tighter leading-[1.05] mb-6"
            style={{ fontSize: "clamp(2.6rem, 7vw, 5.5rem)", letterSpacing: "-0.03em", color: "var(--foreground)" }}
          >
            {heroTitle ? heroTitle : lang === "ar" ? (
              <>ابدأ رحلتك<br />
                <span style={{ backgroundImage: `linear-gradient(135deg, var(--brand-primary, #6d28d9), var(--brand-accent, #7c3aed))`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  التعليمية الحقيقية
                </span>
              </>
            ) : (
              <>Learn Without<br />
                <span style={{ backgroundImage: `linear-gradient(135deg, var(--brand-primary, #6d28d9), var(--brand-accent, #7c3aed))`, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>
                  Limits
                </span>
              </>
            )}
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={stagger.item}
            className="text-center text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed"
            style={{ color: "var(--muted-foreground)" }}
          >
            {heroSubtitle || t("hero.subtitle")}
          </motion.p>

          {/* CTAs */}
          <motion.div variants={stagger.item} className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
            <button
              onClick={() => setIsModalOpen(true)}
              className="group flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-white text-base transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
              style={{
                background: `linear-gradient(135deg, var(--brand-primary, #6d28d9), var(--brand-accent, #7c3aed))`,
                boxShadow: `0 4px 24px rgba(var(--brand-primary-rgb, 109 40 217) / 0.35)`,
              }}
            >
              {heroCta}
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>

            <a
              href="#courses"
              className="flex items-center gap-3 px-8 py-4 rounded-2xl font-semibold text-base transition-all duration-200 hover:scale-[1.02] border"
              style={{ borderColor: "var(--border)", color: "var(--foreground)", background: "var(--background)" }}
            >
              <Play className="w-4 h-4" style={{ fill: "currentColor", color: "var(--brand-primary, #6d28d9)" }} />
              {t("hero.cta.explore")}
            </a>
          </motion.div>

          {/* Stats bar */}
          <motion.div
            variants={stagger.item}
            className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-2xl overflow-hidden border"
            style={{ borderColor: "var(--border)", background: "var(--border)" }}
          >
            {stats.map((stat, i) => (
              <div key={i} className="flex flex-col items-center py-6 px-4" style={{ background: "var(--card)" }}>
                <stat.icon className="w-5 h-5 mb-2" style={{ color: "var(--brand-primary, #6d28d9)" }} />
                <span className="text-2xl font-black tracking-tight" style={{ color: "var(--foreground)" }}>{stat.value}</span>
                <span className="text-xs mt-1" style={{ color: "var(--muted-foreground)" }}>{stat.label}</span>
              </div>
            ))}
          </motion.div>

        </motion.div>
      </div>

      <JoinCourseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} course={null} />
    </section>
  );
}