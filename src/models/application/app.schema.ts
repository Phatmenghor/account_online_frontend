import { z } from "zod";

// Schema for creating an app
export const CreateAppSchema = z.object({
  projectName: z.string().min(1, "Project name is required"),
  memberInvolved: z.string().optional(),
  remark: z.string().optional(),
  department: z.string().optional(),
  year: z.string().optional(),
  urlLink: z.string().optional(),
  applicationStatus: z.string().optional(),
});

// Schema for updating an app
export const UpdateAppSchema = z.object({
  id: z.number().optional(),
  projectName: z.string().optional(),
  memberInvolved: z.string().optional(),
  remark: z.string().optional(),
  department: z.string().optional(),
  year: z.string().optional(),
  urlLink: z.string().optional(),
  applicationStatus: z.string().optional(),
});

// Types inferred from schema
export type CreateAppForm = z.infer<typeof CreateAppSchema>;
export type UpdateAppForm = z.infer<typeof UpdateAppSchema>;
