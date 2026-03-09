"use client";

import { Button } from "@/components/ui/button";
import { Plus, BookOpen, Users, Clock, ArrowRight, MoreVertical, Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { CreateAssignmentDialog } from "./components/create-assignment-dialog";

const mockAssignments = [
    {
        id: "1",
        title: "Ujian Tengah Semester: Dasar Algoritma",
        course: "Informatika - Semester 1",
        submissions: 42,
        totalStudents: 45,
        status: "Active",
        dueDate: "15 Mar 2026",
        avgScore: 78
    },
    {
        id: "2",
        title: "Analisis Kompleksitas Waktu",
        course: "Struktur Data",
        submissions: 38,
        totalStudents: 40,
        status: "Active",
        dueDate: "12 Mar 2026",
        avgScore: 82
    },
    {
        id: "3",
        title: "Implementasi Linked List",
        course: "Struktur Data",
        submissions: 40,
        totalStudents: 40,
        status: "Closed",
        dueDate: "01 Mar 2026",
        avgScore: 85
    }
];

export default function AssignmentsPage() {
    return (
        <div className="flex flex-col gap-8 pb-12 font-sans">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-[32px] font-bold tracking-tight text-[#111]">Assignments</h1>
                    <p className="text-gray-500">Manage your course assessment and grading rubrics.</p>
                </div>
                <CreateAssignmentDialog />
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
                {/* Create Card (Empty State Placeholder if single) */}
                <div className="group border-2 border-dashed border-gray-100 rounded-[32px] p-8 flex flex-col items-center justify-center gap-4 hover:border-black/10 hover:bg-gray-50/50 transition-all cursor-pointer">
                    <div className="w-14 h-14 rounded-full bg-gray-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Plus className="w-6 h-6 text-gray-400" />
                    </div>
                    <div className="text-center">
                        <p className="font-semibold text-gray-600">Create New</p>
                        <p className="text-sm text-gray-400 text-balance">Add a new assignment for your students.</p>
                    </div>
                </div>

                {mockAssignments.map((assignment) => (
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
