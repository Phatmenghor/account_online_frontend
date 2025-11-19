"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
import { CustomPagination } from "@/components/shared/pagination/custom-pagination";
import { DataTable } from "@/components/shared/table/data-table";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ROUTES } from "@/constants/AppRoutes/routes";
import { usePagination } from "@/hooks/use-pagination";
import { useDebounce } from "@/utils/debounce/debounce";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import Loading from "@/components/shared/common/loading";
import { createManagementTableColumns } from "@/components/shared/table/management-content";
import {
  getAllAmlManagementService,
  updateManagementService,
} from "@/services/dashboard/aml/aml-management.service";
import { AmlStatusEnum } from "@/constants/AppResource/filter/status";
import AmlConfirmDialog from "@/components/shared/dialog/dialog-aml";
import AmlAlertViewModal from "@/components/shared/modal/management-detail";
import {
  AllManagementModel,
  ManagementModel,
} from "@/models/aml/management/respone/management-response";

function Management() {
  const [searchQuery, setSearchQuery] = useState("");
  const [amlManagement, setAmlManagement] = useState<AllManagementModel | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [statusFilter] = useState<string>("PENDING");

  // View Detail Modal
  const [isAmlManagementDetailOpen, setIsAmlManagementDetailOpen] =
    useState(false);
  const [selectedAmlManagement, setSelectedAmlManagement] =
    useState<ManagementModel | null>(null);

  // Confirm Dialog
  const [isConfirmAmlDialogOpen, setIsConfirmAmlDialogOpen] = useState(false);
  const [selectedManagementId, setSelectedManagementId] = useState<
    number | null
  >(null);
  const [selectedStatus, setSelectedStatus] = useState<AmlStatusEnum>(
    AmlStatusEnum.PENDING
  );

  const searchParams = useSearchParams();
  const t = useTranslations();

  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  const { currentPage, updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.DASHBOARD.AML.MANAGEMENT,
  });

  useEffect(() => {
    const pageParam = searchParams.get("pageNo");
    if (!pageParam) {
      updateUrlWithPage(1, true);
    }
  }, [searchParams, updateUrlWithPage]);

  const loadManagement = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getAllAmlManagementService({
        search: debouncedSearchQuery,
        pageNo: currentPage,
        pageSize: 15,
        status: statusFilter,
      });
      setAmlManagement(response);
    } catch (error) {
      console.error("❌ Failed to fetch AML management:", error);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchQuery, currentPage, statusFilter]);

  useEffect(() => {
    loadManagement();
  }, [loadManagement]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // VIEW DETAIL HANDLER
  const handleViewManagementDetail = (management: ManagementModel) => {
    setSelectedAmlManagement(management);
    setIsAmlManagementDetailOpen(true);
  };

  // CONFIRM DIALOG
  const openConfirmAmlDialog = (
    management: ManagementModel,
    status: AmlStatusEnum
  ) => {
    setSelectedManagementId(management?.id);
    setSelectedStatus(status);
    setIsConfirmAmlDialogOpen(true);
  };

  const handleConfirmAmlStatus = async () => {
    if (!selectedManagementId) return;

    try {
      await updateManagementService(selectedManagementId, {
        status: selectedStatus,
      });

      await loadManagement();
    } catch (error) {
      console.error("Error updating AML status:", error);
    } finally {
      setIsConfirmAmlDialogOpen(false);
      setSelectedManagementId(null);
    }
  };

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="space-y-6 p-6 flex flex-col h-full">
        {/* Header */}
        <div className="flex justify-between">
          <div className="flex flex-wrap items-center justify-start gap-4 w-full">
            <div className="relative w-full md:w-[350px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                aria-label="search-management"
                type="search"
                placeholder={"Search management"}
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-8 w-full min-w-[200px] text-xs md:min-w-[300px] h-9"
              />
            </div>
          </div>
        </div>

        <Separator className="bg-gray-300" />

        {/* TABLE */}
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 rounded-md border overflow-hidden flex flex-col">
            <div className="flex-1 overflow-x-auto">
              <DataTable
                data={amlManagement?.content || []}
                columns={createManagementTableColumns({
                  data: amlManagement,
                  handlers: {
                    handleViewManagementDetail,
                    openConfirmAmlDialog,
                  },
                })}
                loading={isLoading}
                emptyMessage="No AML management records found"
                getRowKey={(management) => management.id ?? crypto.randomUUID()}
              />

              <div className="border-t bg-background p-2 flex justify-end">
                <CustomPagination
                  currentPage={currentPage}
                  totalPages={amlManagement?.totalPages || 1}
                  onPageChange={handlePageChange}
                  size="md"
                />
              </div>
            </div>
          </div>
        </div>

        {/* CONFIRM DIALOG */}
        <AmlConfirmDialog
          isOpen={isConfirmAmlDialogOpen}
          onClose={() => setIsConfirmAmlDialogOpen(false)}
          status={selectedStatus}
          onConfirm={handleConfirmAmlStatus}
        />

        {/* VIEW DETAIL MODAL */}
        <AmlAlertViewModal
          isOpen={isAmlManagementDetailOpen}
          onClose={() => setIsAmlManagementDetailOpen(false)}
          alert={selectedAmlManagement!}
          alertId={selectedAmlManagement?.id}
        />
      </CardContent>
    </Card>
  );
}

export default function ManagementPage() {
  return (
    <Suspense fallback={<Loading />}>
      <Management />
    </Suspense>
  );
}
