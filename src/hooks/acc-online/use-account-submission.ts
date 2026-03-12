import { useState } from "react";
import { ResponseNID } from "@/models/open-acc-online/nid.response.model";
import { MaritalModel } from "@/models/static/marital/marital.response";
import { OccupationModel } from "@/models/static/occupation/occupation.response";
import { ReferenceModel } from "@/models/static/reference/reference.response";
import { LegalTypeModel } from "@/models/static/legal-type/legal-type.response";
import { BranchModel } from "@/models/branch/branch.response";
import { LocationSubmitData } from "@/models/open-acc-online/address/open-acc-address.request.model";
import { formatDate } from "@/constants/AppResource/format-date/format-dd-mm-yyyy";
import { createOpenAccountService } from "@/services/open-account/openAccount.service";
import { uploadDocument } from "@/services/document/document.service";

interface UseAccountSubmissionProps {
  formData: ResponseNID;
  uploadedImage: { idImage: string } | null;
  selfieImage: string | null;
  phoneNumber: string;
  selectedMaritalStatus: MaritalModel | null;
  selectedOccupation: OccupationModel | null;
  selectedReferenceBank: ReferenceModel | null;
  selectedLegalType: LegalTypeModel | null;
  selectedBranch: BranchModel | null;
  staffCode: string;
  locationData: LocationSubmitData;
  convertGenderToAPI: (gender: string) => string;
  getMaritalStatusString: (id: string) => string;
  translate: (key: string) => string;
}

interface LoadingState {
  isLoading: boolean;
  title: string;
  message: string;
}

interface ErrorDetail {
  title: string;
  message: string;
  variant: "error" | "warning";
}

// Maps HTTP status codes to user-friendly Khmer + English messages
const getErrorDetail = (
  status: number,
  fallbackMessage?: string,
): ErrorDetail => {
  switch (status) {
    case 400:
      return {
        title: "ទិន្នន័យមិនត្រឹមត្រូវ",
        message:
          "The information you entered is invalid. Please check all fields and try again.",
        variant: "error",
      };
    case 401:
      return {
        title: "វត្តមានផុតកំណត់",
        message:
          "Your session has expired. Please close the app and log in again.",
        variant: "warning",
      };
    case 403:
      return {
        title: "គ្មានសិទ្ធិចូលប្រើ",
        message:
          "You do not have permission to perform this action. Please contact support or try again later.",
        variant: "warning",
      };
    case 404:
      return {
        title: "រកមិនឃើញសេវាកម្ម",
        message:
          "The service is currently unavailable. Please try again later.",
        variant: "error",
      };
    case 409:
      return {
        title: "គណនីនេះបានមានរួចហើយ",
        message:
          "An account with this ID already exists. Please contact our support team for assistance.",
        variant: "warning",
      };
    case 413:
      return {
        title: "ឯកសារធំពេក",
        message:
          "The photo you uploaded is too large. Please use a smaller image and try again.",
        variant: "error",
      };
    case 422:
      return {
        title: "ទិន្នន័យមិនអាចដំណើរការបាន",
        message:
          "Some of your information could not be processed. Please review your details and try again.",
        variant: "error",
      };
    case 429:
      return {
        title: "សំណើច្រើនពេក",
        message: "Too many requests. Please wait a moment and try again.",
        variant: "warning",
      };
    case 500:
      return {
        title: "កំហុសម៉ាស៊ីនមេ",
        message:
          "Our server encountered an error. Please try again in a few minutes.",
        variant: "error",
      };
    case 502:
    case 503:
    case 504:
      return {
        title: "សេវាកម្មមិនអាចប្រើបាន",
        message:
          "The service is temporarily unavailable. Please try again later.",
        variant: "error",
      };
    case 0:
    default:
      return {
        title: "ការស្នើសុំបរាជ័យ",
        message:
          fallbackMessage ||
          "Something went wrong. Please check your internet connection and try again.",
        variant: "error",
      };
  }
};

