import { createClient } from "@/utils/supabase/server";
import { format } from "date-fns";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, ChevronRight, NotebookPen } from "lucide-react";
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
import { AssignmentRealtimeListener } from "@/components/grading/assignment-realtime-listener";
import { SubmissionInbox } from "@/components/grading/submission-inbox";

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

function AssignmentContextPanel({
  assignment,
  rubrics,
  totalWeight,
  dueDateFormatted,
}: {
  assignment: AssignmentRow;
  rubrics: RubricRow[];
  totalWeight: number;
  dueDateFormatted: string;
}) {
  return (
    <div className="space-y-3">
      <div className="rounded-[20px] border border-black/8 bg-white px-4 py-4 shadow-sm">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-stone-400">
          Instructions
        </p>
        <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-stone-600">
          {assignment.description || "No instructions provided."}
        </p>
      </div>

      <div className="rounded-[20px] border border-black/8 bg-white px-4 py-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-stone-400">
              Rubric
            </p>
            <p className="mt-1 text-sm font-medium text-stone-950">{rubrics.length} aspects</p>
          </div>
          <Badge variant="outline" className="border-stone-200 bg-stone-50 text-stone-700">
            {totalWeight}%
          </Badge>
        </div>

        <div className="mt-3 space-y-2">
          {rubrics.map((rubric) => (
            <div key={rubric.id} className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-3">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-medium text-stone-950">{rubric.aspect}</p>
                <span className="text-xs text-stone-500">{rubric.weight}%</span>
              </div>
              <p className="mt-1 text-sm leading-relaxed text-stone-600">{rubric.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-3 border-t border-stone-100 pt-3 text-sm text-stone-500">
          Due {dueDateFormatted}
        </div>
      </div>
    </div>
  );
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

  const safeRubrics = rubrics || [];
  const safeSubmissions = submissions || [];
  const totalWeight = safeRubrics.reduce((sum, rubric) => sum + rubric.weight, 0);
  const dueDateFormatted = assignment.due_date
    ? format(new Date(assignment.due_date), "dd MMM yyyy")
    : "No deadline set";
  const status =
    assignment.due_date && new Date(assignment.due_date) < new Date() ? "Closed" : "Active";
  const gradedCount = safeSubmissions.filter((submission) => submission.status === "graded").length;

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
              <Badge
                variant="outline"
                className={`text-[11px] ${statusBadgeClass(status)}`}
              >
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
              <span className="text-sm text-stone-500">
                {assignment.course_code || "General Course"}
              </span>
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-stone-950 sm:text-3xl">
              {assignment.title}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-stone-500">
              Review submissions, inspect AI output, and finalize lecturer decisions.
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
                View Rubric
              </SheetTrigger>
              <SheetContent side="bottom" className="max-h-[88vh] overflow-y-auto rounded-t-[24px]">
                <SheetHeader className="px-5 pb-0 pt-5">
                  <SheetTitle>Assignment context</SheetTitle>
                  <SheetDescription>Instructions and rubric reference.</SheetDescription>
                </SheetHeader>
                <div className="px-5 pb-5">
                  <AssignmentContextPanel
                    assignment={assignment}
                    rubrics={safeRubrics}
                    totalWeight={totalWeight}
                    dueDateFormatted={dueDateFormatted}
                  />
                </div>
              </SheetContent>
            </Sheet>

            <a href="#submission-inbox">
              <Button className="h-10 rounded-lg bg-stone-950 px-4 text-white hover:bg-stone-800">
                Open Inbox
                <ChevronRight className="size-4" />
              </Button>
            </a>
          </div>
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-3">
          <div className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">Due Date</p>
            <p className="mt-1 text-sm font-medium text-stone-950">{dueDateFormatted}</p>
          </div>
          <div className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">Submissions</p>
            <p className="mt-1 text-sm font-medium text-stone-950">{safeSubmissions.length}</p>
          </div>
          <div className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">Graded</p>
            <p className="mt-1 text-sm font-medium text-stone-950">
              {gradedCount}/{safeSubmissions.length}
            </p>
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_280px]">
        <div id="submission-inbox" className="space-y-4">
          <section className="rounded-[20px] border border-black/8 bg-white px-5 py-4 shadow-sm sm:px-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-stone-400">
                  Submission Inbox
                </p>
                <h2 className="mt-1 text-xl font-semibold tracking-tight text-stone-950">
                  Review queue
                </h2>
              </div>
              <p className="text-sm text-stone-500">
                {safeSubmissions.length} total · {safeSubmissions.length - gradedCount} waiting
              </p>
            </div>
          </section>

          <SubmissionInbox
            assignmentId={assignmentId}
            submissions={safeSubmissions}
            grades={(gradesResult.data || []).map((grade) => ({
              submission_id: grade.submission_id,
              ai_holistic_score: grade.ai_holistic_score,
              ai_holistic_feedback: grade.ai_holistic_feedback,
              ai_weighted_total: grade.ai_weighted_total,
              ai_rubric_breakdown: parseRubricBreakdown(grade.ai_rubric_breakdown),
              final_score: grade.final_score,
              final_feedback: grade.final_feedback,
              is_overridden: grade.is_overridden,
              override_note: grade.override_note,
            }))}
          />
        </div>

        <aside className="hidden xl:block xl:sticky xl:top-24 xl:self-start">
          <AssignmentContextPanel
            assignment={assignment}
            rubrics={safeRubrics}
            totalWeight={totalWeight}
            dueDateFormatted={dueDateFormatted}
          />
        </aside>
      </div>
    </div>
  );
}
