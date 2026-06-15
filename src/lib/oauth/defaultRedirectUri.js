import { XAI_REDIRECT_URI } from "./constants/xai";

const DEFAULT_REDIRECT_URIS = {
  codex: "http://localhost:1455/auth/callback",
  xai: XAI_REDIRECT_URI,
};

/**
 * Resolve OAuth redirect URI without exposing loopback hosts in public URL query strings
 * (Cloudflare WAF blocks 127.0.0.1 in query params).
 */
export function getDefaultRedirectUri(provider) {
  return DEFAULT_REDIRECT_URIS[provider] || "http://localhost:8080/callback";
}

export function resolveRedirectUri(provider, requested) {
  const trimmed = typeof requested === "string" ? requested.trim() : "";
  if (trimmed) return trimmed;
  return getDefaultRedirectUri(provider);
}