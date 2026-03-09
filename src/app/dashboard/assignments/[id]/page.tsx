import { createClient } from "@/utils/supabase/server";
import { format } from "date-fns";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Clock, BookOpen, Users, BrainCircuit } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function AssignmentDetailPage({ params }: { params: { id: string } }) {
    // Await params in Next.js 15
    const resolvedParams = await params;
    const assignmentId = resolvedParams.id;
    const supabase = await createClient();

    // Fetch assignment data
    const { data: assignment, error: assignmentError } = await supabase
        .from("assignments")
        .select("*")
        .eq("id", assignmentId)
        .single();

    if (assignmentError || !assignment) {
        return notFound();
    }

    // Fetch rubrics
    const { data: rubrics, error: rubricsError } = await supabase
        .from("rubrics")
        .select("*")
        .eq("assignment_id", assignmentId)
        .order("created_at", { ascending: true });

    const totalWeight = (rubrics || []).reduce((sum, r) => sum + r.weight, 0);
    const dueDateFormatted = assignment.due_date ? format(new Date(assignment.due_date), "dd MMMM yyyy") : "No deadline set";
    const status = assignment.due_date && new Date(assignment.due_date) < new Date() ? "Closed" : "Active";

    return (
        <div className="flex flex-col gap-8 pb-12 font-sans max-w-6xl mx-auto w-full">
            {/* Navigation & Status Header */}
            <div className="flex flex-col gap-6">
                <Link href="/dashboard/assignments" className="text-gray-500 hover:text-black flex items-center gap-2 w-fit">
                    <ArrowLeft className="w-4 h-4" />
                    <span className="text-sm font-medium">Back to Assignments</span>
                </Link>

                <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 bg-white p-8 rounded-[32px] border border-black/[0.08] shadow-sm">
                    <div className="space-y-4 max-w-3xl">
                        <div className="flex items-center gap-3">
                            <span className={`px-4 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                {status}
                            </span>
                            <span className="text-sm font-medium text-gray-400 bg-gray-50 px-3 py-1 rounded-full">
                                {assignment.course_code || "General Course"}
                            </span>
                        </div>
                        <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-[#111] leading-tight">
                            {assignment.title}
                        </h1>
                        <p className="text-gray-600 text-base md:text-lg leading-relaxed whitespace-pre-wrap">
                            {assignment.description || "No instructions provided."}
                        </p>
                    </div>

                    <div className="flex flex-col gap-4 bg-gray-50 p-5 rounded-2xl min-w-[200px] shrink-0 border border-black/[0.02]">
                        <div className="space-y-1">
                            <p className="text-xs uppercase tracking-wider font-bold text-gray-400">Due Date</p>
                            <p className="font-semibold text-[#111] flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-500" />
                                {dueDateFormatted}
                            </p>
                        </div>
                        <div className="w-full h-[1px] bg-gray-200"></div>
                        <div className="space-y-1">
                            <p className="text-xs uppercase tracking-wider font-bold text-gray-400">Total Submissions</p>
                            <p className="font-semibold text-indigo-600 flex items-center gap-2 text-xl">
                                <Users className="w-5 h-5" />
                                0
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Content: Student Submissions Placeholder */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold tracking-tight">Student Submissions</h2>
                        <Button variant="outline" className="h-10 rounded-full text-sm">Download Report</Button>
                    </div>

                    <div className="bg-white border border-dashed border-gray-300 rounded-[32px] p-12 flex flex-col items-center justify-center text-center gap-4 min-h-[400px]">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                            <BookOpen className="w-8 h-8" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-[#111]">No submissions yet</h3>
                            <p className="text-gray-500 max-w-sm mt-1">When students submit their work, they will appear here along with their AI-graded scores.</p>
                        </div>
                        <Button className="mt-2 rounded-full px-6 bg-black text-white hover:bg-black/90">Add Dummy Submission</Button>
                    </div>
                </div>

                {/* Sidebar: AI Rubric Summary */}
                <div className="space-y-6">
                    <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold tracking-tight">AI Grading Rubric</h2>
                        <span className="text-xs font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full">{totalWeight}%</span>
                    </div>

                    <div className="bg-white border border-black/[0.08] shadow-sm rounded-3xl p-6 flex flex-col gap-6">
                        <div className="flex items-center gap-3 text-sm text-gray-500 font-medium pb-4 border-b border-gray-100">
                            <BrainCircuit className="w-5 h-5 text-indigo-500" />
                            <p>Llama 3.3 Engine will use these rules to evaluate essays.</p>
                        </div>

                        <div className="flex flex-col gap-4">
                            {rubrics?.map((rubric) => (
                                <div key={rubric.id} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <p className="font-semibold text-[#111] text-sm">{rubric.aspect}</p>
                                        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded-md">{rubric.weight}%</span>
                                    </div>
                                    <p className="text-xs text-gray-500 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100">
                                        {rubric.description}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
