"use client";

interface GlitchTextProps {
  text: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "span" | "p";
}

export function GlitchText({
  text,
  className = "",
  as: Tag = "h1",
}: GlitchTextProps) {
  return (
    <Tag
      className={`glitch-text neon-glow ${className}`}
      data-text={text}
    >
      {text}
    </Tag>
  );
}
