import { createFileRoute } from '@tanstack/react-router'
import Submissions from '@/features/submissions'

export const Route = createFileRoute('/_authenticated/submissions/')({
  component: Submissions,
})
