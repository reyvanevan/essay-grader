import { NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/utils/supabase/admin";
import { processGradingBatch } from "@/lib/grading/worker";

const submissionSchema = z.object({
  assignmentId: z.string().uuid(),
  studentName: z.string().min(1),
  studentIdentifier: z.string().min(1),
  answerText: z.string().min(1),
});

export async function POST(request: Request) {
  const supabase = createAdminClient();

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const parsed = submissionSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload.", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();

  const { data: submission, error: submissionError } = await supabase
    .from("submissions")
    .insert({
      assignment_id: parsed.data.assignmentId,
      student_name: parsed.data.studentName,
      student_identifier: parsed.data.studentIdentifier,
      answer_text: parsed.data.answerText,
      status: "queued",
      created_at: now,
      updated_at: now,
    })
    .select("id, assignment_id, status, created_at")
    .single();

  if (submissionError || !submission) {
    return NextResponse.json(
      { error: `Failed to create submission: ${submissionError?.message ?? "unknown"}` },
      { status: 500 }
    );
  }

  const { data: job, error: jobError } = await supabase
    .from("grading_jobs")
    .insert({
      submission_id: submission.id,
      status: "pending",
      attempt: 0,
      max_attempt: 3,
      run_at: now,
      created_at: now,
      updated_at: now,
    })
    .select("id, status, attempt, max_attempt, run_at")
    .single();

  if (jobError || !job) {
    await supabase.from("submissions").update({ status: "failed" }).eq("id", submission.id);

    return NextResponse.json(
      { error: `Failed to enqueue grading job: ${jobError?.message ?? "unknown"}` },
      { status: 500 }
    );
  }

  // Best-effort fallback for low-cost environments (e.g., Vercel Hobby cron limits).
  // This keeps the queue moving even when high-frequency cron is unavailable.
  try {
    await processGradingBatch(1);
  } catch (error) {
    console.error("Best-effort inline worker run failed:", error);
  }

  return NextResponse.json(
    {
      submission,
      job,
      message: "Submission received and grading job has been enqueued.",
    },
    { status: 201 }
  );
}
