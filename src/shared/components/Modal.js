"use client";

import { Modal as HeroModal, useOverlayState } from "@heroui/react";
import { cn } from "@/shared/utils/cn";
import Button from "./Button";

const SIZES = {
  sm: "sm",
  md: "md",
  lg: "lg",
  xl: "lg",
  full: "lg",
};

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = "md",
  closeOnOverlay = true,
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
    <HeroModal state={state}>
      <HeroModal.Backdrop isDismissable={closeOnOverlay}>
        <HeroModal.Container size={SIZES[size] || "md"} className={className}>
          <HeroModal.Dialog className="glass-popup">
            {title && (
              <HeroModal.Header className="flex items-center justify-between gap-3">
                <HeroModal.Heading className="font-display text-lg font-semibold">
                  {title}
                </HeroModal.Heading>
                <HeroModal.CloseTrigger />
              </HeroModal.Header>
            )}
            <HeroModal.Body className={cn("max-h-[calc(85vh-120px)] overflow-y-auto custom-scrollbar flex flex-col gap-4")}>
              {children}
            </HeroModal.Body>
            {footer && (
              <HeroModal.Footer className="flex w-full flex-wrap items-center justify-between gap-2 border-t border-divider pt-4">
                {footer}
              </HeroModal.Footer>
            )}
          </HeroModal.Dialog>
        </HeroModal.Container>
      </HeroModal.Backdrop>
    </HeroModal>
  );
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirm",
  message,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "danger",
  loading = false,
}) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={loading}>
            {cancelText}
          </Button>
          <Button variant={variant} onClick={onConfirm} loading={loading}>
            {confirmText}
          </Button>
        </>
      }
    >
      <p className="text-default-500 text-sm leading-relaxed">{message}</p>
    </Modal>
  );
}