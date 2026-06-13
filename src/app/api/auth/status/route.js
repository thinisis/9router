import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getSettings } from "@/lib/localDb";
import { isOidcConfigured, looksLikeOpaqueId, pickOidcDisplayName, pickOidcEmail } from "@/lib/auth/oidc";
import { getDashboardAuthSession } from "@/lib/auth/dashboardSession";

function resolveDisplayName(session) {
  const storedName = String(session?.oidcName || "").trim();
  const storedUsername = String(session?.oidcUsername || "").trim();
  const storedEmail = String(session?.oidcEmail || "").trim();

  if (storedName && !looksLikeOpaqueId(storedName)) return storedName;
  if (storedUsername && !looksLikeOpaqueId(storedUsername)) return storedUsername;
  if (storedEmail) return storedEmail;
  if (session?.oidc) return "SSO Account";
  return "Local Account";
}

export async function GET() {
  try {
    const settings = await getSettings();
    const cookieStore = await cookies();
    const session = await getDashboardAuthSession(cookieStore.get("auth_token")?.value);
    const requireLogin = settings.requireLogin !== false;
    const authMode = settings.authMode || "password";
    const oidcEmail = String(session?.oidcEmail || pickOidcEmail(session || {}) || "").trim();
    const oidcName = String(session?.oidcName || pickOidcDisplayName(session || {}) || "").trim();
    const oidcUsername = String(session?.oidcUsername || "").trim();
    const displayName = resolveDisplayName({ ...session, oidcEmail, oidcName, oidcUsername });
    const loginMethod = session?.oidc ? "OIDC" : "Password";

    return NextResponse.json({
      requireLogin,
      authMode,
      oidcConfigured: isOidcConfigured(settings),
      oidcLoginLabel: (settings.oidcLoginLabel || "Sign in with OIDC").trim() || "Sign in with OIDC",
      hasPassword: !!settings.password,
      displayName,
      loginMethod,
      oidcName: oidcName && !looksLikeOpaqueId(oidcName) ? oidcName : null,
      oidcUsername: oidcUsername && !looksLikeOpaqueId(oidcUsername) ? oidcUsername : null,
      oidcEmail: oidcEmail || null,
      oidcLogin: !!session?.oidc,
    });
  } catch {
    return NextResponse.json({
      requireLogin: true,
      authMode: "password",
      oidcConfigured: false,
      oidcLoginLabel: "Sign in with OIDC",
      hasPassword: false,
      displayName: "Local Account",
      loginMethod: "Password",
      oidcName: null,
      oidcEmail: null,
      oidcLogin: false,
    });
  }
}