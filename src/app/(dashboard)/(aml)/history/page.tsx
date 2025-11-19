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
import { createHistoryTableColumns } from "@/components/shared/table/history-content";
import HistoryDetailModal from "@/components/shared/modal/history-detail";

import {
  getAllAmlHistoryService,
  UpdateHistoryService,
} from "@/services/dashboard/aml/aml-history.service";

import { AmlStatusEnum } from "@/constants/AppResource/filter/status";
import {
  
  AllHistoryModel,
  HistoryModel,
} from "@/models/aml/management/respone/history-respones.model";
import AmlConfirmDialog from "@/components/shared/dialog/dialog-aml";

function History() {
  const [searchQuery, setSearchQuery] = useState("");
  const [historyData, setHistoryData] = useState<AllHistoryModel | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Detail modal
  const [isHistoryDetailOpen, setIsHistoryDetailOpen] = useState(false);
  const [selectedHistoryRecord, setSelectedHistoryRecord] =
    useState<HistoryModel | null>(null);

  // Confirm dialog
  const [isConfirmAmlDialogOpen, setIsConfirmAmlDialogOpen] = useState(false);
  const [selectedManagementId, setSelectedManagementId] = useState<number | null>(
    null
  );
  const [selectedStatus, setSelectedStatus] = useState<AmlStatusEnum>(
    AmlStatusEnum.PENDING
  );

  const searchParams = useSearchParams();
  const t = useTranslations();

  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  const { currentPage, updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.DASHBOARD.AML.HISTORY,
  });

  useEffect(() => {
    const pageParam = searchParams.get("pageNo");
    if (!pageParam) {
      updateUrlWithPage(1, true);
    }
  }, [searchParams, updateUrlWithPage]);

  const loadHistory = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getAllAmlHistoryService({
        search: debouncedSearchQuery,
        pageNo: currentPage,
        pageSize: 15,
      });
      setHistoryData(response);
    } catch (error) {
      console.error("❌ Failed to fetch history:", error);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchQuery, currentPage]);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // VIEW DETAIL
  const handleViewHistoryDetail = (history: HistoryModel) => {
    setSelectedHistoryRecord(history);
    setIsHistoryDetailOpen(true);
  };

  // OPEN CONFIRM DIALOG
  const openConfirmAmlDialog = (history: HistoryModel, status: AmlStatusEnum) => {
    setSelectedManagementId(history.id);
    setSelectedStatus(status);
    setIsConfirmAmlDialogOpen(true);
  };

  // CONFIRM STATUS UPDATE
  const handleConfirmAmlStatus = async () => {
    if (!selectedManagementId) return;

    try {
    
      await loadHistory();
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
        {/* HEADER */}
        <div className="flex justify-between">
          <div className="flex items-center gap-4 w-full">
            <div className="relative w-full md:w-[350px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                aria-label="search-history"
                type="search"
                placeholder="Search history"
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-8 w-full text-xs h-9"
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
                data={historyData?.content || []}
                columns={createHistoryTableColumns({
                  data: historyData,
                  handlers: {
                    handleViewHistoryDetail,
               
                  },
                })}
                loading={isLoading}
                emptyMessage="No history records found"
                getRowKey={(history) => history.id ?? crypto.randomUUID()}
              />

              <div className="border-t bg-background p-2 flex justify-end">
                <CustomPagination
                  currentPage={currentPage}
                  totalPages={historyData?.totalPages || 1}
                  onPageChange={handlePageChange}
                  size="md"
                />
              </div>
            </div>
          </div>
        </div>

        {/* MODALS */}
        {selectedHistoryRecord && (
          <HistoryDetailModal
            history={selectedHistoryRecord}
            isOpen={isHistoryDetailOpen}
            onClose={() => setIsHistoryDetailOpen(false)}
          />
        )}

        <AmlConfirmDialog
          isOpen={isConfirmAmlDialogOpen}
          onClose={() => setIsConfirmAmlDialogOpen(false)}
          status={selectedStatus}
          onConfirm={handleConfirmAmlStatus}
        />
      </CardContent>
    </Card>
  );
}

export default function HistoryPage() {
  return (
    <Suspense fallback={<Loading />}>
      <History />
    </Suspense>
  );
}
