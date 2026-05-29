"use server";

import { z } from "zod";

const analysisDraftSchema = z.object({
  symbol: z.string().trim().max(24),
  thesis: z.string().trim().max(2_000),
  entry: z.string().trim().max(120),
  invalidation: z.string().trim().max(240),
});

const settingsSchema = z.object({
  name: z.string().trim().min(1).max(80),
  role: z.string().trim().min(1).max(120),
  notifications: z.array(z.string().trim().min(1).max(120)),
});

export async function saveAnalysisDraft(formData: FormData) {
  analysisDraftSchema.parse({
    symbol: formData.get("symbol"),
    thesis: formData.get("thesis"),
    entry: formData.get("entry"),
    invalidation: formData.get("invalidation"),
  });
}

export async function saveSettings(formData: FormData) {
  settingsSchema.parse({
    name: formData.get("name"),
    role: formData.get("role"),
    notifications: formData.getAll("notifications"),
  });
}
