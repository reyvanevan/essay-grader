"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { format } from "date-fns";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";

export function CreateAssignmentDialog() {
    const [open, setOpen] = useState(false);
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

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger render={<Button className="h-12 px-6 rounded-full bg-gradient-to-b from-[#333] to-[#000] font-medium text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_4px_12px_rgba(0,0,0,0.15)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 border border-[#444] hover:from-[#444] hover:to-[#111] hover:border-[#666]">
                <Plus className="w-5 h-5" />
                <span>New Assignment</span>
            </Button>}>
            </DialogTrigger>

            <DialogContent className="max-w-2xl bg-white border-black/[0.08] shadow-2xl rounded-[32px] p-0 overflow-hidden font-sans">
                <div className="px-8 pt-8 pb-6 border-b border-black/[0.04]">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold tracking-tight text-[#111]">Create New Assignment</DialogTitle>
                        <DialogDescription className="text-gray-500 text-[15px]">
                            Define the assignment details and its AI grading rubric.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <div className="p-8 overflow-y-auto max-h-[60vh]">
                    <div className="flex flex-col gap-8">
                        {/* Section 1: Basic Info */}
                        <div className="space-y-5">
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
                                <Textarea id="description" placeholder="Write the problem statement or instructions here..." className="rounded-xl border-gray-200 focus:border-black focus:ring-1 focus:ring-black bg-gray-50/50 min-h-[100px]" />
                            </div>
                        </div>

                        {/* Section 2: AI Rubric Builder */}
                        <div className="space-y-5">
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

                                        <div className="grid grid-cols-4 gap-4 pr-6">
                                            <div className="col-span-3 space-y-2">
                                                <Label className="text-xs text-gray-500">Grading Aspect</Label>
                                                <Input value={rubric.aspect} onChange={(e) => {
                                                    const newRubrics = [...rubrics];
                                                    newRubrics[index].aspect = e.target.value;
                                                    setRubrics(newRubrics);
                                                }} placeholder="e.g. Code Efficiency" className="h-10 rounded-lg text-sm" />
                                            </div>
                                            <div className="col-span-1 space-y-2">
                                                <Label className="text-xs text-gray-500">Weight (%)</Label>
                                                <Input type="number" value={rubric.weight} onChange={(e) => {
                                                    const newRubrics = [...rubrics];
                                                    newRubrics[index].weight = Number(e.target.value);
                                                    setRubrics(newRubrics);
                                                }} className="h-10 rounded-lg text-sm text-center font-semibold" />
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
                </div>

                <div className="px-8 py-6 border-t border-black/[0.04] bg-gray-50/50">
                    <DialogFooter className="flex items-center sm:justify-between w-full">
                        <Button variant="ghost" onClick={() => setOpen(false)} className="rounded-xl px-6 h-11 text-gray-600 hover:text-black hover:bg-black/5">
                            Cancel
                        </Button>
                        <Button disabled={totalWeight !== 100} className="rounded-xl px-8 h-11 bg-black text-white hover:bg-black/90 shadow-lg shadow-black/10 flex items-center gap-2">
                            Deploy AI Grader
                        </Button>
                    </DialogFooter>
                </div>
            </DialogContent>
        </Dialog>
    );
}
