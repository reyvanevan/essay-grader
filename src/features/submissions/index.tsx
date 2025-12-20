import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { SubmissionWithGrade } from './data/schema'
import { SubmissionsTable } from './components/submissions-table'
import { submissionsColumns } from './components/submissions-columns'
import { NewSubmissionDialog } from './components/new-submission-dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { AlertCircle } from 'lucide-react'
import { Header } from '@/components/layout/header'
import { Main } from '@/components/layout/main'
import { ProfileDropdown } from '@/components/profile-dropdown'
import { Search } from '@/components/search'
import { ThemeSwitch } from '@/components/theme-switch'

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

    return (
        <>
            <Header fixed>
                <Search />
                <div className='ms-auto flex items-center space-x-4'>
                    <ThemeSwitch />
                    <ProfileDropdown />
                </div>
            </Header>

            <Main>
                <div className='mb-2 flex flex-wrap items-center justify-between gap-x-4 space-y-2'>
                    <div>
                        <h2 className='text-2xl font-bold tracking-tight'>Submissions</h2>
                        <p className='text-muted-foreground'>
                            View and manage student essay submissions
                        </p>
                    </div>
                    <NewSubmissionDialog onSuccess={fetchSubmissions} />
                </div>

                <div className='-mx-4 flex-1 overflow-auto px-4 py-1 lg:flex-row lg:space-x-12 lg:space-y-0'>
                    {loading ? (
                        <div className="flex items-center justify-center h-64">
                            <div className="text-muted-foreground">Loading submissions...</div>
                        </div>
                    ) : error ? (
                        <div className="p-4">
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Error</AlertTitle>
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        </div>
                    ) : (
                        <SubmissionsTable columns={submissionsColumns} data={submissions} />
                    )}
                </div>
            </Main>
        </>
    )
}
