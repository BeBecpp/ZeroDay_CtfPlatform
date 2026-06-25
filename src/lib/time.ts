import type { EventSettings, EventState } from "./types";

export function getEventState(settings: EventSettings): EventState {
  const now = Date.now();
  const start = settings.start_time ? new Date(settings.start_time).getTime() : null;
  const end = settings.end_time ? new Date(settings.end_time).getTime() : null;

  if (start && now < start) return "not_started";
  if (end && now > end) return "ended";
  if (start && now >= start) return "live";
  if (!start && !end) return "live";
  return "live";
}

export function getTimeRemaining(endTime: string | null): number | null {
  if (!endTime) return null;
  const remaining = new Date(endTime).getTime() - Date.now();
  return remaining > 0 ? remaining : 0;
}

export function formatCountdown(ms: number): string {
  if (ms <= 0) return "00:00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return [hours, minutes, seconds]
    .map((n) => n.toString().padStart(2, "0"))
    .join(":");
}

export function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}
