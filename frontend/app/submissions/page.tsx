"use client"

import { useEffect, useState } from "react"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { supabase } from "@/lib/supabase"

interface Submission {
    id: string
    student_name: string
    created_at: string
    status: string
    assignment_id: string // In real app, join with assignments table
    grades?: {
        ai_score: number
    }[]
}

export default function SubmissionsPage() {
    const [submissions, setSubmissions] = useState<Submission[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchSubmissions() {
            try {
                const { data, error } = await supabase
                    .from('submissions')
                    .select(`
            *,
            grades (
              ai_score
            )
          `)
                    .order('created_at', { ascending: false })

                if (error) throw error
                setSubmissions(data || [])
            } catch (error) {
                console.error('Error fetching submissions:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchSubmissions()
    }, [])

    if (loading) {
        return <div className="p-8">Loading...</div>
    }

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Submissions</h2>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Student Name</TableHead>
                            <TableHead>Submitted At</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Score</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {submissions.map((submission) => (
                            <TableRow key={submission.id}>
                                <TableCell className="font-medium">{submission.student_name}</TableCell>
                                <TableCell>{new Date(submission.created_at).toLocaleString()}</TableCell>
                                <TableCell>
                                    <Badge variant={submission.status === "graded" ? "default" : "secondary"}>
                                        {submission.status}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    {submission.grades && submission.grades.length > 0 ? (
                                        <span className="font-bold">{submission.grades[0].ai_score}</span>
                                    ) : (
                                        "-"
                                    )}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Link href={`/submissions/${submission.id}`}>
                                        <Button variant="outline" size="sm">
                                            View Details
                                        </Button>
                                    </Link>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
