export const DEFAULT_LLM_PROVIDER = "groq";
export const DEFAULT_LLM_MODEL = process.env.LLM_MODEL || "llama-3.3-70b-versatile";

export function normalizeProvider(provider: string | null | undefined): string {
  const safe = provider?.trim().toLowerCase();
  return safe || DEFAULT_LLM_PROVIDER;
}

export function normalizeModel(model: string | null | undefined): string {
  const safe = model?.trim();
  return safe || DEFAULT_LLM_MODEL;
}

export function canUpdateAssignmentModel(lockedAt: string | null | undefined): boolean {
  return !lockedAt;
}
