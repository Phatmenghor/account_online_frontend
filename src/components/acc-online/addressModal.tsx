"use client"
import { MapPin, X, Loader2 } from "lucide-react"
import type React from "react"
import { useState, useEffect } from "react"

import { Button } from "@/components/ui/button"
import { useClientLocale } from "@/context/provider/local-provider"
import { useCommunes, useDistricts, useProvinces, useVillages } from "@/hooks/fetch-address"
import type { CommuneModel, DistrictModel, ProvinceModel, VillageModel } from "@/models/address/address.response"
import { ComboboxSelectProvince } from "../shared/combo-box/combobox-province"
import { ComboboxSelectDistrict } from "../shared/combo-box/combobox-district"
import { ComboboxSelectCommune } from "../shared/combo-box/combobox-commune"
import { ComboboxSelectVillage } from "../shared/combo-box/combobox-village"
import { toast } from "sonner"
import { getAddressSelectService } from "@/services/address/selectAddress.service"
import { AddressSelectReq } from "@/models/address/select-address/selectAddress.request"
import { PosSelectReq } from "@/models/address/select-pos/selectPos.request"
import { getPosSelectService } from "@/services/address/selectPos.service"
import { useTranslations } from "next-intl"
import { LocationFormData, LocationFormSchema } from "./form-field/form-validate-error"
import { LocationSubmitData } from "@/models/open-acc-online/address/open-acc-address.request.model"

interface LocationModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: LocationSubmitData) => void
  formData: LocationSubmitData
  setFormData: React.Dispatch<React.SetStateAction<LocationSubmitData>>
  addressFromForm?: string
  placeOfBirthFromForm?: string
}

