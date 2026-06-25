import { z } from "zod";
import { CATEGORIES } from "./types";

export const loginSchema = z.object({
  identifier: z.string().min(1, "Team code or name is required"),
  password: z.string().min(1, "Password is required"),
});

export const adminLoginSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

export const submitFlagSchema = z.object({
  challengeSlug: z.string().min(1),
  flag: z.string().min(1, "Flag is required"),
});

export const challengeCreateSchema = z.object({
  title: z.string().min(1),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "Slug must be lowercase alphanumeric with hyphens"),
  category: z.enum(CATEGORIES),
  points: z.number().int().positive(),
  difficulty: z.string().min(1),
  description: z.string().min(1),
  url: z.string().url().optional().nullable().or(z.literal("")),
  file_url: z.string().url().optional().nullable().or(z.literal("")),
  flag: z.string().optional(),
  visible: z.boolean().default(true),
  sort_order: z.number().int().default(0),
});

export const challengeUpdateSchema = challengeCreateSchema.partial().extend({
  id: z.string().uuid().optional(),
});

export const teamCreateSchema = z.object({
  name: z.string().min(1),
  code: z.string().min(1).regex(/^[A-Z0-9_]+$/, "Code must be uppercase alphanumeric"),
  password: z.string().min(4).optional(),
});

export const teamUpdateSchema = z.object({
  name: z.string().min(1).optional(),
  code: z.string().min(1).regex(/^[A-Z0-9_]+$/).optional(),
  password: z.string().min(4).optional(),
});

export const eventSettingsSchema = z.object({
  event_name: z.string().min(1),
  start_time: z.string().nullable().optional(),
  end_time: z.string().nullable().optional(),
  scoreboard_frozen: z.boolean(),
});

export const fileUploadUrlSchema = z.object({
  challengeSlug: z.string().min(1).regex(/^[a-z0-9-]+$/),
  fileName: z.string().min(1).max(255),
  contentType: z.string().min(1).max(255),
  fileSize: z.number().int().positive().max(25 * 1024 * 1024),
});

export const fileAttachSchema = z.object({
  challengeId: z.string().uuid(),
  filePath: z.string().min(1).max(512),
});

export const fileDeleteSchema = z.object({
  filePath: z.string().min(1).max(512),
});
