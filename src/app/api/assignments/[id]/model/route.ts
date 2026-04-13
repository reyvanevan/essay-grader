import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/utils/supabase/admin";
import {
  canUpdateAssignmentModel,
  normalizeModel,
  normalizeProvider,
} from "@/lib/grading/model-policy";

const updateSchema = z.object({
  llmProvider: z.string().min(1).optional(),
  llmModel: z.string().min(1),
});

type AssignmentModelRow = {
  id: string;
  llm_provider: string | null;
  llm_model: string | null;
  llm_model_locked_at: string | null;
};

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createAdminClient();

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = updateSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { data: assignment, error: assignmentError } = await supabase
    .from("assignments")
    .select("id, llm_provider, llm_model, llm_model_locked_at")
    .eq("id", id)
    .single<AssignmentModelRow>();

  if (assignmentError || !assignment) {
    return NextResponse.json({ error: "Assignment not found." }, { status: 404 });
  }

  if (!canUpdateAssignmentModel(assignment.llm_model_locked_at)) {
    return NextResponse.json(
      {
        error:
          "Model is locked for fairness after the first submission. Regrading policy is required to change it.",
      },
      { status: 409 }
    );
  }

  const now = new Date().toISOString();
  const { data: updated, error: updateError } = await supabase
    .from("assignments")
    .update({
      llm_provider: normalizeProvider(parsed.data.llmProvider),
      llm_model: normalizeModel(parsed.data.llmModel),
      updated_at: now,
    })
    .eq("id", id)
    .select("id, llm_provider, llm_model, llm_model_locked_at")
    .single<AssignmentModelRow>();

  if (updateError || !updated) {
    return NextResponse.json({ error: "Failed to update model configuration." }, { status: 500 });
  }

  return NextResponse.json({ assignment: updated });
}
