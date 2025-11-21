// "use client"
// import { useTranslations } from "next-intl";
// import { z } from "zod";

// // language
// const translate = useTranslations("NIDPage");

// // Schema for NID Form Validation
// export const NIDFormSchema = z.object({
//   // Images
//   idImage: z.string().min(1, translate("err_idImage")),
//   selfieImage: z.string().min(1, "Selfie image is required"),
  
//   // Personal Information (Khmer)
//   lastNameKh: z.string().min(1, "First name (Khmer) is required"),
//   firstNameKh: z.string().min(1, "Last name (Khmer) is required"),
  
//   // Personal Information (English)
//   lastNameEn: z.string().min(1, "Family name (English) is required"),
//   firstNameEn: z.string().min(1, "Given name (English) is required"),
  
//   // Date and Identity
//   dob: z.string().min(1, "Date of birth is required"),
//   gender: z.string().min(1, "Gender is required"),
//   idNumber: z.string().min(1, "Legal ID is required"),
  
//   // Address Information
//   address: z.string().min(1, "Address is required"),
//   pob: z.string().min(1, "Place of birth is required"),
  
//   // Additional Information
//   maritalStatus: z.string().min(1, "Marital status is required"),
//   occupation: z.string().min(1, "Occupation is required"),
//   branch: z.string().min(1, "Branch is required"),
//   legalType: z.string().min(1, "Legal type is required"),
//   referenceBank: z.string().optional(),
//   staffCode: z.string().optional(),
  
//   // Phone and OTP
//   phoneNumber: z.string()
//     .min(9, "Phone number must be at least 9 digits")
//     .max(15, "Phone number must not exceed 15 digits")
//     .regex(/^[0-9]+$/, "Phone number must contain only digits"),
//   isPhoneVerified: z.boolean().refine((val) => val === true, {
//     message: "Phone number must be verified. And then input otp 6 digit",
//   }),
// });

// export type NIDFormData = z.infer<typeof NIDFormSchema>;

// // Partial schema for verification step (before full submission)
// export const NIDVerificationSchema = NIDFormSchema.pick({
//   idImage: true,
//   selfieImage: true,
//   lastNameKh: true,
//   firstNameKh: true,
//   lastNameEn: true,
//   firstNameEn: true,
//   dob: true,
//   gender: true,
//   idNumber: true,
//   address: true,
//   pob: true,
// });

// export type NIDVerificationData = z.infer<typeof NIDVerificationSchema>;


// // Schema for Location/Address Form Validation
// export const LocationFormSchema = z.object({
//   // Current Address
//   currentAddress: z.object({
//     province: z.string().min(1, "Province is required"),
//     district: z.string().min(1, "District is required"),
//     commune: z.string().min(1, "Commune is required"),
//     village: z.string().min(1, "Village is required"),
//   }),
  
//   // Place of Birth
//   placeOfBirth: z.object({
//     province: z.string().min(1, "Province is required"),
//     district: z.string().min(1, "District is required"),
//     commune: z.string().min(1, "Commune is required"),
//     village: z.string().min(1, "Village is required"),
//   }),
// });

// export type LocationFormData = z.infer<typeof LocationFormSchema>;

"use client"
import { useTranslations } from "next-intl";
import { z } from "zod";

// Schema for NID Form Validation
export const useNIDFormSchema = () => {
  const translate = useTranslations("NIDPage");
  
  return z.object({
    // Images
    idImage: z.string().min(1, translate("err_idImage")),
    selfieImage: z.string().min(1, translate("err_selfieImage")),
    
    // Personal Information (Khmer)
    lastNameKh: z.string().min(1, translate("err_lastNameKh")),
    firstNameKh: z.string().min(1, translate("err_firstNameKh")),
    
    // Personal Information (English)
    lastNameEn: z.string().min(1, translate("err_lastNameEn")),
    firstNameEn: z.string().min(1, translate("err_firstNameEn")),
    
    // Date and Identity
    dob: z.string().min(1, translate("err_dob")),
    gender: z.string().min(1, translate("err_gender")),
    idNumber: z.string().min(1, translate("err_idNumber")),
    
    // Address Information
    address: z.string().min(1, translate("err_address")),
    pob: z.string().min(1, translate("err_pob")),
    
    // Additional Information
    maritalStatus: z.string().min(1, translate("err_maritalStatus")),
    occupation: z.string().min(1, translate("err_occupation")),
    branch: z.string().min(1, translate("err_branch")),
    legalType: z.string().min(1, translate("err_legalType")),
    referenceBank: z.string().optional(),
    staffCode: z.string().optional(),
    
    // Phone and OTP
    phoneNumber: z.string()
      .min(8, translate("err_phoneNumber_min"))
      .max(15, translate("err_phoneNumber_max"))
      .regex(/^[0-9]+$/, translate("err_phoneNumber_regex")),
    isPhoneVerified: z.boolean().refine((val) => val === true, {
      message: translate("err_isPhoneVerified"),
    }),
  });
};

export type NIDFormData = z.infer<ReturnType<typeof useNIDFormSchema>>;

// Partial schema for verification step (before full submission)
export const useNIDVerificationSchema = () => {
  return useNIDFormSchema().pick({
    idImage: true,
    selfieImage: true,
    lastNameKh: true,
    firstNameKh: true,
    lastNameEn: true,
    firstNameEn: true,
    dob: true,
    gender: true,
    idNumber: true,
    address: true,
    pob: true,
  });
};

export type NIDVerificationData = z.infer<ReturnType<typeof useNIDVerificationSchema>>;

// Schema for Location/Address Form Validation
export const useLocationFormSchema = () => {
  const translate = useTranslations("address");
  
  return z.object({
    // Current Address
    currentAddress: z.object({
      province: z.string().min(1, translate("err_province")),
      district: z.string().min(1, translate("err_district")),
      commune: z.string().min(1, translate("err_commune")),
      village: z.string().min(1, translate("err_village")),
    }),
    
    // Place of Birth
    placeOfBirth: z.object({
      province: z.string().min(1, translate("err_province")),
      district: z.string().min(1, translate("err_district")),
      commune: z.string().min(1, translate("err_commune")),
      village: z.string().min(1, translate("err_village")),
    }),
  });
};

export type LocationFormData = z.infer<ReturnType<typeof useLocationFormSchema>>;