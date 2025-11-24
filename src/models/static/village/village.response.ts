export interface AllVillageModel {
  content: VillageModel[]
  pageNo: number
  pageSize: number
  totalElements: number
  totalPages: number
}

export interface VillageModel {
  id: number
  villageCode: string
  villageEn: string
  villageKh: string
  commune: Commune
}

export interface Commune {
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