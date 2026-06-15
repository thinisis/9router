"use client";

import Link from "next/link";
import PropTypes from "prop-types";
import { translate } from "@/i18n/runtime";

export default function PageBackLink({ href, label, className = "" }) {
  return (
    <Link href={href} className={`page-back-link ${className}`.trim()}>
      <span className="page-back-link__icon material-symbols-outlined" aria-hidden="true">
        arrow_back
      </span>
      <span className="page-back-link__label">{translate(label)}</span>
    </Link>
  );
}

PageBackLink.propTypes = {
  href: PropTypes.string.isRequired,
  label: PropTypes.string.isRequired,
  className: PropTypes.string,
};