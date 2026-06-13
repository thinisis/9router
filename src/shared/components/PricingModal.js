"use client";

import { useState, useEffect } from "react";
import { getDefaultPricing } from "@/shared/constants/pricing.js";
import Modal from "./Modal";
import Button from "./Button";
import Input from "./Input";
import { Spinner } from "@heroui/react";

export default function PricingModal({ isOpen, onClose, onSave }) {
  const [pricingData, setPricingData] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadPricing();
    }
  }, [isOpen]);

  const loadPricing = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/pricing");
      if (response.ok) {
        const data = await response.json();
        setPricingData(data);
      } else {
        setPricingData(getDefaultPricing());
      }
    } catch (error) {
      console.error("Failed to load pricing:", error);
      setPricingData(getDefaultPricing());
    } finally {
      setLoading(false);
    }
  };

  const handlePricingChange = (provider, model, field, value) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) return;

    setPricingData((prev) => {
      const newData = { ...prev };
      if (!newData[provider]) newData[provider] = {};
      if (!newData[provider][model]) newData[provider][model] = {};
      newData[provider][model][field] = numValue;
      return newData;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch("/api/pricing", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(pricingData),
      });

      if (response.ok) {
        onSave?.();
        onClose();
      } else {
        const error = await response.json();
        alert(`Failed to save pricing: ${error.error}`);
      }
    } catch (error) {
      console.error("Failed to save pricing:", error);
      alert("Failed to save pricing");
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!confirm("Reset all pricing to defaults? This cannot be undone.")) return;

    try {
      const response = await fetch("/api/pricing", { method: "DELETE" });
      if (response.ok) {
        setPricingData(getDefaultPricing());
      }
    } catch (error) {
      console.error("Failed to reset pricing:", error);
      alert("Failed to reset pricing");
    }
  };

  const allProviders = Object.keys(pricingData).sort();
  const pricingFields = ["input", "output", "cached", "reasoning", "cache_creation"];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pricing Configuration"
      size="lg"
      className="!max-w-6xl"
      footer={
        <>
          <Button variant="danger" onClick={handleReset} disabled={saving}>
            Reset to Defaults
          </Button>
          <div className="flex gap-2 ml-auto">
            <Button variant="ghost" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button onClick={handleSave} loading={saving}>
              Save Changes
            </Button>
          </div>
        </>
      }
    >
      {loading ? (
        <div className="flex items-center justify-center py-8 text-default-500 gap-2">
          <Spinner size="sm" color="accent" />
          Loading pricing data...
        </div>
      ) : (
        <div className="space-y-6">
          <div className="rounded-xl border border-divider bg-default-100/50 p-3 text-sm">
            <p className="font-medium mb-1">Pricing Rates Format</p>
            <p className="text-default-500">
              All rates are in <strong>dollars per million tokens</strong> ($/1M tokens).
              Example: Input rate of 2.50 means $2.50 per 1,000,000 input tokens.
            </p>
          </div>

          {allProviders.map((provider) => {
            const models = Object.keys(pricingData[provider]).sort();
            return (
              <div key={provider} className="border border-divider rounded-xl overflow-hidden">
                <div className="bg-default-100 px-4 py-2 font-semibold text-sm">
                  {provider.toUpperCase()}
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-default-100/80 text-default-500 uppercase text-xs">
                      <tr>
                        <th className="px-3 py-2 text-left">Model</th>
                        <th className="px-3 py-2 text-right">Input</th>
                        <th className="px-3 py-2 text-right">Output</th>
                        <th className="px-3 py-2 text-right">Cached</th>
                        <th className="px-3 py-2 text-right">Reasoning</th>
                        <th className="px-3 py-2 text-right">Cache Creation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-divider">
                      {models.map((model) => (
                        <tr key={model} className="hover:bg-default-100/40">
                          <td className="px-3 py-2 font-medium">{model}</td>
                          {pricingFields.map((field) => (
                            <td key={field} className="px-3 py-2">
                              <Input
                                type="number"
                                fullWidth={false}
                                value={String(pricingData[provider][model][field] || 0)}
                                onChange={(e) =>
                                  handlePricingChange(provider, model, field, e.target.value)
                                }
                                className="gap-0"
                                size="sm"
                                inputClassName="h-8 w-20 text-right"
                              />
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}

          {allProviders.length === 0 && (
            <div className="text-center py-8 text-default-500">
              No pricing data available
            </div>
          )}
        </div>
      )}
    </Modal>
  );
}