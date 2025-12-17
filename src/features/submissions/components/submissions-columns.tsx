import { ColumnDef } from '@tanstack/react-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Eye } from 'lucide-react'
import { SubmissionWithGrade } from '../data/schema'
import { Link } from '@tanstack/react-router'

export const submissionsColumns: ColumnDef<SubmissionWithGrade>[] = [
    {
        accessorKey: 'student_name',
        header: 'Student Name',
        cell: ({ row }) => (
            <span className="font-medium">{row.getValue('student_name')}</span>
        ),
    },
    {
        accessorKey: 'question_text',
        header: 'Question',
        cell: ({ row }) => {
            const question = row.getValue('question_text') as string
            return (
                <span className="text-muted-foreground truncate max-w-[200px] block">
                    {question.length > 50 ? `${question.slice(0, 50)}...` : question}
                </span>
            )
        },
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => {
            const status = row.getValue('status') as string
            return (
                <Badge variant={status === 'graded' ? 'default' : 'secondary'}>
                    {status === 'graded' ? 'Graded' : 'Pending'}
                </Badge>
            )
        },
    },
    {
        id: 'score',
        header: 'Score',
        cell: ({ row }) => {
            const grades = row.original.grades
            if (grades && grades.length > 0) {
                const score = grades[0].ai_score
                return (
                    <span className={`font-bold ${score >= 70 ? 'text-green-600' : score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                        {score}
                    </span>
                )
            }
            return <span className="text-muted-foreground">-</span>
        },
    },
    {
        accessorKey: 'created_at',
        header: 'Submitted',
        cell: ({ row }) => {
            const date = new Date(row.getValue('created_at'))
            return <span className="text-muted-foreground">{date.toLocaleDateString('id-ID')}</span>
        },
    },
    {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
            <Link to={`/submissions/${row.original.id}`}>
                <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                </Button>
            </Link>
        ),
    },
]
