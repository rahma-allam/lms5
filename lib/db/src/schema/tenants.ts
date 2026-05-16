import { pgTable, serial, text, pgEnum, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const tenantStatusEnum = pgEnum("tenant_status", [
  "active",
  "suspended",
  "trial",
]);

export const tenantsTable = pgTable("tenants", {
  id: serial("id").primaryKey(),
  slug: text("slug").notNull().unique(),
  customDomain: text("custom_domain").unique(),
  name: text("name").notNull(),
  status: tenantStatusEnum("status").notNull().default("trial"),
  plan: text("plan").notNull().default("starter"),
  planExpiresAt: timestamp("plan_expires_at"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertTenantSchema = createInsertSchema(tenantsTable).omit({
  id: true,
  createdAt: true,
});

export type Tenant = typeof tenantsTable.$inferSelect;
export type InsertTenant = z.infer<typeof insertTenantSchema>;
