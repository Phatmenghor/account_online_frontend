import { z } from "zod";

// UpdateUserReq schema (all fields optional)
export const UpdateUserSchema = z.object({
  id: z.number(),
  username: z.string().optional(),
  email: z.string().email().optional(),
  fullName: z.string().optional(),
  status: z.string().optional(),
  profileUrl: z.string().url().optional(),
  position: z.string().optional(),
});

export type UpdateUserForm = z.infer<typeof UpdateUserSchema>;

// CreateUserReq schema (username, email, password required)
export const CreateUserSchema = z.object({
  username: z.string().min(1, "Username is required"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  fullName: z.string().optional(),
  role: z.string().optional(),
  position: z.string().optional(),
});

export type CreateUserForm = z.infer<typeof CreateUserSchema>;
