import { z } from "zod";

// Schema for creating a trainee
export const CreateTraineeSchema = z.object({
  reportRemark: z.string().min(1, "Report remark is required"),
  challenge: z.string().optional(),
  recommend: z.string().optional(),
});

// Schema for updating a trainee
export const UpdateTraineeSchema = z.object({
  id: z.number().optional(),
  reportRemark: z.string().optional(),
  challenge: z.string().optional(),
  recommend: z.string().optional(),
});

// Types inferred from schema
export type CreateTraineeForm = z.infer<typeof CreateTraineeSchema>;
export type UpdateTraineeForm = z.infer<typeof UpdateTraineeSchema>;
