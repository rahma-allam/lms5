import { Link, useLocation } from "wouter";
import { useI18n } from "@/lib/i18n";
import {
  LayoutDashboard, BookOpen, Users, CreditCard, Settings,
  GraduationCap, X, ShieldCheck, Tag, Ticket, UserCog, LogOut,
  Sparkles, Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { useListAdminPayments, getListAdminPaymentsQueryKey } from "@workspace/api-client-react";
import { useAdminAuth } from "@/lib/adminAuth";
import { useTenant, type TenantPlan } from "@/hooks/useTenant";

function getTenantParam(): string {
  const fromUrl = new URLSearchParams(window.location.search).get("tenant");
  if (fromUrl) { localStorage.setItem("tenant_slug", fromUrl); return `?tenant=${fromUrl}`; }
  const s = localStorage.getItem("tenant_slug") ?? "";
  return s ? `?tenant=${s}` : "";
}

interface NavItem {
  key: string;
  icon: React.ElementType;
  href: string;
  minPlan?: TenantPlan;
}

const navItems: NavItem[] = [
  { key: "dashboard",     icon: LayoutDashboard, href: "/" },
  { key: "courses",       icon: BookOpen,        href: "/courses" },
  { key: "categories",    icon: Tag,             href: "/categories" },
  { key: "students",      icon: Users,           href: "/students" },
  { key: "instructors",   icon: UserCog,         href: "/instructors",  minPlan: "pro" },
  { key: "payments",      icon: CreditCard,      href: "/payments" },
  { key: "adminPayments", icon: ShieldCheck,     href: "/admin/payments" },
  { key: "coupons",       icon: Ticket,          href: "/coupons" },
  { key: "marketingAI",   icon: Sparkles,        href: "/marketing-ai", minPlan: "elite" },
  { key: "settings",      icon: Settings,        href: "/settings" },
];

const PLAN_BADGE: Record<TenantPlan, { label: string; color: string }> = {
  starter: { label: "Starter", color: "bg-blue-500/20 text-blue-400" },
  pro:     { label: "Pro",     color: "bg-violet-500/20 text-violet-400" },
  elite:   { label: "Elite ✨", color: "bg-amber-500/20 text-amber-400" },
};

interface SidebarProps { open: boolean; onClose: () => void; }

export function Sidebar({ open, onClose }: SidebarProps) {
  const { t } = useI18n();
  const [location] = useLocation();
  const { admin, logout } = useAdminAuth();
  const { plan, hasFeature } = useTenant();

  const { data: settings } = useQuery({
    queryKey: ["/api/storefront/settings"],
    queryFn: () => fetch(`/api/storefront/settings${getTenantParam()}`).then(r => r.json()),
    staleTime: 60_000,
  });

  const { data: pendingPayments } = useListAdminPayments(
    { status: "pending" },
    { query: { queryKey: getListAdminPaymentsQueryKey({ status: "pending" }), refetchInterval: 15_000 } }
  );

  const pendingCount = pendingPayments?.length ?? 0;
  const academyName = settings?.academyName || "NextEdu Academy";
  const tenantParam = getTenantParam();
  const planBadge = PLAN_BADGE[plan] ?? PLAN_BADGE.starter;

  const handleLogout = () => {
    logout();
    const tenant = localStorage.getItem("tenant_slug");
    window.location.href = tenant ? `/login?tenant=${tenant}` : "/login";
  };

  return (
    <>
      {open && <div className="fixed inset-0 bg-black/50 z-20 lg:hidden" onClick={onClose} />}
      <aside className={cn(
        "fixed lg:static top-0 bottom-0 z-30 w-64 bg-sidebar border-e border-sidebar-border flex flex-col transition-transform duration-200",
        "rtl:right-0 ltr:left-0",
        open
          ? "translate-x-0"
          : "rtl:translate-x-full lg:rtl:translate-x-0 ltr:-translate-x-full lg:ltr:translate-x-0"
      )}>
        {/* Header */}
        <div className="flex items-center justify-between px-4 h-16 border-b border-sidebar-border">
          <div className="flex items-center gap-2 min-w-0">
            {settings?.logoUrl ? (
              <img src={settings.logoUrl} alt="logo" className="w-8 h-8 rounded-lg object-cover shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-600 to-purple-700 flex items-center justify-center shrink-0">
                <GraduationCap className="w-4 h-4 text-white" />
              </div>
            )}
            <div className="min-w-0">
              <span className="font-bold text-sidebar-foreground text-sm tracking-tight truncate block">
                {academyName}
              </span>
              <span className={cn("text-[10px] font-semibold px-1.5 py-0.5 rounded-full", planBadge.color)}>
                {planBadge.label}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="lg:hidden text-sidebar-foreground/60 hover:text-sidebar-foreground shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map(({ key, icon: Icon, href, minPlan }) => {
            const isActive = href === "/" ? location === href : location.startsWith(href);
            const badge = key === "adminPayments" && pendingCount > 0 ? pendingCount : null;
            const locked = minPlan ? !hasFeature(minPlan) : false;

            return (
              <Link
                key={key}
                href={locked ? "#" : `${href}${tenantParam}`}
                onClick={locked ? (e) => e.preventDefault() : onClose}
                className={cn(
                  "sidebar-nav-item",
                  isActive && !locked && "active",
                  locked && "opacity-50 cursor-not-allowed"
                )}
                title={locked ? `يتطلب باقة ${minPlan}` : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span className="flex-1">{t(key)}</span>
                {locked && <Lock className="w-3 h-3 opacity-60 shrink-0" />}
                {badge !== null && !locked && (
                  <span className="min-w-5 h-5 px-1.5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                    {badge > 99 ? "99+" : badge}
                  </span>
                )}
                {minPlan && !locked && (
                  <span className={cn("text-[9px] font-bold px-1 py-0.5 rounded", PLAN_BADGE[minPlan]?.color)}>
                    {minPlan.toUpperCase()}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-sidebar-primary/30 flex items-center justify-center text-sidebar-primary text-sm font-semibold shrink-0">
              {admin?.name?.charAt(0)?.toUpperCase() ?? "A"}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium text-sidebar-foreground truncate">{admin?.name ?? "Admin"}</p>
              <p className="text-xs text-sidebar-foreground/50 truncate">{admin?.email ?? ""}</p>
            </div>
            <button onClick={handleLogout} className="text-sidebar-foreground/40 hover:text-destructive transition-colors shrink-0" title="Logout">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
