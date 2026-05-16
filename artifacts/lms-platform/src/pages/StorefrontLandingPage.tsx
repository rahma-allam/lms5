import { useState, useEffect } from "react";
import { Sun, Moon, Globe, CheckCircle, Zap, Users, BarChart3, Shield, Sparkles, GraduationCap, ChevronDown } from "lucide-react";

const PLANS_FALLBACK = [
  {
    plan: "starter",
    nameAr: "المعلم المستقل",
    nameEn: "Independent",
    descriptionAr: "للمعلمين الذين يبدأون رحلتهم في التعليم الإلكتروني",
    descriptionEn: "For educators starting their e-learning journey",
    priceMonthlyEgp: 199, priceAnnualEgp: 1590,
    priceMonthlyUsd: 999, priceAnnualUsd: 7990,
    discountAnnualPct: 20, isPopular: 0, sortOrder: 0,
    featuresAr: "رفع كورسات مسجلة|تتبع الطلاب|شات مباشر مع طلابك|لوحة تحكم كاملة|تقارير الأداء",
    featuresEn: "Upload recorded courses|Student tracking|Direct student chat|Full admin panel|Performance reports",
  },
  {
    plan: "pro",
    nameAr: "الأكاديمية",
    nameEn: "Academy",
    descriptionAr: "للأكاديميات التي تريد توسيع فريقها وتحقيق نمو حقيقي",
    descriptionEn: "For academies looking to scale their team and achieve real growth",
    priceMonthlyEgp: 399, priceAnnualEgp: 3190,
    priceMonthlyUsd: 1999, priceAnnualUsd: 15990,
    discountAnnualPct: 20, isPopular: 1, sortOrder: 1,
    featuresAr: "كل مميزات Starter|مدربون متعددون|ربط البكسلات (FB/Google/TikTok)|تعدد عملات الدفع|سعر EGP + USD للكورسات",
    featuresEn: "Everything in Starter|Multiple instructors|Pixel integrations (FB/Google/TikTok)|Multi-currency|EGP + USD course pricing",
  },
  {
    plan: "elite",
    nameAr: "المؤسسة الذكية",
    nameEn: "Enterprise AI",
    descriptionAr: "للمؤسسات التعليمية الكبرى التي تريد الهيمنة على السوق",
    descriptionEn: "For large institutions aiming to dominate the market",
    priceMonthlyEgp: 799, priceAnnualEgp: 6390,
    priceMonthlyUsd: 3999, priceAnnualUsd: 31990,
    discountAnnualPct: 20, isPopular: 0, sortOrder: 2,
    featuresAr: "كل مميزات Pro|تسويق بالذكاء الاصطناعي|رقابة شات المدربين|دومين خاص|تخصيص الهوية والألوان|أولوية الدعم الفني",
    featuresEn: "Everything in Pro|AI Marketing intelligence|Instructor chat monitoring|Custom domain|Full branding|Priority support",
  },
];

const t = (ar: string, en: string, lang: "ar" | "en") => (lang === "ar" ? ar : en);

function formatPrice(cents: number, currency: "EGP" | "USD") {
  if (currency === "EGP") return `${cents.toLocaleString()} جنيه`;
  return `$${(cents / 100).toFixed(0)}`;
}

