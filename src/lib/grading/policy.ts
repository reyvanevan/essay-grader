import type {
  NormalizedRubricScore,
  ParsedRubricScore,
  RubricDefinition,
} from "@/lib/grading/types";

function normalizeNumber(value: number): number {
  if (Number.isNaN(value)) return 0;
  if (value < 0) return 0;
  if (value > 100) return 100;
  return Number(value.toFixed(2));
}

export function reconcileRubricScores(
  rubricDefinitions: RubricDefinition[],
  modelRubricScores: ParsedRubricScore[],
  fallbackScore: number
): NormalizedRubricScore[] {
  const map = new Map(modelRubricScores.map((item) => [item.aspect.toLowerCase().trim(), item]));

  return rubricDefinitions.map((definition) => {
    const matched = map.get(definition.aspect.toLowerCase().trim());

    if (!matched) {
      return {
        aspect: definition.aspect,
        weight: normalizeNumber(definition.weight),
        score: normalizeNumber(fallbackScore),
        feedback: "Model did not return this rubric aspect. Fallback to holistic score.",
        reasoning: "No explicit aspect reasoning from model.",
      };
    }

    return {
      aspect: definition.aspect,
      weight: normalizeNumber(definition.weight),
      score: normalizeNumber(matched.score),
      feedback: matched.feedback,
      reasoning: matched.reasoning,
    };
  });
}

export function computeWeightedTotal(scores: NormalizedRubricScore[]): number {
  const totalWeight = scores.reduce((sum, score) => sum + score.weight, 0);
  if (totalWeight <= 0) {
    return 0;
  }

  const weighted = scores.reduce((sum, score) => sum + score.score * score.weight, 0) / totalWeight;
  return normalizeNumber(weighted);
}
