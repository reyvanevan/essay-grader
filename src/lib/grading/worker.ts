import { createAdminClient } from "@/utils/supabase/admin";
import { composeGradingPrompt } from "@/lib/grading/prompt-composer";
import { getLLMProvider } from "@/lib/grading/providers";
import { parseLLMResponse } from "@/lib/grading/response-parser";
import { computeWeightedTotal, reconcileRubricScores } from "@/lib/grading/policy";
import type { RubricDefinition } from "@/lib/grading/types";

type GradingJobRow = {
  id: string;
  submission_id: string;
  status: "pending" | "queued" | "processing" | "completed" | "failed";
  attempt: number;
  max_attempt: number;
  run_at: string;
};

type SubmissionRow = {
  id: string;
  assignment_id: string;
  answer_text: string | null;
};

type AssignmentRow = {
  id: string;
  title: string;
  description: string | null;
};

type RubricRow = {
  aspect: string;
  weight: number;
  description: string;
};

type ExistingGradeRow = {
  is_overridden: boolean | null;
  final_score: number | null;
  final_feedback: string | null;
};

export type WorkerBatchResult = {
  processed: number;
  completed: number;
  failed: number;
  skipped: number;
  details: Array<{ jobId: string; status: string; reason?: string }>;
};

function nextRunAt(attempt: number): string {
  const delayMinutes = Math.min(30, Math.pow(2, Math.max(0, attempt - 1)));
  const date = new Date();
  date.setMinutes(date.getMinutes() + delayMinutes);
  return date.toISOString();
}

