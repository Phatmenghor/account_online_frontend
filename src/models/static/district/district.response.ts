export interface AllDistrictModel {
  content: DistrictModel[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface DistrictModel {
  id: number
  districtCode: string
  districtEn: string
  districtKh: string
  province: Province
}

export interface Province {
  id: number
  provinceCode: string
  provinceEn: string
  provinceKh: string
}