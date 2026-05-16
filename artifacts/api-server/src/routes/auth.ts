import { Router } from "express";
import { db, studentsTable, settingsTable, passwordResetTokensTable } from "@workspace/db";
import { eq, and } from "drizzle-orm";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { sendPasswordResetEmail } from "../lib/email.js";
import crypto from "node:crypto";

const router = Router();
const JWT_SECRET = process.env["SESSION_SECRET"] || "lms-secret-key";
const SALT_ROUNDS = 10;

// POST /api/auth/register
router.post("/register", async (req, res) => {
  try {
    const tenantId = req.tenantId;
    if (!tenantId) return res.status(400).json({ error: "Academy not found" });

    const { name, email, password, phone } = req.body;
    if (!name || !email || !password) return res.status(400).json({ error: "name, email, and password are required" });

    const [existing] = await db
      .select({ id: studentsTable.id })
      .from(studentsTable)
      .where(and(eq(studentsTable.email, email), eq(studentsTable.tenantId, tenantId)));

    if (existing) return res.status(409).json({ error: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const [student] = await db
      .insert(studentsTable)
      .values({ name, email, password: hashedPassword, phone: phone ?? null, status: "pending", paymentStatus: "pending", tenantId })
      .returning();

    const token = jwt.sign(
      { id: student!.id, email: student!.email, name: student!.name, tenantId },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      user: { id: student!.id, name: student!.name, email: student!.email, phone: student!.phone ?? null, status: student!.status, paymentStatus: student!.paymentStatus },
    });
  } catch (err) {
    req.log.error({ err }, "Error registering student");
    res.status(500).json({ error: "Internal server error" });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const tenantId = req.tenantId;
    if (!tenantId) return res.status(400).json({ error: "Academy not found" });

    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ error: "email and password are required" });

    const [student] = await db
      .select()
      .from(studentsTable)
      .where(and(eq(studentsTable.email, email), eq(studentsTable.tenantId, tenantId)));

    if (!student) return res.status(401).json({ error: "Invalid email or password" });

    let passwordValid = false;
    if (student.password) passwordValid = await bcrypt.compare(password, student.password);
    if (!passwordValid) return res.status(401).json({ error: "Invalid email or password" });

    const token = jwt.sign(
      { id: student.id, email: student.email, name: student.name, tenantId },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: { id: student.id, name: student.name, email: student.email, phone: student.phone ?? null, status: student.status, paymentStatus: student.paymentStatus, courseId: student.courseId ?? null },
    });
  } catch (err) {
    req.log.error({ err }, "Error logging in");
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/auth/me
router.get("/me", async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) return res.status(401).json({ error: "No token provided" });

    const token = authHeader.slice(7);
    let decoded: any;
    try { decoded = jwt.verify(token, JWT_SECRET); }
    catch { return res.status(401).json({ error: "Invalid or expired token" }); }

    const [student] = await db
      .select({ id: studentsTable.id, name: studentsTable.name, email: studentsTable.email, phone: studentsTable.phone, status: studentsTable.status, paymentStatus: studentsTable.paymentStatus, courseId: studentsTable.courseId, progress: studentsTable.progress })
      .from(studentsTable)
      .where(and(eq(studentsTable.id, decoded.id), eq(studentsTable.tenantId, decoded.tenantId)));

    if (!student) return res.status(404).json({ error: "User not found" });

    res.json({ id: student.id, name: student.name, email: student.email, phone: student.phone ?? null, status: student.status, paymentStatus: student.paymentStatus, courseId: student.courseId ?? null, progress: Number(student.progress) });
  } catch (err) {
    req.log.error({ err }, "Error fetching current user");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── Forgot Password (Student) ─────────────────────────────────────────────────

router.post("/forgot-password", async (req, res) => {
  try {
    const tenantId = req.tenantId;
    if (!tenantId) return res.status(400).json({ error: "Academy not found" });

    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "email required" });

    const [student] = await db
      .select()
      .from(studentsTable)
      .where(and(eq(studentsTable.email, email), eq(studentsTable.tenantId, tenantId)))
      .limit(1);

    // Always return success to prevent email enumeration
    if (!student) return res.json({ message: "If this email exists, a reset link has been sent" });

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await db.insert(passwordResetTokensTable).values({
      token,
      userType: "student",
      userId: student.id,
      tenantId,
      expiresAt,
    });

    const origin = (req.headers["origin"] as string) || `https://${req.headers["host"]}`;
    const tenantSlug = (req as any).__tenantSlug__ ?? "";
    const tenantQ = tenantSlug ? `&tenant=${tenantSlug}` : "";
    const resetLink = `${origin}/reset-password?token=${token}&type=student${tenantQ}`;

    const [settings] = await db.select().from(settingsTable).where(eq(settingsTable.tenantId, tenantId)).limit(1);
    const academyName = settings?.academyName ?? "NextEdu Academy";
    const lang = settings?.defaultLanguage ?? "ar";

    const result = await sendPasswordResetEmail({ to: email, resetLink, academyName, lang });

    res.json({
      message: "If this email exists, a reset link has been sent",
      ...(result.devMode && { _devResetLink: resetLink }),
    });
  } catch (err) {
    req.log.error({ err }, "Error in student forgot-password");
    res.status(500).json({ error: "Internal server error" });
  }
});

// ── Reset Password (Student) ──────────────────────────────────────────────────

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
        eq(passwordResetTokensTable.userType, "student")
      ))
      .limit(1);

    if (!resetToken) return res.status(400).json({ error: "Invalid or expired reset link" });
    if (resetToken.usedAt) return res.status(400).json({ error: "Reset link already used" });
    if (new Date() > resetToken.expiresAt) return res.status(400).json({ error: "Reset link has expired. Please request a new one." });

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);
    await db.update(studentsTable).set({ password: hashed }).where(eq(studentsTable.id, resetToken.userId));
    await db.update(passwordResetTokensTable).set({ usedAt: new Date() }).where(eq(passwordResetTokensTable.id, resetToken.id));

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    req.log.error({ err }, "Error in student reset-password");
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
