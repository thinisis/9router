"use client";

import { Card as HeroCard } from "@heroui/react";
import { cn } from "@/shared/utils/cn";

const PADDINGS = {
  none: "p-0",
  xs: "p-3",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
};

export default function Card({
  children,
  title,
  subtitle,
  icon,
  action,
  padding = "md",
  hover = false,
  elev = true,
  className,
  ...props
}) {
  return (
    <HeroCard
      variant="default"
      className={cn(
        PADDINGS[padding],
        hover && "transition-shadow hover:shadow-md cursor-pointer",
        className
      )}
      {...props}
    >
      {(title || action) && (
        <HeroCard.Header className="flex items-center justify-between mb-4 p-0">
          <div className="flex items-center gap-3">
            {icon && (
              <div className="flex items-center justify-center size-10 rounded-xl bg-primary/10 text-primary">
                <span className="material-symbols-outlined text-[20px]">{icon}</span>
              </div>
            )}
            <div>
              {title && (
                <HeroCard.Title className="text-foreground font-semibold tracking-tight">
                  {title}
                </HeroCard.Title>
              )}
              {subtitle && (
                <HeroCard.Description className="text-default-500">
                  {subtitle}
                </HeroCard.Description>
              )}
            </div>
          </div>
          {action}
        </HeroCard.Header>
      )}
      <HeroCard.Content className="p-0">{children}</HeroCard.Content>
    </HeroCard>
  );
}

Card.Section = function CardSection({ children, className, ...props }) {
  return (
    <div className={cn("p-4 rounded-xl bg-default-100/60", className)} {...props}>
      {children}
    </div>
  );
};

Card.Row = function CardRow({ children, className, ...props }) {
  return (
    <div
      className={cn(
        "p-3 -mx-3 px-3 transition-colors",
        "border-b border-divider last:border-b-0",
        "hover:bg-default-100/50",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

Card.ListItem = function CardListItem({ children, actions, className, ...props }) {
  return (
    <div
      className={cn(
        "group flex items-center justify-between p-3 -mx-3 px-3",
        "border-b border-divider last:border-b-0",
        "hover:bg-default-100/50 transition-colors",
        className
      )}
      {...props}
    >
      <div className="flex-1 min-w-0">{children}</div>
      {actions && (
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {actions}
        </div>
      )}
    </div>
  );
};