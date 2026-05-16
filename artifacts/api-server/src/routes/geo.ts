import { Router } from "express";

const router = Router();

// Detect country/currency from client IP using free ipapi.co
router.get("/", async (req, res) => {
  try {
    const ip =
      (req.headers["x-forwarded-for"] as string)?.split(",")[0]?.trim() ||
      req.socket.remoteAddress ||
      "";

    // Skip localhost/private IPs — default to EGP for local dev
    const isLocal = !ip || ip === "127.0.0.1" || ip === "::1" || ip.startsWith("192.168") || ip.startsWith("10.");

    if (isLocal) {
      return res.json({ country: "EG", currency: "EGP", isLocal: true });
    }

    const apiRes = await fetch(`https://ipapi.co/${ip}/json/`, {
      headers: { "User-Agent": "NextEdu/1.0" },
      signal: AbortSignal.timeout(3000),
    });

    if (!apiRes.ok) throw new Error("ipapi failed");

    const data = await apiRes.json() as { country_code?: string; currency?: string };
    const country = data.country_code ?? "US";
    const currency = country === "EG" ? "EGP" : "USD";

    res.json({ country, currency, isLocal: false });
  } catch {
    // Fallback to USD on error
    res.json({ country: "US", currency: "USD", isLocal: false });
  }
});

export default router;
