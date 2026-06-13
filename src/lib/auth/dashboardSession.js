import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { DATA_DIR } from "@/lib/dataDir";
import { getSettings } from "@/lib/localDb";

const DEFAULT_PASSWORD = "123456";

function loadJwtSecret() {
  if (process.env.JWT_SECRET) return process.env.JWT_SECRET;
  const file = path.join(DATA_DIR, "jwt-secret");
  try {
    return fs.readFileSync(file, "utf8").trim();
  } catch {}
  fs.mkdirSync(DATA_DIR, { recursive: true });
  const generated = crypto.randomBytes(32).toString("hex");
  fs.writeFileSync(file, generated, { mode: 0o600 });
  return generated;
}

const SECRET = new TextEncoder().encode(loadJwtSecret());

export function shouldUseSecureCookie(request) {
  const forceSecureCookie = process.env.AUTH_COOKIE_SECURE === "true";
  const forwardedProto = request?.headers?.get?.("x-forwarded-proto");
  const isHttpsRequest = forwardedProto === "https";
  return forceSecureCookie || isHttpsRequest;
}

export async function createDashboardAuthToken(claims = {}) {
  return new SignJWT({ authenticated: true, ...claims })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(SECRET);
}

export async function verifyDashboardAuthToken(token) {
  if (!token) return false;
  try {
    await jwtVerify(token, SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function getDashboardAuthSession(token) {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload;
  } catch {
    return null;
  }
}

export async function setDashboardAuthCookie(cookieStore, request, claims = {}) {
  const token = await createDashboardAuthToken(claims);
  cookieStore.set("auth_token", token, {
    httpOnly: true,
    secure: shouldUseSecureCookie(request),
    sameSite: "lax",
    path: "/",
  });
}

export function clearDashboardAuthCookie(cookieStore) {
  cookieStore.delete("auth_token");
}

// Verify the current dashboard password (re-auth for sensitive actions).
export async function verifyDashboardPassword(password) {
  if (typeof password !== "string" || !password) return false;
  const settings = await getSettings();
  const storedHash = settings?.password;
  if (storedHash) return bcrypt.compare(password, storedHash);
  const initialPassword = process.env.INITIAL_PASSWORD || DEFAULT_PASSWORD;
  return password === initialPassword;
}

// Database import/export: accept an active dashboard session or password re-auth.
export async function verifyDatabaseAccess(request, password) {
  const token = request?.cookies?.get?.("auth_token")?.value;
  if (token && (await verifyDashboardAuthToken(token))) return true;

  const candidates = [password, request?.headers?.get?.("x-9r-password")];
  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate && (await verifyDashboardPassword(candidate))) {
      return true;
    }
  }
  return false;
}
