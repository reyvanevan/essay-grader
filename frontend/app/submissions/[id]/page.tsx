import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export default function SubmissionDetailPage({ params }: { params: { id: string } }) {
    // Mock data - in real app fetch based on params.id
    const submission = {
        id: params.id,
        student: "Ahmad Fulan",
        assignment: "Sejarah Kemerdekaan",
        submittedAt: "2025-12-16 10:00",
        status: "graded",
        score: 85,
        question: "Jelaskan dampak Proklamasi Kemerdekaan Indonesia terhadap tatanan sosial masyarakat pada masa itu!",
        answer: "Proklamasi Kemerdekaan Indonesia membawa perubahan besar dalam tatanan sosial. Masyarakat yang sebelumnya terkotak-kotak berdasarkan kelas sosial buatan kolonial (Eropa, Timur Asing, Pribumi) mulai lebur menjadi satu identitas bangsa Indonesia. Semangat persamaan hak dan kewajiban mulai tumbuh, menghapuskan diskriminasi rasial yang sebelumnya sangat kental.",
        aiFeedback: "Jawaban sangat baik dan relevan. Mahasiswa mampu menjelaskan inti perubahan sosial dari sistem kasta kolonial menuju masyarakat yang egaliter. Poin mengenai penghapusan diskriminasi rasial sangat tepat.",
        aiReasoning: "Jawaban mencakup 2 poin kunci: penghapusan stratifikasi sosial kolonial dan munculnya identitas nasional yang setara. Struktur kalimat baik dan logis."
    }

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
                                <span className="font-medium">{submission.student}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Assignment:</span>
                                <span className="font-medium">{submission.assignment}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Submitted:</span>
                                <span className="font-medium">{submission.submittedAt}</span>
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
                                    {submission.question}
                                </p>
                            </div>
                            <Separator />
                            <div>
                                <h4 className="font-semibold mb-2">Student Answer:</h4>
                                <p className="text-sm leading-relaxed">
                                    {submission.answer}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Right Column: AI Grading */}
                <div className="space-y-6">
                    <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-950/10">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-blue-700 dark:text-blue-400">AI Grading Result</CardTitle>
                                <Badge className="bg-blue-600 hover:bg-blue-700 text-lg px-4 py-1">
                                    Score: {submission.score}
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div>
                                <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Feedback:</h4>
                                <p className="text-sm text-blue-800 dark:text-blue-200 bg-white dark:bg-slate-900 p-4 rounded-md border border-blue-100 dark:border-blue-900">
                                    {submission.aiFeedback}
                                </p>
                            </div>
                            <div>
                                <h4 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Reasoning:</h4>
                                <p className="text-sm text-blue-800 dark:text-blue-200">
                                    {submission.aiReasoning}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
