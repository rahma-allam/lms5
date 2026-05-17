// src/lib/fetchWithAuth.ts
// ← الإصلاح: نفس الـ key اللي بيستخدمه adminAuth.tsx وهو "lms_admin_token"
const TOKEN_KEY = "lms_admin_token";

export const fetchWithAuth = (url: string, options?: RequestInit) => {
  const token = localStorage.getItem(TOKEN_KEY);
  const tenant = localStorage.getItem("tenant_slug");
  const sep = url.includes("?") ? "&" : "?";
  return fetch(`${url}${tenant ? `${sep}tenant=${tenant}` : ""}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options?.headers ?? {}),
    },
  });
};