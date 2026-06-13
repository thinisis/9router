"use client";

import PropTypes from "prop-types";
import Drawer from "@/shared/components/Drawer";
import RequestDetailSummary from "./RequestDetailSummary";
import RequestDetailError from "./RequestDetailError";
import RequestDetailPipeline from "./RequestDetailPipeline";

export default function RequestDetailDrawer({
  isOpen,
  onClose,
  detail,
  providerName,
}) {
  if (!detail) {
    return (
      <Drawer
        isOpen={isOpen}
        onClose={onClose}
        title="Request Details"
        width="2xl"
        className="request-detail-drawer"
      >
        <div className="py-12 text-center text-text-muted text-sm">No request selected</div>
      </Drawer>
    );
  }

  const isError = detail.status === "error";
  const errorMessage = detail.response?.error;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      width="2xl"
      className="request-detail-drawer"
      title={null}
    >
      <div className="request-detail-drawer-inner">
        <div className="request-detail-drawer-hero">
          <div className="min-w-0 flex-1">
            <p className="font-display text-lg font-semibold text-text-main">Request Details</p>
            <p className="text-xs text-text-muted mt-0.5">
              End-to-end pipeline: client → provider → client
            </p>
          </div>
          <button
            type="button"
            className="request-detail-drawer-close"
            onClick={onClose}
            aria-label="Close"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <RequestDetailSummary detail={detail} providerName={providerName} />

        {isError && (
          <RequestDetailError
            message={errorMessage}
            statusCode={detail.response?.status}
          />
        )}

        <RequestDetailPipeline key={detail.id} detail={detail} />
      </div>
    </Drawer>
  );
}

RequestDetailDrawer.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  detail: PropTypes.object,
  providerName: PropTypes.string,
};