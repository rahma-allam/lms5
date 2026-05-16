import { Router } from "express";
import { db, planPricingTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import jwt from "jsonwebtoken";

const router = Router();
const SECRET = process.env["SESSION_SECRET"] ?? "nextedu-super-secret";

function requireSuperAdmin(req: any, res: any, next: any) {
  const auth = req.headers["authorization"];
  if (!auth?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decoded = jwt.verify(auth.slice(7), SECRET) as { role: string };
    if (decoded.role !== "super_admin") throw new Error();
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// Public — returns all plan pricing
router.get("/", async (req, res) => {
  try {
    const pricing = await db.select().from(planPricingTable).orderBy(planPricingTable.sortOrder);
    res.json(pricing);
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Super admin — update pricing for a plan
router.put("/:plan", requireSuperAdmin, async (req, res) => {
  try {
    const plan = req.params.plan;
    const {
      nameAr, nameEn, descriptionAr, descriptionEn,
      priceMonthlyEgp, priceAnnualEgp, priceMonthlyUsd, priceAnnualUsd,
      discountAnnualPct, featuresAr, featuresEn, isPopular, sortOrder,
    } = req.body;

    const [existing] = await db.select().from(planPricingTable).where(eq(planPricingTable.plan, plan)).limit(1);

    const values: any = {
      plan,
      nameAr: nameAr ?? existing?.nameAr ?? plan,
      nameEn: nameEn ?? existing?.nameEn ?? plan,
      descriptionAr: descriptionAr ?? existing?.descriptionAr,
      descriptionEn: descriptionEn ?? existing?.descriptionEn,
      priceMonthlyEgp: priceMonthlyEgp ?? existing?.priceMonthlyEgp ?? 0,
      priceAnnualEgp: priceAnnualEgp ?? existing?.priceAnnualEgp ?? 0,
      priceMonthlyUsd: priceMonthlyUsd ?? existing?.priceMonthlyUsd ?? 0,
      priceAnnualUsd: priceAnnualUsd ?? existing?.priceAnnualUsd ?? 0,
      discountAnnualPct: discountAnnualPct ?? existing?.discountAnnualPct ?? 20,
      featuresAr: featuresAr ?? existing?.featuresAr,
      featuresEn: featuresEn ?? existing?.featuresEn,
      isPopular: isPopular ?? existing?.isPopular ?? 0,
      sortOrder: sortOrder ?? existing?.sortOrder ?? 0,
      updatedAt: new Date(),
    };

    let result;
    if (existing) {
      [result] = await db.update(planPricingTable).set(values).where(eq(planPricingTable.plan, plan)).returning();
    } else {
      [result] = await db.insert(planPricingTable).values(values).returning();
    }

    res.json(result);
  } catch (err: any) {
    req.log.error({ err }, "Error updating plan pricing");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
