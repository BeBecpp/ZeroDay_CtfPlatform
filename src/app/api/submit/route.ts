import { NextRequest } from "next/server";
import { getTeamSessionFromRequest, jsonError, jsonSuccess } from "@/lib/auth";
import { handleApiError } from "@/lib/api";
import { canSubmitFlags } from "@/lib/event";
import { verifyFlag } from "@/lib/hash";
import {
  checkRateLimit,
  RATE_LIMIT_MESSAGE,
} from "@/lib/rateLimit";
import { getSupabaseAdmin, isSupabaseConfigured } from "@/lib/supabaseAdmin";
import { submitFlagSchema } from "@/lib/validators";
import type { EventSettings } from "@/lib/types";

export async function POST(request: NextRequest) {
  try {
    if (!isSupabaseConfigured()) {
      return jsonError("Supabase is not configured", 503);
    }

    const session = await getTeamSessionFromRequest(request);
    if (!session) {
      return jsonError("Not authenticated", 401);
    }

    const body = await request.json();
    const parsed = submitFlagSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(parsed.error.errors[0]?.message || "Invalid input");
    }

    const { challengeSlug, flag } = parsed.data;
    const supabase = getSupabaseAdmin();

    const { data: settings } = await supabase
      .from("event_settings")
      .select("*")
      .eq("id", 1)
      .single();

    const eventSettings = settings as EventSettings | null;
    if (!canSubmitFlags(eventSettings)) {
      return jsonError("Event is not accepting submissions", 403);
    }

    const submitRateKey = `submit:${session.teamId}`;
    const { allowed: submitAllowed } = checkRateLimit(
      submitRateKey,
      30,
      60 * 1000
    );
    if (!submitAllowed) {
      return jsonError(RATE_LIMIT_MESSAGE, 429);
    }

    const { data: challenge, error } = await supabase
      .from("challenges")
      .select("*")
      .eq("slug", challengeSlug)
      .eq("visible", true)
      .single();

    if (error || !challenge) {
      return jsonError("Challenge not found", 404);
    }

    const wrongFlagKey = `submit-wrong:${session.teamId}:${challenge.id}`;
    const trimmedFlag = flag.trim();

    const { data: existingSolve } = await supabase
      .from("solves")
      .select("id, points")
      .eq("team_id", session.teamId)
      .eq("challenge_id", challenge.id)
      .maybeSingle();

    const isCorrect = verifyFlag(trimmedFlag, challenge.flag_hash);

    if (!isCorrect) {
      const { allowed: wrongAllowed } = checkRateLimit(
        wrongFlagKey,
        8,
        60 * 1000
      );
      if (!wrongAllowed) {
        return jsonError(RATE_LIMIT_MESSAGE, 429);
      }
    }

    await supabase.from("submissions").insert({
      team_id: session.teamId,
      challenge_id: challenge.id,
      submitted_flag: trimmedFlag,
      correct: isCorrect,
    });

    if (existingSolve) {
      return jsonSuccess({
        correct: isCorrect,
        alreadySolved: true,
        message: isCorrect
          ? "Already breached. No additional points awarded."
          : "ACCESS DENIED",
        points: 0,
      });
    }

    if (!isCorrect) {
      return jsonSuccess({
        correct: false,
        alreadySolved: false,
        message: "ACCESS DENIED",
        points: 0,
      });
    }

    const { error: solveError } = await supabase.from("solves").insert({
      team_id: session.teamId,
      challenge_id: challenge.id,
      points: challenge.points,
    });

    if (solveError) {
      if (solveError.code === "23505") {
        return jsonSuccess({
          correct: true,
          alreadySolved: true,
          message: "Already breached. No additional points awarded.",
          points: 0,
        });
      }
      throw solveError;
    }

    return jsonSuccess({
      correct: true,
      alreadySolved: false,
      message: "BREACH CONFIRMED",
      points: challenge.points,
    });
  } catch (error) {
    return handleApiError(error);
  }
}
