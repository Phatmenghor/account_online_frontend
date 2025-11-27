"use client";

import { Suspense } from "react";
import { CustomPagination } from "@/components/shared/pagination/custom-pagination";
import { DataTable } from "@/components/shared/table/data-table";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ROUTES } from "@/constants/AppRoutes/routes";
import { usePagination } from "@/hooks/use-pagination";
import { useDebounce } from "@/utils/debounce/debounce";
import { Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Loading from "@/components/shared/common/loading";
import { createSuccessAccountTableColumns } from "@/components/shared/table/success-account-content";
import {
    AllSuccessAccountOnlineModel,
    SuccessAccountOnlineModel,
} from "@/models/open-acc-success/success-account-response.model";
import { getSuccessAccountOnlineService } from "@/services/get-account/acc-online-success.service";
import SuccessAccountViewModal from "@/components/shared/modal/success-account-detail-modal";

function SuccessAccountPageContent() {
    const [searchQuery, setSearchQuery] = useState("");
    const [accounts, setAccounts] =
        useState<AllSuccessAccountOnlineModel | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedAccount, setSelectedAccount] =
        useState<SuccessAccountOnlineModel | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    const searchParams = useSearchParams();

    // Debounced search query - Optimized api performance when search
    const debouncedSearchQuery = useDebounce(searchQuery, 400);

    const { currentPage, updateUrlWithPage, handlePageChange } = usePagination({
        baseRoute: ROUTES.DASHBOARD.STATIC.ACCOUNT_ONLINE_SUCCESS,
    });

    useEffect(() => {
        const pageParam = searchParams.get("pageNo");
        if (!pageParam) {
            updateUrlWithPage(1, true);
        }
    }, [searchParams, updateUrlWithPage]);

    const loadAccounts = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await getSuccessAccountOnlineService({
                search: debouncedSearchQuery,
                pageNo: currentPage,
                pageSize: 15,
            });
            setAccounts(response);
        } catch (error: any) {
            console.log("Failed to fetch success accounts: ", error);
        } finally {
            setIsLoading(false);
        }
    }, [debouncedSearchQuery, currentPage]);

    useEffect(() => {
        loadAccounts();
    }, [loadAccounts, debouncedSearchQuery]);

    // Simplified search change handler - just updates the state, debouncing handles the rest
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const handleViewAccountDetail = (account: SuccessAccountOnlineModel) => {
        setSelectedAccount(account);
        setIsDetailOpen(true);
    };

    return (
        <Card className="h-full flex flex-col">
            <CardContent className="space-y-6 p-6 flex flex-col h-full">
                <div className="flex justify-between">
                    <div className="flex flex-wrap items-center justify-start gap-4 w-full">
                        <div className="relative w-full md:w-[350px]">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input
                                aria-label="search-success-account"
                                autoComplete="search-success-account"
                                type="search"
                                placeholder="Search by CIF, Legal ID, Name..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                                className="pl-8 w-full min-w-[200px] text-xs md:min-w-[300px] h-9"
                            />
                        </div>
                    </div>
                </div>

                <div className="w-full">
                    <Separator className="bg-gray-300" />
                </div>

                <div className="flex-1 flex flex-col min-h-0">
                    {/* Table container with proper overflow handling */}
                    <div className="flex-1 rounded-md border overflow-hidden flex flex-col">
                        <div className="flex-1 overflow-x-auto">
                            <DataTable
                                data={accounts?.content || []}
                                columns={createSuccessAccountTableColumns({
                                    data: accounts,
                                    handlers: {
                                        handleViewAccountDetail,
                                    },
                                })}
                                loading={isLoading}
                                emptyMessage="No success accounts found"
                                getRowKey={(account) => account.id}
                            />
                            {/* Pagination positioned to the right and outside the scrollable area */}
                            <div className="border-t bg-background p-2 flex justify-end">
                                <CustomPagination
                                    currentPage={currentPage}
                                    totalPages={accounts?.totalPages || 1}
                                    onPageChange={handlePageChange}
                                    size="md"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <SuccessAccountViewModal
                    isOpen={isDetailOpen}
                    onClose={() => {
                        setIsDetailOpen(false);
                        setSelectedAccount(null);
                    }}
                    account={selectedAccount ?? undefined}
                />
            </CardContent>
        </Card>
    );
}

export default function SuccessAccountPage() {
    return (
        <Suspense fallback={<Loading />}>
            <SuccessAccountPageContent />
        </Suspense>
    );
}
