"use client";

import { DEFAULT_LOCALE, LOCALE_COOKIE, normalizeLocale, isSupportedLocale } from "./config";

let translationMap = {};
let currentLocale = DEFAULT_LOCALE;
let reloadCallbacks = [];
let readyCallbacks = [];
let domObserver = null;
let reprocessTimer = null;
let i18nReady = false;
let bootstrapped = false;

function getLocaleFromCookie() {
  if (typeof document === "undefined") return "";
  const cookie = document.cookie
    .split(";")
    .find((c) => c.trim().startsWith(`${LOCALE_COOKIE}=`));
  const value = cookie ? decodeURIComponent(cookie.split("=")[1]) : "";
  return value && isSupportedLocale(value) ? normalizeLocale(value) : "";
}

function getBootstrapLocale() {
  if (typeof window !== "undefined" && window.__9ROUTER_LOCALE__) {
    const injected = window.__9ROUTER_LOCALE__;
    if (isSupportedLocale(injected)) return normalizeLocale(injected);
  }
  const cookieLocale = getLocaleFromCookie();
  if (cookieLocale) return cookieLocale;
  return DEFAULT_LOCALE;
}

function getInlineTranslationMap() {
  if (typeof window === "undefined") return null;
  const inline = window.__9ROUTER_TRANSLATIONS__;
  if (inline && typeof inline === "object") return inline;
  return null;
}

async function fetchPersistedLocale() {
  try {
    const res = await fetch("/api/locale", { cache: "no-store" });
    if (!res.ok) return null;
    const data = await res.json();
    if (data?.locale && isSupportedLocale(data.locale)) {
      return normalizeLocale(data.locale);
    }
  } catch {
    // ignore network errors during boot
  }
  return null;
}

function loadTranslationsSync(locale) {
  if (locale === "en") {
    translationMap = {};
    return true;
  }

  const inline = getInlineTranslationMap();
  if (inline) {
    translationMap = inline;
    return true;
  }
  return false;
}

async function loadTranslations(locale) {
  if (locale === "en") {
    translationMap = {};
    return;
  }

  if (loadTranslationsSync(locale)) return;

  try {
    const response = await fetch(`/i18n/literals/${locale}.json`, { cache: "no-store" });
    translationMap = await response.json();
  } catch (err) {
    console.error("Failed to load translations:", err);
    translationMap = {};
  }
}

function markI18nReady() {
  if (i18nReady) return;
  i18nReady = true;
  if (typeof document !== "undefined") {
    document.documentElement.classList.add("i18n-ready");
    document.documentElement.classList.remove("i18n-pending");
  }
  readyCallbacks.forEach((callback) => callback());
  readyCallbacks = [];
}

export function isI18nReady() {
  return i18nReady;
}

export function onI18nReady(callback) {
  if (i18nReady) {
    callback();
    return () => {};
  }
  readyCallbacks.push(callback);
  return () => {
    readyCallbacks = readyCallbacks.filter((cb) => cb !== callback);
  };
}

export function translate(text) {
  if (!text || typeof text !== "string") return text;
  if (!bootstrapped && typeof window !== "undefined") {
    bootstrapI18n(getBootstrapLocale());
  }
  const trimmed = text.trim();
  if (!trimmed) return text;
  if (currentLocale === "en") return text;
  return translationMap[trimmed] || translationMap[text] || text;
}

export function getCurrentLocale() {
  return currentLocale;
}

export function onLocaleChange(callback) {
  reloadCallbacks.push(callback);
  return () => {
    reloadCallbacks = reloadCallbacks.filter((cb) => cb !== callback);
  };
}

function applyDocumentLocale(locale) {
  if (typeof document === "undefined") return;
  document.documentElement.lang = locale;
  if (typeof window !== "undefined") {
    window.__9ROUTER_LOCALE__ = locale;
  }
}

function scheduleDomReprocess() {
  if (typeof window === "undefined") return;
  clearTimeout(reprocessTimer);
  reprocessTimer = setTimeout(() => {
    processElement(document.body);
  }, 32);
}

