#!/usr/bin/env node
/**
 * Keep technical UI labels in English — avoid over-Vietnamese for API/dev terms.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const viPath = path.join(__dirname, "../public/i18n/literals/vi.json");

const KEEP_ENGLISH = [
  "9Router Base URL",
  "API Endpoint",
  "API Key",
  "API Key (for Check)",
  "API Key Compatible Providers",
  "API Key Created",
  "API Key Name",
  "API Key Providers",
  "API Keys",
  "API Reference",
  "API Type",
  "API endpoint configuration",
  "API keys",
  "Access Token",
  "Advanced",
  "Anthropic Compatible (Prod)",
  "Anthropic Compatible Details",
  "Available Models",
  "Base URL",
  "Batch Size",
  "Chat Completions",
  "Cloudflare Tunnel",
  "Combo Round Robin",
  "Dashboard",
  "Debug",
  "Default Model",
  "Endpoint",
  "Input",
  "Input Cost",
  "Input Tokens",
  "Input Tokens:",
  "Input:",
  "Local",
  "MITM Proxy",
  "MITM Server",
  "Media Providers",
  "Messages API",
  "Model",
  "Model Fallback",
  "Model ID",
  "Model ID (from OpenRouter)",
  "Model ID (optional)",
  "Model Status",
  "Model is reachable",
  "Model not reachable",
  "Model:",
  "Models",
  "OAuth & API Keys",
  "OpenAI Compatible (Prod)",
  "OpenAI Compatible Details",
  "Output",
  "Output Cost",
  "Output Tokens",
  "Output Tokens:",
  "Output:",
  "Production Key",
  "Provider",
  "Provider Limits",
  "Provider Response",
  "Provider:",
  "Providers",
  "Proxy",
  "Proxy Pool",
  "Proxy Pools",
  "Proxy URL",
  "Refresh Token",
  "Require API key",
  "Responses API",
  "Round Robin",
  "Server",
  "Share Endpoint",
  "Sticky Limit",
  "Subagent Model",
  "Tailscale Funnel",
  "Terminal",
  "Token",
  "Tokens",
  "Unified Endpoint",
  "Usage by API Key",
  "Usage by Endpoint",
  "Usage by Model",
  "Vercel API Token",
  "Vercel Relay",
];

const vi = JSON.parse(fs.readFileSync(viPath, "utf8"));
let changed = 0;

for (const key of KEEP_ENGLISH) {
  if (vi[key] !== undefined && vi[key] !== key) {
    vi[key] = key;
    changed++;
  }
}

fs.writeFileSync(viPath, JSON.stringify(vi, null, 2) + "\n");
console.log(`Reverted ${changed} technical labels to English`);