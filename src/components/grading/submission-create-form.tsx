"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type SubmissionCreateFormProps = {
  assignmentId: string;
};

export function SubmissionCreateForm({ assignmentId }: SubmissionCreateFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [studentName, setStudentName] = useState("");
  const [studentIdentifier, setStudentIdentifier] = useState("");
  const [answerText, setAnswerText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleCreateSubmission = () => {
    setError(null);

    startTransition(async () => {
      try {
        const response = await fetch("/api/submissions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            assignmentId,
            studentName,
            studentIdentifier,
            answerText,
          }),
        });

        const body = (await response.json()) as { error?: string };

        if (!response.ok) {
          setError(body.error || "Failed to create submission.");
          return;
        }

        setStudentName("");
        setStudentIdentifier("");
        setAnswerText("");
        router.refresh();
      } catch {
        setError("Failed to submit answer. Please try again.");
      }
    });
  };

  return (
    <div className="bg-white border border-black/[0.06] rounded-3xl p-6 flex flex-col gap-4">
      <div>
        <h3 className="text-lg font-semibold text-[#111]">Create Submission (Text-Only v1)</h3>
        <p className="text-sm text-gray-500">
          Submission will be queued automatically for LLM grading.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="studentName">Student Name</Label>
          <Input
            id="studentName"
            value={studentName}
            onChange={(event) => setStudentName(event.target.value)}
            placeholder="e.g. Budi Setiawan"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="studentIdentifier">Student Identifier</Label>
          <Input
            id="studentIdentifier"
            value={studentIdentifier}
            onChange={(event) => setStudentIdentifier(event.target.value)}
            placeholder="e.g. 230123456"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="answerText">Student Answer</Label>
        <Textarea
          id="answerText"
          value={answerText}
          onChange={(event) => setAnswerText(event.target.value)}
          placeholder="Paste student essay answer here..."
          className="min-h-28"
        />
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <div className="flex justify-end">
        <Button
          onClick={handleCreateSubmission}
          disabled={isPending || !studentName || !studentIdentifier || !answerText}
          className="rounded-xl"
        >
          {isPending ? (
            <span className="inline-flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              Submitting...
            </span>
          ) : (
            "Submit & Enqueue"
          )}
        </Button>
      </div>
    </div>
  );
}