const base64ToFile = (dataurl: string, filename: string): File => {
  const arr = dataurl.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] || "image/jpeg";
  const bstr = atob(arr[arr.length - 1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
};

export const useAccountSubmission = ({
  formData,
  uploadedImage,
  selfieImage,
  phoneNumber,
  selectedMaritalStatus,
  selectedOccupation,
  selectedReferenceBank,
  selectedLegalType,
  selectedBranch,
  staffCode,
  locationData,
  convertGenderToAPI,
  getMaritalStatusString,
  translate,
}: UseAccountSubmissionProps) => {
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState({
    title: "",
    message: "",
  });
  const [showSubmitErrorModal, setShowSubmitErrorModal] = useState(false);
  const [submitErrorData, setSubmitErrorData] = useState<{
    title: string;
    message: string;
    variant?: "error" | "warning";
  }>({
    title: "",
    message: "",
    variant: "error",
  });
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    title: "",
    message: "",
  });

  const handleSubmitAccount = async () => {
    setLoadingState({
      isLoading: true,
      title: translate("submitting") || "Submitting",
      message: translate("submitting_message") || "Creating your account...",
    });

    try {
      const nidBase64Full = uploadedImage?.idImage || "";
      const selfieBase64Full = selfieImage || "";

      // Convert directly to File — no compression, full original quality
      const nidFile = base64ToFile(
        nidBase64Full,
        `nid_${formData.idNumber}.jpg`,
      );
      const selfieFile = base64ToFile(
        selfieBase64Full,
        `selfie_${formData.idNumber}.jpg`,
      );

      // Upload images sequentially
      const nidFileName = await uploadDocument(
        nidFile,
        "nid",
        formData.idNumber,
      );
      const selfieFileName = await uploadDocument(
        selfieFile,
        "selfie",
        formData.idNumber,
      );

      const accountData = {
        familyName: formData.lastNameEn,
        givenName: formData.firstNameEn,
        firstNameKh: formData.firstNameKh,
        lastNameKh: formData.lastNameKh,
        dateOfBirth: formatDate(formData.dob),
        gender: convertGenderToAPI(formData.gender),
        placeOfBirth: formData.pob,
        companyName: selectedReferenceBank?.nameEn || "",
        referralId: staffCode || "",
        branchCode: selectedBranch!.branchID,
        occupation: selectedOccupation?.occupationCode || "",
        maritalStatus: selectedMaritalStatus
          ? getMaritalStatusString(selectedMaritalStatus.id.toString())
          : "SINGLE",
        customerCurrentProvince:
          locationData.currentAddress.province?.provinceCode || "",
        customerCurrentDistrict:
          locationData.currentAddress.district?.districtCode || "",
        customerCurrentCommune:
          locationData.currentAddress.commune?.communeCode || "",
        customerCurrentVillage:
          locationData.currentAddress.village?.villageCode || "",
        customerPobProvince:
          locationData.placeOfBirth.province?.provinceCode || "",
        customerPobDistrict:
          locationData.placeOfBirth.district?.districtCode || "",
        customerPobCommune:
          locationData.placeOfBirth.commune?.communeCode || "",
        customerPobVillage:
          locationData.placeOfBirth.village?.villageCode || "",
        legalId: formData.idNumber,
        legalIssueDate: formatDate(formData.issuedDate),
        legalExpireDate: formatDate(formData.expiredDate),
        legalAddress: formData.address,
        legalDocType: selectedLegalType?.legalTypeValue || "",
        legalMrz1: formData.MRZ1,
        legalMrz2: formData.MRZ2,
        legalMrz3: formData.MRZ3,
        phoneNumber: phoneNumber,
        nidImageName: nidFileName,
        selfieImageName: selfieFileName,
      };

      const response = await createOpenAccountService(accountData);

      setSuccessData({
        title: translate("success_title") || "Account Created Success",
        message:
          response?.message || "Your account has been created successfully!",
      });
      setShowSuccessModal(true);
    } catch (error: any) {
      console.error("Submission error:", error);

      const httpStatus =
        error?.status ??
        error?.response?.status ??
        error?.rawError?.status ??
        0;

      const fallbackMessage =
        error?.errorMessage ||
        error?.message ||
        error?.rawError?.message ||
        translate("fail_create_account");

      const errorDetail = getErrorDetail(httpStatus, fallbackMessage);

      setSubmitErrorData(errorDetail);
      setShowSubmitErrorModal(true);
    } finally {
      setLoadingState({
        isLoading: false,
        title: "",
        message: "",
      });
    }
  };

  return {
    handleSubmitAccount,
    showSuccessModal,
    setShowSuccessModal,
    successData,
    setSuccessData,
    showSubmitErrorModal,
    setShowSubmitErrorModal,
    submitErrorData,
    setSubmitErrorData,
    loadingState,
    setLoadingState,
  };
};
