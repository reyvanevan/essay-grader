import { useEffect, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { supabase } from '@/lib/supabase'
import { SubmissionWithGrade } from '@/features/submissions/data/schema'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, RefreshCw } from 'lucide-react'

export const Route = createFileRoute('/_authenticated/submissions/$id')({
  component: SubmissionDetail,
})

function SubmissionDetail() {
  const { id } = Route.useParams()
  const [submission, setSubmission] = useState<SubmissionWithGrade | null>(null)
  const [loading, setLoading] = useState(true)

  async function fetchSubmission() {
    try {
      const { data, error } = await supabase
        .from('submissions')
        .select(`
          *,
          grades (
            id,
            submission_id,
            ai_score,
            ai_feedback,
            ai_reasoning,
            created_at
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

  useEffect(() => {
    fetchSubmission()
  }, [id])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading submission...</div>
      </div>
    )
  }

  if (!submission) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-muted-foreground">Submission not found</p>
        <Link to="/submissions">
          <Button variant="outline">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Submissions
          </Button>
        </Link>
      </div>
    )
  }

  const grade = submission.grades && submission.grades.length > 0 ? submission.grades[0] : null

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/submissions">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Submission Detail</h2>
            <p className="text-muted-foreground">{submission.student_name}</p>
          </div>
        </div>
        <Button variant="outline" onClick={fetchSubmission}>
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Left Column: Question & Answer */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Student Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name</span>
                <span className="font-medium">{submission.student_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Status</span>
                <Badge variant={submission.status === 'graded' ? 'default' : 'secondary'}>
                  {submission.status === 'graded' ? 'Graded' : 'Pending'}
                </Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Submitted</span>
                <span className="font-medium">
                  {new Date(submission.created_at).toLocaleString('id-ID')}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Question & Answer</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2 text-sm">Question</h4>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                  {submission.question_text}
                </p>
              </div>
              <Separator />
              <div>
                <h4 className="font-semibold mb-2 text-sm">Student's Answer</h4>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                  {submission.answer_text}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: AI Grading */}
        <div className="space-y-6">
          {grade ? (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-primary">AI Grading Result</CardTitle>
                  <Badge
                    className={`text-lg px-4 py-1 ${grade.ai_score >= 70
                        ? 'bg-green-600 hover:bg-green-700'
                        : grade.ai_score >= 50
                          ? 'bg-yellow-600 hover:bg-yellow-700'
                          : 'bg-red-600 hover:bg-red-700'
                      }`}
                  >
                    Score: {grade.ai_score}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-2 text-sm">Feedback</h4>
                  <p className="text-sm bg-background p-4 rounded-md border">
                    {grade.ai_feedback}
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-sm">AI Reasoning</h4>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {grade.ai_reasoning}
                  </p>
                </div>
                <div className="text-xs text-muted-foreground">
                  Graded at: {new Date(grade.created_at).toLocaleString('id-ID')}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
                <RefreshCw className="h-8 w-8 text-muted-foreground animate-spin" />
                <p className="text-muted-foreground">AI is grading this submission...</p>
                <Button variant="outline" onClick={fetchSubmission}>
                  Check Status
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