async function markJobAsFailed(
  job: GradingJobRow,
  error: unknown,
  workerId: string
): Promise<{ status: "failed" | "queued"; message: string }> {
  const supabase = createAdminClient();
  const nextAttempt = job.attempt + 1;
  const isExhausted = nextAttempt >= job.max_attempt;
  const failureStatus: "failed" | "queued" = isExhausted ? "failed" : "queued";
  const errorMessage = error instanceof Error ? error.message : "Unknown grading error.";

  await supabase
    .from("submissions")
    .update({ status: failureStatus })
    .eq("id", job.submission_id);

  await supabase
    .from("grading_jobs")
    .update({
      status: failureStatus,
      attempt: nextAttempt,
      error: errorMessage,
      run_at: isExhausted ? new Date().toISOString() : nextRunAt(nextAttempt),
      locked_at: null,
      locked_by: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", job.id)
    .eq("locked_by", workerId);

  return { status: failureStatus, message: errorMessage };
}

async function processSingleJob(job: GradingJobRow, workerId: string): Promise<void> {
  const supabase = createAdminClient();

  const { data: submission, error: submissionError } = await supabase
    .from("submissions")
    .select("id, assignment_id, answer_text")
    .eq("id", job.submission_id)
    .single<SubmissionRow>();

  if (submissionError || !submission) {
    throw new Error(`Submission not found for job ${job.id}.`);
  }

  if (!submission.answer_text?.trim()) {
    throw new Error("Submission answer_text is empty. Text-only grading requires answer_text.");
  }

  await supabase
    .from("submissions")
    .update({ status: "processing", updated_at: new Date().toISOString() })
    .eq("id", submission.id);

  const { data: assignment, error: assignmentError } = await supabase
    .from("assignments")
    .select("id, title, description")
    .eq("id", submission.assignment_id)
    .single<AssignmentRow>();

  if (assignmentError || !assignment) {
    throw new Error(`Assignment ${submission.assignment_id} not found.`);
  }

  const { data: rubrics, error: rubricError } = await supabase
    .from("rubrics")
    .select("aspect, weight, description")
    .eq("assignment_id", submission.assignment_id)
    .order("created_at", { ascending: true })
    .returns<RubricRow[]>();

  if (rubricError) {
    throw new Error(`Failed to load rubrics: ${rubricError.message}`);
  }

  if (!rubrics || rubrics.length === 0) {
    throw new Error("Rubric is required for grading but was not found.");
  }

  const rubricDefinitions: RubricDefinition[] = rubrics.map((rubric) => ({
    aspect: rubric.aspect,
    weight: rubric.weight,
    description: rubric.description,
  }));

  const prompt = composeGradingPrompt({
    assignmentTitle: assignment.title,
    assignmentInstructions: assignment.description,
    studentAnswer: submission.answer_text,
    rubrics: rubricDefinitions,
  });

  const provider = getLLMProvider();
  const providerRawOutput = await provider.gradeEssay({ prompt });
  const parsed = parseLLMResponse(providerRawOutput);

  const normalizedRubric = reconcileRubricScores(
    rubricDefinitions,
    parsed.rubric,
    parsed.holistic.score
  );
  const weightedTotal = computeWeightedTotal(normalizedRubric);

  const { data: existingGrade } = await supabase
    .from("grades")
    .select("is_overridden, final_score, final_feedback")
    .eq("submission_id", submission.id)
    .maybeSingle<ExistingGradeRow>();

  const shouldKeepOverride = existingGrade?.is_overridden === true;
  const finalScore = shouldKeepOverride
    ? existingGrade?.final_score ?? weightedTotal
    : weightedTotal;
  const finalFeedback = shouldKeepOverride
    ? existingGrade?.final_feedback ?? parsed.holistic.feedback
    : parsed.holistic.feedback;

  const { error: upsertGradeError } = await supabase.from("grades").upsert(
    {
      submission_id: submission.id,
      ai_holistic_score: parsed.holistic.score,
      ai_holistic_feedback: parsed.holistic.feedback,
      ai_rubric_breakdown: normalizedRubric,
      ai_weighted_total: weightedTotal,
      ai_reasoning: parsed.global_reasoning,
      final_score: finalScore,
      final_feedback: finalFeedback,
      is_overridden: shouldKeepOverride,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "submission_id" }
  );

  if (upsertGradeError) {
    throw new Error(`Failed to save grade: ${upsertGradeError.message}`);
  }

  const now = new Date().toISOString();

  await supabase
    .from("submissions")
    .update({ status: "graded", updated_at: now })
    .eq("id", submission.id);

  await supabase
    .from("grading_jobs")
    .update({
      status: "completed",
      error: null,
      locked_at: null,
      locked_by: null,
      updated_at: now,
    })
    .eq("id", job.id)
    .eq("locked_by", workerId);
}

export async function processGradingBatch(limit = 10): Promise<WorkerBatchResult> {
  const supabase = createAdminClient();
  const workerId = `worker-${crypto.randomUUID()}`;

  const nowIso = new Date().toISOString();

  const { data: candidates, error: candidateError } = await supabase
    .from("grading_jobs")
    .select("id, submission_id, status, attempt, max_attempt, run_at")
    .in("status", ["pending", "queued", "failed"])
    .lte("run_at", nowIso)
    .order("created_at", { ascending: true })
    .limit(limit)
    .returns<GradingJobRow[]>();

  if (candidateError) {
    throw new Error(`Failed to load grading jobs: ${candidateError.message}`);
  }

  const result: WorkerBatchResult = {
    processed: 0,
    completed: 0,
    failed: 0,
    skipped: 0,
    details: [],
  };

  for (const candidate of candidates ?? []) {
    const { data: claimedJobs, error: claimError } = await supabase
      .from("grading_jobs")
      .update({
        status: "processing",
        locked_at: new Date().toISOString(),
        locked_by: workerId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", candidate.id)
      .in("status", ["pending", "queued", "failed"])
      .select("id, submission_id, status, attempt, max_attempt, run_at")
      .returns<GradingJobRow[]>();

    if (claimError) {
      result.skipped += 1;
      result.details.push({
        jobId: candidate.id,
        status: "skipped",
        reason: `Claim error: ${claimError.message}`,
      });
      continue;
    }

    const claimed = claimedJobs?.[0];
    if (!claimed) {
      result.skipped += 1;
      result.details.push({
        jobId: candidate.id,
        status: "skipped",
        reason: "Job already claimed by another worker.",
      });
      continue;
    }

    result.processed += 1;

    try {
      await processSingleJob(claimed, workerId);
      result.completed += 1;
      result.details.push({ jobId: candidate.id, status: "completed" });
    } catch (error) {
      const failedState = await markJobAsFailed(claimed, error, workerId);
      result.failed += 1;
      result.details.push({
        jobId: candidate.id,
        status: failedState.status,
        reason: failedState.message,
      });
    }
  }

  return result;
}