export default function LandingPage() {
  const [lang, setLang] = useState<"ar" | "en">(() => {
    const s = localStorage.getItem("nextedu_lang");
    return s === "en" ? "en" : "ar";
  });
  const [dark, setDark] = useState(() => document.documentElement.classList.contains("dark"));
  const [billing, setBilling] = useState<"monthly" | "annual">("monthly");
  const [currency, setCurrency] = useState<"EGP" | "USD">("EGP");
  const [plans, setPlans] = useState(PLANS_FALLBACK);
  const [geoLoaded, setGeoLoaded] = useState(false);

  const dir = lang === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    localStorage.setItem("nextedu_lang", lang);
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }, [lang]);

  useEffect(() => {
    if (dark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  }, [dark]);

  useEffect(() => {
    fetch("/api/plan-pricing").then(r => r.json()).then(data => {
      if (Array.isArray(data) && data.length > 0) setPlans(data);
    }).catch(() => {});
    fetch("/api/geo").then(r => r.json()).then(data => {
      if (data.currency) { setCurrency(data.currency); setGeoLoaded(true); }
    }).catch(() => {});
  }, []);

  const toggleDark = () => setDark(d => !d);
  const toggleLang = () => setLang(l => l === "ar" ? "en" : "ar");

  const features = [
    { icon: GraduationCap, ar: "إدارة كاملة للكورسات", en: "Full Course Management" },
    { icon: Users, ar: "إدارة الطلاب والمدربين", en: "Students & Instructors" },
    { icon: BarChart3, ar: "تقارير وإحصائيات متقدمة", en: "Advanced Analytics" },
    { icon: Sparkles, ar: "تسويق بالذكاء الاصطناعي", en: "AI Marketing Intelligence" },
    { icon: Shield, ar: "نظام دفع آمن ومتعدد العملات", en: "Secure Multi-Currency Payments" },
    { icon: Zap, ar: "أداء سريع وخوادم موثوقة", en: "Fast Performance & Reliable Hosting" },
  ];

  return (
    <div dir={dir} className={`min-h-screen font-sans transition-colors ${dark ? "bg-zinc-950 text-white" : "bg-white text-zinc-900"}`}
      style={{ fontFamily: lang === "ar" ? "'Cairo', 'Inter', sans-serif" : "'Inter', sans-serif" }}>

      {lang === "ar" && (
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;500;600;700;800&display=swap" />
      )}

      {/* Navbar */}
      <nav className={`sticky top-0 z-50 border-b backdrop-blur-md ${dark ? "bg-zinc-950/80 border-zinc-800" : "bg-white/80 border-zinc-100"}`}>
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center">
              <GraduationCap className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">NextEdu</span>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={toggleLang}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${dark ? "hover:bg-zinc-800 text-zinc-300" : "hover:bg-zinc-100 text-zinc-600"}`}>
              <Globe className="w-4 h-4" />
              {lang === "ar" ? "EN" : "AR"}
            </button>
            <button onClick={toggleDark}
              className={`p-2 rounded-lg transition-colors ${dark ? "hover:bg-zinc-800 text-zinc-300" : "hover:bg-zinc-100 text-zinc-600"}`}>
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <a href="/login"
              className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-purple-700 text-white text-sm font-semibold shadow hover:opacity-90 transition-opacity">
              {t("تسجيل الدخول", "Sign In", lang)}
            </a>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-28 px-4">
        <div className="absolute inset-0 pointer-events-none">
          <div className={`absolute top-[-100px] ${lang === "ar" ? "left-[-100px]" : "right-[-100px]"} w-[500px] h-[500px] rounded-full opacity-10 bg-violet-600 blur-3xl`} />
          <div className={`absolute bottom-0 ${lang === "ar" ? "right-0" : "left-0"} w-[400px] h-[400px] rounded-full opacity-10 bg-purple-500 blur-3xl`} />
        </div>
        <div className="relative max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-violet-200 dark:border-violet-800 bg-violet-50 dark:bg-violet-950/40 text-violet-700 dark:text-violet-300 text-sm font-medium mb-6">
            <Sparkles className="w-3.5 h-3.5" />
            {t("النظام الأول من نوعه في المنطقة", "The First of Its Kind in the Region", lang)}
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
            {t("المنصة التعليمية", "The Smart Learning", lang)}{" "}
            <span className="bg-gradient-to-r from-violet-600 to-purple-500 bg-clip-text text-transparent">
              {t("الذكية", "Platform", lang)}
            </span>
            {lang === "ar" && <><br />{t("لجيل القادة", "", lang)}</>}
          </h1>
          <p className={`text-xl mb-10 max-w-2xl mx-auto leading-relaxed ${dark ? "text-zinc-400" : "text-zinc-500"}`}>
            {t(
              "أنشئ أكاديميتك، أدر طلابك ومدربيك، واحقق نمواً حقيقياً بأدوات ذكاء اصطناعي متطورة",
              "Build your academy, manage students and instructors, and achieve real growth with advanced AI tools",
              lang
            )}
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a href="#pricing"
              className="px-7 py-3.5 rounded-xl bg-gradient-to-r from-violet-600 to-purple-700 text-white font-bold text-base shadow-lg hover:shadow-violet-500/30 hover:opacity-95 transition-all">
              {t("ابدأ الآن", "Get Started", lang)}
            </a>
            <a href="#features"
              className={`px-7 py-3.5 rounded-xl border font-semibold text-base transition-colors ${dark ? "border-zinc-700 hover:bg-zinc-800 text-zinc-200" : "border-zinc-200 hover:bg-zinc-50 text-zinc-700"}`}>
              {t("اكتشف المميزات", "Explore Features", lang)}
            </a>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className={`py-20 px-4 ${dark ? "bg-zinc-900" : "bg-zinc-50"}`}>
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-extrabold mb-3">
              {t("كل ما تحتاجه في مكان واحد", "Everything You Need in One Place", lang)}
            </h2>
            <p className={`text-base ${dark ? "text-zinc-400" : "text-zinc-500"}`}>
              {t("أدوات احترافية مصممة خصيصاً للمعلمين والأكاديميات", "Professional tools designed specifically for educators and academies", lang)}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <div key={i}
                className={`p-6 rounded-2xl border transition-all hover:shadow-md ${dark ? "bg-zinc-800 border-zinc-700 hover:border-violet-700" : "bg-white border-zinc-100 hover:border-violet-200 hover:shadow-violet-50"}`}>
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/40 dark:to-purple-900/40 flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                </div>
                <h3 className="font-bold text-base mb-1.5">{lang === "ar" ? f.ar : f.en}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold mb-3">
              {t("باقات مرنة لكل احتياج", "Flexible Plans for Every Need", lang)}
            </h2>
            <p className={`text-base mb-8 ${dark ? "text-zinc-400" : "text-zinc-500"}`}>
              {t("ابدأ مجاناً وتوسّع حسب نموك", "Start free and scale as you grow", lang)}
            </p>

            {/* Billing + Currency toggles */}
            <div className="flex flex-wrap items-center justify-center gap-4 mb-4">
              {/* Billing toggle */}
              <div className={`flex rounded-xl p-1 ${dark ? "bg-zinc-800" : "bg-zinc-100"}`}>
                <button onClick={() => setBilling("monthly")}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${billing === "monthly" ? "bg-violet-600 text-white shadow" : (dark ? "text-zinc-400 hover:text-white" : "text-zinc-500 hover:text-zinc-900")}`}>
                  {t("شهري", "Monthly", lang)}
                </button>
                <button onClick={() => setBilling("annual")}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all flex items-center gap-2 ${billing === "annual" ? "bg-violet-600 text-white shadow" : (dark ? "text-zinc-400 hover:text-white" : "text-zinc-500 hover:text-zinc-900")}`}>
                  {t("سنوي", "Annual", lang)}
                  <span className="text-[10px] font-bold bg-emerald-500 text-white px-1.5 py-0.5 rounded-full">
                    -{plans[0]?.discountAnnualPct ?? 20}%
                  </span>
                </button>
              </div>
              {/* Currency toggle */}
              <div className={`flex rounded-xl p-1 ${dark ? "bg-zinc-800" : "bg-zinc-100"}`}>
                {(["EGP", "USD"] as const).map(c => (
                  <button key={c} onClick={() => setCurrency(c)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${currency === c ? "bg-violet-600 text-white shadow" : (dark ? "text-zinc-400 hover:text-white" : "text-zinc-500 hover:text-zinc-900")}`}>
                    {c === "EGP" ? "🇪🇬 EGP" : "🌍 USD"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((p) => {
              const isPopular = Boolean(p.isPopular);
              const monthly = currency === "EGP" ? p.priceMonthlyEgp : p.priceMonthlyUsd;
              const annual = currency === "EGP" ? p.priceAnnualEgp : p.priceAnnualUsd;
              const displayPrice = billing === "monthly" ? monthly : annual;
              const featureStr = lang === "ar" ? p.featuresAr : p.featuresEn;
              const featureList = (featureStr ?? "").split("|").filter(Boolean);

              return (
                <div key={p.plan}
                  className={`relative rounded-2xl border p-7 flex flex-col transition-all ${isPopular
                    ? "border-violet-500 shadow-xl shadow-violet-500/10 bg-gradient-to-b from-violet-600 to-purple-700 text-white"
                    : dark
                    ? "border-zinc-700 bg-zinc-800 hover:border-violet-700 text-white"
                    : "border-zinc-200 bg-white hover:border-violet-200 hover:shadow-md text-zinc-900"
                  }`}>
                  {isPopular && (
                    <div className={`absolute -top-3.5 ${lang === "ar" ? "right-6" : "left-6"} px-3 py-1 rounded-full bg-amber-400 text-amber-900 text-xs font-bold shadow`}>
                      {t("الأكثر طلباً", "Most Popular", lang)}
                    </div>
                  )}

                  <div className="mb-6">
                    <h3 className="text-xl font-extrabold mb-1">
                      {lang === "ar" ? p.nameAr : p.nameEn}
                    </h3>
                    <p className={`text-sm leading-relaxed ${isPopular ? "text-violet-200" : dark ? "text-zinc-400" : "text-zinc-500"}`}>
                      {lang === "ar" ? p.descriptionAr : p.descriptionEn}
                    </p>
                  </div>

                  <div className="mb-6">
                    <div className="flex items-end gap-1">
                      <span className="text-4xl font-extrabold">
                        {currency === "USD" ? `$${(displayPrice / 100).toFixed(0)}` : displayPrice.toLocaleString()}
                      </span>
                      <span className={`text-sm mb-1 ${isPopular ? "text-violet-200" : dark ? "text-zinc-400" : "text-zinc-500"}`}>
                        {currency === "EGP" ? " جنيه" : ""} / {t(billing === "monthly" ? "شهر" : "سنة", billing === "monthly" ? "mo" : "yr", lang)}
                      </span>
                    </div>
                    {billing === "annual" && (
                      <p className={`text-xs mt-1 ${isPopular ? "text-violet-200" : "text-emerald-500"}`}>
                        {t(`وفّر ${p.discountAnnualPct}% مع الباقة السنوية`, `Save ${p.discountAnnualPct}% with annual billing`, lang)}
                      </p>
                    )}
                  </div>

                  <ul className="space-y-2.5 mb-8 flex-1">
                    {featureList.map((f, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm">
                        <CheckCircle className={`w-4 h-4 mt-0.5 shrink-0 ${isPopular ? "text-violet-200" : "text-violet-500"}`} />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>

                  <a href="/login"
                    className={`w-full py-3 rounded-xl text-center font-bold text-sm transition-all ${isPopular
                      ? "bg-white text-violet-700 hover:bg-violet-50 shadow"
                      : "bg-gradient-to-r from-violet-600 to-purple-700 text-white hover:opacity-90 shadow"
                    }`}>
                    {t("ابدأ الآن", "Get Started", lang)}
                  </a>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      <section className={`py-20 px-4 ${dark ? "bg-zinc-900" : "bg-zinc-50"}`}>
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-extrabold mb-4">
            {t("جاهز لإطلاق أكاديميتك؟", "Ready to Launch Your Academy?", lang)}
          </h2>
          <p className={`mb-8 text-base ${dark ? "text-zinc-400" : "text-zinc-500"}`}>
            {t("انضم إلى مئات الأكاديميات التي تثق في NextEdu", "Join hundreds of academies that trust NextEdu", lang)}
          </p>
          <a href="/login"
            className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-purple-700 text-white font-bold text-base shadow-xl hover:shadow-violet-500/30 hover:opacity-95 transition-all">
            <Zap className="w-4 h-4" />
            {t("ابدأ تجربتك المجانية", "Start Your Free Trial", lang)}
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className={`py-10 px-4 border-t text-sm ${dark ? "bg-zinc-950 border-zinc-800 text-zinc-500" : "bg-white border-zinc-100 text-zinc-400"}`}>
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center">
              <GraduationCap className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-bold text-base">NextEdu</span>
          </div>
          <p>{t("© 2026 NextEdu. جميع الحقوق محفوظة.", "© 2026 NextEdu. All rights reserved.", lang)}</p>
          <div className="flex items-center gap-4">
            <button onClick={toggleLang} className="hover:text-violet-500 transition-colors">
              {lang === "ar" ? "English" : "العربية"}
            </button>
            <button onClick={toggleDark} className="hover:text-violet-500 transition-colors">
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
