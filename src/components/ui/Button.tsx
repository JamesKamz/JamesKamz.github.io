import { cn } from "@/lib/utils";

export const buttonStyles = {
  base: "group inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition will-change-transform active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
  primary: "bg-accent text-accent-fg shadow-[0_0_0_0_var(--glow)] hover:shadow-[0_0_0_8px_var(--glow)]",
  secondary: "border border-line-strong text-fg hover:border-accent hover:text-accent",
  ghost: "text-fg-soft hover:text-accent",
};

export function buttonClass(variant: "primary" | "secondary" | "ghost" = "primary", className?: string) {
  return cn(buttonStyles.base, buttonStyles[variant], className);
}
