import { useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { useQueryClient, useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Settings, Megaphone, Globe, KeyRound, Building2, CreditCard, ToggleLeft, ToggleRight, Palette } from "lucide-react";

interface SettingsForm {
  academyName: string;
  academyNameAr: string;
  logoUrl: string;
  metaPixelId: string;
  metaConversionToken: string;
  googleTagId: string;
  googleApiSecret: string;
  tiktokPixelId: string;
  tiktokAccessToken: string;
  defaultLanguage: "en" | "ar";
  currency: string;
  manualPaymentInstructions: string;
  primaryColor: string;
  accentColor: string;
}

function fetchWithAuth(url: string, options?: RequestInit) {
  const token = localStorage.getItem("lms_admin_token");
  const tenant = localStorage.getItem("tenant_slug");
  const sep = url.includes("?") ? "&" : "?";
  return fetch(`${url}${tenant ? `${sep}tenant=${tenant}` : ""}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers ?? {}),
    },
  });
}

function PixelSection({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="border border-border rounded-lg p-4 space-y-3">
      <div className="flex items-center gap-2">{icon}<span className="text-sm font-medium">{title}</span></div>
      {children}
    </div>
  );
}

function FieldRow({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
    </div>
  );
}

export default function SettingsPage() {
  const { t } = useI18n();
  const qc = useQueryClient();

  const { data: settings, isLoading } = useQuery<Record<string, any>>({
    queryKey: ["/api/settings"],
    queryFn: () => fetchWithAuth("/api/settings").then((r) => r.json()),
  });

  const updateSettings = useMutation({
    mutationFn: (body: Record<string, any>) =>
      fetchWithAuth("/api/settings", {
        method: "PUT",
        body: JSON.stringify(body),
      }).then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error || "Failed");
        return r.json();
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["/api/settings"] });
      qc.invalidateQueries({ queryKey: ["/api/storefront/settings"] });
      toast.success("Settings saved");
    },
    onError: (e: any) => toast.error(e.message || "Failed to save settings"),
  });

  const { register, handleSubmit, reset, setValue, watch, getValues } = useForm<SettingsForm>();
  const [logoUploading, setLogoUploading] = useState(false);
  const logoUrl = watch("logoUrl");

  useEffect(() => {
    if (settings) {
      reset({
        academyName: settings.academyName,
        academyNameAr: settings.academyNameAr ?? "",
        logoUrl: settings.logoUrl ?? "",
        metaPixelId: settings.metaPixelId ?? "",
        metaConversionToken: settings.metaConversionToken ?? "",
        googleTagId: settings.googleTagId ?? "",
        googleApiSecret: settings.googleApiSecret ?? "",
        tiktokPixelId: settings.tiktokPixelId ?? "",
        tiktokAccessToken: settings.tiktokAccessToken ?? "",
        defaultLanguage: settings.defaultLanguage,
        currency: settings.currency,
        manualPaymentInstructions: settings.manualPaymentInstructions ?? "",
        primaryColor: settings.primaryColor ?? "#6d28d9",
        accentColor: settings.accentColor ?? "#7c3aed",
      });
    }
  }, [settings, reset]);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-40 bg-card border border-card-border rounded-xl animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-xl font-bold">{t("settings")}</h1>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const data = getValues();
          updateSettings.mutate({
            academyName: data.academyName || settings?.academyName || "",
            academyNameAr: data.academyNameAr || settings?.academyNameAr || null,
            logoUrl: data.logoUrl || settings?.logoUrl || null,
            metaPixelId: data.metaPixelId || settings?.metaPixelId || null,
            metaConversionToken: data.metaConversionToken || settings?.metaConversionToken || null,
            googleTagId: data.googleTagId || settings?.googleTagId || null,
            googleApiSecret: data.googleApiSecret || settings?.googleApiSecret || null,
            tiktokPixelId: data.tiktokPixelId || settings?.tiktokPixelId || null,
            tiktokAccessToken: data.tiktokAccessToken || settings?.tiktokAccessToken || null,
            defaultLanguage: data.defaultLanguage || settings?.defaultLanguage || "en",
            currency: data.currency || settings?.currency || "USD",
            manualPaymentInstructions: data.manualPaymentInstructions || settings?.manualPaymentInstructions || null,
            primaryColor: data.primaryColor || settings?.primaryColor || "#6d28d9",
            accentColor: data.accentColor || settings?.accentColor || "#7c3aed",
          });
        }}
        className="space-y-6"
      >
        {/* General Settings */}
        <div className="bg-card border border-card-border rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Settings className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold">{t("generalSettings")}</h2>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">{t("academyName")} *</label>
              <Input {...register("academyName", { required: true })} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium">{t("academyNameAr")}</label>
              <Input {...register("academyNameAr")} className="mt-1" dir="rtl" placeholder="اسم الأكاديمية" />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">{t("logoUrl")}</label>
            <div className="mt-1 flex items-center gap-3">
              {/* Preview */}
              <div className="w-12 h-12 rounded-lg border border-border bg-muted flex items-center justify-center shrink-0 overflow-hidden">
                {logoUrl ? (
                  <img src={logoUrl} alt="logo" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-muted-foreground text-xs">Logo</span>
                )}
              </div>
              {/* Upload button */}
              <label className="cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={logoUploading}
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    setLogoUploading(true);
                    try {
                      const token = localStorage.getItem("lms_admin_token");
                      const tenant = localStorage.getItem("tenant_slug");
                      const fd = new FormData();
                      fd.append("logo", file);
                      const sep = tenant ? `?tenant=${tenant}` : "";
                      const res = await fetch(`/api/settings/upload-logo${sep}`, {
                        method: "POST",
                        headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                        body: fd,
                      });
                      const data = await res.json();
                      if (data.logoUrl) {
                        setValue("logoUrl", data.logoUrl, { shouldDirty: true });
                        toast.success("Logo uploaded!");
                      } else {
                        toast.error(data.error || "Upload failed");
                      }
                    } catch {
                      toast.error("Upload failed");
                    } finally {
                      setLogoUploading(false);
                    }
                  }}
                />
                <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-border text-sm font-medium transition-colors ${logoUploading ? "opacity-50 cursor-not-allowed" : "hover:bg-accent cursor-pointer"}`}>
                  {logoUploading ? "Uploading…" : "Upload Image"}
                </span>
              </label>
              {/* أو ادخل الرابط يدوياً */}
              <Input {...register("logoUrl")} className="flex-1" placeholder="or paste URL…" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">{t("defaultLanguage")}</label>
              <select {...register("defaultLanguage")} className="mt-1 w-full h-9 px-3 border border-input rounded-md bg-background text-sm">
                <option value="en">English</option>
                <option value="ar">العربية</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">{t("currency")}</label>
              <select {...register("currency")} className="mt-1 w-full h-9 px-3 border border-input rounded-md bg-background text-sm">
                <option value="USD">USD ($)</option>
                <option value="SAR">SAR (ر.س)</option>
                <option value="AED">AED (د.إ)</option>
                <option value="EGP">EGP (ج.م)</option>
                <option value="KWD">KWD (د.ك)</option>
                <option value="EUR">EUR (€)</option>
              </select>
            </div>
          </div>

          {/* ✅ Manual Payment Instructions */}
          <div>
            <label className="text-sm font-medium">Manual Payment Instructions</label>
            <textarea
              {...register("manualPaymentInstructions")}
              className="mt-1 w-full min-h-[80px] px-3 py-2 border border-input rounded-md bg-background text-sm resize-y"
              placeholder="أرسل المبلغ على الحساب رقم ..."
              dir="auto"
            />
            <p className="text-[11px] text-muted-foreground mt-1">تظهر للطالب عند اختيار الدفع اليدوي</p>
          </div>
        </div>

        {/* Marketing Pixels */}
        <div className="bg-card border border-card-border rounded-xl p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Megaphone className="w-4 h-4 text-primary" />
            <h2 className="text-sm font-semibold">{t("marketingPixels")}</h2>
          </div>
          <p className="text-xs text-muted-foreground">{t("pixelsDesc")}</p>

          <div className="space-y-4 pt-1">
            <PixelSection
              icon={<div className="w-6 h-6 rounded bg-blue-600 flex items-center justify-center shrink-0"><span className="text-white text-[10px] font-bold">f</span></div>}
              title="Meta (Facebook) Pixel"
            >
              <FieldRow label="Pixel ID" hint="Fires PageView on every page and Purchase on successful payments.">
                <Input {...register("metaPixelId")} placeholder="e.g. 1234567890123456" className="font-mono text-xs" />
              </FieldRow>
              <FieldRow label="Conversions API Access Token" hint="Server-side Purchase event via Conversions API.">
                <div className="relative">
                  <KeyRound className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
                  <Input {...register("metaConversionToken")} type="password" placeholder="EAAxxxxxxxxxxxxxxxx..." className="font-mono text-xs pl-8" />
                </div>
              </FieldRow>
            </PixelSection>

            <PixelSection
              icon={<div className="w-6 h-6 rounded bg-red-500 flex items-center justify-center shrink-0"><Globe className="w-3.5 h-3.5 text-white" /></div>}
              title="Google Tag / Google Analytics"
            >
              <FieldRow label="Tag ID" hint="Use GTM-XXXXXXX for Google Tag Manager, or G-XXXXXXXXXX for GA4.">
                <Input {...register("googleTagId")} placeholder="GTM-XXXXXXX  or  G-XXXXXXXXXX" className="font-mono text-xs" />
              </FieldRow>
              <FieldRow label="GA4 Measurement Protocol API Secret" hint="Required for server-side purchase events.">
                <div className="relative">
                  <KeyRound className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
                  <Input {...register("googleApiSecret")} type="password" placeholder="api_secret value" className="font-mono text-xs pl-8" />
                </div>
              </FieldRow>
            </PixelSection>

            <PixelSection
              icon={<div className="w-6 h-6 rounded bg-black flex items-center justify-center shrink-0"><span className="text-white text-[10px] font-bold">T</span></div>}
              title="TikTok Pixel"
            >
              <FieldRow label="Pixel ID" hint="Fires PageView and CompletePayment on successful payments.">
                <Input {...register("tiktokPixelId")} placeholder="Enter your TikTok Pixel ID" className="font-mono text-xs" />
              </FieldRow>
              <FieldRow label="Events API Access Token" hint="Server-side CompletePayment event via TikTok Events API.">
                <div className="relative">
                  <KeyRound className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-muted-foreground" />
                  <Input {...register("tiktokAccessToken")} type="password" placeholder="TikTok Events API access token" className="font-mono text-xs pl-8" />
                </div>
              </FieldRow>
            </PixelSection>
          </div>
        </div>

        <AcademyProfileSection />
        <PaymobSection settings={settings} />
        <BrandColorsSection register={register} watch={watch} setValue={setValue} />

        <Button type="submit" className="w-full" disabled={updateSettings.isPending}>
          {updateSettings.isPending ? t("loading") : t("saveSettings")}
        </Button>
      </form>
    </div>
  );
}

