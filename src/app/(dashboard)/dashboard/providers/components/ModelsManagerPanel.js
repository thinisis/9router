"use client";

import { useMemo, useState } from "react";
import PropTypes from "prop-types";
import { Button, Input, SegmentedControl, StatusMetricChip, InlineFeedback } from "@/shared/components";
import { cn } from "@/shared/utils/cn";
import { translate } from "@/i18n/runtime";
import ModelRow from "../[id]/ModelRow";
import CompatibleModelsSection from "../[id]/CompatibleModelsSection";

const FILTER_OPTIONS = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "custom", label: "Custom" },
  { value: "disabled", label: "Disabled" },
  { value: "passed", label: "Passed" },
  { value: "failed", label: "Failed" },
];

export default function ModelsManagerPanel({
  isCompatible,
  providerId,
  providerInfo,
  providerStorageAlias,
  providerDisplayAlias,
  models,
  kiloFreeModels,
  disabledModelIds,
  modelAliases,
  modelTestResults,
  testingModelId,
  modelsTestError,
  connections,
  isFreeNoAuth,
  suggestedModels,
  copied,
  onCopy,
  onSetAlias,
  onDeleteAlias,
  onTestModel,
  onDisableModel,
  onEnableModel,
  onEnableAll,
  onDisableAll,
  onAddCustomModel,
  onImportQoderModels,
  importingQoderModels,
  isAnthropicCompatible,
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  const [view, setView] = useState("list");

  if (isCompatible) {
    return (
      <CompatibleModelsSection
        providerStorageAlias={providerStorageAlias}
        providerDisplayAlias={providerDisplayAlias}
        modelAliases={modelAliases}
        copied={copied}
        onCopy={onCopy}
        onSetAlias={onSetAlias}
        onDeleteAlias={onDeleteAlias}
        connections={connections}
        isAnthropic={isAnthropicCompatible}
      />
    );
  }

  const allModels = useMemo(() => {
    const merged = [
      ...models,
      ...kiloFreeModels.filter((fm) => !models.some((m) => m.id === fm.id)),
    ].filter((m) => !m.type || m.type === "llm");
    return merged;
  }, [models, kiloFreeModels]);

  const disabledSet = useMemo(() => new Set(disabledModelIds), [disabledModelIds]);

  const customModels = useMemo(
    () =>
      Object.entries(modelAliases)
        .filter(([alias, fullModel]) => {
          const prefix = `${providerStorageAlias}/`;
          if (!fullModel.startsWith(prefix)) return false;
          const modelId = fullModel.slice(prefix.length);
          if (providerInfo?.passthroughModels) return !models.some((m) => m.id === modelId);
          return !models.some((m) => m.id === modelId) && alias === modelId;
        })
        .map(([alias, fullModel]) => ({
          id: fullModel.slice(`${providerStorageAlias}/`.length),
          alias,
          fullModel,
          isCustom: true,
        })),
    [modelAliases, providerStorageAlias, providerInfo, models]
  );

  const builtInEntries = useMemo(
    () =>
      allModels.map((model) => {
        const fullModel = `${providerStorageAlias}/${model.id}`;
        const oldFormatModel = `${providerId}/${model.id}`;
        const existingAlias = Object.entries(modelAliases).find(
          ([, m]) => m === fullModel || m === oldFormatModel
        )?.[0];
        return {
          model,
          id: model.id,
          isCustom: false,
          isDisabled: disabledSet.has(model.id),
          existingAlias,
          testStatus: modelTestResults[model.id],
        };
      }),
    [allModels, modelAliases, providerStorageAlias, providerId, disabledSet, modelTestResults]
  );

  const customEntries = useMemo(
    () =>
      customModels.map((m) => ({
        model: { id: m.id, name: m.id },
        id: m.id,
        isCustom: true,
        isDisabled: false,
        alias: m.alias,
        testStatus: modelTestResults[m.id],
      })),
    [customModels, modelTestResults]
  );

  const allEntries = useMemo(
    () => [...customEntries, ...builtInEntries],
    [customEntries, builtInEntries]
  );

  const stats = useMemo(() => {
    const active = builtInEntries.filter((e) => !e.isDisabled).length + customEntries.length;
    const disabled = builtInEntries.filter((e) => e.isDisabled).length;
    const passed = allEntries.filter((e) => e.testStatus === "ok").length;
    const failed = allEntries.filter((e) => e.testStatus === "error").length;
    return {
      total: allEntries.length,
      active,
      disabled,
      custom: customEntries.length,
      passed,
      failed,
    };
  }, [allEntries, builtInEntries, customEntries]);

  const q = query.trim().toLowerCase();

  const filteredEntries = useMemo(() => {
    return allEntries.filter((entry) => {
      const label = `${entry.id} ${entry.model?.name || ""}`.toLowerCase();
      if (q && !label.includes(q)) return false;

      if (filter === "active") return !entry.isDisabled;
      if (filter === "disabled") return entry.isDisabled;
      if (filter === "custom") return entry.isCustom;
      if (filter === "passed") return entry.testStatus === "ok";
      if (filter === "failed") return entry.testStatus === "error";
      return true;
    });
  }, [allEntries, filter, q]);

  const activeIds = builtInEntries.filter((e) => !e.isDisabled).map((e) => e.id);
  const canTest = connections.length > 0 || isFreeNoAuth;

  const notAddedSuggested = useMemo(() => {
    if (!suggestedModels.length) return [];
    const addedFullModels = new Set(Object.values(modelAliases));
    const hardcodedIds = new Set(models.map((m) => m.id));
    return suggestedModels.filter(
      (m) =>
        !addedFullModels.has(`${providerStorageAlias}/${m.id}`) &&
        !hardcodedIds.has(m.id)
    );
  }, [suggestedModels, modelAliases, providerStorageAlias, models]);

  const renderEntry = (entry) => {
    const { model, id, isCustom, isDisabled, existingAlias, alias, testStatus } = entry;

    if (isDisabled && filter !== "disabled" && filter !== "all") return null;

    return (
      <ModelRow
        key={`${isCustom ? "c" : "b"}-${id}`}
        layout={view}
        model={model}
        fullModel={`${providerDisplayAlias}/${id}`}
        alias={isCustom ? alias : existingAlias}
        copied={copied}
        onCopy={onCopy}
        onSetAlias={isCustom ? () => {} : (a) => onSetAlias(id, a, providerStorageAlias)}
        onDeleteAlias={
          isCustom
            ? () => onDeleteAlias(alias)
            : existingAlias
              ? () => onDeleteAlias(existingAlias)
              : undefined
        }
        testStatus={testStatus}
        onTest={canTest ? () => onTestModel(id) : undefined}
        isTesting={testingModelId === id}
        isCustom={isCustom}
        isFree={model.isFree}
        isDisabled={isDisabled}
        onDisable={!isCustom && !isDisabled ? () => onDisableModel(id) : undefined}
        onEnable={isDisabled ? () => onEnableModel(id) : undefined}
      />
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="models-manager-toolbar glass-panel-subtle rounded-xl p-3 sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <Input
            icon="search"
            placeholder="Search model id or name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            inputClassName="h-10"
            className="flex-1 min-w-0"
          />
          <div className="flex flex-wrap items-center gap-2">
            <SegmentedControl
              size="sm"
              options={[
                { value: "list", label: "List", icon: "view_list" },
                { value: "grid", label: "Grid", icon: "grid_view" },
              ]}
              value={view}
              onChange={setView}
            />
          </div>
        </div>

        <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <SegmentedControl
            size="sm"
            options={FILTER_OPTIONS}
            value={filter}
            onChange={setFilter}
            className="w-full sm:w-auto overflow-x-auto"
          />
          <div className="flex flex-wrap gap-2">
            {stats.disabled > 0 && (
              <Button size="sm" variant="secondary" icon="restart_alt" onClick={onEnableAll}>
                Enable all
              </Button>
            )}
            {activeIds.length > 0 && (
              <Button size="sm" variant="secondary" icon="block" onClick={() => onDisableAll(activeIds)}>
                Disable all
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="models-manager-stats flex flex-wrap gap-2">
        {[
          { label: "Total", value: stats.total, icon: "layers", variant: "muted", hideWhenZero: false },
          { label: "Active", value: stats.active, icon: "check_circle", variant: "success" },
          { label: "Custom", value: stats.custom, icon: "tune", variant: "info" },
          { label: "Disabled", value: stats.disabled, icon: "pause_circle", variant: "warning" },
          { label: "Passed", value: stats.passed, icon: "science", variant: "success" },
          { label: "Failed", value: stats.failed, icon: "cancel", variant: "danger" },
        ].map((s) => (
          <StatusMetricChip
            key={s.label}
            icon={s.icon}
            label={s.label}
            value={s.value}
            variant={s.variant}
            hideWhenZero={s.hideWhenZero}
          />
        ))}
      </div>

      {!!modelsTestError && (
        <div className="px-1">
          <InlineFeedback variant="error" message={modelsTestError} />
        </div>
      )}

      <div
        className={cn(
          view === "grid"
            ? "grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3"
            : "flex flex-col gap-2"
        )}
      >
        {filteredEntries.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-divider py-10 text-text-muted">
            <span className="material-symbols-outlined text-[28px]">search_off</span>
            <p className="text-sm">No models match your filters</p>
          </div>
        ) : (
          filteredEntries.map((entry) => renderEntry(entry))
        )}
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <Button size="sm" icon="add" onClick={onAddCustomModel}>
          Add Model
        </Button>
        {providerId === "qoder" && connections.some((c) => c.isActive !== false) && (
          <Button
            size="sm"
            variant="secondary"
            icon="download"
            loading={importingQoderModels}
            onClick={onImportQoderModels}
          >
            {importingQoderModels ? translate("Fetching...") : translate("Fetch Qoder Models")}
          </Button>
        )}
      </div>

      {notAddedSuggested.length > 0 && (
        <div className="rounded-xl glass-panel-subtle p-3 sm:p-4">
          <p className="text-xs font-medium text-text-muted mb-2">
            Suggested free models (≥200k context)
          </p>
          <div className="flex flex-wrap gap-2">
            {notAddedSuggested.map((m) => (
              <button
                key={m.id}
                type="button"
                data-pressable
                onClick={async () => {
                  const alias = m.id.split("/").pop();
                  await onSetAlias(m.id, alias, providerStorageAlias);
                }}
                className="models-suggest-chip"
                title={`${m.name} · ${(m.contextLength / 1000).toFixed(0)}k ctx`}
              >
                <span className="material-symbols-outlined text-[14px]">add</span>
                {m.id.split("/").pop()}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

ModelsManagerPanel.propTypes = {
  isCompatible: PropTypes.bool,
  providerId: PropTypes.string,
  providerInfo: PropTypes.object,
  providerStorageAlias: PropTypes.string,
  providerDisplayAlias: PropTypes.string,
  models: PropTypes.array,
  kiloFreeModels: PropTypes.array,
  disabledModelIds: PropTypes.array,
  modelAliases: PropTypes.object,
  modelTestResults: PropTypes.object,
  testingModelId: PropTypes.string,
  modelsTestError: PropTypes.string,
  connections: PropTypes.array,
  isFreeNoAuth: PropTypes.bool,
  suggestedModels: PropTypes.array,
  copied: PropTypes.string,
  onCopy: PropTypes.func,
  onSetAlias: PropTypes.func,
  onDeleteAlias: PropTypes.func,
  onTestModel: PropTypes.func,
  onDisableModel: PropTypes.func,
  onEnableModel: PropTypes.func,
  onEnableAll: PropTypes.func,
  onDisableAll: PropTypes.func,
  onAddCustomModel: PropTypes.func,
  onImportQoderModels: PropTypes.func,
  importingQoderModels: PropTypes.bool,
  isAnthropicCompatible: PropTypes.bool,
};