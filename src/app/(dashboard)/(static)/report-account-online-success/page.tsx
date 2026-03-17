"use client";

import { Suspense } from "react";
import { DataTable } from "@/components/shared/table/data-table";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ROUTES } from "@/constants/AppRoutes/routes";
import { usePagination } from "@/hooks/use-pagination";
import { useDebounce } from "@/utils/debounce/debounce";
import { Search, FileSpreadsheet, Download, Filter, RotateCcw, Calendar } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import Loading from "@/components/shared/common/loading";
import {
    AllSuccessAccountOnlineExcelModel,
    SuccessAccountOnlineExcelModel,
} from "@/models/open-acc-success/success-account-response.model";
import { getSuccessAccountOnlineExcelService } from "@/services/get-account/acc-online-success.service";
import { Button } from "@/components/ui/button";
import { CustomDatePicker } from "@/components/shared/common/custom-date-picker";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { format } from "date-fns";
import { createSuccessAccountExcelTableColumns } from "@/components/shared/table/report-success-account-content";

// Helper to format date as YYYY-MM-DD
const formatDate = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
};

// Add this constant at the top with your other constants
const IMAGE_BASE_URL = "http://192.168.101.5:7070/api/customer-images";

// Update EXCEL_HEADERS and COLUMN_WIDTHS to include image columns
const EXCEL_HEADERS = ["#", "Legal ID", "CIF", "KHR Account", "USD Account", "Mnemonic", "Branch NameKh", "NID Image", "Selfie Image", "Created At"];
const COLUMN_WIDTHS = [5, 18, 18, 22, 22, 18, 30, 20, 20, 20];

// Helper to fetch image and convert to base64
const fetchImageAsBase64 = async (imageUrl: string): Promise<{ base64: string; extension: string } | null> => {
    try {
        const response = await fetch(imageUrl);
        if (!response.ok) return null;
        const blob = await response.blob();
        const extension = imageUrl.split(".").pop()?.toLowerCase() || "jpg";
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = (reader.result as string).split(",")[1];
                resolve({ base64, extension });
            };
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(blob);
        });
    } catch {
        return null;
    }
};


