"use client";

interface AdminTabsProps {
  active: string;
  onChange: (tab: string) => void;
}

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "challenges", label: "Challenges" },
  { id: "teams", label: "Teams" },
  { id: "submissions", label: "Submissions" },
  { id: "settings", label: "Event Settings" },
];

export function AdminTabs({ active, onChange }: AdminTabsProps) {
  return (
    <div className="flex flex-wrap gap-2 border-b border-arena-neon/20 pb-4 mb-6">
      {TABS.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={`
            px-4 py-2 font-mono text-xs uppercase tracking-wider border transition-all
            ${active === tab.id
              ? "border-arena-neon bg-arena-neon/20 text-arena-neon"
              : "border-arena-muted/30 text-arena-muted hover:border-arena-neon/50"
            }
          `}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
