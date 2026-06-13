"use client";

import { cn } from "@/shared/utils/cn";

export default function Select({
  label,
  options = [],
  value,
  onChange,
  placeholder = "Select an option",
  error,
  hint,
  disabled = false,
  required = false,
  className,
  selectClassName,
  ...props
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label className="text-sm font-medium text-foreground">
          {label}
          {required && <span className="text-danger ml-1">*</span>}
        </label>
      )}
      <div className="relative w-full">
        <select
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={cn(
            "w-full min-h-10 py-2.5 px-3 pr-10 text-sm text-foreground",
            "bg-default-100 border border-divider rounded-xl appearance-none",
            "focus:outline-none focus:ring-2 focus:ring-primary/25",
            "transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed",
            "text-[16px] sm:text-sm",
            error && "border-danger focus:ring-danger/25",
            selectClassName
          )}
          {...props}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-default-400">
          <span className="material-symbols-outlined text-[20px]">expand_more</span>
        </div>
      </div>
      {error && (
        <p className="text-xs text-danger flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px]">error</span>
          {error}
        </p>
      )}
      {hint && !error && <p className="text-xs text-default-500">{hint}</p>}
    </div>
  );
}