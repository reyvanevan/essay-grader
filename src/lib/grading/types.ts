export type RubricDefinition = {
  aspect: string;
  weight: number;
  description: string;
};

export type ParsedRubricScore = {
  aspect: string;
  score: number;
  weight: number;
  feedback: string;
  reasoning: string;
};

export type ParsedLLMGrade = {
  holistic: {
    score: number;
    feedback: string;
  };
  rubric: ParsedRubricScore[];
  weighted_total: number;
  global_reasoning: string;
};

export type NormalizedRubricScore = {
  aspect: string;
  weight: number;
  score: number;
  feedback: string;
  reasoning: string;
};
