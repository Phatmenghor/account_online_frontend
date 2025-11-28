import { useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { RequestValidModel } from "@/models/open-acc-online/nid.request.model";
import {
    ResponseNID,
    ValidationResponse,
} from "@/models/open-acc-online/nid.response.model";
import { validateNIDService } from "@/services/acc-online/nid.service";
import {
    convertGenderForAPI,
    formatDate,
} from "@/constants/AppResource/format-date/format-dd-mm-yyyy";
import { MaritalModel } from "@/models/static/marital/marital.response";
import { useClientLocale } from "@/context/provider/local-provider";
import { OccupationModel } from "@/models/static/occupation/occupation.response";
import { ReferenceModel } from "@/models/static/reference/reference.response";
import { AppToast } from "@/components/shared/toast/app-toast";
import { BranchModel } from "@/models/branch/branch.response";
import {
    NIDFormData,
    NIDFormSchema,
    NIDVerificationSchema,
} from "@/components/acc-online/form-field/form-validate-error";
import { LegalTypeModel } from "@/models/static/legal-type/legal-type.response";
import {
    LocationData,
    LocationSubmitData,
} from "@/models/open-acc-online/address/open-acc-address.request.model";

interface UseOpenAccountProps {
    selectedMaritalStatus: MaritalModel | null;
    selectedOccupation: OccupationModel | null;
    selectedReferenceBank: ReferenceModel | null;
    selectedLegalType: LegalTypeModel | null;
    resetMasterData: () => void;
}

export const useOpenAccount = ({
    selectedMaritalStatus,
    selectedOccupation,
    selectedReferenceBank,
    selectedLegalType,
    resetMasterData,
}: UseOpenAccountProps) => {
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

    const [staffCode, setStaffCode] = useState<string>("");

    const [isVerified, setIsVerified] = useState(false);
    const [datePickerKey, setDatePickerKey] = useState(0);

    // Validation errors state
    const [validationErrors, setValidationErrors] = useState<
        Record<string, string>
    >({});

    // Get current locale language
    const { locale: currentLocale } = useClientLocale();
    const translate = useTranslations("NIDPage");
    const translateSelect = useTranslations("common");

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

    // Validate entire form for verification - accepts images as parameters
    const validateVerificationForm = (
        uploadedImageData: string,
        selfieImageData: string
    ): boolean => {
        const verificationData = {
            idImage: uploadedImageData || "",
            selfieImage: selfieImageData || "",
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

    // Validate entire form for final submission - accepts all required data as parameters
    const validateFullForm = (
        uploadedImageData: string,
        selfieImageData: string,
        phoneNumberData: string,
        isPhoneVerifiedData: boolean
    ): boolean => {
        const fullData: NIDFormData = {
            idImage: uploadedImageData || "",
            selfieImage: selfieImageData || "",
            lastNameKh: formData.lastNameKh,
            firstNameKh: formData.firstNameKh,
            lastNameEn: formData.lastNameEn,
            firstNameEn: formData.firstNameEn,
            dob: formData.dob,
            gender: formData.gender,
            idNumber: formData.idNumber,
            address: formData.address,
            pob: formData.pob,
            legalType: selectedLegalType?.legalTypeValue || "",
            maritalStatus: selectedMaritalStatus?.nameEn || "",
            occupation: selectedOccupation?.occupationCode || "",
            branch: selectedBranch?.branchkh || "",
            referenceBank: selectedReferenceBank?.nameEn || "",
            staffCode: staffCode,
            phoneNumber: phoneNumberData,
            isPhoneVerified: isPhoneVerifiedData,
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

    const handleValidateNID = async () => {
        setIsValidating(true);
        try {
            const validationData: RequestValidModel = {
                applicationName: "ACCOUNT_ONLINE",
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

    const handleOpenConfirmModal = (
        uploadedImageData: string,
        selfieImageData: string,
        phoneNumberData: string,
        isPhoneVerifiedData: boolean
    ) => {
        // Validate both forms simultaneously
        const isVerificationValid = validateVerificationForm(
            uploadedImageData,
            selfieImageData
        );
        const isFullFormValid = validateFullForm(
            uploadedImageData,
            selfieImageData,
            phoneNumberData,
            isPhoneVerifiedData
        );

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

    const handleClear = (
        clearImagesCallback: () => void,
        clearOtpCallback: () => void
    ) => {
        setFormData(clearInput);
        clearImagesCallback();
        clearOtpCallback();
        setValidationResult(null);
        setIsVerified(false);
        resetMasterData();
        setSelectedBranch(null);
        setStaffCode("");
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
    };

    const handleSuccessModalClose = (
        clearImagesCallback: () => void,
        clearOtpCallback: () => void
    ) => {
        setShowSuccessModal(false);
        // Clear form after closing success modal
        handleClear(clearImagesCallback, clearOtpCallback);
    };

    const onBranchChange = useCallback(
        (branch: BranchModel) => {
            setSelectedBranch(branch);
            validateField("branch", branch.branchkh);
        },
        [selectedBranch]
    );

    return {
        formData,
        setFormData,
        isLoading,
        isValidating,
        isSubmitting,
        showLocationModal,
        setShowLocationModal,
        showErrorModal,
        setShowErrorModal,
        validationResult,
        showValidationErrorModal,
        setShowValidationErrorModal,
        validationErrorData,
        showConfirmationModal,
        setShowConfirmationModal,
        selectedBranch,
        showSuccessModal,
        successData,
        setSuccessData,
        showSubmitErrorModal,
        setShowSubmitErrorModal,
        setSubmitErrorData,
        submitErrorData,
        locationData,
        locationFormData,
        setLocationFormData,
        loadingState,
        setLoadingState,
        staffCode,
        setStaffCode,
        setShowSuccessModal,
        isVerified,
        datePickerKey,
        validationErrors,
        translate,
        translateSelect,
        convertGenderToAPI,
        validateField,
        handleValidationChange,
        handleOpenConfirmModal,
        handleConfirmValidation,
        handleLocationSubmit,
        handleInputChange,
        handleClear,
        handleSuccessModalClose,
        onBranchChange,
    };
};
