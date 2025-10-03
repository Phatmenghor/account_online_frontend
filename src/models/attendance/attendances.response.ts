export interface AllAttendanceModel {
  content: AttendanceModel[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface AttendanceModel {
  id: number;
  userId: number;
  userIdCard: string;
  userFullName: string;
  userEmail: string;
  userPosition: string;
  type: string;
  status: string;
  startDate: string;
  endDate: string;
  leaveRequest: string;
  totalDays: number;
  reason: string;
  approvedByIdCard: string;
  approvedByFullName: string;
  approvedAt: string;
  approvalNotes: string;
  createdAt: string;
  updatedAt: string;
}
