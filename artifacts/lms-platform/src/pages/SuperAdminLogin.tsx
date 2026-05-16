import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { GraduationCap, Lock, Mail, Eye, EyeOff, ShieldCheck } from "lucide-react";

const SA_TOKEN_KEY = "nextedu_sa_token";

export default function SuperAdminLogin() {
  const [, navigate] = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (localStorage.getItem(SA_TOKEN_KEY)) navigate("/super-admin");
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/super-admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? "Login failed"); return; }
      localStorage.setItem(SA_TOKEN_KEY, data.token);
      navigate("/super-admin");
    } catch {
      setError("Network error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-950 via-purple-900 to-zinc-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 items-center justify-center shadow-2xl shadow-violet-500/30 mb-4">
            <ShieldCheck className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">NextEdu</h1>
          <p className="text-violet-300 text-sm">Super Admin Control Center</p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold text-white mb-6 text-center">تسجيل دخول المشرف العام</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-violet-200 mb-1.5">البريد الإلكتروني</label>
              <div className="relative">
                <Mail className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400" />
                <input
                  type="email" value={email} onChange={e => setEmail(e.target.value)} required
                  className="w-full ps-10 pe-4 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-violet-300/60 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
                  placeholder="rahma@nextedu.com"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-violet-200 mb-1.5">كلمة المرور</label>
              <div className="relative">
                <Lock className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-violet-400" />
                <input
                  type={show ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required
                  className="w-full ps-10 pe-10 py-2.5 rounded-xl bg-white/10 border border-white/20 text-white placeholder-violet-300/60 focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent text-sm"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShow(s => !s)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-violet-400 hover:text-white transition-colors">
                  {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {error && <p className="text-red-400 text-sm text-center bg-red-500/10 rounded-lg py-2">{error}</p>}
            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-500 to-purple-600 text-white font-bold text-sm shadow-lg hover:opacity-90 transition-opacity disabled:opacity-60 mt-2">
              {loading ? "جارٍ الدخول..." : "دخول"}
            </button>
          </form>
          <p className="text-center mt-4 text-xs text-violet-400">
            <a href="/" className="hover:text-violet-200 transition-colors">← العودة للصفحة الرئيسية</a>
          </p>
        </div>
      </div>
    </div>
  );
}
