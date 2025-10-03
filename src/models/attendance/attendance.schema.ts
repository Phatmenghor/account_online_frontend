import { z } from "zod";

// -----------------------
// AttendanceApproveReq
// -----------------------

// Create mode
export const AttendanceApproveReqCreateSchema = z.object({
  status: z.string().nonempty("Status is required"),
  approvalNotes: z.string().nonempty("Approval notes are required"),
});

// Update mode
export const AttendanceApproveReqUpdateSchema = z.object({
  status: z.string().optional(),
  approvalNotes: z.string().optional(),
});

// TypeScript types
export type AttendanceApproveReqCreate = z.infer<
  typeof AttendanceApproveReqCreateSchema
>;
export type AttendanceApproveReqUpdate = z.infer<
  typeof AttendanceApproveReqUpdateSchema
>;

// -----------------------
// AttendanceReq
// -----------------------

// Create mode
export const AttendanceReqCreateSchema = z.object({
  type: z.string().nonempty("Type is required"),
  leaveRequest: z.string().nonempty("Leave request is required"),
  startDate: z.string().nonempty("Start date is required"),
  endDate: z.string().nonempty("End date is required"),
  reason: z.string().nonempty("Reason is required"),
});

// Update mode
export const AttendanceReqUpdateSchema = z.object({
  id: z.number().optional(),
  type: z.string().optional(),
  leaveRequest: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  reason: z.string().optional(),
});

// TypeScript types
export type AttendanceCreateForm = z.infer<typeof AttendanceReqCreateSchema>;
export type AttendanceUpdateForm = z.infer<typeof AttendanceReqUpdateSchema>;
