import { useState, useEffect, useCallback } from "react";
import { useLocation } from "wouter";
import {
  ShieldCheck, LogOut, Plus, RefreshCw, Building2, Crown,
  Calendar, CheckCircle, XCircle, Edit3, Trash2, Save, X,
  DollarSign, TrendingUp, AlertTriangle, Search, ChevronDown
} from "lucide-react";

const SA_TOKEN_KEY = "nextedu_sa_token";
type Plan = "starter" | "pro" | "elite";

const PLAN_LABELS: Record<Plan, { ar: string; color: string }> = {
  starter: { ar: "Starter — المعلم المستقل", color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300" },
  pro: { ar: "Pro — الأكاديمية", color: "bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300" },
  elite: { ar: "Elite — المؤسسة الذكية", color: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300" },
};
const STATUS_LABELS = {
  active: { ar: "نشط", color: "text-emerald-600 dark:text-emerald-400" },
  suspended: { ar: "موقوف", color: "text-red-500" },
  trial: { ar: "تجربة", color: "text-orange-500" },
};

function saFetch(path: string, opts: RequestInit = {}) {
  const token = localStorage.getItem(SA_TOKEN_KEY) ?? "";
  return fetch(`/api/super-admin${path}`, {
    ...opts,
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...opts.headers },
  });
}

interface Tenant {
  id: number; slug: string; name: string; academyName: string | null;
  status: string; plan: string; planExpiresAt: string | null; createdAt: string;
}

interface PlanRow {
  plan: string; nameAr: string; nameEn: string;
  priceMonthlyEgp: number; priceAnnualEgp: number;
  priceMonthlyUsd: number; priceAnnualUsd: number;
  discountAnnualPct: number;
}

export default function SuperAdmin() {
  const [, navigate] = useLocation();
  const [tab, setTab] = useState<"tenants" | "pricing">("tenants");
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [pricing, setPricing] = useState<PlanRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);
  const [editTenant, setEditTenant] = useState<Tenant | null>(null);
  const [editPlan, setEditPlan] = useState<PlanRow | null>(null);
  const [saName, setSaName] = useState("Super Admin");

  useEffect(() => {
    const token = localStorage.getItem(SA_TOKEN_KEY);
    if (!token) { navigate("/super-admin/login"); return; }
    saFetch("/me").then(r => r.ok ? r.json() : null).then(d => { if (d) setSaName(d.name); });
    fetchData();
  }, []);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [tRes, pRes] = await Promise.all([saFetch("/tenants"), fetch("/api/plan-pricing")]);
      if (tRes.ok) setTenants(await tRes.json());
      if (pRes.ok) setPricing(await pRes.json());
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = () => { localStorage.removeItem(SA_TOKEN_KEY); navigate("/super-admin/login"); };

  const filtered = tenants.filter(t =>
    t.slug.includes(search) || t.name.includes(search) || (t.academyName ?? "").includes(search)
  );

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-white" dir="rtl">
      {/* Top bar */}
      <nav className="sticky top-0 z-50 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-violet-600" />
            <span className="font-bold text-base">NextEdu <span className="text-violet-500">Super Admin</span></span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-500">{saName}</span>
            <button onClick={logout} className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 transition-colors">
              <LogOut className="w-4 h-4" /> خروج
            </button>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Stats row */}
        {!loading && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: "إجمالي الأكاديميات", value: tenants.length, icon: Building2, color: "text-violet-600" },
              { label: "نشطة", value: tenants.filter(t => t.status === "active").length, icon: CheckCircle, color: "text-emerald-600" },
              { label: "Elite", value: tenants.filter(t => t.plan === "elite").length, icon: Crown, color: "text-amber-500" },
              { label: "تجربة / موقوفة", value: tenants.filter(t => t.status !== "active").length, icon: AlertTriangle, color: "text-orange-500" },
            ].map((s, i) => (
              <div key={i} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4">
                <div className="flex items-center gap-2 mb-1">
                  <s.icon className={`w-4 h-4 ${s.color}`} />
                  <span className="text-xs text-zinc-500">{s.label}</span>
                </div>
                <p className="text-2xl font-bold">{s.value}</p>
              </div>
            ))}
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl p-1 mb-6 w-fit">
          {[{ id: "tenants", label: "الأكاديميات" }, { id: "pricing", label: "الأسعار" }].map(t => (
            <button key={t.id} onClick={() => setTab(t.id as any)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-all ${tab === t.id ? "bg-white dark:bg-zinc-900 shadow text-violet-600" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-white"}`}>
              {t.label}
            </button>
          ))}
        </div>

        {tab === "tenants" && (
          <>
            <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
              <div className="relative flex-1 min-w-48 max-w-xs">
                <Search className="absolute start-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder="بحث باسم الأكاديمية أو الـ slug..."
                  className="w-full ps-9 pe-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
              </div>
              <div className="flex gap-2">
                <button onClick={fetchData} className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                  <RefreshCw className="w-4 h-4 text-zinc-500" />
                </button>
                <button onClick={() => setShowCreate(true)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-semibold hover:bg-violet-700 transition-colors shadow">
                  <Plus className="w-4 h-4" /> إنشاء أكاديمية
                </button>
              </div>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[0,1,2].map(i => <div key={i} className="h-16 rounded-xl bg-zinc-200 dark:bg-zinc-800 animate-pulse" />)}
              </div>
            ) : (
              <div className="space-y-3">
                {filtered.map(t => (
                  <div key={t.id} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-4 flex flex-wrap items-center gap-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-100 to-purple-100 dark:from-violet-900/40 dark:to-purple-900/40 flex items-center justify-center shrink-0">
                      <Building2 className="w-5 h-5 text-violet-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm truncate">{t.academyName ?? t.name}</p>
                      <p className="text-xs text-zinc-500">@{t.slug}</p>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${PLAN_LABELS[t.plan as Plan]?.color ?? "bg-zinc-100 text-zinc-600"}`}>
                      {PLAN_LABELS[t.plan as Plan]?.ar ?? t.plan}
                    </span>
                    <span className={`text-xs font-semibold ${STATUS_LABELS[t.status as keyof typeof STATUS_LABELS]?.color ?? ""}`}>
                      {STATUS_LABELS[t.status as keyof typeof STATUS_LABELS]?.ar ?? t.status}
                    </span>
                    {t.planExpiresAt && (
                      <span className="text-xs text-zinc-400 flex items-center gap-1">
                        <Calendar className="w-3 h-3" /> {new Date(t.planExpiresAt).toLocaleDateString("ar-EG")}
                      </span>
                    )}
                    <div className="flex gap-2">
                      <button onClick={() => setEditTenant(t)} className="p-1.5 rounded-lg hover:bg-violet-50 dark:hover:bg-violet-900/20 text-violet-500 transition-colors">
                        <Edit3 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
                {filtered.length === 0 && <p className="text-center text-zinc-400 py-12 text-sm">لا توجد أكاديميات مطابقة للبحث</p>}
              </div>
            )}
          </>
        )}

        {tab === "pricing" && (
          <div className="space-y-4">
            <p className="text-sm text-zinc-500 mb-2">اضغط على الباقة لتعديل أسعارها</p>
            {pricing.length === 0 && !loading && <p className="text-center text-zinc-400 py-12 text-sm">لم يتم إعداد الأسعار بعد — اضغط على زر الرفع أعلاه لمزامنة البيانات</p>}
            {pricing.map(p => (
              <div key={p.plan} className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-bold text-base">{p.nameAr}</p>
                    <p className="text-xs text-zinc-500">{p.nameEn}</p>
                  </div>
                  <button onClick={() => setEditPlan(p)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 text-sm font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                    <Edit3 className="w-3.5 h-3.5" /> تعديل
                  </button>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { label: "شهري EGP", value: `${p.priceMonthlyEgp} جنيه` },
                    { label: "سنوي EGP", value: `${p.priceAnnualEgp} جنيه` },
                    { label: "شهري USD", value: `$${(p.priceMonthlyUsd / 100).toFixed(0)}` },
                    { label: "سنوي USD", value: `$${(p.priceAnnualUsd / 100).toFixed(0)}` },
                  ].map((f, i) => (
                    <div key={i} className="bg-zinc-50 dark:bg-zinc-800 rounded-lg p-3">
                      <p className="text-[10px] text-zinc-400 mb-0.5">{f.label}</p>
                      <p className="font-bold text-sm">{f.value}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Academy Modal */}
      {showCreate && <CreateModal onClose={() => { setShowCreate(false); fetchData(); }} />}
      {editTenant && <EditTenantModal tenant={editTenant} onClose={() => { setEditTenant(null); fetchData(); }} />}
      {editPlan && <EditPricingModal row={editPlan} onClose={() => { setEditPlan(null); fetchData(); }} />}
    </div>
  );
}

function CreateModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ name: "", slug: "", adminEmail: "", adminPassword: "", plan: "starter", planExpiresAt: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true); setError("");
    const res = await saFetch("/tenants", { method: "POST", body: JSON.stringify(form) });
    const data = await res.json();
    if (!res.ok) { setError(data.error ?? "Error"); setLoading(false); return; }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-lg">إنشاء أكاديمية جديدة</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          {[
            { k: "name", label: "اسم الأكاديمية", placeholder: "مثال: أكاديمية النور" },
            { k: "slug", label: "Slug (URL)", placeholder: "مثال: alnoor" },
            { k: "adminEmail", label: "إيميل الأدمن", placeholder: "admin@alnoor.com" },
            { k: "adminPassword", label: "كلمة مرور الأدمن", placeholder: "••••••••" },
          ].map(f => (
            <div key={f.k}>
              <label className="text-xs font-medium text-zinc-500 mb-1 block">{f.label}</label>
              <input value={(form as any)[f.k]} onChange={e => set(f.k, e.target.value)} required
                placeholder={f.placeholder}
                type={f.k === "adminPassword" ? "password" : "text"}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
          ))}
          <div>
            <label className="text-xs font-medium text-zinc-500 mb-1 block">الباقة</label>
            <select value={form.plan} onChange={e => set("plan", e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
              <option value="starter">Starter</option>
              <option value="pro">Pro</option>
              <option value="elite">Elite</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-500 mb-1 block">تاريخ انتهاء الاشتراك</label>
            <input type="date" value={form.planExpiresAt} onChange={e => set("planExpiresAt", e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
          </div>
          {error && <p className="text-red-500 text-xs">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full py-2.5 rounded-xl bg-violet-600 text-white font-bold text-sm hover:bg-violet-700 transition-colors disabled:opacity-60">
            {loading ? "جارٍ الإنشاء..." : "إنشاء الأكاديمية"}
          </button>
        </form>
      </div>
    </div>
  );
}

function EditTenantModal({ tenant, onClose }: { tenant: Tenant; onClose: () => void }) {
  const [form, setForm] = useState({
    plan: tenant.plan,
    status: tenant.status,
    planExpiresAt: tenant.planExpiresAt ? tenant.planExpiresAt.slice(0, 10) : "",
  });
  const [loading, setLoading] = useState(false);
  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    await saFetch(`/tenants/${tenant.id}`, { method: "PATCH", body: JSON.stringify(form) });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="font-bold text-base">{tenant.academyName ?? tenant.name}</h3>
            <p className="text-xs text-zinc-500">@{tenant.slug}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-zinc-500 mb-1 block">الباقة</label>
            <select value={form.plan} onChange={e => set("plan", e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
              <option value="starter">Starter — المعلم المستقل</option>
              <option value="pro">Pro — الأكاديمية</option>
              <option value="elite">Elite — المؤسسة الذكية</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-500 mb-1 block">الحالة</label>
            <select value={form.status} onChange={e => set("status", e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500">
              <option value="active">نشط</option>
              <option value="trial">تجربة</option>
              <option value="suspended">موقوف</option>
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-zinc-500 mb-1 block">تاريخ انتهاء الاشتراك</label>
            <input type="date" value={form.planExpiresAt} onChange={e => set("planExpiresAt", e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
          </div>
          <button type="submit" disabled={loading}
            className="w-full py-2.5 rounded-xl bg-violet-600 text-white font-bold text-sm hover:bg-violet-700 transition-colors disabled:opacity-60">
            {loading ? "جارٍ الحفظ..." : "حفظ التغييرات"}
          </button>
        </form>
      </div>
    </div>
  );
}

function EditPricingModal({ row, onClose }: { row: PlanRow; onClose: () => void }) {
  const [form, setForm] = useState({ ...row });
  const [loading, setLoading] = useState(false);
  const set = (k: string, v: number) => setForm(f => ({ ...f, [k]: v }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setLoading(true);
    const token = localStorage.getItem(SA_TOKEN_KEY) ?? "";
    await fetch(`/api/plan-pricing/${row.plan}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify(form),
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-base">تعديل أسعار {row.nameAr}</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"><X className="w-4 h-4" /></button>
        </div>
        <form onSubmit={submit} className="space-y-3">
          {[
            { k: "priceMonthlyEgp", label: "الشهري (EGP)" },
            { k: "priceAnnualEgp", label: "السنوي (EGP)" },
            { k: "priceMonthlyUsd", label: "الشهري USD (cents)" },
            { k: "priceAnnualUsd", label: "السنوي USD (cents)" },
            { k: "discountAnnualPct", label: "خصم السنوي %" },
          ].map(f => (
            <div key={f.k}>
              <label className="text-xs font-medium text-zinc-500 mb-1 block">{f.label}</label>
              <input type="number" value={(form as any)[f.k]} onChange={e => set(f.k, Number(e.target.value))} min={0}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500" />
            </div>
          ))}
          <button type="submit" disabled={loading}
            className="w-full py-2.5 rounded-xl bg-violet-600 text-white font-bold text-sm hover:bg-violet-700 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
            <Save className="w-4 h-4" />
            {loading ? "جارٍ الحفظ..." : "حفظ الأسعار"}
          </button>
        </form>
      </div>
    </div>
  );
}