const LocationModal = ({
  isOpen,
  onClose,
  onSubmit,
  formData,
  setFormData,
  addressFromForm,
  placeOfBirthFromForm
}: LocationModalProps) => {
  const { locale: currentLocale } = useClientLocale()
  const translate = useTranslations("address");

  // Validation state
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // First section (Current Address)
  const [selectedProvince, setSelectedProvince] = useState<ProvinceModel | null>(null)
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictModel | null>(null)
  const [selectedCommune, setSelectedCommune] = useState<CommuneModel | null>(null)
  const [selectedVillage, setSelectedVillage] = useState<VillageModel | null>(null)

  // Second section (Place of Birth)
  const [pobProvince, setPobProvince] = useState<ProvinceModel | null>(null)
  const [pobDistrict, setPobDistrict] = useState<DistrictModel | null>(null)
  const [pobCommune, setPobCommune] = useState<CommuneModel | null>(null)
  const [pobVillage, setPobVillage] = useState<VillageModel | null>(null)

  // Loading states for auto-fill
  const [isLoadingAddress, setIsLoadingAddress] = useState(false)
  const [isLoadingPob, setIsLoadingPob] = useState(false)

  // Fetch data for FIRST SECTION (Current Address)
  const { data: provinces, isLoading: isLoadingProvinces } = useProvinces()
  const { data: districts, isLoading: isLoadingDistricts } = useDistricts(selectedProvince?.provinceCode || "")
  const { data: communes, isLoading: isLoadingCommunes } = useCommunes(selectedDistrict?.districtCode || "")
  const { data: villages, isLoading: isLoadingVillages } = useVillages(selectedCommune?.communeCode || "")

  // Fetch data for SECOND SECTION (Place of Birth)
  const { data: pobDistricts, isLoading: isLoadingPobDistricts } = useDistricts(pobProvince?.provinceCode || "")
  const { data: pobCommunes, isLoading: isLoadingPobCommunes } = useCommunes(pobDistrict?.districtCode || "")
  const { data: pobVillages, isLoading: isLoadingPobVillages } = useVillages(pobCommune?.communeCode || "")

  // Reset all state when modal opens
  useEffect(() => {
    if (isOpen) {
      // Clear all selections
      setSelectedProvince(null)
      setSelectedDistrict(null)
      setSelectedCommune(null)
      setSelectedVillage(null)
      setPobProvince(null)
      setPobDistrict(null)
      setPobCommune(null)
      setPobVillage(null)
      setValidationErrors({})
    }
  }, [isOpen])

  // Validate a single field
  const validateField = (section: 'currentAddress' | 'placeOfBirth', field: string, value: string) => {
    const fieldPath = `${section}.${field}`

    try {
      const fieldSchema = LocationFormSchema.shape[section].shape[field as keyof typeof LocationFormSchema.shape.currentAddress.shape]
      fieldSchema.parse(value)

      setValidationErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[fieldPath]
        return newErrors
      })
    } catch (error: any) {
      if (error.issues?.[0]) {
        setValidationErrors((prev) => ({
          ...prev,
          [fieldPath]: error.issues[0].message,
        }))
      }
    }
  }

  // Validate entire form before submission
  const validateFullForm = (): boolean => {
    const locationData: LocationFormData = {
      currentAddress: {
        province: selectedProvince?.provinceCode || "",
        district: selectedDistrict?.districtCode || "",
        commune: selectedCommune?.communeCode || "",
        village: selectedVillage?.villageCode || "",
      },
      placeOfBirth: {
        province: pobProvince?.provinceCode || "",
        district: pobDistrict?.districtCode || "",
        commune: pobCommune?.communeCode || "",
        village: pobVillage?.villageCode || "",
      },
    }

    const result = LocationFormSchema.safeParse(locationData)

    if (!result.success) {
      const errors: Record<string, string> = {}
      result.error.issues.forEach((err) => {
        const path = err.path.join(".")
        errors[path] = err.message
      })
      setValidationErrors(errors)
      return false
    }

    setValidationErrors({})
    return true
  }

  // Auto-fill current address when modal opens
  useEffect(() => {
    const fetchAddressData = async () => {
      if (isOpen && addressFromForm && addressFromForm.trim() !== "") {
        setIsLoadingAddress(true)
        try {
          const request: AddressSelectReq = {
            address: addressFromForm
          }

          const addressData = await getAddressSelectService(request)

          if (addressData.province) {
            setSelectedProvince(addressData.province)
            setFormData(prev => ({
              ...prev,
              currentAddress: {
                ...prev.currentAddress,
                province: addressData.province
              }
            }))
            validateField('currentAddress', 'province', addressData.province.provinceCode)
          }

          if (addressData.district) {
            setSelectedDistrict(addressData.district)
            setFormData(prev => ({
              ...prev,
              currentAddress: {
                ...prev.currentAddress,
                district: addressData.district
              }
            }))
            validateField('currentAddress', 'district', addressData.district.districtCode)
          }

          if (addressData.commune) {
            setSelectedCommune(addressData.commune)
            setFormData(prev => ({
              ...prev,
              currentAddress: {
                ...prev.currentAddress,
                commune: addressData.commune
              }
            }))
            validateField('currentAddress', 'commune', addressData.commune.communeCode)
          }

          if (addressData.village) {
            setSelectedVillage(addressData.village)
            setFormData(prev => ({
              ...prev,
              currentAddress: {
                ...prev.currentAddress,
                village: addressData.village
              }
            }))
            validateField('currentAddress', 'village', addressData.village.villageCode)
          }

        } catch (error: any) {
          console.error("Error fetching address data:", error)
        } finally {
          setIsLoadingAddress(false)
        }
      }
    }

    fetchAddressData()
  }, [isOpen, addressFromForm])

  // Auto-fill place of birth when modal opens
  useEffect(() => {
    const fetchPobData = async () => {
      if (isOpen && placeOfBirthFromForm && placeOfBirthFromForm.trim() !== "") {
        setIsLoadingPob(true)
        try {
          const request: PosSelectReq = {
            address: placeOfBirthFromForm
          }

          const pobData = await getPosSelectService(request)

          if (pobData.province) {
            setPobProvince(pobData.province)
            validateField('placeOfBirth', 'province', pobData.province.provinceCode)
          }

          if (pobData.district) {
            setPobDistrict(pobData.district)
            validateField('placeOfBirth', 'district', pobData.district.districtCode)
          }

          if (pobData.commune) {
            setPobCommune(pobData.commune)
            validateField('placeOfBirth', 'commune', pobData.commune.communeCode)
          }

          if (pobData.village) {
            setPobVillage(pobData.village)
            validateField('placeOfBirth', 'village', pobData.village.villageCode)
          }

        } catch (error: any) {
          console.error("Error fetching place of birth data:", error)
        } finally {
          setIsLoadingPob(false)
        }
      }
    }

    fetchPobData()
  }, [isOpen, placeOfBirthFromForm])

  // Handlers for cascading dropdowns (FIRST SECTION: Current Address)
  const handleProvinceChange = (province: ProvinceModel | null) => {
    setSelectedProvince(province)
    setSelectedDistrict(null)
    setSelectedCommune(null)
    setSelectedVillage(null)

    setFormData(prev => ({
      ...prev,
      currentAddress: {
        province: province,
        district: null,
        commune: null,
        village: null,
      }
    }))

    if (province) {
      validateField('currentAddress', 'province', province.provinceCode)
    }
  }

  const handleDistrictChange = (district: DistrictModel | null) => {
    setSelectedDistrict(district)
    setSelectedCommune(null)
    setSelectedVillage(null)

    setFormData((prev) => ({
      ...prev,
      currentAddress: {
        ...prev.currentAddress,
        district: district,
        commune: null,
        village: null,
      }
    }))

    if (district) {
      validateField('currentAddress', 'district', district.districtCode)
    }
  }

  const handleCommuneChange = (commune: CommuneModel | null) => {
    setSelectedCommune(commune)
    setSelectedVillage(null)

    setFormData((prev) => ({
      ...prev,
      currentAddress: {
        ...prev.currentAddress,
        commune: commune,
        village: null,
      }
    }))

    if (commune) {
      validateField('currentAddress', 'commune', commune.communeCode)
    }
  }

  const handleVillageChange = (village: VillageModel | null) => {
    setSelectedVillage(village)

    setFormData((prev) => ({
      ...prev,
      currentAddress: {
        ...prev.currentAddress,
        village: village,
      }
    }))

    if (village) {
      validateField('currentAddress', 'village', village.villageCode)
    }
  }

  // Handlers for cascading dropdowns (SECOND SECTION: Place of Birth)
  const handlePobProvinceChange = (province: ProvinceModel | null) => {
    setPobProvince(province)
    setPobDistrict(null)
    setPobCommune(null)
    setPobVillage(null)

    if (province) {
      validateField('placeOfBirth', 'province', province.provinceCode)
    }
  }

  const handlePobDistrictChange = (district: DistrictModel | null) => {
    setPobDistrict(district)
    setPobCommune(null)
    setPobVillage(null)

    if (district) {
      validateField('placeOfBirth', 'district', district.districtCode)
    }
  }

  const handlePobCommuneChange = (commune: CommuneModel | null) => {
    setPobCommune(commune)
    setPobVillage(null)

    if (commune) {
      validateField('placeOfBirth', 'commune', commune.communeCode)
    }
  }

  const handlePobVillageChange = (village: VillageModel | null) => {
    setPobVillage(village)

    if (village) {
      validateField('placeOfBirth', 'village', village.villageCode)
    }
  }

  // Handle submit with validation
  const handleSubmit = () => {
    if (!validateFullForm()) {
      return
    }

    const submitData: LocationSubmitData = {
      currentAddress: {
        province: selectedProvince,
        district: selectedDistrict,
        commune: selectedCommune,
        village: selectedVillage
      },
      placeOfBirth: {
        province: pobProvince,
        district: pobDistrict,
        commune: pobCommune,
        village: pobVillage
      }
    }

    onSubmit(submitData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl w-full max-w-3xl flex flex-col shadow-2xl" style={{ maxHeight: '90vh' }}>
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200 bg-white rounded-t-2xl flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <MapPin className="w-7 h-7 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">
              {translate("locationInfo")}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Loading indicator */}
        {(isLoadingAddress || isLoadingPob) && (
          <div className="flex justify-center items-center py-4 bg-blue-50 flex-shrink-0">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600 mr-2" />
            <span className="text-sm text-blue-600">
              {translate("loading")}
            </span>
          </div>
        )}

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto px-8 pt-4 pb-4">
          {/* FIRST SECTION - Current Address */}
          <div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4">
                <h3 className="text-base font-semibold text-gray-800">
                  <span className="text-red-500">* </span>
                  {translate("selectAddress")}
                </h3>
              </div>

              <div className="lg:col-span-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  {/* Province */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <span className="text-red-500">* </span>
                      {translate("province")}
                      {isLoadingProvinces && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                    </label>
                    <div className={validationErrors['currentAddress.province'] ? 'border border-red-500 rounded' : ''}>
                      <ComboboxSelectProvince
                        dataSelect={selectedProvince}
                        onChangeSelected={handleProvinceChange}
                        disabled={isLoadingAddress}
                        provinces={provinces}
                        isLoading={isLoadingProvinces}
                        locale={currentLocale}
                      />
                    </div>
                    {validationErrors['currentAddress.province'] && (
                      <p className="text-xs text-red-500 mt-1">
                        {translate("err_province")}
                      </p>
                    )}
                  </div>

                  {/* District */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <span className="text-red-500">* </span>
                      {currentLocale === "kh" ? "ស្រុក/ខណ្ឌ" : "District"}
                      {isLoadingDistricts && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                    </label>
                    <div className={validationErrors['currentAddress.district'] ? 'border border-red-500 rounded' : ''}>
                      <ComboboxSelectDistrict
                        dataSelect={selectedDistrict}
                        onChangeSelected={handleDistrictChange}
                        disabled={isLoadingAddress}
                        districts={districts}
                        isLoading={isLoadingDistricts}
                        locale={currentLocale}
                      />
                    </div>
                    {validationErrors['currentAddress.district'] && (
                      <p className="text-xs text-red-500 mt-1">
                        {translate("err_district")}
                      </p>
                    )}
                  </div>

                  {/* Commune */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <span className="text-red-500">* </span>
                      {translate("commune")}
                      {isLoadingCommunes && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                    </label>
                    <div className={validationErrors['currentAddress.commune'] ? 'border border-red-500 rounded' : ''}>
                      <ComboboxSelectCommune
                        dataSelect={selectedCommune}
                        onChangeSelected={handleCommuneChange}
                        disabled={isLoadingAddress}
                        communes={communes}
                        isLoading={isLoadingCommunes}
                        locale={currentLocale}
                      />
                    </div>
                    {validationErrors['currentAddress.commune'] && (
                      <p className="text-xs text-red-500 mt-1">
                        {translate("err_commune")}
                      </p>
                    )}
                  </div>

                  {/* Village */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <span className="text-red-500">* </span>
                      {translate("village")}
                      {isLoadingVillages && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                    </label>
                    <div className={validationErrors['currentAddress.village'] ? 'border border-red-500 rounded' : ''}>
                      <ComboboxSelectVillage
                        dataSelect={selectedVillage}
                        onChangeSelected={handleVillageChange}
                        disabled={isLoadingAddress}
                        villages={villages}
                        isLoading={isLoadingVillages}
                        locale={currentLocale}
                      />
                    </div>
                    {validationErrors['currentAddress.village'] && (
                      <p className="text-xs text-red-500 mt-1">
                        {translate("err_village")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-4"></div>

          {/* SECOND SECTION - Place of Birth */}
          <div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              <div className="lg:col-span-4">
                <h3 className="text-base font-semibold text-gray-800">
                  <span className="text-red-500">* </span>
                  {translate("selectPlaceOfBirth")}
                </h3>
              </div>

              <div className="lg:col-span-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  {/* Province */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <span className="text-red-500">* </span>
                      {translate("province")}
                    </label>
                    <div className={validationErrors['placeOfBirth.province'] ? 'border border-red-500 rounded' : ''}>
                      <ComboboxSelectProvince
                        dataSelect={pobProvince}
                        onChangeSelected={handlePobProvinceChange}
                        disabled={isLoadingPob}
                        provinces={provinces}
                        isLoading={isLoadingProvinces}
                        locale={currentLocale}
                      />
                    </div>
                    {validationErrors['placeOfBirth.province'] && (
                      <p className="text-xs text-red-500 mt-1">
                        {translate("err_province")}
                      </p>
                    )}
                  </div>

                  {/* District */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <span className="text-red-500">* </span>
                      {translate("district")}
                    </label>
                    <div className={validationErrors['placeOfBirth.district'] ? 'border border-red-500 rounded' : ''}>
                      <ComboboxSelectDistrict
                        dataSelect={pobDistrict}
                        onChangeSelected={handlePobDistrictChange}
                        disabled={isLoadingPob}
                        districts={pobDistricts}
                        isLoading={isLoadingPobDistricts}
                        locale={currentLocale}
                      />
                    </div>
                    {validationErrors['placeOfBirth.district'] && (
                      <p className="text-xs text-red-500 mt-1">
                        {translate("err_district")}
                      </p>
                    )}
                  </div>

                  {/* Commune */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <span className="text-red-500">* </span>
                      {translate("commune")}
                    </label>
                    <div className={validationErrors['placeOfBirth.commune'] ? 'border border-red-500 rounded' : ''}>
                      <ComboboxSelectCommune
                        dataSelect={pobCommune}
                        onChangeSelected={handlePobCommuneChange}
                        disabled={isLoadingPob}
                        communes={pobCommunes}
                        isLoading={isLoadingPobCommunes}
                        locale={currentLocale}
                      />
                    </div>
                    {validationErrors['placeOfBirth.commune'] && (
                      <p className="text-xs text-red-500 mt-1">
                        {translate("err_commune")}
                      </p>
                    )}
                  </div>

                  {/* Village */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <span className="text-red-500">* </span>
                      {translate("village")}
                    </label>
                    <div className={validationErrors['placeOfBirth.village'] ? 'border border-red-500 rounded' : ''}>
                      <ComboboxSelectVillage
                        dataSelect={pobVillage}
                        onChangeSelected={handlePobVillageChange}
                        disabled={isLoadingPob}
                        villages={pobVillages}
                        isLoading={isLoadingPobVillages}
                        locale={currentLocale}
                      />
                    </div>
                    {validationErrors['placeOfBirth.village'] && (
                      <p className="text-xs text-red-500 mt-1">
                        {translate("err_village")}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex justify-end gap-3 px-8 py-6 bg-gray-50 rounded-b-2xl sticky bottom-0">
          <Button
            onClick={onClose}
            className="px-8 py-2.5 bg-gray-600 hover:bg-gray-700 text-white font-medium rounded-lg transition-colors shadow-sm"
          >
            {translate("close")}
          </Button>
          <Button
            onClick={handleSubmit}
            className="px-8 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-sm"
          >
            {translate("submit")}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default LocationModal