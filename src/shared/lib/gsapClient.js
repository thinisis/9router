"use client";

import { gsap } from "gsap";
import { useGSAP } from "@gsap/react";

let registered = false;

export function ensureGsapRegistered() {
  if (registered || typeof window === "undefined") return;
  gsap.registerPlugin(useGSAP);
  gsap.defaults({ ease: "power2.out", duration: 0.4 });
  registered = true;
}

export { gsap, useGSAP };