import { cn } from "@/src/lib/utils";
import { type ButtonHTMLAttributes } from "react";

type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link"
  | "cta";

type ButtonSize = "default" | "sm" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  text?: string;
  className?: string;
}

export default function Button({
  variant = "default",
  size = "default",
  text = "",
  className = "",
  ...props
}: ButtonProps) {
  const styleBase = `
  inline-flex items-center justify-center rounded-md
  text-xs sm:text-sm font-medium transition-colors
  focus-visible:outline-none focus-visible:ring-2
  focus-visible:ring-ring focus-visible:ring-offset-2
  disabled:opacity-50 disabled:pointer-events-none
  bg-primary
  text-default
`;

  const sizeStyles: Record<ButtonSize, string> = {
    default: "h-10 py-2 px-4",
    sm: "h-9 px-3 rounded-md",
    lg: "h-11 rounded-md px-8",
  };

  return (
    <button className={cn(styleBase, sizeStyles[size], className)} {...props}>
      {text}
      {props.children}
    </button>
  );
}
