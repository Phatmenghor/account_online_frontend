export interface AllCommuneModel {
  content: CommuneModel[];
  pageNo: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  last: boolean;
}

export interface CommuneModel {
 id: number
  communeCode: string
  communeEn: string
  communeKh: string
  district: District
}

export interface District {
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