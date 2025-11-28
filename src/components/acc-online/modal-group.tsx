import ValidationErrorModal from "@/components/acc-online/validateModal";
import ErrorModal from "@/components/acc-online/errorModal";
import ConfirmationModal from "@/components/acc-online/confirmModal";
import LocationModal from "@/components/acc-online/addressModal";
import LoadingModal from "@/components/shared/modal/extract-modal";
import SubmitSuccessModal from "@/components/shared/modal/submit-success-modal";
import SubmitErrorModal from "@/components/shared/modal/submit-error-modal";
import { ResponseNID } from "@/models/open-acc-online/nid.response.model";
import { LocationSubmitData } from "@/models/open-acc-online/address/open-acc-address.request.model";

interface ModalGroupProps {
    // Loading Modal
    loadingState: {
        isLoading: boolean;
        title: string;
        message: string;
    };

    // Confirmation Modal
    showConfirmationModal: boolean;
    onConfirmValidation: () => void;
    onCancelConfirmation: () => void;
    confirmationTitle: string;
    confirmationMessage: string;

    // Location Modal
    showLocationModal: boolean;
    onCloseLocationModal: () => void;
    onSubmitLocation: (data: LocationSubmitData) => void;
    locationFormData: LocationSubmitData;
    setLocationFormData: React.Dispatch<React.SetStateAction<LocationSubmitData>>;
    addressFromForm: string;
    placeOfBirthFromForm: string;

    // Error Modal
    showErrorModal: boolean;
    onCloseErrorModal: () => void;
    validationResult: {
        data?: {
            score: number;
            incorrectFields: string[];
        };
    } | null;

    // Validation Error Modal
    showValidationErrorModal: boolean;
    onCloseValidationErrorModal: () => void;
    validationErrorData: {
        title: string;
        message: string;
        description: string;
    };

    // Success Modal
    showSuccessModal: boolean;
    onCloseSuccessModal: () => void;
    successData: {
        title: string;
        message: string;
    };

    // Submit Error Modal
    showSubmitErrorModal: boolean;
    onCloseSubmitErrorModal: () => void;
    submitErrorData: {
        title: string;
        message: string;
    };
}

export const ModalGroup = ({
    loadingState,
    showConfirmationModal,
    onConfirmValidation,
    onCancelConfirmation,
    confirmationTitle,
    confirmationMessage,
    showLocationModal,
    onCloseLocationModal,
    onSubmitLocation,
    locationFormData,
    setLocationFormData,
    addressFromForm,
    placeOfBirthFromForm,
    showErrorModal,
    onCloseErrorModal,
    validationResult,
    showValidationErrorModal,
    onCloseValidationErrorModal,
    validationErrorData,
    showSuccessModal,
    onCloseSuccessModal,
    successData,
    showSubmitErrorModal,
    onCloseSubmitErrorModal,
    submitErrorData,
}: ModalGroupProps) => {
    return (
        <>
            <LoadingModal
                isOpen={loadingState.isLoading}
                title={loadingState.title}
                message={loadingState.message}
            />

            <ConfirmationModal
                isOpen={showConfirmationModal}
                onConfirm={onConfirmValidation}
                onCancel={onCancelConfirmation}
                title={confirmationTitle}
                message={confirmationMessage}
            />

            <LocationModal
                isOpen={showLocationModal}
                onClose={onCloseLocationModal}
                onSubmit={onSubmitLocation}
                formData={locationFormData}
                setFormData={setLocationFormData}
                addressFromForm={addressFromForm}
                placeOfBirthFromForm={placeOfBirthFromForm}
            />

            <ErrorModal
                isOpen={showErrorModal}
                onClose={onCloseErrorModal}
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
                onClose={onCloseValidationErrorModal}
                title={validationErrorData.title}
                message={validationErrorData.message}
                description={validationErrorData.description}
            />

            <SubmitSuccessModal
                isOpen={showSuccessModal}
                onClose={onCloseSuccessModal}
                title={successData.title}
                message={successData.message}
            />

            <SubmitErrorModal
                isOpen={showSubmitErrorModal}
                onClose={onCloseSubmitErrorModal}
                title={submitErrorData.title}
                message={submitErrorData.message}
            />
        </>
    );
};
