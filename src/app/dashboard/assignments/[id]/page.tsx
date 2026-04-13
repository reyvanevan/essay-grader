import { createClient } from "@/utils/supabase/server";
import { format } from "date-fns";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, NotebookPen } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SubmissionCreateForm } from "@/components/grading/submission-create-form";
import { SubmissionGradeCard } from "@/components/grading/submission-grade-card";
import { AssignmentRealtimeListener } from "@/components/grading/assignment-realtime-listener";

type AssignmentRow = {
  id: string;
  title: string;
  course_code: string | null;
  description: string | null;
  due_date: string | null;
  llm_provider: string | null;
  llm_model: string | null;
  llm_model_locked_at: string | null;
};

type RubricRow = {
  id: string;
  aspect: string;
  weight: number;
  description: string;
};

type SubmissionRow = {
  id: string;
  assignment_id: string;
  student_name: string;
  student_identifier: string;
  answer_text: string | null;
  status: string;
  created_at: string;
};

type GradeRow = {
  submission_id: string;
  ai_holistic_score: number | null;
  ai_holistic_feedback: string | null;
  ai_rubric_breakdown: unknown;
  ai_weighted_total: number | null;
  final_score: number | null;
  final_feedback: string | null;
  is_overridden: boolean | null;
  override_note: string | null;
};

type RubricBreakdownItem = {
  aspect: string;
  weight: number;
  score: number;
  feedback: string;
  reasoning: string;
};

function parseRubricBreakdown(raw: unknown): RubricBreakdownItem[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const source = item as Record<string, unknown>;
      const aspect = typeof source.aspect === "string" ? source.aspect : "Unknown Aspect";
      const weight = typeof source.weight === "number" ? source.weight : 0;
      const score = typeof source.score === "number" ? source.score : 0;
      const feedback = typeof source.feedback === "string" ? source.feedback : "";
      const reasoning = typeof source.reasoning === "string" ? source.reasoning : "";

      return { aspect, weight, score, feedback, reasoning };
    })
    .filter((item): item is RubricBreakdownItem => Boolean(item));
}

function statusBadgeClass(status: string) {
  return status === "Active"
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : "border-stone-200 bg-stone-100 text-stone-600";
}

