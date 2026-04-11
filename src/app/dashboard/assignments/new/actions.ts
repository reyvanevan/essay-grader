"use server";

import { createClient } from "@/utils/supabase/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

type RubricInput = {
  aspect: string;
  weight: number;
  description: string;
};

export async function createAssignmentAction(formData: FormData, rubricsData: RubricInput[]) {
  const supabase = await createClient();

  const title = formData.get("title") as string;
  const courseCode = formData.get("courseCode") as string;
  const dueDateStr = formData.get("dueDate") as string;
  const description = formData.get("description") as string;

  if (!title || rubricsData.length === 0) {
    return { error: "Title and at least one Rubric must be provided!" };
  }

  const dueDate = dueDateStr ? new Date(dueDateStr).toISOString() : null;

  try {
    const now = new Date().toISOString();

    const { data: assignmentData, error: assignmentError } = await supabase
      .from("assignments")
      .insert([
        {
          title,
          course_code: courseCode || null,
          description: description || null,
          due_date: dueDate,
          created_at: now,
          updated_at: now,
        },
      ])
      .select()
      .single();

    if (assignmentError) {
      console.error("Assignment Insert Error:", assignmentError);
      return { error: "Failed to create assignment record." };
    }

    const assignmentId = assignmentData.id;

    const rubricsToInsert = rubricsData.map((rubric) => ({
      assignment_id: assignmentId,
      aspect: rubric.aspect,
      weight: Number(rubric.weight),
      description: rubric.description,
      created_at: now,
      updated_at: now,
    }));

    const { error: rubricsError } = await supabase.from("rubrics").insert(rubricsToInsert);

    if (rubricsError) {
      console.error("Rubrics Insert Error:", rubricsError);
      return { error: "Failed to save AI Rubrics. Assignment created partially." };
    }

    revalidatePath("/dashboard/assignments");
  } catch (error) {
    console.error("Server Action Exception:", error);
    return { error: "Server ran into an unexpected issue while saving." };
  }

  redirect("/dashboard/assignments");
}
