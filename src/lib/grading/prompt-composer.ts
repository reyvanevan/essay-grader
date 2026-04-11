import type { RubricDefinition } from "@/lib/grading/types";

type ComposePromptInput = {
  assignmentTitle: string;
  assignmentInstructions: string | null;
  studentAnswer: string;
  rubrics: RubricDefinition[];
};

export function composeGradingPrompt(input: ComposePromptInput): string {
  const rubricBlock = input.rubrics
    .map(
      (rubric, index) =>
        `${index + 1}. Aspect: ${rubric.aspect}\n   Weight: ${rubric.weight}%\n   Criteria: ${rubric.description}`
    )
    .join("\n\n");

  const safeInstructions = input.assignmentInstructions?.trim() || "No extra lecturer instructions.";

  return [
    "ROLE:",
    "You are a strict but fair senior lecturer assistant for essay grading.",
    "",
    "TASK:",
    "Grade the student answer using TWO views:",
    "1) Holistic grade (overall understanding and quality)",
    "2) Rubric-based grade (per aspect with weighted total)",
    "",
    "RULES:",
    "- Respect the lecturer instructions and rubric definitions exactly.",
    "- Do not invent rubric aspects.",
    "- Scores must be in range 0..100.",
    "- Output JSON only with no markdown fences.",
    "",
    "OUTPUT JSON SCHEMA:",
    "{",
    '  "holistic": { "score": number, "feedback": string },',
    '  "rubric": [',
    '    { "aspect": string, "score": number, "weight": number, "feedback": string, "reasoning": string }',
    "  ],",
    '  "weighted_total": number,',
    '  "global_reasoning": string',
    "}",
    "",
    "ASSIGNMENT TITLE:",
    input.assignmentTitle,
    "",
    "LECTURER INSTRUCTIONS:",
    safeInstructions,
    "",
    "RUBRIC DEFINITIONS:",
    rubricBlock || "No rubric provided.",
    "",
    "STUDENT ANSWER:",
    input.studentAnswer,
  ].join("\n");
}
