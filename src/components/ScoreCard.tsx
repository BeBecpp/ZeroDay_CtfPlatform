import type { ScoreboardTeam } from "@/lib/types";

interface ScoreCardProps {
  team: ScoreboardTeam;
  totalPoints: number;
  rank: number;
  highlight?: boolean;
}

export function ScoreCard({ team, totalPoints, rank, highlight }: ScoreCardProps) {
  const progress = totalPoints > 0 ? (team.score / totalPoints) * 100 : 0;

  return (
    <div
      className={`
        pixel-border p-6 flex flex-col gap-4
        ${highlight ? "border-arena-neon/70 bg-arena-neon/5" : "bg-arena-panel/80"}
      `}
    >
      <div className="flex items-center justify-between">
        <div>
          <span className="text-arena-muted text-xs font-mono">RANK #{rank}</span>
          <h2 className={`text-xl font-bold mt-1 ${highlight ? "neon-glow" : "text-white"}`}>
            {team.name}
          </h2>
          <span className="text-arena-muted text-xs font-mono">{team.code}</span>
        </div>
        <div className="text-right">
          <div className={`text-4xl font-bold ${highlight ? "neon-glow text-arena-neon" : "text-arena-cyan"}`}>
            {team.score}
          </div>
          <div className="text-arena-muted text-xs">POINTS</div>
        </div>
      </div>

      <div>
        <div className="flex justify-between text-xs text-arena-muted mb-1">
          <span>{team.solveCount} breaches</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="progress-bar">
          <div
            className="progress-bar-fill"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
