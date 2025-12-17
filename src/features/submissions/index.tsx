import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { SubmissionWithGrade } from './data/schema'
import { SubmissionsTable } from './components/submissions-table'
import { submissionsColumns } from './components/submissions-columns'
import { NewSubmissionDialog } from './components/new-submission-dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'

export default function Submissions() {
    const [submissions, setSubmissions] = useState<SubmissionWithGrade[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    async function fetchSubmissions() {
        try {
            setError(null)
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
                .order('created_at', { ascending: false })

            if (error) throw error
            setSubmissions(data || [])
        } catch (err) {
            console.error('Error fetching submissions:', err)
            setError('Failed to load submissions. Please check your Supabase credentials in .env file.')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchSubmissions()
    }, [])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-muted-foreground">Loading submissions...</div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="p-4">
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            </div>
        )
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight">Submissions</h2>
                    <p className="text-muted-foreground">
                        View and manage student essay submissions
                    </p>
                </div>
                <NewSubmissionDialog onSuccess={fetchSubmissions} />
            </div>

            <SubmissionsTable columns={submissionsColumns} data={submissions} />
        </div>
    )
}
