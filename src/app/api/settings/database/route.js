import { NextResponse } from "next/server";
import {
  exportDb,
  getSettings,
  importDb,
  summarizeBackupPayload,
  detectBackupSections,
  normalizeBackupSections,
} from "@/lib/localDb";
import { applyOutboundProxyEnv } from "@/lib/network/outboundProxy";
import { verifyDatabaseAccess } from "@/lib/auth/dashboardSession";
import { stripBackupMeta } from "@/lib/db/backupSections";

const CLI_TOKEN_HEADER = "x-9r-cli-token";
const PASSWORD_HEADER = "x-9r-password";

// CLI token requests are already trusted (local machine); skip password re-auth.
function isCliRequest(request) {
  return Boolean(request.headers.get(CLI_TOKEN_HEADER));
}

function parseSectionsParam(value) {
  if (!value) return undefined;
  return value.split(",").map((part) => part.trim()).filter(Boolean);
}

export async function GET(request) {
  try {
    if (!isCliRequest(request) && !(await verifyDatabaseAccess(request))) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const sections = parseSectionsParam(request.nextUrl.searchParams.get("sections"));
    const payload = await exportDb({ sections });
    return NextResponse.json(payload);
  } catch (error) {
    console.log("Error exporting database:", error);
    return NextResponse.json({ error: "Failed to export database" }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const {
      password,
      sections,
      merge = true,
      excludeDashboardSettings = false,
      preview = false,
      ...payload
    } = body || {};

    if (!isCliRequest(request) && !(await verifyDatabaseAccess(request, password))) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const data = stripBackupMeta(payload);
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      return NextResponse.json({ error: "Invalid database payload" }, { status: 400 });
    }

    if (preview) {
      const availableSections = detectBackupSections(data);
      return NextResponse.json({
        sections: availableSections,
        summary: summarizeBackupPayload(data),
        meta: payload?._meta || null,
      });
    }

    const selectedSections = normalizeBackupSections(sections ?? detectBackupSections(data));
    await importDb(data, {
      sections: selectedSections,
      merge: merge !== false,
      excludeDashboardSettings: excludeDashboardSettings === true,
    });

    // Ensure proxy settings take effect immediately after a DB import.
    try {
      const settings = await getSettings();
      applyOutboundProxyEnv(settings);
    } catch (err) {
      console.warn("[Settings][DatabaseImport] Failed to re-apply outbound proxy env:", err);
    }

    return NextResponse.json({
      success: true,
      importedSections: selectedSections,
      merge: merge !== false,
      excludeDashboardSettings: excludeDashboardSettings === true,
    });
  } catch (error) {
    console.log("Error importing database:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to import database" },
      { status: 400 }
    );
  }
}