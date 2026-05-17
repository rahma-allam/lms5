import Navbar from "@/components/storefront/Navbar";
import Hero from "@/components/storefront/Hero";
import Features from "@/components/storefront/Features";
import Courses from "@/components/storefront/Courses";
import HowItWorks from "@/components/storefront/HowItWorks";
import Testimonials from "@/components/storefront/Testimonials";
import TrustBadges from "@/components/storefront/TrustBadges";
import Footer from "@/components/storefront/Footer";
import { usePixelTracking } from "@/hooks/use-pixel-tracking";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { fetchStorefront } from "@/lib/api";

function getTenantParam(): string {
  const fromUrl = new URLSearchParams(window.location.search).get("tenant");
  if (fromUrl) { localStorage.setItem("tenant_slug", fromUrl); return `?tenant=${fromUrl}`; }
  const s = localStorage.getItem("tenant_slug") ?? "";
  return s ? `?tenant=${s}` : "";
}

// hex → "r g b" for CSS color-mix & rgba usage
function hexToRgb(hex: string): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `${r} ${g} ${b}`;
}

export default function LandingPage() {
  usePixelTracking();

  const { data: settings } = useQuery<any>({
    queryKey: ["/api/storefront/settings"],
    queryFn: () => fetchStorefront(`/api/storefront/settings${getTenantParam()}`),
    staleTime: 60_000,
  });

  // Inject brand colors as CSS custom properties on :root
  useEffect(() => {
    if (!settings) return;
    const root = document.documentElement;

    const primary = settings.primaryColor || "#6d28d9";
    const accent  = settings.accentColor  || "#7c3aed";

    root.style.setProperty("--brand-primary",     primary);
    root.style.setProperty("--brand-accent",      accent);
    root.style.setProperty("--brand-primary-rgb", hexToRgb(primary));
    root.style.setProperty("--brand-accent-rgb",  hexToRgb(accent));
  }, [settings]);

  return (
    <div className="min-h-[100dvh] flex flex-col">
      <Navbar />
      <main className="flex-1">
        <Hero />
        <Features />
        <Courses />
        <HowItWorks />
        <Testimonials />
        <TrustBadges />
      </main>
      <Footer />
    </div>
  );
}