import type { EventSettings } from "./types";
import { getEventState } from "./time";

export function isEventStarted(settings: EventSettings | null): boolean {
  if (!settings?.start_time) return true;
  return Date.now() >= new Date(settings.start_time).getTime();
}

export function isEventEnded(settings: EventSettings | null): boolean {
  if (!settings?.end_time) return false;
  return Date.now() > new Date(settings.end_time).getTime();
}

export function canSubmitFlags(settings: EventSettings | null): boolean {
  if (!settings) return true;
  const state = getEventState(settings);
  return state === "live";
}

export function getEventLockMessage(settings: EventSettings | null): string | null {
  if (!settings) return null;
  const state = getEventState(settings);
  if (state === "not_started") return "EVENT NOT STARTED — MISSIONS LOCKED";
  if (state === "ended") return "EVENT ENDED — SUBMISSIONS DISABLED";
  return null;
}
