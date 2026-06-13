"use client";

import PropTypes from "prop-types";
import { cn } from "@/shared/utils/cn";

/**
 * Page-level actions row. Title lives in the dashboard Header only.
 */
export default function PageToolbar({ children, className }) {
  if (!children) return null;

  return (
    <div className={cn("flex flex-wrap items-center justify-end gap-2 mb-6", className)}>
      {children}
    </div>
  );
}

PageToolbar.propTypes = {
  children: PropTypes.node,
  className: PropTypes.string,
};