function AcademyProfileSection() {
  const { t } = useI18n();
  const [profile, setProfile] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    // ✅ fetchWithAuth بدل fetch العادي
    fetchWithAuth("/api/academy-profile")
      .then((r) => r.ok ? r.json() : {})
      .then((data) => setProfile(data ?? {}))
      .catch(() => {});
  }, []);

  const handleChange = (key: string, value: string) => {
    setProfile((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetchWithAuth("/api/academy-profile", {
        method: "PUT",
        body: JSON.stringify(profile),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      toast.success("Academy profile saved");
    } catch {
      toast.error("Failed to save profile");
    } finally {
      setSaving(false);
    }
  };

  const textFields: { key: string; label: string; dir?: "rtl" }[] = [
    { key: "heroTitleEn", label: t("heroTitle") },
    { key: "heroTitleAr", label: t("heroTitleAr"), dir: "rtl" },
    { key: "heroSubtitleEn", label: t("heroSubtitle") },
    { key: "heroSubtitleAr", label: t("heroSubtitleAr"), dir: "rtl" },
    { key: "heroCtaEn", label: t("heroCta") },
    { key: "heroCtaAr", label: t("heroCtaAr"), dir: "rtl" },
    { key: "aboutEn", label: t("aboutEn") },
    { key: "aboutAr", label: t("aboutAr"), dir: "rtl" },
    { key: "address", label: t("address") },
    { key: "addressAr", label: t("addressAr"), dir: "rtl" },
    { key: "phone", label: "Phone" },
    { key: "email", label: "Email" },
    { key: "whatsapp", label: t("whatsapp") },
    { key: "facebookUrl", label: t("facebookUrl") },
    { key: "instagramUrl", label: t("instagramUrl") },
    { key: "youtubeUrl", label: t("youtubeUrl") },
    { key: "twitterUrl", label: t("twitterUrl") },
  ];

  return (
    <div className="bg-card border border-card-border rounded-xl p-5 space-y-4">
      <div className="flex items-center gap-2 mb-1">
        <Building2 className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-semibold">{t("academyProfile")}</h2>
      </div>
      <p className="text-xs text-muted-foreground">{t("academyProfileDesc")}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        {textFields.map(({ key, label, dir }) => (
          <div key={key} className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</label>
            <Input value={profile[key] ?? ""} onChange={(e) => handleChange(key, e.target.value)} dir={dir} placeholder={label} className="text-sm" />
          </div>
        ))}
      </div>
      <Button type="button" variant="secondary" size="sm" onClick={handleSave} disabled={saving}>
        {saved ? "✓ Saved" : saving ? t("loading") : t("saveSettings")}
      </Button>
    </div>
  );
}
// ─── Brand Colors Section ─────────────────────────────────────────────────────
function BrandColorsSection({
  register,
  watch,
  setValue,
}: {
  register: any;
  watch: any;
  setValue: any;
}) {
  const primaryColor = watch("primaryColor") || "#6d28d9";
  const accentColor  = watch("accentColor")  || "#7c3aed";

  // معاينة فورية على الصفحة
  const applyPreview = (primary: string, accent: string) => {
    document.documentElement.style.setProperty("--brand-primary", primary);
    document.documentElement.style.setProperty("--brand-accent", accent);
    const toRgb = (hex: string) => {
      const h = hex.replace("#", "");
      return `${parseInt(h.slice(0,2),16)} ${parseInt(h.slice(2,4),16)} ${parseInt(h.slice(4,6),16)}`;
    };
    document.documentElement.style.setProperty("--brand-primary-rgb", toRgb(primary));
    document.documentElement.style.setProperty("--brand-accent-rgb",  toRgb(accent));
  };

  const PRESETS = [
    { label: "بنفسجي",  primary: "#6d28d9", accent: "#7c3aed" },
    { label: "أزرق",    primary: "#1d4ed8", accent: "#2563eb" },
    { label: "أخضر",   primary: "#059669", accent: "#10b981" },
    { label: "برتقالي", primary: "#d97706", accent: "#f59e0b" },
    { label: "وردي",   primary: "#be185d", accent: "#ec4899" },
    { label: "أحمر",   primary: "#dc2626", accent: "#ef4444" },
    { label: "سماوي",  primary: "#0891b2", accent: "#06b6d4" },
    { label: "رمادي",  primary: "#374151", accent: "#6b7280" },
  ];

  return (
    <div className="bg-card border border-card-border rounded-xl p-5 space-y-5">
      {/* Header */}
      <div className="flex items-center gap-2">
        <Palette className="w-4 h-4 text-primary" />
        <h2 className="text-sm font-semibold">ألوان الأكاديمية</h2>
      </div>
      <p className="text-xs text-muted-foreground">
        اختر الألوان الأساسية لواجهة الأكاديمية. ستظهر في الأزرار والعناوين والتأثيرات على صفحة الطلاب.
      </p>

      {/* Color pickers */}
      <div className="grid grid-cols-2 gap-6">
        {/* Primary */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            اللون الأساسي
          </label>
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-border shrink-0 cursor-pointer shadow-sm">
              <input
                type="color"
                {...register("primaryColor")}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => {
                  setValue("primaryColor", e.target.value);
                  applyPreview(e.target.value, accentColor);
                }}
              />
              <div className="w-full h-full" style={{ background: primaryColor }} />
            </div>
            <Input
              value={primaryColor}
              onChange={(e) => {
                setValue("primaryColor", e.target.value);
                if (/^#[0-9a-fA-F]{6}$/.test(e.target.value))
                  applyPreview(e.target.value, accentColor);
              }}
              className="font-mono text-xs uppercase"
              maxLength={7}
              placeholder="#6d28d9"
            />
          </div>
          {/* Preview sample */}
          <div
            className="h-8 rounded-lg flex items-center justify-center text-white text-xs font-semibold"
            style={{ background: primaryColor }}
          >
            زرار الانضمام
          </div>
        </div>

        {/* Accent */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            اللون الثانوي
          </label>
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-lg overflow-hidden border border-border shrink-0 cursor-pointer shadow-sm">
              <input
                type="color"
                {...register("accentColor")}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => {
                  setValue("accentColor", e.target.value);
                  applyPreview(primaryColor, e.target.value);
                }}
              />
              <div className="w-full h-full" style={{ background: accentColor }} />
            </div>
            <Input
              value={accentColor}
              onChange={(e) => {
                setValue("accentColor", e.target.value);
                if (/^#[0-9a-fA-F]{6}$/.test(e.target.value))
                  applyPreview(primaryColor, e.target.value);
              }}
              className="font-mono text-xs uppercase"
              maxLength={7}
              placeholder="#7c3aed"
            />
          </div>
          {/* Gradient preview */}
          <div
            className="h-8 rounded-lg"
            style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}
          />
        </div>
      </div>

      {/* Presets */}
      <div className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">ألوان جاهزة</p>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => {
            const isActive = primaryColor === p.primary && accentColor === p.accent;
            return (
              <button
                key={p.label}
                type="button"
                title={p.label}
                onClick={() => {
                  setValue("primaryColor", p.primary);
                  setValue("accentColor", p.accent);
                  applyPreview(p.primary, p.accent);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all"
                style={{
                  borderColor: isActive ? p.primary : "var(--border)",
                  background: isActive ? `${p.primary}18` : "transparent",
                  color: isActive ? p.primary : "var(--muted-foreground)",
                }}
              >
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ background: `linear-gradient(135deg, ${p.primary}, ${p.accent})` }}
                />
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Live preview strip */}
      <div
        className="rounded-xl p-4 flex items-center justify-between gap-4 border"
        style={{
          background: `rgba(${parseInt(primaryColor.slice(1,3),16)} ${parseInt(primaryColor.slice(3,5),16)} ${parseInt(primaryColor.slice(5,7),16)} / 0.06)`,
          borderColor: `${primaryColor}30`,
        }}
      >
        <div>
          <p className="text-xs font-semibold" style={{ color: primaryColor }}>معاينة مباشرة</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">هكذا ستبدو الألوان على صفحة الطلاب</p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="px-3 py-1.5 rounded-full text-white text-xs font-semibold"
            style={{ background: `linear-gradient(135deg, ${primaryColor}, ${accentColor})` }}
          >
            ابدأ الآن
          </div>
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: `${primaryColor}15`, color: primaryColor }}
          >
            <Palette className="w-4 h-4" />
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Paymob Gateway Section ───────────────────────────────────────────────────
function PaymobSection({ settings }: { settings?: Record<string, any> }) {
  const { t } = useI18n();
  const [cfg, setCfg] = useState({
    paymobApiKey: "",
    paymobIntegrationId: "",
    paymobIframeId: "",
    paymobHmacSecret: "",
    paymobEnabled: "false",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWithAuth("/api/settings")
      .then((r) => r.ok ? r.json() : {})
      .then((data: Record<string, any>) => {
        setCfg({
          paymobApiKey: data.paymobApiKey ?? "",
          paymobIntegrationId: data.paymobIntegrationId ?? "",
          paymobIframeId: data.paymobIframeId ?? "",
          paymobHmacSecret: data.paymobHmacSecret ?? "",
          paymobEnabled: data.paymobEnabled ?? "false",
        });
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetchWithAuth("/api/settings", {
        method: "PUT",
        body: JSON.stringify({
          academyName: settings?.academyName ?? "",
          academyNameAr: settings?.academyNameAr ?? null,
          logoUrl: settings?.logoUrl ?? null,
          defaultLanguage: settings?.defaultLanguage ?? "en",
          currency: settings?.currency ?? "USD",
          manualPaymentInstructions: settings?.manualPaymentInstructions ?? null,
          ...cfg,
        }),
      });
      if (!res.ok) throw new Error();
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      toast.success("Paymob settings saved");
    } catch {
      toast.error("Failed to save Paymob settings");
    } finally {
      setSaving(false);
    }
  };

  const enabled = cfg.paymobEnabled === "true";

  const fields: { key: keyof typeof cfg; label: string; hint: string; type?: string }[] = [
    { key: "paymobApiKey",       label: "API Key",         hint: "Paymob secret API key from dashboard",         type: "password" },
    { key: "paymobIntegrationId",label: "Integration ID",  hint: "Card payment integration ID from Paymob",      type: "text"     },
    { key: "paymobIframeId",     label: "iFrame ID",       hint: "iFrame ID for the hosted payment page",         type: "text"     },
    { key: "paymobHmacSecret",   label: "HMAC Secret",     hint: "Used to verify webhook authenticity",           type: "password" },
  ];

  return (
    <div className="bg-card border border-card-border rounded-xl p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CreditCard className="w-4 h-4 text-primary" />
          <h2 className="text-sm font-semibold">Paymob Payment Gateway</h2>
        </div>
        {/* Enable / Disable toggle */}
        <button
          type="button"
          onClick={() => setCfg((p) => ({ ...p, paymobEnabled: p.paymobEnabled === "true" ? "false" : "true" }))}
          className="flex items-center gap-1.5 text-xs font-medium"
        >
          {enabled ? (
            <><ToggleRight className="w-5 h-5 text-emerald-500" /><span className="text-emerald-600">Enabled</span></>
          ) : (
            <><ToggleLeft className="w-5 h-5 text-muted-foreground" /><span className="text-muted-foreground">Disabled</span></>
          )}
        </button>
      </div>

      <p className="text-xs text-muted-foreground">
        اربط بوابة Paymob لقبول الدفع بالبطاقات أونلاين.{" "}
        <a href="https://my.paymob.com" target="_blank" rel="noreferrer" className="text-primary underline underline-offset-2">
          my.paymob.com
        </a>
      </p>

      {loading ? (
        <p className="text-xs text-muted-foreground animate-pulse">Loading…</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {fields.map(({ key, label, hint, type }) => (
            <div key={key} className="space-y-1">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{label}</label>
              <Input
                value={cfg[key]}
                onChange={(e) => setCfg((p) => ({ ...p, [key]: e.target.value }))}
                type={type ?? "text"}
                placeholder={hint}
                className="font-mono text-xs"
              />
              <p className="text-[10px] text-muted-foreground/70">{hint}</p>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3 pt-1">
        <Button type="button" variant="secondary" size="sm" onClick={handleSave} disabled={saving || loading}>
          {saved ? "✓ Saved" : saving ? "Saving…" : "Save Paymob Settings"}
        </Button>
        {enabled && (
          <span className="text-xs text-emerald-600 font-medium">
            ✅ Paymob will appear as payment option in checkout
          </span>
        )}
      </div>
    </div>
  );
}