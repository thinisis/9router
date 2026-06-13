"use client";

import PropTypes from "prop-types";
import { cn } from "@/shared/utils/cn";

export default function ModelRow({
  model,
  fullModel,
  alias,
  copied,
  onCopy,
  testStatus,
  isCustom,
  isFree,
  isDisabled,
  onDeleteAlias,
  onTest,
  isTesting,
  onDisable,
  onEnable,
  layout = "grid",
}) {
  const borderColor = isDisabled
    ? "border-default-300/50 opacity-70"
    : testStatus === "ok"
      ? "border-green-500/40"
      : testStatus === "error"
        ? "border-red-500/40"
        : "border-divider";

  const iconColor = isDisabled
    ? undefined
    : testStatus === "ok"
      ? "#22c55e"
      : testStatus === "error"
        ? "#ef4444"
        : undefined;

  const iconName = isDisabled
    ? "pause_circle"
    : testStatus === "ok"
      ? "check_circle"
      : testStatus === "error"
        ? "cancel"
        : "smart_toy";

  return (
    <div
      className={cn(
        "group model-row glass-panel-subtle transition-colors hover:border-primary/25",
        layout === "list" ? "model-row--list w-full" : "model-row--grid max-w-full",
        borderColor
      )}
    >
      <div className={cn("flex min-w-0 gap-2", layout === "list" ? "items-center" : "items-start sm:items-center")}>
        <span
          className="material-symbols-outlined shrink-0 text-base"
          style={iconColor ? { color: iconColor } : undefined}
        >
          {iconName}
        </span>

        <div className="min-w-0 flex-1 flex flex-col gap-0.5">
          <div className="flex flex-wrap items-center gap-2 min-w-0">
            <code className="truncate rounded bg-surface-2 px-1.5 py-0.5 font-mono text-xs text-foreground max-w-full">
              {fullModel}
            </code>
            {isCustom && (
              <span className="rounded-full bg-amber-500/12 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:text-amber-300">
                Custom
              </span>
            )}
            {isFree && (
              <span className="rounded-full bg-green-500/12 px-2 py-0.5 text-[10px] font-medium text-green-700 dark:text-green-300">
                Free
              </span>
            )}
            {isDisabled && (
              <span className="rounded-full bg-default-200 px-2 py-0.5 text-[10px] font-medium text-text-muted">
                Disabled
              </span>
            )}
          </div>
          {model.name && model.name !== model.id && (
            <span className="truncate text-[11px] text-text-muted pl-0.5">{model.name}</span>
          )}
          {alias && alias !== model.id && (
            <span className="truncate text-[10px] text-text-muted/80 pl-0.5">alias: {alias}</span>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-0.5 sm:gap-1">
          {onTest && !isDisabled && (
            <button
              type="button"
              data-pressable
              onClick={onTest}
              disabled={isTesting}
              className="model-row-action"
              title={isTesting ? "Testing..." : "Test"}
            >
              <span
                className="material-symbols-outlined text-[18px]"
                style={isTesting ? { animation: "spin 1s linear infinite" } : undefined}
              >
                {isTesting ? "progress_activity" : "science"}
              </span>
            </button>
          )}
          <button
            type="button"
            data-pressable
            onClick={() => onCopy(fullModel, `model-${model.id}`)}
            className="model-row-action"
            title={copied === `model-${model.id}` ? "Copied" : "Copy"}
          >
            <span className="material-symbols-outlined text-[18px]">
              {copied === `model-${model.id}` ? "check" : "content_copy"}
            </span>
          </button>
          {isCustom && onDeleteAlias && (
            <button
              type="button"
              data-pressable
              onClick={onDeleteAlias}
              className="model-row-action model-row-action--danger"
              title="Remove custom model"
            >
              <span className="material-symbols-outlined text-[18px]">delete</span>
            </button>
          )}
          {!isCustom && onDisable && (
            <button
              type="button"
              data-pressable
              onClick={onDisable}
              className="model-row-action model-row-action--danger"
              title="Disable model"
            >
              <span className="material-symbols-outlined text-[18px]">block</span>
            </button>
          )}
          {onEnable && (
            <button
              type="button"
              data-pressable
              onClick={onEnable}
              className="model-row-action"
              title="Enable model"
            >
              <span className="material-symbols-outlined text-[18px]">restart_alt</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

ModelRow.propTypes = {
  model: PropTypes.shape({
    id: PropTypes.string.isRequired,
    name: PropTypes.string,
    isFree: PropTypes.bool,
  }).isRequired,
  fullModel: PropTypes.string.isRequired,
  alias: PropTypes.string,
  copied: PropTypes.string,
  onCopy: PropTypes.func.isRequired,
  testStatus: PropTypes.oneOf(["ok", "error"]),
  isCustom: PropTypes.bool,
  isFree: PropTypes.bool,
  isDisabled: PropTypes.bool,
  onDeleteAlias: PropTypes.func,
  onTest: PropTypes.func,
  isTesting: PropTypes.bool,
  onDisable: PropTypes.func,
  onEnable: PropTypes.func,
  layout: PropTypes.oneOf(["grid", "list"]),
};