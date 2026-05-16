import { Router } from "express";
import { db, superAdminsTable, tenantsTable, settingsTable, adminUsersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const router = Router();
const SECRET = process.env["SESSION_SECRET"] ?? "nextedu-super-secret";
const SA_TOKEN_PREFIX = "sa_";

function signToken(payload: { id: number; email: string }) {
  return jwt.sign({ ...payload, role: "super_admin" }, SECRET, { expiresIn: "24h" });
}

function verifySuperAdmin(token: string) {
  const decoded = jwt.verify(token, SECRET) as { id: number; email: string; role: string };
  if (decoded.role !== "super_admin") throw new Error("Not super admin");
  return decoded;
}

function requireSuperAdmin(req: any, res: any, next: any) {
  const auth = req.headers["authorization"];
  if (!auth?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
  try {
    const decoded = verifySuperAdmin(auth.slice(7));
    req.superAdminId = decoded.id;
    next();
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
}

// ── Auth ─────────────────────────────────────────────────────────────────────

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "email and password required" });

    const [sa] = await db.select().from(superAdminsTable).where(eq(superAdminsTable.email, email)).limit(1);
    if (!sa) return res.status(401).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, sa.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = signToken({ id: sa.id, email: sa.email });
    res.json({ token, superAdmin: { id: sa.id, email: sa.email, name: sa.name } });
  } catch (err) {
    req.log.error({ err }, "Super admin login error");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/me", requireSuperAdmin, async (req: any, res) => {
  try {
    const [sa] = await db.select().from(superAdminsTable).where(eq(superAdminsTable.id, req.superAdminId)).limit(1);
    if (!sa) return res.status(404).json({ error: "Not found" });
    res.json({ id: sa.id, email: sa.email, name: sa.name });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── Tenant Management ─────────────────────────────────────────────────────────

router.get("/tenants", requireSuperAdmin, async (req, res) => {
  try {
    const tenants = await db
      .select({
        id: tenantsTable.id,
        slug: tenantsTable.slug,
        name: tenantsTable.name,
        status: tenantsTable.status,
        plan: tenantsTable.plan,
        planExpiresAt: tenantsTable.planExpiresAt,
        createdAt: tenantsTable.createdAt,
        customDomain: tenantsTable.customDomain,
        academyName: settingsTable.academyName,
        logoUrl: settingsTable.logoUrl,
      })
      .from(tenantsTable)
      .leftJoin(settingsTable, eq(settingsTable.tenantId, tenantsTable.id))
      .orderBy(tenantsTable.createdAt);
    res.json(tenants);
  } catch (err) {
    req.log.error({ err }, "Error fetching tenants");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/tenants", requireSuperAdmin, async (req, res) => {
  try {
    const { name, slug, adminEmail, adminPassword, plan, planExpiresAt } = req.body;
    if (!name || !slug || !adminEmail || !adminPassword) {
      return res.status(400).json({ error: "name, slug, adminEmail, adminPassword required" });
    }

    const hashed = await bcrypt.hash(adminPassword, 10);

    const result = await db.transaction(async (tx) => {
      // Create tenant
      const [tenant] = await tx
        .insert(tenantsTable)
        .values({ name, slug, status: "active", plan: plan ?? "starter", planExpiresAt: planExpiresAt ? new Date(planExpiresAt) : null })
        .returning();

      // Create settings
      await tx.insert(settingsTable).values({ tenantId: tenant!.id, academyName: name });

      // Create admin user
      await tx.insert(adminUsersTable).values({
        tenantId: tenant!.id,
        email: adminEmail,
        password: hashed,
        name: `${name} Admin`,
      });

      return tenant;
    });

    res.status(201).json({ tenant: result, adminEmail, message: "Academy created successfully" });
  } catch (err: any) {
    req.log.error({ err }, "Error creating tenant");
    if (err.code === "23505") return res.status(409).json({ error: "Slug already taken" });
    res.status(500).json({ error: err.message ?? "Internal server error" });
  }
});

router.patch("/tenants/:id", requireSuperAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { plan, status, planExpiresAt, name, customDomain } = req.body;

    const updates: Record<string, any> = {};
    if (plan) updates.plan = plan;
    if (status) updates.status = status;
    if (planExpiresAt !== undefined) updates.planExpiresAt = planExpiresAt ? new Date(planExpiresAt) : null;
    if (name) updates.name = name;
    if (customDomain !== undefined) updates.customDomain = customDomain || null;

    const [updated] = await db.update(tenantsTable).set(updates).where(eq(tenantsTable.id, id)).returning();
    if (!updated) return res.status(404).json({ error: "Tenant not found" });
    res.json(updated);
  } catch (err) {
    req.log.error({ err }, "Error updating tenant");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.delete("/tenants/:id", requireSuperAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);
    await db.delete(tenantsTable).where(eq(tenantsTable.id, id));
    res.json({ message: "Academy deleted" });
  } catch (err) {
    req.log.error({ err }, "Error deleting tenant");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;