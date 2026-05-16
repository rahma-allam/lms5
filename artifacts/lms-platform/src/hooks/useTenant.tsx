import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface TenantTheme {
  academyName: string;
  academyNameAr: string | null;
  logoUrl: string | null;
  defaultLanguage: "en" | "ar";
  currency: string;
  metaPixelId: string | null;
  googleTagId: string | null;
  tiktokPixelId: string | null;
  manualPaymentInstructions: string | null;
  primaryColor?: string;
  accentColor?: string;
}

export type TenantPlan = "starter" | "pro" | "elite";

const PLAN_ORDER: Record<TenantPlan, number> = { starter: 0, pro: 1, elite: 2 };

interface TenantContextValue {
  tenantId: number | null;
  theme: TenantTheme | null;
  plan: TenantPlan;
  planExpiresAt: string | null;
  status: string;
  isLoading: boolean;
  notFound: boolean;
  isStorefront: boolean;
  hostname: string;
  refetch: () => void;
  hasFeature: (minPlan: TenantPlan) => boolean;
}

const TenantCtx = createContext<TenantContextValue>({
  tenantId: null,
  theme: null,
  plan: "starter",
  planExpiresAt: null,
  status: "trial",
  isLoading: true,
  notFound: false,
  isStorefront: false,
  hostname: "",
  refetch: () => {},
  hasFeature: () => false,
});

export function TenantProvider({ children }: { children: ReactNode }) {
  const [tenantId, setTenantId] = useState<number | null>(null);
  const [theme, setTheme] = useState<TenantTheme | null>(null);
  const [plan, setPlan] = useState<TenantPlan>("starter");
  const [planExpiresAt, setPlanExpiresAt] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("trial");
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isStorefront, setIsStorefront] = useState(false);

  const hostname =
    typeof window !== "undefined" ? window.location.hostname : "";

  const BASE_DOMAIN = import.meta.env.VITE_BASE_DOMAIN || "";

  async function loadTenant() {
    setIsLoading(true);
    setNotFound(false);
    try {
      const isLocalDev =
        hostname === "localhost" ||
        hostname === "127.0.0.1" ||
        hostname.startsWith("192.168.");

      const isAppSubdomain =
        BASE_DOMAIN && hostname === `app.${BASE_DOMAIN}`;

      const urlParams = new URLSearchParams(window.location.search);
      const devSlug =
        urlParams.get("tenant") ||
        import.meta.env.VITE_DEV_TENANT_SLUG ||
        "demo";

      if (isLocalDev && devSlug) {
        (window as any).__TENANT_SLUG__ = devSlug;
        localStorage.setItem("tenant_slug", devSlug);
      } else if (BASE_DOMAIN && hostname.endsWith(`.${BASE_DOMAIN}`)) {
        const slug = hostname.replace(`.${BASE_DOMAIN}`, "");
        (window as any).__TENANT_SLUG__ = slug;
      }

      const url = isLocalDev
        ? `/api/tenant/theme?slug=${devSlug}`
        : "/api/tenant/theme";

      const res = await fetch(url);

      if (res.status === 404) {
        setNotFound(true);
        setIsLoading(false);
        return;
      }

      if (!res.ok) {
        console.warn("Tenant theme fetch failed:", res.status);
        setIsLoading(false);
        return;
      }

      const data: {
        tenantId: number;
        theme: TenantTheme;
        plan?: TenantPlan;
        planExpiresAt?: string | null;
        status?: string;
      } = await res.json();

      setTenantId(data.tenantId);
      setTheme(data.theme);
      setPlan((data.plan as TenantPlan) ?? "starter");
      setPlanExpiresAt(data.planExpiresAt ?? null);
      setStatus(data.status ?? "trial");
      setIsStorefront(!isAppSubdomain);

      // Inject brand colors as CSS variables
      if (data.theme?.primaryColor) {
        document.documentElement.style.setProperty("--color-primary-brand", data.theme.primaryColor);
      }
    } catch (e) {
      console.error("Failed to load tenant theme", e);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadTenant();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function hasFeature(minPlan: TenantPlan): boolean {
    return PLAN_ORDER[plan] >= PLAN_ORDER[minPlan];
  }

  return (
    <TenantCtx.Provider
      value={{
        tenantId,
        theme,
        plan,
        planExpiresAt,
        status,
        isLoading,
        notFound,
        isStorefront,
        hostname,
        refetch: loadTenant,
        hasFeature,
      }}
    >
      {children}
    </TenantCtx.Provider>
  );
}

export function useTenant() {
  return useContext(TenantCtx);
}
