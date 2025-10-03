export interface CreateTraineeReq {
  reportRemark: string
  challenge?: string
  recommend?: string
}

export interface UpdateTraineeReq {
  reportRemark?: string
  challenge?: string
  recommend?: string
}

export interface AllTraineeReq {
  search: string;
  pageNo: number;
  pageSize: number;
}

