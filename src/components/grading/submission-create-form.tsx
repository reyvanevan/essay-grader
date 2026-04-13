"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type SubmissionItem = {
  id: string;
  assignment_id: string;
  student_name: string;
  student_identifier: string;
  answer_text: string | null;
  status: string;
  created_at: string;
};

type SubmissionCreateFormProps = {
  assignmentId: string;
  onOptimisticCreated?: (submission: SubmissionItem) => void;
  onConfirmed?: (tempId: string, submission: SubmissionItem) => void;
  onFailed?: (tempId: string) => void;
};

export function SubmissionCreateForm({
  assignmentId,
  onOptimisticCreated,
  onConfirmed,
  onFailed,
}: SubmissionCreateFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [studentName, setStudentName] = useState("");
  const [studentIdentifier, setStudentIdentifier] = useState("");
  const [answerText, setAnswerText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleCreateSubmission = () => {
    setError(null);

    const snapshotName = studentName.trim();
    const snapshotIdentifier = studentIdentifier.trim();
    const snapshotAnswer = answerText.trim();
    const tempId = `temp-${crypto.randomUUID()}`;
    const createdAt = new Date().toISOString();

    onOptimisticCreated?.({
      id: tempId,
      assignment_id: assignmentId,
      student_name: snapshotName,
      student_identifier: snapshotIdentifier,
      answer_text: snapshotAnswer,
      status: "queued",
      created_at: createdAt,
    });

    setStudentName("");
    setStudentIdentifier("");
    setAnswerText("");

    startTransition(async () => {
      try {
        const response = await fetch("/api/submissions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            assignmentId,
            studentName: snapshotName,
            studentIdentifier: snapshotIdentifier,
            answerText: snapshotAnswer,
          }),
        });

        const body = (await response.json()) as {
          error?: string;
          submission?: {
            id: string;
            assignment_id: string;
            status: string;
            created_at: string;
          };
        };

        if (!response.ok) {
          onFailed?.(tempId);
          setError(body.error || "Failed to create submission.");
          return;
        }

        if (body.submission) {
          onConfirmed?.(tempId, {
            ...body.submission,
            student_name: snapshotName,
            student_identifier: snapshotIdentifier,
            answer_text: snapshotAnswer,
          });
        }

        router.refresh();
      } catch {
        onFailed?.(tempId);
        setError("Failed to submit answer. Please try again.");
      }
    });
  };

  return (
    <details className="group rounded-[28px] border border-black/8 bg-white shadow-[0_12px_30px_rgba(10,10,10,0.04)]">
      <summary className="list-none cursor-pointer px-5 py-4 sm:px-6">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="mb-1 inline-flex items-center gap-2 rounded-full bg-stone-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
              <Plus className="size-3.5" />
              Manual Input Utility
            </div>
            <h3 className="text-lg font-semibold tracking-tight text-stone-950">
              Add a new submission
            </h3>
            <p className="mt-1 text-sm text-stone-500">
              Collapsed by default so the review inbox stays front and center on mobile.
            </p>
          </div>
          <div className="flex size-10 shrink-0 items-center justify-center rounded-2xl border border-black/8 bg-stone-50 text-stone-500 transition-transform group-open:rotate-180">
            <ChevronDown className="size-4" />
          </div>
        </div>
      </summary>

      <div className="border-t border-black/6 px-5 pb-5 pt-5 sm:px-6 sm:pb-6">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="studentName">Student Name</Label>
            <Input
              id="studentName"
              value={studentName}
              onChange={(event) => setStudentName(event.target.value)}
              placeholder="e.g. Budi Setiawan"
              className="h-11 rounded-xl bg-stone-50"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="studentIdentifier">Student Identifier</Label>
            <Input
              id="studentIdentifier"
              value={studentIdentifier}
              onChange={(event) => setStudentIdentifier(event.target.value)}
              placeholder="e.g. 230123456"
              className="h-11 rounded-xl bg-stone-50"
            />
          </div>
        </div>

        <div className="mt-4 space-y-2">
          <Label htmlFor="answerText">Student Answer</Label>
          <Textarea
            id="answerText"
            value={answerText}
            onChange={(event) => setAnswerText(event.target.value)}
            placeholder="Paste student essay answer here..."
            className="min-h-32 rounded-[24px] bg-stone-50"
          />
        </div>

        {error ? <p className="mt-4 text-sm text-rose-600">{error}</p> : null}

        <div className="mt-5 flex justify-end">
          <Button
            onClick={handleCreateSubmission}
            disabled={isPending || !studentName || !studentIdentifier || !answerText}
            className="h-11 rounded-xl bg-stone-950 px-5 text-white hover:bg-stone-800"
          >
            {isPending ? (
              <span className="inline-flex items-center gap-2">
                <Loader2 className="size-4 animate-spin" />
                Queuing...
              </span>
            ) : (
              "Submit and Grade"
            )}
          </Button>
        </div>
      </div>
    </details>
  );
}
