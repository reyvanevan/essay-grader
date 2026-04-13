import { NextResponse } from "next/server";
import { getGroqModelCatalog } from "@/lib/grading/model-catalog";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const provider = (url.searchParams.get("provider") || "groq").toLowerCase();

  if (provider !== "groq") {
    return NextResponse.json({ error: "Only provider=groq is supported in v1." }, { status: 400 });
  }

  try {
    const catalog = await getGroqModelCatalog();
    return NextResponse.json({
      provider: catalog.provider,
      models: catalog.models,
      recommendedModel: catalog.recommendedModel,
      source: catalog.source,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown model catalog error.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
