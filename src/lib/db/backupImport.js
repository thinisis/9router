import { stringifyJson, parseJson } from "./helpers/jsonCol.js";
import { normalizeBackupSections, stripDashboardSettings } from "./backupSections.js";

function importSettings(db, settings, { merge, excludeDashboardSettings = false }) {
  if (!settings || typeof settings !== "object" || Array.isArray(settings)) return;

  const incoming = excludeDashboardSettings ? stripDashboardSettings(settings) : settings;
  if (Object.keys(incoming).length === 0) return;

  if (merge) {
    const row = db.get(`SELECT data FROM settings WHERE id = 1`);
    const current = row ? parseJson(row.data, {}) : {};
    const next = { ...current, ...incoming };
    db.run(
      `INSERT INTO settings(id, data) VALUES(1, ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data`,
      [stringifyJson(next)]
    );
    return;
  }

  db.run(
    `INSERT INTO settings(id, data) VALUES(1, ?) ON CONFLICT(id) DO UPDATE SET data = excluded.data`,
    [stringifyJson(incoming)]
  );
}

function clearSection(db, sectionId) {
  switch (sectionId) {
    case "settings":
      db.run(`DELETE FROM settings`);
      break;
    case "providerConnections":
      db.run(`DELETE FROM providerConnections`);
      break;
    case "providerNodes":
      db.run(`DELETE FROM providerNodes`);
      break;
    case "proxyPools":
      db.run(`DELETE FROM proxyPools`);
      break;
    case "apiKeys":
      db.run(`DELETE FROM apiKeys`);
      break;
    case "combos":
      db.run(`DELETE FROM combos`);
      break;
    case "modelAliases":
      db.run(`DELETE FROM kv WHERE scope = 'modelAliases'`);
      break;
    case "customModels":
      db.run(`DELETE FROM kv WHERE scope = 'customModels'`);
      break;
    case "mitmAlias":
      db.run(`DELETE FROM kv WHERE scope = 'mitmAlias'`);
      break;
    case "pricing":
      db.run(`DELETE FROM kv WHERE scope = 'pricing'`);
      break;
    default:
      break;
  }
}

function importProviderConnections(db, rows = []) {
  for (const c of rows) {
    const { id, provider, authType, name, email, priority, isActive, createdAt, updatedAt, ...rest } = c;
    db.run(
      `INSERT OR REPLACE INTO providerConnections(id, provider, authType, name, email, priority, isActive, data, createdAt, updatedAt) VALUES(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        provider,
        authType || "oauth",
        name || null,
        email || null,
        priority || null,
        isActive === false ? 0 : 1,
        stringifyJson(rest),
        createdAt || new Date().toISOString(),
        updatedAt || new Date().toISOString(),
      ]
    );
  }
}

function importProviderNodes(db, rows = []) {
  for (const n of rows) {
    const { id, type, name, createdAt, updatedAt, ...rest } = n;
    db.run(
      `INSERT OR REPLACE INTO providerNodes(id, type, name, data, createdAt, updatedAt) VALUES(?, ?, ?, ?, ?, ?)`,
      [id, type || null, name || null, stringifyJson(rest), createdAt || new Date().toISOString(), updatedAt || new Date().toISOString()]
    );
  }
}

function importProxyPools(db, rows = []) {
  for (const p of rows) {
    const { id, isActive, testStatus, createdAt, updatedAt, ...rest } = p;
    db.run(
      `INSERT OR REPLACE INTO proxyPools(id, isActive, testStatus, data, createdAt, updatedAt) VALUES(?, ?, ?, ?, ?, ?)`,
      [id, isActive === false ? 0 : 1, testStatus || "unknown", stringifyJson(rest), createdAt || new Date().toISOString(), updatedAt || new Date().toISOString()]
    );
  }
}

function importApiKeys(db, rows = []) {
  for (const k of rows) {
    db.run(
      `INSERT OR REPLACE INTO apiKeys(id, key, name, machineId, isActive, createdAt) VALUES(?, ?, ?, ?, ?, ?)`,
      [k.id, k.key, k.name || null, k.machineId || null, k.isActive === false ? 0 : 1, k.createdAt || new Date().toISOString()]
    );
  }
}

function importCombos(db, rows = []) {
  for (const c of rows) {
    db.run(
      `INSERT OR REPLACE INTO combos(id, name, kind, models, createdAt, updatedAt) VALUES(?, ?, ?, ?, ?, ?)`,
      [c.id, c.name, c.kind || null, stringifyJson(c.models || []), c.createdAt || new Date().toISOString(), c.updatedAt || new Date().toISOString()]
    );
  }
}

function importModelAliases(db, aliases = {}) {
  for (const [alias, model] of Object.entries(aliases)) {
    db.run(`INSERT OR REPLACE INTO kv(scope, key, value) VALUES('modelAliases', ?, ?)`, [alias, stringifyJson(model)]);
  }
}

function importCustomModels(db, models = []) {
  for (const m of models) {
    const key = `${m.providerAlias}|${m.id}|${m.type || "llm"}`;
    db.run(`INSERT OR REPLACE INTO kv(scope, key, value) VALUES('customModels', ?, ?)`, [key, stringifyJson(m)]);
  }
}

function importMitmAlias(db, aliases = {}) {
  for (const [tool, mappings] of Object.entries(aliases)) {
    db.run(`INSERT OR REPLACE INTO kv(scope, key, value) VALUES('mitmAlias', ?, ?)`, [tool, stringifyJson(mappings || {})]);
  }
}

function importPricing(db, pricing = {}) {
  for (const [provider, models] of Object.entries(pricing)) {
    db.run(`INSERT OR REPLACE INTO kv(scope, key, value) VALUES('pricing', ?, ?)`, [provider, stringifyJson(models || {})]);
  }
}

function importSection(db, sectionId, payload, { merge, excludeDashboardSettings }) {
  if (!merge) clearSection(db, sectionId);

  switch (sectionId) {
    case "settings":
      importSettings(db, payload.settings, { merge, excludeDashboardSettings });
      break;
    case "providerConnections":
      importProviderConnections(db, payload.providerConnections || []);
      break;
    case "providerNodes":
      importProviderNodes(db, payload.providerNodes || []);
      break;
    case "proxyPools":
      importProxyPools(db, payload.proxyPools || []);
      break;
    case "apiKeys":
      importApiKeys(db, payload.apiKeys || []);
      break;
    case "combos":
      importCombos(db, payload.combos || []);
      break;
    case "modelAliases":
      importModelAliases(db, payload.modelAliases || {});
      break;
    case "customModels":
      importCustomModels(db, payload.customModels || []);
      break;
    case "mitmAlias":
      importMitmAlias(db, payload.mitmAlias || {});
      break;
    case "pricing":
      importPricing(db, payload.pricing || {});
      break;
    default:
      break;
  }
}

export function importBackupPayload(db, payload, options = {}) {
  const sections = normalizeBackupSections(options.sections);
  const merge = options.merge !== false;
  const excludeDashboardSettings = options.excludeDashboardSettings === true;
  const sectionOptions = { merge, excludeDashboardSettings };

  if (!merge) {
    db.transaction(() => {
      for (const sectionId of sections) {
        importSection(db, sectionId, payload, { ...sectionOptions, merge: false });
      }
    });
    return;
  }

  db.transaction(() => {
    for (const sectionId of sections) {
      importSection(db, sectionId, payload, { ...sectionOptions, merge: true });
    }
  });
}