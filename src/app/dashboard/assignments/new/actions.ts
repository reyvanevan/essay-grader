"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createAssignmentAction(formData: FormData, rubricsData: any[]) {
    // 1. Prepare Supabase Client
    const supabase = await createClient();

    // 2. Extract Basic Information from FormData
    const title = formData.get("title") as string;
    const courseCode = formData.get("courseCode") as string;
    const dueDateStr = formData.get("dueDate") as string;
    const description = formData.get("description") as string;

    // Optional validation (can be replaced by Zod gracefully later)
    if (!title || rubricsData.length === 0) {
        return { error: "Title and at least one Rubric must be provided!" };
    }

    // Process Date
    const dueDate = dueDateStr ? new Date(dueDateStr).toISOString() : null;

    try {
        // 3. Insert into 'assignments' table
        const { data: assignmentData, error: assignmentError } = await supabase
            .from("assignments")
            .insert([
                {
                    title,
                    course_code: courseCode || null,
                    description: description || null,
                    due_date: dueDate,
                }
            ])
            .select() // Return the created assignment row
            .single();

        if (assignmentError) {
            console.error("Assignment Insert Error:", assignmentError);
            return { error: "Failed to create assignment record." };
        }

        const assignmentId = assignmentData.id;

        // 4. Prepare and Insert data into 'rubrics' table
        // We link each rubric with the new Assignment ID
        const rubricsToInsert = rubricsData.map((rubric: any) => ({
            assignment_id: assignmentId,
            aspect: rubric.aspect,
            weight: Number(rubric.weight),
            description: rubric.description,
        }));

        const { error: rubricsError } = await supabase
            .from("rubrics")
            .insert(rubricsToInsert);

        if (rubricsError) {
            console.error("Rubrics Insert Error:", rubricsError);
            // In a strict prod app, we might delete the assignment here to rollback.
            return { error: "Failed to save AI Rubrics. Assignment created partially." };
        }

        // 5. Success! Revalidate the dashboard and return success signal
        // Revalidate cache so the new assignment shows up immediately on the grid
        revalidatePath("/dashboard/assignments");

    } catch (e: any) {
        console.error("Server Action Exception:", e);
        return { error: "Server ran into an unexpected issue while saving." };
    }

    // Redirect MUST be outside of try-catch blocks in Next.js Server Actions
    redirect("/dashboard/assignments");
}
