"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import RequestDetailSection from "./RequestDetailSection";
import RequestDetailPayload from "./RequestDetailPayload";

function buildSectionKeys(detail) {
  const keys = ["client-request"];
  if (detail.providerRequest) keys.push("provider-request");
  if (detail.providerResponse) keys.push("provider-response");
  keys.push("client-response");
  return keys;
}

function defaultOpenState(keys) {
  return keys.reduce((acc, key) => {
    acc[key] = key === "client-request" || key === "client-response";
    return acc;
  }, {});
}

export default function RequestDetailPipeline({ detail }) {
  const sectionKeys = useMemo(() => buildSectionKeys(detail), [detail]);
  const [openSections, setOpenSections] = useState(() => defaultOpenState(sectionKeys));

  useEffect(() => {
    setOpenSections(defaultOpenState(sectionKeys));
  }, [detail.id, sectionKeys]);

  const setSectionOpen = useCallback((key, value) => {
    setOpenSections((prev) => ({ ...prev, [key]: value }));
  }, []);

  const expandAll = () => {
    setOpenSections(sectionKeys.reduce((acc, key) => ({ ...acc, [key]: true }), {}));
  };

  const collapseAll = () => {
    setOpenSections(sectionKeys.reduce((acc, key) => ({ ...acc, [key]: false }), {}));
  };

  const hasProviderRequest = !!detail.providerRequest;
  const hasProviderResponse = !!detail.providerResponse;
  const hasThinking = !!detail.response?.thinking;

  let step = 1;

  return (
    <div className="request-detail-pipeline">
      <div className="request-detail-pipeline-header">
        <p className="request-detail-pipeline-label">Payload pipeline</p>
        <div className="request-detail-pipeline-actions">
          <button type="button" className="request-detail-pipeline-btn" onClick={expandAll}>
            Expand all
          </button>
          <button type="button" className="request-detail-pipeline-btn" onClick={collapseAll}>
            Collapse all
          </button>
        </div>
      </div>

      <RequestDetailSection
        step={step++}
        title="Client Request"
        subtitle="Incoming API payload from the client"
        icon="input"
        open={openSections["client-request"]}
        onOpenChange={(value) => setSectionOpen("client-request", value)}
        badge="Input"
      >
        <RequestDetailPayload value={detail.request} emptyLabel="{}" />
      </RequestDetailSection>

      {hasProviderRequest && (
        <RequestDetailSection
          step={step++}
          title="Provider Request"
          subtitle="Translated payload sent upstream"
          icon="translate"
          open={openSections["provider-request"]}
          onOpenChange={(value) => setSectionOpen("provider-request", value)}
          badge="Upstream"
        >
          <RequestDetailPayload value={detail.providerRequest} emptyLabel="{}" />
        </RequestDetailSection>
      )}

      {hasProviderResponse && (
        <RequestDetailSection
          step={step++}
          title="Provider Response"
          subtitle="Raw response from the provider"
          icon="data_object"
          open={openSections["provider-response"]}
          onOpenChange={(value) => setSectionOpen("provider-response", value)}
          badge="Raw"
        >
          <RequestDetailPayload value={detail.providerResponse} emptyLabel="{}" />
        </RequestDetailSection>
      )}

      <RequestDetailSection
        step={step}
        title="Client Response"
        subtitle="Final payload returned to the client"
        icon="output"
        open={openSections["client-response"]}
        onOpenChange={(value) => setSectionOpen("client-response", value)}
        badge="Output"
      >
        {hasThinking && (
          <div className="mb-4">
            <p className="request-detail-inline-label">
              <span className="material-symbols-outlined text-[15px]">psychology</span>
              Thinking
            </p>
            <RequestDetailPayload
              value={detail.response.thinking}
              variant="thinking"
              emptyLabel="[No thinking]"
            />
          </div>
        )}
        <p className="request-detail-inline-label mb-2">Content</p>
        <RequestDetailPayload
          value={detail.response?.content ?? detail.response?.error}
          emptyLabel="[No content]"
        />
      </RequestDetailSection>
    </div>
  );
}

RequestDetailPipeline.propTypes = {
  detail: PropTypes.object.isRequired,
};