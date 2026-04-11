import { createClient } from "@/utils/supabase/server";
import { format } from "date-fns";
import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  BrainCircuit,
  CalendarClock,
  ChevronRight,
  FileStack,
  NotebookPen,
  ScrollText,
  Users,
} from "lucide-react";
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
import { SubmissionCreateForm } from "@/components/grading/submission-create-form";
import { SubmissionGradeCard } from "@/components/grading/submission-grade-card";
import { AssignmentRealtimeListener } from "@/components/grading/assignment-realtime-listener";

type AssignmentRow = {
  id: string;
  title: string;
  course_code: string | null;
  description: string | null;
  due_date: string | null;
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
    <div className="space-y-5">
      <div className="rounded-[28px] border border-black/8 bg-white p-5 shadow-[0_16px_30px_rgba(10,10,10,0.04)]">
        <div className="mb-4 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
          <ScrollText className="size-3.5" />
          Assignment Instructions
        </div>
        <p className="whitespace-pre-wrap text-sm leading-relaxed text-stone-600">
          {assignment.description || "No instructions provided."}
        </p>
      </div>

      <div className="rounded-[28px] border border-black/8 bg-white p-5 shadow-[0_16px_30px_rgba(10,10,10,0.04)]">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
              <BrainCircuit className="size-3.5" />
              Grading Context
            </div>
            <h3 className="text-lg font-semibold tracking-tight text-stone-950">
              Rubric reference panel
            </h3>
          </div>
          <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
            {totalWeight}% total
          </Badge>
        </div>

        <div className="mb-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-2xl bg-stone-50 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-stone-400">Due Date</p>
            <p className="mt-2 text-sm font-medium text-stone-800">{dueDateFormatted}</p>
          </div>
          <div className="rounded-2xl bg-stone-50 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.18em] text-stone-400">Rubric Count</p>
            <p className="mt-2 text-sm font-medium text-stone-800">{rubrics.length} aspects</p>
          </div>
        </div>

        <div className="space-y-3">
          {rubrics.map((rubric) => (
            <div key={rubric.id} className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4">
              <div className="flex items-start justify-between gap-3">
                <p className="font-semibold text-stone-950">{rubric.aspect}</p>
                <Badge variant="outline" className="border-stone-200 bg-white text-stone-700">
                  {rubric.weight}%
                </Badge>
              </div>
              <p className="mt-2 text-sm leading-relaxed text-stone-600">{rubric.description}</p>
            </div>
          ))}
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
    .select("id, title, course_code, description, due_date")
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
  const gradedCount = safeSubmissions.filter((submission) => submission.status === "graded").length;

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 pb-12 font-sans">
      <AssignmentRealtimeListener assignmentId={assignmentId} />

      <div className="relative overflow-hidden rounded-[36px] border border-black/8 bg-[linear-gradient(135deg,#f4efe6_0%,#fffdf9_40%,#f7f3ee_100%)] p-5 shadow-[0_24px_80px_rgba(10,10,10,0.08)] sm:p-8">
        <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-[radial-gradient(circle,_rgba(188,160,120,0.22),_transparent_70%)]" />
        <div className="absolute -bottom-24 left-1/3 h-56 w-56 rounded-full bg-[radial-gradient(circle,_rgba(76,92,79,0.08),_transparent_72%)]" />

        <div className="relative z-10 flex flex-col gap-5">
          <Link
            href="/dashboard/assignments"
            className="inline-flex w-fit items-center gap-2 text-sm font-medium text-stone-500 transition-colors hover:text-stone-950"
          >
            <ArrowLeft className="size-4" />
            Back to Assignments
          </Link>

          <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
            <div className="max-w-3xl space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge
                  variant="outline"
                  className={
                    status === "Active"
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-stone-200 bg-stone-100 text-stone-600"
                  }
                >
                  {status}
                </Badge>
                <Badge variant="outline" className="border-stone-200 bg-white/70 text-stone-700">
                  {assignment.course_code || "General Course"}
                </Badge>
                <Badge variant="outline" className="border-stone-200 bg-white/70 text-stone-700">
                  Review-first workspace
                </Badge>
              </div>

              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                  Editorial Control Room
                </p>
                <h1 className="mt-2 max-w-3xl text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">
                  {assignment.title}
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-relaxed text-stone-600 sm:text-base">
                  Review incoming submissions, inspect AI reasoning, and finalize lecturer decisions without getting trapped in a long scrolling page.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Sheet>
                <SheetTrigger
                  render={
                    <Button variant="outline" className="h-11 rounded-xl border-stone-300 bg-white/80 px-4" />
                  }
                >
                  <NotebookPen className="size-4" />
                  View Rubric
                </SheetTrigger>
                <SheetContent side="bottom" className="max-h-[88vh] overflow-y-auto rounded-t-[28px]">
                  <SheetHeader className="px-5 pb-0 pt-5">
                    <SheetTitle>Assignment context</SheetTitle>
                    <SheetDescription>
                      Rubric and instructions stay close, but no longer crowd the mobile review flow.
                    </SheetDescription>
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
                <Button className="h-11 rounded-xl bg-stone-950 px-4 text-white hover:bg-stone-800">
                  Open Inbox
                  <ChevronRight className="size-4" />
                </Button>
              </a>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-[24px] border border-white/70 bg-white/80 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                <CalendarClock className="size-3.5" />
                Due Date
              </div>
              <p className="mt-3 text-xl font-semibold tracking-tight text-stone-950">
                {dueDateFormatted}
              </p>
            </div>
            <div className="rounded-[24px] border border-white/70 bg-white/80 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                <Users className="size-3.5" />
                Total Submissions
              </div>
              <p className="mt-3 text-xl font-semibold tracking-tight text-stone-950">
                {safeSubmissions.length}
              </p>
            </div>
            <div className="rounded-[24px] border border-white/70 bg-white/80 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                <FileStack className="size-3.5" />
                Graded So Far
              </div>
              <p className="mt-3 text-xl font-semibold tracking-tight text-stone-950">
                {gradedCount}/{safeSubmissions.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.5fr)_360px]">
        <div id="submission-inbox" className="space-y-5">
          <div className="flex flex-col gap-3 rounded-[28px] border border-black/8 bg-white p-5 shadow-[0_16px_30px_rgba(10,10,10,0.04)] sm:flex-row sm:items-end sm:justify-between sm:p-6">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                Submission Inbox
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">
                Review AI outputs first
              </h2>
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-stone-500">
                Each submission starts as a compact card so you can scan who is waiting, what the current status is, and which results need lecturer attention.
              </p>
            </div>
            <Badge variant="outline" className="border-stone-200 bg-stone-50 text-stone-700">
              Mobile-first compact layout
            </Badge>
          </div>

          <SubmissionCreateForm assignmentId={assignmentId} />

          {safeSubmissions.length === 0 ? (
            <div className="rounded-[32px] border border-dashed border-stone-300 bg-white px-6 py-12 text-center shadow-[0_16px_30px_rgba(10,10,10,0.04)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                Empty Inbox
              </p>
              <h3 className="mt-2 text-xl font-semibold tracking-tight text-stone-950">
                No submissions yet
              </h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-stone-500">
                Use the utility panel above when you need a quick manual submission for testing or demo flow.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
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
        </div>

        <aside className="hidden xl:block xl:sticky xl:top-24">
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
