export interface GetAccountModel {
 status : string,
 message: string ,
 data : AccountModel ;
}

interface AccountModel {
  id: string;
  cif: string;
  legalId: string;
  legalFirstNameEn: string;
  legalLastNameEn: string;
  legalFirstNameKh: string;
  legalLastNameKh: string;
  legalDateOfBirth: string;          // or Date if you want
  legalGender: string;
  legalAddress: string;
  legalPlaceOfBirth: string;
  maritalStatus: string;
  nationality: string;
  companyName: string;
  occupation: string;
  phoneNumber: string;
  nidImage: string;                  // base64 string
  selfieImage: string;               // base64 string
  createdAt: string;                 // ISO date string
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
}
