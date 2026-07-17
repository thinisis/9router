"use client";

import PropTypes from "prop-types";
import { translate } from "@/i18n/runtime";
import Drawer from "@/shared/components/Drawer";
import RequestDetailSummary from "./RequestDetailSummary";
import RequestDetailError from "./RequestDetailError";
import RequestDetailPipeline from "./RequestDetailPipeline";
import RequestDetailFlowHero from "./RequestDetailFlowHero";

export default function RequestDetailDrawer({
  isOpen,
  onClose,
  detail,
  providerName,
}) {
  const isError = detail?.status === "error";
  const errorMessage = detail?.response?.error;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title={translate("Request Details")}
      width="lg"
      className="request-detail-dialog"
    >
      {detail ? <RequestDetailFlowHero /> : null}
      {!detail ? (
        <p className="py-10 text-center text-sm text-text-muted">
          {translate("No request selected")}
        </p>
      ) : (
        <div className="request-detail-dialog__stack space-y-4">
          <RequestDetailSummary detail={detail} providerName={providerName} />

          {isError ? (
            <RequestDetailError
              message={errorMessage}
              statusCode={detail.response?.status}
            />
          ) : null}

          <RequestDetailPipeline key={detail.id} detail={detail} />
        </div>
      )}
    </Drawer>
  );
}

RequestDetailDrawer.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  detail: PropTypes.object,
  providerName: PropTypes.string,
};
