export type GradeEssayInput = {
  prompt: string;
};

export interface LLMProviderAdapter {
  readonly name: string;
  gradeEssay(input: GradeEssayInput): Promise<string>;
}

type OpenAICompatibleConfig = {
  apiKey: string;
  baseUrl: string;
  model: string;
};

class OpenAICompatibleProvider implements LLMProviderAdapter {
  readonly name = "openai-compatible";

  constructor(private readonly config: OpenAICompatibleConfig) {}

  async gradeEssay(input: GradeEssayInput): Promise<string> {
    const response = await fetch(`${this.config.baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: this.config.model,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "system",
            content: "Return strict JSON only.",
          },
          {
            role: "user",
            content: input.prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Provider request failed (${response.status}): ${body}`);
    }

    const payload = (await response.json()) as {
      choices?: Array<{ message?: { content?: string | null } }>;
    };

    const content = payload.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("Provider returned empty content.");
    }

    return content;
  }
}

class DeterministicMockProvider implements LLMProviderAdapter {
  readonly name = "deterministic-mock";

  async gradeEssay(input: GradeEssayInput): Promise<string> {
    const normalizedLength = Math.min(100, Math.max(30, Math.floor(input.prompt.length / 80)));

    return JSON.stringify({
      holistic: {
        score: normalizedLength,
        feedback:
          "Mock grading result generated because external LLM provider is not configured.",
      },
      rubric: [],
      weighted_total: normalizedLength,
      global_reasoning:
        "This score is deterministic and based on prompt length for development fallback.",
    });
  }
}

function buildOpenAICompatibleFromEnv(): OpenAICompatibleProvider | null {
  const explicitKey = process.env.LLM_API_KEY;
  const explicitBaseUrl = process.env.LLM_BASE_URL;
  const explicitModel = process.env.LLM_MODEL;

  if (explicitKey && explicitBaseUrl && explicitModel) {
    return new OpenAICompatibleProvider({
      apiKey: explicitKey,
      baseUrl: explicitBaseUrl,
      model: explicitModel,
    });
  }

  if (process.env.GROQ_API_KEY) {
    return new OpenAICompatibleProvider({
      apiKey: process.env.GROQ_API_KEY,
      baseUrl: "https://api.groq.com/openai/v1",
      model: process.env.LLM_MODEL || "llama-3.3-70b-versatile",
    });
  }

  return null;
}

export function getLLMProvider(): LLMProviderAdapter {
  const strategy = (process.env.LLM_PROVIDER || "auto").toLowerCase();

  if (strategy === "mock") {
    return new DeterministicMockProvider();
  }

  const provider = buildOpenAICompatibleFromEnv();

  if (provider) {
    return provider;
  }

  return new DeterministicMockProvider();
}
