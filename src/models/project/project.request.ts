export interface CreateProjectReq {
  projectName: string;
  type?: string;
  hostServer?: string;
  hostPort?: number;
  dbName?: string;
  memberInvolved?: string;
  dbType?: string;
  dbServer?: string;
  remark?: string;
}

export interface UpdateProjectReq {
  projectName?: string;
  type?: string;
  hostServer?: string;
  hostPort?: number;
  dbName?: string;
  dbType?: string;
  dbServer?: string;
  remark?: string;
}

export interface AllProjectReq {
  search: string;
  pageNo: number;
  pageSize: number;
}
