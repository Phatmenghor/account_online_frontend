"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { CheckCircle, CreditCard, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RequestIdImage, RequestValidModel } from "@/models/acc-online/nid.request.model";
import { ResponseNID, ValidationResponse } from "@/models/acc-online/nid.response.model";
import { extractNIDService, validateNIDService } from "@/services/acc-online/nid.service";
import { convertGenderForAPI, formatDate } from "@/constants/AppResource/format-date/format-dd-mm-yyyy";
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
import { formatDateForInput, normalizeGender } from "@/utils/format/BranchFormat";
import { useBranches, useMaritalStatuses, useOccupations, useReferenceBanks } from "@/hooks/fetch-master";
import { AppToast } from "@/components/shared/toast/app-toast";
import { ComboboxSelectBranch } from "@/components/shared/combo-box/combobox-branch";
import ConfirmationModal from "@/components/acc-online/confirmModal";
import LocationModal from "@/components/acc-online/addressModal";
import { CommuneModel, DistrictModel, ProvinceModel, VillageModel } from "@/models/address/address.response";
import OTPInput from "@/components/acc-online/form-field/form-otp";

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
    province: ProvinceModel | null
    district: DistrictModel | null
    commune: CommuneModel | null
    village: VillageModel | null
  }
  placeOfBirth: {
    province: ProvinceModel | null
    district: DistrictModel | null
    commune: CommuneModel | null
    village: VillageModel | null
  }
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
    pob: ""
  });
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<Image | null>(null);

  // Separate state for selfie
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [showLocationModal, setShowLocationModal] = useState(false); // Changed from showSuccessModal
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [validationResult, setValidationResult] = useState<ValidationResponse | null>(null);

  const [showValidationErrorModal, setShowValidationErrorModal] = useState(false);
  const [validationErrorData, setValidationErrorData] = useState({
    title: "",
    message: "",
    description: "",
  });

  const [showConfirmationModal, setShowConfirmationModal] = useState(false);

  // Location data state
  const [locationData, setLocationData] = useState<LocationData>({
    province: "",
    district: "",
    commune: "",
    village: "",
  });

  // Use custom hooks for data fetching
  const { data: maritalStatuses, isLoading: isLoadingMaritals } = useMaritalStatuses();
  const [selectedMaritalStatus, setSelectedMaritalStatus] = useState<string>("");

  const { data: occupations, isLoading: isLoadingOccupations } = useOccupations();
  const [selectedOccupation, setSelectedOccupation] = useState<string>("");

  const { data: referenceBanks, isLoading: isLoadingReferenceBanks } = useReferenceBanks();
  const [selectedReferenceBank, setSelectedReferenceBank] = useState<string>("");

  const { data: branches, isLoading: isLoadingBranches } = useBranches();
  const [selectedBranch, setSelectedBranch] = useState<string>("");

  const [staffCode, setStaffCode] = useState<string>("");

  // phone send otp
  const [phoneNumber, setPhoneNumber] = useState("");

  // Get current locale
  const { locale: currentLocale } = useClientLocale();

  // change language
  const translate = useTranslations("NIDPage");

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

      setIsLoading(true);
      try {
        // Convert to base64 with data URL prefix for preview
        const base64WithPrefix = await convertToBase64(file);
        // Get base64 without prefix for service
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

        // Auto-extract NID data when image is uploaded
        await handleExtractNID(imageRequestData);
      } catch (error) {
        console.error("Error converting image to base64", error);
        toast.error("Image processing error", {
          description: "Failed to process the image. Please try again.",
        });
        setIsLoading(false);
      }
    }
  };

  // Separate handler for selfie upload
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
        setSelfieImage(base64WithPrefix);
        setSelfiePreview(base64WithPrefix);
        toast.success("Selfie uploaded successfully!");
      } catch (error) {
        console.error("Error uploading selfie", error);
        toast.error("Failed to upload selfie");
      }
    }
  };

  // Function to convert file to base64
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

      // Normalize the data before setting state
      const normalizedData = {
        ...response,
        dob: formatDateForInput(response.dob),
        gender: normalizeGender(response.gender),
      };

      console.log("Normalized data:", normalizedData);
      setFormData(normalizedData);

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
      };

      const response = await validateNIDService(validationData);

      setValidationResult(response);

      // Check if there are incorrect fields that matter for error modal
      const criticalFields = ["lastNameEn", "firstNameEn", "dob", "gender"];
      const hasCriticalErrors = response.data.incorrectFields.some(
        (field: string) => criticalFields.includes(field)
      );

      if (hasCriticalErrors) {
        setShowErrorModal(true);
      } else {
        // Show location modal on success instead of success modal
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
    setShowConfirmationModal(true);
  };

  const handleConfirmValidation = async () => {
    setShowConfirmationModal(false);
    await handleValidateNID();
  };

  const handleLocationSubmit = (data: LocationSubmitData) => {
    console.log("### Location data submitted:", data);

    // Build current address string from Khmer names
    const addressParts = [
      data.currentAddress.village?.villageKh,
      data.currentAddress.commune?.communeKh,
      data.currentAddress.district?.districtKh,
      data.currentAddress.province?.provinceKh
    ].filter(Boolean); // Remove null/undefined values

    const currentAddressString = addressParts.join(" ");

    // Build place of birth string from Khmer names
    const pobParts = [
      data.placeOfBirth.village?.villageKh,
      data.placeOfBirth.commune?.communeKh,
      data.placeOfBirth.district?.districtKh,
      data.placeOfBirth.province?.provinceKh
    ].filter(Boolean); // Remove null/undefined values

    const placeOfBirthString = pobParts.join(" ");

    // Update form data with both address and place of birth
    setFormData(prev => ({
      ...prev,
      address: currentAddressString,
      pob: placeOfBirthString
    }));

    console.log("Updated Address:", currentAddressString);
    console.log("Updated Place of Birth:", placeOfBirthString);

    AppToast({
      type: "success",
      message: currentLocale === "kh"
        ? "ព័ត៌មានទីតាំងត្រូវបានរក្សាទុកដោយជោគជ័យ!"
        : "Location information saved successfully!",
      description: currentLocale === "kh"
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
    pob: ""
  };

  const handleClear = () => {
    setFormData(clearInput);
    setUploadedImage(null);
    setImagePreview(null);
    setImageData(null);
    setSelfieImage(null);
    setSelfiePreview(null);
    setValidationResult(null);
    setSelectedMaritalStatus("");
    setSelectedOccupation("");
    setSelectedReferenceBank("");
    setSelectedBranch("");
    setStaffCode("");
    setLocationData({
      province: "",
      district: "",
      commune: "",
      village: "",
    });

    // Reset file input
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

  return (
    <div className="flex flex-col h-screen">
      {/* Sticky Header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-white border-b shadow-sm px-5">
        <div className="mx-auto lg:px-10 md:px-5 sm:px-0 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <img
              src="/app/CP-bank-Logo.png"
              alt="Bank Logo"
              className="h-12"
            />
          </div>
          <LanguageSwitcher variant="flag-only" />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto pt-20 pb-0">
        <div className="lg:px-16 px-4 py-8">
          <Card className="p-8 mb-6 shadow-lg">
            <div className="mx-auto">
              <div className="mb-8 flex justify-between">
                <h1 className="text-3xl text-gray-800 mb-2">
                  {translate("header_acc")}
                </h1>
                <Button onClick={handleClear}>{translate("clear")}</Button>
              </div>

              {/* Loading indicator */}
              {(isLoading || isValidating) && (
                <div className="flex justify-center items-center space-x-2 mb-6">
                  <Loader2 className="animate-spin h-6 w-6 text-blue-600" />
                  <span className="text-sm text-gray-600">
                    {isLoading ? translate("extracting") : translate("validating")}
                  </span>
                </div>
              )}

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

                    <div className="relative lg:w-96 w-80 h-60 bg-gray-100 rounded overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        id="image-upload"
                        disabled={isLoading || isValidating}
                      />
                      <img
                        src={uploadedImage?.idImage || "/app/identity-card.png?height=192&width=320"}
                        alt="ID Card"
                        className="w-full h-full"
                      />
                    </div>
                  </div>
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

                    <div className="relative lg:w-96 w-80 h-60 bg-gray-100 rounded overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleSelfieUpload}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        id="image-upload-user"
                        disabled={isLoading || isValidating}
                      />
                      <img
                        src={selfiePreview || "/app/image_selfie.jpg?height=192&width=320"}
                        alt="Selfie"
                        className="w-full h-full"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Section */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* First Name (KH) */}
                <FormInputField
                  label={translate("firstNameKh")}
                  placeholder={translate("firstNameKh")}
                  value={formData.lastNameKh}
                  onChange={(value) => handleInputChange("lastNameKh", value)}
                  disabled={isLoading || isValidating}
                />

                {/* Last Name (KH)*/}
                <div>
                  <label className="text-base font-medium text-gray-700 block mb-1">
                    {translate("lastNameKH")}
                  </label>
                  <Input
                    placeholder={translate("lastNameKH")}
                    value={formData.firstNameKh}
                    onChange={(e) => handleInputChange("firstNameKh", e.target.value)}
                    className="w-full h-10"
                    disabled={isLoading || isValidating}
                  />
                </div>

                {/* Family Name */}
                <div>
                  <label className="text-base font-medium text-gray-700 block mb-1">
                    {translate("familyNameEn")}
                  </label>
                  <Input
                    placeholder={translate("familyNameEn")}
                    value={formData.lastNameEn}
                    onChange={(e) => handleInputChange("lastNameEn", e.target.value)}
                    className="w-full h-10"
                    disabled={isLoading || isValidating}
                  />
                </div>

                {/* Given Name */}
                <div>
                  <label className="text-base font-medium text-gray-700 block mb-1">
                    {translate("givenNameEn")}
                  </label>
                  <Input
                    placeholder={translate("givenNameEn")}
                    value={formData.firstNameEn}
                    onChange={(e) => handleInputChange("firstNameEn", e.target.value)}
                    className="w-full h-10"
                    disabled={isLoading || isValidating}
                  />
                </div>

                {/* Date Of Birth */}
                <div>
                  <label className="text-base font-medium text-gray-700 block mb-1">
                    {translate("dateOfBirth")}
                  </label>
                  <CustomDatePicker
                    value={formData.dob}
                    onChange={(value) => handleInputChange("dob", value)}
                    disabled={isLoading || isValidating}
                    placeholder={translate("dateOfBirth")}
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="text-base font-medium text-gray-700 block mb-1">
                    {translate("gender")}
                  </label>
                  <Select
                    value={formData.gender || ""}
                    onValueChange={(value) => handleInputChange("gender", value)}
                    disabled={isLoading || isValidating}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder={translate("chooseOne")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Female">Female</SelectItem>
                      <SelectItem value="Male">Male</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Legal Type */}
                <div>
                  <label className="text-base font-medium text-gray-700 block mb-1">
                    {translate("legalType")}
                  </label>
                  <Select disabled={isLoading || isValidating}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder={translate("chooseOne")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="national-id">National ID Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Legal ID */}
                <div>
                  <label className="text-base font-medium text-gray-700 block mb-1">
                    {translate("legalId")}
                  </label>
                  <Input
                    placeholder={translate("legalId")}
                    value={formData.idNumber}
                    onChange={(e) => handleInputChange("idNumber", e.target.value)}
                    className="w-full h-10"
                    disabled={isLoading || isValidating}
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="text-base font-medium text-gray-700 block mb-1">
                    {translate("address")}
                  </label>
                  <Input
                    placeholder={translate("address")}
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    className="w-full h-10"
                    disabled={isLoading || isValidating}
                  />
                </div>

                {/* Place Of Birth */}
                <div>
                  <label className="text-base font-medium text-gray-700 block mb-1">
                    {translate("pob")}
                  </label>
                  <Input
                    placeholder={translate("pob")}
                    value={formData.pob}
                    onChange={(e) => handleInputChange("pob", e.target.value)}
                    className="w-full h-10"
                    disabled={isLoading || isValidating}
                  />
                </div>

                {/* Marital Status */}
                <div className="md:col-span-2">
                  <label className="text-base font-medium text-gray-700 block mb-1">
                    {translate("marital")}
                  </label>
                  <Select
                    value={selectedMaritalStatus}
                    onValueChange={setSelectedMaritalStatus}
                    disabled={isLoading || isValidating || isLoadingMaritals}
                  >
                    <SelectTrigger className="w-full h-10">
                      <SelectValue placeholder={isLoadingMaritals ? translate("loading") : translate("chooseOne")} />
                    </SelectTrigger>
                    <SelectContent>
                      {maritalStatuses.map((marital) => (
                        <SelectItem key={marital.id} value={marital.id.toString()}>
                          {getMaritalName(marital)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Occupation */}
                <div>
                  <label className="text-base font-medium text-gray-700 block mb-1">
                    {translate("occupation")}
                  </label>
                  <Select
                    value={selectedOccupation}
                    onValueChange={setSelectedOccupation}
                    disabled={isLoading || isValidating || isLoadingOccupations}
                  >
                    <SelectTrigger className="w-full h-10">
                      <SelectValue placeholder={isLoadingOccupations ? translate("loading") : translate("chooseOne")} />
                    </SelectTrigger>
                    <SelectContent>
                      {occupations.map((occupation) => (
                        <SelectItem key={occupation.id} value={occupation.id.toString()}>
                          {getOccupationName(occupation)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Branch */}
                <div>
                  <label className="text-base font-medium text-gray-700 block mb-1">
                    {translate("branch")}
                  </label>
                  <ComboboxSelectBranch
                    dataSelect={branches.find(b => b.branchID === selectedBranch) || null}
                    onChangeSelected={(branch) => setSelectedBranch(branch?.branchID || "")}
                    disabled={isLoadingBranches}
                    branches={branches}
                    isLoading={isLoadingBranches}
                  />
                </div>

                {/* Reference */}
                <div className="md:col-span-2">
                  <label className="text-base font-medium text-gray-700 block mb-1">
                    {translate("reference")}
                  </label>
                  <div className="flex">
                    <Select
                      value={selectedReferenceBank}
                      onValueChange={setSelectedReferenceBank}
                      disabled={isLoading || isValidating || isLoadingReferenceBanks}
                    >
                      <SelectTrigger className="w-40 h-10 rounded-r-none">
                        <SelectValue placeholder={isLoadingReferenceBanks ? translate("loading") : ""} />
                      </SelectTrigger>
                      <SelectContent>
                        {referenceBanks.map((reference) => (
                          <SelectItem key={reference.id} value={reference.id.toString()}>
                            {getReferenceName(reference)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder={translate("staffCode")}
                      value={staffCode}
                      onChange={(e) => setStaffCode(e.target.value)}
                      className="flex-1 h-10 !rounded-l-none"
                      disabled={isLoading || isValidating}
                    />
                  </div>
                </div>

                {/* Contact Number & OTP Code*/}
                <OTPInput
                  phoneNumber={phoneNumber}
                  onPhoneChange={(value) => setPhoneNumber(value)}
                  onVerificationSuccess={() => {
                    console.log("Phone verified:", phoneNumber);
                  }}
                  disabled={isLoading || isValidating}
                />
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 mt-8">
                <Button
                  className="px-8 py-2 bg-orange-400 hover:bg-orange-500 text-white rounded-md"
                  onClick={handleOpenConfirmModal}
                  disabled={isLoading || isValidating}
                >
                  {isValidating ? translate("processing") : translate("verification")}
                </Button>
                <Button
                  className="px-8 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md"
                  onClick={handleClear}
                  disabled={isLoading || isValidating}
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
        formData={locationData}
        setFormData={setLocationData}
        addressFromForm={formData.address} // Add this line to pass the address
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
    </div>
  );
}