"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  RequestIdImage,
  RequestValidModel,
} from "@/models/acc-online/nid.request.model";
import {
  ResponseNID,
  ValidationResponse,
} from "@/models/acc-online/nid.response.model";
import {
  extractNIDService,
  validateNIDService,
} from "@/services/acc-online/nid.service";
import {
  convertGenderForAPI,
  formatDate,
} from "@/constants/AppResource/format-date/format-dd-mm-yyyy";
import ValidationErrorModal from "@/components/acc-online/validateModal";
import ErrorModal from "@/components/acc-online/errorModal";
import LanguageSwitcher from "@/components/shared/common/language-switcher";
import Footer from "@/components/shared/footer/footer";
import { MaritalModel } from "@/models/static/marital/marital.response";
import { useClientLocale } from "@/context/provider/local-provider";
import { OccupationModel } from "@/models/static/occupation/occupation.response";
import { ReferenceModel } from "@/models/static/reference/reference.response";
import { FormInputField } from "@/components/acc-online/form-field/form-field";
import { CustomDatePicker } from "@/components/shared/common/custom-date-picker";
import {
  formatDateForInput,
  normalizeGender,
} from "@/utils/format/BranchFormat";
import {
  useMaritalStatuses,
  useOccupations,
  useReferenceBanks,
} from "@/hooks/fetch-master";
import { AppToast } from "@/components/shared/toast/app-toast";
import ConfirmationModal from "@/components/acc-online/confirmModal";
import LocationModal from "@/components/acc-online/addressModal";
import {
  CommuneModel,
  DistrictModel,
  ProvinceModel,
  VillageModel,
} from "@/models/address/address.response";
import OTPInput from "@/components/acc-online/form-field/form-otp";
import { ComboboxSelectBranch } from "@/components/shared/combo-box/combobox-branch";
import { BranchModel } from "@/models/branch/branch.response";
import { CreateOpenAccountReq } from "@/models/open-account/openAccount.request";
import { createOpenAccountService } from "@/services/open-account/openAccount.service";
import {
  NIDFormData,
  NIDFormSchema,
  NIDVerificationSchema,
} from "@/components/acc-online/form-field/form-validate-error";
import { Label } from "@/components/ui/label";
import LoadingModal from "@/components/shared/modal/extract-modal";
import SuccessModal from "@/components/acc-online/successModal";
import SubmitSuccessModal from "@/components/shared/modal/submit-success-modal";
import SubmitErrorModal from "@/components/shared/modal/submit-error-modal";

export interface Image {
  idImage: string;
}

interface LocationData {
  province: string;
  district: string;
  commune: string;
  village: string;
}

interface LocationSubmitData {
  currentAddress: {
    province: ProvinceModel | null;
    district: DistrictModel | null;
    commune: CommuneModel | null;
    village: VillageModel | null;
  };
  placeOfBirth: {
    province: ProvinceModel | null;
    district: DistrictModel | null;
    commune: CommuneModel | null;
    village: VillageModel | null;
  };
}

