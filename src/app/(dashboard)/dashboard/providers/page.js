"use client";

import { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import {
  Card,
  Badge,
  ProviderSection,
  ProviderConnectionStatus,
  Button,
  Modal,
  Toggle,
  ConnectionErrorIndicator,
} from "@/shared/components";
import ProviderIcon from "@/shared/components/ProviderIcon";
import { OAUTH_PROVIDERS, APIKEY_PROVIDERS } from "@/shared/constants/config";
import {
  FREE_PROVIDERS,
  FREE_TIER_PROVIDERS,
  WEB_COOKIE_PROVIDERS,
  OPENAI_COMPATIBLE_PREFIX,
  ANTHROPIC_COMPATIBLE_PREFIX,
} from "@/shared/constants/providers";
import Link from "next/link";
import { getErrorCode, getRelativeTime } from "@/shared/utils";
import { useNotificationStore } from "@/store/notificationStore";
import { useHeaderSearchStore } from "@/store/headerSearchStore";
import ModelAvailabilityBadge from "./components/ModelAvailabilityBadge";
import PageContentSkeleton from "@/shared/components/PageContentSkeleton";
import {
  classifyProvider,
  getProvidersWithErrors,
  groupProvidersWithErrorsByCategory,
} from "@/shared/utils/providerConnectionStats";
import { translate } from "@/i18n/runtime";
import AddCompatibleModal from "./components/AddCompatibleModal";

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

function resolveProviderMeta(providerId, providerNodes) {
  const node = providerNodes.find((n) => n.id === providerId);
  const info =
    OAUTH_PROVIDERS[providerId] ||
    APIKEY_PROVIDERS[providerId] ||
    FREE_PROVIDERS[providerId] ||
    FREE_TIER_PROVIDERS[providerId] ||
    WEB_COOKIE_PROVIDERS[providerId];
  const name = node?.name || info?.name || providerId;
  return { name, ...classifyProvider(providerId, node) };
}

function ProviderErrorGroup({ categoryIcon, categoryLabel, items }) {
  if (!items.length) return null;
  return (
    <div className="providers-error-group">
      <span
        className="providers-error-group__category"
        title={categoryLabel}
        aria-label={categoryLabel}
      >
        <span className="material-symbols-outlined text-[16px]" aria-hidden="true">
          {categoryIcon}
        </span>
      </span>
      <span className="providers-error-group__list">
        {items.map((item, index) => (
          <span key={item.id} className="providers-error-group__item">
            {index > 0 ? (
              <span className="providers-error-group__sep" aria-hidden="true">
                ·
              </span>
            ) : null}
            <Link href={item.href} className="providers-error-group__link">
              {item.name}
            </Link>
            {item.mediaKindLabel ? (
              <span className="providers-error-group__kind">{item.mediaKindLabel}</span>
            ) : null}
            <ConnectionErrorIndicator count={item.errors} size="xs" />
          </span>
        ))}
      </span>
    </div>
  );
}

ProviderErrorGroup.propTypes = {
  categoryIcon: PropTypes.string.isRequired,
  categoryLabel: PropTypes.string.isRequired,
  items: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      href: PropTypes.string.isRequired,
      errors: PropTypes.number.isRequired,
      mediaKindLabel: PropTypes.string,
    }),
  ).isRequired,
};

const APIKEY_INITIAL_VISIBLE = 20;