function processTextNode(node) {
  if (!node.nodeValue || !node.nodeValue.trim()) return;

  const parent = node.parentElement;
  if (!parent) return;

  let element = parent;
  while (element) {
    if (element.hasAttribute && element.hasAttribute("data-i18n-skip")) {
      return;
    }
    element = element.parentElement;
  }

  const tagName = parent.tagName?.toLowerCase();
  const skipTags = [
    "script", "style", "code", "pre",
    "colgroup", "table", "thead", "tbody", "tfoot", "tr",
    "select", "datalist", "optgroup",
  ];
  if (skipTags.includes(tagName)) return;

  const current = node.nodeValue;

  if (node._originalText) {
    const expectedFromStored = translate(node._originalText);
    const unchangedEnglish = current === node._originalText;
    const unchangedTranslation = current === expectedFromStored;
    if (!unchangedEnglish && !unchangedTranslation) {
      node._originalText = current;
    }
  } else {
    node._originalText = current;
  }

  const original = node._originalText;
  const translated = translate(original);

  if (translated !== current) {
    node.nodeValue = translated;
  }
}

function processElement(element) {
  if (!element) return;

  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT, null, false);
  let node;
  const nodesToProcess = [];
  while ((node = walker.nextNode())) {
    nodesToProcess.push(node);
  }
  nodesToProcess.forEach(processTextNode);
}

export function reprocessDom(root = document.body) {
  if (typeof document === "undefined" || !root) return;
  processElement(root);
}

function ensureDomObserver() {
  if (typeof window === "undefined" || domObserver) return;

  domObserver = new MutationObserver((mutations) => {
    let needsReprocess = false;

    for (const mutation of mutations) {
      if (mutation.type === "characterData") {
        needsReprocess = true;
        continue;
      }
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          processElement(node);
        } else if (node.nodeType === Node.TEXT_NODE) {
          processTextNode(node);
        }
      });
    }

    if (needsReprocess) scheduleDomReprocess();
  });

  domObserver.observe(document.body, {
    childList: true,
    subtree: true,
    characterData: true,
  });
}

/** Sync bootstrap — call in useLayoutEffect before paint. */
export function bootstrapI18n(forcedLocale) {
  if (typeof window === "undefined") return currentLocale;

  const locale = forcedLocale
    ? normalizeLocale(forcedLocale)
    : getBootstrapLocale();

  currentLocale = locale;
  applyDocumentLocale(locale);
  loadTranslationsSync(locale);
  bootstrapped = true;

  document.documentElement.classList.add("i18n-pending");
  document.documentElement.classList.remove("i18n-ready");

  return locale;
}

export async function setCurrentLocale(locale, { persistCookie = true, reprocess = true } = {}) {
  const normalized = normalizeLocale(locale);
  const localeChanged = normalized !== currentLocale;
  currentLocale = normalized;
  applyDocumentLocale(normalized);
  await loadTranslations(normalized);

  if (persistCookie && typeof document !== "undefined") {
    document.cookie = `${LOCALE_COOKIE}=${encodeURIComponent(normalized)}; path=/; max-age=${60 * 60 * 24 * 365 * 5}; samesite=lax`;
  }

  reloadCallbacks.forEach((callback) => callback(normalized));
  if (reprocess) processElement(document.body);
  return normalized;
}

/** Apply DOM translations and mark ready — call once after first paint. */
export async function finalizeI18n(root) {
  if (typeof window === "undefined") return;

  if (!bootstrapped) {
    bootstrapI18n();
  }

  if (currentLocale !== "en" && !Object.keys(translationMap).length) {
    const persisted = await fetchPersistedLocale();
    if (persisted && persisted !== currentLocale) {
      currentLocale = persisted;
      applyDocumentLocale(persisted);
    }
    await loadTranslations(currentLocale);
  }

  reprocessDom(root || document.body);
  ensureDomObserver();
  markI18nReady();
}

export async function initRuntimeI18n() {
  bootstrapI18n();
  await finalizeI18n(document.body);
}

export async function reloadTranslations(forcedLocale) {
  const wasReady = i18nReady;
  if (wasReady) {
    i18nReady = false;
    document.documentElement.classList.remove("i18n-ready");
    document.documentElement.classList.add("i18n-pending");
  }

  const locale = forcedLocale
    ? normalizeLocale(forcedLocale)
    : (await fetchPersistedLocale()) || getBootstrapLocale();

  await setCurrentLocale(locale, { persistCookie: false });
  ensureDomObserver();
  markI18nReady();
}

/* Sync bootstrap before first React render when inline literals are injected in layout */
if (typeof window !== "undefined") {
  const injectedLocale = window.__9ROUTER_LOCALE__;
  const injectedLiterals = window.__9ROUTER_TRANSLATIONS__;
  if ((injectedLocale || injectedLiterals) && !bootstrapped) {
    bootstrapI18n(injectedLocale || undefined);
  }
}