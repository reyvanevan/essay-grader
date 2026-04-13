"use client";

import { useMemo, useState } from "react";
import { SubmissionCreateForm } from "@/components/grading/submission-create-form";
import { SubmissionGradeCard } from "@/components/grading/submission-grade-card";

type RubricBreakdownItem = {
  aspect: string;
  weight: number;
  score: number;
  feedback: string;
  reasoning: string;
};

type SubmissionItem = {
  id: string;
  assignment_id: string;
  student_name: string;
  student_identifier: string;
  answer_text: string | null;
  status: string;
  created_at: string;
};

type GradeItem = {
  submission_id: string;
  ai_holistic_score: number | null;
  ai_holistic_feedback: string | null;
  ai_weighted_total: number | null;
  ai_rubric_breakdown: RubricBreakdownItem[] | null;
  final_score: number | null;
  final_feedback: string | null;
  is_overridden: boolean | null;
  override_note: string | null;
};

type SubmissionInboxProps = {
  assignmentId: string;
  submissions: SubmissionItem[];
  grades: GradeItem[];
};

export function SubmissionInbox({ assignmentId, submissions, grades }: SubmissionInboxProps) {
  const [optimisticSubmissions, setOptimisticSubmissions] = useState<SubmissionItem[]>([]);

  const gradeBySubmission = useMemo(
    () => new Map(grades.map((grade) => [grade.submission_id, grade])),
    [grades]
  );

  const mergedSubmissions = useMemo(() => {
    const byId = new Map<string, SubmissionItem>();
    for (const item of optimisticSubmissions) byId.set(item.id, item);
    for (const item of submissions) byId.set(item.id, item);

    return Array.from(byId.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
  }, [optimisticSubmissions, submissions]);

  const handleCreated = (submission: SubmissionItem) => {
    setOptimisticSubmissions((current) => {
      if (current.some((item) => item.id === submission.id)) {
        return current;
      }
      return [submission, ...current];
    });
  };

  if (mergedSubmissions.length === 0) {
    return (
      <>
        <SubmissionCreateForm assignmentId={assignmentId} onCreated={handleCreated} />
        <section className="rounded-[20px] border border-dashed border-stone-300 bg-white px-6 py-12 text-center shadow-sm">
          <p className="text-sm font-medium text-stone-700">No submissions yet</p>
          <p className="mt-2 text-sm text-stone-500">
            Use the utility panel above when you need a quick manual submission for testing.
          </p>
        </section>
      </>
    );
  }

  return (
    <>
      <SubmissionCreateForm assignmentId={assignmentId} onCreated={handleCreated} />
      <div className="space-y-3">
        {mergedSubmissions.map((submission) => {
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
                      ai_rubric_breakdown: grade.ai_rubric_breakdown,
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
    </>
  );
}
