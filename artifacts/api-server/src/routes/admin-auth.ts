import { Router } from "express";
import { db, adminUsersTable, settingsTable, passwordResetTokensTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendPasswordResetEmail } from "../lib/email.js";
import crypto from "node:crypto";

const router = Router();
const SECRET = process.env["SESSION_SECRET"] ?? "admin-secret-key-change-in-production";

function signToken(payload: { id: number; email: string; role: string; tenantId: number }) {
  return jwt.sign(payload, SECRET, { expiresIn: "8h" });
}

export function verifyAdminToken(token: string) {
  return jwt.verify(token, SECRET) as { id: number; email: string; role: string; tenantId: number };
}

router.post("/setup", async (req, res) => {
  try {
    const tenantId = req.tenantId;
    if (!tenantId) return res.status(400).json({ error: "Academy not found" });

    const existing = await db
      .select()
      .from(adminUsersTable)
      .where(eq(adminUsersTable.tenantId, tenantId))
      .limit(1);

    if (existing.length > 0) return res.status(403).json({ error: "Admin already exists" });

    const { email, password, name } = req.body;
    if (!email || !password) return res.status(400).json({ error: "email and password required" });

    const hashed = await bcrypt.hash(password, 10);
    const [admin] = await db
      .insert(adminUsersTable)
      .values({ email, password: hashed, name: name ?? "Admin", tenantId })
      .returning();

    res.json({ message: "Admin created", admin: { id: admin!.id, email: admin!.email, name: admin!.name } });
  } catch (err) {
    req.log.error({ err }, "Error in admin setup");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const tenantId = req.tenantId;
    if (!tenantId) return res.status(400).json({ error: "Academy not found" });

    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "email and password required" });

    const [admin] = await db
      .select()
      .from(adminUsersTable)
      .where(and(
        eq(adminUsersTable.email, email),
        eq(adminUsersTable.tenantId, tenantId)
      ));

    if (!admin) return res.status(401).json({ error: "Invalid credentials" });

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });

    const token = signToken({ id: admin.id, email: admin.email, role: admin.role, tenantId });
    res.json({ token, admin: { id: admin.id, email: admin.email, name: admin.name, role: admin.role } });
  } catch (err) {
    req.log.error({ err }, "Error in admin login");
    res.status(500).json({ error: "Internal server error" });
  }
});

router.get("/me", async (req, res) => {
  try {
    const auth = req.headers["authorization"];
    if (!auth?.startsWith("Bearer ")) return res.status(401).json({ error: "Unauthorized" });
    const token = auth.slice(7);
    const payload = verifyAdminToken(token);
    const [admin] = await db
      .select()
      .from(adminUsersTable)
      .where(and(
        eq(adminUsersTable.id, payload.id),
        eq(adminUsersTable.tenantId, payload.tenantId)
      ));
    if (!admin) return res.status(401).json({ error: "Admin not found" });
    res.json({ id: admin.id, email: admin.email, name: admin.name, role: admin.role });
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
});

// ── Forgot Password ───────────────────────────────────────────────────────────

router.post("/forgot-password", async (req, res) => {
  try {
    const tenantId = req.tenantId;
    if (!tenantId) return res.status(400).json({ error: "Academy not found" });

    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "email required" });

    const [admin] = await db
      .select()
      .from(adminUsersTable)
      .where(and(eq(adminUsersTable.email, email), eq(adminUsersTable.tenantId, tenantId)))
      .limit(1);

    // Always return success to prevent email enumeration
    if (!admin) return res.json({ message: "If this email exists, a reset link has been sent" });

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.insert(passwordResetTokensTable).values({
      token,
      userType: "admin",
      userId: admin.id,
      tenantId,
      expiresAt,
    });

    const origin = (req.headers["origin"] as string) || `https://${req.headers["host"]}`;
    const tenantSlug = (req as any).__tenantSlug__ ?? "";
    const tenantQ = tenantSlug ? `&tenant=${tenantSlug}` : "";
    const resetLink = `${origin}/reset-password?token=${token}&type=admin${tenantQ}`;

    const [settings] = await db.select().from(settingsTable).where(eq(settingsTable.tenantId, tenantId)).limit(1);
    const academyName = settings?.academyName ?? "NextEdu Academy";

    const result = await sendPasswordResetEmail({ to: email, resetLink, academyName });

    res.json({
      message: "If this email exists, a reset link has been sent",
      ...(result.devMode && { _devResetLink: resetLink }),
    });
  } catch (err) {
    req.log.error({ err }, "Error in admin forgot-password");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── Reset Password ────────────────────────────────────────────────────────────

router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;
    if (!token || !password) return res.status(400).json({ error: "token and password required" });
    if (password.length < 8) return res.status(400).json({ error: "Password must be at least 8 characters" });

    const [resetToken] = await db
      .select()
      .from(passwordResetTokensTable)
      .where(and(
        eq(passwordResetTokensTable.token, token),
        eq(passwordResetTokensTable.userType, "admin")
      ))
      .limit(1);

    if (!resetToken) return res.status(400).json({ error: "Invalid or expired reset link" });
    if (resetToken.usedAt) return res.status(400).json({ error: "Reset link already used" });
    if (new Date() > resetToken.expiresAt) return res.status(400).json({ error: "Reset link has expired. Please request a new one." });

    const hashed = await bcrypt.hash(password, 10);
    await db.update(adminUsersTable).set({ password: hashed }).where(eq(adminUsersTable.id, resetToken.userId));
    await db.update(passwordResetTokensTable).set({ usedAt: new Date() }).where(eq(passwordResetTokensTable.id, resetToken.id));

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    req.log.error({ err }, "Error in admin reset-password");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
