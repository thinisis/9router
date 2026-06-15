import { getErrorCode, getRelativeTime } from "@/shared/utils";
import {
  AI_PROVIDERS,
  MEDIA_PROVIDER_KINDS,
  isAnthropicCompatibleProvider,
  isCustomEmbeddingProvider,
  isOpenAICompatibleProvider,
} from "@/shared/constants/providers";

const MEDIA_KIND_ORDER = MEDIA_PROVIDER_KINDS.map((k) => k.id);

/** Route + label for AI Provider vs Media Provider error surfaces. */
export function classifyProvider(providerId, providerNode = null) {
  if (
    providerNode ||
    isOpenAICompatibleProvider(providerId) ||
    isAnthropicCompatibleProvider(providerId)
  ) {
    return {
      category: "ai",
      categoryLabel: "AI Provider",
      href: `/dashboard/providers/${providerId}`,
      mediaKind: null,
      mediaKindLabel: null,
    };
  }

  if (isCustomEmbeddingProvider(providerId)) {
    return {
      category: "media",
      categoryLabel: "Media Provider",
      href: `/dashboard/media-providers/embedding/${providerId}`,
      mediaKind: "embedding",
      mediaKindLabel: "Embedding",
    };
  }

  const info = AI_PROVIDERS[providerId];
  const kinds = info?.serviceKinds ?? ["llm"];

  if (kinds.includes("llm")) {
    return {
      category: "ai",
      categoryLabel: "AI Provider",
      href: `/dashboard/providers/${providerId}`,
      mediaKind: null,
      mediaKindLabel: null,
    };
  }

  const mediaKind =
    MEDIA_KIND_ORDER.find((kind) => kinds.includes(kind)) ||
    kinds.find((kind) => kind !== "llm") ||
    "tts";
  const mediaKindLabel =
    MEDIA_PROVIDER_KINDS.find((k) => k.id === mediaKind)?.label || mediaKind;

  return {
    category: "media",
    categoryLabel: "Media Provider",
    href: `/dashboard/media-providers/${mediaKind}/${providerId}`,
    mediaKind,
    mediaKindLabel,
  };
}

export function isConnectionInCooldown(conn) {
  if (!conn) return false;
  return Object.entries(conn).some(
    ([k, v]) =>
      k.startsWith("modelLock_") && v && new Date(v).getTime() > Date.now(),
  );
}

/** Matches overview dashboard error counting. */
export function isConnectionError(conn) {
  if (!conn || conn.isActive === false) return false;
  const { testStatus } = conn;
  if (testStatus === "error" || testStatus === "expired") return true;
  if (conn.lastError) return true;
  if (testStatus === "unavailable" && !isConnectionInCooldown(conn)) return true;
  return false;
}

export function isConnectionHealthy(conn) {
  if (!conn || conn.isActive === false) return false;
  if (isConnectionError(conn)) return false;
  const { testStatus } = conn;
  return (
    testStatus === "active" ||
    testStatus === "success" ||
    (testStatus === "unavailable" && isConnectionInCooldown(conn))
  );
}

function getConnectionErrorTag(connection) {
  if (!connection) return null;

  const explicitType = connection.lastErrorType;
  if (explicitType === "runtime_error") return "RUNTIME";
  if (
    explicitType === "upstream_auth_error" ||
    explicitType === "auth_missing" ||
    explicitType === "token_refresh_failed" ||
    explicitType === "token_expired"
  )
    return "AUTH";
  if (explicitType === "upstream_rate_limited") return "429";
  if (explicitType === "upstream_unavailable") return "5XX";
  if (explicitType === "network_error") return "NET";

  const numericCode = Number(connection.errorCode);
  if (Number.isFinite(numericCode) && numericCode >= 400)
    return String(numericCode);

  const fromMessage = getErrorCode(connection.lastError);
  if (fromMessage === "401" || fromMessage === "403") return "AUTH";
  if (fromMessage && fromMessage !== "ERR") return fromMessage;

  const msg = (connection.lastError || "").toLowerCase();
  if (
    msg.includes("runtime") ||
    msg.includes("not runnable") ||
    msg.includes("not installed")
  )
    return "RUNTIME";
  if (
    msg.includes("invalid api key") ||
    msg.includes("token invalid") ||
    msg.includes("revoked") ||
    msg.includes("unauthorized")
  )
    return "AUTH";

  return "ERR";
}

export function getProviderStatsFromConnections(connections, providerId) {
  const providerConnections = connections.filter((c) => c.provider === providerId);

  const activeConnections = providerConnections.filter((c) => c.isActive !== false);
  const connected = activeConnections.filter(isConnectionHealthy).length;
  const errorConns = activeConnections.filter(isConnectionError);
  const error = errorConns.length;
  const total = providerConnections.length;
  const allDisabled =
    total > 0 && providerConnections.every((c) => c.isActive === false);

  const latestError = [...errorConns].sort(
    (a, b) => new Date(b.lastErrorAt || 0) - new Date(a.lastErrorAt || 0),
  )[0];
  const errorCode = latestError ? getConnectionErrorTag(latestError) : null;
  const errorTime = latestError?.lastErrorAt
    ? getRelativeTime(latestError.lastErrorAt)
    : null;

  return { connected, error, total, errorCode, errorTime, allDisabled };
}

export function getProvidersWithErrors(connections, resolveMeta) {
  const byProvider = new Map();

  for (const conn of connections) {
    if (!isConnectionError(conn)) continue;
    const id = conn.provider;
    if (!byProvider.has(id)) {
      const meta = resolveMeta(id);
      byProvider.set(id, {
        id,
        name: meta.name || id,
        errors: 0,
        category: meta.category || "ai",
        categoryLabel: meta.categoryLabel || "AI Provider",
        href: meta.href || `/dashboard/providers/${id}`,
        mediaKind: meta.mediaKind || null,
        mediaKindLabel: meta.mediaKindLabel || null,
      });
    }
    byProvider.get(id).errors += 1;
  }

  return [...byProvider.values()].sort((a, b) => {
    if (a.category !== b.category) return a.category === "ai" ? -1 : 1;
    return b.errors - a.errors || a.name.localeCompare(b.name);
  });
}

export function groupProvidersWithErrorsByCategory(items) {
  return {
    ai: items.filter((item) => item.category === "ai"),
    media: items.filter((item) => item.category === "media"),
  };
}

export function countConnectionErrors(connections) {
  return connections.filter((c) => c.isActive !== false && isConnectionError(c)).length;
}