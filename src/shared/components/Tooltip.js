"use client";

import { Tooltip as HeroTooltip } from "@heroui/react";

const PLACEMENTS = {
  top: "top",
  bottom: "bottom",
  left: "left",
  right: "right",
};

export default function Tooltip({ text, children, position = "top" }) {
  return (
    <HeroTooltip>
      <HeroTooltip.Trigger>{children}</HeroTooltip.Trigger>
      <HeroTooltip.Content placement={PLACEMENTS[position] || "top"}>
        {text}
      </HeroTooltip.Content>
    </HeroTooltip>
  );
}