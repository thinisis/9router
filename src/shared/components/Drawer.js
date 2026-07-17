"use client";

import { Drawer as HeroDrawer, useOverlayState } from "@heroui/react";
import { cn } from "@/shared/utils/cn";

/** Width applies to Drawer.Dialog (panel), not Drawer.Content (viewport flex shell). */
const DIALOG_WIDTHS = {
  sm: "w-[min(100vw,400px)] max-w-[100vw]",
  md: "w-[min(100vw,500px)] max-w-[100vw]",
  lg: "w-[min(100vw,600px)] max-w-[100vw]",
  xl: "w-[min(100vw,800px)] max-w-[100vw]",
  "2xl": "w-[min(100vw,960px)] max-w-[100vw]",
  "3xl": "w-full max-w-[100vw] sm:w-[min(92vw,1100px)]",
  full: "w-full max-w-[100vw]",
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
        <HeroDrawer.Content placement="right">
          <HeroDrawer.Dialog
            className={cn(
              "glass-popup",
              DIALOG_WIDTHS[width] || DIALOG_WIDTHS.md,
              className,
            )}
          >
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