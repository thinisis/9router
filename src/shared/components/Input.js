"use client";

import { TextField, Label, Input as HeroInput, FieldError, Description } from "@heroui/react";
import { cn } from "@/shared/utils/cn";

const SIZE_CLASSES = {
  sm: "min-h-9 h-9 text-sm",
  md: "min-h-10 h-10 text-sm",
  lg: "min-h-11 h-11 text-base",
};

export default function Input({
  label,
  type = "text",
  placeholder,
  value,
  onChange,
  error,
  hint,
  icon,
  disabled = false,
  required = false,
  fullWidth = true,
  size = "md",
  className,
  inputClassName,
  name,
  id,
  autoComplete,
  ...props
}) {
  return (
    <TextField
      className={cn("flex flex-col gap-1.5", fullWidth && "w-full", className)}
      fullWidth={fullWidth}
      isInvalid={!!error}
      isRequired={required}
      isDisabled={disabled}
      name={name}
    >
      {label && (
        <Label className="text-sm font-medium text-foreground">
          {label}
        </Label>
      )}
      <div className={cn("relative", fullWidth && "w-full")}>
        {icon && (
          <div className="absolute inset-y-0 left-0 z-10 flex items-center pl-3 pointer-events-none text-text-subtle">
            <span className="material-symbols-outlined text-[20px]">{icon}</span>
          </div>
        )}
        <HeroInput
          id={id}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          fullWidth={fullWidth}
          className={cn(
            "glass-input",
            SIZE_CLASSES[size] || SIZE_CLASSES.md,
            icon && "pl-10",
            error && "glass-input--error",
            inputClassName
          )}
          {...props}
        />
      </div>
      {error && <FieldError>{error}</FieldError>}
      {hint && !error && <Description>{hint}</Description>}
    </TextField>
  );
}