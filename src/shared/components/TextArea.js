"use client";

import PropTypes from "prop-types";
import { cn } from "@/shared/utils/cn";

export default function TextArea({
  label,
  value,
  onChange,
  placeholder,
  rows = 4,
  error,
  hint,
  disabled = false,
  required = false,
  className,
  textareaClassName,
  ...props
}) {
  return (
    <div className={cn("flex w-full flex-col gap-1.5", className)}>
      {label && (
        <label className="text-sm font-medium text-foreground">
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      <textarea
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        required={required}
        className={cn(
          "w-full min-h-[6.5rem] resize-y rounded-xl border border-divider bg-default-100",
          "px-3 py-2.5 text-sm text-foreground placeholder:text-default-400",
          "transition-all duration-150 outline-none",
          "focus:ring-2 focus:ring-primary/25 focus:border-primary/40",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "custom-scrollbar",
          error && "border-danger focus:ring-danger/25",
          textareaClassName
        )}
        {...props}
      />
      {error && <p className="text-xs text-danger">{error}</p>}
      {hint && !error && <p className="text-xs text-default-500">{hint}</p>}
    </div>
  );
}

TextArea.propTypes = {
  label: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  placeholder: PropTypes.string,
  rows: PropTypes.number,
  error: PropTypes.string,
  hint: PropTypes.string,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  className: PropTypes.string,
  textareaClassName: PropTypes.string,
};