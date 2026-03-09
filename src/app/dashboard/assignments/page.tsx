import { Button } from "@/components/ui/button";
import { Plus, BookOpen, Clock, ArrowRight, MoreVertical, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { format } from "date-fns";

export default async function AssignmentsPage() {
    const supabase = await createClient();

    // Fetch assignments from Supabase, order by newest first
    const { data: rawAssignments, error } = await supabase
        .from("assignments")
        .select("*")
        .order("created_at", { ascending: false });

    // Map fetched assignments to the UI structure
    const assignments = (rawAssignments || []).map((dbItem) => ({
        id: dbItem.id,
        title: dbItem.title,
        course: dbItem.course_code || "General Course",
        submissions: 0,   // TODO: fetch actual count from submissions table later
        totalStudents: 0, // TODO: future feature
        status: dbItem.due_date && new Date(dbItem.due_date) < new Date() ? "Closed" : "Active",
        dueDate: dbItem.due_date ? format(new Date(dbItem.due_date), "dd MMM yyyy") : "No deadline",
        avgScore: 0       // TODO: fetch actual avg score from grades table later
    }));

    return (
        <div className="flex flex-col gap-8 pb-12 font-sans">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-[32px] font-bold tracking-tight text-[#111]">Assignments</h1>
                    <p className="text-gray-500">Manage your course assessment and grading rubrics.</p>
                </div>
                <Link href="/dashboard/assignments/new">
                    <Button className="h-12 px-6 rounded-full bg-gradient-to-b from-[#333] to-[#000] font-medium text-white shadow-[inset_0_1px_1px_rgba(255,255,255,0.3),0_4px_12px_rgba(0,0,0,0.15)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 border border-[#444] hover:from-[#444] hover:to-[#111] hover:border-[#666]">
                        <Plus className="w-5 h-5" />
                        <span>New Assignment</span>
                    </Button>
                </Link>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                        placeholder="Search assignments..."
                        className="pl-11 h-12 rounded-full border-black/[0.08] bg-white shadow-sm focus:border-black focus:ring-1 focus:ring-black transition-all outline-none"
                    />
                </div>
                <Button variant="outline" className="h-12 px-6 rounded-full border border-black/[0.08] bg-white flex items-center gap-2 text-gray-600 hover:text-black shadow-sm font-medium hover:bg-gray-50 transition-all">
                    <Filter className="w-4 h-4" />
                    Filters
                </Button>
            </div>

            {/* Assignments Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                <Link href="/dashboard/assignments/new">
                    <div className="group border-2 border-dashed border-gray-200 rounded-[32px] p-8 flex flex-col items-center justify-center gap-4 hover:border-black/30 hover:bg-gray-50/50 transition-all cursor-pointer h-full min-h-[250px]">
                        <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center group-hover:scale-110 group-hover:bg-black group-hover:text-white text-gray-400 transition-all">
                            <Plus className="w-6 h-6" />
                        </div>
                        <div className="text-center">
                            <p className="font-semibold text-gray-800 group-hover:text-black">Create New Assignment</p>
                            <p className="text-sm text-gray-500 text-balance mt-1">Set up a new task with AI grading rubric.</p>
                        </div>
                    </div>
                </Link>

                {assignments.map((assignment) => (
                    <div key={assignment.id} className="group bg-white p-7 rounded-[32px] border border-black/[0.03] shadow-[0_2px_10px_0_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_0_rgba(0,0,0,0.06)] hover:-translate-y-1 transition-all flex flex-col gap-6 relative overflow-hidden">
                        {/* Status Tag */}
                        <div className="flex items-center justify-between relative z-10">
                            <span className={`px-4 py-1.5 rounded-full text-[12px] font-bold uppercase tracking-wider ${assignment.status === 'Active' ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'
                                }`}>
                                {assignment.status}
                            </span>
                            <button className="p-2 hover:bg-gray-50 rounded-full transition-colors">
                                <MoreVertical className="w-5 h-5 text-gray-400" />
                            </button>
                        </div>

                        {/* Title & Info */}
                        <div className="relative z-10">
                            <h3 className="text-xl font-bold text-[#111] mb-1 group-hover:text-indigo-600 transition-colors line-clamp-1">{assignment.title}</h3>
                            <p className="text-gray-400 font-medium text-sm">{assignment.course}</p>
                        </div>

                        {/* Submissions Stats */}
                        <div className="relative z-10 flex items-center gap-6">
                            <div className="flex flex-col">
                                <span className="text-2xl font-bold tracking-tight text-[#111]">{assignment.submissions}<span className="text-gray-300 font-normal">/{assignment.totalStudents}</span></span>
                                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Submissions</span>
                            </div>
                            <div className="w-[1px] h-10 bg-gray-100"></div>
                            <div className="flex flex-col">
                                <span className="text-2xl font-bold tracking-tight text-indigo-600">{assignment.avgScore}<span className="text-gray-300 font-normal">%</span></span>
                                <span className="text-[11px] font-bold uppercase tracking-widest text-gray-400">Avg. Score</span>
                            </div>
                        </div>

                        {/* Footer Card */}
                        <div className="relative z-10 mt-2 flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2 text-gray-500 font-medium">
                                <Clock className="w-4 h-4" />
                                <span>Due {assignment.dueDate}</span>
                            </div>
                            <div className="flex items-center gap-1 text-black font-bold group-hover:gap-2 transition-all">
                                <span>View Results</span>
                                <ArrowRight className="w-4 h-4" />
                            </div>
                        </div>

                        {/* Decorative Background Accent */}
                        <div className="absolute -bottom-8 -right-8 w-32 h-32 bg-gray-50 rounded-full group-hover:scale-150 transition-transform duration-500 z-0"></div>
                    </div>
                ))}
            </div>
        </div>
    );
}
