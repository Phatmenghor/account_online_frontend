import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { CustomDatePicker } from "@/components/shared/common/custom-date-picker";
import { ResponseNID } from "@/models/open-acc-online/nid.response.model";
import { LegalTypeModel } from "@/models/static/legal-type/legal-type.response";
import { useFormState } from "@/contexts/form-state-context";

interface PersonalDetailsFieldsProps {
    formData: ResponseNID;
    handleInputChange: (field: keyof ResponseNID, value: string) => void;
    datePickerKey: number;
    legalTypes: LegalTypeModel[];
    selectedLegalType: LegalTypeModel | null;
    setSelectedLegalType: (value: LegalTypeModel | null) => void;
    isLegalTypeLoading: boolean;
    getLegalTypeName: (item: LegalTypeModel) => string;
}

export const PersonalDetailsFields: React.FC<PersonalDetailsFieldsProps> = ({
    formData,
    handleInputChange,
    datePickerKey,
    legalTypes,
    selectedLegalType,
    setSelectedLegalType,
    isLegalTypeLoading,
    getLegalTypeName,
}) => {
    // Get values from FormStateContext
    const {
        validationErrors,
        isLoading,
        isValidating,
        isSubmitting,
        translate,
        translateSelect,
        validateField,
    } = useFormState();
    return (
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
                    onChange={(e) => handleInputChange("lastNameKh", e.target.value)}
                    className={`w-full h-10 text-sm ${validationErrors.lastNameKh ? "border-red-500" : ""
                        }`}
                    disabled={isLoading || isValidating || isSubmitting}
                />
                {validationErrors.lastNameKh && (
                    <p className="text-xs text-red-500">{translate("err_firstNameKh")}</p>
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
                    onChange={(e) => handleInputChange("firstNameKh", e.target.value)}
                    className={`w-full h-10 text-sm ${validationErrors.firstNameKh ? "border-red-500" : ""
                        }`}
                    disabled={isLoading || isValidating || isSubmitting}
                />
                {validationErrors.firstNameKh && (
                    <p className="text-xs text-red-500">{translate("err_lastNameKh")}</p>
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
                    onChange={(e) => handleInputChange("lastNameEn", e.target.value)}
                    className={`w-full h-10 text-sm ${validationErrors.lastNameEn ? "border-red-500" : ""
                        }`}
                    disabled={isLoading || isValidating || isSubmitting}
                />
                {validationErrors.lastNameEn && (
                    <p className="text-xs text-red-500">{translate("err_lastNameEn")}</p>
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
                    onChange={(e) => handleInputChange("firstNameEn", e.target.value)}
                    className={`w-full h-10 text-sm ${validationErrors.firstNameEn ? "border-red-500" : ""
                        }`}
                    disabled={isLoading || isValidating || isSubmitting}
                />
                {validationErrors.firstNameEn && (
                    <p className="text-xs text-red-500">{translate("err_firstNameEn")}</p>
                )}
            </div>

            {/* Date Of Birth */}
            <div className="space-y-1">
                <Label htmlFor="dob" className="text-sm sm:text-base">
                    {translate("dateOfBirth")}
                </Label>
                <div
                    className={
                        validationErrors.dob ? "border border-red-500 rounded" : ""
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
                    <p className="text-xs text-red-500">{translate("err_dob")}</p>
                )}
            </div>

            {/* Gender */}
            <div className="space-y-1">
                <Label htmlFor="gender" className="text-sm sm:text-base">
                    {translate("gender")}
                </Label>
                <Select
                    value={formData.gender || ""}
                    onValueChange={(value) => handleInputChange("gender", value)}
                    disabled={isLoading || isValidating || isSubmitting}
                >
                    <SelectTrigger
                        className={`h-10 ${validationErrors.gender ? "border-red-500" : ""
                            }`}
                    >
                        <SelectValue placeholder={translateSelect("selectGender")} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Male">Male</SelectItem>
                    </SelectContent>
                </Select>
                {validationErrors.gender && (
                    <p className="text-xs text-red-500">{translate("err_gender")}</p>
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
                        const legalType = legalTypes.find((l) => l.id.toString() === value);
                        setSelectedLegalType(legalType || null);
                        validateField("legalType", value);
                    }}
                    disabled={isLoading || isValidating || isLegalTypeLoading}
                >
                    <SelectTrigger
                        className={`w-full h-10 text-sm ${validationErrors.legalType ? "border-red-500" : ""
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
                            <SelectItem key={legalType.id} value={legalType.id.toString()}>
                                {getLegalTypeName(legalType)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {validationErrors.legalType && (
                    <p className="text-xs text-red-500">{translate("err_legalType")}</p>
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
                    onChange={(e) => handleInputChange("idNumber", e.target.value)}
                    className={`w-full h-10 text-sm ${validationErrors.idNumber ? "border-red-500" : ""
                        }`}
                    disabled={isLoading || isValidating || isSubmitting}
                />
                {validationErrors.idNumber && (
                    <p className="text-xs text-red-500">{translate("err_idNumber")}</p>
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
                    onChange={(e) => handleInputChange("address", e.target.value)}
                    className={`w-full h-10 text-sm ${validationErrors.address ? "border-red-500" : ""
                        }`}
                    disabled={isLoading || isValidating || isSubmitting}
                />
                {validationErrors.address && (
                    <p className="text-xs text-red-500">{translate("err_address")}</p>
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
                    className={`w-full h-10 text-sm ${validationErrors.pob ? "border-red-500" : ""
                        }`}
                    disabled={isLoading || isValidating || isSubmitting}
                />
                {validationErrors.pob && (
                    <p className="text-xs text-red-500">{translate("err_pob")}</p>
                )}
            </div>
        </div>
    );
};
