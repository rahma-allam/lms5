import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Lock, Eye, EyeOff, GraduationCap, CheckCircle, XCircle } from "lucide-react";

function getTenantParam() {
  const p = new URLSearchParams(window.location.search).get("tenant");
  if (p) return `?tenant=${p}`;
  const s = localStorage.getItem("tenant_slug");
  return s ? `?tenant=${s}` : "";
}

export default function ResetPassword() {
  const [, navigate] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const token = params.get("token") ?? "";
  const userType = (params.get("type") ?? "admin") as "admin" | "student";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const tenantParam = getTenantParam();
  const isStudent = userType === "student";
  const apiPath = isStudent ? "/api/auth/reset-password" : "/api/admin-auth/reset-password";
  const loginPath = isStudent ? `/student/login${tenantParam}` : `/login${tenantParam}`;

  useEffect(() => {
    if (!token) setError("رابط الاستعادة غير صالح أو مفقود");
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) { setError("كلمة المرور يجب أن تكون 8 أحرف على الأقل"); return; }
    if (password !== confirm) { setError("كلمتا المرور غير متطابقتين"); return; }
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${apiPath}${tenantParam}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "حدث خطأ"); return; }
      setSuccess(true);
      setTimeout(() => navigate(loginPath), 3000);
    } catch {
      setError("خطأ في الاتصال بالسيرفر");
    } finally {
      setLoading(false);
    }
  };

  const strength = password.length === 0 ? 0
    : password.length < 8 ? 1
    : /[A-Z]/.test(password) && /[0-9]/.test(password) && /[^A-Za-z0-9]/.test(password) ? 4
    : /[A-Z]/.test(password) && /[0-9]/.test(password) ? 3
    : 2;

  const strengthColors = ["", "bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-emerald-500"];
  const strengthLabels = ["", "ضعيفة", "مقبولة", "جيدة", "قوية جداً"];

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-white to-purple-50 dark:from-zinc-950 dark:via-zinc-900 dark:to-violet-950/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
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
          {success ? (
            <div className="text-center py-4" dir="rtl">
              <div className="inline-flex w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-900/20 items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white mb-2">تم تغيير كلمة المرور!</h3>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
                يتم تحويلك لصفحة تسجيل الدخول...
              </p>
              <Link href={loginPath} className="text-sm text-violet-600 font-medium underline">
                الذهاب الآن
              </Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-1">تعيين كلمة مرور جديدة</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  اختر كلمة مرور قوية لحمايه حسابك
                </p>
              </div>

              {!token || error === "رابط الاستعادة غير صالح أو مفقود" ? (
                <div className="text-center py-4" dir="rtl">
                  <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
                  <p className="text-red-500 font-medium">رابط الاستعادة غير صالح أو منتهي الصلاحية</p>
                  <Link href={isStudent ? `/student/forgot-password${tenantParam}` : `/forgot-password${tenantParam}`}
                    className="mt-4 inline-block text-sm text-violet-600 underline">
                    طلب رابط جديد
                  </Link>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4" dir="rtl">
                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                      كلمة المرور الجديدة
                    </label>
                    <div className="relative">
                      <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <input
                        type={showPw ? "text" : "password"}
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        minLength={8}
                        placeholder="8 أحرف على الأقل"
                        className="w-full ps-10 pe-10 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                      <button type="button" onClick={() => setShowPw(s => !s)}
                        className="absolute end-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 transition-colors">
                        {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {password.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4].map(i => (
                            <div key={i} className={`h-1 flex-1 rounded-full transition-colors ${i <= strength ? strengthColors[strength] : "bg-zinc-200 dark:bg-zinc-700"}`} />
                          ))}
                        </div>
                        <p className={`text-xs ${strengthColors[strength].replace("bg-", "text-")}`}>
                          قوة كلمة المرور: {strengthLabels[strength]}
                        </p>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
                      تأكيد كلمة المرور
                    </label>
                    <div className="relative">
                      <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                      <input
                        type={showPw ? "text" : "password"}
                        value={confirm}
                        onChange={e => setConfirm(e.target.value)}
                        required
                        placeholder="أعد كتابة كلمة المرور"
                        className="w-full ps-10 pe-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-violet-500"
                      />
                    </div>
                    {confirm && password !== confirm && (
                      <p className="text-red-400 text-xs mt-1">كلمتا المرور غير متطابقتين</p>
                    )}
                  </div>

                  {error && (
                    <p className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 rounded-lg py-2">
                      {error}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={loading || password !== confirm || password.length < 8}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-700 text-white font-bold text-sm shadow-lg hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {loading ? "جارٍ الحفظ..." : "تعيين كلمة المرور"}
                  </button>
                </form>
              )}
            </>
          )}

          <div className="mt-6 text-center" dir="rtl">
            <Link href={loginPath}
              className="text-sm text-zinc-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors">
              ← العودة لتسجيل الدخول
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
