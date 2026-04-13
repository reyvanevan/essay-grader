export type GradeEssayInput = {
  prompt: string;
};

export type ProviderSelection = {
  provider?: string | null;
  model?: string | null;
};

export interface LLMProviderAdapter {
  readonly provider: string;
  readonly name: string;
  readonly model: string;
  gradeEssay(input: GradeEssayInput): Promise<string>;
}

type OpenAICompatibleConfig = {
  provider: string;
  apiKey: string;
  baseUrl: string;
  model: string;
};

class OpenAICompatibleProvider implements LLMProviderAdapter {
  readonly name = "openai-compatible";
  readonly provider: string;
  readonly model: string;

  constructor(private readonly config: OpenAICompatibleConfig) {
    this.provider = config.provider;
    this.model = config.model;
  }

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
  readonly provider = "mock";
  readonly name = "deterministic-mock";
  readonly model = "deterministic-mock-v1";

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

function buildOpenAICompatibleFromEnv(selection?: ProviderSelection): OpenAICompatibleProvider | null {
  const requestedProvider = selection?.provider?.toLowerCase().trim();
  const requestedModel = selection?.model?.trim();
  const explicitKey = process.env.LLM_API_KEY;
  const explicitBaseUrl = process.env.LLM_BASE_URL;
  const explicitModel = process.env.LLM_MODEL;

  if (explicitKey && explicitBaseUrl) {
    return new OpenAICompatibleProvider({
      provider: requestedProvider || "openai-compatible",
      apiKey: explicitKey,
      baseUrl: explicitBaseUrl,
      model: requestedModel || explicitModel || "llama-3.3-70b-versatile",
    });
  }

  if (process.env.GROQ_API_KEY && (!requestedProvider || requestedProvider === "groq")) {
    return new OpenAICompatibleProvider({
      provider: "groq",
      apiKey: process.env.GROQ_API_KEY,
      baseUrl: "https://api.groq.com/openai/v1",
      model: requestedModel || process.env.LLM_MODEL || "llama-3.3-70b-versatile",
    });
  }

  return null;
}

export function getLLMProvider(selection?: ProviderSelection): LLMProviderAdapter {
  const strategy = (process.env.LLM_PROVIDER || "auto").toLowerCase();

  if (strategy === "mock") {
    return new DeterministicMockProvider();
  }

  const provider = buildOpenAICompatibleFromEnv(selection);

  if (provider) {
    return provider;
  }

  return new DeterministicMockProvider();
}
