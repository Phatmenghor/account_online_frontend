export interface AttendanceApproveReq {
  status: string;
  approvalNotes: string;
}

export interface AttendanceReq {
  type: string;
  leaveRequest: string;
  startDate: string;
  endDate: string;
  reason: string;
}

export interface AllAttendancesReq {
  pageNo?: number;
  pageSize?: number;
  search?: string;
  status?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
  userId?: number;
}
