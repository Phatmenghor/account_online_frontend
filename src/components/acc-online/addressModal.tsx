"use client"
import { MapPin, X, Loader2 } from "lucide-react"
import type React from "react"
import { useState, useEffect, useCallback } from "react"

import { Button } from "@/components/ui/button"
import { useClientLocale } from "@/context/provider/local-provider"
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

interface LocationData {
  province: string
  district: string
  commune: string
  village: string
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

interface LocationModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: LocationSubmitData) => void
  formData: LocationData
  setFormData: React.Dispatch<React.SetStateAction<LocationData>>
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
  // Get current locale
  const { locale: currentLocale } = useClientLocale()

  // change language
  const translate = useTranslations("address");

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
          
          // Set first section (Current Address)
          if (addressData.province) {
            setSelectedProvince(addressData.province)
            setFormData(prev => ({
              ...prev,
              province: addressData.province.provinceCode
            }))
          }
          
          if (addressData.district) {
            setSelectedDistrict(addressData.district)
            setFormData(prev => ({
              ...prev,
              district: addressData.district.districtCode
            }))
          }
          
          if (addressData.commune) {
            setSelectedCommune(addressData.commune)
            setFormData(prev => ({
              ...prev,
              commune: addressData.commune.communeCode
            }))
          }
          
          if (addressData.village) {
            setSelectedVillage(addressData.village)
            setFormData(prev => ({
              ...prev,
              village: addressData.village.villageCode
            }))
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
          
          // Set second section (Place of Birth)
          if (pobData.province) {
            setPobProvince(pobData.province)
          }
          
          if (pobData.district) {
            setPobDistrict(pobData.district)
          }
          
          if (pobData.commune) {
            setPobCommune(pobData.commune)
          }
          
          if (pobData.village) {
            setPobVillage(pobData.village)
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
  const handleProvinceChange = useCallback((province: ProvinceModel) => {
    setSelectedProvince(province)
    setSelectedDistrict(null)
    setSelectedCommune(null)
    setSelectedVillage(null)

    setFormData({
      province: province?.provinceCode || "",
      district: "",
      commune: "",
      village: "",
    })
  }, [setFormData])

  const handleDistrictChange = useCallback((district: DistrictModel) => {
    setSelectedDistrict(district)
    setSelectedCommune(null)
    setSelectedVillage(null)

    setFormData((prev) => ({
      ...prev,
      district: district?.districtCode || "",
      commune: "",
      village: "",
    }))
  }, [setFormData])

  const handleCommuneChange = useCallback((commune: CommuneModel) => {
    setSelectedCommune(commune)
    setSelectedVillage(null)

    setFormData((prev) => ({
      ...prev,
      commune: commune?.communeCode || "",
      village: "",
    }))
  }, [setFormData])

  const handleVillageChange = useCallback((village: VillageModel) => {
    setSelectedVillage(village)

    setFormData((prev) => ({
      ...prev,
      village: village?.villageCode || "",
    }))
  }, [setFormData])

  // Handlers for cascading dropdowns (SECOND SECTION: Place of Birth)
  const handlePobProvinceChange = useCallback((province: ProvinceModel) => {
    setPobProvince(province)
    setPobDistrict(null)
    setPobCommune(null)
    setPobVillage(null)
  }, [])

  const handlePobDistrictChange = useCallback((district: DistrictModel) => {
    setPobDistrict(district)
    setPobCommune(null)
    setPobVillage(null)
  }, [])

  const handlePobCommuneChange = useCallback((commune: CommuneModel) => {
    setPobCommune(commune)
    setPobVillage(null)
  }, [])

  const handlePobVillageChange = useCallback((village: VillageModel) => {
    setPobVillage(village)
  }, [])

  // Handle submit with all location data
  const handleSubmit = () => {
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
      <div className="bg-white rounded-2xl max-w-7xl shadow-2xl overflow-hidden">
        <div className="max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-200 sticky top-0 bg-white z-10 rounded-t-2xl">
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

        {/* Loading indicator for auto-fill */}
        {(isLoadingAddress || isLoadingPob) && (
          <div className="flex justify-center items-center py-4 bg-blue-50">
            <Loader2 className="w-5 h-5 animate-spin text-blue-600 mr-2" />
            <span className="text-sm text-blue-600">
              {translate("loading")}
            </span>
          </div>
        )}

        {/* Form Content */}
        <div className="pt-4 px-8">
          {/* FIRST SECTION - Current Address */}
          <div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Title Column */}
              <div className="lg:col-span-4">
                <h3 className="text-base font-semibold text-gray-800">
                  <span className="text-red-500">* </span>
                  {translate("selectAddress")}
                </h3>
              </div>

              {/* Form Fields Column */}
              <div className="lg:col-span-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  {/* Province/City */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <span className="text-red-500">* </span>
                      {translate("province")}
                    </label>
                    <ComboboxSelectProvince
                      dataSelect={selectedProvince}
                      onChangeSelected={handleProvinceChange}
                      disabled={isLoadingAddress}
                      locale={currentLocale}
                    />
                  </div>

                  {/* District */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <span className="text-red-500">* </span>
                      {currentLocale === "kh" ? "ស្រុក/ខណ្ឌ" : "District"}
                    </label>
                    <ComboboxSelectDistrict
                      dataSelect={selectedDistrict}
                      onChangeSelected={handleDistrictChange}
                      disabled={isLoadingAddress}
                      provinceCode={selectedProvince?.provinceCode}
                      locale={currentLocale}
                    />
                  </div>

                  {/* Commune */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <span className="text-red-500">* </span>
                      {translate("commune")}
                    </label>
                    <ComboboxSelectCommune
                      dataSelect={selectedCommune}
                      onChangeSelected={handleCommuneChange}
                      disabled={isLoadingAddress}
                      districtCode={selectedDistrict?.districtCode}
                      locale={currentLocale}
                    />
                  </div>

                  {/* Village */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <span className="text-red-500">* </span>
                      {translate("village")}
                    </label>
                    <ComboboxSelectVillage
                      dataSelect={selectedVillage}
                      onChangeSelected={handleVillageChange}
                      disabled={isLoadingAddress}
                      communeCode={selectedCommune?.communeCode}
                      locale={currentLocale}
                    />
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
              {/* Title Column */}
              <div className="lg:col-span-4">
                <h3 className="text-base font-semibold text-gray-800">
                  <span className="text-red-500">* </span>
                   {translate("selectPlaceOfBirth")}
                </h3>
              </div>

              {/* Form Fields Column */}
              <div className="lg:col-span-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  {/* Province/City */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <span className="text-red-500">* </span>
                      {translate("province")}
                    </label>
                    <ComboboxSelectProvince
                      dataSelect={pobProvince}
                      onChangeSelected={handlePobProvinceChange}
                      disabled={isLoadingPob}
                      locale={currentLocale}
                    />
                  </div>

                  {/* District */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <span className="text-red-500">* </span>
                      {translate("district")}
                    </label>
                    <ComboboxSelectDistrict
                      dataSelect={pobDistrict}
                      onChangeSelected={handlePobDistrictChange}
                      disabled={isLoadingPob}
                      provinceCode={pobProvince?.provinceCode}
                      locale={currentLocale}
                    />
                  </div>

                  {/* Commune */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <span className="text-red-500">* </span>
                      {translate("commune")}
                    </label>
                    <ComboboxSelectCommune
                      dataSelect={pobCommune}
                      onChangeSelected={handlePobCommuneChange}
                      disabled={isLoadingPob}
                      districtCode={pobDistrict?.districtCode}
                      locale={currentLocale}
                    />
                  </div>

                  {/* Village */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <span className="text-red-500">* </span>
                       {translate("village")}
                    </label>
                    <ComboboxSelectVillage
                      dataSelect={pobVillage}
                      onChangeSelected={handlePobVillageChange}
                      disabled={isLoadingPob}
                      communeCode={pobCommune?.communeCode}
                      locale={currentLocale}
                    />
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
            disabled={!selectedProvince || !selectedDistrict || !selectedCommune || !selectedVillage || !pobProvince || !pobDistrict || !pobCommune || !pobVillage}
            className="px-8 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-sm"
          >
            {translate("submit")}
          </Button>
        </div>
        </div>
      </div>
    </div>
  )
}

export default LocationModal