"use client";

import { Suspense } from "react";
import { CustomPagination } from "@/components/shared/pagination/custom-pagination";
import { DataTable } from "@/components/shared/table/data-table";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/AppRoutes/routes";
import { usePagination } from "@/hooks/use-pagination";
import { useDebounce } from "@/utils/debounce/debounce";
import { Search, Download } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Loading from "@/components/shared/common/loading";
import ExcelLoading from "@/components/shared/common/excel-loading";
import { createSuccessAccountTableColumns } from "@/components/shared/table/success-account-content";
import {
  AllSuccessAccountOnlineModel,
  SuccessAccountOnlineModel,
} from "@/models/open-acc-success/success-account-response.model";
import { getSuccessAccountOnlineService } from "@/services/get-account/acc-online-success.service";
import SuccessAccountViewModal from "@/components/shared/modal/success-account-detail-modal";
import { AppToast } from "@/components/shared/toast/app-toast";
import { ExcelExporter, ExcelColumn, ExcelSheet } from "@/utils/export-file/excel";

function SuccessAccountPageContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [accounts, setAccounts] = useState<AllSuccessAccountOnlineModel | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [selectedAccount, setSelectedAccount] =
    useState<SuccessAccountOnlineModel | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [amlStatusFilter, setAmlStatusFilter] = useState("");
  const [riskLevelFilter, setRiskLevelFilter] = useState("");

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
      console.error("Failed to fetch success accounts: ", error);
      AppToast({
        type: "error",
        message: "Failed to fetch success accounts",
      });
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchQuery, currentPage]);

  useEffect(() => {
    loadAccounts();
  }, [loadAccounts, debouncedSearchQuery]);

  // Filter accounts based on selected filters
  const filteredAccounts = useCallback(() => {
    if (!accounts) return [];

    return accounts.content.filter((account) => {
      const amlMatch = !amlStatusFilter || account.amlStatus === amlStatusFilter;
      const riskMatch = !riskLevelFilter || account.amlRiskLevel === riskLevelFilter;
      return amlMatch && riskMatch;
    });
  }, [accounts, amlStatusFilter, riskLevelFilter]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleViewAccountDetail = (account: SuccessAccountOnlineModel) => {
    setSelectedAccount(account);
    setIsDetailOpen(true);
  };

  const handleExportToExcel = async () => {
    if (!accounts) {
      AppToast({
        type: "error",
        message: "No data to export",
      });
      return;
    }

    setIsExporting(true);
    try {
      const columnsConfig: ExcelColumn[] = [
        { header: "CIF", key: "cif", width: 15 },
        { header: "Legal ID", key: "legalId", width: 18 },
        { header: "Full Name", key: "legalHolderName", width: 25 },
        { header: "KHR Account", key: "khrAccount", width: 18 },
        { header: "USD Account", key: "usdAccount", width: 18 },
        { header: "Phone", key: "phoneNumber", width: 15 },
        { header: "AML Status", key: "amlStatus", width: 15 },
        { header: "Risk Level", key: "amlRiskLevel", width: 15 },
        { header: "Branch", key: "branchNameKh", width: 20 },
        {
          header: "Created Date",
          key: "createdAt",
          width: 18,
          type: "date",
          format: "mm/dd/yyyy"
        },
      ];

      const exporter = new ExcelExporter({
        filename: `success_accounts_${new Date().toISOString().split('T')[0]}.xlsx`,
        title: "Success Accounts Report",
        author: "Account Online System",
        useAlternateRows: true,
      });

      const sheetConfig: ExcelSheet = {
        name: "Success Accounts",
        data: accounts.content,
        columns: columnsConfig,
        autoFilter: true,
        freezeRows: 1,
      };

      exporter.addSheet(sheetConfig);
      await exporter.export();

      AppToast({
        type: "success",
        message: "Success accounts exported to Excel successfully!",
      });
    } catch (error: any) {
      console.error("Excel export error:", error);
      AppToast({
        type: "error",
        message: "Failed to export success accounts to Excel",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const uniqueAmlStatuses = Array.from(
    new Set(accounts?.content?.map((acc) => acc.amlStatus) || [])
  ).filter(Boolean);

  const uniqueRiskLevels = Array.from(
    new Set(accounts?.content?.map((acc) => acc.amlRiskLevel) || [])
  ).filter(Boolean);

  return (
    <Card className="h-full flex flex-col">
      <CardContent className="space-y-6 p-6 flex flex-col h-full">
        {/* Header with Search and Filters */}
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="relative flex-1 min-w-[200px] md:min-w-[350px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                aria-label="search-success-account"
                autoComplete="search-success-account"
                type="search"
                placeholder="Search by CIF, Legal ID, Name..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-8 w-full text-xs h-9"
              />
            </div>

            <Button
              onClick={handleExportToExcel}
              disabled={isExporting || !accounts?.content?.length}
              className="flex items-center gap-2 h-9"
              title="Export to Excel"
            >
              {isExporting ? (
                <>
                  <ExcelLoading />
                  Exporting...
                </>
              ) : (
                <>
                  <Download className="h-4 w-4" />
                  Export Excel
                </>
              )}
            </Button>
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap gap-3">
            <select
              value={amlStatusFilter}
              onChange={(e) => setAmlStatusFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-xs bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All AML Status</option>
              {uniqueAmlStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <select
              value={riskLevelFilter}
              onChange={(e) => setRiskLevelFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-xs bg-white hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">All Risk Levels</option>
              {uniqueRiskLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>

            {(amlStatusFilter || riskLevelFilter) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setAmlStatusFilter("");
                  setRiskLevelFilter("");
                }}
                className="h-9 text-xs"
              >
                Clear Filters
              </Button>
            )}
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
                data={filteredAccounts()}
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
