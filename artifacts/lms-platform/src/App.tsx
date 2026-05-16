import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { I18nProvider } from "@/lib/i18n";
import { Layout } from "@/components/layout/Layout";
import { usePixels } from "@/hooks/usePixels";
import { AdminAuthProvider, useAdminAuth } from "@/lib/adminAuth";
import { TenantProvider, useTenant } from "@/hooks/useTenant";
import { setAuthTokenGetter } from "@workspace/api-client-react";
import Dashboard from "@/pages/Dashboard";
import Courses from "@/pages/Courses";
import CourseDetail from "@/pages/CourseDetail";
import Students from "@/pages/Students";
import StudentDetail from "@/pages/StudentDetail";
import Payments from "@/pages/Payments";
import AdminPayments from "@/pages/AdminPayments";
import SettingsPage from "@/pages/SettingsPage";
import NotFound from "@/pages/not-found";
import Instructors from "./pages/Instructors";
import Categories from "./pages/Categories";
import Coupons from "./pages/Coupons";
import AdminLogin from "./pages/AdminLogin";
import MarketingAI from "./pages/MarketingAI";
import LandingPage from "./pages/StorefrontLandingPage";
import SuperAdminLogin from "./pages/SuperAdminLogin";
import SuperAdmin from "./pages/SuperAdmin";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import { useEffect } from "react";
import { InstructorAuthProvider, useInstructorAuth } from "./lib/instructorAuth";
import InstructorLogin from "./pages/InstructorLogin";
import InstructorDashboard from "./pages/InstructorDashboard";
import { NotificationPrompt } from "@/components/NotificationPrompt";
import StorefrontLandingPage from "./pages/StorefrontLandingPage";
import CoursePage from "./pages/CoursePage";
import CheckoutPage from "./pages/CheckoutPage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import StudentPortal from "./pages/StudentPortal";
import CertificatePage from "./pages/CertificatePage";
import { AuthProvider } from "@/lib/auth";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

function isStorefrontPath() {
  const p = window.location.pathname;
  return p === "/storefront" || p.startsWith("/storefront/");
}

function isPublicNextEduPath() {
  const p = window.location.pathname;
  return p === "/nextedu" || p.startsWith("/nextedu/") ||
    p === "/super-admin" || p.startsWith("/super-admin/");
}

function AcademyNotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background text-center px-4">
      <div className="text-6xl font-bold text-muted-foreground mb-4">404</div>
      <h1 className="text-2xl font-semibold mb-2">Academy Not Found</h1>
      <p className="text-muted-foreground max-w-sm">
        The academy you're looking for doesn't exist or has not been registered yet.
      </p>
    </div>
  );
}

function TokenSetter() {
  const { token } = useAdminAuth();
  useEffect(() => {
    setAuthTokenGetter(() => token);
  }, [token]);
  return null;
}

function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAdminAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const tenant = localStorage.getItem("tenant_slug");
      navigate(tenant ? `/login?tenant=${tenant}` : "/login");
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );
  if (!isAuthenticated) return null;
  return <>{children}</>;
}

function InstructorAuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useInstructorAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      const tenant = localStorage.getItem("tenant_slug");
      navigate(tenant ? `/instructor/login?tenant=${tenant}` : "/instructor/login");
    }
  }, [isLoading, isAuthenticated, navigate]);

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );
  if (!isAuthenticated) return null;
  return <>{children}</>;
}

function StorefrontRoutes() {
  return (
    <Switch>
      <Route path="/storefront" component={StorefrontLandingPage} />
      <Route path="/storefront/courses/:id" component={CoursePage} />
      <Route path="/storefront/checkout/:id" component={CheckoutPage} />
      <Route path="/storefront/register" component={RegisterPage} />
      <Route path="/storefront/login" component={LoginPage} />
      <Route path="/storefront/portal" component={StudentPortal} />
      <Route path="/storefront/certificate/:id" component={CertificatePage} />
    </Switch>
  );
}

function AdminRoutes() {
  usePixels();
  return (
    <Switch>
      <Route path="/login" component={AdminLogin} />
      <Route path="/forgot-password">
        <ForgotPassword userType="admin" />
      </Route>
      <Route path="/reset-password">
        <ResetPassword />
      </Route>
      <Route path="/student/forgot-password">
        <ForgotPassword userType="student" />
      </Route>
      <Route path="/instructor/login" component={InstructorLogin} />
      <Route path="/instructor">
        <InstructorAuthGuard>
          <InstructorDashboard />
        </InstructorAuthGuard>
      </Route>
      <Route>
        <AuthGuard>
          <Layout>
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/courses" component={Courses} />
              <Route path="/courses/:id" component={CourseDetail} />
              <Route path="/students" component={Students} />
              <Route path="/students/:id" component={StudentDetail} />
              <Route path="/payments" component={Payments} />
              <Route path="/admin/payments" component={AdminPayments} />
              <Route path="/settings" component={SettingsPage} />
              <Route path="/instructors" component={Instructors} />
              <Route path="/categories" component={Categories} />
              <Route path="/coupons" component={Coupons} />
              <Route path="/marketing-ai" component={MarketingAI} />
              <Route component={NotFound} />
            </Switch>
          </Layout>
        </AuthGuard>
      </Route>
    </Switch>
  );
}

function AppWithTenantGuard() {
  const { isLoading, notFound } = useTenant();

  if (isLoading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );

  if (notFound) return <AcademyNotFound />;

  // Storefront - public, no admin auth needed
  if (isStorefrontPath()) {
    return (
      <AuthProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <StorefrontRoutes />
        </WouterRouter>
        <Toaster richColors position="top-right" />
      </AuthProvider>
    );
  }

  // Admin dashboard
  return (
    <InstructorAuthProvider>
      <AdminAuthProvider>
        <AuthProvider>
          <TokenSetter />
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <AdminRoutes />
          </WouterRouter>
          <Toaster richColors position="top-right" />
          <NotificationPrompt />
        </AuthProvider>
      </AdminAuthProvider>
    </InstructorAuthProvider>
  );
}

function PublicRoutes() {
  return (
    <Switch>
      <Route path="/nextedu" component={LandingPage} />
      <Route path="/super-admin/login" component={SuperAdminLogin} />
      <Route path="/super-admin" component={SuperAdmin} />
      <Route path="/super-admin/:rest*" component={SuperAdmin} />
    </Switch>
  );
}

function App() {
  if (isPublicNextEduPath()) {
    return (
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <QueryClientProvider client={queryClient}>
          <PublicRoutes />
        </QueryClientProvider>
      </ThemeProvider>
    );
  }

  if (isStorefrontPath()) {
    return (
      <TenantProvider>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <QueryClientProvider client={queryClient}>
            <I18nProvider>
              <AuthProvider>
                <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
                  <StorefrontRoutes />
                </WouterRouter>
                <Toaster richColors position="top-right" />
              </AuthProvider>
            </I18nProvider>
          </QueryClientProvider>
        </ThemeProvider>
      </TenantProvider>
    );
  }

  return (
    <TenantProvider>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <QueryClientProvider client={queryClient}>
          <I18nProvider>
            <AppWithTenantGuard />
          </I18nProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </TenantProvider>
  );
}

export default App;