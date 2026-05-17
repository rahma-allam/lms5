/**
 * tenantNav.ts
 * Shared utility: always append ?tenant=<slug> to internal storefront URLs.
 * Import { t } from here instead of duplicating the helper everywhere.
 */

export function getSlug(): string {
  return (
    new URLSearchParams(window.location.search).get("tenant") ||
    localStorage.getItem("tenant_slug") ||
    ""
  );
}

/** Build a storefront URL with the tenant slug preserved */
export function toStorefront(path: string): string {
  const slug = getSlug();
  if (!slug) return path;
  const sep = path.includes("?") ? "&" : "?";
  return `${path}${sep}tenant=${slug}`;
}