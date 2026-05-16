import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const planPricingTable = pgTable("plan_pricing", {
  id: serial("id").primaryKey(),
  plan: text("plan").notNull().unique(),
  nameAr: text("name_ar").notNull(),
  nameEn: text("name_en").notNull(),
  descriptionAr: text("description_ar"),
  descriptionEn: text("description_en"),
  priceMonthlyEgp: integer("price_monthly_egp").notNull().default(0),
  priceAnnualEgp: integer("price_annual_egp").notNull().default(0),
  priceMonthlyUsd: integer("price_monthly_usd_cents").notNull().default(0),
  priceAnnualUsd: integer("price_annual_usd_cents").notNull().default(0),
  discountAnnualPct: integer("discount_annual_pct").notNull().default(20),
  featuresAr: text("features_ar"),
  featuresEn: text("features_en"),
  isPopular: integer("is_popular").notNull().default(0),
  sortOrder: integer("sort_order").notNull().default(0),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertPlanPricingSchema = createInsertSchema(planPricingTable).omit({
  id: true,
  updatedAt: true,
});

export type PlanPricing = typeof planPricingTable.$inferSelect;
export type InsertPlanPricing = z.infer<typeof insertPlanPricingSchema>;
