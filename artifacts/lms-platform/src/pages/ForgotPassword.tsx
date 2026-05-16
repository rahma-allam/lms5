import { useState } from "react";
import { Link } from "wouter";
import { Mail, ArrowRight, GraduationCap, CheckCircle } from "lucide-react";

interface Props {
  userType?: "admin" | "student";
}

function getTenantSlug() {
  const p = new URLSearchParams(window.location.search).get("tenant");
  if (p) return p;
  return localStorage.getItem("tenant_slug") ?? "";
}

export default function ForgotPassword({ userType = "admin" }: Props) {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [devLink, setDevLink] = useState<string | null>(null);
  const [error, setError] = useState("");

  const slug = getTenantSlug();
  const tenantParam = slug ? `?tenant=${slug}` : "";
  const isStudent = userType === "student";
  const apiPath = isStudent ? "/api/auth/forgot-password" : "/api/admin-auth/forgot-password";
  const loginPath = isStudent ? `/student/login${tenantParam}` : `/login${tenantParam}`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${apiPath}${tenantParam}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "حدث خطأ"); return; }
      setSent(true);
      if (data._devResetLink) setDevLink(data._devResetLink);
    } catch {
      setError("خطأ في الاتصال بالسيرفر");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-violet-950/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 items-center justify-center shadow-xl shadow-violet-500/25 mb-3">
            <GraduationCap className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">NextEdu</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            {isStudent ? "بوابة الطلاب" : "لوحة تحكم الأكاديمية"}
          </p>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 shadow-xl p-8">
          {!sent ? (
            <>
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">نسيت كلمة المرور؟</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  أدخل بريدك الإلكتروني وسنرسل لك رابط إعادة التعيين
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                    البريد الإلكتروني
                  </label>
                  <div className="relative">
                    <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      required
                      placeholder="you@example.com"
                      className="w-full ps-10 pe-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 rounded-lg py-2">
                    {error}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-700 text-white font-bold text-sm shadow-lg hover:opacity-90 transition-opacity disabled:opacity-60"
                >
                  {loading ? "جارٍ الإرسال..." : "إرسال رابط الاستعادة"}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4" dir="rtl">
              <div className="inline-flex w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-900/20 items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">تم الإرسال!</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                إذا كان البريد الإلكتروني مسجلاً، ستصل رسالة خلال دقائق قليلة.
              </p>

              {devLink && (
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-4 text-start">
                  <p className="text-xs font-bold text-amber-700 dark:text-amber-400 mb-2">
                    🛠️ وضع التطوير — رابط الاستعادة:
                  </p>
                  <a
                    href={devLink}
                    className="text-xs text-violet-600 dark:text-violet-400 break-all underline underline-offset-2"
                  >
                    {devLink}
                  </a>
                  <p className="text-xs text-amber-600 dark:text-amber-500 mt-2">
                    (يظهر هذا فقط في التطوير — ضع إعدادات SMTP في الإنتاج)
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="mt-6 text-center" dir="rtl">
            <Link
              href={loginPath}
              className="inline-flex items-center gap-1.5 text-sm text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 font-medium transition-colors"
            >
              <ArrowRight className="w-4 h-4" />
              العودة لتسجيل الدخول
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
