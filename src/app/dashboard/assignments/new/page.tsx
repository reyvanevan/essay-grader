"use client";

import { useState, useTransition } from "react";
import { format } from "date-fns";
import {
  ArrowLeft,
  CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { createAssignmentAction } from "./actions";

type RubricDraft = {
  id: string;
  aspect: string;
  weight: number;
  description: string;
};

const steps = [
  { id: "basic", label: "Basic Info" },
  { id: "instructions", label: "Instructions" },
  { id: "rubric", label: "Rubric" },
  { id: "review", label: "Review" },
] as const;

const stepGuidance = [
  "Set the assignment identity and due date.",
  "Write clear instructions so students know exactly what to submit.",
  "Define rubric aspects and make sure total weight equals 100%.",
  "Review the draft one last time before publishing.",
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

  const currentStep = steps[stepIndex];
  const currentGuidance = stepGuidance[stepIndex];
  const isLastStep = stepIndex === steps.length - 1;
  const totalWeight = rubrics.reduce((sum, rubric) => sum + Number(rubric.weight || 0), 0);

  const addRubric = () => {
    setRubrics((current) => [
      ...current,
      { id: crypto.randomUUID(), aspect: "", weight: 10, description: "" },
    ]);
  };

  const removeRubric = (id: string) => {
    setRubrics((current) => current.filter((rubric) => rubric.id !== id));
  };

  const updateRubric = (
    id: string,
    field: keyof Omit<RubricDraft, "id">,
    value: string | number
  ) => {
    setRubrics((current) =>
      current.map((rubric) => (rubric.id === id ? { ...rubric, [field]: value } : rubric))
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
    window.scrollTo({ top: 0, behavior: "smooth" });
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
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 pb-8 font-sans">
      <section className="rounded-[20px] border border-black/8 bg-white px-4 py-4 shadow-sm sm:px-6 sm:py-5">
        <Link
          href="/dashboard/assignments"
          className="inline-flex w-fit items-center gap-2 text-xs font-medium text-stone-500 transition-colors hover:text-stone-950"
        >
          <ArrowLeft className="size-4" />
          Back to Assignments
        </Link>

        <div className="mt-4 flex flex-col items-center text-center">
          <p className="text-xs font-medium text-stone-500">
            Step {stepIndex + 1} of {steps.length}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-stone-950 sm:text-[2rem]">
            {currentStep.label}
          </h1>
          <p className="mt-1 max-w-xl text-sm leading-relaxed text-stone-500">
            {currentGuidance}
          </p>
        </div>

        <div className="mt-4 grid grid-cols-4 gap-2 sm:gap-3">
          {steps.map((step, index) => (
            <div key={step.id} className="space-y-1.5">
              <div
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index < stepIndex
                    ? "bg-stone-900"
                    : index === stepIndex
                      ? "bg-stone-900 shadow-[0_0_0_2px_rgba(28,25,23,0.16)]"
                      : "bg-stone-200"
                }`}
                aria-current={index === stepIndex ? "step" : undefined}
              />
              <p
                className={`text-center text-[11px] ${
                  index === stepIndex ? "font-semibold text-stone-950" : "text-stone-500"
                }`}
              >
                <span className="sm:hidden">{index + 1}</span>
                <span className="hidden sm:inline">{step.label}</span>
              </p>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-[16px] border border-stone-200 bg-white px-4 py-5 sm:px-5">
          {stepIndex === 0 ? (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-stone-950">
                  Name the assignment
                </h2>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Assignment Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  placeholder="e.g. Midterm: Big-O Notation"
                  className="h-10 rounded-lg border-stone-200 bg-stone-50"
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
                    className="h-10 rounded-lg border-stone-200 bg-stone-50"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Due Date</Label>
                  <Popover>
                    <PopoverTrigger
                      render={
                        <Button
                          variant="outline"
                          className="h-10 w-full justify-start rounded-lg border-stone-200 bg-stone-50 text-left font-normal hover:bg-stone-100"
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
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-stone-950">
                  Write the student brief
                </h2>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Instructions for Students</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Write the problem statement or instructions here..."
                  className="min-h-[160px] rounded-xl border-stone-200 bg-stone-50 sm:min-h-[220px]"
                />
              </div>
            </div>
          ) : null}

          {stepIndex === 2 ? (
            <div className="space-y-5">
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-xl font-semibold tracking-tight text-stone-950">
                    Define how the work is graded
                  </h2>
                </div>
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

              <div className="space-y-3">
                {rubrics.map((rubric, index) => (
                  <div key={rubric.id} className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                      <p className="text-sm font-medium text-stone-950">Aspect {index + 1}</p>
                      {rubrics.length > 1 ? (
                        <button
                          type="button"
                          onClick={() => removeRubric(rubric.id)}
                          className="inline-flex size-8 items-center justify-center rounded-lg border border-stone-200 bg-white text-stone-500 transition-colors hover:text-rose-600"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      ) : null}
                    </div>

                    <div className="grid gap-3 sm:grid-cols-[1fr_108px]">
                      <div className="space-y-2">
                        <Label>Grading Aspect</Label>
                        <Input
                          value={rubric.aspect}
                          onChange={(event) => updateRubric(rubric.id, "aspect", event.target.value)}
                          placeholder="e.g. Code Efficiency"
                          className="h-10 rounded-lg border-stone-200 bg-white"
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
                            className="h-10 rounded-lg border-stone-200 bg-white pr-7 text-right"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-stone-400">
                            %
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 space-y-2">
                      <Label>Definition</Label>
                      <Textarea
                        value={rubric.description}
                        onChange={(event) =>
                          updateRubric(rubric.id, "description", event.target.value)
                        }
                        placeholder="Tell the AI how to evaluate this aspect..."
                        className="min-h-24 rounded-xl border-stone-200 bg-white"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <Button
                type="button"
                variant="outline"
                onClick={addRubric}
                className="h-10 rounded-lg border-dashed border-stone-300 bg-white text-stone-600 hover:bg-stone-50 hover:text-stone-950"
              >
                <Plus className="size-4" />
                Add Rubric Aspect
              </Button>
            </div>
          ) : null}

          {stepIndex === 3 ? (
            <div className="space-y-5">
              <div>
                <h2 className="text-xl font-semibold tracking-tight text-stone-950">
                  Confirm before publishing
                </h2>
              </div>

              <div className="rounded-xl border border-stone-200 bg-stone-50 px-4 py-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="border-stone-200 bg-white text-stone-700">
                    {courseCode || "General Course"}
                  </Badge>
                  <Badge variant="outline" className="border-stone-200 bg-white text-stone-700">
                    {date ? format(date, "dd MMM yyyy") : "No deadline"}
                  </Badge>
                </div>
                <h3 className="mt-3 text-lg font-semibold text-stone-950">
                  {title || "Untitled Assignment"}
                </h3>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-stone-600">
                  {description || "No student instructions written yet."}
                </p>
              </div>

              <div className="space-y-2">
                {rubrics.map((rubric) => (
                  <div key={rubric.id} className="rounded-xl border border-stone-200 bg-white px-4 py-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium text-stone-950">
                          {rubric.aspect || "Untitled Aspect"}
                        </p>
                        <p className="mt-1 text-sm text-stone-600">
                          {rubric.description || "No rubric definition provided."}
                        </p>
                      </div>
                      <span className="text-sm font-medium text-stone-500">{rubric.weight || 0}%</span>
                    </div>
                  </div>
                ))}
              </div>

              {submitError ? <p className="text-sm text-rose-600">{submitError}</p> : null}
            </div>
          ) : null}

          <div className="mt-6 border-t border-stone-100 pt-5">
            <div className="sticky bottom-0 z-10 -mx-4 border-t border-stone-100 bg-white/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-t-0 sm:bg-transparent sm:p-0">
              <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                <Button
                  variant="ghost"
                  onClick={() =>
                    stepIndex === 0 ? router.push("/dashboard/assignments") : moveStep("prev")
                  }
                  className="h-10 rounded-lg px-4 text-stone-600 hover:bg-stone-100 hover:text-stone-950"
                >
                  <ChevronLeft className="size-4" />
                  {stepIndex === 0 ? "Cancel" : "Previous"}
                </Button>

                <Button
                  onClick={() => (isLastStep ? handleSubmit() : moveStep("next"))}
                  disabled={isPending || !canAdvance()}
                  className="h-10 rounded-lg bg-stone-950 px-4 text-white hover:bg-stone-800"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Publishing...
                    </>
                  ) : isLastStep ? (
                    "Publish Assignment"
                  ) : (
                    <>
                      Continue
                      <ChevronRight className="size-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        <details className="mt-3 rounded-[14px] border border-stone-200 bg-stone-50/60 px-4 py-3 text-sm">
          <summary className="cursor-pointer font-medium text-stone-600">
            Draft Snapshot
          </summary>
          <div className="mt-3 space-y-3">
            <div>
              <p className="text-stone-400">Title</p>
              <p className="mt-1 font-medium text-stone-900">{title || "Waiting for title"}</p>
            </div>
            <div>
              <p className="text-stone-400">Instructions</p>
              <p className="mt-1 text-stone-600">
                {description
                  ? `${description.slice(0, 120)}${description.length > 120 ? "..." : ""}`
                  : "No instructions drafted yet"}
              </p>
            </div>
            <div>
              <p className="text-stone-400">Rubrics</p>
              <p className="mt-1 font-medium text-stone-900">
                {rubrics.length} aspects · {totalWeight}%
              </p>
            </div>
          </div>
        </details>
      </section>
    </div>
  );
}
