import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createClient } from "@/utils/supabase/server";
import { format } from "date-fns";
import {
  ArrowRight,
  CalendarClock,
  ClipboardCheck,
  Filter,
  Plus,
  Search,
  Sparkles,
  Users,
} from "lucide-react";
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

  const assignments = (rawAssignments || []).map((dbItem) => {
    const assignmentSubmissions = submissionList.filter(
      (submission) => submission.assignment_id === dbItem.id
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
      id: dbItem.id,
      title: dbItem.title,
      course: dbItem.course_code || "General Course",
      status: dbItem.due_date && new Date(dbItem.due_date) < new Date() ? "Closed" : "Active",
      dueDate: dbItem.due_date ? format(new Date(dbItem.due_date), "dd MMM yyyy") : "No deadline",
      submissions: assignmentSubmissions.length,
      graded: gradedSubmissions.length,
      avgScore,
    };
  });

  const totalAssignments = assignments.length;
  const activeAssignments = assignments.filter((assignment) => assignment.status === "Active").length;
  const totalSubmissions = assignments.reduce((sum, assignment) => sum + assignment.submissions, 0);
  const pendingReview = assignments.reduce(
    (sum, assignment) => sum + (assignment.submissions - assignment.graded),
    0
  );

  return (
    <div className="flex flex-col gap-6 pb-12 font-sans">
      <div className="relative overflow-hidden rounded-[36px] border border-black/8 bg-[linear-gradient(135deg,#f4efe6_0%,#fffdf9_42%,#f7f1ea_100%)] p-5 shadow-[0_24px_80px_rgba(10,10,10,0.08)] sm:p-8">
        <div className="absolute -right-14 -top-16 h-52 w-52 rounded-full bg-[radial-gradient(circle,_rgba(188,160,120,0.18),_transparent_70%)]" />
        <div className="absolute -bottom-24 left-1/4 h-56 w-56 rounded-full bg-[radial-gradient(circle,_rgba(86,102,94,0.10),_transparent_72%)]" />

        <div className="relative z-10 flex flex-col gap-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="border-stone-200 bg-white/80 text-stone-700">
                  Review Pipeline
                </Badge>
                <Badge variant="outline" className="border-stone-200 bg-white/80 text-stone-700">
                  Assignment Command Center
                </Badge>
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                Editorial Control Room
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">
                Assignments
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-stone-600 sm:text-base">
                Scan which assignments are live, how many submissions have arrived, and where lecturer review is still waiting.
              </p>
            </div>

            <Link href="/dashboard/assignments/new">
              <Button className="h-11 rounded-xl bg-stone-950 px-5 text-white hover:bg-stone-800">
                <Plus className="size-4" />
                Create Assignment
              </Button>
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-[24px] border border-white/70 bg-white/80 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                <Sparkles className="size-3.5" />
                Total Assignments
              </div>
              <p className="mt-3 text-2xl font-semibold tracking-tight text-stone-950">
                {totalAssignments}
              </p>
            </div>
            <div className="rounded-[24px] border border-white/70 bg-white/80 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                <CalendarClock className="size-3.5" />
                Active Now
              </div>
              <p className="mt-3 text-2xl font-semibold tracking-tight text-stone-950">
                {activeAssignments}
              </p>
            </div>
            <div className="rounded-[24px] border border-white/70 bg-white/80 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                <Users className="size-3.5" />
                Total Submissions
              </div>
              <p className="mt-3 text-2xl font-semibold tracking-tight text-stone-950">
                {totalSubmissions}
              </p>
            </div>
            <div className="rounded-[24px] border border-white/70 bg-white/80 p-4 backdrop-blur-sm">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                <ClipboardCheck className="size-3.5" />
                Pending Review
              </div>
              <p className="mt-3 text-2xl font-semibold tracking-tight text-stone-950">
                {pendingReview}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-[28px] border border-black/8 bg-white p-5 shadow-[0_16px_30px_rgba(10,10,10,0.04)] sm:flex-row sm:items-center sm:p-6">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
          <Input
            placeholder="Search assignments..."
            className="h-12 rounded-full border-stone-200 bg-stone-50 pl-11 shadow-none focus:border-stone-400"
          />
        </div>
        <Button
          variant="outline"
          className="h-12 rounded-full border-stone-200 bg-white px-5 text-stone-600 hover:bg-stone-50 hover:text-stone-950"
        >
          <Filter className="size-4" />
          Filters
        </Button>
      </div>

      <div className="space-y-4">
        {assignments.length === 0 ? (
          <div className="rounded-[32px] border border-dashed border-stone-300 bg-white px-6 py-14 text-center shadow-[0_16px_30px_rgba(10,10,10,0.04)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
              Empty Pipeline
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">
              No assignments yet
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-stone-500">
              Start by creating your first assignment and the review workspace will grow from there.
            </p>
            <Link href="/dashboard/assignments/new" className="mt-6 inline-flex">
              <Button className="h-11 rounded-xl bg-stone-950 px-5 text-white hover:bg-stone-800">
                <Plus className="size-4" />
                Create first assignment
              </Button>
            </Link>
          </div>
        ) : (
          assignments.map((assignment) => (
            <Link key={assignment.id} href={`/dashboard/assignments/${assignment.id}`}>
              <div className="group rounded-[30px] border border-black/8 bg-white p-5 shadow-[0_16px_30px_rgba(10,10,10,0.04)] transition-all hover:-translate-y-0.5 hover:shadow-[0_24px_50px_rgba(10,10,10,0.08)] sm:p-6">
                <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <Badge
                        variant="outline"
                        className={
                          assignment.status === "Active"
                            ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border-stone-200 bg-stone-100 text-stone-600"
                        }
                      >
                        {assignment.status}
                      </Badge>
                      <Badge variant="outline" className="border-stone-200 bg-stone-50 text-stone-700">
                        {assignment.course}
                      </Badge>
                    </div>
                    <h2 className="text-xl font-semibold tracking-tight text-stone-950 sm:text-2xl">
                      {assignment.title}
                    </h2>
                    <p className="mt-2 text-sm text-stone-500">
                      Due {assignment.dueDate}
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3 xl:min-w-[430px]">
                    <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-stone-400">
                        Submissions
                      </p>
                      <p className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">
                        {assignment.submissions}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-stone-400">
                        Graded
                      </p>
                      <p className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">
                        {assignment.graded}
                      </p>
                    </div>
                    <div className="rounded-2xl border border-stone-200 bg-stone-950 px-4 py-3 text-white">
                      <p className="text-[11px] uppercase tracking-[0.18em] text-white/60">
                        Avg Score
                      </p>
                      <p className="mt-2 text-2xl font-semibold tracking-tight">
                        {assignment.avgScore ?? "-"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-stone-100 pt-4 text-sm">
                  <p className="text-stone-500">
                    {assignment.submissions - assignment.graded > 0
                      ? `${assignment.submissions - assignment.graded} submissions still need review`
                      : "All current submissions have been graded"}
                  </p>
                  <span className="inline-flex items-center gap-2 font-semibold text-stone-950">
                    Open workspace
                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}
