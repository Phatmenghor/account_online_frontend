"use client"
import { MapPin, X, Loader2 } from "lucide-react"
import type React from "react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { useClientLocale } from "@/context/provider/local-provider"
import { useCommunes, useDistricts, useProvinces, useVillages } from "@/hooks/fetch-address"
import type { CommuneModel, DistrictModel, ProvinceModel, VillageModel } from "@/models/address/address.response"
import { ComboboxSelectProvince } from "../shared/combo-box/combobox-province"
import { ComboboxSelectDistrict } from "../shared/combo-box/combobox-district"
import { ComboboxSelectCommune } from "../shared/combo-box/combobox-commune"
import { ComboboxSelectVillage } from "../shared/combo-box/combobox-village"

interface LocationData {
  province: string
  district: string
  commune: string
  village: string
}

interface LocationModalProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: LocationData) => void
  formData: LocationData
  setFormData: React.Dispatch<React.SetStateAction<LocationData>>
}

const LocationModal = ({ isOpen, onClose, onSubmit, formData, setFormData }: LocationModalProps) => {
  // Get current locale
  const { locale: currentLocale } = useClientLocale()

  // First section (Current Address)
  const [selectedProvince, setSelectedProvince] = useState<ProvinceModel | null>(null)
  const [selectedDistrict, setSelectedDistrict] = useState<DistrictModel | null>(null)
  const [selectedCommune, setSelectedCommune] = useState<CommuneModel | null>(null)
  const [selectedVillage, setSelectedVillage] = useState<VillageModel | null>(null)

  // Second section (Worker Location)
  const [workerProvince, setWorkerProvince] = useState<ProvinceModel | null>(null)
  const [workerDistrict, setWorkerDistrict] = useState<DistrictModel | null>(null)
  const [workerCommune, setWorkerCommune] = useState<CommuneModel | null>(null)
  const [workerVillage, setWorkerVillage] = useState<VillageModel | null>(null)

  // Fetch data for FIRST SECTION (Current Address)
  const { data: provinces, isLoading: isLoadingProvinces } = useProvinces()
  const { data: districts, isLoading: isLoadingDistricts } = useDistricts(formData.province)
  const { data: communes, isLoading: isLoadingCommunes } = useCommunes(formData.district)
  const { data: villages, isLoading: isLoadingVillages } = useVillages(formData.commune)

  // Fetch data for SECOND SECTION (Worker Location) - INDEPENDENT DATA
  const { data: workerDistricts, isLoading: isLoadingWorkerDistricts } = useDistricts(workerProvince?.provinceCode || "")
  const { data: workerCommunes, isLoading: isLoadingWorkerCommunes } = useCommunes(workerDistrict?.districtCode || "")
  const { data: workerVillages, isLoading: isLoadingWorkerVillages } = useVillages(workerCommune?.communeCode || "")

  // Handlers for cascading dropdowns (FIRST SECTION: Current Address)
  const handleProvinceChange = (province: ProvinceModel | null) => {
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
  }

  const handleDistrictChange = (district: DistrictModel | null) => {
    setSelectedDistrict(district)
    setSelectedCommune(null)
    setSelectedVillage(null)

    setFormData((prev) => ({
      ...prev,
      district: district?.districtCode || "",
      commune: "",
      village: "",
    }))
  }

  const handleCommuneChange = (commune: CommuneModel | null) => {
    setSelectedCommune(commune)
    setSelectedVillage(null)

    setFormData((prev) => ({
      ...prev,
      commune: commune?.communeCode || "",
      village: "",
    }))
  }

  const handleVillageChange = (village: VillageModel | null) => {
    setSelectedVillage(village)

    setFormData((prev) => ({
      ...prev,
      village: village?.villageCode || "",
    }))
  }

  // Handlers for cascading dropdowns (SECOND SECTION: Worker Location)
  const handleWorkerProvinceChange = (province: ProvinceModel | null) => {
    setWorkerProvince(province)
    setWorkerDistrict(null)
    setWorkerCommune(null)
    setWorkerVillage(null)
  }

  const handleWorkerDistrictChange = (district: DistrictModel | null) => {
    setWorkerDistrict(district)
    setWorkerCommune(null)
    setWorkerVillage(null)
  }

  const handleWorkerCommuneChange = (commune: CommuneModel | null) => {
    setWorkerCommune(commune)
    setWorkerVillage(null)
  }

  const handleWorkerVillageChange = (village: VillageModel | null) => {
    setWorkerVillage(village)
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
              {currentLocale === "kh" ? "អាសយដ្ឋានបច្ចុប្បន្នរបស់អ្នក" : "Current Address"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Form Content */}
        <div className="pt-4 px-8">
          {/* FIRST SECTION - Current Address */}
          <div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Title Column */}
              <div className="lg:col-span-4">
                <h3 className="text-base font-semibold text-gray-800">
                  <span className="text-red-500">* </span>
                  {currentLocale === "kh" ? "សូមជ្រើសរើសអាសយដ្ឋាន:" : "Select Your Address:"}
                </h3>
              </div>

              {/* Form Fields Column */}
              <div className="lg:col-span-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  {/* Province/City */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <span className="text-red-500">* </span>
                      {currentLocale === "kh" ? "ខេត្ត/ក្រុង" : "Province/City"}
                      {isLoadingProvinces && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                    </label>
                    <ComboboxSelectProvince
                      dataSelect={selectedProvince}
                      onChangeSelected={handleProvinceChange}
                      disabled={isLoadingProvinces}
                      provinces={provinces}
                      isLoading={isLoadingProvinces}
                      locale={currentLocale}
                    />
                  </div>

                  {/* District */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <span className="text-red-500">* </span>
                      {currentLocale === "kh" ? "ស្រុក/ខណ្ឌ" : "District"}
                      {isLoadingDistricts && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                    </label>
                    <ComboboxSelectDistrict
                      dataSelect={selectedDistrict}
                      onChangeSelected={handleDistrictChange}
                      disabled={isLoadingDistricts || !formData.province}
                      districts={districts}
                      isLoading={isLoadingDistricts}
                      locale={currentLocale}
                    />
                  </div>

                  {/* Commune */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <span className="text-red-500">* </span>
                      {currentLocale === "kh" ? "ឃុំ/សង្កាត់" : "Commune"}
                      {isLoadingCommunes && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                    </label>
                    <ComboboxSelectCommune
                      dataSelect={selectedCommune}
                      onChangeSelected={handleCommuneChange}
                      disabled={isLoadingCommunes || !formData.district}
                      communes={communes}
                      isLoading={isLoadingCommunes}
                      locale={currentLocale}
                    />
                  </div>

                  {/* Village */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <span className="text-red-500">* </span>
                      {currentLocale === "kh" ? "ភូមិ" : "Village"}
                      {isLoadingVillages && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                    </label>
                    <ComboboxSelectVillage
                      dataSelect={selectedVillage}
                      onChangeSelected={handleVillageChange}
                      disabled={isLoadingVillages || !formData.commune}
                      villages={villages}
                      isLoading={isLoadingVillages}
                      locale={currentLocale}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-4"></div>

          {/* SECOND SECTION - Worker Location */}
          <div>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Title Column */}
              <div className="lg:col-span-4">
                <h3 className="text-base font-semibold text-gray-800">
                  <span className="text-red-500">* </span>
                  {currentLocale === "kh" ? "សូមជ្រើសរើសទីតាំងកម្មករ:" : "Select Worker Location:"}
                </h3>
              </div>

              {/* Form Fields Column */}
              <div className="lg:col-span-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                  {/* Province/City */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <span className="text-red-500">* </span>
                      {currentLocale === "kh" ? "ខេត្ត/ក្រុង" : "Province/City"}
                      {isLoadingProvinces && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                    </label>
                    <ComboboxSelectProvince
                      dataSelect={workerProvince}
                      onChangeSelected={handleWorkerProvinceChange}
                      disabled={isLoadingProvinces}
                      provinces={provinces}
                      isLoading={isLoadingProvinces}
                      locale={currentLocale}
                    />
                  </div>

                  {/* District */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <span className="text-red-500">* </span>
                      {currentLocale === "kh" ? "ស្រុក/ខណ្ឌ" : "District"}
                      {isLoadingWorkerDistricts && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                    </label>
                    <ComboboxSelectDistrict
                      dataSelect={workerDistrict}
                      onChangeSelected={handleWorkerDistrictChange}
                      disabled={isLoadingWorkerDistricts || !workerProvince}
                      districts={workerDistricts}
                      isLoading={isLoadingWorkerDistricts}
                      locale={currentLocale}
                    />
                  </div>

                  {/* Commune */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <span className="text-red-500">* </span>
                      {currentLocale === "kh" ? "ឃុំ/សង្កាត់" : "Commune"}
                      {isLoadingWorkerCommunes && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                    </label>
                    <ComboboxSelectCommune
                      dataSelect={workerCommune}
                      onChangeSelected={handleWorkerCommuneChange}
                      disabled={isLoadingWorkerCommunes || !workerDistrict}
                      communes={workerCommunes}
                      isLoading={isLoadingWorkerCommunes}
                      locale={currentLocale}
                    />
                  </div>

                  {/* Village */}
                  <div>
                    <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <span className="text-red-500">* </span>
                      {currentLocale === "kh" ? "ភូមិ" : "Village"}
                      {isLoadingWorkerVillages && <Loader2 className="w-4 h-4 animate-spin text-gray-400" />}
                    </label>
                    <ComboboxSelectVillage
                      dataSelect={workerVillage}
                      onChangeSelected={handleWorkerVillageChange}
                      disabled={isLoadingWorkerVillages || !workerCommune}
                      villages={workerVillages}
                      isLoading={isLoadingWorkerVillages}
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
            {currentLocale === "kh" ? "បិទ" : "Close"}
          </Button>
          <Button
            onClick={() => onSubmit(formData)}
            disabled={!formData.province || !formData.district || !formData.commune || !formData.village}
            className="px-8 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-lg transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed shadow-sm"
          >
            {currentLocale === "kh" ? "បញ្ជូន" : "Submit"}
          </Button>
        </div>
        </div>
      </div>
    </div>
  )
}

export default LocationModal