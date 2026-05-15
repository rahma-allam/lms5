import { Router } from "express";
import { db } from "@workspace/db";
import { settingsTable, tenantsTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { anthropic } from "@workspace/integrations-anthropic-ai";

const router = Router();

async function getDefaultTenantId(): Promise<number> {
  const [tenant] = await db
    .select()
    .from(tenantsTable)
    .where(eq(tenantsTable.slug, "default"))
    .limit(1);
  if (!tenant) throw new Error("Default tenant not found.");
  return tenant.id;
}

router.get("/pixels-status", async (req, res) => {
  try {
    const tenantId = req.tenantId ?? (await getDefaultTenantId());

    const [settings] = await db
      .select({
        metaPixelId: settingsTable.metaPixelId,
        metaConversionToken: settingsTable.metaConversionToken,
        googleTagId: settingsTable.googleTagId,
        googleApiSecret: settingsTable.googleApiSecret,
        tiktokPixelId: settingsTable.tiktokPixelId,
        tiktokAccessToken: settingsTable.tiktokAccessToken,
        academyName: settingsTable.academyName,
        currency: settingsTable.currency,
      })
      .from(settingsTable)
      .where(eq(settingsTable.tenantId, tenantId))
      .limit(1);

    if (!settings) {
      return res.json({
        pixels: [],
        academyName: "My Academy",
        currency: "USD",
      });
    }

    const pixels = [
      {
        platform: "Meta (Facebook)",
        key: "meta",
        pixelId: settings.metaPixelId ?? null,
        hasToken: Boolean(settings.metaConversionToken),
        active: Boolean(settings.metaPixelId),
        trackingCode: settings.metaPixelId
          ? generateMetaSnippet(settings.metaPixelId)
          : null,
      },
      {
        platform: "Google Tag Manager",
        key: "google",
        pixelId: settings.googleTagId ?? null,
        hasToken: Boolean(settings.googleApiSecret),
        active: Boolean(settings.googleTagId),
        trackingCode: settings.googleTagId
          ? generateGoogleSnippet(settings.googleTagId)
          : null,
      },
      {
        platform: "TikTok",
        key: "tiktok",
        pixelId: settings.tiktokPixelId ?? null,
        hasToken: Boolean(settings.tiktokAccessToken),
        active: Boolean(settings.tiktokPixelId),
        trackingCode: settings.tiktokPixelId
          ? generateTikTokSnippet(settings.tiktokPixelId)
          : null,
      },
    ];

    res.json({
      pixels,
      academyName: settings.academyName,
      currency: settings.currency,
    });
  } catch (err: any) {
    req.log.error({ err }, "Error fetching pixel status");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/analyze", async (req, res) => {
  try {
    const tenantId = req.tenantId ?? (await getDefaultTenantId());

    const [settings] = await db
      .select({
        metaPixelId: settingsTable.metaPixelId,
        metaConversionToken: settingsTable.metaConversionToken,
        googleTagId: settingsTable.googleTagId,
        googleApiSecret: settingsTable.googleApiSecret,
        tiktokPixelId: settingsTable.tiktokPixelId,
        tiktokAccessToken: settingsTable.tiktokAccessToken,
        academyName: settingsTable.academyName,
        currency: settingsTable.currency,
      })
      .from(settingsTable)
      .where(eq(settingsTable.tenantId, tenantId))
      .limit(1);

    const activePixels: string[] = [];
    const missingPixels: string[] = [];
    const pixelIds: Record<string, string> = {};

    if (settings?.metaPixelId) {
      activePixels.push("Meta (Facebook) Pixel");
      pixelIds["Meta Pixel ID"] = settings.metaPixelId;
      if (!settings.metaConversionToken) {
        missingPixels.push("Meta Conversion API Token (missing)");
      }
    } else {
      missingPixels.push("Meta (Facebook) Pixel");
    }

    if (settings?.googleTagId) {
      activePixels.push("Google Tag Manager");
      pixelIds["Google Tag ID"] = settings.googleTagId;
      if (!settings.googleApiSecret) {
        missingPixels.push("Google API Secret (missing)");
      }
    } else {
      missingPixels.push("Google Tag Manager");
    }

    if (settings?.tiktokPixelId) {
      activePixels.push("TikTok Pixel");
      pixelIds["TikTok Pixel ID"] = settings.tiktokPixelId;
      if (!settings.tiktokAccessToken) {
        missingPixels.push("TikTok Access Token (missing)");
      }
    } else {
      missingPixels.push("TikTok Pixel");
    }

    const pixelSummary =
      activePixels.length > 0
        ? `Active pixels: ${activePixels.join(", ")}.\nConfigured IDs: ${JSON.stringify(pixelIds)}.`
        : "No pixels are currently configured.";

    const missingSummary =
      missingPixels.length > 0
        ? `Missing or incomplete: ${missingPixels.join(", ")}.`
        : "All pixels are fully configured.";

    const academyName = settings?.academyName ?? "this online academy";
    const currency = settings?.currency ?? "USD";

    const prompt = `You are a digital marketing expert specializing in online education platforms.

Academy: "${academyName}" (currency: ${currency})

Pixel Configuration Status:
${pixelSummary}
${missingSummary}

Please provide a concise, actionable marketing analysis in the same language the admin would prefer (detect from academy name — if Arabic, respond in Arabic; otherwise respond in English). 

Your response must include:

1. **Overall Assessment** — Brief evaluation of the current pixel setup (2-3 sentences).
2. **Priority Recommendations** — Top 3 specific actions to improve tracking and ad performance, ordered by impact.
3. **Tracking Code Tips** — For each ACTIVE pixel, suggest one specific event to track (e.g., "Track 'Purchase' event on checkout confirmation page"). Include the pixel ID in the suggestion.
4. **Missing Pixels** — For any missing pixel, explain in one sentence why it matters for an online academy.
5. **Quick Win** — One immediate action the admin can take today to improve their ad performance.

Be specific, practical, and concise. No generic advice — tailor everything to an online course platform.`;

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    res.setHeader("X-Accel-Buffering", "no");

    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-6",
      max_tokens: 8192,
      messages: [{ role: "user", content: prompt }],
    });

    for await (const event of stream) {
      if (
        event.type === "content_block_delta" &&
        event.delta.type === "text_delta"
      ) {
        res.write(`data: ${JSON.stringify({ content: event.delta.text })}\n\n`);
      }
    }

    res.write(`data: ${JSON.stringify({ done: true })}\n\n`);
    res.end();
  } catch (err: any) {
    req.log.error({ err }, "Error in marketing AI analyze");
    if (!res.headersSent) {
      res.status(500).json({ error: "AI analysis failed" });
    } else {
      res.write(`data: ${JSON.stringify({ error: "AI analysis failed" })}\n\n`);
      res.end();
    }
  }
});

function generateMetaSnippet(pixelId: string): string {
  return `<!-- Meta Pixel Code -->
<script>
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window,document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '${pixelId}');
fbq('track', 'PageView');
</script>
<noscript><img height="1" width="1" style="display:none"
src="https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1"/></noscript>
<!-- End Meta Pixel Code -->`;
}

function generateGoogleSnippet(tagId: string): string {
  return `<!-- Google Tag Manager -->
<script async src="https://www.googletagmanager.com/gtag/js?id=${tagId}"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${tagId}');
</script>
<!-- End Google Tag Manager -->`;
}

function generateTikTokSnippet(pixelId: string): string {
  return `<!-- TikTok Pixel Code -->
<script>
!function (w, d, t) {
  w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];
  ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"];
  ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};
  for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);
  ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e};
  ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{};ttq._i[e]=[];ttq._i[e]._u=i;ttq._t=ttq._t||{};ttq._t[e]=+new Date;ttq._o=ttq._o||{};ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript";o.async=!0;o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
  ttq.load('${pixelId}');
  ttq.page();
}(window, document, 'ttq');
</script>
<!-- End TikTok Pixel Code -->`;
}

export default router;