export default async function AssignmentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const assignmentId = resolvedParams.id;
  const supabase = await createClient();

  const { data: assignment, error: assignmentError } = await supabase
    .from("assignments")
    .select("id, title, course_code, description, due_date, llm_provider, llm_model, llm_model_locked_at")
    .eq("id", assignmentId)
    .single<AssignmentRow>();

  if (assignmentError || !assignment) {
    return notFound();
  }

  const { data: rubrics } = await supabase
    .from("rubrics")
    .select("id, aspect, weight, description")
    .eq("assignment_id", assignmentId)
    .order("created_at", { ascending: true })
    .returns<RubricRow[]>();

  const { data: submissions } = await supabase
    .from("submissions")
    .select("id, assignment_id, student_name, student_identifier, answer_text, status, created_at")
    .eq("assignment_id", assignmentId)
    .order("created_at", { ascending: false })
    .returns<SubmissionRow[]>();

  const submissionIds = (submissions ?? []).map((submission) => submission.id);

  const gradesResult = submissionIds.length
    ? await supabase
        .from("grades")
        .select(
          "submission_id, ai_holistic_score, ai_holistic_feedback, ai_rubric_breakdown, ai_weighted_total, final_score, final_feedback, is_overridden, override_note"
        )
        .in("submission_id", submissionIds)
        .returns<GradeRow[]>()
    : { data: [] as GradeRow[] };

  const gradeBySubmission = new Map(
    (gradesResult.data || []).map((grade) => [grade.submission_id, grade])
  );

  const safeRubrics = rubrics || [];
  const safeSubmissions = submissions || [];
  const totalWeight = safeRubrics.reduce((sum, rubric) => sum + rubric.weight, 0);
  const dueDateFormatted = assignment.due_date
    ? format(new Date(assignment.due_date), "dd MMM yyyy")
    : "No deadline set";
  const status =
    assignment.due_date && new Date(assignment.due_date) < new Date() ? "Closed" : "Active";

  const queuedCount = safeSubmissions.filter((s) => s.status === "queued").length;
  const processingCount = safeSubmissions.filter((s) => s.status === "processing").length;
  const failedCount = safeSubmissions.filter((s) => s.status === "failed").length;
  const gradedCount = safeSubmissions.filter((s) => s.status === "graded").length;
  const actionNeeded = safeSubmissions.length - gradedCount;

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 pb-10 font-sans">
      <AssignmentRealtimeListener assignmentId={assignmentId} />

      <section className="rounded-[22px] border border-black/8 bg-white px-5 py-5 shadow-sm sm:px-6">
        <Link
          href="/dashboard/assignments"
          className="inline-flex w-fit items-center gap-2 text-sm font-medium text-stone-500 transition-colors hover:text-stone-950"
        >
          <ArrowLeft className="size-4" />
          Back to Assignments
        </Link>

        <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={`text-[11px] ${statusBadgeClass(status)}`}>
                {status}
              </Badge>
              <Badge variant="outline" className="border-stone-200 bg-stone-50 text-stone-700">
                {assignment.llm_model || "llama-3.3-70b-versatile"}
              </Badge>
              {assignment.llm_model_locked_at ? (
                <Badge variant="outline" className="border-amber-200 bg-amber-50 text-amber-700">
                  Model Locked
                </Badge>
              ) : null}
              <span className="text-sm text-stone-500">{assignment.course_code || "General Course"}</span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-stone-950 sm:text-3xl">{assignment.title}</h1>
            <p className="mt-2 text-sm leading-relaxed text-stone-500">
              Action-first review workspace: scan queue, open one student, finalize decision.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Sheet>
              <SheetTrigger
                render={
                  <Button
                    variant="outline"
                    className="h-10 rounded-lg border-stone-200 bg-white px-4 text-stone-700 hover:bg-stone-50"
                  />
                }
              >
                <NotebookPen className="size-4" />
                Assignment Context
              </SheetTrigger>
              <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-xl">
                <SheetHeader>
                  <SheetTitle>Assignment Context</SheetTitle>
                  <SheetDescription>Instructions and rubric reference on demand.</SheetDescription>
                </SheetHeader>

                <Tabs defaultValue="instructions" className="mt-5 gap-4">
                  <TabsList variant="line" className="w-full justify-start">
                    <TabsTrigger value="instructions">Instructions</TabsTrigger>
                    <TabsTrigger value="rubric">Rubric</TabsTrigger>
                  </TabsList>

                  <TabsContent value="instructions" className="space-y-3">
                    <div className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-4">
                      <p className="text-sm leading-relaxed text-stone-700 whitespace-pre-wrap">
                        {assignment.description || "No instructions provided."}
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="rubric" className="space-y-3">
                    <div className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-600">
                      {safeRubrics.length} aspects · {totalWeight}% total weight
                    </div>
                    {safeRubrics.map((rubric) => (
                      <div key={rubric.id} className="rounded-xl border border-stone-200 bg-white px-4 py-4">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-medium text-stone-950">{rubric.aspect}</p>
                          <span className="text-xs text-stone-500">{rubric.weight}%</span>
                        </div>
                        <p className="mt-1 text-sm leading-relaxed text-stone-600">{rubric.description}</p>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              </SheetContent>
            </Sheet>

            <SubmissionCreateForm assignmentId={assignmentId} />
          </div>
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-4">
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-amber-700">Need Action</p>
            <p className="mt-1 text-sm font-semibold text-amber-800">{actionNeeded}</p>
          </div>
          <div className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-stone-400">In Queue</p>
            <p className="mt-1 text-sm font-semibold text-stone-900">
              {queuedCount} queued · {processingCount} processing
            </p>
          </div>
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-rose-700">Failed</p>
            <p className="mt-1 text-sm font-semibold text-rose-800">{failedCount}</p>
          </div>
          <div className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-stone-400">Due Date</p>
            <p className="mt-1 text-sm font-semibold text-stone-900">{dueDateFormatted}</p>
          </div>
        </div>
      </section>

      <section id="submission-inbox" className="space-y-3">
        <div className="hidden rounded-[18px] border border-black/8 bg-white px-6 py-4 shadow-sm sm:block">
          <div className="grid grid-cols-[1.2fr_auto_auto] gap-3 text-[11px] font-medium uppercase tracking-[0.12em] text-stone-400">
            <span>Submission</span>
            <span className="text-right">Status</span>
            <span className="text-right">Final</span>
          </div>
        </div>

        {safeSubmissions.length === 0 ? (
          <section className="rounded-[20px] border border-dashed border-stone-300 bg-white px-6 py-12 text-center shadow-sm">
            <p className="text-sm font-medium text-stone-700">No submissions yet</p>
            <p className="mt-2 text-sm text-stone-500">Add a manual submission to start grading.</p>
          </section>
        ) : (
          <div className="space-y-2">
            {safeSubmissions.map((submission) => {
              const grade = gradeBySubmission.get(submission.id);

              return (
                <SubmissionGradeCard
                  key={submission.id}
                  submission={submission}
                  grade={
                    grade
                      ? {
                          ai_holistic_score: grade.ai_holistic_score,
                          ai_holistic_feedback: grade.ai_holistic_feedback,
                          ai_weighted_total: grade.ai_weighted_total,
                          ai_rubric_breakdown: parseRubricBreakdown(grade.ai_rubric_breakdown),
                          final_score: grade.final_score,
                          final_feedback: grade.final_feedback,
                          is_overridden: grade.is_overridden,
                          override_note: grade.override_note,
                        }
                      : null
                  }
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
