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
