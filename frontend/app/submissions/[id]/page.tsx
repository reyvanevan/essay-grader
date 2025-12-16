"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"
import { supabase } from "@/lib/supabase"
import { useParams } from "next/navigation"

interface SubmissionDetail {
    id: string
    student_name: string
    created_at: string
    status: string
    question_text: string
    answer_text: string
    grades?: {
        ai_score: number
        ai_feedback: string
        ai_reasoning: string
    }[]
}

export default function SubmissionDetailPage() {
    const params = useParams()
    const id = params?.id as string
    const [submission, setSubmission] = useState<SubmissionDetail | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchSubmission() {
            if (!id) return

            try {
                const { data, error } = await supabase
                    .from('submissions')
                    .select(`
            *,
            grades (
              ai_score,
              ai_feedback,
              ai_reasoning
            )
          `)
                    .eq('id', id)
                    .single()

                if (error) throw error
                setSubmission(data)
            } catch (error) {
                console.error('Error fetching submission:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchSubmission()
    }, [id])

    if (loading) {
        return <div className="p-8">Loading...</div>
    }

    if (!submission) {
        return <div className="p-8">Submission not found</div>
    }

    const grade = submission.grades && submission.grades.length > 0 ? submission.grades[0] : null

    return (
        <div className="p-8 space-y-8">
            <div className="flex items-center space-x-4">
                <Link href="/submissions">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h2 className="text-3xl font-bold tracking-tight">Submission Details</h2>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* Left Column: Student Answer */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Student Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Name:</span>
                                <span className="font-medium">{submission.student_name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Submitted:</span>
                                <span className="font-medium">{new Date(submission.created_at).toLocaleString()}</span>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="h-fit">
                        <CardHeader>
                            <CardTitle>Question & Answer</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <h4 className="font-semibold mb-2">Question:</h4>
                                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                                    {submission.question_text}
                                </p>
                            </div>
                            <Separator />
                            <div>
                                <h4 className="font-semibold mb-2">Student Answer:</h4>
                                <p className="text-sm leading-relaxed">
                                    {submission.answer_text}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: AI Grading */}
                <div className="space-y-6">
                    {grade ? (
                        <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/10">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-blue-700 dark:text-blue-400">AI Grading Result</CardTitle>
                                    <Badge className="bg-blue-600 hover:bg-blue-700 text-lg px-4 py-1">
                                        Score: {grade.ai_score}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div>
                                    <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Feedback:</h4>
                                    <p className="text-sm text-blue-800 dark:text-blue-200 bg-white dark:bg-slate-900 p-4 rounded-md border border-blue-100 dark:border-blue-900">
                                        {grade.ai_feedback}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Reasoning:</h4>
                                    <p className="text-sm text-blue-800 dark:text-blue-200">
                                        {grade.ai_reasoning}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <Card>
                            <CardContent className="p-6">
                                <p className="text-muted-foreground text-center">Not graded yet.</p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </div>
        </div>
    )
}
