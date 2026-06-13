"use client";

import { Drawer as HeroDrawer, useOverlayState } from "@heroui/react";
import { cn } from "@/shared/utils/cn";

const WIDTHS = {
  sm: "w-[min(100vw,400px)]",
  md: "w-[min(100vw,500px)]",
  lg: "w-[min(100vw,600px)]",
  xl: "w-[min(100vw,800px)]",
  "2xl": "w-[min(100vw,960px)]",
  full: "w-full",
};

export default function Drawer({
  isOpen,
  onClose,
  title,
  children,
  width = "md",
  className,
}) {
  const state = useOverlayState({
    isOpen,
    onOpenChange: (open) => {
      if (!open) onClose();
    },
  });

  if (!isOpen) return null;

  return (
    <HeroDrawer state={state}>
      <HeroDrawer.Backdrop isDismissable>
        <HeroDrawer.Content
          placement="right"
          className={cn(WIDTHS[width] || WIDTHS.md, className)}
        >
          <HeroDrawer.Dialog className="glass-popup">
            {title && (
              <HeroDrawer.Header className="flex items-center justify-between gap-3 border-b border-divider">
                <HeroDrawer.Heading className="font-display text-lg font-semibold">
                  {title}
                </HeroDrawer.Heading>
                <HeroDrawer.CloseTrigger />
              </HeroDrawer.Header>
            )}
            <HeroDrawer.Body className="custom-scrollbar overflow-y-auto">
              {children}
            </HeroDrawer.Body>
          </HeroDrawer.Dialog>
        </HeroDrawer.Content>
      </HeroDrawer.Backdrop>
    </HeroDrawer>
  );
}