export default function CheckNIDPage() {
  const [imageData, setImageData] = useState<RequestIdImage | null>(null);
  const [formData, setFormData] = useState<ResponseNID>({
    idNumber: "",
    lastNameKh: "",
    firstNameKh: "",
    dob: "",
    gender: "",
    lastNameEn: "",
    firstNameEn: "",
    expiredDate: "",
    issuedDate: "",
    address: "",
    pob: "",
    MRZ1: "",
    MRZ2: "",
    MRZ3: "",
  });

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<Image | null>(null);

  // Separate state for selfie
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [validationResult, setValidationResult] =
    useState<ValidationResponse | null>(null);

  const [showValidationErrorModal, setShowValidationErrorModal] =
    useState(false);
  const [validationErrorData, setValidationErrorData] = useState({
    title: "",
    message: "",
    description: "",
  });

  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<BranchModel | null>(
    null
  );

  // Success and Error Modal States
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [successData, setSuccessData] = useState({
    title: "",
    message: "",
  });

  const [showSubmitErrorModal, setShowSubmitErrorModal] = useState(false);
  const [submitErrorData, setSubmitErrorData] = useState({
    title: "",
    message: "",
  });

  // Location data state - Store complete objects
  const [locationData, setLocationData] = useState<LocationSubmitData>({
    currentAddress: {
      province: null,
      district: null,
      commune: null,
      village: null,
    },
    placeOfBirth: {
      province: null,
      district: null,
      commune: null,
      village: null,
    },
  });

  // Separate state for LocationModal (it expects LocationData type)
  const [locationFormData, setLocationFormData] = useState<LocationData>({
    province: "",
    district: "",
    commune: "",
    village: "",
  });

  const [loadingState, setLoadingState] = useState({
    isLoading: false,
    title: "",
    message: "",
  });

  // Use custom hooks for data fetching
  const { data: maritalStatuses, isLoading: isLoadingMaritals } =
    useMaritalStatuses();
  const [selectedMaritalStatus, setSelectedMaritalStatus] =
    useState<MaritalModel | null>(null);

  const { data: occupations, isLoading: isLoadingOccupations } =
    useOccupations();
  const [selectedOccupation, setSelectedOccupation] =
    useState<OccupationModel | null>(null);

  const { data: referenceBanks, isLoading: isLoadingReferenceBanks } =
    useReferenceBanks();
  const [selectedReferenceBank, setSelectedReferenceBank] =
    useState<ReferenceModel | null>(null);

  const [staffCode, setStaffCode] = useState<string>("");
  const [legalType, setLegalType] = useState<string>("");

  // phone send otp
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [resetOtp, setResetOtp] = useState(false);
  const [datePickerKey, setDatePickerKey] = useState(0);

  // Validation errors state
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  // Get current locale language
  const { locale: currentLocale } = useClientLocale();
  const translate = useTranslations("NIDPage");
  const translateSelect = useTranslations("common");

  // Helper function to get marital name based on locale
  const getMaritalName = (marital: MaritalModel) => {
    return currentLocale === "kh" ? marital.nameKh : marital.nameEn;
  };

  // Helper function to get occupation name based on locale
  const getOccupationName = (occupation: OccupationModel) => {
    return currentLocale === "kh" ? occupation.nameKh : occupation.nameEn;
  };

  // Helper function to get reference bank name based on locale
  const getReferenceName = (reference: ReferenceModel) => {
    return currentLocale === "kh" ? reference.nameKh : reference.nameEn;
  };

  // Helper function to convert gender to API format
  const convertGenderToAPI = (gender: string): string => {
    if (gender.toLowerCase() === "male" || gender.toLowerCase() === "m") {
      return "MALE";
    } else if (
      gender.toLowerCase() === "female" ||
      gender.toLowerCase() === "f"
    ) {
      return "FEMALE";
    }
    return gender.toUpperCase();
  };

  // Helper function to get marital status string
  const getMaritalStatusString = (maritalId: string): string => {
    const marital = maritalStatuses.find((m) => m.id.toString() === maritalId);
    if (marital) {
      return marital.nameEn.toUpperCase().replace(/\s+/g, ".");
    }
    return "SINGLE";
  };

  // Validate a single field
  const validateField = (fieldName: keyof NIDFormData, value: any) => {
    try {
      const fieldSchema = NIDFormSchema.shape[fieldName];
      fieldSchema.parse(value);
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldName];
        return newErrors;
      });
    } catch (error: any) {
      if (error.issues?.[0]) {
        setValidationErrors((prev) => ({
          ...prev,
          [fieldName]: error.issues[0].message,
        }));
      }
    }
  };

  // Validation handler from OTP component
  const handleValidationChange = useCallback(
    (field: string, error: string | null) => {
      setValidationErrors((prev) => {
        const newErrors = { ...prev };
        if (error) {
          newErrors[field] = error;
        } else {
          delete newErrors[field];
        }
        return newErrors;
      });
    },
    []
  );

  // Validate entire form for verification
  const validateVerificationForm = (): boolean => {
    const verificationData = {
      idImage: uploadedImage?.idImage || "",
      selfieImage: selfieImage || "",
      lastNameKh: formData.lastNameKh,
      firstNameKh: formData.firstNameKh,
      lastNameEn: formData.lastNameEn,
      firstNameEn: formData.firstNameEn,
      dob: formData.dob,
      gender: formData.gender,
      idNumber: formData.idNumber,
      address: formData.address,
      pob: formData.pob,
    };

    const result = NIDVerificationSchema.safeParse(verificationData);

    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        const path = err.path.join(".");
        errors[path] = err.message;
      });
      setValidationErrors((prev) => ({ ...prev, ...errors }));
      return false;
    }

    return true;
  };

  // Validate entire form for final submission
  const validateFullForm = (): boolean => {
    const fullData: NIDFormData = {
      idImage: uploadedImage?.idImage || "",
      selfieImage: selfieImage || "",
      lastNameKh: formData.lastNameKh,
      firstNameKh: formData.firstNameKh,
      lastNameEn: formData.lastNameEn,
      firstNameEn: formData.firstNameEn,
      dob: formData.dob,
      gender: formData.gender,
      idNumber: formData.idNumber,
      address: formData.address,
      pob: formData.pob,
      legalType: legalType,
      maritalStatus: selectedMaritalStatus?.nameEn || "",
      occupation: selectedOccupation?.occupationCode || "",
      branch: selectedBranch?.branchkh || "",
      referenceBank: selectedReferenceBank?.nameEn || "",
      staffCode: staffCode,
      phoneNumber: phoneNumber,
      isPhoneVerified: isPhoneVerified,
    };

    const result = NIDFormSchema.safeParse(fullData);

    if (!result.success) {
      const errors: Record<string, string> = {};
      result.error.issues.forEach((err) => {
        const path = err.path.join(".");
        errors[path] = err.message;
      });
      setValidationErrors((prev) => ({ ...prev, ...errors }));
      return false;
    }

    return true;
  };

  const handleImageUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error("File too large", {
          description: "Image must be less than 5MB.",
        });
        return;
      }

      setLoadingState({
        isLoading: true,
        title: translate("extracting_data") || "Extracting Data",
        message:
          translate("extracting") || "Extracting information from ID card...",
      });

      try {
        const base64WithPrefix = await convertToBase64(file);
        const base64ForService = base64WithPrefix.split(",")[1];

        const imageRequestData: RequestIdImage = {
          applicationName: "DEVELOPMENT",
          idImage: base64ForService,
        };

        setImageData(imageRequestData);
        setUploadedImage({
          idImage: base64WithPrefix,
        });
        setImagePreview(base64WithPrefix);

        // Validate image field
        validateField("idImage", base64WithPrefix);

        await handleExtractNID(imageRequestData);
      } catch (error) {
        console.error("Error converting image to base64", error);
        toast.error("Image processing error", {
          description: "Failed to process the image. Please try again.",
        });
      } finally {
        setLoadingState({
          isLoading: false,
          title: "",
          message: "",
        });
      }
    }
  };

  const handleSelfieUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (file) {
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error("File too large", {
          description: "Image must be less than 5MB.",
        });
        return;
      }

      try {
        const base64WithPrefix = await convertToBase64(file);
        const base64ForService = base64WithPrefix.split(",")[1];
        setSelfieImage(base64ForService);
        setSelfiePreview(base64WithPrefix);

        // Validate selfie field
        validateField("selfieImage", base64WithPrefix);

        toast.success("Selfie uploaded successfully!");
      } catch (error) {
        console.error("Error uploading selfie", error);
        toast.error("Failed to upload selfie");
      }
    }
  };

  const convertToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        if (typeof reader.result === "string") {
          resolve(reader.result);
        } else {
          reject(new Error("Failed to convert file to base64"));
        }
      };
      reader.onerror = (error) => reject(error);
    });
  };

  const handleExtractNID = async (imageRequestData?: RequestIdImage) => {
    const dataToProcess = imageRequestData || imageData;

    if (!dataToProcess) {
      toast.error("No image data", {
        description: "Please upload an image first.",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await extractNIDService(dataToProcess);

      const normalizedData = {
        ...response,
        dob: formatDateForInput(response.dob),
        gender: normalizeGender(response.gender),
      };

      console.log("Normalized data:", normalizedData);
      setFormData(normalizedData);

      // Validate all extracted fields to clear any validation errors
      validateField("lastNameKh", normalizedData.lastNameKh);
      validateField("firstNameKh", normalizedData.firstNameKh);
      validateField("lastNameEn", normalizedData.lastNameEn);
      validateField("firstNameEn", normalizedData.firstNameEn);
      validateField("dob", normalizedData.dob);
      validateField("gender", normalizedData.gender);
      validateField("idNumber", normalizedData.idNumber);
      validateField("address", normalizedData.address);
      validateField("pob", normalizedData.pob);

      AppToast({
        type: "success",
        message: "NID extracted successfully!",
        description: "Extract NID Card",
      });
    } catch (error: any) {
      console.error("Error response:", error.response?.data);

      toast.error("Extraction error", {
        description:
          error.response?.data?.message ||
          error.message ||
          "Failed to extract NID information.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleValidateNID = async () => {
    setIsValidating(true);
    try {
      const validationData: RequestValidModel = {
        applicationName: "DEVELOPMENT",
        idNumber: formData.idNumber,
        lastNameKh: formData.lastNameKh,
        firstNameKh: formData.firstNameKh,
        lastNameEn: formData.lastNameEn,
        firstNameEn: formData.firstNameEn,
        dob: formatDate(formData.dob),
        gender: convertGenderForAPI(formData.gender),
        expiredDate: formatDate(formData.expiredDate),
        issuedDate: formatDate(formData.issuedDate),
        address: formData.address,
        pob: formData.pob,
        MRZ1: formData.MRZ1,
        MRZ2: formData.MRZ2,
        MRZ3: formData.MRZ3,
      };

      const response = await validateNIDService(validationData);

      setValidationResult(response);

      const criticalFields = ["lastNameEn", "firstNameEn", "dob", "gender"];
      const hasCriticalErrors = response.data.incorrectFields.some(
        (field: string) => criticalFields.includes(field)
      );

      if (hasCriticalErrors) {
        setShowErrorModal(true);
      } else {
        setShowLocationModal(true);
      }
    } catch (error: any) {
      setValidationErrorData({
        title: translate("valid_fail"),
        message: error.apiMessage || "Failed to validate NID information.",
        description: error.uiMessage || "",
      });
      setShowValidationErrorModal(true);
    } finally {
      setIsValidating(false);
    }
  };

  const handleOpenConfirmModal = () => {
    // Validate both forms simultaneously
    const isVerificationValid = validateVerificationForm();
    const isFullFormValid = validateFullForm();

    // Only show confirmation modal if both validations pass
    if (isVerificationValid && isFullFormValid) {
      setShowConfirmationModal(true);
    } else {
      // Show toast with first error
      const firstErrorKey = Object.keys(validationErrors)[0];
      if (firstErrorKey) {
        AppToast({
          type: "error",
          message: "Validation Error",
          description: validationErrors[firstErrorKey],
        });
      }
    }
  };

  const handleConfirmValidation = async () => {
    setShowConfirmationModal(false);
    await handleValidateNID();
  };

  const handleLocationSubmit = (data: LocationSubmitData) => {
    console.log("### Location data submitted:", data);

    setLocationData(data);

    const addressParts = [
      data.currentAddress.village?.villageKh,
      data.currentAddress.commune?.communeKh,
      data.currentAddress.district?.districtKh,
      data.currentAddress.province?.provinceKh,
    ].filter(Boolean);

    const currentAddressString = addressParts.join(" ");

    const pobParts = [
      data.placeOfBirth.village?.villageKh,
      data.placeOfBirth.commune?.communeKh,
      data.placeOfBirth.district?.districtKh,
      data.placeOfBirth.province?.provinceKh,
    ].filter(Boolean);

    const placeOfBirthString = pobParts.join(" ");

    setFormData((prev) => ({
      ...prev,
      address: currentAddressString,
      pob: placeOfBirthString,
    }));

    // Validate updated fields
    validateField("address", currentAddressString);
    validateField("pob", placeOfBirthString);

    console.log("Updated Address:", currentAddressString);
    console.log("Updated Place of Birth:", placeOfBirthString);

    // Set isVerified to true ONLY after successful location submission
    setIsVerified(true);

    AppToast({
      type: "success",
      message:
        currentLocale === "kh"
          ? "ព័ត៌មានទីតាំងត្រូវបានរក្សាទុកដោយជោគជ័យ!"
          : "Location information saved successfully!",
      description:
        currentLocale === "kh"
          ? "ទិន្នន័យទីតាំងត្រូវបានកត់ត្រា។"
          : "Location data has been recorded.",
    });

    setShowLocationModal(false);
  };

  const handleInputChange = (field: keyof ResponseNID, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
    validateField(field as keyof NIDFormData, value);
  };

  // Handle Submit Account Opening
  const handleSubmitAccount = async () => {
    setLoadingState({
      isLoading: true,
      title: translate("submitting") || "Submitting",
      message: translate("submitting_message") || "Creating your account...",
    });

    try {
      const nidImageBase64 =
        uploadedImage!.idImage.split(",")[1] || uploadedImage!.idImage;

      const accountData: CreateOpenAccountReq = {
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
        legalDocType: "NATIONAL.ID",
        legalMrz1: formData.MRZ1,
        legalMrz2: formData.MRZ2,
        legalMrz3: formData.MRZ3,
        phoneNumber: phoneNumber,
        nidImage: nidImageBase64,
        selfieImage: selfieImage || "",
      };

      console.log("=== ACCOUNT OPENING SUBMISSION DATA ===");
      console.log(JSON.stringify(accountData, null, 2));
      console.log("=======================================");

      // TODO: Replace with your actual API call
      const response = await createOpenAccountService(accountData);

      console.log("API Response:", response);

      // Show success modal with response data
      setSuccessData({
        title: translate("success_title") || "Account Created Success",
        message:
          response?.message || "Your account has been created successfully!",
      });
      setShowSuccessModal(true);

      // Optional: Clear form after successful submission
      // handleClear();
    } catch (error: any) {
      console.error("Account opening error:", error);

      // Extract error message from the service open acc online
      const errorMessage =
        error?.errorMessage ||
        error?.message ||
        "Failed to create account. Please try again.";
      // Show error modal
      setSubmitErrorData({
        title: translate("error_title") || "Submission Failed",
        message: errorMessage,
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

  const clearInput: ResponseNID = {
    idNumber: "",
    lastNameKh: "",
    firstNameKh: "",
    dob: "",
    gender: "",
    lastNameEn: "",
    firstNameEn: "",
    expiredDate: "",
    issuedDate: "",
    address: "",
    pob: "",
    MRZ1: "",
    MRZ2: "",
    MRZ3: "",
  };

  const handleClear = () => {
    setFormData(clearInput);
    setUploadedImage(null);
    setImagePreview(null);
    setImageData(null);
    setSelfieImage(null);
    setSelfiePreview(null);
    setValidationResult(null);
    setIsVerified(false);
    setIsPhoneVerified(false);
    setSelectedMaritalStatus(null);
    setSelectedOccupation(null);
    setSelectedReferenceBank(null);
    setSelectedBranch(null);
    setLegalType("");
    setStaffCode("");
    setPhoneNumber("");
    setValidationErrors({});
    setLocationData({
      currentAddress: {
        province: null,
        district: null,
        commune: null,
        village: null,
      },
      placeOfBirth: {
        province: null,
        district: null,
        commune: null,
        village: null,
      },
    });
    setLocationFormData({
      province: "",
      district: "",
      commune: "",
      village: "",
    });

    // Force date picker to reset by changing its key
    setDatePickerKey((prev) => prev + 1);

    // Trigger OTP reset
    setResetOtp(true);
    setTimeout(() => setResetOtp(false), 100);

    const fileInput = document.getElementById(
      "image-upload"
    ) as HTMLInputElement;
    if (fileInput) {
      fileInput.value = "";
    }

    const selfieInput = document.getElementById(
      "image-upload-user"
    ) as HTMLInputElement;
    if (selfieInput) {
      selfieInput.value = "";
    }
  };

  const handleSuccessModalClose = () => {
    setShowSuccessModal(false);
    // Optional: Clear form after closing success modal
    handleClear();
  };

  const onBranchChange = useCallback(
    (branch: BranchModel) => {
      setSelectedBranch(branch);
      validateField("branch", branch.branchkh);
    },
    [selectedBranch]
  );

  return (
    <div className="flex flex-col h-screen">
      {/* Sticky Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b shadow-sm px-5">
        <div className="mx-auto lg:px-10 md:px-5 sm:px-0 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <img src="/app/CP-bank-Logo.png" alt="Bank Logo" className="h-12" />
          </div>
          <LanguageSwitcher variant="flag-only" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pt-16 md:pt-20 pb-0">
        <div className="lg:px-16 md:px-4 py-8">
          <Card className="p-8 mb-6 shadow-lg">
            <div className="mx-auto">
              <div className="mb-8 flex justify-between">
                <h1 className="text-lg md:text-3xl text-gray-800 mb-2">
                  {translate("header_acc")}
                </h1>
                <Button onClick={handleClear}>{translate("clear")}</Button>
              </div>

              {/* Add the Loading Modal when extract */}
              <LoadingModal
                isOpen={loadingState.isLoading}
                title={loadingState.title}
                message={loadingState.message}
              />

              {/* ID Card and Selfie Upload Section */}
              <div className="flex md:flex-row flex-col justify-evenly items-center mb-16 lg:gap-14 gap-8">
                <div>
                  <p className="text-base text-gray-600 mb-4 text-center">
                    {translate("img_card")}
                  </p>
                  <div className="relative">
                    <div className="absolute lg:-top-5 -top-3 lg:-left-6 -left-3 w-9 h-6 border-l-2 border-t-2 border-gray-400"></div>
                    <div className="absolute lg:-top-5 -top-3 lg:-right-6 -right-3 w-9 h-6 border-r-2 border-t-2 border-gray-400"></div>
                    <div className="absolute lg:-bottom-5 -bottom-3 lg:-left-6 -left-3 w-9 h-6 border-l-2 border-b-2 border-gray-400"></div>
                    <div className="absolute lg:-bottom-5 -bottom-3 lg:-right-6 -right-3 w-9 h-6 border-r-2 border-b-2 border-gray-400"></div>
                    <div
                      className={`relative lg:w-96 w-80 h-60 bg-gray-100 rounded overflow-hidden cursor-pointer hover:opacity-90 transition-opacity ${
                        validationErrors.idImage
                          ? "border-2 border-red-500"
                          : ""
                      }`}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        id="image-upload"
                        disabled={isLoading || isValidating || isSubmitting}
                      />
                      <img
                        src={
                          uploadedImage?.idImage ||
                          "/app/identity-card.png?height=192&width=320"
                        }
                        alt="ID Card"
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                  {validationErrors.idImage && (
                    <p className="text-xs text-red-500 mt-2 text-center">
                      {validationErrors.idImage}
                    </p>
                  )}
                </div>

                <div>
                  <p className="text-base text-gray-600 mb-4 text-center">
                    {translate("img_selfie")}
                  </p>
                  <div className="relative">
                    <div className="absolute lg:-top-5 -top-3 lg:-left-6 -left-3 w-9 h-6 border-l-2 border-t-2 border-gray-400"></div>
                    <div className="absolute lg:-top-5 -top-3 lg:-right-6 -right-3 w-9 h-6 border-r-2 border-t-2 border-gray-400"></div>
                    <div className="absolute lg:-bottom-5 -bottom-3 lg:-left-6 -left-3 w-9 h-6 border-l-2 border-b-2 border-gray-400"></div>
                    <div className="absolute lg:-bottom-5 -bottom-3 lg:-right-6 -right-3 w-9 h-6 border-r-2 border-b-2 border-gray-400"></div>
                    <div
                      className={`relative lg:w-96 w-80 h-60 bg-gray-100 rounded overflow-hidden cursor-pointer hover:opacity-90 transition-opacity ${
                        validationErrors.selfieImage
                          ? "border-2 border-red-500"
                          : ""
                      }`}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleSelfieUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        id="image-upload-user"
                        disabled={isLoading || isValidating || isSubmitting}
                      />
                      <img
                        src={
                          selfiePreview ||
                          "/app/image_selfie.jpg?height=192&width=320"
                        }
                        alt="Selfie"
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                  {validationErrors.selfieImage && (
                    <p className="text-xs text-red-500 mt-2 text-center">
                      {validationErrors.selfieImage}
                    </p>
                  )}
                </div>
              </div>

              {/* Form Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name (KH) */}
                <div className="space-y-1">
                  <Label htmlFor="lastNameKh" className="text-sm sm:text-base">
                    {translate("firstNameKh")}
                  </Label>
                  <Input
                    id="lastNameKh"
                    placeholder={translate("firstNameKh")}
                    value={formData.lastNameKh}
                    onChange={(e) =>
                      handleInputChange("lastNameKh", e.target.value)
                    }
                    className={`w-full h-10 text-sm ${
                      validationErrors.lastNameKh ? "border-red-500" : ""
                    }`}
                    disabled={isLoading || isValidating || isSubmitting}
                  />
                  {validationErrors.lastNameKh && (
                    <p className="text-xs text-red-500">
                      {validationErrors.lastNameKh}
                    </p>
                  )}
                </div>

                {/* Last Name (KH) */}
                <div className="space-y-1">
                  <Label htmlFor="firstNameKh" className="text-sm sm:text-base">
                    {translate("lastNameKH")}
                  </Label>
                  <Input
                    id="firstNameKh"
                    placeholder={translate("lastNameKH")}
                    value={formData.firstNameKh}
                    onChange={(e) =>
                      handleInputChange("firstNameKh", e.target.value)
                    }
                    className={`w-full h-10 text-sm ${
                      validationErrors.firstNameKh ? "border-red-500" : ""
                    }`}
                    disabled={isLoading || isValidating || isSubmitting}
                  />
                  {validationErrors.firstNameKh && (
                    <p className="text-xs text-red-500">
                      {validationErrors.firstNameKh}
                    </p>
                  )}
                </div>

                {/* Family Name */}
                <div className="space-y-1">
                  <Label htmlFor="lastNameEn" className="text-sm sm:text-base">
                    {translate("familyNameEn")}
                  </Label>
                  <Input
                    id="lastNameEn"
                    placeholder={translate("familyNameEn")}
                    value={formData.lastNameEn}
                    onChange={(e) =>
                      handleInputChange("lastNameEn", e.target.value)
                    }
                    className={`w-full h-10 text-sm ${
                      validationErrors.lastNameEn ? "border-red-500" : ""
                    }`}
                    disabled={isLoading || isValidating || isSubmitting}
                  />
                  {validationErrors.lastNameEn && (
                    <p className="text-xs text-red-500">
                      {validationErrors.lastNameEn}
                    </p>
                  )}
                </div>

                {/* Given Name */}
                <div className="space-y-1">
                  <Label htmlFor="firstNameEn" className="text-sm sm:text-base">
                    {translate("givenNameEn")}
                  </Label>
                  <Input
                    id="firstNameEn"
                    placeholder={translate("givenNameEn")}
                    value={formData.firstNameEn}
                    onChange={(e) =>
                      handleInputChange("firstNameEn", e.target.value)
                    }
                    className={`w-full h-10 text-sm ${
                      validationErrors.firstNameEn ? "border-red-500" : ""
                    }`}
                    disabled={isLoading || isValidating || isSubmitting}
                  />
                  {validationErrors.firstNameEn && (
                    <p className="text-xs text-red-500">
                      {validationErrors.firstNameEn}
                    </p>
                  )}
                </div>

                {/* Date Of Birth */}
                <div className="space-y-1">
                  <Label htmlFor="dob" className="text-sm sm:text-base">
                    {translate("dateOfBirth")}
                  </Label>
                  <div
                    className={
                      validationErrors.dob
                        ? "border border-red-500 rounded"
                        : ""
                    }
                  >
                    <CustomDatePicker
                      key={datePickerKey}
                      value={formData.dob}
                      onChange={(value) => handleInputChange("dob", value)}
                      disabled={isLoading || isValidating || isSubmitting}
                      placeholder={translate("dateOfBirth")}
                    />
                  </div>
                  {validationErrors.dob && (
                    <p className="text-xs text-red-500">
                      {validationErrors.dob}
                    </p>
                  )}
                </div>

                {/* Gender */}
                <div className="space-y-1">
                  <Label htmlFor="gender" className="text-sm sm:text-base">
                    {translate("gender")}
                  </Label>
                  <Select
                    value={formData.gender || ""}
                    onValueChange={(value) =>
                      handleInputChange("gender", value)
                    }
                    disabled={isLoading || isValidating || isSubmitting}
                  >
                    <SelectTrigger
                      className={`h-10 ${
                        validationErrors.gender ? "border-red-500" : ""
                      }`}
                    >
                      <SelectValue
                        placeholder={translateSelect("selectGender")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Male">Male</SelectItem>
                    </SelectContent>
                  </Select>
                  {validationErrors.gender && (
                    <p className="text-xs text-red-500">
                      {validationErrors.gender}
                    </p>
                  )}
                </div>

                {/* Legal Type */}
                <div className="space-y-1">
                  <Label htmlFor="legalType" className="text-sm sm:text-base">
                    {translate("legalType")}
                  </Label>
                  <Select
                    value={legalType}
                    onValueChange={(value) => {
                      setLegalType(value);
                      validateField("legalType", value);
                    }}
                    disabled={isLoading || isValidating || isSubmitting}
                  >
                    <SelectTrigger
                      className={`h-10 ${
                        validationErrors.legalType ? "border-red-500" : ""
                      }`}
                    >
                      <SelectValue
                        placeholder={translateSelect("selectLegalType")}
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="national-id">
                        National ID Card
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {validationErrors.legalType && (
                    <p className="text-xs text-red-500">
                      {validationErrors.legalType}
                    </p>
                  )}
                </div>

                {/* Legal ID */}
                <div className="space-y-1">
                  <Label htmlFor="idNumber" className="text-sm sm:text-base">
                    {translate("legalId")}
                  </Label>
                  <Input
                    id="idNumber"
                    placeholder={translate("legalId")}
                    value={formData.idNumber}
                    onChange={(e) =>
                      handleInputChange("idNumber", e.target.value)
                    }
                    className={`w-full h-10 text-sm ${
                      validationErrors.idNumber ? "border-red-500" : ""
                    }`}
                    disabled={isLoading || isValidating || isSubmitting}
                  />
                  {validationErrors.idNumber && (
                    <p className="text-xs text-red-500">
                      {validationErrors.idNumber}
                    </p>
                  )}
                </div>

                {/* Address */}
                <div className="space-y-1">
                  <Label htmlFor="address" className="text-sm sm:text-base">
                    {translate("address")}
                  </Label>
                  <Input
                    id="address"
                    placeholder={translate("address")}
                    value={formData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    className={`w-full h-10 text-sm ${
                      validationErrors.address ? "border-red-500" : ""
                    }`}
                    disabled={isLoading || isValidating || isSubmitting}
                  />
                  {validationErrors.address && (
                    <p className="text-xs text-red-500">
                      {validationErrors.address}
                    </p>
                  )}
                </div>

                {/* Place Of Birth */}
                <div className="space-y-1">
                  <Label htmlFor="pob" className="text-sm sm:text-base">
                    {translate("pob")}
                  </Label>
                  <Input
                    id="pob"
                    placeholder={translate("pob")}
                    value={formData.pob}
                    onChange={(e) => handleInputChange("pob", e.target.value)}
                    className={`w-full h-10 text-sm ${
                      validationErrors.pob ? "border-red-500" : ""
                    }`}
                    disabled={isLoading || isValidating || isSubmitting}
                  />
                  {validationErrors.pob && (
                    <p className="text-xs text-red-500">
                      {validationErrors.pob}
                    </p>
                  )}
                </div>

                {/* Marital Status */}
                <div className="md:col-span-2 space-y-1">
                  <Label
                    htmlFor="maritalStatus"
                    className="text-sm sm:text-base"
                  >
                    {translate("marital")}
                  </Label>
                  <Select
                    value={selectedMaritalStatus?.id.toString() || ""}
                    onValueChange={(value) => {
                      const marital = maritalStatuses.find(
                        (m) => m.id.toString() === value
                      );
                      setSelectedMaritalStatus(marital || null);
                      validateField("maritalStatus", value);
                    }}
                    disabled={isLoading || isValidating || isLoadingMaritals}
                  >
                    <SelectTrigger
                      className={`w-full h-10 text-sm ${
                        validationErrors.maritalStatus ? "border-red-500" : ""
                      }`}
                    >
                      <SelectValue
                        placeholder={
                          isLoadingMaritals
                            ? translate("loading")
                            : translateSelect("selectMarital")
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {maritalStatuses.map((marital) => (
                        <SelectItem
                          key={marital.id}
                          value={marital.id.toString()}
                        >
                          {getMaritalName(marital)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationErrors.maritalStatus && (
                    <p className="text-xs text-red-500">
                      {validationErrors.maritalStatus}
                    </p>
                  )}
                </div>

                {/* Occupation */}
                <div className="space-y-1">
                  <Label htmlFor="occupation" className="text-sm sm:text-base">
                    {translate("occupation")}
                  </Label>
                  <Select
                    value={selectedOccupation?.id.toString() || ""}
                    onValueChange={(value) => {
                      const occupation = occupations.find(
                        (o) => o.id.toString() === value
                      );
                      setSelectedOccupation(occupation || null);
                      validateField("occupation", value);
                    }}
                    disabled={isLoading || isValidating || isLoadingOccupations}
                  >
                    <SelectTrigger
                      className={`w-full h-10 text-sm ${
                        validationErrors.occupation ? "border-red-500" : ""
                      }`}
                    >
                      <SelectValue
                        placeholder={
                          isLoadingOccupations
                            ? translate("loading")
                            : translateSelect("selectOccupation")
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {occupations.map((occupation) => (
                        <SelectItem
                          key={occupation.id}
                          value={occupation.id.toString()}
                        >
                          {getOccupationName(occupation)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationErrors.occupation && (
                    <p className="text-xs text-red-500">
                      {validationErrors.occupation}
                    </p>
                  )}
                </div>

                {/* Branch */}
                <div className="space-y-1">
                  <Label htmlFor="branch" className="text-sm sm:text-base">
                    {translate("branch")}
                  </Label>
                  <div
                    className={
                      validationErrors.branch
                        ? "border border-red-500 rounded"
                        : ""
                    }
                  >
                    <ComboboxSelectBranch
                      dataSelect={selectedBranch}
                      onChangeSelected={onBranchChange}
                      disabled={isLoading || isValidating || isSubmitting}
                    />
                  </div>
                  {validationErrors.branch && (
                    <p className="text-xs text-red-500">
                      {validationErrors.branch}
                    </p>
                  )}
                </div>

                {/* Reference */}
                <div className="md:col-span-2 space-y-1">
                  <Label htmlFor="reference" className="text-sm sm:text-base">
                    {translate("reference")}
                  </Label>
                  <div className="flex">
                    <Select
                      value={selectedReferenceBank?.id.toString() || ""}
                      onValueChange={(value) => {
                        const reference = referenceBanks.find(
                          (r) => r.id.toString() === value
                        );
                        setSelectedReferenceBank(reference || null);
                        validateField("referenceBank", value);
                      }}
                      disabled={
                        isLoading || isValidating || isLoadingReferenceBanks
                      }
                    >
                      <SelectTrigger
                        className={`w-40 h-10 rounded-r-none ${
                          validationErrors.referenceBank ? "border-red-500" : ""
                        }`}
                      >
                        <SelectValue
                          placeholder={
                            isLoadingReferenceBanks
                              ? translate("loading")
                              : translateSelect("selectRef")
                          }
                        />
                      </SelectTrigger>
                      <SelectContent>
                        {referenceBanks.map((reference) => (
                          <SelectItem
                            key={reference.id}
                            value={reference.id.toString()}
                          >
                            {getReferenceName(reference)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder={translate("staffCode")}
                      value={staffCode}
                      onChange={(e) => {
                        setStaffCode(e.target.value);
                        validateField("staffCode", e.target.value);
                      }}
                      className="flex-1 h-10 !rounded-l-none text-sm"
                      disabled={isLoading || isValidating || isSubmitting}
                    />
                  </div>
                  {validationErrors.referenceBank && (
                    <p className="text-xs text-red-500">
                      {validationErrors.referenceBank}
                    </p>
                  )}
                  {validationErrors.staffCode && (
                    <p className="text-xs text-red-500">
                      {validationErrors.staffCode}
                    </p>
                  )}
                </div>

                {/* Contact Number & OTP Code */}
                <OTPInput
                  phoneNumber={phoneNumber}
                  onPhoneChange={(value) => {
                    setPhoneNumber(value);
                    validateField("phoneNumber", value);
                  }}
                  onVerificationSuccess={() => {
                    console.log("Phone verified:", phoneNumber);
                    setIsPhoneVerified(true);
                    validateField("isPhoneVerified", true);
                  }}
                  disabled={isLoading || isValidating || isSubmitting}
                  validationErrors={validationErrors}
                  onValidationChange={handleValidationChange}
                  reset={resetOtp}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 mt-8">
                <Button
                  className="px-8 py-2 bg-orange-400 hover:bg-orange-500 text-white rounded-md"
                  onClick={handleOpenConfirmModal}
                  disabled={isLoading || isValidating || isVerified}
                >
                  {isValidating
                    ? translate("processing")
                    : translate("verification")}
                </Button>
                <Button
                  className="px-8 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md"
                  onClick={handleSubmitAccount}
                  disabled={isLoading || isValidating || !isVerified}
                >
                  {translate("submit")}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <Footer />
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={showConfirmationModal}
        onConfirm={handleConfirmValidation}
        onCancel={() => setShowConfirmationModal(false)}
        title={translate("cfTitle")}
        message={translate("cfMessage")}
      />

      {/* Location Modal - Shows on successful validation */}
      <LocationModal
        isOpen={showLocationModal}
        onClose={() => setShowLocationModal(false)}
        onSubmit={handleLocationSubmit}
        formData={locationFormData}
        setFormData={setLocationFormData}
        addressFromForm={formData.address}
        placeOfBirthFromForm={formData.pob}
      />

      {/* Error Modal */}
      <ErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        data={
          validationResult?.data
            ? {
                score: validationResult.data.score,
                incorrectFields: validationResult.data.incorrectFields,
              }
            : null
        }
      />

      {/* Validation Error Modal */}
      <ValidationErrorModal
        isOpen={showValidationErrorModal}
        onClose={() => setShowValidationErrorModal(false)}
        title={validationErrorData.title}
        message={validationErrorData.message}
        description={validationErrorData.description}
      />

      {/* Success Modal - NEW */}
      <SubmitSuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessModalClose}
        title={successData.title}
        message={successData.message}
      />

      {/* Submit Error Modal - NEW */}
      <SubmitErrorModal
        isOpen={showSubmitErrorModal}
        onClose={() => setShowSubmitErrorModal(false)}
        title={submitErrorData.title}
        message={submitErrorData.message}
      />
    </div>
  );
}
