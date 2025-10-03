export enum AttendanceType {
  SICK_LEAVE = "SICK_LEAVE",
  ANNUAL_LEAVE = "ANNUAL_LEAVE",
  UNPAID_LEAVE = "UNPAID_LEAVE",
  MATERNITY_LEAVE = "MATERNITY_LEAVE",
  PATERNITY_LEAVE = "PATERNITY_LEAVE",
  BUSINESS_TRIP = "BUSINESS_TRIP",
  REMOTE_WORK = "REMOTE_WORK",
  PERMISSION = "PERMISSION",
  OTHER = "OTHER",
}

export const ATTENDANCE_TYPE_OPTIONS = Object.values(AttendanceType).map(
  (value) => ({
    value,
    label: value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), // "SICK_LEAVE" → "Sick Leave"
  })
);

export enum AttendanceStatus {
  PENDING = "PENDING",
  APPROVED = "APPROVED",
  REJECTED = "REJECTED",
  CANCELLED = "CANCELLED",
}

export const ATTENDANCE_STATUS_OPTIONS = [
  { label: "Pending", value: AttendanceStatus.PENDING },
  { label: "Approved", value: AttendanceStatus.APPROVED },
  { label: "Rejected", value: AttendanceStatus.REJECTED },
  { label: "Cancelled", value: AttendanceStatus.CANCELLED },
];

// TypeScript Enum
export enum LeaveRequest {
  MORNING = "MORNING",
  AFTERNOON = "AFTERNOON",
  FULL_DAY = "FULL_DAY",
}

// Options for frontend select/dropdown
export const LEAVE_REQUEST_OPTIONS = [
  { value: LeaveRequest.MORNING, label: "Morning" },
  { value: LeaveRequest.AFTERNOON, label: "Afternoon" },
  { value: LeaveRequest.FULL_DAY, label: "Full Day" },
];
