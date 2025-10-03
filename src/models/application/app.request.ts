export interface CreateAppReq {
  projectName: string
  memberInvolved?: string
  remark?: string
  department?: string
  year?: string
  urlLink?: string
  applicationStatus?: string
}

export interface UpdateAppReq {
  projectName?: string
  memberInvolved?: string
  remark?: string
  department?: string
  year?: string
  urlLink?: string
  applicationStatus?: string
}

export interface AllAppReq {
  search: string;
  pageNo: number;
  pageSize: number;
  applicationStatus?: string;
}