export default function ProvidersPage() {
  const [connections, setConnections] = useState([]);
  const [providerNodes, setProviderNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAllApikey, setShowAllApikey] = useState(false);
  const [showAddCompatibleModal, setShowAddCompatibleModal] = useState(false);
  const [showAddAnthropicCompatibleModal, setShowAddAnthropicCompatibleModal] =
    useState(false);
  const [testingMode, setTestingMode] = useState(null);
  const [testResults, setTestResults] = useState(null);
  const notify = useNotificationStore();
  const searchQuery = useHeaderSearchStore((s) => s.query);
  const registerSearch = useHeaderSearchStore((s) => s.register);
  const unregisterSearch = useHeaderSearchStore((s) => s.unregister);

  useEffect(() => {
    if (loading) return undefined;
    registerSearch("Search providers...");
    return () => unregisterSearch();
  }, [loading, registerSearch, unregisterSearch]);

  const matchSearch = (name) =>
    !searchQuery.trim() ||
    name.toLowerCase().includes(searchQuery.trim().toLowerCase());

  const sortByPriority = (entries, authType) =>
    [...entries].sort(([ka, a], [kb, b]) => {
      const pa = a.priority ?? 999;
      const pb = b.priority ?? 999;
      if (pa !== pb) return pa - pb;
      const sa = getProviderStats(ka, authType);
      const sb = getProviderStats(kb, authType);
      const ea = sa.error > 0 ? 1 : 0;
      const eb = sb.error > 0 ? 1 : 0;
      if (ea !== eb) return eb - ea;
      const ca = sa.connected > 0 || sa.total > 0 ? 1 : 0;
      const cb = sb.connected > 0 || sb.total > 0 ? 1 : 0;
      if (ca !== cb) return cb - ca;
      return (a.name || "").localeCompare(b.name || "");
    });

  const sortItemsByPriority = (items, authType) =>
    [...items].sort((a, b) => {
      const pa = a.priority ?? 999;
      const pb = b.priority ?? 999;
      if (pa !== pb) return pa - pb;
      const sa = getProviderStats(a.id, authType);
      const sb = getProviderStats(b.id, authType);
      const ea = sa.error > 0 ? 1 : 0;
      const eb = sb.error > 0 ? 1 : 0;
      if (ea !== eb) return eb - ea;
      const ca = sa.connected > 0 || sa.total > 0 ? 1 : 0;
      const cb = sb.connected > 0 || sb.total > 0 ? 1 : 0;
      if (ca !== cb) return cb - ca;
      return (a.name || "").localeCompare(b.name || "");
    });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [connectionsRes, nodesRes] = await Promise.all([
          fetch("/api/providers"),
          fetch("/api/provider-nodes"),
        ]);
        const connectionsData = await connectionsRes.json();
        const nodesData = await nodesRes.json();
        if (connectionsRes.ok)
          setConnections(connectionsData.connections || []);
        if (nodesRes.ok) setProviderNodes(nodesData.nodes || []);
      } catch (error) {
        console.log("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const getProviderStats = (providerId, authType) => {
    const authTypes = Array.isArray(authType) ? authType : [authType];
    const providerConnections = connections.filter(
      (c) => c.provider === providerId && authTypes.includes(c.authType),
    );

    const getEffectiveStatus = (conn) => {
      const isCooldown = Object.entries(conn).some(
        ([k, v]) =>
          k.startsWith("modelLock_") && v && new Date(v).getTime() > Date.now(),
      );
      return conn.testStatus === "unavailable" && !isCooldown
        ? "active"
        : conn.testStatus;
    };

    const connected = providerConnections.filter((c) => {
      const status = getEffectiveStatus(c);
      return status === "active" || status === "success";
    }).length;

    const errorConns = providerConnections.filter((c) => {
      const status = getEffectiveStatus(c);
      return (
        status === "error" || status === "expired" || status === "unavailable"
      );
    });

    const error = errorConns.length;
    const total = providerConnections.length;
    const allDisabled =
      total > 0 && providerConnections.every((c) => c.isActive === false);

    const latestError = errorConns.sort(
      (a, b) => new Date(b.lastErrorAt || 0) - new Date(a.lastErrorAt || 0),
    )[0];
    const errorCode = latestError ? getConnectionErrorTag(latestError) : null;
    const errorTime = latestError?.lastErrorAt
      ? getRelativeTime(latestError.lastErrorAt)
      : null;

    return { connected, error, total, errorCode, errorTime, allDisabled };
  };

  const providersWithErrors = useMemo(
    () =>
      getProvidersWithErrors(connections, (id) => resolveProviderMeta(id, providerNodes)),
    [connections, providerNodes],
  );

  const { ai: aiProvidersWithErrors, media: mediaProvidersWithErrors } = useMemo(
    () => groupProvidersWithErrorsByCategory(providersWithErrors),
    [providersWithErrors],
  );

  // Toggle all connections for a provider on/off. authType may be a single
  // string or an array (kiro counts oauth + api_key/apikey together).
  const handleToggleProvider = async (providerId, authType, newActive) => {
    const authTypes = Array.isArray(authType) ? authType : [authType];
    const matches = (c) =>
      c.provider === providerId && authTypes.includes(c.authType);
    const providerConns = connections.filter(matches);
    setConnections((prev) =>
      prev.map((c) => (matches(c) ? { ...c, isActive: newActive } : c)),
    );
    await Promise.allSettled(
      providerConns.map((c) =>
        fetch(`/api/providers/${c.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ isActive: newActive }),
        }),
      ),
    );
  };

  const handleBatchTest = async (mode, providerId = null) => {
    if (testingMode) return;
    setTestingMode(mode === "provider" ? providerId : mode);
    setTestResults(null);
    try {
      const res = await fetch("/api/providers/test-batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode, providerId }),
      });
      const data = await res.json();
      setTestResults(data);
      if (data.summary) {
        const { passed, failed, total } = data.summary;
        if (failed === 0) notify.success(`All ${total} tests passed`);
        else notify.warning(`${passed}/${total} passed, ${failed} failed`);
      }
    } catch (error) {
      setTestResults({ error: "Test request failed" });
      notify.error("Provider test failed");
    } finally {
      setTestingMode(null);
    }
  };

  const compatibleProviders = providerNodes
    .filter((node) => node.type === "openai-compatible")
    .map((node) => ({
      id: node.id,
      name: node.name || "OpenAI Compatible",
      color: "#10A37F",
      textIcon: "OC",
      apiType: node.apiType,
    }))
    .filter((p) => matchSearch(p.name));

  const anthropicCompatibleProviders = providerNodes
    .filter((node) => node.type === "anthropic-compatible")
    .map((node) => ({
      id: node.id,
      name: node.name || "Anthropic Compatible",
      color: "#D97757",
      textIcon: "AC",
    }))
    .filter((p) => matchSearch(p.name));

  const oauthEntries = sortByPriority(
    Object.entries(OAUTH_PROVIDERS).filter(([, info]) => !info.hidden && matchSearch(info.name)),
    "oauth",
  );
  const freeEntries = Object.entries(FREE_PROVIDERS)
    .filter(([, info]) => !info.hidden && matchSearch(info.name))
    .sort(([, a], [, b]) => (b.noAuth ? 1 : 0) - (a.noAuth ? 1 : 0));
  const freeTierEntries = sortByPriority(
    Object.entries(FREE_TIER_PROVIDERS).filter(
      ([, info]) =>
        !info.hidden &&
        matchSearch(info.name) &&
        (info.serviceKinds ?? ["llm"]).includes("llm"),
    ),
    "freeTier",
  ).sort(([, a], [, b]) => (b.noAuth ? 1 : 0) - (a.noAuth ? 1 : 0));
  // API Key: errors first, then connected providers, then alphabetical by name
  const apikeyEntries = Object.entries(APIKEY_PROVIDERS)
    .filter(
      ([, info]) =>
        !info.hidden &&
        (info.serviceKinds ?? ["llm"]).includes("llm") &&
        matchSearch(info.name),
    )
    .sort(([ka, a], [kb, b]) => {
      const sa = getProviderStats(ka, "apikey");
      const sb = getProviderStats(kb, "apikey");
      const ea = sa.error > 0 ? 1 : 0;
      const eb = sb.error > 0 ? 1 : 0;
      if (ea !== eb) return eb - ea;
      const ca = sa.total > 0 ? 0 : 1;
      const cb = sb.total > 0 ? 0 : 1;
      if (ca !== cb) return ca - cb;
      return (a.name || "").localeCompare(b.name || "");
    });

  const utilityApikeyEntries = sortByPriority(
    Object.entries(APIKEY_PROVIDERS).filter(([key, info]) => {
      if (info.hidden) return false;
      if ((info.serviceKinds ?? ["llm"]).includes("llm")) return false;
      if (!matchSearch(info.name)) return false;
      return connections.some((c) => c.provider === key);
    }),
    "apikey",
  );
  const isApikeySearching = !!searchQuery.trim();
  const visibleApikeyEntries =
    isApikeySearching || showAllApikey
      ? apikeyEntries
      : apikeyEntries.slice(0, APIKEY_INITIAL_VISIBLE);
  const hiddenApikeyCount = apikeyEntries.length - APIKEY_INITIAL_VISIBLE;

  const customProviderCount =
    compatibleProviders.length + anthropicCompatibleProviders.length;
  const freeProviderCount = freeEntries.length + freeTierEntries.length;

  const hasAnyResult =
    oauthEntries.length > 0 ||
    freeEntries.length > 0 ||
    freeTierEntries.length > 0 ||
    apikeyEntries.length > 0 ||
    customProviderCount > 0 ||
    utilityApikeyEntries.length > 0;

  return (
    <div className="flex min-w-0 flex-col gap-6 px-1 sm:px-0">
      {loading ? (
        <PageContentSkeleton rows={3} />
      ) : (
      <>
      {providersWithErrors.length > 0 && !searchQuery.trim() && (
        <div className="providers-error-summary" role="status" data-i18n-skip>
          <ProviderErrorGroup
            categoryIcon="psychology"
            categoryLabel={translate("AI Provider")}
            items={aiProvidersWithErrors}
          />
          <ProviderErrorGroup
            categoryIcon="perm_media"
            categoryLabel={translate("Media Provider")}
            items={mediaProvidersWithErrors}
          />
        </div>
      )}

      {!searchQuery.trim() && hasAnyResult && (
        <div className="providers-overview-bar glass-panel-subtle rounded-xl p-3 sm:p-4" data-reveal>
          <span className="text-xs font-medium text-text-muted uppercase tracking-wide mr-1">Overview</span>
          <span className="providers-overview-chip">
            <span className="material-symbols-outlined text-[14px] text-amber-600">tune</span>
            Custom <strong>{customProviderCount}</strong>
          </span>
          <span className="providers-overview-chip">
            <span className="material-symbols-outlined text-[14px] text-primary">lock</span>
            OAuth <strong>{oauthEntries.length}</strong>
          </span>
          <span className="providers-overview-chip">
            <span className="material-symbols-outlined text-[14px] text-green-600">savings</span>
            Free <strong>{freeProviderCount}</strong>
          </span>
          <span className="providers-overview-chip">
            <span className="material-symbols-outlined text-[14px] text-amber-500">key</span>
            API Key <strong>{apikeyEntries.length}</strong>
          </span>
        </div>
      )}

      {!hasAnyResult && (
        <div className="text-center py-8 border border-dashed border-border rounded-xl">
          <span className="material-symbols-outlined text-[32px] text-text-muted mb-2">
            search_off
          </span>
          <p className="text-text-muted text-sm">No providers match your search</p>
        </div>
      )}

      <ProviderSection
        data-reveal
        icon="tune"
        title="Custom Providers"
        subtitle="OpenAI / Anthropic compatible endpoints you add and can delete anytime."
        badge="Deletable"
        badgeVariant="deletable"
        actions={
          <>
            <Button
              size="sm"
              icon="add"
              onClick={() => setShowAddAnthropicCompatibleModal(true)}
              className="w-full sm:w-auto"
            >
              Add Anthropic Compatible
            </Button>
            <Button
              size="sm"
              variant="secondary"
              icon="add"
              onClick={() => setShowAddCompatibleModal(true)}
              className="w-full !bg-white !text-black hover:!bg-gray-100 sm:w-auto"
            >
              Add OpenAI Compatible
            </Button>
          </>
        }
      >
        {customProviderCount === 0 ? (
          <div className="flex items-center justify-center gap-2 py-6 border border-dashed border-border rounded-xl text-text-muted text-sm">
            <span className="material-symbols-outlined text-[18px]">extension</span>
            <span>No custom providers — use buttons above to add compatible endpoints</span>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 min-[1800px]:grid-cols-6">
            {[...compatibleProviders, ...anthropicCompatibleProviders].map(
              (info) => (
                <ApiKeyProviderCard
                  key={info.id}
                  providerId={info.id}
                  provider={info}
                  stats={getProviderStats(info.id, "apikey")}
                  authType="compatible"
                  onToggle={(active) =>
                    handleToggleProvider(info.id, "apikey", active)
                  }
                />
              ),
            )}
          </div>
        )}
      </ProviderSection>

      {oauthEntries.length > 0 && (
      <ProviderSection
        data-reveal
        icon="lock"
        title="OAuth Providers"
        subtitle="Built-in providers authenticated via OAuth — models and config are managed by the system."
        badge="Built-in"
        badgeVariant="builtin"
        actions={
          <>
            <ModelAvailabilityBadge />
            <Button
              size="sm"
              variant={testingMode === "oauth" ? "primary" : "outline"}
              onClick={() => handleBatchTest("oauth")}
              disabled={!!testingMode && testingMode !== "oauth"}
              loading={testingMode === "oauth"}
              icon="play_arrow"
              className={`w-full sm:w-auto ${testingMode === "oauth" ? "animate-pulse" : ""}`}
              title="Test all OAuth connections"
              aria-label="Test all OAuth connections"
            >
              {testingMode === "oauth" ? "Testing..." : "Test All"}
            </Button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 min-[1800px]:grid-cols-6">
          {oauthEntries.map(([key, info]) => (
            <ProviderCard
              key={key}
              providerId={key}
              provider={info}
              stats={getProviderStats(key, "oauth")}
              authType="oauth"
              onToggle={(active) => handleToggleProvider(key, "oauth", active)}
            />
          ))}
        </div>
      </ProviderSection>
      )}

      {(freeEntries.length > 0 || freeTierEntries.length > 0) && (
      <ProviderSection
        data-reveal
        icon="savings"
        title="Free Tier Providers"
        subtitle="Built-in free or freemium providers with predefined model catalogs."
        badge="Built-in"
        badgeVariant="builtin"
        actions={
          <Button
            size="sm"
            variant={testingMode === "free" ? "primary" : "outline"}
            onClick={() => handleBatchTest("free")}
            disabled={!!testingMode && testingMode !== "free"}
            loading={testingMode === "free"}
            icon="play_arrow"
            className={`w-full sm:w-auto ${testingMode === "free" ? "animate-pulse" : ""}`}
            title="Test all Free connections"
            aria-label="Test all Free provider connections"
          >
            {testingMode === "free" ? "Testing..." : "Test All"}
          </Button>
        }
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 min-[1800px]:grid-cols-6">
          {freeEntries.map(([key, info]) => {
            // Kiro accepts both OAuth and api-key connections; count/toggle both
            // so the card total matches the provider detail page (#kiro-apikey).
            // Kiro's headless api-key flow persists authType "api_key" (underscore),
            // while generic apikey providers use "apikey" — include both spellings.
            const freeAuthTypes =
              key === "kiro" ? ["oauth", "apikey", "api_key"] : "oauth";
            return (
              <ProviderCard
                key={key}
                providerId={key}
                provider={info}
                stats={getProviderStats(key, freeAuthTypes)}
                authType="free"
                onToggle={(active) =>
                  handleToggleProvider(key, freeAuthTypes, active)
                }
              />
            );
          })}
          {freeTierEntries.map(([key, info]) => (
            <ApiKeyProviderCard
              key={key}
              providerId={key}
              provider={info}
              stats={getProviderStats(key, "apikey")}
              authType="apikey"
              onToggle={(active) => handleToggleProvider(key, "apikey", active)}
            />
          ))}
        </div>
      </ProviderSection>
      )}

      {apikeyEntries.length > 0 && (
      <ProviderSection
        data-reveal
        icon="key"
        title="API Key Providers"
        subtitle="Built-in providers using API keys — hardcoded model lists with disable/alias support."
        badge="Built-in"
        badgeVariant="builtin"
        actions={
          <Button
            size="sm"
            variant={testingMode === "apikey" ? "primary" : "outline"}
            onClick={() => handleBatchTest("apikey")}
            disabled={!!testingMode && testingMode !== "apikey"}
            loading={testingMode === "apikey"}
            icon="play_arrow"
            className={`w-full sm:w-auto ${testingMode === "apikey" ? "animate-pulse" : ""}`}
            title="Test all API Key connections"
            aria-label="Test all API Key connections"
          >
            {testingMode === "apikey" ? "Testing..." : "Test All"}
          </Button>
        }
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 min-[1800px]:grid-cols-6">
          {visibleApikeyEntries.map(([key, info]) => (
            <ApiKeyProviderCard
              key={key}
              providerId={key}
              provider={info}
              stats={getProviderStats(key, "apikey")}
              authType="apikey"
              onToggle={(active) => handleToggleProvider(key, "apikey", active)}
            />
          ))}
        </div>
        {!isApikeySearching && !showAllApikey && hiddenApikeyCount > 0 && (
          <Button
            variant="outline"
            fullWidth
            icon="expand_more"
            onClick={() => setShowAllApikey(true)}
            className="border-dashed border-primary/40 text-primary hover:bg-primary/5"
          >
            Show all {apikeyEntries.length} providers
          </Button>
        )}
      </ProviderSection>
      )}

      {utilityApikeyEntries.length > 0 && (
      <ProviderSection
        data-reveal
        icon="travel_explore"
        title="Media Providers (Search & Tools)"
        subtitle="Web search, fetch, and utility media providers with active connections."
        badge="Media"
        badgeVariant="builtin"
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 min-[1800px]:grid-cols-6">
          {utilityApikeyEntries.map(([key, info]) => (
            <ApiKeyProviderCard
              key={key}
              providerId={key}
              provider={info}
              stats={getProviderStats(key, "apikey")}
              authType="apikey"
              onToggle={(active) => handleToggleProvider(key, "apikey", active)}
            />
          ))}
        </div>
      </ProviderSection>
      )}

      {/* Web Cookie Providers — use browser subscription cookie instead of API key */}
      {/* <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            Web Cookie Providers{" "}
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Object.entries(WEB_COOKIE_PROVIDERS).map(([key, info]) => (
            <ApiKeyProviderCard
              key={key}
              providerId={key}
              provider={info}
              stats={getProviderStats(key, "apikey")}
              authType="apikey"
              onToggle={(active) => handleToggleProvider(key, "apikey", active)}
            />
          ))}
        </div>
      </div> */}

      <AddCompatibleModal
        variant="openai"
        isOpen={showAddCompatibleModal}
        onClose={() => setShowAddCompatibleModal(false)}
        onCreated={(node) => {
          setProviderNodes((prev) => [...prev, node]);
          setShowAddCompatibleModal(false);
        }}
      />
      <AddCompatibleModal
        variant="anthropic"
        isOpen={showAddAnthropicCompatibleModal}
        onClose={() => setShowAddAnthropicCompatibleModal(false)}
        onCreated={(node) => {
          setProviderNodes((prev) => [...prev, node]);
          setShowAddAnthropicCompatibleModal(false);
        }}
      />

      {/* Test Results Modal */}
      <Modal
        isOpen={!!testResults}
        title="Test Results"
        onClose={() => setTestResults(null)}
        size="lg"
      >
        {testResults ? <ProviderTestResultsView results={testResults} /> : null}
      </Modal>
      </>
      )}
    </div>
  );
}

function ProviderCard({ providerId, provider, stats, authType, onToggle }) {
  const { connected, error, errorCode, errorTime, allDisabled } = stats;
  const hasError = error > 0;
  const isNoAuth = !!provider.noAuth;

  const dotColors = {
    free: "bg-green-500",
    oauth: "bg-blue-500",
    apikey: "bg-amber-500",
    compatible: "bg-orange-500",
  };
  const dotLabels = {
    free: "Free",
    oauth: "OAuth",
    apikey: "API Key",
    compatible: "Compatible",
  };

  return (
    <Link href={`/dashboard/providers/${providerId}`} className="group min-w-0" data-reveal>
      <Card
        padding="sm"
        className={`provider-glass-card h-full cursor-pointer ${allDisabled ? "opacity-50" : ""} ${hasError ? "provider-glass-card--error" : ""}`}
      >
        <div className="flex min-w-0 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={`glass-panel-subtle size-10 shrink-0 rounded-xl flex items-center justify-center relative ${hasError ? "provider-icon--error" : ""}`}
              style={{
                backgroundColor: `${provider.color?.length > 7 ? provider.color : provider.color + "18"}`,
              }}
            >
              <ProviderIcon
                src={`/providers/${provider.id}.png`}
                alt={provider.name}
                size={30}
                className="object-contain rounded-lg max-w-[32px] max-h-[32px]"
                fallbackText={
                  provider.textIcon || provider.id.slice(0, 2).toUpperCase()
                }
                fallbackColor={provider.color}
              />
              {hasError ? (
                <span className="provider-error-dot absolute -right-0.5 -top-0.5" aria-hidden="true">
                  <ConnectionErrorIndicator count={error} errorCode={errorCode} size="xs" />
                </span>
              ) : null}
            </div>
            <div className="min-w-0" data-i18n-skip>
              <h3 className="truncate font-semibold text-sm sm:text-base">
                {provider.name}
              </h3>
              <ProviderConnectionStatus
                connected={connected}
                error={error}
                errorCode={errorCode}
                errorTime={errorTime}
                isNoAuth={isNoAuth}
                allDisabled={allDisabled}
                className="mt-1"
              />
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {stats.total > 0 ? (
              <div
                className="opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggle(!allDisabled ? false : true);
                }}
              >
                <Toggle
                  size="sm"
                  checked={!allDisabled}
                  onChange={() => {}}
                  title={allDisabled ? "Enable provider" : "Disable provider"}
                />
              </div>
            ) : null}
          </div>
        </div>
      </Card>
    </Link>
  );
}

ProviderCard.propTypes = {
  providerId: PropTypes.string.isRequired,
  provider: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    color: PropTypes.string,
    textIcon: PropTypes.string,
  }).isRequired,
  stats: PropTypes.shape({
    connected: PropTypes.number,
    error: PropTypes.number,
    errorCode: PropTypes.string,
    errorTime: PropTypes.string,
  }).isRequired,
  authType: PropTypes.string,
  onToggle: PropTypes.func,
};

function ApiKeyProviderCard({
  providerId,
  provider,
  stats,
  authType,
  onToggle,
}) {
  const { connected, error, errorCode, errorTime, allDisabled } = stats;
  const hasError = error > 0;
  const isCompatible = providerId.startsWith(OPENAI_COMPATIBLE_PREFIX);
  const isAnthropicCompatible = providerId.startsWith(
    ANTHROPIC_COMPATIBLE_PREFIX,
  );

  const dotColors = {
    free: "bg-green-500",
    oauth: "bg-blue-500",
    apikey: "bg-amber-500",
    compatible: "bg-orange-500",
  };
  const dotLabels = {
    free: "Free",
    oauth: "OAuth",
    apikey: "API Key",
    compatible: "Compatible",
  };

  const getIconPath = () => {
    if (isCompatible)
      return provider.apiType === "responses"
        ? "/providers/oai-r.png"
        : "/providers/oai-cc.png";
    if (isAnthropicCompatible) return "/providers/anthropic-m.png";
    return `/providers/${provider.id}.png`;
  };

  return (
    <Link href={`/dashboard/providers/${providerId}`} className="group min-w-0" data-reveal>
      <Card
        padding="sm"
        className={`provider-glass-card h-full cursor-pointer ${allDisabled ? "opacity-50" : ""} ${hasError ? "provider-glass-card--error" : ""}`}
      >
        <div className="flex min-w-0 items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div
              className={`glass-panel-subtle size-10 shrink-0 rounded-xl flex items-center justify-center relative ${hasError ? "provider-icon--error" : ""}`}
              style={{
                backgroundColor: `${provider.color?.length > 7 ? provider.color : provider.color + "18"}`,
              }}
            >
              <ProviderIcon
                src={getIconPath()}
                alt={provider.name}
                size={30}
                className="object-contain rounded-lg max-w-[30px] max-h-[30px]"
                fallbackText={
                  provider.textIcon || provider.id.slice(0, 2).toUpperCase()
                }
                fallbackColor={provider.color}
              />
              {hasError ? (
                <span className="provider-error-dot absolute -right-0.5 -top-0.5" aria-hidden="true">
                  <ConnectionErrorIndicator count={error} errorCode={errorCode} size="xs" />
                </span>
              ) : null}
            </div>
            <div className="min-w-0" data-i18n-skip>
              <h3 className="truncate font-semibold text-sm sm:text-base">
                {provider.name}
              </h3>
              <div className="mt-1 flex min-w-0 flex-wrap items-center gap-1.5">
                <ProviderConnectionStatus
                  connected={connected}
                  error={error}
                  errorCode={errorCode}
                  errorTime={errorTime}
                  allDisabled={allDisabled}
                />
                {isCompatible && !allDisabled && (
                  <Badge variant="default" size="sm">
                    {provider.apiType === "responses" ? "Responses" : "Chat"}
                  </Badge>
                )}
                {isAnthropicCompatible && (
                  <Badge variant="default" size="sm">
                    Messages
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {stats.total > 0 && (
              <div
                className="opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onToggle(!allDisabled ? false : true);
                }}
              >
                <Toggle
                  size="sm"
                  checked={!allDisabled}
                  onChange={() => {}}
                  title={allDisabled ? "Enable provider" : "Disable provider"}
                />
              </div>
            )}
          </div>
        </div>
      </Card>
    </Link>
  );
}

ApiKeyProviderCard.propTypes = {
  providerId: PropTypes.string.isRequired,
  provider: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    color: PropTypes.string,
    textIcon: PropTypes.string,
    apiType: PropTypes.string,
  }).isRequired,
  stats: PropTypes.shape({
    connected: PropTypes.number,
    error: PropTypes.number,
    errorCode: PropTypes.string,
    errorTime: PropTypes.string,
  }).isRequired,
  authType: PropTypes.string,
  onToggle: PropTypes.func,
};

function ProviderTestResultsView({ results }) {
  if (results.error && !results.results) {
    return (
      <div className="text-center py-6">
        <span className="material-symbols-outlined text-red-500 text-[32px] mb-2 block">
          error
        </span>
        <p className="text-sm text-red-400">{results.error}</p>
      </div>
    );
  }

  const { summary, mode } = results;
  const items = results.results || [];
  const modeLabel =
    {
      oauth: "OAuth",
      free: "Free",
      apikey: "API Key",
      provider: "Provider",
      all: "All",
    }[mode] || mode;

  return (
    <div className="flex min-w-0 flex-col gap-3">
      {summary && (
        <div className="flex flex-wrap items-center gap-2 text-xs mb-1 sm:gap-3">
          <span className="text-text-muted">{modeLabel} Test</span>
          <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-400 font-medium">
            {summary.passed} passed
          </span>
          {summary.failed > 0 && (
            <span className="px-2 py-0.5 rounded bg-red-500/15 text-red-400 font-medium">
              {summary.failed} failed
            </span>
          )}
          <span className="text-text-muted sm:ml-auto">
            {summary.total} tested
          </span>
        </div>
      )}
      {items.map((r, i) => (
        <div
          key={r.connectionId || i}
          className="flex min-w-0 flex-wrap items-center gap-2 rounded-lg bg-black/[0.03] px-3 py-2 text-xs dark:bg-white/[0.03] sm:flex-nowrap"
        >
          <span
            className={`material-symbols-outlined text-[16px] ${r.valid ? "text-emerald-500" : "text-red-500"}`}
          >
            {r.valid ? "check_circle" : "error"}
          </span>
          <div className="min-w-0 flex-[1_1_160px]">
            <span className="block truncate font-medium sm:inline">
              {r.connectionName}
            </span>
            <span className="block truncate text-text-muted sm:ml-1.5 sm:inline">
              ({r.provider})
            </span>
          </div>
          {r.latencyMs !== undefined && (
            <span className="shrink-0 text-text-muted font-mono tabular-nums">
              {r.latencyMs}ms
            </span>
          )}
          <span
            className={`shrink-0 text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${
              r.valid
                ? "bg-emerald-500/15 text-emerald-400"
                : "bg-red-500/15 text-red-400"
            }`}
          >
            {r.valid ? "OK" : r.diagnosis?.type || "ERROR"}
          </span>
        </div>
      ))}
      {items.length === 0 && (
        <div className="text-center py-4 text-text-muted text-sm">
          No active connections found for this group.
        </div>
      )}
    </div>
  );
}

ProviderTestResultsView.propTypes = {
  results: PropTypes.shape({
    mode: PropTypes.string,
    results: PropTypes.array,
    summary: PropTypes.shape({
      total: PropTypes.number,
      passed: PropTypes.number,
      failed: PropTypes.number,
    }),
    error: PropTypes.string,
  }).isRequired,
};
