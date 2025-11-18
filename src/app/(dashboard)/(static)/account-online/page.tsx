"use client";
import Loading from "@/components/shared/common/loading";
import { Card, CardContent } from "@/components/ui/card";
import { useDebounce } from "@/utils/debounce/debounce";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, useCallback, Suspense } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { FormInputField } from "@/components/acc-online/form-field/form-field";
import { getAccountOnlineService } from "@/services/get-account/acc-online.service";
import { GetAccountModel } from "@/models/account-online/account-online.response";

function AccountPageContent() {
    const [searchCif, setSearchCif] = useState("");
    const [searchLegalId, setSearchLegalId] = useState("");
    const [account, setAccount] = useState<GetAccountModel | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const t = useTranslations();


    // Debounced search query - Optimized api performance when search
    const debouncedSearchQuery = useDebounce(searchCif, 400);
    const debouncedSearchLegalId = useDebounce(searchLegalId, 400);

    // change language
    const translate = useTranslations("NIDPage");

    const fetchingAccount = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await getAccountOnlineService({
                cif: searchCif,
                legalId: searchLegalId
            });
            console.log('this is response account', response)
            if (response) {
                toast.success(response?.message)
                setAccount(response);
            }
            else {
                toast.error("No data found.");
            }


        } catch (error: any) {
            console.log("Failed to fetch account : ", error);
            toast.error(error.errorMessage || "Failed to fetch account.");
        } finally {
            setIsLoading(false);
        }
    }, [debouncedSearchQuery, debouncedSearchLegalId]);

    // Simplified search change handler - just updates the state, debouncing handles the rest
    const handleSearchCifChange = (e: React.ChangeEvent<HTMLInputElement>) => {

        setSearchCif(e.target.value);
    };
    const handleSearchLegalIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {

        setSearchLegalId(e.target.value);
    };
    const handleSearch = () => {
        setAccount(null)
        fetchingAccount();
    }

    return (
        <Card className="h-full flex flex-col">
            <CardContent className="space-y-6 p-6 flex flex-col h-full">
                <div className="py-4">
                    <div className="flex justify-between">
                        <div className="flex flex-wrap items-center justify-start gap-4 w-full">
                            <div className="relative w-full md:w-[350px]">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    aria-label="search-reference"
                                    autoComplete="search-reference"
                                    type="search"
                                    placeholder={t("master.cif")}
                                    value={searchCif}
                                    onChange={handleSearchCifChange}
                                    className="pl-8 w-full min-w-[200px] text-xs md:min-w-[300px] h-9"
                                    disabled={isSubmitting}
                                />
                            </div>
                            <div className="relative w-full md:w-[350px]">
                                <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    aria-label="search-reference"
                                    autoComplete="search-reference"
                                    type="search"
                                    placeholder={t("master.legalId")}
                                    value={searchLegalId}
                                    onChange={handleSearchLegalIdChange}
                                    className="pl-8 w-full min-w-[200px] text-xs md:min-w-[300px] h-9"
                                    disabled={isSubmitting}
                                />
                            </div>
                        </div>
                        <div>
                            <Button onClick={() => handleSearch()}>{t("common.searchBtn")}</Button>
                        </div>
                    </div>
                    <div className="w-full p-4">
                        <Separator className="bg-gray-300" />
                    </div>

                    {/* ID Card and Selfie Image*/}
                    <div className="flex md:flex-row flex-col justify-evenly items-center mb-16 lg:gap-14 gap-8">
                        <div>
                            <p className="text-base text-gray-600 mb-4 text-center">
                                Card Image
                            </p>

                            <div className="relative">
                                <div className="absolute lg:-top-5 -top-3 lg:-left-6 -left-3 w-9 h-6 border-l-2 border-t-2 border-gray-400"></div>
                                <div className="absolute lg:-top-5 -top-3 lg:-right-6 -right-3 w-9 h-6 border-r-2 border-t-2 border-gray-400"></div>
                                <div className="absolute lg:-bottom-5 -bottom-3 lg:-left-6 -left-3 w-9 h-6 border-l-2 border-b-2 border-gray-400"></div>
                                <div className="absolute lg:-bottom-5 -bottom-3 lg:-right-6 -right-3 w-9 h-6 border-r-2 border-b-2 border-gray-400"></div>

                                <div className="relative lg:w-96 w-80 h-60 bg-gray-100 rounded overflow-hidden group cursor-pointer">
                                    <a
                                        href={
                                            account?.data?.nidImage
                                                ? `http://192.168.103.106:9393/api/images/${account.data.nidImage}`
                                                : "/app/image_selfie.jpg?height=192&width=320"
                                        }
                                        download="card_image.jpg"


                                    >
                                        <img
                                            src={
                                                account?.data?.nidImage
                                                    ? `http://192.168.103.106:9393/api/images/${account.data.nidImage}`
                                                    : "/app/image_selfie.jpg?height=192&width=320"
                                            }
                                            alt={account?.data?.selfieImage}
                                            className="w-full h-full object-cover"
                                        />

                                        {/* Hover Text */}
                                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center 
                        opacity-0 group-hover:opacity-100 transition-opacity">
                                            <p className="text-white text-lg font-semibold">Download Image</p>
                                        </div>
                                    </a>
                                </div>

                            </div>
                        </div>
                        <div>
                            <p className="text-base text-gray-600 mb-4 text-center">
                                Selfie image.
                            </p>

                            <div className="relative">
                                <div className="absolute lg:-top-5 -top-3 lg:-left-6 -left-3 w-9 h-6 border-l-2 border-t-2 border-gray-400"></div>
                                <div className="absolute lg:-top-5 -top-3 lg:-right-6 -right-3 w-9 h-6 border-r-2 border-t-2 border-gray-400"></div>
                                <div className="absolute lg:-bottom-5 -bottom-3 lg:-left-6 -left-3 w-9 h-6 border-l-2 border-b-2 border-gray-400"></div>
                                <div className="absolute lg:-bottom-5 -bottom-3 lg:-right-6 -right-3 w-9 h-6 border-r-2 border-b-2 border-gray-400"></div>

                                <div className="relative lg:w-96 w-80 h-60 bg-gray-100 rounded overflow-hidden group cursor-pointer">
                                    <a href={account?.data?.selfieImage
                                        ? `http://192.168.103.106:9393/api/images/${account.data.selfieImage}`
                                        : "/app/image_selfie.jpg?height=192&width=320"}
                                        download="selfie_image.jpg"
                                    >
                                        <img
                                            src={
                                                account?.data?.selfieImage
                                                    ? `http://192.168.103.106:9393/api/images/${account.data.selfieImage}`
                                                    : "/app/image_selfie.jpg?height=192&width=320"
                                            }
                                            alt="Selfie"
                                            className="w-full h-full"
                                        />
                                        {/* Hover Text */}
                                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center 
                        opacity-0 group-hover:opacity-100 transition-opacity">
                                            <p className="text-white text-lg font-semibold">Download Image</p>
                                        </div>
                                    </a>
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
                            value={account?.data?.legalFirstNameKh ?? ""}
                            onChange={(value) => null}
                            disabled={true}
                        />

                        {/* Last Name (KH)*/}
                        <div>
                            <label className="text-base font-medium text-gray-700 block mb-1">
                                {translate("lastNameKH")}
                            </label>
                            <Input
                                placeholder={translate("lastNameKH")}
                                value={account?.data?.legalLastNameKh || ""}
                                onChange={(e) => null}
                                className="w-full h-10"
                                disabled={true}
                            />
                        </div>

                        {/* Family Name */}
                        <div>
                            <label className="text-base font-medium text-gray-700 block mb-1">
                                {translate("familyNameEn")}
                            </label>
                            <Input
                                placeholder={translate("familyNameEn")}
                                value={account?.data?.legalLastNameEn || ""}
                                onChange={(e) => null}
                                className="w-full h-10"
                                disabled={true}
                            />
                        </div>

                        {/* Given Name */}
                        <div>
                            <label className="text-base font-medium text-gray-700 block mb-1">
                                {translate("givenNameEn")}
                            </label>
                            <Input
                                placeholder={translate("givenNameEn")}
                                value={account?.data?.legalFirstNameEn || ""}
                                onChange={(e) => null}
                                className="w-full h-10"
                                disabled={true}
                            />
                        </div>
                        {/* Marital Status */}
                        <div >
                            <label className="text-base font-medium text-gray-700 block mb-1">
                                {translate("marital")}
                            </label>
                            <Input
                                placeholder={translate("marital")}
                                value={account?.data?.maritalStatus || ""}
                                onChange={(e) => null}
                                className="w-full h-10"
                                disabled={true}
                            />
                        </div>
                        {/* Gender*/}
                        <div >
                            <label className="text-base font-medium text-gray-700 block mb-1">
                                {translate("gender")}
                            </label>
                            <Input
                                placeholder={translate("gender")}
                                value={account?.data?.legalGender || ""}
                                onChange={(e) => null}
                                className="w-full h-10"
                                disabled={true}
                            />
                        </div>
                        {/* occupation*/}
                        <div >
                            <label className="text-base font-medium text-gray-700 block mb-1">
                                {translate("occupation")}
                            </label>
                            <Input
                                placeholder={translate("occupation")}
                                value={account?.data?.occupation || ""}
                                onChange={(e) => null}
                                className="w-full h-10"
                                disabled={true}
                            />
                        </div>
                        {/* DOB*/}
                        <div >
                            <label className="text-base font-medium text-gray-700 block mb-1">
                                {translate("dateOfBirth")}
                            </label>
                            <Input
                                placeholder={translate("dateOfBirth")}
                                value={account?.data?.legalDateOfBirth || ""}
                                onChange={(e) => null}
                                className="w-full h-10"
                                disabled={true}
                            />
                        </div>
                        {/* Nationality*/}
                        <div >
                            <label className="text-base font-medium text-gray-700 block mb-1">
                                {translate("nationality")}
                            </label>
                            <Input
                                placeholder={translate("nationality")}
                                value={account?.data?.nationality || ""}
                                onChange={(e) => null}
                                className="w-full h-10"
                                disabled={true}
                            />
                        </div>
                        {/* Phone Number*/}
                        <div >
                            <label className="text-base font-medium text-gray-700 block mb-1">
                                {translate("phoneNumber")}
                            </label>
                            <Input
                                placeholder={translate("phoneNumber")}
                                value={account?.data?.phoneNumber || ""}
                                onChange={(e) => null}
                                className="w-full h-10"
                                disabled={true}
                            />
                        </div>
                        {/* CIF*/}
                        <div>
                            <label className="text-base font-medium text-gray-700 block mb-1">
                                {translate("cifNumber")}
                            </label>
                            <Input
                                placeholder={translate("cifNumber")}
                                value={account?.data?.cif || ""}
                                onChange={(e) => null}
                                className="w-full h-10"
                                disabled={true}
                            />
                        </div>
                        {/* Legal ID */}
                        <div>
                            <label className="text-base font-medium text-gray-700 block mb-1">
                                {translate("legalId")}
                            </label>
                            <Input
                                placeholder={translate("legalId")}
                                value={account?.data?.legalId || ""}
                                onChange={(e) => null}
                                className="w-full h-10"
                                disabled={true}
                            />
                        </div>
                        {/* Address */}
                        <div>
                            <label className="text-base font-medium text-gray-700 block mb-1">
                                {translate("address")}
                            </label>
                            <Input
                                placeholder={translate("address")}
                                value={account?.data?.legalAddress || ""}
                                onChange={(e) => null}
                                className="w-full h-10"
                                disabled={true}
                            />
                        </div>

                        {/* Place Of Birth */}
                        <div>
                            <label className="text-base font-medium text-gray-700 block mb-1">
                                {translate("pob")}
                            </label>
                            <Input
                                placeholder={translate("pob")}
                                value={account?.data?.legalPlaceOfBirth || ""}
                                onChange={(e) => null}
                                className="w-full h-10"
                                disabled={true}
                            />
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card >
    );
}

export default function AccountPage() {
    return (
        <Suspense fallback={<Loading />}>
            <AccountPageContent />
        </Suspense>
    );
}