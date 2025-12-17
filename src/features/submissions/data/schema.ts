import { z } from 'zod'

// Submission schema
export const submissionSchema = z.object({
    id: z.string().uuid(),
    student_name: z.string(),
    question_text: z.string(),
    answer_text: z.string(),
    status: z.enum(['pending', 'graded']),
    created_at: z.string(),
    assignment_id: z.string().uuid().optional(),
})

export type Submission = z.infer<typeof submissionSchema>

// Grade schema
export const gradeSchema = z.object({
    id: z.string().uuid(),
    submission_id: z.string().uuid(),
    ai_score: z.number().min(0).max(100),
    ai_feedback: z.string(),
    ai_reasoning: z.string(),
    created_at: z.string(),
})

export type Grade = z.infer<typeof gradeSchema>

// Submission with grade (joined)
export interface SubmissionWithGrade extends Submission {
    grades?: Grade[]
}

// New submission form data
export const newSubmissionSchema = z.object({
    student_name: z.string().min(1, 'Nama mahasiswa wajib diisi'),
    question_text: z.string().min(10, 'Soal minimal 10 karakter'),
    correct_answer: z.string().min(10, 'Kunci jawaban minimal 10 karakter'),
    answer_text: z.string().min(10, 'Jawaban minimal 10 karakter'),
})

export type NewSubmissionData = z.infer<typeof newSubmissionSchema>
