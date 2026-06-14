/**
 * Structured server logger for 9Router.
 * Output: [HH:MM:SS] [LEVEL] [SCOPE] message {optional data}
 */

const LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

const configuredLevel = (() => {
  const raw = (process.env.NINEROUTER_LOG_LEVEL || process.env.LOG_LEVEL || "info").toLowerCase();
  return LEVELS[raw.toUpperCase()] ?? LEVELS.INFO;
})();

function formatTime() {
  return new Date().toLocaleTimeString("en-US", { hour12: false });
}

function formatData(data) {
  if (data === undefined || data === null) return "";
  if (typeof data === "string") return data;
  if (data instanceof Error) return data.stack || data.message || String(data);
  try {
    return JSON.stringify(data);
  } catch {
    return String(data);
  }
}

function write(level, scope, message, data) {
  const threshold = LEVELS[level];
  if (threshold < configuredLevel) return;

  const dataStr = data !== undefined && data !== null ? ` ${formatData(data)}` : "";
  const line = `[${formatTime()}] [${level}] [${scope}] ${message}${dataStr}`;
  const method = level === "ERROR" ? "error" : level === "WARN" ? "warn" : level === "DEBUG" ? "debug" : "info";
  console[method](line);
}

export function debug(scope, message, data) {
  write("DEBUG", scope, message, data);
}

export function info(scope, message, data) {
  write("INFO", scope, message, data);
}

export function warn(scope, message, data) {
  write("WARN", scope, message, data);
}

export function error(scope, message, data) {
  write("ERROR", scope, message, data);
}

export function request(method, path, extra) {
  info("HTTP", `${method} ${path}`, extra);
}

export function response(status, durationMs, extra) {
  const level = status >= 400 ? "WARN" : "INFO";
  write(level, "HTTP", `${status} ${durationMs}ms`, extra);
}

export function stream(event, data) {
  debug("STREAM", event, data);
}

export function maskKey(key) {
  if (!key || key.length < 8) return "***";
  return `${key.slice(0, 4)}...${key.slice(-4)}`;
}
