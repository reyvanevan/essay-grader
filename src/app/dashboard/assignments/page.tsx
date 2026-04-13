import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createClient } from "@/utils/supabase/server";
import { format } from "date-fns";
import { ArrowRight, Plus } from "lucide-react";
import Link from "next/link";

type AssignmentRow = {
  id: string;
  title: string;
  course_code: string | null;
  due_date: string | null;
  created_at: string;
};

type SubmissionRow = {
  id: string;
  assignment_id: string;
  status: string;
};

type GradeRow = {
  submission_id: string;
  final_score: number | null;
};

function actionBadgeClass(level: "critical" | "attention" | "clear") {
  if (level === "critical") return "border-rose-200 bg-rose-50 text-rose-700";
  if (level === "attention") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-emerald-200 bg-emerald-50 text-emerald-700";
}

export default async function AssignmentsPage() {
  const supabase = await createClient();

  const [{ data: rawAssignments }, { data: submissions }, { data: grades }] = await Promise.all([
    supabase
      .from("assignments")
      .select("id, title, course_code, due_date, created_at")
      .order("created_at", { ascending: false })
      .returns<AssignmentRow[]>(),
    supabase.from("submissions").select("id, assignment_id, status").returns<SubmissionRow[]>(),
    supabase.from("grades").select("submission_id, final_score").returns<GradeRow[]>(),
  ]);

  const submissionList = submissions || [];
  const gradeBySubmissionId = new Map(
    (grades || []).map((grade) => [grade.submission_id, grade.final_score])
  );

  const assignments = (rawAssignments || [])
    .map((assignment) => {
      const assignmentSubmissions = submissionList.filter(
        (submission) => submission.assignment_id === assignment.id
      );
      const queuedCount = assignmentSubmissions.filter((s) => s.status === "queued").length;
      const processingCount = assignmentSubmissions.filter((s) => s.status === "processing").length;
      const failedCount = assignmentSubmissions.filter((s) => s.status === "failed").length;
      const gradedCount = assignmentSubmissions.filter((s) => s.status === "graded").length;
      const pendingCount = assignmentSubmissions.length - gradedCount;

      const finalScores = assignmentSubmissions
        .filter((submission) => submission.status === "graded")
        .map((submission) => gradeBySubmissionId.get(submission.id))
        .filter((score): score is number => typeof score === "number");

      const avgScore = finalScores.length
        ? Math.round(finalScores.reduce((sum, score) => sum + score, 0) / finalScores.length)
        : null;

      const isOverdue = assignment.due_date ? new Date(assignment.due_date) < new Date() : false;
      const actionLevel: "critical" | "attention" | "clear" =
        failedCount > 0 ? "critical" : pendingCount > 0 ? "attention" : "clear";

      return {
        id: assignment.id,
        title: assignment.title,
        course: assignment.course_code || "General Course",
        dueDate: assignment.due_date
          ? format(new Date(assignment.due_date), "dd MMM yyyy")
          : "No deadline",
        isOverdue,
        queuedCount,
        processingCount,
        failedCount,
        gradedCount,
        pendingCount,
        submissionsCount: assignmentSubmissions.length,
        avgScore,
        actionLevel,
      };
    })
    .sort((a, b) => {
      const actionRank = { critical: 0, attention: 1, clear: 2 };
      const actionDelta = actionRank[a.actionLevel] - actionRank[b.actionLevel];
      if (actionDelta !== 0) return actionDelta;
      return b.pendingCount - a.pendingCount;
    });

  const totalAssignments = assignments.length;
  const actionNeededCount = assignments.filter((assignment) => assignment.pendingCount > 0).length;
  const failedTotal = assignments.reduce((sum, assignment) => sum + assignment.failedCount, 0);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 pb-10 font-sans">
      <section className="rounded-[22px] border border-black/8 bg-white px-5 py-5 shadow-sm sm:px-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-stone-400">
              Lecturer Review Pipeline
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-stone-950 sm:text-3xl">
              Assignment Overview
            </h1>
            <p className="mt-2 text-sm text-stone-500">
              See what needs action first, then open the assignment workspace.
            </p>
          </div>

          <Link href="/dashboard/assignments/new">
            <Button className="h-10 rounded-lg bg-stone-950 px-4 text-white hover:bg-stone-800">
              <Plus className="size-4" />
              New Assignment
            </Button>
          </Link>
        </div>

        <div className="mt-5 grid gap-2 sm:grid-cols-3">
          <div className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-stone-400">Assignments</p>
            <p className="mt-1 text-lg font-semibold text-stone-950">{totalAssignments}</p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-amber-700">Need Action</p>
            <p className="mt-1 text-lg font-semibold text-amber-800">{actionNeededCount}</p>
          </div>
          <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-rose-700">Failed Jobs</p>
            <p className="mt-1 text-lg font-semibold text-rose-800">{failedTotal}</p>
          </div>
        </div>
      </section>

      <section className="overflow-hidden rounded-[20px] border border-black/8 bg-white shadow-sm">
        <div className="hidden grid-cols-[1.3fr_auto_auto_auto_auto] gap-3 border-b border-stone-100 px-6 py-3 text-[11px] font-medium uppercase tracking-[0.12em] text-stone-400 sm:grid">
          <span>Assignment</span>
          <span className="text-right">Action</span>
          <span className="text-right">Progress</span>
          <span className="text-right">Outcome</span>
          <span className="text-right">Due</span>
        </div>

        {assignments.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="text-sm font-medium text-stone-700">No assignments yet</p>
            <p className="mt-2 text-sm text-stone-500">
              Create the first assignment to start your grading pipeline.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {assignments.map((assignment) => (
              <Link key={assignment.id} href={`/dashboard/assignments/${assignment.id}`}>
                <div className="group px-5 py-4 transition-colors hover:bg-stone-50/70 sm:px-6">
                  <div className="min-w-0 sm:hidden">
                    <p className="truncate text-sm font-semibold text-stone-950">{assignment.title}</p>
                    <p className="mt-1 text-sm text-stone-500">{assignment.course}</p>
                    <div className="mt-3 flex items-center justify-between">
                      <Badge variant="outline" className={`text-[11px] ${actionBadgeClass(assignment.actionLevel)}`}>
                        {assignment.failedCount > 0
                          ? `${assignment.failedCount} failed`
                          : assignment.pendingCount > 0
                            ? `${assignment.pendingCount} pending`
                            : "clear"}
                      </Badge>
                      <p className="text-sm font-semibold text-stone-900">
                        {assignment.gradedCount}/{assignment.submissionsCount}
                      </p>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-xs text-stone-500">
                      <span>{assignment.queuedCount} queued · {assignment.processingCount} processing</span>
                      <span className={assignment.isOverdue ? "text-rose-700" : ""}>{assignment.dueDate}</span>
                    </div>
                    <span className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-stone-500">
                      Open
                      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </div>

                  <div className="hidden grid-cols-[1.3fr_auto_auto_auto_auto] items-center gap-3 sm:grid">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-stone-950">{assignment.title}</p>
                      <p className="mt-1 text-sm text-stone-500">{assignment.course}</p>
                    </div>

                    <div className="text-right">
                      <Badge variant="outline" className={`text-[11px] ${actionBadgeClass(assignment.actionLevel)}`}>
                        {assignment.failedCount > 0
                          ? `${assignment.failedCount} failed`
                          : assignment.pendingCount > 0
                            ? `${assignment.pendingCount} pending`
                            : "clear"}
                      </Badge>
                      <p className="mt-1 text-xs text-stone-500">
                        {assignment.queuedCount} queued · {assignment.processingCount} processing
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-semibold text-stone-900">
                        {assignment.gradedCount}/{assignment.submissionsCount}
                      </p>
                      <p className="text-xs text-stone-500">graded</p>
                    </div>

                    <div className="text-right">
                      <p className="text-sm font-semibold text-stone-900">{assignment.avgScore ?? "-"}</p>
                      <p className="text-xs text-stone-500">avg score</p>
                    </div>

                    <div className="text-right">
                      <p className={`text-sm font-medium ${assignment.isOverdue ? "text-rose-700" : "text-stone-600"}`}>
                        {assignment.dueDate}
                      </p>
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-stone-500">
                        Open
                        <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
