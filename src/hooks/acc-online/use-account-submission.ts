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
      const nidImageBase64 =
        uploadedImage!.idImage.split(",")[1] || uploadedImage!.idImage;

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
        nidImage: nidImageBase64,
        selfieImage: selfieImage || "",
      };

      const response = await createOpenAccountService(accountData);

      // Show success modal with response data
      setSuccessData({
        title: translate("success_title") || "Account Created Success",
        message:
          response?.message || "Your account has been created successfully!",
      });
      setShowSuccessModal(true);
    } catch (error: any) {
      // Extract error message from the service open acc online
      const errorMessage =
        error?.errorMessage ||
        error?.message ||
        error?.rawError?.message ||
        "Failed to create account. Please try again.";

      const isConflict = error?.rawError?.status === 409 || error?.status === 409;

      // Check for ACCOUNT_ALREADY_EXIST
      if (errorMessage.includes("ACCOUNT_ALREADY_EXIST") || isConflict) {
        setSubmitErrorData({
          title: translate("account_exists_title") || "Account Already Exists",
          message: translate("account_exists_message") || "You already have an account with the bank. Please use your existing account.",
          variant: "warning",
        });
      } else {
        // Show generic error modal
        setSubmitErrorData({
          title: translate("error_title") || "Submission Failed",
          message: errorMessage,
          variant: "error",
        });
      }
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
