/**
 * Sanitize a `callbackUrl` query param into a safe internal path. Only relative
 * paths beginning with a single "/" are allowed — this blocks open-redirects to
 * external origins (e.g. "//evil.com" or "https://evil.com"). Falls back to the
 * home page.
 *
 * Backslashes are rejected: browsers normalize "\" to "/" in URLs, so
 * "/\evil.com" (or "\/evil.com") would resolve as protocol-relative and escape
 * the origin despite starting with a single "/".
 */
export function safeCallbackUrl(
  raw: string | null | undefined,
  fallback = "/",
): string {
  if (!raw) return fallback;
  if (raw.includes("\\")) return fallback;
  if (!raw.startsWith("/") || raw.startsWith("//")) return fallback;
  return raw;
}
