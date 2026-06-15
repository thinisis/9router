"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, Button, CardSkeleton, GlassAlert } from "@/shared/components";
import { cn } from "@/shared/utils/cn";

function StatusCard({ href, icon, label, value, sub, variant = "default" }) {
  const valueColors = {
    default: "text-text-main",
    success: "text-success",
    warning: "text-warning",
    danger: "text-danger",
  };

  const inner = (
    <Card padding="sm" hover className="h-full">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-text-muted uppercase tracking-wide mb-1">{label}</p>
          <p className={cn("text-2xl font-semibold font-display truncate", valueColors[variant])}>
            {value}
          </p>
          {sub && <p className="text-xs text-text-muted mt-1 truncate">{sub}</p>}
        </div>
        <div className="size-10 rounded-[12px] glass-panel-subtle flex items-center justify-center text-primary shrink-0">
          <span className="material-symbols-outlined text-[20px]">{icon}</span>
        </div>
      </div>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className="block min-w-0" data-reveal>
        {inner}
      </Link>
    );
  }
  return <div data-reveal>{inner}</div>;
}

export default function OverviewPageClient() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    providers: { total: 0, active: 0, errors: 0 },
    keys: 0,
    tunnel: { enabled: false, reachable: false },
    mitm: { running: false },
    usage: { requestsToday: 0 },
    health: true,
  });
  const [issues, setIssues] = useState([]);

  useEffect(() => {
    async function load() {
      try {
        const isRemoteDashboard =
          typeof window !== "undefined" &&
          window.location.hostname !== "localhost" &&
          window.location.hostname !== "127.0.0.1";

        const [provRes, keysRes, tunnelRes, mitmRes, statsRes, healthRes] = await Promise.all([
          fetch("/api/providers"),
          fetch("/api/keys"),
          fetch("/api/tunnel/status"),
          isRemoteDashboard
            ? Promise.resolve({ ok: false, status: 403 })
            : fetch("/api/cli-tools/antigravity-mitm"),
          fetch("/api/usage/stats?period=today"),
          fetch("/api/health"),
        ]);

        const prov = provRes.ok ? await provRes.json() : { connections: [] };
        const keys = keysRes.ok ? await keysRes.json() : { keys: [] };
        const tunnel = tunnelRes.ok ? await tunnelRes.json() : {};
        const mitm = mitmRes.ok ? await mitmRes.json() : {};
        const stats = statsRes.ok ? await statsRes.json() : {};
        const health = healthRes.ok;

        const connections = prov.connections || [];
        const active = connections.filter((c) => c.isActive !== false);
        const errors = active.filter(
          (c) => c.testStatus === "error" || c.testStatus === "expired" || c.lastError
        ).length;

        const next = {
          providers: { total: connections.length, active: active.length, errors },
          keys: (keys.keys || []).length,
          tunnel: {
            enabled: !!(tunnel.enabled || tunnel.cloudflare?.enabled),
            reachable: !!(tunnel.reachable || tunnel.cloudflare?.reachable),
          },
          mitm: { running: !!mitm.running },
          usage: { requestsToday: stats.totalRequests ?? stats.requests ?? 0 },
          health,
        };
        setData(next);

        const list = [];
        if (active.length === 0) {
          list.push({ message: "No active providers connected.", href: "/dashboard/providers", label: "Add provider" });
        }
        if (errors > 0) {
          list.push({
            message: `${errors} provider connection(s) have errors.`,
            href: "/dashboard/providers",
            label: "Review",
          });
        }
        if (next.keys === 0) {
          list.push({ message: "No API keys created yet.", href: "/dashboard/endpoint", label: "Create key" });
        }
        if (next.tunnel.enabled && !next.tunnel.reachable) {
          list.push({ message: "Tunnel is enabled but not reachable.", href: "/dashboard/endpoint", label: "Check tunnel" });
        }
        setIssues(list);
      } catch {
        setData((d) => ({ ...d, health: false }));
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-6">
        <CardSkeleton />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
          <CardSkeleton />
        </div>
      </div>
    );
  }

  return (
    <div className="flex w-full flex-col gap-6">
      <div data-reveal className="flex flex-wrap justify-end gap-2">
          <Link href="/dashboard/endpoint">
            <Button variant="outline" size="sm" icon="api">
              Endpoint
            </Button>
          </Link>
          <Link href="/dashboard/providers">
            <Button size="sm" icon="add">
              Add provider
            </Button>
          </Link>
      </div>

      {issues.length > 0 && (
        <div className="flex flex-col gap-2" data-reveal>
          {issues.map((issue) => (
            <GlassAlert
              key={issue.message}
              variant="warning"
              hideIcon
              message={issue.message}
              action={{ label: issue.label, href: issue.href }}
            />
          ))}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatusCard
          href="/dashboard/providers"
          icon="dns"
          label="Providers"
          value={data.providers.active}
          sub={
            data.providers.errors > 0
              ? `${data.providers.errors} with errors`
              : `${data.providers.total} total connections`
          }
          variant={data.providers.errors > 0 ? "warning" : data.providers.active > 0 ? "success" : "default"}
        />
        <StatusCard
          href="/dashboard/endpoint"
          icon="vpn_key"
          label="API keys"
          value={data.keys}
          sub={data.keys === 0 ? "Create your first key" : "Active credentials"}
          variant={data.keys === 0 ? "warning" : "success"}
        />
        <StatusCard
          href="/dashboard/endpoint"
          icon="cloud_upload"
          label="Tunnel"
          value={data.tunnel.enabled ? (data.tunnel.reachable ? "Online" : "Pending") : "Off"}
          sub={data.tunnel.enabled ? "Remote access" : "Local only"}
          variant={
            data.tunnel.enabled
              ? data.tunnel.reachable
                ? "success"
                : "warning"
              : "default"
          }
        />
        <StatusCard
          href="/dashboard/mitm"
          icon="security"
          label="MITM"
          value={data.mitm.running ? "Running" : "Stopped"}
          sub="CLI traffic intercept"
          variant={data.mitm.running ? "success" : "default"}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card padding="md" data-reveal>
          <h3 className="font-semibold text-text-main mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">bolt</span>
            Quick actions
          </h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              { href: "/dashboard/providers", icon: "dns", label: "Manage providers" },
              { href: "/dashboard/combos", icon: "layers", label: "Model combos" },
              { href: "/dashboard/cli-tools", icon: "terminal", label: "CLI tools" },
              { href: "/dashboard/usage", icon: "bar_chart", label: "Usage & logs" },
              { href: "/dashboard/quota", icon: "data_usage", label: "Quota tracker" },
              { href: "/dashboard/profile", icon: "settings", label: "Settings" },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-2 px-3 py-2.5 rounded-[12px] border border-border-subtle hover:bg-surface-2/60 transition-colors text-sm text-text-main"
              >
                <span className="material-symbols-outlined text-[18px] text-primary">{item.icon}</span>
                {item.label}
              </Link>
            ))}
          </div>
        </Card>

        <Card padding="md" data-reveal>
          <h3 className="font-semibold text-text-main mb-3 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-[20px]">monitoring</span>
            Today
          </h3>
          <div className="flex items-baseline gap-2 mb-4">
            <span className="text-3xl font-display font-semibold text-text-main">
              {data.usage.requestsToday}
            </span>
            <span className="text-sm text-text-muted">requests</span>
          </div>
          <Link href="/dashboard/usage">
            <Button variant="outline" size="sm" icon="arrow_forward">
              View usage
            </Button>
          </Link>
          <div className="mt-4 pt-4 border-t border-border-subtle flex items-center gap-2 text-xs text-text-muted">
            <span
              className={cn(
                "size-2 rounded-full shrink-0",
                data.health ? "bg-success" : "bg-danger"
              )}
            />
            API health: {data.health ? "OK" : "Unreachable"}
          </div>
        </Card>
      </div>
    </div>
  );
}