export interface AllAppModel {
  content: ApplicationModel[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ApplicationModel {
  id: number
  projectName: string
  memberInvolved: string
  remark: string
  department: string
  year: string
  urlLink: string
  applicationStatus: string
  createdAt: string
  updatedAt: string
}