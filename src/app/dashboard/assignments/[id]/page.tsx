import { createClient } from "@/utils/supabase/server";
import { format } from "date-fns";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, Users, BrainCircuit } from "lucide-react";
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

  const totalWeight = (rubrics || []).reduce((sum, rubric) => sum + rubric.weight, 0);
  const dueDateFormatted = assignment.due_date
    ? format(new Date(assignment.due_date), "dd MMMM yyyy")
    : "No deadline set";
  const status =
    assignment.due_date && new Date(assignment.due_date) < new Date() ? "Closed" : "Active";

  return (
    <div className="flex flex-col gap-8 pb-12 font-sans max-w-6xl mx-auto w-full">
      <AssignmentRealtimeListener assignmentId={assignmentId} />
      <div className="flex flex-col gap-6">
        <Link
          href="/dashboard/assignments"
          className="text-gray-500 hover:text-black flex items-center gap-2 w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm font-medium">Back to Assignments</span>
        </Link>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 bg-white p-8 rounded-[32px] border border-black/[0.08] shadow-sm">
          <div className="space-y-4 max-w-3xl">
            <div className="flex items-center gap-3">
              <span
                className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                  status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"
                }`}
              >
                {status}
              </span>
              <span className="text-sm font-medium text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                {assignment.course_code || "General Course"}
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#111] leading-tight">
              {assignment.title}
            </h1>
            <p className="text-gray-600 text-base md:text-lg leading-relaxed whitespace-pre-wrap">
              {assignment.description || "No instructions provided."}
            </p>
          </div>

          <div className="flex flex-col gap-4 bg-gray-50 p-5 rounded-2xl min-w-[200px] shrink-0 border border-black/[0.02]">
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wider font-bold text-gray-400">Due Date</p>
              <p className="font-semibold text-[#111] flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-500" />
                {dueDateFormatted}
              </p>
            </div>
            <div className="w-full h-[1px] bg-gray-200"></div>
            <div className="space-y-1">
              <p className="text-xs uppercase tracking-wider font-bold text-gray-400">Total Submissions</p>
              <p className="font-semibold text-indigo-600 flex items-center gap-2 text-xl">
                <Users className="w-5 h-5" />
                {submissions?.length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <SubmissionCreateForm assignmentId={assignmentId} />

          <div className="space-y-4">
            <h2 className="text-xl font-bold tracking-tight">Student Submissions</h2>

            {!submissions || submissions.length === 0 ? (
              <div className="bg-white border border-dashed border-gray-300 rounded-[32px] p-10 text-center text-gray-500">
                No submissions yet. Create one using the form above.
              </div>
            ) : (
              submissions.map((submission) => {
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
              })
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight">AI Grading Rubric</h2>
            <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
              {totalWeight}%
            </span>
          </div>

          <div className="bg-white border border-black/[0.08] shadow-sm rounded-3xl p-6 flex flex-col gap-6">
            <div className="flex items-center gap-3 text-sm text-gray-500 font-medium pb-4 border-b border-gray-100">
              <BrainCircuit className="w-5 h-5 text-indigo-500" />
              <p>Middleware orchestration will apply these rules in each grading job.</p>
            </div>

            <div className="flex flex-col gap-4">
              {rubrics?.map((rubric) => (
                <div key={rubric.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-[#111] text-sm">{rubric.aspect}</p>
                    <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-md">
                      {rubric.weight}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
                    {rubric.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
