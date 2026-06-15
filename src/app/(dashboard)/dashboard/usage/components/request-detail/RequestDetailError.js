"use client";

import PropTypes from "prop-types";
import { translate } from "@/i18n/runtime";

export default function RequestDetailError({ message, statusCode }) {
  if (!message) return null;

  return (
    <div className="request-detail-error" role="alert">
      <div className="request-detail-error-icon">
        <span className="material-symbols-outlined text-[18px]">error</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="request-detail-error-title">
          {translate("Request failed")}
          {statusCode != null && (
            <span className="request-detail-error-code">HTTP {statusCode}</span>
          )}
        </p>
        <p className="request-detail-error-message">{message}</p>
      </div>
    </div>
  );
}

RequestDetailError.propTypes = {
  message: PropTypes.string,
  statusCode: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};