import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { SubmissionWithGrade } from './data/schema'
import { SubmissionsTable } from './components/submissions-table'
import { submissionsColumns } from './components/submissions-columns'
import { NewSubmissionDialog } from './components/new-submission-dialog'

export default function Submissions() {
    const [submissions, setSubmissions] = useState<SubmissionWithGrade[]>([])
    const [loading, setLoading] = useState(true)

    async function fetchSubmissions() {
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
                .order('created_at', { ascending: false })

            if (error) throw error
            setSubmissions(data || [])
        } catch (error) {
            console.error('Error fetching submissions:', error)
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
