"use client";

import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { cn } from "@/shared/utils/cn";
import { translate, translateFormat } from "@/i18n/runtime";
import { formatPayload, payloadMeta } from "./utils";

const COLLAPSED_MAX_H = 280;

export default function RequestDetailPayload({
  value,
  emptyLabel = "[Empty]",
  variant = "default",
}) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const text = useMemo(() => {
    const raw = formatPayload(value);
    return raw.trim() ? raw : emptyLabel;
  }, [value, emptyLabel]);

  const { lines, chars } = useMemo(() => payloadMeta(text), [text]);
  const isLong = lines > 14 || chars > 1200;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="request-detail-payload">
      <div className="request-detail-payload-toolbar">
        <span className="request-detail-payload-meta" data-i18n-skip>
          {translateFormat("{lines} lines · {chars} chars", {
            lines,
            chars: chars.toLocaleString(),
          })}
        </span>
        <div className="flex items-center gap-1">
          {isLong && (
            <button
              type="button"
              className="request-detail-payload-btn"
              onClick={() => setExpanded((v) => !v)}
            >
              <span className="material-symbols-outlined text-[16px]">
                {expanded ? "unfold_less" : "unfold_more"}
              </span>
              <span className="request-detail-payload-btn__label">
                {expanded ? translate("Collapse") : translate("Expand")}
              </span>
            </button>
          )}
          <button type="button" className="request-detail-payload-btn" onClick={handleCopy}>
            <span className="material-symbols-outlined text-[16px]">
              {copied ? "check" : "content_copy"}
            </span>
            <span className="request-detail-payload-btn__label">
              {copied ? translate("Copied") : translate("Copy")}
            </span>
          </button>
        </div>
      </div>
      <pre
        className={cn(
          "request-detail-payload-code custom-scrollbar",
          variant === "thinking" && "request-detail-payload-code--thinking",
          !expanded && isLong && "request-detail-payload-code--clamped"
        )}
        style={expanded ? undefined : { maxHeight: COLLAPSED_MAX_H }}
      >
        {text}
      </pre>
    </div>
  );
}

RequestDetailPayload.propTypes = {
  value: PropTypes.any,
  emptyLabel: PropTypes.string,
  variant: PropTypes.oneOf(["default", "thinking"]),
};