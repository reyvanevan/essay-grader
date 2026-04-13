import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/utils/supabase/server";
import { format } from "date-fns";
import { ArrowRight, Filter, Plus, Search } from "lucide-react";
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

function statusBadgeClass(status: string) {
  return status === "Active"
    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
    : "border-stone-200 bg-stone-100 text-stone-600";
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

  const assignments = (rawAssignments || []).map((assignment) => {
    const assignmentSubmissions = submissionList.filter(
      (submission) => submission.assignment_id === assignment.id
    );
    const gradedSubmissions = assignmentSubmissions.filter(
      (submission) => submission.status === "graded"
    );
    const finalScores = gradedSubmissions
      .map((submission) => gradeBySubmissionId.get(submission.id))
      .filter((score): score is number => typeof score === "number");

    const avgScore = finalScores.length
      ? Math.round(finalScores.reduce((sum, score) => sum + score, 0) / finalScores.length)
      : null;

    return {
      id: assignment.id,
      title: assignment.title,
      course: assignment.course_code || "General Course",
      status:
        assignment.due_date && new Date(assignment.due_date) < new Date() ? "Closed" : "Active",
      dueDate: assignment.due_date
        ? format(new Date(assignment.due_date), "dd MMM yyyy")
        : "No deadline",
      submissions: assignmentSubmissions.length,
      graded: gradedSubmissions.length,
      pending: assignmentSubmissions.length - gradedSubmissions.length,
      avgScore,
    };
  });

  const totalAssignments = assignments.length;
  const activeAssignments = assignments.filter((assignment) => assignment.status === "Active").length;
  const pendingReview = assignments.reduce((sum, assignment) => sum + assignment.pending, 0);

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 pb-10 font-sans">
      <section className="rounded-[24px] border border-black/8 bg-white px-5 py-5 shadow-sm sm:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-stone-400">
              Assignment Pipeline
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-stone-950 sm:text-3xl">
              Assignments
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-stone-500">
              Review the current workload, open an assignment workspace, or create a new grading flow.
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
            <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">Assignments</p>
            <p className="mt-1 text-lg font-semibold text-stone-950">{totalAssignments}</p>
          </div>
          <div className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">Active</p>
            <p className="mt-1 text-lg font-semibold text-stone-950">{activeAssignments}</p>
          </div>
          <div className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-3">
            <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">Pending Review</p>
            <p className="mt-1 text-lg font-semibold text-stone-950">{pendingReview}</p>
          </div>
        </div>
      </section>

      <section className="flex flex-col gap-3 rounded-[20px] border border-black/8 bg-white px-5 py-4 shadow-sm sm:flex-row sm:items-center sm:px-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
          <Input
            placeholder="Search assignments..."
            className="h-10 rounded-lg border-stone-200 bg-stone-50 pl-10 shadow-none focus:border-stone-400"
          />
        </div>
        <Button
          variant="outline"
          className="h-10 rounded-lg border-stone-200 bg-white px-4 text-stone-600 hover:bg-stone-50 hover:text-stone-950"
        >
          <Filter className="size-4" />
          Filters
        </Button>
      </section>

      <section className="rounded-[20px] border border-black/8 bg-white shadow-sm">
        {assignments.length === 0 ? (
          <div className="px-6 py-14 text-center">
            <p className="text-sm font-medium text-stone-700">No assignments yet</p>
            <p className="mt-2 text-sm text-stone-500">
              Create the first assignment to start building the grading pipeline.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-stone-100">
            {assignments.map((assignment) => (
              <Link key={assignment.id} href={`/dashboard/assignments/${assignment.id}`}>
                <div className="group px-5 py-4 transition-colors hover:bg-stone-50/70 sm:px-6">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <Badge
                          variant="outline"
                          className={`text-[11px] ${statusBadgeClass(assignment.status)}`}
                        >
                          {assignment.status}
                        </Badge>
                        <span className="text-sm text-stone-500">{assignment.course}</span>
                      </div>
                      <h2 className="truncate text-base font-semibold tracking-tight text-stone-950 sm:text-lg">
                        {assignment.title}
                      </h2>
                      <p className="mt-1 text-sm text-stone-500">Due {assignment.dueDate}</p>
                    </div>

                    <div className="grid grid-cols-3 gap-3 lg:min-w-[300px]">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">
                          Submissions
                        </p>
                        <p className="mt-1 text-base font-semibold text-stone-950">
                          {assignment.submissions}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">
                          Graded
                        </p>
                        <p className="mt-1 text-base font-semibold text-stone-950">
                          {assignment.graded}
                        </p>
                      </div>
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">
                          Avg Score
                        </p>
                        <p className="mt-1 text-base font-semibold text-stone-950">
                          {assignment.avgScore ?? "-"}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-sm">
                    <p className="text-stone-500">
                      {assignment.pending > 0
                        ? `${assignment.pending} submissions still need review`
                        : "All current submissions graded"}
                    </p>
                    <span className="inline-flex items-center gap-2 font-medium text-stone-900">
                      Open
                      <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                    </span>
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
