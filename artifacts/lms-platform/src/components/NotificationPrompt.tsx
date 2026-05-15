import { useState, useEffect } from "react";
import { Bell, X, BellOff } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useAdminAuth } from "@/lib/adminAuth";

const STORAGE_KEY = "lms_notif_prompt_dismissed";
const DELAY_MS = 4000;

export function NotificationPrompt() {
  const { t } = useI18n();
  const { isAuthenticated } = useAdminAuth();
  const [visible, setVisible] = useState(false);
  const [status, setStatus] = useState<"idle" | "granted" | "denied">("idle");

  useEffect(() => {
    if (!isAuthenticated) return;
    if (!("Notification" in window) || !("serviceWorker" in navigator)) return;
    if (Notification.permission !== "default") return;
    if (localStorage.getItem(STORAGE_KEY)) return;

    const timer = setTimeout(() => setVisible(true), DELAY_MS);
    return () => clearTimeout(timer);
  }, [isAuthenticated]);

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  const handleAllow = async () => {
    try {
      const result = await Notification.requestPermission();
      if (result === "granted") {
        setStatus("granted");
        setTimeout(dismiss, 2200);
      } else {
        setStatus("denied");
        setTimeout(dismiss, 2200);
      }
    } catch {
      dismiss();
    }
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      className="fixed bottom-5 inset-x-0 mx-auto z-50 px-4"
      style={{ maxWidth: 440 }}
    >
      <div
        className="rounded-2xl border border-violet-200 dark:border-violet-800 bg-white dark:bg-zinc-900 shadow-2xl shadow-violet-100/60 dark:shadow-violet-950/40 overflow-hidden"
        style={{ animation: "slideUp .28s cubic-bezier(.16,1,.3,1) both" }}
      >
        <style>{`
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px) scale(.97); }
            to   { opacity: 1; transform: translateY(0)   scale(1);    }
          }
        `}</style>

        {status === "idle" ? (
          <div className="p-4 flex items-start gap-3">
            <div className="shrink-0 w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-md">
              <Bell className="w-5 h-5 text-white" />
            </div>

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm text-foreground leading-tight">
                {t("notifPromptTitle")}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                {t("notifPromptBody")}
              </p>

              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={handleAllow}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-gradient-to-r from-violet-600 to-purple-600 text-white text-xs font-semibold shadow hover:opacity-90 transition-opacity"
                >
                  <Bell className="w-3.5 h-3.5" />
                  {t("notifAllow")}
                </button>
                <button
                  onClick={dismiss}
                  className="flex-1 inline-flex items-center justify-center px-3 py-2 rounded-lg bg-muted text-muted-foreground text-xs font-medium hover:bg-muted/80 transition-colors"
                >
                  {t("notifLater")}
                </button>
              </div>
            </div>

            <button
              onClick={dismiss}
              className="shrink-0 p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : status === "granted" ? (
          <div className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center">
              <Bell className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
              {t("notifGranted")}
            </p>
          </div>
        ) : (
          <div className="p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center">
              <BellOff className="w-4.5 h-4.5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              {t("notifDenied")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
