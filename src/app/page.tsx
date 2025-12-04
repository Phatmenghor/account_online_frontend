"use client";

// UI Components
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import Footer from "@/components/shared/footer/footer";

// Feature Components
import { AccountImages } from "@/components/acc-online/account-images";
import { PersonalDetailsFields } from "@/components/acc-online/form-sections/personal-details-fields";
import { MasterDataFields } from "@/components/acc-online/form-sections/master-data-fields";
import OTPInput from "@/components/acc-online/form-field/form-otp";
import { PageHeader } from "@/components/acc-online/page-header";
import ValidationErrorModal from "@/components/acc-online/validateModal";
import ErrorModal from "@/components/acc-online/errorModal";
import ConfirmationModal from "@/components/acc-online/confirmModal";
import LocationModal from "@/components/acc-online/addressModal";
import LoadingModal from "@/components/shared/modal/extract-modal";
import SubmitSuccessModal from "@/components/shared/modal/submit-success-modal";
import SubmitErrorModal from "@/components/shared/modal/submit-error-modal";

// Contexts
import { FormStateProvider } from "@/contexts/form-state-context";

// Hooks
import { useMemo, useCallback } from "react";
import { useAccountImages } from "@/hooks/acc-online/use-account-images";
import { useAccountOtp } from "@/hooks/acc-online/use-account-otp";
import { useMasterData } from "@/hooks/acc-online/use-master-data";
import { useFormValidation } from "@/hooks/acc-online/use-form-validation";
import { useModalState } from "@/hooks/acc-online/use-modal-state";
import { useAccountSubmission } from "@/hooks/acc-online/use-account-submission";
import { useVerificationFlow } from "@/hooks/acc-online/use-verification-flow";

// Types
import { LocationSubmitData } from "@/models/open-acc-online/address/open-acc-address.request.model";

