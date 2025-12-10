import { z } from "zod";

// --- Auth Request Types ---
export interface LoginCredentials {
    username: string;
    password: string;
}

// --- Auth Response Types ---
export interface AuthResponse {
    status: string;
    message: string;
    data: AuthModel;
}

export interface AuthModel {
    accessToken: string;
    tokenType: string;
    userRole: UserRole;
    fullToken: string;
}

export interface UserRole {
    id: number;
    idCard: string;
    email: string;
    userRole: string;
    userStatus: string;
    fullName: string;
    position: string;
    profileUrl: string;
    createdAt: string;
    updatedAt: string;
    lastLogin: string;
}

// --- Profile Schema ---
// UpdateUserReq schema (all fields optional)
export const UpdateUserProfileSchema = z.object({
    username: z.string().optional(),
    email: z.string().optional(),
    fullName: z.string().optional(),
    status: z.string().optional(),
    profileUrl: z.string().optional(),
    position: z.string().optional(),
    id: z.number().optional(),
});

export type UpdateUserProfileForm = z.infer<typeof UpdateUserProfileSchema>;
