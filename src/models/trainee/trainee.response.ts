export interface AllTraineeModel {
  content: TraineeModel[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface TraineeModel {
  id: number
  reportRemark: string
  challenge: string
  recommend: string
  createdAt: string
  updatedAt: string
}