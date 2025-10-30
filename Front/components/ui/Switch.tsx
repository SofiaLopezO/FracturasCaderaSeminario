"use client";

import * as React from "react";
import * as RadixSwitch from "@radix-ui/react-switch";

/* helper */
function cn(...classes: Array<string | undefined | false | null>) {
  return classes.filter(Boolean).join(" ");
}

/**
 * Variantes:
 * - size: sm | md | lg
 * - color: primary | emerald | rose | amber | slate
 *
 * SwitchField: label + descripción + switch
 */

type Size = "sm" | "md" | "lg";
type Color = "primary" | "emerald" | "rose" | "amber" | "slate";

export interface SwitchProps
  extends React.ComponentPropsWithoutRef<typeof RadixSwitch.Root> {
  size?: Size;
  color?: Color;
}

const sizeMap: Record<
  Size,
  { root: string; thumb: string }
> = {
  sm: { root: "h-5 w-9",  thumb: "h-4 w-4" },
  md: { root: "h-6 w-11", thumb: "h-5 w-5" },
  lg: { root: "h-7 w-14", thumb: "h-6 w-6" },
};

const colorCheckedMap: Record<Color, string> = {
  primary: "data-[state=checked]:bg-blue-600",
  emerald: "data-[state=checked]:bg-emerald-600",
  rose:    "data-[state=checked]:bg-rose-600",
  amber:   "data-[state=checked]:bg-amber-500",
  slate:   "data-[state=checked]:bg-slate-700",
};

const Switch = React.forwardRef<
  React.ElementRef<typeof RadixSwitch.Root>,
  SwitchProps
>(function Switch(
  {
    className,
    size = "md",
    color = "primary",
    disabled,
    ...props
  },
  ref
) {
  const s = sizeMap[size];
  const c = colorCheckedMap[color];

  return (
    <RadixSwitch.Root
      ref={ref}
      disabled={disabled}
      className={cn(
        "peer inline-flex shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-500",
        "data-[state=unchecked]:bg-slate-200",
        c,
        disabled && "opacity-50 cursor-not-allowed",
        s.root,
        className
      )}
      {...props}
    >
      <RadixSwitch.Thumb
        className={cn(
          "pointer-events-none block rounded-full bg-white shadow-lg ring-0 transition-transform",
          // estados EXPLÍCITOS (para que Tailwind los compile siempre)
          "data-[state=unchecked]:translate-x-0",
          "data-[state=checked]:translate-x-[calc(100%-2px)]",
          s.thumb
        )}
      />
    </RadixSwitch.Root>
  );
});

export { Switch };

/* ---- Campo compuesto: label + switch + descripción ---- */

export interface SwitchFieldProps extends SwitchProps {
  label?: React.ReactNode;
  description?: React.ReactNode;
  reverse?: boolean; // switch a la izquierda si true
  labelClassName?: string;
  descriptionClassName?: string;
  containerClassName?: string;
}

export function SwitchField({
  label,
  description,
  reverse = false,
  labelClassName,
  descriptionClassName,
  containerClassName,
  className,
  ...props
}: SwitchFieldProps) {
  return (
    <div className={cn("grid gap-1.5", containerClassName)}>
      <div
        className={cn(
          "flex items-center justify-between gap-3",
          reverse && "flex-row-reverse"
        )}
      >
        {label && (
          <span className={cn("text-sm font-medium text-slate-700", labelClassName)}>
            {label}
          </span>
        )}
        <Switch className={className} {...props} />
      </div>
      {description && (
        <p className={cn("text-xs text-slate-500", descriptionClassName)}>{description}</p>
      )}
    </div>
  );
}
