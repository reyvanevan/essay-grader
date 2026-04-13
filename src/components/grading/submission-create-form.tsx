"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

type SubmissionCreateFormProps = {
  assignmentId: string;
};

export function SubmissionCreateForm({ assignmentId }: SubmissionCreateFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isOpen, setIsOpen] = useState(false);
  const [studentName, setStudentName] = useState("");
  const [studentIdentifier, setStudentIdentifier] = useState("");
  const [answerText, setAnswerText] = useState("");
  const [error, setError] = useState<string | null>(null);

  const clearForm = () => {
    setStudentName("");
    setStudentIdentifier("");
    setAnswerText("");
  };

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

        clearForm();
        setIsOpen(false);
        router.refresh();
      } catch {
        setError("Failed to submit answer. Please try again.");
      }
    });
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <div className="rounded-[18px] border border-black/8 bg-white px-4 py-4 shadow-sm sm:px-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-stone-400">
              Manual Input
            </p>
            <p className="mt-1 text-sm text-stone-600">
              Add one submission quickly without leaving the review queue.
            </p>
          </div>
          <SheetTrigger
            render={
              <Button className="h-10 rounded-lg bg-stone-950 px-4 text-white hover:bg-stone-800" />
            }
          >
            <Plus className="size-4" />
            Add Submission
          </SheetTrigger>
        </div>
      </div>

      <SheetContent
        side="right"
        className="w-full overflow-y-auto data-[side=right]:md:w-[46rem] data-[side=right]:lg:w-[52rem] data-[side=right]:md:max-w-none"
      >
        <SheetHeader className="px-5 pb-3 pt-5 sm:px-8 sm:pt-7">
          <SheetTitle>Add Manual Submission</SheetTitle>
          <SheetDescription>
            This is for lecturer testing or manual entry before AI grading.
          </SheetDescription>
        </SheetHeader>

        <div className="mt-5 space-y-4 px-5 pb-6 sm:px-8 sm:pb-8">
          <div className="space-y-2">
            <Label htmlFor="studentName">Student Name</Label>
            <Input
              id="studentName"
              value={studentName}
              onChange={(event) => setStudentName(event.target.value)}
              placeholder="e.g. Budi Setiawan"
              className="h-11 rounded-lg bg-stone-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="studentIdentifier">Student Identifier</Label>
            <Input
              id="studentIdentifier"
              value={studentIdentifier}
              onChange={(event) => setStudentIdentifier(event.target.value)}
              placeholder="e.g. 230123456"
              className="h-11 rounded-lg bg-stone-50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="answerText">Student Answer</Label>
            <Textarea
              id="answerText"
              value={answerText}
              onChange={(event) => setAnswerText(event.target.value)}
              placeholder="Paste student essay answer here..."
              className="min-h-48 rounded-xl bg-stone-50"
            />
          </div>

          {error ? <p className="text-sm text-rose-600">{error}</p> : null}

          <div className="flex items-center justify-end gap-2 border-t border-stone-100 pt-4">
            <Button
              variant="ghost"
              className="h-10 rounded-lg"
              onClick={() => {
                setIsOpen(false);
                setError(null);
                clearForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreateSubmission}
              disabled={isPending || !studentName || !studentIdentifier || !answerText}
              className="h-10 rounded-lg bg-stone-950 px-4 text-white hover:bg-stone-800"
            >
              {isPending ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="size-4 animate-spin" />
                  Submitting...
                </span>
              ) : (
                "Submit and Grade"
              )}
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
