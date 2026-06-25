import { ButtonHTMLAttributes, ReactNode } from "react";

interface CyberButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "primary" | "secondary" | "danger";
  size?: "sm" | "md" | "lg";
}

export function CyberButton({
  children,
  variant = "primary",
  size = "md",
  className = "",
  disabled,
  ...props
}: CyberButtonProps) {
  const variants = {
    primary:
      "border-arena-neon text-arena-neon hover:bg-arena-neon/10 hover:shadow-neon",
    secondary:
      "border-arena-cyan text-arena-cyan hover:bg-arena-cyan/10 hover:shadow-cyan",
    danger:
      "border-arena-danger text-arena-danger hover:bg-arena-danger/10",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-6 py-2.5 text-sm",
    lg: "px-8 py-3 text-base",
  };

  return (
    <button
      className={`
        font-mono uppercase tracking-wider border-2
        transition-all duration-200
        disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none
        ${variants[variant]} ${sizes[size]} ${className}
      `}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
