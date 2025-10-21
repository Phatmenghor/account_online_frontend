export interface ApiResponse<T> {
  error: string;
  message: string;
  data?: T;
}

export interface RequestIdImage {
  applicationName: string,
  idImage: string;
}

export interface RequestValidModel {
  applicationName: string;
  idNumber: string;
  lastNameKh: string;
  firstNameKh: string;
  lastNameEn: string;
  firstNameEn: string;
  dob: string;
  gender: string;
  expiredDate: string;
  issuedDate: string;
  address: string;
  pob: string;
}
