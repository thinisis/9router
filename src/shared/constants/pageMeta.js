import { OAUTH_PROVIDERS, APIKEY_PROVIDERS } from "@/shared/constants/config";
import { CLI_TOOLS } from "@/shared/constants/cliTools";
import { MEDIA_PROVIDER_KINDS, AI_PROVIDERS } from "@/shared/constants/providers";

const DASHBOARD_ROUTES = [
  { segment: "/endpoint", title: "Endpoint", description: "API endpoint configuration", icon: "api" },
  { segment: "/providers", title: "Providers", description: "Manage your AI provider connections", icon: "dns" },
  { segment: "/combos", title: "Combos", description: "Group models and route requests by priority with automatic fallback.", icon: "layers" },
  { segment: "/usage", title: "Usage & Analytics", description: "Monitor API usage, tokens, and request logs", icon: "bar_chart" },
  { segment: "/quota", title: "Quota Tracker", description: "Track provider quota and limits", icon: "data_usage" },
  { segment: "/mitm", title: "MITM Proxy", description: "Intercept CLI tool traffic and route through 9Router", icon: "security" },
  { segment: "/cli-tools", title: "CLI Tools", description: "Configure CLI tools", icon: "terminal" },
  { segment: "/proxy-pools", title: "Proxy Pools", description: "Manage reusable per-connection proxies", icon: "lan" },
  { segment: "/skills", title: "Agent Skills", description: "Agent skills and extensions", icon: "extension" },
  { segment: "/profile", title: "Settings", description: "Manage your preferences", icon: "settings" },
  { segment: "/translator", title: "Translator", description: "Replay request flow — matches log files", icon: "translate" },
  { segment: "/console-log", title: "Console Log", description: "Live server console output", icon: "monitor" },
  { segment: "/basic-chat", title: "Basic Chat", description: "Test models with a simple chat UI", icon: "chat" },
  { segment: "/settings/pricing", title: "Pricing", description: "Configure pricing rates for cost tracking and calculations", icon: "payments" },
];

const MEDIA_KIND_LABELS = {
  embedding: "Embedding",
  image: "Image",
  tts: "Text to Speech",
  stt: "Speech to Text",
  web: "Web Fetch & Search",
};

export function getDashboardPageMeta(pathname) {
  if (!pathname) {
    return { title: "", description: "", icon: "", breadcrumbs: [] };
  }

  const mediaComboMatch = pathname.match(/\/media-providers\/combo\/([^/]+)$/);
  if (mediaComboMatch) {
    return {
      title: "Media Combo",
      description: "Configure media provider combo routing",
      icon: "layers",
      breadcrumbs: [
        { label: "Media Providers", href: "/dashboard/media-providers/web" },
        { label: "Combo" },
      ],
    };
  }

  const mediaDetailMatch = pathname.match(/\/media-providers\/([^/]+)\/([^/]+)$/);
  if (mediaDetailMatch) {
    const kindId = mediaDetailMatch[1];
    const providerId = mediaDetailMatch[2];
    const kindConfig = MEDIA_PROVIDER_KINDS.find((k) => k.id === kindId);
    const provider = AI_PROVIDERS[providerId];
    return {
      title: provider?.name || providerId,
      description: "",
      icon: "",
      breadcrumbs: [
        { label: "Media Providers", href: `/dashboard/media-providers/${kindId}` },
        { label: kindConfig?.label || kindId, href: `/dashboard/media-providers/${kindId}` },
        { label: provider?.name || providerId, image: `/providers/${providerId}.png` },
      ],
    };
  }

  const mediaKindMatch = pathname.match(/\/media-providers\/([^/]+)$/);
  if (mediaKindMatch) {
    const kindId = mediaKindMatch[1];
    const kindConfig = MEDIA_PROVIDER_KINDS.find((k) => k.id === kindId);
    return {
      title: kindConfig?.label || kindId,
      description: "",
      icon: kindConfig?.icon || "perm_media",
      breadcrumbs: [],
    };
  }

  const cliToolMatch = pathname.match(/\/cli-tools\/([^/]+)$/);
  if (cliToolMatch) {
    const toolId = cliToolMatch[1];
    const tool = CLI_TOOLS[toolId];
    if (tool) {
      return {
        title: tool.name,
        description: tool.description || "",
        icon: "",
        breadcrumbs: [
          { label: "CLI Tools", href: "/dashboard/cli-tools" },
          { label: tool.name },
        ],
      };
    }
  }

  const providerDetailMatch = pathname.match(/\/providers\/([^/]+)$/);
  if (providerDetailMatch && providerDetailMatch[1] !== "new") {
    const providerId = providerDetailMatch[1];
    const providerInfo = OAUTH_PROVIDERS[providerId] || APIKEY_PROVIDERS[providerId];
    if (providerInfo) {
      return {
        title: providerInfo.name,
        description: "",
        icon: "",
        breadcrumbs: [
          { label: "Providers", href: "/dashboard/providers" },
          { label: providerInfo.name, image: `/providers/${providerInfo.id}.png` },
        ],
      };
    }
    return {
      title: providerId,
      description: "",
      icon: "",
      breadcrumbs: [
        { label: "Providers", href: "/dashboard/providers" },
        { label: providerId },
      ],
    };
  }

  if (pathname.includes("/providers/new")) {
    return {
      title: "Add New Provider",
      description: "Connect a new AI provider",
      icon: "add",
      breadcrumbs: [
        { label: "Providers", href: "/dashboard/providers" },
        { label: "Add New Provider" },
      ],
    };
  }

  for (const route of DASHBOARD_ROUTES) {
    if (pathname.includes(route.segment)) {
      return {
        title: route.title,
        description: route.description,
        icon: route.icon,
        breadcrumbs: [],
      };
    }
  }

  if (pathname === "/dashboard") {
    return {
      title: "Overview",
      description: "Health snapshot across providers, endpoint, and services.",
      icon: "dashboard",
      breadcrumbs: [],
    };
  }

  return { title: "", description: "", icon: "", breadcrumbs: [] };
}