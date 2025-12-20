import { useEffect, useState } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import { supabase } from '@/lib/supabase'
import { SubmissionWithGrade } from '@/features/submissions/data/schema'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { ArrowLeft, RefreshCw, Clock, User, FileText, CheckCircle2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { ThemeSwitch } from '@/components/theme-switch'

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
      <div className="flex items-center justify-center h-screen w-full">
        <RefreshCw className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!submission) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-4">
        <p className="text-muted-foreground">Submission not found</p>
        <Link to="/submissions">
          <Button variant="outline">Back to Submissions</Button>
        </Link>
      </div>
    )
  }

  const grade = submission.grades && submission.grades.length > 0 ? submission.grades[0] : null
  const studentInitials = submission.student_name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <>
      <Header fixed>
        <div className="flex items-center gap-4">
          <Link to="/submissions">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${submission.student_name}`} />
              <AvatarFallback>{studentInitials}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-sm font-medium leading-none">{submission.student_name}</span>
              <span className="text-xs text-muted-foreground">
                {new Date(submission.created_at).toLocaleDateString('en-GB', {
                  day: 'numeric',
                  month: 'short',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
            </div>
          </div>
        </div>
        <div className='ms-auto flex items-center space-x-4'>
          <ThemeSwitch />
          <ProfileDropdown />
        </div>
      </Header>

      <Main className="h-[calc(100vh-4rem)] p-0 md:p-6 lg:p-8">
        {/* Mobile View with Tabs */}
        <div className="md:hidden h-full flex flex-col">
          <div className="p-4 border-b bg-card flex justify-between items-center sticky top-0 z-10">
            <Badge variant={submission.status === 'graded' ? 'default' : 'secondary'} className="uppercase">
              {submission.status}
            </Badge>
            {grade && (
              <div className="text-2xl font-bold">
                {grade.ai_score}<span className="text-sm text-muted-foreground font-normal">/100</span>
              </div>
            )}
          </div>
          <Tabs defaultValue="submission" className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2 rounded-none border-b h-12">
              <TabsTrigger value="submission">Submission</TabsTrigger>
              <TabsTrigger value="feedback">Feedback</TabsTrigger>
            </TabsList>
            <TabsContent value="submission" className="flex-1 p-4 overflow-y-auto">
              <div className="space-y-6 pb-20">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" /> Question
                  </h3>
                  <div className="bg-muted/50 p-4 rounded-lg text-sm leading-relaxed">
                    {submission.question_text}
                  </div>
                </div>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <User className="h-4 w-4" /> Student Answer
                  </h3>
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    {submission.answer_text}
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="feedback" className="flex-1 p-4 overflow-y-auto">
              {grade ? (
                <div className="space-y-6 pb-20">
                  <Card className="border-primary/20 bg-primary/5">
                    <CardHeader>
                      <CardTitle className="text-primary flex items-center gap-2">
                        <CheckCircle2 className="h-5 w-5" /> AI Feedback
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="text-sm leading-relaxed">
                      {grade.ai_feedback}
                    </CardContent>
                  </Card>

                  <div className="space-y-2">
                    <h3 className="font-semibold text-sm">Reasoning</h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {grade.ai_reasoning}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 gap-4 text-muted-foreground">
                  <RefreshCw className="h-8 w-8 animate-spin" />
                  <p>Grading in progress...</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Desktop Split View */}
        <div className="hidden md:grid grid-cols-12 gap-6 h-full max-h-[calc(100vh-8rem)]">
          {/* Left Column: Context & Answer */}
          <Card className="col-span-7 lg:col-span-8 flex flex-col h-full border-0 shadow-none bg-transparent">
            <ScrollArea className="flex-1 pr-4">
              <div className="space-y-8 pb-10">
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Question</h3>
                  <p className="text-lg font-medium leading-relaxed text-foreground/90">
                    {submission.question_text}
                  </p>
                </div>
                <Separator />
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Student Answer</h3>
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <p className="whitespace-pre-wrap text-base leading-relaxed">
                      {submission.answer_text}
                    </p>
                  </div>
                </div>
              </div>
            </ScrollArea>
          </Card>

          {/* Right Column: Grading Panel */}
          <Card className="col-span-5 lg:col-span-4 h-full flex flex-col shadow-lg border-l rounded-none md:rounded-xl overflow-hidden">
            <div className="p-6 bg-muted/30 border-b flex items-center justify-between">
              <div>
                <h3 className="font-semibold">Grading Result</h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <Clock className="h-3 w-3" />
                  {grade ? 'Graded just now' : 'Pending...'}
                </p>
              </div>
              {grade && (
                <div className={`text-3xl font-bold ${grade.ai_score >= 70 ? 'text-green-600' : 'text-yellow-600'}`}>
                  {grade.ai_score}
                </div>
              )}
            </div>
            {grade ? (
              <ScrollArea className="flex-1 p-6">
                <div className="space-y-6">
                  <div className="p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-100 dark:border-blue-900/50">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2 text-sm flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4" /> Feedback
                    </h4>
                    <p className="text-sm text-blue-800 dark:text-blue-200 leading-relaxed">
                      {grade.ai_feedback}
                    </p>
                  </div>
                  <Separator />
                  <div>
                    <h4 className="font-medium text-sm mb-2 text-muted-foreground">Reasoning</h4>
                    <p className="text-xs text-muted-foreground leading-relaxed bg-muted p-3 rounded-md">
                      {grade.ai_reasoning}
                    </p>
                  </div>
                </div>
              </ScrollArea>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center gap-4">
                <div className="h-16 w-16 bg-muted rounded-full flex items-center justify-center animate-pulse">
                  <RefreshCw className="h-8 w-8 text-muted-foreground animate-spin" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-medium">AI is grading...</h3>
                  <p className="text-sm text-muted-foreground">Usually takes 10-20 seconds.</p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchSubmission}>
                  Check Again
                </Button>
              </div>
            )}
          </Card>
        </div>
      </Main>
    </>
  )
}
