"use client";

import { useState } from "react";
import PropTypes from "prop-types";
import { cn } from "@/shared/utils/cn";
import { translate } from "@/i18n/runtime";
import { getInputTokens } from "./utils";

function StatChip({ icon, label, value, mono = false }) {
  return (
    <div className="request-detail-stat-chip">
      <span className="material-symbols-outlined text-[16px] text-primary">{icon}</span>
      <div className="min-w-0">
        <p className="request-detail-stat-label">{label}</p>
        <p className={cn("request-detail-stat-value", mono && "font-mono tabular-nums")}>{value}</p>
      </div>
    </div>
  );
}

StatChip.propTypes = {
  icon: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  mono: PropTypes.bool,
};

export default function RequestDetailSummary({ detail, providerName }) {
  const [idCopied, setIdCopied] = useState(false);
  const isSuccess = detail.status === "success";
  const inputTokens = getInputTokens(detail.tokens);
  const outputTokens = detail.tokens?.completion_tokens ?? 0;
  const cachedTokens =
    detail.tokens?.cached_tokens ?? detail.tokens?.cache_read_input_tokens ?? 0;
  const reasoningTokens = detail.tokens?.reasoning_tokens ?? 0;

  const handleCopyId = async () => {
    if (!detail.id) return;
    try {
      await navigator.clipboard.writeText(detail.id);
      setIdCopied(true);
      setTimeout(() => setIdCopied(false), 1600);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="request-detail-summary">
      <div className="request-detail-summary-header">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-text-subtle">
            {translate("Model")}
          </p>
          <p className="truncate font-mono text-sm font-medium text-text-main sm:text-base">
            {detail.model}
          </p>
        </div>
        <span
          className={cn(
            "request-detail-status-pill",
            isSuccess ? "request-detail-status-pill--success" : "request-detail-status-pill--error"
          )}
        >
          <span className="material-symbols-outlined text-[14px]">
            {isSuccess ? "check_circle" : "error"}
          </span>
          {detail.status || "unknown"}
        </span>
      </div>

      <div className="request-detail-meta-grid">
        <div className="request-detail-meta-item">
          <span className="request-detail-meta-label">{translate("Provider")}</span>
          <span className="request-detail-meta-value">{providerName}</span>
        </div>
        <div className="request-detail-meta-item">
          <span className="request-detail-meta-label">{translate("Timestamp")}</span>
          <span className="request-detail-meta-value tabular-nums">
            {new Date(detail.timestamp).toLocaleString()}
          </span>
        </div>
        <div className="request-detail-meta-item sm:col-span-2">
          <span className="request-detail-meta-label">{translate("Request ID")}</span>
          <div className="flex items-start gap-2">
            <span className="request-detail-meta-value font-mono text-xs break-all flex-1">
              {detail.id}
            </span>
            <button
              type="button"
              className="request-detail-copy-id"
              onClick={handleCopyId}
              title={translate("Copy request ID")}
              aria-label={translate("Copy request ID")}
            >
              <span className="material-symbols-outlined text-[14px]">
                {idCopied ? "check" : "content_copy"}
              </span>
            </button>
          </div>
        </div>
        {detail.connectionId && (
          <div className="request-detail-meta-item sm:col-span-2">
            <span className="request-detail-meta-label">{translate("Connection")}</span>
            <span className="request-detail-meta-value font-mono text-xs break-all">
              {detail.connectionId}
            </span>
          </div>
        )}
      </div>

      <div className="request-detail-stat-row">
        <StatChip
          icon="input"
          label={translate("Input")}
          value={inputTokens.toLocaleString()}
          mono
        />
        <StatChip
          icon="output"
          label={translate("Output")}
          value={outputTokens.toLocaleString()}
          mono
        />
        <StatChip
          icon="bolt"
          label="TTFT"
          value={`${detail.latency?.ttft || 0} ms`}
          mono
        />
        <StatChip
          icon="schedule"
          label="Total"
          value={`${detail.latency?.total || 0} ms`}
          mono
        />
        {cachedTokens > 0 && (
          <StatChip
            icon="cached"
            label={translate("Cached")}
            value={cachedTokens.toLocaleString()}
            mono
          />
        )}
        {reasoningTokens > 0 && (
          <StatChip
            icon="psychology"
            label={translate("Reasoning")}
            value={reasoningTokens.toLocaleString()}
            mono
          />
        )}
      </div>
    </div>
  );
}

RequestDetailSummary.propTypes = {
  detail: PropTypes.object.isRequired,
  providerName: PropTypes.string.isRequired,
};