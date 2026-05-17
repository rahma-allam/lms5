import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useI18n } from "@/lib/i18n";
import { useTenant } from "@/hooks/useTenant";
import { toStorefront } from "@/lib/tenantNav";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { motion } from "framer-motion";
import { UserPlus, Mail, Lock, Phone, User, Loader2, GraduationCap, AlertCircle } from "lucide-react";
import Navbar from "@/components/storefront/Navbar";

export default function RegisterPage() {
  const { t, language } = useI18n();
  const { register } = useAuth();
  const { theme, isLoading: tenantLoading } = useTenant();
  const [, navigate] = useLocation();
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const [isPending, setIsPending] = useState(false);

  // Ensure tenant slug is in URL so auth.tsx getTenantParam() picks it up
  useEffect(() => {
    const slug = localStorage.getItem("tenant_slug");
    if (slug && !new URLSearchParams(window.location.search).get("tenant")) {
      window.history.replaceState(null, "", `${window.location.pathname}?tenant=${slug}`);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsPending(true);
    try {
      await register({ name: form.name, email: form.email, password: form.password, phone: form.phone || undefined });
      navigate(toStorefront("/storefront/portal"));
    } catch (err: any) {
      setError(err.message || t("portal.registerError"));
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="min-h-screen flex items-center justify-center px-4 pt-16">
        <motion.div
          className="w-full max-w-sm"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/25">
              {theme?.logoUrl ? (
                <img src={theme.logoUrl} alt={theme.academyName} className="w-10 h-10 object-contain rounded-xl" />
              ) : (
                <GraduationCap className="w-7 h-7 text-primary-foreground" />
              )}
            </div>
            <h1 className="text-2xl font-bold mb-1">{t("portal.registerTitle")}</h1>
            <p className="text-sm text-muted-foreground">{t("portal.registerSubtitle")}</p>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 rounded-lg px-3 py-2.5 text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  {error}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="name">{t("portal.fullName")}</Label>
                <div className="relative">
                  <User className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="name" required value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder={language === "ar" ? "محمد أحمد" : "John Doe"} className="ps-9" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email">{t("portal.email")}</Label>
                <div className="relative">
                  <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="email" type="email" required value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="name@example.com" className="ps-9" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="phone">{t("portal.phone")}</Label>
                <div className="relative">
                  <Phone className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="phone" type="tel" value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+20 100 000 0000" className="ps-9" />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password">{t("portal.password")}</Label>
                <div className="relative">
                  <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input id="password" type="password" required value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    placeholder="••••••••" className="ps-9" />
                </div>
              </div>

              <Button type="submit" className="w-full gap-2" disabled={isPending || tenantLoading}>
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                {t("portal.registerBtn")}
              </Button>
            </form>

            <p className="text-sm text-center text-muted-foreground mt-4">
              {t("portal.hasAccount")}{" "}
              <button onClick={() => navigate(toStorefront("/storefront/login"))}
                className="text-primary hover:underline font-medium">
                {t("portal.loginLink")}
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}