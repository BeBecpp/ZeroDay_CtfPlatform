interface StatusChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
}

export function StatusChip({ label, active = false, onClick }: StatusChipProps) {
  const Component = onClick ? "button" : "span";

  return (
    <Component
      onClick={onClick}
      className={`
        inline-flex items-center px-3 py-1 text-xs font-mono uppercase tracking-wider
        border transition-all duration-200
        ${onClick ? "cursor-pointer" : ""}
        ${
          active
            ? "border-arena-neon bg-arena-neon/20 text-arena-neon shadow-neon"
            : "border-arena-muted/40 text-arena-muted hover:border-arena-neon/50 hover:text-arena-neon/80"
        }
      `}
    >
      {label}
    </Component>
  );
}
