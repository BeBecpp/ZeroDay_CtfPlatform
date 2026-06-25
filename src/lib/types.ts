export type Team = {
  id: string;
  name: string;
  code: string;
  created_at: string;
};

export type Challenge = {
  id: string;
  slug: string;
  title: string;
  category: string;
  points: number;
  difficulty: string;
  description: string;
  url: string | null;
  file_url: string | null;
  visible: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
};

export type ChallengePublic = {
  id: string;
  slug: string;
  title: string;
  category: string;
  points: number;
  difficulty: string;
  description: string;
  url: string | null;
  file_url: string | null;
  visible: boolean;
  solved?: boolean;
  locked?: boolean;
};

export type ChallengeDetail = ChallengePublic;

export type Submission = {
  id: string;
  team_id: string;
  challenge_id: string;
  submitted_flag: string;
  correct: boolean;
  created_at: string;
};

export type Solve = {
  id: string;
  team_id: string;
  challenge_id: string;
  points: number;
  solved_at: string;
};

export type EventSettings = {
  id: number;
  event_name: string;
  start_time: string | null;
  end_time: string | null;
  scoreboard_frozen: boolean;
};

export type TeamSession = {
  teamId: string;
  teamName: string;
  teamCode: string;
};

export type AdminSession = {
  role: "admin";
};

export type ScoreboardTeam = {
  id: string;
  name: string;
  code: string;
  score: number;
  solveCount: number;
};

export type SolveFeedItem = {
  id: string;
  team_name: string;
  challenge_title: string;
  points: number;
  solved_at: string;
};

export type EventState = "not_started" | "live" | "ended";

export const CATEGORIES = [
  "WEB",
  "CRYPTO",
  "REV",
  "TRACE",
  "SHELL",
  "CHAOS",
] as const;

export type Category = (typeof CATEGORIES)[number];

export type ChallengeAdmin = Challenge & {
  flag_hash: string;
};

export type TeamAdmin = Team & {
  password_hash: string;
};
