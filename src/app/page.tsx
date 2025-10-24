
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
import { formatDate } from "@/constants/AppResource/format-date/format-dd-mm-yyyy";
import ValidationErrorModal from "@/components/acc-online/validateModal";
import ErrorModal from "@/components/acc-online/errorModal";
import SuccessModal from "@/components/acc-online/successModal";
import LanguageSwitcher from "@/components/shared/common/language-switcher";
import Footer from "@/components/shared/footer/footer";
import { MaritalModel } from "@/models/static/marital/marital.response";
import { getAllMaritalService } from "@/services/dashboard/marital/marital.service";
import { useClientLocale } from "@/context/provider/local-provider";
import { OccupationModel } from "@/models/static/occupation/occupation.response";
import { ReferenceModel } from "@/models/static/reference/reference.response";
import { getAllReferenceService } from "@/services/dashboard/reference/reference.service";
import { getAllOccupationService } from "@/services/dashboard/occupation/occupation.service";
import { FormInputField } from "@/components/acc-online/form-field/form-field";
import { CustomDatePicker } from "@/components/shared/common/custom-date-picker";

export interface Image {
  idImage: string;
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
  const [showSuccessModal, setShowSuccessModal] = useState(false);
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

  // Marital status state
  const [maritalStatuses, setMaritalStatuses] = useState<MaritalModel[]>([]);
  const [selectedMaritalStatus, setSelectedMaritalStatus] = useState<string>("");
  const [isLoadingMaritals, setIsLoadingMaritals] = useState(false);

  // Occupation state
  const [occupations, setOccupations] = useState<OccupationModel[]>([]);
  const [selectedOccupation, setSelectedOccupation] = useState<string>("");
  const [isLoadingOccupations, setIsLoadingOccupations] = useState(false);

  // Reference bank state
  const [referenceBanks, setReferenceBanks] = useState<ReferenceModel[]>([]);
  const [selectedReferenceBank, setSelectedReferenceBank] = useState<string>("");
  const [isLoadingReferenceBanks, setIsLoadingReferenceBanks] = useState(false);
  const [staffCode, setStaffCode] = useState<string>("");

  // Get current locale
  const { locale: currentLocale } = useClientLocale();

  // change language
  const translate = useTranslations("NIDPage");

  // Fetch marital statuses on component mount
  useEffect(() => {
    const fetchMaritalStatuses = async () => {
      setIsLoadingMaritals(true);
      try {
        const response = await getAllMaritalService({
          pageNo: 1,
          pageSize: 100,
          status: "ACTIVE"
        });
        setMaritalStatuses(response.content || []);
      } catch (error: any) {
        console.error("Failed to fetch:", error);
        toast.error("Failed to load marital statuses");
      } finally {
        setIsLoadingMaritals(false);
      }
    };
    fetchMaritalStatuses();
  }, []);

  // Fetch occupations on component mount
  useEffect(() => {
    const fetchOccupations = async () => {
      setIsLoadingOccupations(true);
      try {
        const response = await getAllOccupationService({
          pageNo: 1,
          pageSize: 100,
          status: "ACTIVE"
        });
        setOccupations(response.content || []);
      } catch (error: any) {
        console.error("Failed to fetch occupations:", error);
        toast.error("Failed to load occupations");
      } finally {
        setIsLoadingOccupations(false);
      }
    };
    fetchOccupations();
  }, []);

  // Fetch reference banks on component mount
  useEffect(() => {
    const fetchReferenceBanks = async () => {
      setIsLoadingReferenceBanks(true);
      try {
        const response = await getAllReferenceService({
          pageNo: 1,
          pageSize: 100,
          status: "ACTIVE"
        });
        setReferenceBanks(response.content || []);
      } catch (error: any) {
        console.error("Failed to fetch reference banks:", error);
        toast.error("Failed to load reference banks");
      } finally {
        setIsLoadingReferenceBanks(false);
      }
    };
    fetchReferenceBanks();
  }, []);

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

