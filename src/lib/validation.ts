// frontend/src/lib/validation.ts
import { z } from "zod";

export const resumeSchema = z.object({
  resume: z
    .any()
    .refine((file) => file instanceof File, "Resume file is required.")
    .refine((file) => file && file.type === "application/pdf", "Only PDF files are allowed.")
    .refine((file) => file && file.size <= 10 * 1024 * 1024, "Resume must be less than 10MB."),
  Target_Role: z.string().min(1, "Target Role is required."),
  Target_Company: z.string().optional().nullable(),
  Years_of_Experience: z.coerce.number().min(0, "Years of Experience cannot be negative.").max(50, "Years of Experience seems too high.").default(0),
});

export type ResumeFormValues = z.infer<typeof resumeSchema>;