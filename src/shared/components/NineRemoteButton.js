"use client";

import { useState } from "react";
import Button from "./Button";
import NineRemotePromoModal from "./NineRemotePromoModal";

export default function NineRemoteButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        icon="computer"
        onClick={() => setIsOpen(true)}
        title="9Remote"
        className="gap-1.5"
      >
        <span className="text-xs font-medium">Remote</span>
      </Button>

      <NineRemotePromoModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}