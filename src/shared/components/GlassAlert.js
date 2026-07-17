"use client";

import Link from "next/link";
import PropTypes from "prop-types";
import { Alert, Button } from "@heroui/react";
import { cn } from "@/shared/utils/cn";

const STATUS_MAP = {
  warning: "warning",
  error: "danger",
  success: "success",
  info: "accent",
};

const ICONS = {
  warning: "shield_lock",
  error: "error",
  success: "check_circle",
  info: "info",
};

export default function GlassAlert({ variant = "warning", message, action, className, hideIcon = false }) {
  const status = STATUS_MAP[variant] || "warning";

  return (
    <Alert
      status={status}
      className={cn(
        "glass-alert-bar",
        hideIcon ? "glass-alert-bar--no-icon items-center" : "items-center",
        className,
      )}
      role="alert"
    >
      {!hideIcon && (
        <Alert.Indicator className="glass-alert-bar__indicator">
          <span className="material-symbols-outlined text-[18px]">{ICONS[variant]}</span>
        </Alert.Indicator>
      )}
      <Alert.Content className="glass-alert-bar__content min-w-0 flex-1">
        <Alert.Description className="text-sm leading-snug">
          {message}
        </Alert.Description>
      </Alert.Content>
      {action && (
        action.href ? (
          action.href.startsWith("#") ? (
            <Button
              size="sm"
              variant="ghost"
              onPress={() => {
                document.getElementById(action.href.slice(1))?.scrollIntoView({ behavior: "smooth" });
              }}
            >
              {action.label}
            </Button>
          ) : (
            <Link href={action.href}>
              <Button size="sm" variant="ghost">{action.label}</Button>
            </Link>
          )
        ) : (
          <Button size="sm" variant="ghost" onPress={action.onClick}>
            {action.label}
          </Button>
        )
      )}
    </Alert>
  );
}

GlassAlert.propTypes = {
  variant: PropTypes.oneOf(["warning", "error", "success", "info"]),
  message: PropTypes.oneOfType([PropTypes.string, PropTypes.node]).isRequired,
  action: PropTypes.shape({
    label: PropTypes.string,
    href: PropTypes.string,
    onClick: PropTypes.func,
  }),
  className: PropTypes.string,
  hideIcon: PropTypes.bool,
};