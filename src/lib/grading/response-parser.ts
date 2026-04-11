import { z } from "zod";
import type { ParsedLLMGrade } from "@/lib/grading/types";

const rubricScoreSchema = z.object({
  aspect: z.string().min(1),
  score: z.number().min(0).max(100),
  weight: z.number().min(0).max(100),
  feedback: z.string().min(1),
  reasoning: z.string().min(1),
});

const llmGradeSchema = z.object({
  holistic: z.object({
    score: z.number().min(0).max(100),
    feedback: z.string().min(1),
  }),
  rubric: z.array(rubricScoreSchema),
  weighted_total: z.number().min(0).max(100),
  global_reasoning: z.string().min(1),
});

function extractJsonObject(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith("{")) {
    return trimmed;
  }

  const blockMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (blockMatch && blockMatch[1]) {
    return blockMatch[1].trim();
  }

  const firstBrace = trimmed.indexOf("{");
  const lastBrace = trimmed.lastIndexOf("}");
  if (firstBrace >= 0 && lastBrace > firstBrace) {
    return trimmed.slice(firstBrace, lastBrace + 1);
  }

  throw new Error("LLM response does not contain a JSON object.");
}

export function parseLLMResponse(raw: string): ParsedLLMGrade {
  const jsonText = extractJsonObject(raw);

  let parsedJson: unknown;
  try {
    parsedJson = JSON.parse(jsonText);
  } catch {
    throw new Error("LLM response is not valid JSON.");
  }

  const parsed = llmGradeSchema.safeParse(parsedJson);
  if (!parsed.success) {
    throw new Error(`LLM response schema invalid: ${parsed.error.message}`);
  }

  return parsed.data;
}
