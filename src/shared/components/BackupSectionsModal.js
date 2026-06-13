"use client";

import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import Modal from "./Modal";
import Button from "./Button";
import Toggle from "./Toggle";
import { cn } from "@/shared/utils/cn";
import { BACKUP_SECTIONS } from "@/lib/db/backupSections";

function formatCount(sectionId, count) {
  if (sectionId === "settings") {
    return count > 0 ? `${count} fields` : "No fields";
  }
  return count === 1 ? "1 item" : `${count} items`;
}

export default function BackupSectionsModal({
  isOpen,
  onClose,
  onConfirm,
  mode = "export",
  summary = [],
  initialSections = [],
  loading = false,
  fileName = "",
}) {
  const availableSections = useMemo(() => {
    if (mode === "export") return BACKUP_SECTIONS;
    return summary.filter((section) => section.available);
  }, [mode, summary]);

  const [selected, setSelected] = useState(() => new Set(initialSections));
  const [merge, setMerge] = useState(true);
  const [excludeDashboardSettings, setExcludeDashboardSettings] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    const defaults = initialSections.length > 0
      ? initialSections
      : availableSections.map((section) => section.id);
    setSelected(new Set(defaults));
    setMerge(true);
    setExcludeDashboardSettings(true);
  }, [isOpen, initialSections, availableSections]);

  const allSelected = availableSections.length > 0 && availableSections.every((section) => selected.has(section.id));
  const noneSelected = selected.size === 0;

  const toggleSection = (sectionId) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(sectionId)) next.delete(sectionId);
      else next.add(sectionId);
      return next;
    });
  };

  const toggleAll = () => {
    if (allSelected) {
      setSelected(new Set());
      return;
    }
    setSelected(new Set(availableSections.map((section) => section.id)));
  };

  const summaryById = useMemo(() => {
    const map = new Map();
    for (const item of summary) map.set(item.id, item);
    return map;
  }, [summary]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === "export" ? "Choose backup contents" : "Choose what to import"}
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => onConfirm({
              sections: [...selected],
              merge,
              excludeDashboardSettings: selected.has("settings") && excludeDashboardSettings,
            })}
            loading={loading}
            disabled={noneSelected}
          >
            {mode === "export" ? "Continue" : merge ? "Merge selected" : "Replace selected"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {mode === "import" && fileName && (
          <div className="rounded-xl glass-panel-subtle px-3 py-2.5">
            <p className="text-xs text-text-muted">Backup file</p>
            <p className="text-sm font-medium break-all">{fileName}</p>
          </div>
        )}

        <p className="text-sm text-text-muted">
          {mode === "export"
            ? "Select the data categories to include in your backup file."
            : "Only the categories you select will be applied. Unselected data in your current setup stays unchanged."}
        </p>

        <div className="flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={toggleAll}
            className="text-sm font-medium text-primary hover:underline"
          >
            {allSelected ? "Deselect all" : "Select all"}
          </button>
          <span className="text-xs text-text-muted">
            {selected.size} of {availableSections.length} selected
          </span>
        </div>

        <div className="flex flex-col gap-2 max-h-[min(50vh,360px)] overflow-y-auto custom-scrollbar pr-1">
          {availableSections.map((section) => {
            const meta = summaryById.get(section.id);
            const checked = selected.has(section.id);
            const countLabel = mode === "import" && meta
              ? formatCount(section.id, meta.count)
              : null;

            return (
              <label
                key={section.id}
                className={cn(
                  "flex items-start gap-3 rounded-xl border px-3 py-3 cursor-pointer transition-colors",
                  checked
                    ? "border-primary/40 bg-primary/5"
                    : "border-divider glass-panel-subtle hover:border-default-300"
                )}
              >
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => toggleSection(section.id)}
                  className="mt-1 size-4 rounded border-default-300 text-primary focus:ring-primary/30"
                />
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="text-sm font-medium text-foreground">{section.label}</span>
                    {countLabel && (
                      <span className="text-[11px] px-1.5 py-0.5 rounded-md bg-default-100 text-default-500">
                        {countLabel}
                      </span>
                    )}
                  </span>
                  <span className="block text-xs text-text-muted mt-0.5">{section.description}</span>
                </span>
              </label>
            );
          })}
        </div>

        {mode === "import" && (
          <div className="flex flex-col gap-2">
            <div className="rounded-xl glass-panel-subtle px-3 py-3">
              <Toggle
                checked={merge}
                onChange={setMerge}
                label="Merge with existing data"
                description={
                  merge
                    ? "Add or update matching records. Existing records not in the backup are kept."
                    : "Replace each selected category entirely. Records not in the backup will be removed."
                }
              />
            </div>
            {selected.has("settings") && (
              <div className="rounded-xl glass-panel-subtle px-3 py-3">
                <Toggle
                  checked={excludeDashboardSettings}
                  onChange={setExcludeDashboardSettings}
                  label="Keep current dashboard auth"
                  description="Import routing, proxy, and observability settings only. Password, OIDC, and login rules stay unchanged."
                />
              </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}

BackupSectionsModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  mode: PropTypes.oneOf(["export", "import"]),
  summary: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string,
      description: PropTypes.string,
      available: PropTypes.bool,
      count: PropTypes.number,
    })
  ),
  initialSections: PropTypes.arrayOf(PropTypes.string),
  loading: PropTypes.bool,
  fileName: PropTypes.string,
};