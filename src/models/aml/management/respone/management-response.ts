export interface AllManagementModel {
  content: ManagementModel[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ManagementModel {
  id: number;
  originalRequest: string;
  originalResponse: string;
  customerInfo: CustomerInfo;
  status: string;
  screeningResult: string;
  riskLevel: string;
  actionTaken: string;
  rulesTriggered: RulesTriggered[];
  serviceName: string;
  totalRulesScore: number;
  trxnID: string;
  approvedBy: ApprovedBy;
  rejectedBy: RejectedBy;
  createdAt: string;
  updatedAt: string;
  currentAddressName: string;
  currentAddressCode: string;
  placeOfBirthName: string;
  placeOfBirthCode: string;
  maritalStatus: string;
  occupationCode: string;
  occupationStatus: string;
  issuedDate: string;
  expiredDate: string;
  remarks: string;
}

export interface CustomerInfo {
  legalId: string;
  familyName: string;
  givenName: string;
  firstNameKh: string;
  lastNameKh: string;
  dateOfBirth: string;
  placeOfBirth: string;
  gender: string;
  nationality: string;
  legalAddress: string;
  phoneNumber: string;
}

export interface RulesTriggered {}

export interface ApprovedBy {
  id: number;
  idCard: string;
  email: string;
  userRole: string;
  userStatus: string;
  fullName: string;
  position: string;
  profileUrl: string;
  userPermission: string;
  createdAt: string;
  updatedAt: string;
}

export interface RejectedBy {
  id: number;
  idCard: string;
  email: string;
  userRole: string;
  userStatus: string;
  fullName: string;
  position: string;
  profileUrl: string;
  userPermission: string;
  createdAt: string;
  updatedAt: string;
}
