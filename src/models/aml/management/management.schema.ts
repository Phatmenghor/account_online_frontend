export interface ApiResponse {
  status: string;
  message: string;
  data: Data;
}

export interface Data {
  id: number;
  originalRequest: string;
  originalResponse: string;
  customerInfo: CustomerInfo;
  status: "PENDING" | "APPROVED" | "REJECTED" | string; // you can expand or restrict values as needed
  approvedBy: UserInfo;
  rejectedBy: UserInfo;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
}

export interface CustomerInfo {
  idDisplay: string;
  familyName: string;
  givenName: string;
  firstNameKh: string;
  lastNameKh: string;
  dateOfBirth: string;
  gender: string;
  nationality: string;
  legalAddress: string;
}

export interface UserInfo {
  id: number;
  idCard: string;
  email: string;
  userRole: string;
  userStatus: string;
  fullName: string;
  position: string;
  profileUrl: string;
  userPermission: "APPROVED" | "REJECTED" | "PENDING" | string;
  createdAt: string;
  updatedAt: string;
}
