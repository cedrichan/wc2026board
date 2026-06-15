const ESPN_IMAGE_HOSTS = new Set([
  "a.espncdn.com",
]);

const HTML_TAG = /<[^>]*>/g;
const WHITESPACE = /\s+/g;

export function sanitizeProviderText(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;

  const withoutControls = [...value]
    .filter((character) => {
      const code = character.charCodeAt(0);
      return code === 9 || code === 10 || code === 13 || (code >= 32 && code !== 127);
    })
    .join("");
  const sanitized = withoutControls
    .replace(HTML_TAG, " ")
    .replace(WHITESPACE, " ")
    .trim();

  return sanitized || undefined;
}

export function sanitizeEspnImageUrl(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;

  try {
    const url = new URL(value);
    if (
      url.protocol !== "https:" ||
      url.username ||
      url.password ||
      url.port ||
      !ESPN_IMAGE_HOSTS.has(url.hostname.toLowerCase())
    ) {
      return undefined;
    }
    return url.href;
  } catch {
    return undefined;
  }
}

export function normalizeIsoTimestamp(value: unknown): string | undefined {
  if (typeof value !== "string" || !value.trim()) return undefined;
  const timestamp = Date.parse(value);
  return Number.isFinite(timestamp) ? new Date(timestamp).toISOString() : undefined;
}
