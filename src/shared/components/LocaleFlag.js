"use client";

import { getLocaleMeta } from "@/shared/constants/locales";
import { cn } from "@/shared/utils/cn";

const SIZE_PX = {
  xs: 16,
  sm: 20,
  md: 24,
  lg: 32,
  xl: 40,
};

export default function LocaleFlag({ locale, size = "md", className = "" }) {
  const { countryCode } = getLocaleMeta(locale);
  const px = SIZE_PX[size] || SIZE_PX.md;

  return (
    <span
      className={cn("locale-flag", `locale-flag--${size}`, className)}
      data-i18n-skip="true"
      aria-hidden="true"
    >
      <img
        src={`/flags/${countryCode}.svg`}
        alt=""
        width={px}
        height={px}
        loading="lazy"
        decoding="async"
        draggable={false}
      />
    </span>
  );
}