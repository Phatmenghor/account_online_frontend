"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ValidationErrorModal from "@/components/acc-online/validateModal";
import ErrorModal from "@/components/acc-online/errorModal";
import LanguageSwitcher from "@/components/shared/common/language-switcher";
import Footer from "@/components/shared/footer/footer";
import { CustomDatePicker } from "@/components/shared/common/custom-date-picker";
import ConfirmationModal from "@/components/acc-online/confirmModal";
import LocationModal from "@/components/acc-online/addressModal";
import OTPInput from "@/components/acc-online/form-field/form-otp";
import { ComboboxSelectBranch } from "@/components/shared/combo-box/combobox-branch";
import { Label } from "@/components/ui/label";
import LoadingModal from "@/components/shared/modal/extract-modal";
import SubmitSuccessModal from "@/components/shared/modal/submit-success-modal";
import SubmitErrorModal from "@/components/shared/modal/submit-error-modal";
import { useOpenAccount } from "@/hooks/acc-online/use-open-account";
import { useAccountImages } from "@/hooks/acc-online/use-account-images";
import { useAccountOtp } from "@/hooks/acc-online/use-account-otp";
import { useMasterData } from "@/hooks/acc-online/use-master-data";

export default function OpenAccountPage() {
  // Master Data Hook
  const {
    maritalStatuses,
    isLoadingMarital,
    selectedMaritalStatus,
    setSelectedMaritalStatus,
    occupations,
    isLoadingOccupations,
    selectedOccupation,
    setSelectedOccupation,
    referenceBanks,
    isLoadingReferenceBanks,
    selectedReferenceBank,
    setSelectedReferenceBank,
    legalTypes,
    isLegalTypeLoading,
    selectedLegalType,
    setSelectedLegalType,
    getMaritalName,
    getOccupationName,
    getReferenceName,
    getLegalTypeName,
    getMaritalStatusString,
    resetMasterData,
  } = useMasterData();

  // Orchestrate all hooks
  const {
    formData,
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
    locationFormData,
    setLocationFormData,
    loadingState,
    setLoadingState,
    staffCode,
    setStaffCode,
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
    setShowSuccessModal,
    setFormData,
    locationData,
  } = useOpenAccount({
    selectedMaritalStatus,
    selectedOccupation,
    selectedReferenceBank,
    selectedLegalType,
    resetMasterData,
  });

  const {
    uploadedImage,
    selfiePreview,
    selfieImage,
    handleImageUpload,
    handleSelfieUpload,
    clearImages,
  } = useAccountImages({
    setFormData,
    validateField,
    setLoadingState,
    translate,
  });

  const {
    phoneNumber,
    setPhoneNumber,
    isPhoneVerified,
    setIsPhoneVerified,
    resetOtp,
    clearOtp,
  } = useAccountOtp();

  // Handle Submit Account Opening - orchestrated in parent
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
        dateOfBirth:
          require("@/constants/AppResource/format-date/format-dd-mm-yyyy").formatDate(
            formData.dob
          ),
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
        legalIssueDate:
          require("@/constants/AppResource/format-date/format-dd-mm-yyyy").formatDate(
            formData.issuedDate
          ),
        legalExpireDate:
          require("@/constants/AppResource/format-date/format-dd-mm-yyyy").formatDate(
            formData.expiredDate
          ),
        legalAddress: formData.address,
        legalDocType: selectedLegalType?.legalTypeValue || "",
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

      const {
        createOpenAccountService,
      } = require("@/services/open-account/openAccount.service");
      const response = await createOpenAccountService(accountData);

      console.log("API Response:", response);

      // Show success modal with response data
      setSuccessData({
        title: translate("success_title") || "Account Created Success",
        message:
          response?.message || "Your account has been created successfully!",
      });
      setShowSuccessModal(true);
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
                <Button onClick={() => handleClear(clearImages, clearOtp)}>
                  {translate("clear")}
                </Button>
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
                      {translate("err_idImage")}
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
                      {translate("err_selfieImage")}
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
                      {translate("err_firstNameKh")}
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
                      {translate("err_lastNameKh")}
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
                      {translate("err_lastNameEn")}
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
                      {translate("err_firstNameEn")}
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
                      className="h-10"
                      key={datePickerKey}
                      value={formData.dob}
                      onChange={(value) => handleInputChange("dob", value)}
                      disabled={isLoading || isValidating || isSubmitting}
                      placeholder={translate("dateOfBirth")}
                    />
                  </div>
                  {validationErrors.dob && (
                    <p className="text-xs text-red-500">
                      {translate("err_dob")}
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
                      {translate("err_gender")}
                    </p>
                  )}
                </div>

                {/* Legal Type new*/}
                <div className="space-y-1">
                  <Label htmlFor="legalType" className="text-sm sm:text-base">
                    {translate("legalType")}
                  </Label>
                  <Select
                    value={selectedLegalType?.id.toString() || ""}
                    onValueChange={(value) => {
                      const legalType = legalTypes.find(
                        (l) => l.id.toString() === value
                      );
                      setSelectedLegalType(legalType || null);
                      validateField("legalType", value);
                    }}
                    disabled={isLoading || isValidating || isLegalTypeLoading}
                  >
                    <SelectTrigger
                      className={`w-full h-10 text-sm ${
                        validationErrors.legalType ? "border-red-500" : ""
                      }`}
                    >
                      <SelectValue
                        placeholder={
                          isLegalTypeLoading
                            ? translate("loading")
                            : translateSelect("selectLegalType")
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {legalTypes.map((legalType) => (
                        <SelectItem
                          key={legalType.id}
                          value={legalType.id.toString()}
                        >
                          {getLegalTypeName(legalType)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {validationErrors.legalType && (
                    <p className="text-xs text-red-500">
                      {translate("err_legalType")}
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
                      {translate("err_idNumber")}
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
                      {translate("err_address")}
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
                      {translate("err_pob")}
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
                    disabled={isLoading || isValidating || isLoadingMarital}
                  >
                    <SelectTrigger
                      className={`w-full h-10 text-sm ${
                        validationErrors.maritalStatus ? "border-red-500" : ""
                      }`}
                    >
                      <SelectValue
                        placeholder={
                          isLoadingMarital
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
                      {translate("err_maritalStatus")}
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
                      {translate("err_occupation")}
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
                      {translate("err_branch")}
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
                  onClick={() =>
                    handleOpenConfirmModal(
                      uploadedImage?.idImage || "",
                      selfieImage || "",
                      phoneNumber,
                      isPhoneVerified
                    )
                  }
                  disabled={isLoading || isValidating || isVerified}
                >
                  {isValidating
                    ? translate("processing")
                    : translate("verification")}
                </Button>
                <Button
                  className="px-8 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md"
                  onClick={() => handleSubmitAccount()}
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
        onClose={() => handleSuccessModalClose(clearImages, clearOtp)}
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
