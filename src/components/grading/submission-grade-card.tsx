"use client";

import { useState, useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  ChevronDown,
  FileText,
  Loader2,
  MessageSquareText,
  Sparkles,
  SquarePen,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
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
  pending: "bg-stone-100 text-stone-700 border-stone-200",
  queued: "bg-amber-100 text-amber-700 border-amber-200",
  processing: "bg-sky-100 text-sky-700 border-sky-200",
  graded: "bg-emerald-100 text-emerald-700 border-emerald-200",
  failed: "bg-rose-100 text-rose-700 border-rose-200",
};

function truncateAnswer(answer: string | null, maxLength = 150) {
  if (!answer) return "No answer provided.";
  if (answer.length <= maxLength) return answer;
  return `${answer.slice(0, maxLength).trimEnd()}...`;
}

export function SubmissionGradeCard({ submission, grade }: SubmissionGradeCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [overrideScore, setOverrideScore] = useState(
    grade?.final_score?.toString() || grade?.ai_weighted_total?.toString() || ""
  );
  const [overrideFeedback, setOverrideFeedback] = useState(grade?.final_feedback || "");
  const [overrideNote, setOverrideNote] = useState(grade?.override_note || "");
  const [error, setError] = useState<string | null>(null);

  const rubricBreakdown = grade?.ai_rubric_breakdown || [];
  const safeStatusClass = statusStyles[submission.status] || statusStyles.pending;
  const relativeTime = formatDistanceToNow(new Date(submission.created_at), {
    addSuffix: true,
  });

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
    <details className="group rounded-[28px] border border-black/8 bg-white shadow-[0_16px_30px_rgba(10,10,10,0.04)] open:shadow-[0_20px_50px_rgba(10,10,10,0.08)]">
      <summary className="list-none cursor-pointer p-5 sm:p-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-semibold tracking-tight text-[#111]">
                  {submission.student_name}
                </h3>
                <Badge
                  variant="outline"
                  className={`border px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.16em] ${safeStatusClass}`}
                >
                  {submission.status}
                </Badge>
              </div>
              <p className="text-sm text-stone-500">
                {submission.student_identifier} · {relativeTime}
              </p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <div className="rounded-2xl bg-stone-950 px-3 py-2 text-right text-white">
                <p className="text-[10px] uppercase tracking-[0.18em] text-white/60">Final</p>
                <p className="text-lg font-semibold leading-none">
                  {grade?.final_score ?? grade?.ai_weighted_total ?? "-"}
                </p>
              </div>
              <div className="flex size-10 items-center justify-center rounded-2xl border border-black/8 bg-stone-50 text-stone-500 transition-transform group-open:rotate-180">
                <ChevronDown className="size-4" />
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-[1.4fr_0.9fr]">
            <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-3">
              <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                <FileText className="size-3.5" />
                Answer Preview
              </div>
              <p className="text-sm leading-relaxed text-stone-700">
                {truncateAnswer(submission.answer_text)}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                  AI Holistic
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">
                  {grade?.ai_holistic_score ?? "-"}
                </p>
              </div>
              <div className="rounded-2xl border border-stone-200 bg-white px-4 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                  Override
                </p>
                <p className="mt-2 text-sm font-medium text-stone-700">
                  {grade?.is_overridden ? "Lecturer adjusted" : "AI final"}
                </p>
              </div>
            </div>
          </div>
        </div>
      </summary>

      <div className="border-t border-black/6 px-5 pb-5 pt-5 sm:px-6 sm:pb-6">
        <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-5">
            <div className="rounded-[24px] border border-stone-200 bg-stone-50/80 p-4 sm:p-5">
              <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                <MessageSquareText className="size-3.5" />
                Full Student Answer
              </div>
              <p className="whitespace-pre-wrap text-sm leading-relaxed text-stone-700">
                {submission.answer_text || "No answer provided."}
              </p>
            </div>

            {grade ? (
              <div className="rounded-[24px] border border-stone-200 bg-white p-4 sm:p-5">
                <Tabs defaultValue="holistic" className="w-full gap-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                        AI Review
                      </p>
                      <h4 className="mt-1 text-lg font-semibold tracking-tight text-stone-950">
                        Detailed evaluation workspace
                      </h4>
                    </div>
                    <TabsList variant="line" className="w-full justify-start sm:w-auto">
                      <TabsTrigger value="holistic">Holistic</TabsTrigger>
                      <TabsTrigger value="rubric">Rubric</TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="holistic" className="space-y-4">
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-2xl bg-stone-950 px-4 py-4 text-white">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-white/60">
                          AI Holistic Score
                        </p>
                        <p className="mt-2 text-3xl font-semibold tracking-tight">
                          {grade.ai_holistic_score ?? "-"}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-stone-400">
                          Weighted Total
                        </p>
                        <p className="mt-2 text-3xl font-semibold tracking-tight text-stone-950">
                          {grade.ai_weighted_total ?? "-"}
                        </p>
                      </div>
                      <div className="rounded-2xl border border-stone-200 bg-white px-4 py-4">
                        <p className="text-[11px] uppercase tracking-[0.18em] text-stone-400">
                          Final Mode
                        </p>
                        <p className="mt-2 text-sm font-medium text-stone-700">
                          {grade.is_overridden ? "Lecturer override active" : "AI result in use"}
                        </p>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4">
                      <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                        <Sparkles className="size-3.5" />
                        AI Feedback
                      </div>
                      <p className="text-sm leading-relaxed text-stone-700">
                        {grade.ai_holistic_feedback || "No AI feedback."}
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="rubric" className="space-y-3">
                    {rubricBreakdown.length === 0 ? (
                      <div className="rounded-2xl border border-dashed border-stone-300 bg-stone-50 px-4 py-5 text-sm text-stone-500">
                        No rubric breakdown returned yet.
                      </div>
                    ) : (
                      rubricBreakdown.map((item) => (
                        <div
                          key={item.aspect}
                          className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-stone-950">{item.aspect}</p>
                              <p className="mt-1 text-sm leading-relaxed text-stone-600">
                                {item.feedback}
                              </p>
                            </div>
                            <div className="shrink-0 rounded-xl bg-white px-3 py-2 text-right ring-1 ring-black/6">
                              <p className="text-[11px] uppercase tracking-[0.18em] text-stone-400">
                                Score
                              </p>
                              <p className="text-lg font-semibold text-stone-950">
                                {item.score}
                              </p>
                              <p className="text-[11px] text-stone-400">{item.weight}% weight</p>
                            </div>
                          </div>
                          <p className="mt-3 text-xs leading-relaxed text-stone-500">
                            Reasoning: {item.reasoning}
                          </p>
                        </div>
                      ))
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <div className="rounded-[24px] border border-dashed border-stone-300 bg-stone-50 px-4 py-6 text-sm text-stone-500">
                Grade is not available yet.
              </div>
            )}
          </div>

          {grade ? (
            <div className="rounded-[24px] border border-stone-200 bg-[#fffdf9] p-4 sm:p-5 xl:sticky xl:top-24 xl:self-start">
              <div className="mb-4">
                <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                  <SquarePen className="size-3.5" />
                  Lecturer Override
                </div>
                <h4 className="text-lg font-semibold tracking-tight text-stone-950">
                  Finalize this evaluation
                </h4>
                <p className="mt-1 text-sm leading-relaxed text-stone-500">
                  Adjust the final score only when you want the published result to differ from the AI recommendation.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`final-score-${submission.id}`}>Final Score (0-100)</Label>
                  <Input
                    id={`final-score-${submission.id}`}
                    type="number"
                    min={0}
                    max={100}
                    value={overrideScore}
                    onChange={(event) => setOverrideScore(event.target.value)}
                    className="h-11 rounded-xl bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`override-note-${submission.id}`}>Override Note</Label>
                  <Input
                    id={`override-note-${submission.id}`}
                    value={overrideNote}
                    onChange={(event) => setOverrideNote(event.target.value)}
                    placeholder="Reason for adjustment"
                    className="h-11 rounded-xl bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`final-feedback-${submission.id}`}>Final Feedback</Label>
                  <Textarea
                    id={`final-feedback-${submission.id}`}
                    className="min-h-28 rounded-2xl bg-white"
                    value={overrideFeedback}
                    onChange={(event) => setOverrideFeedback(event.target.value)}
                    placeholder="Optional final feedback for the student"
                  />
                </div>

                {error ? <p className="text-sm text-rose-600">{error}</p> : null}

                <Button
                  onClick={saveOverride}
                  disabled={isPending || !overrideScore}
                  className="h-11 w-full rounded-xl bg-stone-950 text-white hover:bg-stone-800"
                >
                  {isPending ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="size-4 animate-spin" />
                      Saving override...
                    </span>
                  ) : (
                    "Save Lecturer Decision"
                  )}
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </details>
  );
}
