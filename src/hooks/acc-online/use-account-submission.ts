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

// Compress a base64 image to max 1024px wide at 80% JPEG quality.
// Camera photos are typically 10–20 MB; this reduces them to ~200–500 KB
// before upload, preventing connection drops on slow mobile networks.
const compressImage = (
  dataurl: string,
  maxWidth = 1024,
  quality = 0.8,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        if (!ctx) {
          // Canvas not supported — return original without compression
          resolve(dataurl);
          return;
        }
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      } catch (err) {
        // If compression fails, fall back to original image
        resolve(dataurl);
      }
    };
    img.onerror = () => {
      // If image fails to load, fall back to original
      console.warn("Image load failed during compression, using original");
      resolve(dataurl);
    };
    img.src = dataurl;
  });
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

      // Compress images before converting to File — reduces upload size
      // from 10–20 MB (raw camera) down to ~200–500 KB
      const [nidCompressed, selfieCompressed] = await Promise.all([
        compressImage(nidBase64Full),
        compressImage(selfieBase64Full),
      ]);

      const nidFile = base64ToFile(
        nidCompressed,
        `nid_${formData.idNumber}.jpg`,
      );
      const selfieFile = base64ToFile(
        selfieCompressed,
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

      const errorMessage =
        error?.errorMessage ||
        error?.message ||
        error?.rawError?.message ||
        "Failed to create account. Please try again.";

      const httpStatus = error?.status ?? error?.rawError?.status ?? 0;
      const isConflict = httpStatus === 409;

      setSubmitErrorData({
        title: "ការស្នើសុំបរាជ័យ",
        message: errorMessage,
        variant: isConflict ? "warning" : "error",
      });
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
