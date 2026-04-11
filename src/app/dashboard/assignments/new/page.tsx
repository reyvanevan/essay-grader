"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import {
  ArrowLeft,
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FilePenLine,
  ListChecks,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { createAssignmentAction } from "./actions";

type RubricDraft = {
  id: string;
  aspect: string;
  weight: number;
  description: string;
};

const steps = [
  { id: "basic", label: "Basic Info", icon: ClipboardList },
  { id: "instructions", label: "Instructions", icon: FilePenLine },
  { id: "rubric", label: "Rubric", icon: ListChecks },
  { id: "review", label: "Review", icon: ChevronRight },
] as const;

export default function CreateAssignmentPage() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [date, setDate] = useState<Date>();
  const [title, setTitle] = useState("");
  const [courseCode, setCourseCode] = useState("");
  const [description, setDescription] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [rubrics, setRubrics] = useState<RubricDraft[]>([
    {
      id: "1",
      aspect: "Understanding of Concept",
      weight: 40,
      description: "Student clearly explains the fundamental concepts.",
    },
    {
      id: "2",
      aspect: "Code Quality / Structure",
      weight: 30,
      description: "Code is clean, well-organized, and follows best practices.",
    },
  ]);
  const [isPending, startTransition] = useTransition();

  const totalWeight = rubrics.reduce((sum, rubric) => sum + Number(rubric.weight || 0), 0);
  const currentStep = steps[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;

  const addRubric = () => {
    setRubrics((current) => [
      ...current,
      { id: crypto.randomUUID(), aspect: "", weight: 10, description: "" },
    ]);
  };

  const removeRubric = (id: string) => {
    setRubrics((current) => current.filter((rubric) => rubric.id !== id));
  };

  const updateRubric = (id: string, field: keyof Omit<RubricDraft, "id">, value: string | number) => {
    setRubrics((current) =>
      current.map((rubric) =>
        rubric.id === id ? { ...rubric, [field]: value } : rubric
      )
    );
  };

  const canAdvance = () => {
    if (stepIndex === 0) {
      return title.trim().length > 0;
    }

    if (stepIndex === 1) {
      return description.trim().length > 0;
    }

    if (stepIndex === 2) {
      return (
        rubrics.length > 0 &&
        rubrics.every(
          (rubric) =>
            rubric.aspect.trim().length > 0 &&
            rubric.description.trim().length > 0 &&
            Number(rubric.weight) > 0
        ) &&
        totalWeight === 100
      );
    }

    return true;
  };

  const moveStep = (direction: "next" | "prev") => {
    setSubmitError(null);
    setStepIndex((current) => {
      if (direction === "prev") return Math.max(0, current - 1);
      return Math.min(steps.length - 1, current + 1);
    });
  };

  const handleSubmit = () => {
    setSubmitError(null);

    startTransition(async () => {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("courseCode", courseCode);
      formData.append("description", description);

      if (date) {
        formData.append("dueDate", date.toISOString());
      }

      const sanitizedRubrics = rubrics.map(({ aspect, weight, description: rubricDescription }) => ({
        aspect,
        weight,
        description: rubricDescription,
      }));

      const response = await createAssignmentAction(formData, sanitizedRubrics);
      if (response?.error) {
        setSubmitError(response.error);
      }
    });
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 pb-12 font-sans">
      <div className="relative overflow-hidden rounded-[36px] border border-black/8 bg-[linear-gradient(135deg,#f4efe6_0%,#fffdf9_42%,#f7f1ea_100%)] p-5 shadow-[0_24px_80px_rgba(10,10,10,0.08)] sm:p-8">
        <div className="absolute -right-14 -top-16 h-52 w-52 rounded-full bg-[radial-gradient(circle,_rgba(188,160,120,0.18),_transparent_70%)]" />
        <div className="absolute -bottom-24 left-1/4 h-56 w-56 rounded-full bg-[radial-gradient(circle,_rgba(86,102,94,0.10),_transparent_72%)]" />

        <div className="relative z-10 flex flex-col gap-5">
          <Link
            href="/dashboard/assignments"
            className="inline-flex w-fit items-center gap-2 text-sm font-medium text-stone-500 transition-colors hover:text-stone-950"
          >
            <ArrowLeft className="size-4" />
            Back to Assignments
          </Link>

          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge variant="outline" className="border-stone-200 bg-white/80 text-stone-700">
                  Guided Builder
                </Badge>
                <Badge variant="outline" className="border-stone-200 bg-white/80 text-stone-700">
                  Mobile-first flow
                </Badge>
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                Assignment Setup
              </p>
              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-950 sm:text-4xl">
                Create New Assignment
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-stone-600 sm:text-base">
                Build the assignment in focused steps so instructions and rubrics feel intentional instead of overwhelming.
              </p>
            </div>

            <div className="rounded-[24px] border border-white/70 bg-white/80 px-4 py-3 backdrop-blur-sm">
              <p className="text-[11px] uppercase tracking-[0.18em] text-stone-400">Current step</p>
              <p className="mt-1 text-lg font-semibold tracking-tight text-stone-950">
                {stepIndex + 1}. {currentStep.label}
              </p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              const isActive = index === stepIndex;
              const isDone = index < stepIndex;

              return (
                <div
                  key={step.id}
                  className={`rounded-[24px] border p-4 backdrop-blur-sm ${
                    isActive
                      ? "border-stone-950 bg-stone-950 text-white"
                      : isDone
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-white/70 bg-white/80 text-stone-500"
                  }`}
                >
                  <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em]">
                    <StepIcon className="size-3.5" />
                    Step {index + 1}
                  </div>
                  <p className="mt-3 text-base font-semibold tracking-tight">{step.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1.3fr)_340px]">
        <div className="rounded-[32px] border border-black/8 bg-white p-5 shadow-[0_16px_30px_rgba(10,10,10,0.04)] sm:p-6">
          {stepIndex === 0 ? (
            <div className="space-y-6">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                  Basic Info
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">
                  Name the assignment and its context
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-stone-500">
                  Start with the essentials so the rest of the builder has a clear frame.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Assignment Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g. Midterm: Big-O Notation"
                  className="h-12 rounded-2xl bg-stone-50"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="course">Course Code</Label>
                  <Input
                    id="course"
                    value={courseCode}
                    onChange={(event) => setCourseCode(event.target.value)}
                    placeholder="IF101"
                    className="h-12 rounded-2xl bg-stone-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Popover>
                    <PopoverTrigger
                      render={
                        <Button
                          variant="outline"
                          className="h-12 w-full justify-start rounded-2xl border-stone-200 bg-stone-50 text-left font-normal hover:bg-stone-100"
                        />
                      }
                    >
                      <CalendarIcon className="mr-2 size-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          ) : null}

          {stepIndex === 1 ? (
            <div className="space-y-6">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                  Instructions
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">
                  Frame how students should respond
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-stone-500">
                  Write the assignment brief exactly as you want the student context to appear in the review workspace.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Instructions for Students</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Write the problem statement or instructions here..."
                  className="min-h-[260px] rounded-[24px] bg-stone-50"
                />
              </div>
            </div>
          ) : null}

          {stepIndex === 2 ? (
            <div className="space-y-6">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                    Rubric
                  </p>
                  <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">
                    Shape the grading logic
                  </h2>
                  <p className="mt-2 text-sm leading-relaxed text-stone-500">
                    Keep each aspect specific so the AI review stays grounded and explainable.
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={
                    totalWeight === 100
                      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                      : "border-amber-200 bg-amber-50 text-amber-700"
                  }
                >
                  Total Weight: {totalWeight}%
                </Badge>
              </div>

              <div className="space-y-4">
                {rubrics.map((rubric, index) => (
                  <div
                    key={rubric.id}
                    className="rounded-[24px] border border-stone-200 bg-stone-50 p-4 sm:p-5"
                  >
                    <div className="mb-4 flex items-center justify-between gap-3">
                      <p className="text-sm font-semibold tracking-tight text-stone-950">
                        Aspect {index + 1}
                      </p>
                      {rubrics.length > 1 ? (
                        <button
                          type="button"
                          onClick={() => removeRubric(rubric.id)}
                          className="inline-flex size-9 items-center justify-center rounded-xl border border-stone-200 bg-white text-stone-500 transition-colors hover:text-rose-600"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      ) : null}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-[1fr_120px]">
                      <div className="space-y-2">
                        <Label>Grading Aspect</Label>
                        <Input
                          value={rubric.aspect}
                          onChange={(event) =>
                            updateRubric(rubric.id, "aspect", event.target.value)
                          }
                          placeholder="e.g. Code Efficiency"
                          className="h-11 rounded-2xl bg-white"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Weight</Label>
                        <div className="relative">
                          <Input
                            type="number"
                            value={rubric.weight || ""}
                            onChange={(event) =>
                              updateRubric(rubric.id, "weight", Number(event.target.value))
                            }
                            className="h-11 rounded-2xl bg-white pr-8 text-right"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-stone-400">
                            %
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 space-y-2">
                      <Label>Definition (AI Instructions)</Label>
                      <Textarea
                        value={rubric.description}
                        onChange={(event) =>
                          updateRubric(rubric.id, "description", event.target.value)
                        }
                        placeholder="Tell the AI how to evaluate this aspect..."
                        className="min-h-28 rounded-[24px] bg-white"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={addRubric}
                className="h-12 rounded-2xl border-dashed border-stone-300 bg-stone-50 text-stone-600 hover:bg-stone-100 hover:text-stone-950"
              >
                <Plus className="size-4" />
                Add Rubric Aspect
              </Button>
            </div>
          ) : null}

          {stepIndex === 3 ? (
            <div className="space-y-6">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
                  Review
                </p>
                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-stone-950">
                  Check the assignment before publishing
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-stone-500">
                  This is the final pass to confirm structure, instruction tone, and grading balance.
                </p>
              </div>

              <div className="rounded-[24px] border border-stone-200 bg-stone-50 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="border-stone-200 bg-white text-stone-700">
                    {courseCode || "General Course"}
                  </Badge>
                  <Badge variant="outline" className="border-stone-200 bg-white text-stone-700">
                    {date ? format(date, "dd MMM yyyy") : "No deadline"}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={
                      totalWeight === 100
                        ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                        : "border-amber-200 bg-amber-50 text-amber-700"
                    }
                  >
                    {totalWeight}% total
                  </Badge>
                </div>

                <h3 className="mt-4 text-2xl font-semibold tracking-tight text-stone-950">
                  {title || "Untitled Assignment"}
                </h3>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-stone-600">
                  {description || "No student instructions written yet."}
                </p>
              </div>

              <div className="space-y-3">
                {rubrics.map((rubric) => (
                  <div key={rubric.id} className="rounded-[24px] border border-stone-200 bg-white p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-stone-950">{rubric.aspect || "Untitled Aspect"}</p>
                        <p className="mt-2 text-sm leading-relaxed text-stone-600">
                          {rubric.description || "No rubric definition provided."}
                        </p>
                      </div>
                      <Badge variant="outline" className="border-stone-200 bg-stone-50 text-stone-700">
                        {rubric.weight || 0}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              {submitError ? <p className="text-sm text-rose-600">{submitError}</p> : null}
            </div>
          ) : null}

          <div className="mt-8 flex flex-col gap-3 border-t border-stone-100 pt-6 sm:flex-row sm:justify-between">
            <Button
              variant="ghost"
              onClick={() => (stepIndex === 0 ? router.push("/dashboard/assignments") : moveStep("prev"))}
              className="h-11 rounded-xl px-4 text-stone-600 hover:bg-stone-100 hover:text-stone-950"
            >
              <ChevronLeft className="size-4" />
              {stepIndex === 0 ? "Cancel" : "Previous"}
            </Button>

            <Button
              onClick={() => (isLastStep ? handleSubmit() : moveStep("next"))}
              disabled={isPending || !canAdvance()}
              className="h-11 rounded-xl bg-stone-950 px-5 text-white hover:bg-stone-800"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Publishing...
                </>
              ) : isLastStep ? (
                "Deploy AI Grader & Assignment"
              ) : (
                <>
                  Continue
                  <ChevronRight className="size-4" />
                </>
              )}
            </Button>
          </div>
        </div>

        <aside className="space-y-5 xl:sticky xl:top-24">
          <div className="rounded-[28px] border border-black/8 bg-white p-5 shadow-[0_16px_30px_rgba(10,10,10,0.04)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
              Builder Guidance
            </p>
            <h3 className="mt-2 text-xl font-semibold tracking-tight text-stone-950">
              Keep each step focused
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-stone-500">
              This builder intentionally limits attention to one decision layer at a time so the rubric stays readable and balanced.
            </p>
          </div>

          <div className="rounded-[28px] border border-black/8 bg-white p-5 shadow-[0_16px_30px_rgba(10,10,10,0.04)]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-400">
              Draft Snapshot
            </p>
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl bg-stone-50 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-stone-400">Title</p>
                <p className="mt-2 text-sm font-medium text-stone-800">
                  {title || "Waiting for title"}
                </p>
              </div>
              <div className="rounded-2xl bg-stone-50 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-stone-400">Instructions</p>
                <p className="mt-2 text-sm text-stone-600">
                  {description
                    ? `${description.slice(0, 120)}${description.length > 120 ? "..." : ""}`
                    : "No instructions drafted yet"}
                </p>
              </div>
              <div className="rounded-2xl bg-stone-50 px-4 py-3">
                <p className="text-[11px] uppercase tracking-[0.18em] text-stone-400">Rubric Balance</p>
                <p className="mt-2 text-sm font-medium text-stone-800">
                  {rubrics.length} aspects · {totalWeight}% total
                </p>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
