import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Plus, Loader2 } from 'lucide-react'
import { newSubmissionSchema, NewSubmissionData } from '../data/schema'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'

interface NewSubmissionDialogProps {
    onSuccess: () => void
}

export function NewSubmissionDialog({ onSuccess }: NewSubmissionDialogProps) {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    const form = useForm<NewSubmissionData>({
        resolver: zodResolver(newSubmissionSchema),
        defaultValues: {
            student_name: '',
            question_text: '',
            correct_answer: '',
            answer_text: '',
        },
    })

    async function onSubmit(data: NewSubmissionData) {
        setLoading(true)
        try {
            // 1. Insert into Supabase
            const { data: submission, error } = await supabase
                .from('submissions')
                .insert({
                    student_name: data.student_name,
                    question_text: data.question_text,
                    answer_text: data.answer_text,
                    status: 'pending',
                })
                .select()
                .single()

            if (error) throw error

            // 2. Trigger n8n webhook for AI grading
            const webhookUrl = import.meta.env.VITE_N8N_WEBHOOK_URL
            if (webhookUrl) {
                await fetch(webhookUrl, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        submission_id: submission.id,
                        question_text: data.question_text,
                        correct_answer: data.correct_answer,
                        student_answer: data.answer_text,
                    }),
                })
            }

            toast.success('Submission created! AI is grading...')
            form.reset()
            setOpen(false)
            onSuccess()
        } catch (error) {
            console.error('Error creating submission:', error)
            toast.error('Failed to create submission')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    New Submission
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>New Essay Submission</DialogTitle>
                    <DialogDescription>
                        Enter the question, answer key, and student's answer for AI grading.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="student_name">Student Name</Label>
                            <Input
                                id="student_name"
                                placeholder="John Doe"
                                {...form.register('student_name')}
                            />
                            {form.formState.errors.student_name && (
                                <p className="text-sm text-destructive">
                                    {form.formState.errors.student_name.message}
                                </p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="question_text">Question</Label>
                            <Textarea
                                id="question_text"
                                placeholder="Enter the essay question..."
                                rows={3}
                                {...form.register('question_text')}
                            />
                            {form.formState.errors.question_text && (
                                <p className="text-sm text-destructive">
                                    {form.formState.errors.question_text.message}
                                </p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="correct_answer">Answer Key (for AI reference)</Label>
                            <Textarea
                                id="correct_answer"
                                placeholder="Enter the correct answer/rubric..."
                                rows={3}
                                {...form.register('correct_answer')}
                            />
                            {form.formState.errors.correct_answer && (
                                <p className="text-sm text-destructive">
                                    {form.formState.errors.correct_answer.message}
                                </p>
                            )}
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="answer_text">Student's Answer</Label>
                            <Textarea
                                id="answer_text"
                                placeholder="Enter the student's answer..."
                                rows={4}
                                {...form.register('answer_text')}
                            />
                            {form.formState.errors.answer_text && (
                                <p className="text-sm text-destructive">
                                    {form.formState.errors.answer_text.message}
                                </p>
                            )}
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Submit for Grading
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