function SuccessAccountExcelPageContent() {
    const [searchQuery, setSearchQuery] = useState("");
    const [accounts, setAccounts] = useState<AllSuccessAccountOnlineExcelModel | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isExportingExcel, setIsExportingExcel] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<SuccessAccountOnlineExcelModel | null>(null);
    const [isDetailOpen, setIsDetailOpen] = useState(false);

    // Date range state
    const today = new Date();
    const defaultFromDate = formatDate(today);
    const defaultToDate = formatDate(today);
    const [fromDate, setFromDate] = useState<string>(defaultFromDate);
    const [toDate, setToDate] = useState<string>(defaultToDate);

    const searchParams = useSearchParams();
    const debouncedSearchQuery = useDebounce(searchQuery, 400);

    const { currentPage, updateUrlWithPage, handlePageChange } = usePagination({
        baseRoute: ROUTES.DASHBOARD.STATIC.ACCOUNT_ONLINE_SUCCESS_REPORT,
    });

    useEffect(() => {
        const pageParam = searchParams.get("");
        if (!pageParam) {
            updateUrlWithPage(1, true);
        }
    }, [searchParams, updateUrlWithPage]);

    const loadAccounts = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await getSuccessAccountOnlineExcelService({
                search: debouncedSearchQuery,
                fromDate: fromDate || undefined,
                toDate: toDate || undefined,
            });
            setAccounts(response);
        } catch (error: any) {
            console.error("Failed to fetch success accounts: ", error);
        } finally {
            setIsLoading(false);
        }
    }, [debouncedSearchQuery, currentPage, fromDate, toDate]);

    useEffect(() => {
        loadAccounts();
    }, [loadAccounts, debouncedSearchQuery]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchQuery(e.target.value);
    };

    const handleResetFilter = () => {
        setFromDate(defaultFromDate);
        setToDate(defaultToDate);
    };

    const handleViewAccountDetail = (account: SuccessAccountOnlineExcelModel) => {
        setSelectedAccount(account);
        setIsDetailOpen(true);
    };

    // ✅ Export all currently loaded data to Excel
    const exportToExcel = async (): Promise<void> => {
        setIsExportingExcel(true);
        try {
            const allData = await getSuccessAccountOnlineExcelService({
                search: debouncedSearchQuery,
                fromDate: fromDate || undefined,
                toDate: toDate || undefined,
            });

            const rows: SuccessAccountOnlineExcelModel[] = allData?.content || [];

            if (rows.length === 0) {
                toast.warning("No data available to export.");
                return;
            }

            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet("Success Accounts");

            // ── Title row (Row 1) ──────────────────────────────────────────
            worksheet.mergeCells(1, 1, 1, EXCEL_HEADERS.length);
            const titleCell = worksheet.getCell("A1");
            titleCell.value = "Success Account Online Report";
            titleCell.font = { size: 16, bold: true, color: { argb: "FFFFFFFF" } };
            titleCell.alignment = { vertical: "middle", horizontal: "center" };
            titleCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1F4E78" } };

            // ── Summary row (Row 2) ────────────────────────────────────────
            worksheet.mergeCells(2, 1, 2, EXCEL_HEADERS.length);
            const summaryCell = worksheet.getCell("A2");
            summaryCell.value = `Total Records: ${allData?.countAll ?? rows.length}  |  From: ${fromDate}  To: ${toDate}`;
            summaryCell.font = { size: 11, bold: true };
            summaryCell.alignment = { vertical: "middle", horizontal: "center" };
            summaryCell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFDDDDDD" } };

            // ── Header row (Row 4) ─────────────────────────────────────────
            const headerRow = worksheet.getRow(4);
            EXCEL_HEADERS.forEach((text, idx) => {
                const cell = headerRow.getCell(idx + 1);
                cell.value = text;
                cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
                cell.alignment = { vertical: "middle", horizontal: "center" };
                cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF007ACC" } };
                cell.border = {
                    top: { style: "thin" }, bottom: { style: "thin" },
                    left: { style: "thin" }, right: { style: "thin" },
                };
                worksheet.getColumn(idx + 1).width = COLUMN_WIDTHS[idx];
            });

            // ── Data rows (starting Row 5) with images ─────────────────────
            const IMAGE_ROW_HEIGHT = 90; // px height per row for images

            for (let i = 0; i < rows.length; i++) {
                const item = rows[i];
                const excelRowNumber = i + 5; // Row 5 onwards

                // Add text data first
                const row = worksheet.addRow([
                    i + 1,
                    item.legalId || "---",
                    item.cif || "---",
                    item.khrAccount || "---",
                    item.usdAccount || "---",
                    item.mnemonic || "---",
                    item.branchNameKh || "---",
                    "", // col 8: NID Image — will be filled by embedded image
                    "", // col 9: Selfie Image — will be filled by embedded image
                    item.createdAt || "---",
                ]);

                // Set row height to fit images
                row.height = IMAGE_ROW_HEIGHT;

                row.eachCell((cell) => {
                    cell.fill = {
                        type: "pattern", pattern: "solid",
                        fgColor: { argb: i % 2 === 0 ? "FFF3F3F3" : "FFFFFFFF" },
                    };
                    cell.border = {
                        top: { style: "thin" }, bottom: { style: "thin" },
                        left: { style: "thin" }, right: { style: "thin" },
                    };
                    cell.alignment = { vertical: "middle", horizontal: "center" };
                });

                // ── Embed NID image (col H = 8) ──────────────────────────────────
                if (item.nidImageName) {
                    const nidImg = await fetchImageAsBase64(`${IMAGE_BASE_URL}/${item.nidImageName}`);
                    if (nidImg) {
                        const imageId = workbook.addImage({
                            base64: nidImg.base64,
                            extension: nidImg.extension as "jpeg" | "png" | "gif",
                        });
                        worksheet.addImage(imageId, {
                            tl: { col: 7, row: excelRowNumber - 1 } as any,
                            ext: { width: 120, height: 80 },
                            editAs: "oneCell",
                        } as any);
                    } else {
                        worksheet.getCell(excelRowNumber, 8).value = "Image N/A";
                    }
                }

                // ── Embed Selfie image (col I = 9) ───────────────────────────────
                if (item.selfieImageName) {
                    const selfieImg = await fetchImageAsBase64(`${IMAGE_BASE_URL}/${item.selfieImageName}`);
                    if (selfieImg) {
                        const imageId = workbook.addImage({
                            base64: selfieImg.base64,
                            extension: selfieImg.extension as "jpeg" | "png" | "gif",
                        });
                        worksheet.addImage(imageId, {
                            tl: { col: 8, row: excelRowNumber - 1 } as any,
                            ext: { width: 120, height: 80 },
                            editAs: "oneCell",
                        } as any);
                    } else {
                        worksheet.getCell(excelRowNumber, 9).value = "Image N/A";
                    }
                }
            }

            // ── Date formatting for createdAt (col 10)  ─
            [10].forEach((colIdx) => {
                worksheet.getColumn(colIdx).eachCell((cell, rowNumber) => {
                    if (rowNumber > 4 && cell.value && cell.value !== "---") {
                        try {
                            const d = new Date(cell.value as string);
                            if (!isNaN(d.getTime())) {
                                cell.value = d;
                                cell.numFmt = "dd-mm-yyyy hh:mm";
                            }
                        } catch {
                            // keep as string if parsing fails
                        }
                    }
                });
            });

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            saveAs(blob, `success_accounts_${format(new Date(), "dd-MM-yyyy")}.xlsx`);
            toast.success(`Excel exported successfully! Total records: ${rows.length}`);

        } catch (error) {
            console.error("Error exporting to Excel:", error);
            toast.error("Error exporting to Excel. Please try again.");
        } finally {
            setIsExportingExcel(false);
        }
    };

    return (
        <Card className="h-full flex flex-col">
            <CardContent className="space-y-4 p-6 flex flex-col h-full">
                {/* Header Section */}
                <div className="space-y-4">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            aria-label="search-success-account"
                            autoComplete="off"
                            type="search"
                            placeholder="Search by CIF, Legal ID, Account Number..."
                            value={searchQuery}
                            onChange={handleSearchChange}
                            className="pl-10 w-full text-sm h-10"
                        />
                    </div>

                    {/* Filters Section */}
                    <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4 space-y-3">
                        <div className="flex items-center gap-2 mb-3">
                            <Filter className="h-4 w-4 text-blue-600" />
                            <h3 className="text-sm font-semibold text-gray-800">Date Range Filter</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                            {/* From Date */}
                            <div className="flex flex-col gap-2">
                                <Label className="text-xs font-medium text-gray-700 flex items-center gap-2">
                                    <Calendar className="h-3.5 w-3.5" />
                                    From Date
                                </Label>
                                <CustomDatePicker
                                    value={fromDate}
                                    onChange={(date) => setFromDate(date)}
                                    placeholder="From Date"
                                    className="h-9"
                                />
                            </div>

                            {/* To Date */}
                            <div className="flex flex-col gap-2">
                                <Label className="text-xs font-medium text-gray-700 flex items-center gap-2">
                                    <Calendar className="h-3.5 w-3.5" />
                                    To Date
                                </Label>
                                <CustomDatePicker
                                    value={toDate}
                                    onChange={(date) => setToDate(date)}
                                    placeholder="To Date"
                                    className="h-9"
                                />
                            </div>

                            {/* Reset Button */}
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleResetFilter}
                                    className="h-9 flex-1 flex items-center justify-center gap-2 border-blue-300 text-blue-700 hover:bg-blue-50"
                                >
                                    <RotateCcw className="h-3.5 w-3.5" />
                                    <span className="text-xs font-medium">Reset</span>
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons & Stats */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        {/* Export Button - Primary */}
                        <Button
                            onClick={exportToExcel}
                            disabled={isExportingExcel || (accounts?.countAll ?? 0) === 0}
                            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-semibold py-2 px-4 rounded-lg shadow-md transition-all h-10 flex items-center gap-2"
                        >
                            {isExportingExcel ? (
                                <>
                                    <div className="animate-spin">
                                        <FileSpreadsheet className="h-4 w-4" />
                                    </div>
                                    <span className="text-sm">Exporting...</span>
                                </>
                            ) : (
                                <>
                                    <FileSpreadsheet className="h-4 w-4" />
                                    <span className="text-sm">Export to Excel</span>
                                    <Download className="h-3.5 w-3.5 ml-1" />
                                </>
                            )}
                        </Button>

                        {/* Stats Card */}
                        <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 flex items-center gap-4">
                            <div className="text-center">
                                <p className="text-xs text-gray-600 font-medium">Total Records</p>
                                <p className="text-xl font-bold text-blue-600">{accounts?.countAll ?? 0}</p>
                            </div>
                            <div className="w-px h-8 bg-gray-300" />
                            <div className="text-center">
                                <p className="text-xs text-gray-600 font-medium">Showing</p>
                                <p className="text-xl font-bold text-gray-700">{accounts?.content?.length ?? 0}</p>
                            </div>
                        </div>
                    </div>
                </div>

                <Separator className="bg-gray-200" />

                {/* Table Section */}
                <div className="flex-1 flex flex-col min-h-0">
                    <div className="flex-1 rounded-md border border-gray-200 overflow-hidden flex flex-col bg-white">
                        <div className="flex-1 overflow-x-auto">
                            <DataTable
                                data={accounts?.content || []}
                                columns={createSuccessAccountExcelTableColumns({
                                    data: accounts,
                                    handlers: { handleViewAccountDetail },
                                })}
                                loading={isLoading}
                                emptyMessage="No success accounts found"
                                getRowKey={(account) => account.id}
                            />
                        </div>
                    </div>
                </div>

            </CardContent>
        </Card>
    );
}

export default function SuccessAccountPage() {
    return (
        <Suspense fallback={<Loading />}>
            <SuccessAccountExcelPageContent />
        </Suspense>
    );
}