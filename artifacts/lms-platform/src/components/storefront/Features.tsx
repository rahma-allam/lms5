import { useI18n } from "@/lib/i18n";
import { motion } from "framer-motion";
import { Shield, TrendingUp, CreditCard, Zap, Clock, HeadphonesIcon } from "lucide-react";

const fadeUp = (delay = 0) => ({
  hidden: { opacity: 0, y: 32 },
  show: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1], delay } },
});

export default function Features() {
  const { t, lang } = useI18n();

  const features = [
    { icon: Shield,          titleKey: "feature.1.title", descKey: "feature.1.desc", num: "01" },
    { icon: TrendingUp,      titleKey: "feature.2.title", descKey: "feature.2.desc", num: "02" },
    { icon: CreditCard,      titleKey: "feature.3.title", descKey: "feature.3.desc", num: "03" },
    { icon: Zap,             titleKey: "feature.4.title", descKey: "feature.4.desc", num: "04" },
    { icon: Clock,           titleKey: "feature.5.title", descKey: "feature.5.desc", num: "05" },
    { icon: HeadphonesIcon,  titleKey: "feature.6.title", descKey: "feature.6.desc", num: "06" },
  ];

  return (
    <section id="features" className="py-28" dir={lang === "ar" ? "rtl" : "ltr"}>
      <div className="container mx-auto px-4 md:px-8">

        {/* Section header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
          <motion.div variants={fadeUp()} initial="hidden" whileInView="show" viewport={{ once: true }}>
            <p
              className="text-sm font-semibold uppercase tracking-widest mb-3"
              style={{ color: "var(--brand-primary, #6d28d9)" }}
            >
              {lang === "ar" ? "مميزاتنا" : "Why Us"}
            </p>
            <h2
              className="text-4xl md:text-5xl font-black tracking-tight leading-tight"
              style={{ letterSpacing: "-0.03em" }}
            >
              {t("features.title")}
            </h2>
          </motion.div>
          <motion.p
            variants={fadeUp(0.1)}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="md:max-w-xs text-base leading-relaxed"
            style={{ color: "var(--muted-foreground)" }}
          >
            {t("features.subtitle")}
          </motion.p>
        </div>

        {/* Feature grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px"
          style={{ background: "var(--border)", borderRadius: "1.25rem", overflow: "hidden" }}>
          {features.map((f, i) => (
            <motion.div
              key={i}
              variants={fadeUp(i * 0.07)}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true }}
              className="group relative p-8 flex flex-col gap-4 transition-colors duration-300"
              style={{ background: "var(--card)" }}
            >
              {/* Number watermark */}
              <span
                className="absolute top-5 right-6 text-6xl font-black opacity-[0.04] select-none"
                style={{ lineHeight: 1, color: "var(--brand-primary, #6d28d9)" }}
              >
                {f.num}
              </span>

              {/* Icon */}
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center transition-colors duration-300 group-hover:scale-110"
                style={{
                  background: "rgba(var(--brand-primary-rgb, 109 40 217) / 0.1)",
                  color: "var(--brand-primary, #6d28d9)",
                  transform: "translateZ(0)",
                  transition: "transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
                }}
              >
                <f.icon className="w-5 h-5" />
              </div>

              {/* Title */}
              <h3 className="text-lg font-bold" style={{ letterSpacing: "-0.02em" }}>
                {t(f.titleKey)}
              </h3>

              {/* Desc */}
              <p className="text-sm leading-relaxed" style={{ color: "var(--muted-foreground)" }}>
                {t(f.descKey)}
              </p>

              {/* Hover accent line */}
              <div
                className="absolute bottom-0 left-0 h-[2px] w-0 group-hover:w-full transition-all duration-500"
                style={{ background: `linear-gradient(90deg, var(--brand-primary, #6d28d9), var(--brand-accent, #7c3aed))` }}
              />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}