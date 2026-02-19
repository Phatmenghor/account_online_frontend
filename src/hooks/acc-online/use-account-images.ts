import { useState } from "react";
import { toast } from "sonner";
import { RequestIdImage } from "@/models/open-acc-online/nid.request.model";
import { ResponseNID } from "@/models/open-acc-online/nid.response.model";
import { extractNIDService } from "@/services/acc-online/nid.service";
import {
  formatDateForInput,
  normalizeGender,
} from "@/utils/format/BranchFormat";
import { AppToast } from "@/components/shared/toast/app-toast";
import { NIDFormData } from "@/components/acc-online/form-field/form-validate-error";
import { Image } from "@/models/open-acc-online/address/open-acc-address.request.model";

interface UseAccountImagesProps {
  setFormData: (data: ResponseNID) => void;
  validateField: (fieldName: keyof NIDFormData, value: any) => void;
  translate: (key: string) => string;
}

interface LoadingImageState {
  isLoading: boolean;
  title: string;
  message: string;
}

export const useAccountImages = ({
  setFormData,
  validateField,
  translate,
}: UseAccountImagesProps) => {
  const [imageData, setImageData] = useState<RequestIdImage | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<Image | null>(null);
  const [selfieImage, setSelfieImage] = useState<string | null>(null);
  const [selfiePreview, setSelfiePreview] = useState<string | null>(null);

  const [loadingImageState, setLoadingImageState] = useState<LoadingImageState>({
    isLoading: false,
    title: "",
    message: "",
  });

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

    // We don't set local loading state here because it's managed by the parent via setLoadingState for the modal
    // But we might want to ensure the parent knows we are starting if not already set by handleImageUpload
    // However, handleImageUpload sets it before calling this.

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
    }
    // We don't turn off loading here because handleImageUpload does it in finally block
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

      setLoadingImageState({
        isLoading: true,
        title: translate("extracting_data") || "Extracting Data",
        message:
          translate("extracting") || "Extracting information from ID card...",
      });

      try {
        const base64WithPrefix = await convertToBase64(file);
        const base64ForService = base64WithPrefix.split(",")[1];

        const imageRequestData: RequestIdImage = {
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
        setLoadingImageState({
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

  const clearImages = () => {
    setUploadedImage(null);
    setImagePreview(null);
    setImageData(null);
    setSelfieImage(null);
    setSelfiePreview(null);

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

  return {
    imageData,
    setImageData,
    imagePreview,
    setImagePreview,
    uploadedImage,
    setUploadedImage,
    selfieImage,
    setSelfieImage,
    selfiePreview,
    setSelfiePreview,
    handleImageUpload,
    handleSelfieUpload,
    loadingImageState,
    setLoadingImageState,
    clearImages,
  };
};
