export interface AllProjectModel {
  content: ProjectModel[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface ProjectModel {
  id: number;
  projectName: string;
  type: string;
  hostServer: string;
  hostPort: number;
  dbName: string;
  memberInvolved: string;
  dbType: string;
  dbServer: string;
  remark: string;
  createdAt: string;
  updatedAt: string;
}
