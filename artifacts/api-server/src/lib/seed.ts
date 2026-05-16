/**
 * Auto-seeds the NextEdu initial data on first startup:
 * - Super admin: rahma@nextedu.com
 * - Plan pricing for starter / pro / elite
 */
import { db, superAdminsTable, planPricingTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { logger } from "./logger.js";

async function seedSuperAdmin() {
  const email = "rahma@nextedu.com";
  const existing = await db.select().from(superAdminsTable).where(eq(superAdminsTable.email, email)).limit(1);
  if (existing.length > 0) return;
  const hashed = await bcrypt.hash("NextEdu@2024!", 10);
  await db.insert(superAdminsTable).values({ email, password: hashed, name: "رحمة" });
  logger.info({ email }, "Super admin seeded");
}

const PLANS = [
  {
    plan: "starter", nameAr: "المعلم المستقل", nameEn: "Independent",
    descriptionAr: "للمعلمين الذين يبدأون رحلتهم في التعليم الإلكتروني",
    descriptionEn: "For educators starting their e-learning journey",
    priceMonthlyEgp: 199, priceAnnualEgp: 1590,
    priceMonthlyUsd: 999, priceAnnualUsd: 7990,
    discountAnnualPct: 20,
    featuresAr: "رفع كورسات مسجلة|تتبع الطلاب|شات مباشر مع طلابك|لوحة تحكم كاملة|تقارير الأداء",
    featuresEn: "Upload recorded courses|Student tracking|Direct student chat|Full admin panel|Performance reports",
    isPopular: 0, sortOrder: 0,
  },
  {
    plan: "pro", nameAr: "الأكاديمية", nameEn: "Academy",
    descriptionAr: "للأكاديميات التي تريد توسيع فريقها وتحقيق نمو حقيقي",
    descriptionEn: "For academies looking to scale their team and achieve real growth",
    priceMonthlyEgp: 399, priceAnnualEgp: 3190,
    priceMonthlyUsd: 1999, priceAnnualUsd: 15990,
    discountAnnualPct: 20,
    featuresAr: "كل مميزات Starter|مدربون متعددون|ربط البكسلات (FB/Google/TikTok)|تعدد عملات الدفع|سعر EGP + USD للكورسات",
    featuresEn: "Everything in Starter|Multiple instructors|Pixel integrations (FB/Google/TikTok)|Multi-currency|EGP + USD course pricing",
    isPopular: 1, sortOrder: 1,
  },
  {
    plan: "elite", nameAr: "المؤسسة الذكية", nameEn: "Enterprise AI",
    descriptionAr: "للمؤسسات التعليمية الكبرى التي تريد الهيمنة على السوق",
    descriptionEn: "For large institutions aiming to dominate the market",
    priceMonthlyEgp: 799, priceAnnualEgp: 6390,
    priceMonthlyUsd: 3999, priceAnnualUsd: 31990,
    discountAnnualPct: 20,
    featuresAr: "كل مميزات Pro|تسويق بالذكاء الاصطناعي|رقابة شات المدربين|دومين خاص|تخصيص الهوية والألوان|أولوية الدعم الفني",
    featuresEn: "Everything in Pro|AI Marketing intelligence|Instructor chat monitoring|Custom domain|Full branding|Priority support",
    isPopular: 0, sortOrder: 2,
  },
];

async function seedPlanPricing() {
  for (const p of PLANS) {
    const exists = await db.select().from(planPricingTable).where(eq(planPricingTable.plan, p.plan)).limit(1);
    if (exists.length === 0) {
      await db.insert(planPricingTable).values({ ...p, updatedAt: new Date() });
      logger.info({ plan: p.plan }, "Plan pricing seeded");
    }
  }
}

export async function runStartupSeed() {
  try {
    await seedSuperAdmin();
    await seedPlanPricing();
  } catch (err) {
    logger.error({ err }, "Startup seed error — continuing anyway");
  }
}
