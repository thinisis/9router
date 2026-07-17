"use client";

import PropTypes from "prop-types";
import { Drawer as HeroDrawer, useOverlayState } from "@heroui/react";
import { translate } from "@/i18n/runtime";
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
  const state = useOverlayState({
    isOpen,
    onOpenChange: (open) => {
      if (!open) onClose();
    },
  });

  if (!isOpen) return null;

  const isError = detail?.status === "error";
  const errorMessage = detail?.response?.error;

  return (
    <HeroDrawer state={state}>
      <HeroDrawer.Backdrop isDismissable>
        <HeroDrawer.Content placement="right">
          <HeroDrawer.Dialog className="request-detail-dialog glass-popup">
            <HeroDrawer.Header className="request-detail-dialog__header">
              <div className="request-detail-dialog__header-main">
                <HeroDrawer.Heading className="request-detail-dialog__title">
                  {translate("Request Details")}
                </HeroDrawer.Heading>
                {detail ? <RequestDetailFlowHero /> : null}
              </div>
              <HeroDrawer.CloseTrigger />
            </HeroDrawer.Header>

            <HeroDrawer.Body className="request-detail-dialog__body custom-scrollbar">
              {!detail ? (
                <p className="py-10 text-center text-sm text-default-500">
                  {translate("No request selected")}
                </p>
              ) : (
                <div className="request-detail-dialog__stack">
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
            </HeroDrawer.Body>
          </HeroDrawer.Dialog>
        </HeroDrawer.Content>
      </HeroDrawer.Backdrop>
    </HeroDrawer>
  );
}

RequestDetailDrawer.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  detail: PropTypes.object,
  providerName: PropTypes.string,
};