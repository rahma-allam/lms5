import Navbar from "@/components/storefront/Navbar";
import Hero from "@/components/storefront/Hero";
import Features from "@/components/storefront/Features";
import Courses from "@/components/storefront/Courses";
import HowItWorks from "@/components/storefront/HowItWorks";
import Testimonials from "@/components/storefront/Testimonials";
import TrustBadges from "@/components/storefront/TrustBadges";
import Footer from "@/components/storefront/Footer";
import { usePixelTracking } from "@/hooks/use-pixel-tracking";

export default function LandingPage() {
  usePixelTracking();
  return (
    <div className="min-h-[100dvh] flex flex-col font-sans">
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