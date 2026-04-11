import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/utils/supabase/admin";

const overrideSchema = z.object({
  finalScore: z.number().min(0).max(100),
  finalFeedback: z.string().optional(),
  overrideNote: z.string().optional(),
  overriddenBy: z.string().optional(),
});

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ submissionId: string }> }
) {
  const { submissionId } = await params;

  if (!z.string().uuid().safeParse(submissionId).success) {
    return NextResponse.json({ error: "Invalid submissionId." }, { status: 400 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = overrideSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const supabase = createAdminClient();

  const { data: existingGrade, error: existingGradeError } = await supabase
    .from("grades")
    .select("id")
    .eq("submission_id", submissionId)
    .maybeSingle();

  if (existingGradeError) {
    return NextResponse.json(
      { error: `Failed to query grade: ${existingGradeError.message}` },
      { status: 500 }
    );
  }

  if (!existingGrade) {
    return NextResponse.json(
      { error: "Grade record not found for this submission." },
      { status: 404 }
    );
  }

  const now = new Date().toISOString();
  const feedback =
    parsed.data.finalFeedback && parsed.data.finalFeedback.trim().length > 0
      ? parsed.data.finalFeedback
      : null;

  const { data: updated, error: updateError } = await supabase
    .from("grades")
    .update({
      final_score: parsed.data.finalScore,
      final_feedback: feedback,
      is_overridden: true,
      overridden_by: parsed.data.overriddenBy || "lecturer",
      overridden_at: now,
      override_note: parsed.data.overrideNote || null,
      updated_at: now,
    })
    .eq("submission_id", submissionId)
    .select("submission_id, final_score, final_feedback, is_overridden, overridden_by, overridden_at")
    .single();

  if (updateError || !updated) {
    return NextResponse.json(
      { error: `Failed to override grade: ${updateError?.message ?? "unknown"}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ message: "Grade override saved.", grade: updated });
}