export default function OpenAccountPage() {
  // ========================================
  // Hooks Setup
  // ========================================

  const {
    formData,
    setFormData,
    validationErrors,
    setValidationErrors,
    datePickerKey,
    validateField,
    handleValidationChange,
    handleInputChange,
    clearValidation,
    translate,
    translateSelect,
  } = useFormValidation();

  const {
    showLocationModal,
    setShowLocationModal,
    showErrorModal,
    setShowErrorModal,
    validationResult,
    setValidationResult,
    showValidationErrorModal,
    setShowValidationErrorModal,
    validationErrorData,
    setValidationErrorData,
    showConfirmationModal,
    setShowConfirmationModal,
    locationData,
    setLocationData,
    locationFormData,
    setLocationFormData,
    clearModalState,
  } = useModalState();

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

  const {
    phoneNumber,
    setPhoneNumber,
    isPhoneVerified,
    setIsPhoneVerified,
    resetOtp,
    clearOtp,
  } = useAccountOtp();

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
    setLoadingState: () => {},
    translate,
  });

  const {
    isLoading,
    isValidating,
    selectedBranch,
    staffCode,
    setStaffCode,
    isVerified,
    setIsVerified,
    convertGenderToAPI,
    handleValidateNID,
    handleOpenConfirmModal,
    handleLocationSubmit,
    onBranchChange,
  } = useVerificationFlow({
    formData,
    setFormData,
    validationErrors,
    setValidationErrors,
    validateField,
    selectedMaritalStatus,
    selectedOccupation,
    selectedReferenceBank,
    selectedLegalType,
  });

  const {
    handleSubmitAccount,
    showSuccessModal,
    setShowSuccessModal,
    successData,
    showSubmitErrorModal,
    setShowSubmitErrorModal,
    submitErrorData,
    loadingState,
  } = useAccountSubmission({
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
  });

  // ========================================
  // Event Handlers
  // ========================================

  const handleConfirmValidation = useCallback(async () => {
    setShowConfirmationModal(false);
    await handleValidateNID(
      setShowLocationModal,
      setShowErrorModal,
      setValidationResult,
      setShowValidationErrorModal,
      setValidationErrorData
    );
  }, [
    handleValidateNID,
    setShowConfirmationModal,
    setShowLocationModal,
    setShowErrorModal,
    setValidationResult,
    setShowValidationErrorModal,
    setValidationErrorData,
  ]);

  const handleLocationSubmitCallback = useCallback(
    (data: LocationSubmitData) => {
      handleLocationSubmit(data, setLocationData, setShowLocationModal);
    },
    [handleLocationSubmit, setLocationData, setShowLocationModal]
  );

  const handleVerificationClick = useCallback(() => {
    handleOpenConfirmModal(
      uploadedImage?.idImage || "",
      selfieImage || "",
      phoneNumber,
      isPhoneVerified,
      setShowConfirmationModal
    );
  }, [
    handleOpenConfirmModal,
    uploadedImage,
    selfieImage,
    phoneNumber,
    isPhoneVerified,
    setShowConfirmationModal,
  ]);

  const handlePhoneChange = useCallback(
    (value: string) => {
      setPhoneNumber(value);
      validateField("phoneNumber", value);
    },
    [setPhoneNumber, validateField]
  );

  const handleVerificationSuccess = useCallback(() => {
    setIsPhoneVerified(true);
    validateField("isPhoneVerified", true);
  }, [setIsPhoneVerified, validateField]);

  const handleClear = useCallback(() => {
    clearValidation();
    clearImages();
    clearOtp();
    clearModalState();
    resetMasterData();
    setStaffCode("");
    setIsVerified(false);
  }, [
    clearValidation,
    clearImages,
    clearOtp,
    clearModalState,
    resetMasterData,
    setStaffCode,
    setIsVerified,
  ]);

  const handleSuccessModalClose = useCallback(() => {
    setShowSuccessModal(false);
    handleClear();
  }, [setShowSuccessModal, handleClear]);

  // ========================================
  // Context Setup
  // ========================================

  const formStateContextValue = useMemo(
    () => ({
      isLoading,
      isValidating,
      isSubmitting: false,
      translate,
      translateSelect,
      validationErrors,
      validateField,
      handleValidationChange,
    }),
    [
      isLoading,
      isValidating,
      translate,
      translateSelect,
      validationErrors,
      validateField,
      handleValidationChange,
    ]
  );

  // ========================================
  // Render
  // ========================================

  return (
    <FormStateProvider value={formStateContextValue}>
      <div className="flex flex-col h-screen">
        <PageHeader />

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

                <AccountImages
                  uploadedImage={uploadedImage}
                  selfiePreview={selfiePreview}
                  handleImageUpload={handleImageUpload}
                  handleSelfieUpload={handleSelfieUpload}
                />

                <PersonalDetailsFields
                  formData={formData}
                  handleInputChange={handleInputChange}
                  datePickerKey={datePickerKey}
                  legalTypes={legalTypes}
                  selectedLegalType={selectedLegalType}
                  setSelectedLegalType={setSelectedLegalType}
                  isLegalTypeLoading={isLegalTypeLoading}
                  getLegalTypeName={getLegalTypeName}
                />

                <MasterDataFields
                  maritalStatuses={maritalStatuses}
                  selectedMaritalStatus={selectedMaritalStatus}
                  setSelectedMaritalStatus={setSelectedMaritalStatus}
                  isLoadingMarital={isLoadingMarital}
                  getMaritalName={getMaritalName}
                  occupations={occupations}
                  selectedOccupation={selectedOccupation}
                  setSelectedOccupation={setSelectedOccupation}
                  isLoadingOccupations={isLoadingOccupations}
                  getOccupationName={getOccupationName}
                  referenceBanks={referenceBanks}
                  selectedReferenceBank={selectedReferenceBank}
                  setSelectedReferenceBank={setSelectedReferenceBank}
                  isLoadingReferenceBanks={isLoadingReferenceBanks}
                  getReferenceName={getReferenceName}
                  selectedBranch={selectedBranch}
                  onBranchChange={onBranchChange}
                  staffCode={staffCode}
                  setStaffCode={setStaffCode}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <OTPInput
                    phoneNumber={phoneNumber}
                    onPhoneChange={handlePhoneChange}
                    onVerificationSuccess={handleVerificationSuccess}
                    disabled={isLoading || isValidating}
                    validationErrors={validationErrors}
                    onValidationChange={handleValidationChange}
                    reset={resetOtp}
                  />
                </div>

                <div className="flex justify-end gap-4 mt-8">
                  <Button
                    className="px-8 py-2 bg-orange-400 hover:bg-orange-500 text-white rounded-md"
                    onClick={handleVerificationClick}
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

        <LoadingModal
          isOpen={loadingState.isLoading}
          title={loadingState.title}
          message={loadingState.message}
        />

        <ConfirmationModal
          isOpen={showConfirmationModal}
          onConfirm={handleConfirmValidation}
          onCancel={() => setShowConfirmationModal(false)}
          title={translate("cfTitle")}
          message={translate("cfMessage")}
        />

        <LocationModal
          isOpen={showLocationModal}
          onClose={() => setShowLocationModal(false)}
          onSubmit={handleLocationSubmitCallback}
          formData={locationFormData}
          setFormData={setLocationFormData}
          addressFromForm={formData.address}
          placeOfBirthFromForm={formData.pob}
        />

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

        <ValidationErrorModal
          isOpen={showValidationErrorModal}
          onClose={() => setShowValidationErrorModal(false)}
          title={validationErrorData.title}
          message={validationErrorData.message}
          description={validationErrorData.description}
        />

        <SubmitSuccessModal
          isOpen={showSuccessModal}
          onClose={handleSuccessModalClose}
          title={successData.title}
          message={successData.message}
        />

        <SubmitErrorModal
          isOpen={showSubmitErrorModal}
          onClose={() => setShowSubmitErrorModal(false)}
          title={submitErrorData.title}
          message={submitErrorData.message}
        />
      </div>
    </FormStateProvider>
  );
}
