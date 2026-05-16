import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const superAdminsTable = pgTable("super_admins", {
  id: serial("id").primaryKey(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull().default("Super Admin"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertSuperAdminSchema = createInsertSchema(superAdminsTable).omit({
  id: true,
  createdAt: true,
});

export type SuperAdmin = typeof superAdminsTable.$inferSelect;
export type InsertSuperAdmin = z.infer<typeof insertSuperAdminSchema>;
