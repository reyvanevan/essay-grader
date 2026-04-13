"use client";

import { useState, useTransition } from "react";
import { formatDistanceToNow } from "date-fns";
import { ChevronRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
  pending: "border-stone-200 bg-stone-100 text-stone-700",
  queued: "border-amber-200 bg-amber-50 text-amber-700",
  processing: "border-sky-200 bg-sky-50 text-sky-700",
  graded: "border-emerald-200 bg-emerald-50 text-emerald-700",
  failed: "border-rose-200 bg-rose-50 text-rose-700",
};

function truncateAnswer(answer: string | null, maxLength = 90) {
  if (!answer) return "No answer provided.";
  if (answer.length <= maxLength) return answer;
  return `${answer.slice(0, maxLength).trimEnd()}...`;
}

export function SubmissionGradeCard({ submission, grade }: SubmissionGradeCardProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isAnswerExpanded, setIsAnswerExpanded] = useState(false);
  const [overrideScore, setOverrideScore] = useState(
    grade?.final_score?.toString() || grade?.ai_weighted_total?.toString() || ""
  );
  const [overrideFeedback, setOverrideFeedback] = useState(grade?.final_feedback || "");
  const [overrideNote, setOverrideNote] = useState(grade?.override_note || "");
  const [error, setError] = useState<string | null>(null);

  const rubricBreakdown = grade?.ai_rubric_breakdown || [];
  const relativeTime = formatDistanceToNow(new Date(submission.created_at), { addSuffix: true });
  const fullAnswer = submission.answer_text || "No answer provided.";
  const shouldAllowExpand = fullAnswer.length > 1200;

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
    <Sheet>
      <div className="rounded-[16px] border border-black/8 bg-white shadow-sm transition-colors hover:bg-stone-50/70">
        <SheetTrigger
          render={
            <button type="button" className="w-full px-4 py-3 text-left sm:px-5" aria-label="Open submission review" />
          }
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-sm font-medium text-stone-950 sm:text-base">{submission.student_name}</h3>
                <Badge
                  variant="outline"
                  className={`text-[11px] ${statusStyles[submission.status] || statusStyles.pending}`}
                >
                  {submission.status}
                </Badge>
              </div>
              <p className="mt-1 text-sm text-stone-500">{submission.student_identifier}</p>
              <p className="mt-2 text-sm text-stone-600">{truncateAnswer(submission.answer_text)}</p>
            </div>

            <div className="flex shrink-0 items-center gap-3">
              <div className="text-right">
                <p className="text-[11px] uppercase tracking-[0.14em] text-stone-400">Final</p>
                <p className="mt-1 text-base font-semibold text-stone-950">
                  {grade?.final_score ?? grade?.ai_weighted_total ?? "-"}
                </p>
                <p className="text-xs text-stone-400">{relativeTime}</p>
              </div>
              <ChevronRight className="size-4 text-stone-400" />
            </div>
          </div>
        </SheetTrigger>
      </div>

      <SheetContent
        side="right"
        className="w-full overflow-hidden md:w-[52rem] md:max-w-none lg:w-[56rem]"
      >
        <SheetHeader className="px-5 pb-3 pt-5 sm:px-8 sm:pt-7">
          <SheetTitle>{submission.student_name}</SheetTitle>
          <SheetDescription>
            {submission.student_identifier} · {submission.status}
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-5 pb-6 sm:px-8 sm:pb-8">
          <div className="mx-auto max-w-3xl space-y-5">
          <div className="rounded-xl border border-stone-200 bg-stone-50 px-5 py-5">
            <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">Student Answer</p>
            <div className="relative mt-2">
              <p
                className={`whitespace-pre-wrap text-sm leading-relaxed text-stone-700 ${
                  shouldAllowExpand && !isAnswerExpanded ? "max-h-[19rem] overflow-hidden" : ""
                }`}
              >
                {fullAnswer}
              </p>

              {shouldAllowExpand && !isAnswerExpanded ? (
                <>
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-stone-50 via-stone-50/95 to-transparent" />
                  <div className="absolute inset-x-0 bottom-3 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setIsAnswerExpanded(true)}
                      className="rounded-full border border-stone-200 bg-white/95 px-3 py-1 text-xs font-medium text-stone-700 shadow-sm transition-colors hover:bg-white hover:text-stone-950"
                    >
                      Show more answer
                    </button>
                  </div>
                </>
              ) : null}
            </div>

            {shouldAllowExpand && isAnswerExpanded ? (
              <button
                type="button"
                onClick={() => setIsAnswerExpanded(false)}
                className="mt-3 text-sm font-medium text-stone-700 underline decoration-stone-300 underline-offset-4 transition-colors hover:text-stone-950"
              >
                Show less answer
              </button>
            ) : null}
          </div>

          {grade ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-stone-200 bg-white px-5 py-5">
                <Tabs defaultValue="holistic" className="gap-4">
                  <TabsList variant="line" className="w-full justify-start">
                    <TabsTrigger value="holistic">Holistic</TabsTrigger>
                    <TabsTrigger value="rubric">Rubric</TabsTrigger>
                  </TabsList>

                  <TabsContent value="holistic" className="space-y-3">
                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-3">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">AI Holistic</p>
                        <p className="mt-1 text-lg font-semibold text-stone-950">{grade.ai_holistic_score ?? "-"}</p>
                      </div>
                      <div className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-3">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">Weighted</p>
                        <p className="mt-1 text-lg font-semibold text-stone-950">{grade.ai_weighted_total ?? "-"}</p>
                      </div>
                      <div className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-3">
                        <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">Override</p>
                        <p className="mt-1 text-sm font-medium text-stone-700">
                          {grade.is_overridden ? "Lecturer adjusted" : "AI final"}
                        </p>
                      </div>
                    </div>

                    <div className="rounded-lg border border-stone-200 bg-stone-50 px-4 py-4">
                      <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">Feedback</p>
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
                          <p className="mt-2 text-xs leading-relaxed text-stone-500">Reasoning: {item.reasoning}</p>
                        </div>
                      ))
                    )}
                  </TabsContent>
                </Tabs>
              </div>

              <div className="rounded-xl border border-stone-200 bg-stone-50 px-5 py-5">
                <div className="mb-4">
                  <p className="text-[11px] uppercase tracking-[0.16em] text-stone-400">Lecturer Override</p>
                  <p className="mt-1 text-sm text-stone-500">Adjust the published result if needed.</p>
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
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-stone-300 bg-stone-50 px-4 py-4 text-sm text-stone-500">
              Grade is not available yet.
            </div>
          )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
