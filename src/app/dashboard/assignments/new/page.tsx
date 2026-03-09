"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { createAssignmentAction } from "./actions";

export default function CreateAssignmentPage() {
    const router = useRouter();
    const [date, setDate] = useState<Date>();

    // Rubric state management
    const [rubrics, setRubrics] = useState([
        { id: "1", aspect: "Understanding of Concept", weight: 40, description: "Student clearly explains the fundamental concepts." },
        { id: "2", aspect: "Code Quality / Structure", weight: 30, description: "Code is clean, well-organized, and follows best practices." }
    ]);

    const addRubric = () => {
        setRubrics([...rubrics, { id: Math.random().toString(), aspect: "", weight: 10, description: "" }]);
    };

    const removeRubric = (id: string) => {
        setRubrics(rubrics.filter(r => r.id !== id));
    };

    const totalWeight = rubrics.reduce((sum, r) => sum + Number(r.weight), 0);
    const [isPending, startTransition] = useTransition();

    const handleSubmit = () => {
        startTransition(async () => {
            const formData = new FormData();

            // Get inputs explicitly (could define standard React states for these too, but let's grab from inputs directly to speed up)
            const titleInput = document.getElementById("title") as HTMLInputElement;
            const courseInput = document.getElementById("course") as HTMLInputElement;
            const descInput = document.getElementById("description") as HTMLTextAreaElement;

            formData.append("title", titleInput?.value || "");
            formData.append("courseCode", courseInput?.value || "");
            formData.append("description", descInput?.value || "");
            if (date) {
                formData.append("dueDate", date.toISOString());
            }

            // Remove the temporary visual IDs before sending
            const sanitizedRubrics = rubrics.map(({ aspect, weight, description }) => ({ aspect, weight, description }));

            // Execute the action!
            const response = await createAssignmentAction(formData, sanitizedRubrics);

            if (response?.error) {
                // To keep it simple, we throw an alert or log. Add toast later for polished UI.
                alert("Error: " + response.error);
            }
        });
    };

    return (
        <div className="flex flex-col gap-8 pb-12 font-sans max-w-5xl mx-auto w-full">
            {/* Header Section */}
            <div className="flex flex-col gap-2">
                <Link href="/dashboard/assignments" className="text-gray-500 hover:text-black flex items-center gap-2 mb-2 w-fit">
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm font-medium">Back to Assignments</span>
                </Link>
                <h1 className="text-[32px] font-bold tracking-tight text-[#111]">Create New Assignment</h1>
                <p className="text-gray-500">Define the assignment details and its AI grading rubric.</p>
            </div>

            {/* Form Main Area */}
            <div className="bg-white border border-black/[0.08] shadow-sm rounded-[24px] p-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16">
                    {/* Section 1: Basic Info */}
                    <div className="space-y-6">
                        <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Basic Information</h3>

                        <div className="space-y-2">
                            <Label htmlFor="title" className="text-[#111] font-medium">Assignment Title *</Label>
                            <Input id="title" placeholder="e.g. Midterm: Big-O Notation" className="h-11 rounded-xl border-gray-200 focus:border-black focus:ring-1 focus:ring-black bg-gray-50/50" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="course" className="text-[#111] font-medium">Course Code</Label>
                                <Input id="course" placeholder="IF101" className="h-11 rounded-xl border-gray-200 focus:border-black focus:ring-1 focus:ring-black bg-gray-50/50" />
                            </div>
                            <div className="space-y-2 flex flex-col">
                                <Label className="text-[#111] font-medium">Due Date</Label>
                                <Popover>
                                    <PopoverTrigger render={<Button variant={"outline"} className={`h-11 rounded-xl border-gray-200 justify-start text-left font-normal bg-gray-50/50 hover:bg-gray-100 ${!date && "text-muted-foreground"}`}>
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {date ? format(date, "PPP") : <span>Pick a date</span>}
                                    </Button>}>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0" align="start">
                                        <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                                    </PopoverContent>
                                </Popover>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description" className="text-[#111] font-medium">Instructions for Students</Label>
                            <Textarea id="description" placeholder="Write the problem statement or instructions here..." className="rounded-xl border-gray-200 focus:border-black focus:ring-1 focus:ring-black bg-gray-50/50 min-h-[120px]" />
                        </div>
                    </div>

                    {/* Section 2: AI Rubric Builder */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">AI Grading Rubric</h3>
                            <span className={`text-xs font-bold px-3 py-1 rounded-full ${totalWeight === 100 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                Total Weight: {totalWeight}%
                            </span>
                        </div>

                        <div className="flex flex-col gap-4">
                            {rubrics.map((rubric, index) => (
                                <div key={rubric.id} className="p-5 rounded-2xl border border-gray-100 bg-white shadow-sm flex flex-col gap-4 relative group">
                                    <button onClick={() => removeRubric(rubric.id)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                                        <Trash2 className="w-4 h-4" />
                                    </button>

                                    <div className="flex flex-row gap-3 sm:gap-4 pt-1 sm:pr-8 items-start">
                                        <div className="flex-1 space-y-2">
                                            <Label className="text-[11px] sm:text-xs text-gray-500">Grading Aspect</Label>
                                            <Input value={rubric.aspect} onChange={(e) => {
                                                const newRubrics = [...rubrics];
                                                newRubrics[index].aspect = e.target.value;
                                                setRubrics(newRubrics);
                                            }} placeholder="e.g. Code Efficiency" className="h-10 rounded-lg text-sm w-full" />
                                        </div>
                                        <div className="w-24 sm:w-32 space-y-2">
                                            <Label className="text-[11px] sm:text-xs text-gray-500">Weight</Label>
                                            <div className="relative">
                                                <Input type="number" value={rubric.weight || ""} onChange={(e) => {
                                                    const newRubrics = [...rubrics];
                                                    newRubrics[index].weight = Number(e.target.value);
                                                    setRubrics(newRubrics);
                                                }} className="h-10 rounded-lg text-sm text-right pr-7 sm:pr-9 w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none font-semibold" />
                                                <span className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 text-xs sm:text-sm font-bold text-gray-400 select-none">%</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-xs text-gray-500">Definition (AI Instructions)</Label>
                                        <Textarea value={rubric.description} onChange={(e) => {
                                            const newRubrics = [...rubrics];
                                            newRubrics[index].description = e.target.value;
                                            setRubrics(newRubrics);
                                        }} placeholder="Tell the AI how to score this aspect..." className="h-16 text-sm resize-none rounded-lg" />
                                    </div>
                                </div>
                            ))}

                            <Button type="button" variant="outline" onClick={addRubric} className="h-12 border-dashed border-gray-300 text-gray-500 hover:text-[#111] hover:border-black/50 hover:bg-gray-50 rounded-2xl flex items-center justify-center gap-2">
                                <Plus className="w-4 h-4" />
                                Add Rubric Aspect
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="mt-10 pt-6 border-t border-black/[0.04] flex items-center justify-end gap-3">
                    <Button variant="ghost" onClick={() => router.push("/dashboard/assignments")} className="rounded-xl px-6 h-12 text-gray-600 hover:text-black hover:bg-black/5">
                        Cancel
                    </Button>
                    <Button disabled={totalWeight !== 100 || isPending} onClick={handleSubmit} className="rounded-xl px-8 h-12 bg-black text-white hover:bg-black/90 shadow-lg shadow-black/10 flex items-center gap-2 font-medium">
                        {isPending ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span>Deploying...</span>
                            </>
                        ) : (
                            <span>Deploy AI Grader & Assignment</span>
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
}
