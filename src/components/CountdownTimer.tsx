"use client";

import { useEffect, useState } from "react";
import { formatCountdown } from "@/lib/time";

interface CountdownTimerProps {
  endTime: string | null;
  startTime?: string | null;
  label?: string;
}

export function CountdownTimer({ endTime, startTime, label = "TIME REMAINING" }: CountdownTimerProps) {
  const [remaining, setRemaining] = useState<number | null>(null);
  const [status, setStatus] = useState<"waiting" | "live" | "ended">("live");

  useEffect(() => {
    const update = () => {
      const now = Date.now();

      if (startTime) {
        const start = new Date(startTime).getTime();
        if (now < start) {
          setStatus("waiting");
          setRemaining(start - now);
          return;
        }
      }

      if (endTime) {
        const end = new Date(endTime).getTime();
        if (now >= end) {
          setStatus("ended");
          setRemaining(0);
          return;
        }
        setStatus("live");
        setRemaining(end - now);
        return;
      }

      setStatus("live");
      setRemaining(null);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [endTime, startTime]);

  const statusLabel =
    status === "waiting"
      ? "EVENT STARTS IN"
      : status === "ended"
        ? "EVENT ENDED"
        : label;

  const statusColor =
    status === "ended"
      ? "text-arena-danger"
      : status === "waiting"
        ? "text-arena-amber"
        : "text-arena-neon";

  return (
    <div className="flex items-center gap-3 font-mono">
      <span className="text-arena-muted text-xs uppercase tracking-wider">
        {statusLabel}
      </span>
      <span className={`text-lg font-bold ${statusColor} ${status === "live" ? "neon-glow" : ""}`}>
        {remaining !== null ? formatCountdown(remaining) : "--:--:--"}
      </span>
    </div>
  );
}
