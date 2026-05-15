import { useState, useEffect, useRef } from "react";
import { useI18n } from "@/lib/i18n";
import { fetchWithAuth } from "@/lib/fetchWithAuth";
import { Sparkles, CheckCircle2, XCircle, Loader2, Copy, ChevronDown, ChevronUp, Bot } from "lucide-react";

interface PixelStatus {
  platform: string;
  key: string;
  pixelId: string | null;
  hasToken: boolean;
  active: boolean;
  trackingCode: string | null;
}

interface PixelsData {
  pixels: PixelStatus[];
  academyName: string;
  currency: string;
}

export default function MarketingAI() {
  const { t } = useI18n();
  const [pixelsData, setPixelsData] = useState<PixelsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<string>("");
  const [expandedCode, setExpandedCode] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const analysisRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchWithAuth("/api/marketing-ai/pixels-status")
      .then((r) => r.json())
      .then((data: PixelsData) => setPixelsData(data))
      .catch(() => setPixelsData(null))
      .finally(() => setLoading(false));
  }, []);

  const handleAnalyze = async () => {
    setAnalyzing(true);
    setAnalysis("");

    try {
      const token = localStorage.getItem("lms_admin_token");
      const tenant = localStorage.getItem("tenant_slug");
      const sep = tenant ? "?tenant=" + tenant : "";
      const res = await fetch(`/api/marketing-ai/analyze${sep}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (!res.ok || !res.body) {
        setAnalysis(t("aiError"));
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() ?? "";

        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          try {
            const json = JSON.parse(line.slice(6));
            if (json.done) break;
            if (json.content) {
              setAnalysis((prev) => prev + json.content);
              setTimeout(() => {
                analysisRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
              }, 50);
            }
          } catch {}
        }
      }
    } catch {
      setAnalysis(t("aiError"));
    } finally {
      setAnalyzing(false);
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const activeCount = pixelsData?.pixels.filter((p) => p.active).length ?? 0;
  const totalCount = pixelsData?.pixels.length ?? 0;

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto" dir="auto">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{t("marketingAI")}</h1>
          <p className="text-muted-foreground text-sm mt-0.5">{t("marketingAIDesc")}</p>
        </div>
      </div>

      {/* Pixels Status Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-foreground">{t("pixelStatus")}</h2>
          {!loading && (
            <span className="text-xs text-muted-foreground bg-muted px-2.5 py-1 rounded-full">
              {activeCount} / {totalCount} {t("active")}
            </span>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-28 rounded-xl border border-border bg-card animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {pixelsData?.pixels.map((pixel) => (
              <div
                key={pixel.key}
                className={`rounded-xl border p-4 flex flex-col gap-3 transition-all ${
                  pixel.active
                    ? "border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/20"
                    : "border-border bg-card"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-sm text-foreground">{pixel.platform}</p>
                    {pixel.pixelId && (
                      <p className="text-xs text-muted-foreground font-mono mt-0.5 truncate max-w-[140px]">
                        {pixel.pixelId}
                      </p>
                    )}
                  </div>
                  {pixel.active ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
                  ) : (
                    <XCircle className="w-5 h-5 text-muted-foreground shrink-0" />
                  )}
                </div>

                <div className="flex items-center gap-1.5">
                  <span
                    className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                      pixel.active
                        ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {pixel.active ? t("active") : t("missing")}
                  </span>
                  {pixel.active && !pixel.hasToken && (
                    <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400">
                      {t("noToken")}
                    </span>
                  )}
                </div>

                {pixel.active && pixel.trackingCode && (
                  <div className="mt-auto">
                    <button
                      onClick={() =>
                        setExpandedCode(expandedCode === pixel.key ? null : pixel.key)
                      }
                      className="flex items-center gap-1 text-xs text-primary hover:underline"
                    >
                      {expandedCode === pixel.key ? (
                        <ChevronUp className="w-3 h-3" />
                      ) : (
                        <ChevronDown className="w-3 h-3" />
                      )}
                      {t("trackingCode")}
                    </button>
                    {expandedCode === pixel.key && (
                      <div className="mt-2 relative">
                        <pre className="text-[10px] bg-muted/80 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap break-all leading-relaxed text-foreground/80 max-h-48">
                          {pixel.trackingCode}
                        </pre>
                        <button
                          onClick={() => handleCopy(pixel.trackingCode!, pixel.key)}
                          className="absolute top-2 end-2 p-1 rounded bg-background/80 hover:bg-background transition-colors"
                          title={t("copy")}
                        >
                          <Copy className="w-3 h-3 text-muted-foreground" />
                        </button>
                        {copied === pixel.key && (
                          <span className="absolute top-2 end-8 text-[10px] text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                            {t("copied")}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Analyze Button */}
      <div className="flex justify-center">
        <button
          onClick={handleAnalyze}
          disabled={analyzing || loading}
          className="inline-flex items-center gap-2.5 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 text-white font-semibold text-sm shadow-md hover:shadow-lg hover:from-violet-500 hover:to-purple-500 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {analyzing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t("analyzing")}
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              {t("smartAnalysis")}
            </>
          )}
        </button>
      </div>

      {/* AI Analysis Output */}
      {(analysis || analyzing) && (
        <div className="rounded-xl border border-violet-200 dark:border-violet-800 bg-violet-50/50 dark:bg-violet-950/20 p-6">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-4 h-4 text-violet-600 dark:text-violet-400" />
            <h3 className="text-sm font-semibold text-violet-700 dark:text-violet-300">
              {t("aiInsights")}
            </h3>
          </div>
          <div
            ref={analysisRef}
            className="prose prose-sm dark:prose-invert max-w-none text-foreground leading-relaxed whitespace-pre-wrap"
            dir="auto"
          >
            {analysis}
            {analyzing && (
              <span className="inline-block w-1.5 h-4 bg-violet-500 animate-pulse ml-0.5 align-middle rounded-sm" />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
