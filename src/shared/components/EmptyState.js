"use client";

import Link from "next/link";
import PropTypes from "prop-types";
import { Card } from "@heroui/react";
import { cn } from "@/shared/utils/cn";
import Button from "./Button";

export default function EmptyState({
  icon = "inbox",
  title,
  description,
  action,
  secondaryAction,
  className,
}) {
  return (
    <Card
      variant="flat"
      className={cn(
        "flex flex-col items-center justify-center py-12 px-4 text-center",
        className
      )}
      data-reveal
    >
      <Card.Content className="flex flex-col items-center p-0">
        <div className="inline-flex items-center justify-center size-14 rounded-full bg-primary/10 text-primary mb-4">
          <span className="material-symbols-outlined text-[28px]">{icon}</span>
        </div>
        <p className="text-foreground font-medium mb-1">{title}</p>
        {description && (
          <p className="text-sm text-default-500 mb-5 max-w-md leading-relaxed">{description}</p>
        )}
        <div className="flex flex-wrap items-center justify-center gap-2">
          {action && (
            action.href ? (
              <Link href={action.href}>
                <Button icon={action.icon}>{action.label}</Button>
              </Link>
            ) : (
              <Button icon={action.icon} onClick={action.onClick}>
                {action.label}
              </Button>
            )
          )}
          {secondaryAction && (
            secondaryAction.href ? (
              <Link href={secondaryAction.href}>
                <Button variant="outline" icon={secondaryAction.icon}>
                  {secondaryAction.label}
                </Button>
              </Link>
            ) : (
              <Button variant="outline" icon={secondaryAction.icon} onClick={secondaryAction.onClick}>
                {secondaryAction.label}
              </Button>
            )
          )}
        </div>
      </Card.Content>
    </Card>
  );
}

EmptyState.propTypes = {
  icon: PropTypes.string,
  title: PropTypes.string.isRequired,
  description: PropTypes.string,
  action: PropTypes.shape({
    label: PropTypes.string,
    icon: PropTypes.string,
    href: PropTypes.string,
    onClick: PropTypes.func,
  }),
  secondaryAction: PropTypes.shape({
    label: PropTypes.string,
    icon: PropTypes.string,
    href: PropTypes.string,
    onClick: PropTypes.func,
  }),
  className: PropTypes.string,
};