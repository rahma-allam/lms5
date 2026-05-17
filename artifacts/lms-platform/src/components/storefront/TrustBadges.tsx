import { useI18n } from "@/lib/i18n";
import { motion } from "framer-motion";
import { ShieldCheck, Lock, BadgeCheck } from "lucide-react";

export default function TrustBadges() {
  const { t, lang } = useI18n();

  const paymentMethods = [
    { label: "Fawry", icon: "🟡" },
    { label: "Vodafone Cash", icon: "🔴" },
    { label: "Visa", icon: null },
    { label: "Mastercard", icon: null },
    { label: "PayMob", icon: null },
  ];

  const trustPoints = [
    { icon: ShieldCheck, label: lang === "ar" ? "دفع مشفّر وآمن" : "Encrypted payments" },
    { icon: Lock,        label: lang === "ar" ? "بيانات محمية بالكامل" : "Full data privacy" },
    { icon: BadgeCheck,  label: lang === "ar" ? "ضمان استرداد المال" : "Money-back guarantee" },
  ];

  return (
    <section
      className="py-12 border-t"
      dir={lang === "ar" ? "rtl" : "ltr"}
      style={{ borderColor: "var(--border)" }}
    >
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8">

          {/* Trust points */}
          <motion.div
            className="flex flex-wrap items-center gap-6"
            initial={{ opacity: 0, x: lang === "ar" ? 20 : -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {trustPoints.map((tp, i) => (
              <div key={i} className="flex items-center gap-2">
                <tp.icon
                  className="w-4 h-4 shrink-0"
                  style={{ color: "var(--brand-primary, #6d28d9)" }}
                />
                <span className="text-sm font-medium" style={{ color: "var(--muted-foreground)" }}>
                  {tp.label}
                </span>
                {i < trustPoints.length - 1 && (
                  <span className="hidden md:inline ms-4 opacity-30" style={{ color: "var(--foreground)" }}>·</span>
                )}
              </div>
            ))}
          </motion.div>

          {/* Payment logos */}
          <motion.div
            className="flex items-center gap-4 flex-wrap justify-center md:justify-end"
            initial={{ opacity: 0, x: lang === "ar" ? -20 : 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            <span className="text-xs font-medium me-2" style={{ color: "var(--muted-foreground)" }}>
              {lang === "ar" ? "طرق الدفع المتاحة" : "Accepted payments"}
            </span>
            {paymentMethods.map((pm, i) => (
              <div
                key={i}
                className="h-8 px-3 rounded-lg flex items-center justify-center text-xs font-bold border"
                style={{
                  background: "var(--card)",
                  borderColor: "var(--border)",
                  color: "var(--foreground)",
                  opacity: 0.7,
                  minWidth: "52px",
                }}
              >
                {pm.icon ? <span className="text-base me-1">{pm.icon}</span> : null}
                {pm.label}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}