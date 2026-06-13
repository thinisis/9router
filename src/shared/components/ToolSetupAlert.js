"use client";

import PropTypes from "prop-types";
import { Alert } from "@heroui/react";
import { cn } from "@/shared/utils/cn";

const STATUS_MAP = {
  warning: "warning",
  error: "danger",
  info: "accent",
};

export default function ToolSetupAlert({ title, description, children, variant = "warning", className }) {
  const status = STATUS_MAP[variant] || "warning";

  return (
    <Alert status={status} className={cn("flex-col items-stretch gap-3", className)} role="alert">
      <Alert.Content>
        {title ? <Alert.Title className="font-medium">{title}</Alert.Title> : null}
        {description ? (
          <Alert.Description className="text-sm leading-relaxed">{description}</Alert.Description>
        ) : null}
      </Alert.Content>
      {children ? <div className="flex flex-wrap items-center gap-2">{children}</div> : null}
    </Alert>
  );
}

ToolSetupAlert.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  children: PropTypes.node,
  variant: PropTypes.oneOf(["warning", "error", "info"]),
  className: PropTypes.string,
};