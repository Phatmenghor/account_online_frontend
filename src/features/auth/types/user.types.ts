import { z } from "zod";

// --- User Request Types ---
export interface AllUserReq {
    pageNo?: number;
    pageSize?: number;
    search?: string;
    status?: string;
}

export interface UpdateUserReq {
    username?: string;
    email?: string;
    fullName?: string;
    status?: string;
    userPermission?: string;
    profileUrl?: string;
    position?: string;
}

export interface CreateUserReq {
    username: string;
    email: string;
    password: string;
    fullName?: string;
    userPermission?: string;
    role?: string;
    position?: string;
    status?: string; // Added to match schema usage
}

export interface ChangePasswordReq {
    currentPassword: string;
    newPassword: string;
    confirmNewPassword: string;
}

export interface ChangePasswordByAdminReq {
    id: number;
    newPassword: string;
    confirmNewPassword: string;
}

// --- User Response Types ---
export interface AllUserModel {
    content: UserModel[];
    pageNo: number;
    pageSize: number;
    totalElements: number;
    totalPages: number;
    last: boolean;
}

export interface UserModel {
    id: number;
    idCard: string;
    email: string;
    userRole: string;
    userStatus: string;
    fullName: string;
    userPermission: string;
    position: string;
    profileUrl: string;
    createdAt: string;
    updatedAt: string;
    lastLogin: string;
}

// --- User Schemas ---

/**
 * Schema for updating user
 * - All fields optional
 * - `id` required for update
 */
export const UpdateUserSchema = z.object({
    id: z.number().min(1, "User ID is required"),
    username: z.string().optional(),
    email: z.string().email("Invalid email format").optional(),
    fullName: z.string().optional(),
    userPermission: z.string().optional(),
    status: z.string().optional(),
    profileUrl: z.string().optional(),
    position: z.string().optional(),
});

export type UpdateUserForm = z.infer<typeof UpdateUserSchema>;

/**
 * Schema for creating user
 * - `username`, `email`, `password` required
 */
export const CreateUserSchema = z.object({
    username: z.string().min(1, "Username is required"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    fullName: z.string().optional(),
    userPermission: z.string().optional(),
    role: z.string().min(1, "Role is required"), // make role required for clarity
    position: z.string().optional(),
    profileUrl: z.string().optional(),
    status: z.string().optional(), // in case backend expects it on create
});

export type CreateUserForm = z.infer<typeof CreateUserSchema>;

/**
 * Union schema if you ever want to validate dynamically
 */
export const UserFormSchema = z.discriminatedUnion("mode", [
    z.object({
        mode: z.literal("create"),
        data: CreateUserSchema,
    }),
    z.object({
        mode: z.literal("update"),
        data: UpdateUserSchema,
    }),
]);

export type UserFormInput = z.infer<typeof UserFormSchema>;
