import { z } from "zod";

// Schema for creating a project
export const CreateProjectSchema = z.object({
  projectName: z.string().min(1, "Project name is required"),
  type: z.string().optional(),
  hostServer: z.string().optional(),
  hostPort: z.coerce.number().int().optional(),
  dbName: z.string().optional(),
  memberInvolved: z.string().optional(),
  dbType: z.string().optional(),
  dbServer: z.string().optional(),
  remark: z.string().optional(),
});

// Schema for updating a project
export const UpdateProjectSchema = z.object({
  id: z.number().optional(),
  projectName: z.string().optional(),
  type: z.string().optional(),
  hostServer: z.string().optional(),
  hostPort: z.coerce.number().int(), // 👈 converts "5432" → 5432 automatically
  dbName: z.string().optional(),
  dbType: z.string().optional(),
  dbServer: z.string().optional(),
  remark: z.string().optional(),
});

// Types inferred from schema
export type CreateProjectForm = z.infer<typeof CreateProjectSchema>;
export type UpdateProjectForm = z.infer<typeof UpdateProjectSchema>;
