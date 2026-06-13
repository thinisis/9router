"use client";

import PropTypes from "prop-types";
import Badge from "./Badge";
import { translate } from "@/i18n/runtime";

function formatConnectedLabel(count) {
  return `${count} ${translate("connected")}`;
}

function formatErrorLabel(count, errorCode) {
  const unit = translate(count === 1 ? "error" : "errors");
  if (errorCode) return `${count} ${unit} (${errorCode})`;
  return `${count} ${unit}`;
}

export default function ProviderConnectionStatus({
  connected = 0,
  error = 0,
  errorCode = null,
  errorTime = null,
  addedCount = 0,
  isNoAuth = false,
  allDisabled = false,
  className = "",
}) {
  if (allDisabled) {
    return (
      <div className={className} data-i18n-skip>
        <Badge variant="default" size="sm" icon="pause_circle">
          {translate("Disabled")}
        </Badge>
      </div>
    );
  }

  if (isNoAuth) {
    return (
      <div className={className} data-i18n-skip>
        <Badge variant="success" size="sm" dot>
          {translate("Ready")}
        </Badge>
      </div>
    );
  }

  const badges = [];

  if (connected > 0) {
    badges.push(
      <Badge key="connected" variant="success" size="sm" dot>
        {formatConnectedLabel(connected)}
      </Badge>
    );
  }

  if (error > 0) {
    badges.push(
      <Badge key="error" variant="error" size="sm" dot>
        {formatErrorLabel(error, errorCode)}
      </Badge>
    );
  }

  if (badges.length === 0) {
    return (
      <div className={className} data-i18n-skip>
        {addedCount > 0 ? (
          <Badge variant="default" size="sm">
            {`${addedCount} ${translate("added")}`}
          </Badge>
        ) : (
          <Badge variant="default" size="sm">
            {translate("No connections")}
          </Badge>
        )}
      </div>
    );
  }

  return (
    <div className={`flex min-w-0 flex-wrap items-center gap-1.5 ${className}`.trim()} data-i18n-skip>
      {badges}
      {errorTime ? <span className="text-text-muted shrink-0">{errorTime}</span> : null}
    </div>
  );
}

ProviderConnectionStatus.propTypes = {
  connected: PropTypes.number,
  error: PropTypes.number,
  errorCode: PropTypes.string,
  errorTime: PropTypes.string,
  addedCount: PropTypes.number,
  isNoAuth: PropTypes.bool,
  allDisabled: PropTypes.bool,
  className: PropTypes.string,
};