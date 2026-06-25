import type { SolveFeedItem } from "@/lib/types";
import { formatTimestamp } from "@/lib/time";

interface SolveFeedProps {
  items: SolveFeedItem[];
  frozen?: boolean;
}

export function SolveFeed({ items, frozen }: SolveFeedProps) {
  if (frozen) {
    return (
      <div className="pixel-border bg-arena-panel/80 p-6 text-center">
        <p
          className="text-arena-amber font-mono text-lg glitch-text neon-glow"
          data-text="SCOREBOARD FROZEN"
        >
          SCOREBOARD FROZEN
        </p>
        <p className="text-arena-muted text-sm mt-2">
          Latest solve details are hidden
        </p>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="pixel-border bg-arena-panel/80 p-6 text-center">
        <p className="text-arena-muted text-sm font-mono uppercase tracking-wider">
          NO BREACHES YET
        </p>
      </div>
    );
  }

  return (
    <div className="pixel-border bg-arena-panel/80 overflow-hidden">
      <div className="px-4 py-3 border-b border-arena-neon/20">
        <h3 className="text-arena-cyan font-mono text-sm uppercase tracking-wider">
          Live Breach Feed
        </h3>
      </div>
      <div className="max-h-96 overflow-y-auto">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex items-center gap-4 px-4 py-3 border-b border-arena-neon/10 hover:bg-arena-neon/5 transition-colors text-sm"
          >
            <span className="text-arena-muted font-mono text-xs w-20 shrink-0">
              {formatTimestamp(item.solved_at)}
            </span>
            <span className="text-arena-neon font-bold shrink-0">
              {item.team_name}
            </span>
            <span className="text-arena-muted">breached</span>
            <span className="text-white truncate flex-1">
              {item.challenge_title}
            </span>
            <span className="text-arena-cyan font-mono shrink-0">
              +{item.points}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
