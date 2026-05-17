import { useI18n } from "@/lib/i18n";
import { motion } from "framer-motion";
import { UserPlus, CreditCard, Laptop } from "lucide-react";

export default function HowItWorks() {
  const { t, lang } = useI18n();

  const steps = [
    { icon: UserPlus, titleKey: "howitworks.step1", descKey: "howitworks.step1.desc" },
    { icon: CreditCard, titleKey: "howitworks.step2", descKey: "howitworks.step2.desc" },
    { icon: Laptop, titleKey: "howitworks.step3", descKey: "howitworks.step3.desc" },
  ];

  return (
    <section
      className="py-28 relative overflow-hidden"
      dir={lang === "ar" ? "rtl" : "ltr"}
      style={{ background: "var(--brand-primary, #6d28d9)" }}
    >
      {/* Subtle dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(rgba(255,255,255,0.12) 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />
      {/* Top/bottom fades */}
      <div className="absolute inset-x-0 top-0 h-24 pointer-events-none"
        style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.15), transparent)" }} />
      <div className="absolute inset-x-0 bottom-0 h-24 pointer-events-none"
        style={{ background: "linear-gradient(to top, rgba(0,0,0,0.15), transparent)" }} />

      <div className="container mx-auto px-4 md:px-8 relative z-10">

        {/* Header */}
        <div className="text-center mb-20">
          <motion.p
            className="text-sm font-semibold uppercase tracking-widest mb-3 opacity-60"
            style={{ color: "#fff" }}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 0.6, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {lang === "ar" ? "خطوات بسيطة" : "Simple Steps"}
          </motion.p>
          <motion.h2
            className="text-4xl md:text-5xl font-black tracking-tight text-white"
            style={{ letterSpacing: "-0.03em" }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.05 }}
          >
            {t("howitworks.title")}
          </motion.h2>
          <motion.p
            className="mt-4 text-lg max-w-xl mx-auto"
            style={{ color: "rgba(255,255,255,0.65)" }}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.12 }}
          >
            {t("howitworks.subtitle")}
          </motion.p>
        </div>

        {/* Steps */}
        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8">
          {/* Connector line (desktop only) */}
          <div className="hidden md:block absolute top-10 left-[16.67%] right-[16.67%] h-[1px]"
            style={{ background: "rgba(255,255,255,0.2)", zIndex: 0 }} />

          {steps.map((step, i) => (
            <motion.div
              key={i}
              className="relative flex flex-col items-center text-center z-10"
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Step circle */}
              <div className="relative mb-8">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center"
                  style={{
                    background: "rgba(255,255,255,0.12)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(255,255,255,0.2)",
                  }}
                >
                  <step.icon className="w-9 h-9 text-white" />
                </div>
                {/* Step number badge */}
                <div
                  className="absolute -top-3 -right-3 w-7 h-7 rounded-full flex items-center justify-center text-xs font-black"
                  style={{
                    background: "#fff",
                    color: "var(--brand-primary, #6d28d9)",
                    boxShadow: "0 0 0 3px var(--brand-primary, #6d28d9)",
                  }}
                >
                  {String(i + 1).padStart(2, "0")}
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-3" style={{ letterSpacing: "-0.02em" }}>
                {t(step.titleKey)}
              </h3>
              <p className="text-sm leading-relaxed max-w-xs" style={{ color: "rgba(255,255,255,0.65)" }}>
                {t(step.descKey)}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}