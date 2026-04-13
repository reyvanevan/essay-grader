import { DEFAULT_LLM_MODEL, DEFAULT_LLM_PROVIDER } from "@/lib/grading/model-policy";

type GroqModelPayloadItem = {
  id?: unknown;
  active?: unknown;
};

type GroqModelListPayload = {
  data?: GroqModelPayloadItem[];
};

type ModelCatalogCache = {
  expiresAt: number;
  models: string[];
  recommendedModel: string;
};

export type ModelCatalogResult = {
  provider: string;
  models: string[];
  recommendedModel: string;
  source: "live" | "cache" | "fallback";
};

const CACHE_TTL_MS = 10 * 60 * 1000;
let modelCache: ModelCatalogCache | null = null;

function isLikelyTextModel(modelId: string): boolean {
  const lower = modelId.toLowerCase();
  return !lower.includes("whisper") && !lower.includes("tts") && !lower.includes("speech");
}

function fallbackCatalog(source: "fallback" | "cache"): ModelCatalogResult {
  const fallbackModels = [DEFAULT_LLM_MODEL];
  return {
    provider: DEFAULT_LLM_PROVIDER,
    models: fallbackModels,
    recommendedModel: DEFAULT_LLM_MODEL,
    source,
  };
}

function fromCached(): ModelCatalogResult | null {
  if (!modelCache) {
    return null;
  }

  if (Date.now() > modelCache.expiresAt) {
    return null;
  }

  return {
    provider: DEFAULT_LLM_PROVIDER,
    models: modelCache.models,
    recommendedModel: modelCache.recommendedModel,
    source: "cache",
  };
}

export async function getGroqModelCatalog(): Promise<ModelCatalogResult> {
  const cached = fromCached();
  if (cached) {
    return cached;
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return fallbackCatalog("fallback");
  }

  try {
    const response = await fetch("https://api.groq.com/openai/v1/models", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Groq model list failed with status ${response.status}`);
    }

    const payload = (await response.json()) as GroqModelListPayload;
    const parsedModels = (payload.data || [])
      .filter((item) => item.active !== false)
      .map((item) => (typeof item.id === "string" ? item.id.trim() : ""))
      .filter((id) => id.length > 0)
      .filter((id) => isLikelyTextModel(id));

    const deduplicated = Array.from(new Set(parsedModels)).sort((a, b) => a.localeCompare(b));
    const models = deduplicated.length > 0 ? deduplicated : [DEFAULT_LLM_MODEL];
    const recommendedModel = models.includes(DEFAULT_LLM_MODEL) ? DEFAULT_LLM_MODEL : models[0];

    modelCache = {
      expiresAt: Date.now() + CACHE_TTL_MS,
      models,
      recommendedModel,
    };

    return {
      provider: DEFAULT_LLM_PROVIDER,
      models,
      recommendedModel,
      source: "live",
    };
  } catch {
    if (modelCache) {
      return {
        provider: DEFAULT_LLM_PROVIDER,
        models: modelCache.models,
        recommendedModel: modelCache.recommendedModel,
        source: "cache",
      };
    }
    return fallbackCatalog("fallback");
  }
}
