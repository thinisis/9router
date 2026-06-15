"use client";

import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Button, Modal, Input } from "@/shared/components";
import { translate, translateFormat } from "@/i18n/runtime";

export default function AddCustomModelModal({ isOpen, providerAlias, providerDisplayAlias, onSave, onClose }) {
  const [modelId, setModelId] = useState("");
  const [testStatus, setTestStatus] = useState(null);
  const [testError, setTestError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setModelId("");
      setTestStatus(null);
      setTestError("");
    }
  }, [isOpen]);

  const stripAlias = (id) => {
    const prefix = `${providerAlias}/`;
    return id.startsWith(prefix) ? id.slice(prefix.length) : id;
  };

  const handleTest = async () => {
    const cleanId = stripAlias(modelId.trim());
    if (!cleanId) return;
    setTestStatus("testing");
    setTestError("");
    try {
      const res = await fetch("/api/models/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ model: `${providerAlias}/${cleanId}` }),
      });
      const data = await res.json();
      setTestStatus(data.ok ? "ok" : "error");
      setTestError(data.error || "");
    } catch (err) {
      setTestStatus("error");
      setTestError(err.message);
    }
  };

  const handleSave = async () => {
    const cleanId = stripAlias(modelId.trim());
    if (!cleanId || saving) return;
    setSaving(true);
    try {
      await onSave(cleanId);
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleTest();
  };

  const cleanDisplayId = stripAlias(modelId.trim()) || "model-id";

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={translate("Add Custom Model")}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
          <Input
            label={translate("Model ID")}
            value={modelId}
            onChange={(e) => {
              setModelId(e.target.value);
              setTestStatus(null);
              setTestError("");
            }}
            onKeyDown={handleKeyDown}
            placeholder={translate("e.g. claude-opus-4-5")}
            autoFocus
            className="flex-1"
          />
          <Button
            variant="secondary"
            icon="science"
            loading={testStatus === "testing"}
            onClick={handleTest}
            disabled={!modelId.trim() || testStatus === "testing"}
            className="w-full sm:w-auto shrink-0"
          >
            {testStatus === "testing" ? translate("Testing...") : translate("Test")}
          </Button>
        </div>

        <p className="text-xs text-text-muted">
          {translate("Sent to provider as:")}{" "}
          <code className="font-mono rounded-md border border-border-subtle bg-surface-2 px-1.5 py-0.5 text-text-main">
            {cleanDisplayId}
          </code>
        </p>

        {testStatus === "ok" && (
          <div className="flex items-center gap-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">
            <span className="material-symbols-outlined text-base">check_circle</span>
            {translate("Model is reachable")}
          </div>
        )}
        {testStatus === "error" && (
          <div className="flex items-start gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-400">
            <span className="material-symbols-outlined shrink-0 text-base">cancel</span>
            <span>{testError || translate("Model not reachable")}</span>
          </div>
        )}

        <div className="flex gap-2 border-t border-border-subtle pt-4">
          <Button onClick={onClose} variant="ghost" fullWidth size="sm">
            {translate("Cancel")}
          </Button>
          <Button
            onClick={handleSave}
            fullWidth
            size="sm"
            icon="add"
            disabled={!modelId.trim() || saving}
          >
            {saving ? translate("Adding...") : translate("Add Model")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

AddCustomModelModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  providerAlias: PropTypes.string.isRequired,
  providerDisplayAlias: PropTypes.string.isRequired,
  onSave: PropTypes.func.isRequired,
  onClose: PropTypes.func.isRequired,
};