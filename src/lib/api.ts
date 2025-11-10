// src/lib/api.ts
import { TONE_LABELS } from "./toneLabels";

export type PredictResponse = { tone: string; probs: Record<string, number> };

export const API_URL: string =
  (import.meta.env.VITE_API_URL as string) || "http://127.0.0.1:5000";

export async function predictSkinTone(file: File): Promise<PredictResponse> {
  const form = new FormData();
  form.append("file", file);

  const res = await fetch(`${API_URL}/predict`, { method: "POST", body: form });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(text || `Backend error: ${res.status} ${res.statusText}`);
  }
  const result = (await res.json()) as PredictResponse;

  // Optional mapping if your backend returns snake_case labels
  if (result.tone && TONE_LABELS[result.tone]) {
    result.tone = TONE_LABELS[result.tone];
  }
  return result;
}
