import { useI18n } from "@/lib/i18n";
import { motion } from "framer-motion";
import { Star, Quote } from "lucide-react";

export default function Testimonials() {
  const { t, lang } = useI18n();

  const testimonials = [
    {
      nameEn: "Ahmed Hassan", nameAr: "أحمد حسن",
      roleEn: "Software Engineer", roleAr: "مهندس برمجيات",
      quoteEn: "The quality here is unmatched. I learned more in 3 months than I did in an entire year at university. The platform is incredibly intuitive.",
      quoteAr: "جودة الكورسات هنا لا مثيل لها. تعلمت في 3 أشهر أكثر مما تعلمته في عام كامل في الجامعة.",
      initials: "AH", rating: 5,
    },
    {
      nameEn: "Sarah Mahmoud", nameAr: "سارة محمود",
      roleEn: "Working Mother & Designer", roleAr: "أم عاملة ومصممة",
      quoteEn: "As a working mother, flexibility is everything. This platform let me study at my own pace with world-class instructors. Life-changing.",
      quoteAr: "كأم عاملة، المرونة هي الأساس. المنصة أتاحت لي الدراسة بالسرعة التي تناسبني مع مدربين على مستوى عالمي.",
      initials: "SM", rating: 5,
    },
    {
      nameEn: "Omar Tariq", nameAr: "عمر طارق",
      roleEn: "Entrepreneur", roleAr: "رائد أعمال",
      quoteEn: "Secure payments, HD video, and practical content. Exactly what serious learners need to advance their careers quickly.",
      quoteAr: "دفع آمن، فيديو عالي الدقة، محتوى عملي. بالضبط ما يحتاجه المتعلم الجاد للنجاح.",
      initials: "OT", rating: 5,
    },
  ];

  return (
    <section
      id="testimonials"
      className="py-28 relative overflow-hidden"
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      {/* Subtle background pattern */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.018]"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            var(--foreground) 0,
            var(--foreground) 1px,
            transparent 0,
            transparent 50%
          )`,
          backgroundSize: "24px 24px",
        }}
      />

      <div className="container mx-auto px-4 md:px-8 relative z-10">

        {/* Section header */}
        <div className="mb-16 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          >
            <p
              className="text-sm font-semibold uppercase tracking-widest mb-3"
              style={{ color: "var(--brand-primary, #6d28d9)" }}
            >
              {lang === "ar" ? "قالوا عنّا" : "Social Proof"}
            </p>
            <h2
              className="text-4xl md:text-5xl font-black tracking-tight"
              style={{ letterSpacing: "-0.03em" }}
            >
              {t("testimonials.title")}
            </h2>
          </motion.div>

          {/* Star rating aggregate */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="flex items-center gap-3"
          >
            <div className="flex gap-1">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-5 h-5 fill-current" style={{ color: "#f59e0b" }} />
              ))}
            </div>
            <div>
              <span className="font-black text-2xl" style={{ letterSpacing: "-0.03em" }}>4.9</span>
              <span className="text-sm ms-1" style={{ color: "var(--muted-foreground)" }}>/ 5.0</span>
            </div>
          </motion.div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, i) => (
            <motion.div
              key={i}
              className="group relative flex flex-col p-8 rounded-3xl border"
              style={{
                background: i === 1
                  ? `linear-gradient(145deg, var(--brand-primary, #6d28d9), var(--brand-accent, #7c3aed))`
                  : "var(--card)",
                borderColor: i === 1 ? "transparent" : "var(--border)",
                boxShadow: i === 1 ? `0 20px 60px rgba(var(--brand-primary-rgb, 109 40 217) / 0.35)` : "none",
              }}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.65, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
            >
              {/* Quote icon */}
              <Quote
                className="w-8 h-8 mb-6 shrink-0"
                style={{ color: i === 1 ? "rgba(255,255,255,0.5)" : "var(--brand-primary, #6d28d9)", fill: "currentColor" }}
              />

              {/* Stars */}
              <div className="flex gap-1 mb-6">
                {[...Array(testimonial.rating)].map((_, si) => (
                  <Star
                    key={si}
                    className="w-4 h-4 fill-current"
                    style={{ color: i === 1 ? "rgba(255,255,255,0.9)" : "#f59e0b" }}
                  />
                ))}
              </div>

              {/* Quote text */}
              <p
                className="text-base leading-relaxed flex-1 mb-8"
                style={{ color: i === 1 ? "rgba(255,255,255,0.9)" : "var(--muted-foreground)" }}
              >
                "{lang === "en" ? testimonial.quoteEn : testimonial.quoteAr}"
              </p>

              {/* Author */}
              <div className="flex items-center gap-3 mt-auto">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shrink-0"
                  style={i === 1 ? {
                    background: "rgba(255,255,255,0.2)",
                    color: "#fff",
                  } : {
                    background: `rgba(var(--brand-primary-rgb, 109 40 217) / 0.1)`,
                    color: "var(--brand-primary, #6d28d9)",
                  }}
                >
                  {testimonial.initials}
                </div>
                <div>
                  <p
                    className="font-bold text-sm"
                    style={{ color: i === 1 ? "#fff" : "var(--foreground)" }}
                  >
                    {lang === "en" ? testimonial.nameEn : testimonial.nameAr}
                  </p>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: i === 1 ? "rgba(255,255,255,0.6)" : "var(--muted-foreground)" }}
                  >
                    {lang === "en" ? testimonial.roleEn : testimonial.roleAr}
                  </p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}