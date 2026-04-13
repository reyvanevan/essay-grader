"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
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

type SubmissionReviewListProps = {
  submissions: SubmissionItem[];
  grades: GradeItem[];
};

export function SubmissionReviewList({ submissions, grades }: SubmissionReviewListProps) {
  const [query, setQuery] = useState("");

  const gradeBySubmission = useMemo(
    () => new Map(grades.map((grade) => [grade.submission_id, grade])),
    [grades]
  );

  const filteredSubmissions = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) {
      return submissions;
    }

    return submissions.filter((submission) => {
      const textBlob = [
        submission.student_name,
        submission.student_identifier,
        submission.status,
        submission.answer_text || "",
      ]
        .join(" ")
        .toLowerCase();

      return textBlob.includes(keyword);
    });
  }, [query, submissions]);

  return (
    <section id="submission-inbox" className="space-y-3">
      <div className="rounded-[18px] border border-black/8 bg-white px-4 py-3 shadow-sm sm:px-5">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-stone-400" />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search by student, NIM, status, or answer keyword..."
            className="h-10 rounded-lg border-stone-200 bg-stone-50 pl-10 text-sm shadow-none focus:border-stone-400"
          />
        </div>
        <p className="mt-2 text-xs text-stone-500">
          Showing {filteredSubmissions.length} of {submissions.length} submissions
        </p>
      </div>

      {filteredSubmissions.length === 0 ? (
        <section className="rounded-[20px] border border-dashed border-stone-300 bg-white px-6 py-12 text-center shadow-sm">
          <p className="text-sm font-medium text-stone-700">No matching submissions</p>
          <p className="mt-2 text-sm text-stone-500">Try a different keyword.</p>
        </section>
      ) : (
        <div className="space-y-2">
          {filteredSubmissions.map((submission) => {
            const grade = gradeBySubmission.get(submission.id);

            return (
              <SubmissionGradeCard
                key={submission.id}
                submission={submission}
                grade={grade || null}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
