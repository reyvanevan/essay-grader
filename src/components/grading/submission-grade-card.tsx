"use client";

import { useState, useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import { ChevronDown, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { AILoader } from "@/components/ui/ai-loader";

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
  pending: "border-stone-200 bg-stone-100 text-stone-700",
  queued: "border-amber-200 bg-amber-50 text-amber-700",
  processing: "border-sky-200 bg-sky-50 text-sky-700",
  graded: "border-emerald-200 bg-emerald-50 text-emerald-700",
  failed: "border-rose-200 bg-rose-50 text-rose-700",
};

function truncateAnswer(answer: string | null, maxLength = 120) {
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
  const relativeTime = formatDistanceToNow(new Date(submission.created_at), { addSuffix: true });
  const isAIProcessing = !grade && ["pending", "queued", "processing"].includes(submission.status);

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
    <details className="group rounded-[18px] border border-black/8 bg-white shadow-sm open:border-stone-300">
      <summary className="list-none cursor-pointer px-5 py-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-sm font-medium text-stone-950 sm:text-base">
                {submission.student_name}
              </h3>
              <Badge
                variant="outline"
                className={`text-[11px] ${statusStyles[submission.status] || statusStyles.pending}`}
              >
                {submission.status}
              </Badge>
            </div>
            <p className="mt-1 text-sm text-stone-500">
              {submission.student_identifier} · {relativeTime}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-stone-600">
              {truncateAnswer(submission.answer_text)}
            </p>
          </div>

          <div className="flex shrink-0 items-start gap-3">
            <div className="text-right">
              <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">Final</p>
              <p className="mt-1 text-base font-semibold text-stone-950">
                {grade?.final_score ?? grade?.ai_weighted_total ?? "-"}
              </p>
            </div>
            <div className="flex size-8 items-center justify-center rounded-lg border border-stone-200 bg-stone-50 text-stone-500 transition-transform group-open:rotate-180">
              <ChevronDown className="size-4" />
            </div>
          </div>
        </div>
      </summary>

      <div className="border-t border-stone-100 px-5 py-4">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_260px]">
          <div className="space-y-4">
            <div className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-4">
              <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">Full Answer</p>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-stone-700">
                {submission.answer_text || "No answer provided."}
              </p>
            </div>

            {grade ? (
              <div className="rounded-xl border border-stone-200 bg-white px-4 py-4">
                <Tabs defaultValue="holistic" className="gap-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">
                        AI Review
                      </p>
                      <h4 className="mt-1 text-base font-medium text-stone-950">
                        Evaluation details
                      </h4>
                    </div>
                    <TabsList variant="line" className="w-full justify-start sm:w-auto">
                      <TabsTrigger value="holistic">Holistic</TabsTrigger>
                      <TabsTrigger value="rubric">Rubric</TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="holistic" className="space-y-3">
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-3">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">
                          AI Holistic
                        </p>
                        <p className="mt-1 text-lg font-semibold text-stone-950">
                          {grade.ai_holistic_score ?? "-"}
                        </p>
                      </div>
                      <div className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-3">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">
                          Weighted
                        </p>
                        <p className="mt-1 text-lg font-semibold text-stone-950">
                          {grade.ai_weighted_total ?? "-"}
                        </p>
                      </div>
                      <div className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-3">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">
                          Override
                        </p>
                        <p className="mt-1 text-sm font-medium text-stone-700">
                          {grade.is_overridden ? "Lecturer adjusted" : "AI final"}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-lg border border-stone-200 bg-stone-50 px-4 py-4">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">
                        Feedback
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-stone-700">
                        {grade.ai_holistic_feedback || "No AI feedback."}
                      </p>
                    </div>
                  </TabsContent>

                  <TabsContent value="rubric" className="space-y-2">
                    {rubricBreakdown.length === 0 ? (
                      <div className="rounded-lg border border-dashed border-stone-300 bg-stone-50 px-4 py-4 text-sm text-stone-500">
                        No rubric breakdown returned yet.
                      </div>
                    ) : (
                      rubricBreakdown.map((item) => (
                        <div key={item.aspect} className="rounded-lg border border-stone-200 bg-stone-50 px-4 py-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-sm font-medium text-stone-950">{item.aspect}</p>
                              <p className="mt-1 text-sm text-stone-600">{item.feedback}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-semibold text-stone-950">{item.score}</p>
                              <p className="text-xs text-stone-400">{item.weight}% weight</p>
                            </div>
                          </div>
                          <p className="mt-2 text-xs leading-relaxed text-stone-500">
                            Reasoning: {item.reasoning}
                          </p>
                        </div>
                      ))
                    )}
                  </TabsContent>
                </Tabs>
              </div>
            ) : (
              <AILoader text={isAIProcessing ? "AI grading in progress" : "Waiting for AI review"} />
            )}
          </div>

          {grade ? (
            <div className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-4 xl:sticky xl:top-24 xl:self-start">
              <div className="mb-4">
                <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">
                  Lecturer Override
                </p>
                <p className="mt-1 text-sm text-stone-500">
                  Adjust the published result if needed.
                </p>
              </div>

              <div className="space-y-3">
                <div className="space-y-2">
                  <Label htmlFor={`final-score-${submission.id}`}>Final Score</Label>
                  <Input
                    id={`final-score-${submission.id}`}
                    type="number"
                    min={0}
                    max={100}
                    value={overrideScore}
                    onChange={(event) => setOverrideScore(event.target.value)}
                    className="h-10 rounded-lg border-stone-200 bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`override-note-${submission.id}`}>Note</Label>
                  <Input
                    id={`override-note-${submission.id}`}
                    value={overrideNote}
                    onChange={(event) => setOverrideNote(event.target.value)}
                    placeholder="Reason for adjustment"
                    className="h-10 rounded-lg border-stone-200 bg-white"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`final-feedback-${submission.id}`}>Feedback</Label>
                  <Textarea
                    id={`final-feedback-${submission.id}`}
                    value={overrideFeedback}
                    onChange={(event) => setOverrideFeedback(event.target.value)}
                    placeholder="Optional final feedback"
                    className="min-h-24 rounded-xl border-stone-200 bg-white"
                  />
                </div>

                {error ? <p className="text-sm text-rose-600">{error}</p> : null}

                <Button
                  onClick={saveOverride}
                  disabled={isPending || !overrideScore}
                  className="h-10 w-full rounded-lg bg-stone-950 text-white hover:bg-stone-800"
                >
                  {isPending ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="size-4 animate-spin" />
                      Saving...
                    </span>
                  ) : (
                    "Save Decision"
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
