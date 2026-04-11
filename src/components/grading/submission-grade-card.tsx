"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";

type RubricBreakdownItem = {
  aspect: string;
  weight: number;
  score: number;
  feedback: string;
  reasoning: string;
};

type SubmissionGradeCardProps = {
  submission: {
    id: string;
    student_name: string;
    student_identifier: string;
    answer_text: string | null;
    status: string;
    created_at: string;
  };
  grade: {
    ai_holistic_score: number | null;
    ai_holistic_feedback: string | null;
    ai_weighted_total: number | null;
    ai_rubric_breakdown: RubricBreakdownItem[] | null;
    final_score: number | null;
    final_feedback: string | null;
    is_overridden: boolean | null;
    override_note: string | null;
  } | null;
};

const statusStyles: Record<string, string> = {
  pending: "bg-gray-100 text-gray-600",
  queued: "bg-amber-100 text-amber-700",
  processing: "bg-blue-100 text-blue-700",
  graded: "bg-green-100 text-green-700",
  failed: "bg-red-100 text-red-700",
};

export function SubmissionGradeCard({ submission, grade }: SubmissionGradeCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [overrideScore, setOverrideScore] = useState(
    grade?.final_score?.toString() || grade?.ai_weighted_total?.toString() || ""
  );
  const [overrideFeedback, setOverrideFeedback] = useState(grade?.final_feedback || "");
  const [overrideNote, setOverrideNote] = useState(grade?.override_note || "");
  const [error, setError] = useState<string | null>(null);

  const safeStatusClass = statusStyles[submission.status] || "bg-gray-100 text-gray-600";

  const rubricBreakdown = useMemo(() => grade?.ai_rubric_breakdown || [], [grade]);

  const saveOverride = () => {
    setError(null);

    startTransition(async () => {
      try {
        const numericScore = Number(overrideScore);
        if (Number.isNaN(numericScore)) {
          setError("Final score must be a valid number.");
          return;
        }

        const response = await fetch(`/api/grades/${submission.id}/override`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            finalScore: numericScore,
            finalFeedback: overrideFeedback,
            overrideNote,
            overriddenBy: "lecturer",
          }),
        });

        const body = (await response.json()) as { error?: string };

        if (!response.ok) {
          setError(body.error || "Failed to save override.");
          return;
        }

        router.refresh();
      } catch {
        setError("Failed to save override.");
      }
    });
  };

  return (
    <div className="border border-black/[0.06] bg-white rounded-3xl p-6 space-y-5">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="space-y-1">
          <h4 className="text-lg font-semibold text-[#111]">{submission.student_name}</h4>
          <p className="text-sm text-gray-500">{submission.student_identifier}</p>
        </div>
        <div className="flex items-center gap-3">
          {grade?.final_score !== null && grade?.final_score !== undefined ? (
            <span className="text-sm font-bold px-3 py-1 rounded-full bg-indigo-100 text-indigo-700">
              Final: {grade.final_score}
            </span>
          ) : null}
          <span className={`text-xs uppercase tracking-wider font-bold px-3 py-1 rounded-full ${safeStatusClass}`}>
            {submission.status}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs uppercase tracking-wider text-gray-400 font-semibold">Student Answer</p>
        <p className="text-sm text-gray-700 whitespace-pre-wrap bg-gray-50 border border-gray-100 rounded-2xl p-4">
          {submission.answer_text || "No answer provided."}
        </p>
      </div>

      {grade ? (
        <Tabs defaultValue="holistic" className="w-full">
          <TabsList>
            <TabsTrigger value="holistic">Holistic</TabsTrigger>
            <TabsTrigger value="rubric">Rubric Breakdown</TabsTrigger>
          </TabsList>

          <TabsContent value="holistic" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500">AI Holistic Score</p>
                <p className="text-2xl font-bold text-[#111]">{grade.ai_holistic_score ?? "-"}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500">AI Weighted Total</p>
                <p className="text-2xl font-bold text-indigo-600">{grade.ai_weighted_total ?? "-"}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p className="text-xs text-gray-500">Override Status</p>
                <p className="text-sm font-semibold text-[#111]">
                  {grade.is_overridden ? "Overridden by lecturer" : "Using AI result"}
                </p>
              </div>
            </div>
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
              <p className="text-xs text-gray-500 mb-1">AI Feedback</p>
              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                {grade.ai_holistic_feedback || "No AI feedback."}
              </p>
            </div>
          </TabsContent>

          <TabsContent value="rubric" className="space-y-3">
            {rubricBreakdown.length === 0 ? (
              <div className="text-sm text-gray-500 bg-gray-50 border border-gray-100 rounded-xl p-4">
                No rubric breakdown returned yet.
              </div>
            ) : (
              rubricBreakdown.map((item) => (
                <div key={item.aspect} className="bg-gray-50 border border-gray-100 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-[#111]">{item.aspect}</p>
                    <p className="text-xs font-bold text-gray-500">
                      {item.score} / 100 ({item.weight}%)
                    </p>
                  </div>
                  <p className="text-sm text-gray-700">{item.feedback}</p>
                  <p className="text-xs text-gray-500">Reasoning: {item.reasoning}</p>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      ) : (
        <div className="text-sm text-gray-500 bg-gray-50 border border-gray-100 rounded-xl p-4">
          Grade is not available yet.
        </div>
      )}

      {grade ? (
        <div className="border-t border-gray-100 pt-5 space-y-4">
          <div>
            <h5 className="font-semibold text-[#111]">Lecturer Override</h5>
            <p className="text-sm text-gray-500">Optional: replace AI final score/feedback.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor={`final-score-${submission.id}`}>Final Score (0-100)</Label>
              <Input
                id={`final-score-${submission.id}`}
                type="number"
                min={0}
                max={100}
                value={overrideScore}
                onChange={(event) => setOverrideScore(event.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`override-note-${submission.id}`}>Override Note</Label>
              <Input
                id={`override-note-${submission.id}`}
                value={overrideNote}
                onChange={(event) => setOverrideNote(event.target.value)}
                placeholder="Reason for overriding"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor={`final-feedback-${submission.id}`}>Final Feedback</Label>
            <Textarea
              id={`final-feedback-${submission.id}`}
              className="min-h-20"
              value={overrideFeedback}
              onChange={(event) => setOverrideFeedback(event.target.value)}
              placeholder="Optional final feedback for student"
            />
          </div>

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <div className="flex justify-end">
            <Button onClick={saveOverride} disabled={isPending || !overrideScore}>
              {isPending ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </span>
              ) : (
                "Save Override"
              )}
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
