/**
 * NextEdu seed script
 * Run: pnpm --filter @workspace/db run seed
 */
import { db } from "./index.js";
import { superAdminsTable, planPricingTable } from "./schema/index.js";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";

async function main() {
  console.log("🌱 Seeding NextEdu data...");

  // ── Super Admin ──────────────────────────────────────────────
  const email = "rahma@nextedu.com";
  const existing = await db.select().from(superAdminsTable).where(eq(superAdminsTable.email, email)).limit(1);
  if (existing.length === 0) {
    const hashed = await bcrypt.hash("NextEdu@2024!", 10);
    await db.insert(superAdminsTable).values({
      email,
      password: hashed,
      name: "رحمة — Super Admin",
    });
    console.log("✅ Super admin created: rahma@nextedu.com / NextEdu@2024!");
  } else {
    console.log("ℹ️  Super admin already exists, skipping.");
  }

  // ── Plan Pricing ─────────────────────────────────────────────
  const plans = [
    {
      plan: "starter",
      nameAr: "المعلم المستقل",
      nameEn: "Independent",
      descriptionAr: "للمعلمين الذين يبدأون رحلتهم في التعليم الإلكتروني",
      descriptionEn: "For educators starting their e-learning journey",
      priceMonthlyEgp: 199,
      priceAnnualEgp: 1590,
      priceMonthlyUsd: 999,   // $9.99
      priceAnnualUsd: 7990,   // $79.90
      discountAnnualPct: 20,
      featuresAr: "رفع كورسات مسجلة|تتبع الطلاب|شات مباشر مع طلابك|لوحة تحكم كاملة|تقارير الأداء",
      featuresEn: "Upload recorded courses|Student tracking|Direct student chat|Full admin panel|Performance reports",
      isPopular: 0,
      sortOrder: 0,
    },
    {
      plan: "pro",
      nameAr: "الأكاديمية",
      nameEn: "Academy",
      descriptionAr: "للأكاديميات التي تريد توسيع فريقها وتحقيق نمو حقيقي",
      descriptionEn: "For academies looking to scale their team and achieve real growth",
      priceMonthlyEgp: 399,
      priceAnnualEgp: 3190,
      priceMonthlyUsd: 1999,   // $19.99
      priceAnnualUsd: 15990,   // $159.90
      discountAnnualPct: 20,
      featuresAr: "كل مميزات Starter|مدربون متعددون|ربط البكسلات (FB/Google/TikTok)|تعدد عملات الدفع|سعر EGP + USD للكورسات",
      featuresEn: "Everything in Starter|Multiple instructors|Pixel integrations (FB/Google/TikTok)|Multi-currency|EGP + USD course pricing",
      isPopular: 1,
      sortOrder: 1,
    },
    {
      plan: "elite",
      nameAr: "المؤسسة الذكية",
      nameEn: "Enterprise AI",
      descriptionAr: "للمؤسسات التعليمية الكبرى التي تريد الهيمنة على السوق",
      descriptionEn: "For large institutions aiming to dominate the market",
      priceMonthlyEgp: 799,
      priceAnnualEgp: 6390,
      priceMonthlyUsd: 3999,   // $39.99
      priceAnnualUsd: 31990,   // $319.90
      discountAnnualPct: 20,
      featuresAr: "كل مميزات Pro|تسويق بالذكاء الاصطناعي|رقابة شات المدربين|دومين خاص|تخصيص الهوية والألوان|أولوية الدعم الفني",
      featuresEn: "Everything in Pro|AI Marketing intelligence|Instructor chat monitoring|Custom domain|Full branding|Priority support",
      isPopular: 0,
      sortOrder: 2,
    },
  ];

  for (const p of plans) {
    const exists = await db.select().from(planPricingTable).where(eq(planPricingTable.plan, p.plan)).limit(1);
    if (exists.length === 0) {
      await db.insert(planPricingTable).values({ ...p, updatedAt: new Date() });
      console.log(`✅ Plan pricing created: ${p.plan}`);
    } else {
      console.log(`ℹ️  Plan ${p.plan} already exists, skipping.`);
    }
  }

  console.log("🎉 Seed complete!");
  process.exit(0);
}

main().catch(err => { console.error("❌ Seed error:", err); process.exit(1); });