  // Helper function to convert date to YYYY-MM-DD
  const formatDateForInput = (dateString: string): string => {
    if (!dateString) return "";

    // If already in YYYY-MM-DD format
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateString)) {
      return dateString;
    }

    // If in DD/MM/YYYY format
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
      const [day, month, year] = dateString.split('/');
      return `${year}-${month}-${day}`;
    }

    // If in DD-MM-YYYY format
    if (/^\d{2}-\d{2}-\d{4}$/.test(dateString)) {
      const [day, month, year] = dateString.split('-');
      return `${year}-${month}-${day}`;
    }

    return dateString;
  };

  // Helper function to normalize gender
  const normalizeGender = (gender: string): string => {
    if (!gender) return "";

    const genderUpper = gender.toUpperCase().trim();

    if (genderUpper === "M" || genderUpper === "MALE" || genderUpper === "ប្រុស") {
      return "Male";
    }

    if (genderUpper === "F" || genderUpper === "FEMALE" || genderUpper === "ស្រី") {
      return "Female";
    }

    return gender;
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
          idImage: base64WithPrefix, // Use full data URL for preview
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
          resolve(reader.result); // Return full data URL
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
      // response is already the extracted NID data object
      const response = await extractNIDService(dataToProcess);

      // Debug logging
      console.log("=== RAW API RESPONSE ===");
      console.log("Full response:", JSON.stringify(response, null, 2));
      console.log("DOB from API:", response.dob);
      console.log("Gender from API:", response.gender);
      console.log("========================");

      // Normalize the data before setting state
      const normalizedData = {
        ...response,
        dob: formatDateForInput(response.dob),
        gender: normalizeGender(response.gender),
      };

      console.log("Normalized data:", normalizedData);
      setFormData(normalizedData);
      toast.success("NID extracted successfully!");

    } catch (error: any) {
      console.error("Failed to extract NID - Full error:", error);
      console.error("Error message:", error.message);
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
    // Check if image is uploaded
    if (!uploadedImage || !imageData) {
      setValidationErrorData({
        title: translate("required_image"),
        message: "",
        description: translate("req_image_des"),
      });
      setShowValidationErrorModal(true);
      return;
    }

    // Check if required fields are filled
    const requiredFields = [
      { field: "idNumber", label: translate("id"), value: formData.idNumber },
      {
        field: "lastNameEn",
        label: translate("lnameEn"),
        value: formData.lastNameEn,
      },
      {
        field: "firstNameEn",
        label: translate("fnameEn"),
        value: formData.firstNameEn,
      },
      { field: "dob", label: translate("dob"), value: formData.dob },
    ];

    const missingFields = requiredFields.filter(
      (field) => !field.value?.toString().trim()
    );

    if (missingFields.length > 0) {
      const missingFieldNames = missingFields
        .map((field) => `${field.label}, `)
        .join("\n");

      const fieldWord =
        missingFields.length === 1
          ? translate("required")
          : translate("requireds");

      setValidationErrorData({
        title: `${fieldWord}`,
        message: "",
        description: `${translate("req_des")} :\n${missingFieldNames}`,
      });

      setShowValidationErrorModal(true);
      return;
    }

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
        gender: formData.gender,
        expiredDate: formatDate(formData.expiredDate),
        issuedDate: formatDate(formData.issuedDate),
        address: formData.address,
        pob: formData.pob,
      };

      const response = await validateNIDService(validationData);

      setValidationResult(response);

      // Check if there are incorrect fields that matter for error modal
      const criticalFields = ["lastNameEn", "firstNameEn", "dob"];
      const hasCriticalErrors = response.data.incorrectFields.some(
        (field: string) => criticalFields.includes(field)
      );

      if (hasCriticalErrors) {
        setShowErrorModal(true);
      } else {
        // Success even if there are other incorrect fields (like firstNameKh)
        setShowSuccessModal(true);
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
    setStaffCode("");

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
        <div className="mx-auto px-10 py-4 flex items-center justify-between">
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
                <Button onClick={handleClear}>Clear</Button>
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
              <div className="flex md:flex-row flex-col justify-evenly items-center mb-16 gap-10">
                <div>
                  <p className="text-base text-gray-600 mb-4 text-center">
                    {translate("img_card")}
                  </p>

                  <div className="relative">
                    <div className="absolute -top-5 -left-6 w-9 h-6 border-l-2 border-t-2 border-gray-400"></div>
                    <div className="absolute -top-5 -right-6 w-9 h-6 border-r-2 border-t-2 border-gray-400"></div>
                    <div className="absolute -bottom-5 -left-6 w-9 h-6 border-l-2 border-b-2 border-gray-400"></div>
                    <div className="absolute -bottom-5 -right-6 w-9 h-6 border-r-2 border-b-2 border-gray-400"></div>

                    <div className="relative lg:w-96 md:w-80 w-96 h-60 bg-gray-100 rounded overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
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
                    <div className="absolute -top-5 -left-6 w-9 h-6 border-l-2 border-t-2 border-gray-400"></div>
                    <div className="absolute -top-6 -right-6 w-9 h-6 border-r-2 border-t-2 border-gray-400"></div>
                    <div className="absolute -bottom-5 -left-6 w-9 h-6 border-l-2 border-b-2 border-gray-400"></div>
                    <div className="absolute -bottom-5 -right-6 w-9 h-6 border-r-2 border-b-2 border-gray-400"></div>

                    <div className="relative lg:w-96 md:w-80 w-96 h-60 bg-gray-100 rounded overflow-hidden cursor-pointer hover:opacity-90 transition-opacity">
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
                  label="First Name (KH)"
                  placeholder="First Name (KH)"
                  value={formData.lastNameKh}
                  onChange={(value) => handleInputChange("lastNameKh", value)}
                  disabled={isLoading || isValidating}
                />

                {/* Last Name (KH)*/}
                <div>
                  <label className="text-base font-medium text-gray-700 block mb-1">
                    Last Name (KH)
                  </label>
                  <Input
                    placeholder="Last Name (KH)"
                    value={formData.firstNameKh}
                    onChange={(e) => handleInputChange("firstNameKh", e.target.value)}
                    className="w-full h-10"
                    disabled={isLoading || isValidating}
                  />
                </div>

                {/* Family Name */}
                <div>
                  <label className="text-base font-medium text-gray-700 block mb-1">
                    Family Name
                  </label>
                  <Input
                    placeholder="Family Name"
                    value={formData.lastNameEn}
                    onChange={(e) => handleInputChange("lastNameEn", e.target.value)}
                    className="w-full h-10"
                    disabled={isLoading || isValidating}
                  />
                </div>

                {/* Given Name */}
                <div>
                  <label className="text-base font-medium text-gray-700 block mb-1">
                    Given Name
                  </label>
                  <Input
                    placeholder="Given Name"
                    value={formData.firstNameEn}
                    onChange={(e) => handleInputChange("firstNameEn", e.target.value)}
                    className="w-full h-10"
                    disabled={isLoading || isValidating}
                  />
                </div>

                {/* Date Of Birth */}
                <div>
                  <label className="text-base font-medium text-gray-700 block mb-1">
                    Date Of Birth
                  </label>
                  <CustomDatePicker
                    value={formData.dob}
                    onChange={(value) => handleInputChange("dob", value)}
                    disabled={isLoading || isValidating}
                    placeholder="Select start date"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="text-base font-medium text-gray-700 block mb-1">
                    Gender
                  </label>
                  <Select
                    value={formData.gender || ""}
                    onValueChange={(value) => handleInputChange("gender", value)}
                    disabled={isLoading || isValidating}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="--- Choose one ---" />
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
                    Legal Type
                  </label>
                  <Select disabled={isLoading || isValidating}>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="--- Choose one ---" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="national-id">National ID Card</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Legal ID */}
                <div>
                  <label className="text-base font-medium text-gray-700 block mb-1">
                    Legal ID
                  </label>
                  <Input
                    placeholder="Legal ID"
                    value={formData.idNumber}
                    onChange={(e) => handleInputChange("idNumber", e.target.value)}
                    className="w-full h-10"
                    disabled={isLoading || isValidating}
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="text-base font-medium text-gray-700 block mb-1">
                    Address
                  </label>
                  <Input
                    placeholder="Address"
                    value={formData.address}
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    className="w-full h-10"
                    disabled={isLoading || isValidating}
                  />
                </div>

                {/* Place Of Birth */}
                <div>
                  <label className="text-base font-medium text-gray-700 block mb-1">
                    Place Of Birth
                  </label>
                  <Input
                    placeholder="Place Of Birth"
                    value={formData.pob}
                    onChange={(e) => handleInputChange("pob", e.target.value)}
                    className="w-full h-10"
                    disabled={isLoading || isValidating}
                  />
                </div>

                {/* Marital Status */}
                <div className="md:col-span-2">
                  <label className="text-base font-medium text-gray-700 block mb-1">
                    Marital Status
                  </label>
                  <Select
                    value={selectedMaritalStatus}
                    onValueChange={setSelectedMaritalStatus}
                    disabled={isLoading || isValidating || isLoadingMaritals}
                  >
                    <SelectTrigger className="w-full h-10">
                      <SelectValue placeholder={isLoadingMaritals ? "Loading..." : "--- Choose one ---"} />
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
                    Occupation
                  </label>
                  <Select
                    value={selectedOccupation}
                    onValueChange={setSelectedOccupation}
                    disabled={isLoading || isValidating || isLoadingOccupations}
                  >
                    <SelectTrigger className="w-full h-10">
                      <SelectValue placeholder={isLoadingOccupations ? "Loading..." : "--- Choose one ---"} />
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
                    Branch
                  </label>
                  <Select>
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="--- Choose one ---" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="engineering">Engineering</SelectItem>
                      <SelectItem value="design">Design</SelectItem>
                      <SelectItem value="marketing">Marketing</SelectItem>
                      <SelectItem value="sales">Sales</SelectItem>
                      <SelectItem value="support">Customer Support</SelectItem>
                      <SelectItem value="hr">Human Resources</SelectItem>
                      <SelectItem value="finance">Finance</SelectItem>
                      <SelectItem value="operations">Operations</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Reference */}
                <div className="md:col-span-2">
                  <label className="text-base font-medium text-gray-700 block mb-1">
                    Referer (Optional)
                  </label>
                  <div className="flex">
                    <Select
                      value={selectedReferenceBank}
                      onValueChange={setSelectedReferenceBank}
                      disabled={isLoading || isValidating || isLoadingReferenceBanks}
                    >
                      <SelectTrigger className="w-40 h-10 rounded-r-none">
                        <SelectValue placeholder={isLoadingReferenceBanks ? "Loading..." : "CP Bank"} />
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
                      placeholder="Staff Code"
                      value={staffCode}
                      onChange={(e) => setStaffCode(e.target.value)}
                      className="flex-1 h-10 !rounded-l-none"
                      disabled={isLoading || isValidating}
                    />
                  </div>
                </div>

                {/* Contact Number */}
                <div>
                  <label className="text-base font-medium text-gray-700 block mb-1">
                    Contact Number
                  </label>
                  <Input
                    placeholder="Contact Number"
                    className="w-full h-10"
                    disabled={isLoading || isValidating}
                  />
                </div>

                {/* OTP Code */}
                <div>
                  <label className="text-base font-medium text-gray-700 block mb-1">
                    OTP Code
                    <a href="#" className="float-right text-blue-600 border-blue-600 border-b-2 text-sm">Resend OTP</a>
                  </label>
                  <Input
                    placeholder="OTP Code"
                    className="w-full h-10"
                    disabled={isLoading || isValidating}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex justify-end gap-4 mt-8">
                <Button
                  className="px-8 py-2 bg-orange-400 hover:bg-orange-500 text-white rounded-md"
                  onClick={handleValidateNID}
                  disabled={isLoading || isValidating}
                >
                  {isValidating ? "Processing..." : "Verification"}
                </Button>
                <Button
                  className="px-8 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-md"
                  onClick={handleClear}
                  disabled={isLoading || isValidating}
                >
                  Submit
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <Footer />
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => setShowSuccessModal(false)}
        data={
          validationResult?.data
            ? {
              score: validationResult.data.score,
              incorrectFields: validationResult.data.incorrectFields,
            }
            : null
        }
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