export const BACKUP_FORMAT_VERSION = 1;

// Dashboard auth / access keys — excluded when importing app settings only.
export const DASHBOARD_SETTING_KEYS = [
  "password",
  "requireLogin",
  "requireApiKey",
  "authMode",
  "oidcIssuerUrl",
  "oidcClientId",
  "oidcClientSecret",
  "oidcScopes",
  "oidcLoginLabel",
  "tunnelDashboardAccess",
];

export function stripDashboardSettings(settings = {}) {
  if (!settings || typeof settings !== "object" || Array.isArray(settings)) return {};
  const out = { ...settings };
  for (const key of DASHBOARD_SETTING_KEYS) delete out[key];
  return out;
}

export function countAppSettings(settings = {}) {
  return Object.keys(stripDashboardSettings(settings)).length;
}

export const BACKUP_SECTIONS = [
  {
    id: "settings",
    label: "Settings",
    description: "Proxy, routing, observability (dashboard auth can be excluded on import)",
  },
  {
    id: "providerConnections",
    label: "Provider connections",
    description: "OAuth accounts and API keys linked to AI providers",
  },
  {
    id: "providerNodes",
    label: "Provider nodes",
    description: "Custom provider endpoints and node configuration",
  },
  {
    id: "proxyPools",
    label: "Proxy pools",
    description: "Outbound proxy pool definitions",
  },
  {
    id: "apiKeys",
    label: "API keys",
    description: "9Router client API keys",
  },
  {
    id: "combos",
    label: "Combos",
    description: "Model combo definitions",
  },
  {
    id: "modelAliases",
    label: "Model aliases",
    description: "Model name alias mappings",
  },
  {
    id: "customModels",
    label: "Custom models",
    description: "User-defined custom models",
  },
  {
    id: "mitmAlias",
    label: "MITM aliases",
    description: "CLI/MITM tool alias mappings",
  },
  {
    id: "pricing",
    label: "Pricing",
    description: "Custom per-model pricing overrides",
  },
];

export const ALL_BACKUP_SECTION_IDS = BACKUP_SECTIONS.map((section) => section.id);

const SECTION_ID_SET = new Set(ALL_BACKUP_SECTION_IDS);

export function isBackupSectionId(value) {
  return SECTION_ID_SET.has(value);
}

export function normalizeBackupSections(sections) {
  if (!Array.isArray(sections) || sections.length === 0) {
    return [...ALL_BACKUP_SECTION_IDS];
  }
  const normalized = [...new Set(sections.filter(isBackupSectionId))];
  return normalized.length > 0 ? normalized : [...ALL_BACKUP_SECTION_IDS];
}

function hasSectionData(sectionId, payload = {}) {
  switch (sectionId) {
    case "settings":
      return !!payload.settings && typeof payload.settings === "object" && !Array.isArray(payload.settings);
    case "providerConnections":
      return Array.isArray(payload.providerConnections) && payload.providerConnections.length > 0;
    case "providerNodes":
      return Array.isArray(payload.providerNodes) && payload.providerNodes.length > 0;
    case "proxyPools":
      return Array.isArray(payload.proxyPools) && payload.proxyPools.length > 0;
    case "apiKeys":
      return Array.isArray(payload.apiKeys) && payload.apiKeys.length > 0;
    case "combos":
      return Array.isArray(payload.combos) && payload.combos.length > 0;
    case "modelAliases":
      return !!payload.modelAliases && Object.keys(payload.modelAliases).length > 0;
    case "customModels":
      return Array.isArray(payload.customModels) && payload.customModels.length > 0;
    case "mitmAlias":
      return !!payload.mitmAlias && Object.keys(payload.mitmAlias).length > 0;
    case "pricing":
      return !!payload.pricing && Object.keys(payload.pricing).length > 0;
    default:
      return false;
  }
}

export function detectBackupSections(payload = {}) {
  const detected = ALL_BACKUP_SECTION_IDS.filter((sectionId) => hasSectionData(sectionId, payload));
  return detected.length > 0 ? detected : [...ALL_BACKUP_SECTION_IDS];
}

export function countBackupSection(sectionId, payload = {}) {
  switch (sectionId) {
    case "settings":
      return hasSectionData(sectionId, payload) ? countAppSettings(payload.settings) : 0;
    case "providerConnections":
      return (payload.providerConnections || []).length;
    case "providerNodes":
      return (payload.providerNodes || []).length;
    case "proxyPools":
      return (payload.proxyPools || []).length;
    case "apiKeys":
      return (payload.apiKeys || []).length;
    case "combos":
      return (payload.combos || []).length;
    case "modelAliases":
      return Object.keys(payload.modelAliases || {}).length;
    case "customModels":
      return (payload.customModels || []).length;
    case "mitmAlias":
      return Object.keys(payload.mitmAlias || {}).length;
    case "pricing":
      return Object.keys(payload.pricing || {}).length;
    default:
      return 0;
  }
}

export function summarizeBackupPayload(payload = {}) {
  return BACKUP_SECTIONS.map((section) => ({
    ...section,
    available: hasSectionData(section.id, payload),
    count: countBackupSection(section.id, payload),
  }));
}

export function stripBackupMeta(payload = {}) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) return {};
  const { _meta, password, sections, merge, excludeDashboardSettings, ...rest } = payload;
  return rest;
}

export function filterBackupPayload(payload = {}, sections = ALL_BACKUP_SECTION_IDS) {
  const source = stripBackupMeta(payload);
  const selected = normalizeBackupSections(sections);
  const out = {};

  for (const sectionId of selected) {
    if (sectionId === "settings") {
      if (source.settings) out.settings = source.settings;
      continue;
    }
    if (sectionId === "modelAliases" || sectionId === "mitmAlias" || sectionId === "pricing") {
      if (source[sectionId]) out[sectionId] = source[sectionId];
      continue;
    }
    if (Array.isArray(source[sectionId])) {
      out[sectionId] = source[sectionId];
    }
  }

  return out;
}

export function createBackupMeta(sections = ALL_BACKUP_SECTION_IDS) {
  return {
    version: BACKUP_FORMAT_VERSION,
    exportedAt: new Date().toISOString(),
    sections: normalizeBackupSections(sections),
    app: "9router",
  };
}