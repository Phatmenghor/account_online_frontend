"use client";

import ExcelJS from "exceljs";
import { saveAs } from "file-saver";
import { Suspense } from "react";
import { DeleteConfirmationDialog } from "@/components/shared/dialog/dialog-delete";
import { CustomPagination } from "@/components/shared/pagination/custom-pagination";
import { DataTable } from "@/components/shared/table/data-table";
import { AppToast } from "@/components/shared/toast/app-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ROUTES } from "@/constants/AppRoutes/routes";
import { usePagination } from "@/hooks/use-pagination";
import { useDebounce } from "@/utils/debounce/debounce";
import { Download, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { startTransition, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { AppIcons } from "@/constants/AppResource/icons/app-icons";
import {
  ExcelColumn,
  ExcelExporter,
  ExcelSheet,
} from "@/utils/export-file/excel";
import {
  AllTraineeModel,
  TraineeModel,
} from "@/models/trainee/trainee.response";
import {
  CreateTraineeForm,
  UpdateTraineeForm,
} from "@/models/trainee/trainee.schema";
import {
  createTraineeService,
  deleteTraineeService,
  getAllExcelTraineeService,
  getTraineeService,
  updateTraineeService,
} from "@/services/dashboard/trainee/trainee.service";
import { ModalMode } from "@/constants/AppResource/display-list/status/status";
import Loading from "@/components/shared/common/loading";
import { createTraineeTableColumns } from "@/components/shared/table/trainee-content";
import TraineeViewModal from "@/components/shared/modal/trainee-detail-modal";
import ModalTrainee from "@/components/shared/modal/trainee-modal";
import { format } from "date-fns";

function TraineePageContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [trainees, setTrainees] = useState<AllTraineeModel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExportingToExcel, setIsExportingToExcel] = useState(false);
  const [selectedTrainee, setSelectedTrainee] = useState<TraineeModel | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [mode, setMode] = useState<ModalMode>(ModalMode.CREATE_MODE);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTraineeDetailOpen, setIsTraineeDetailOpen] = useState(false);

  const t = useTranslations();

  const searchParams = useSearchParams();

  // Debounced search query - Optimized api performance when search
  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  const { currentPage, updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.DASHBOARD.TRAINEE,
    defaultPageSize: 10,
  });

  useEffect(() => {
    const pageParam = searchParams.get("pageNo");
    if (!pageParam) {
      updateUrlWithPage(1, true);
    }
  }, [searchParams, updateUrlWithPage]);

  const loadTrainees = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getTraineeService({
        search: debouncedSearchQuery,
        pageNo: currentPage,
        pageSize: 100,
      });
      setTrainees(response);
    } catch (error: any) {
      console.log("Failed to fetch trainees: ", error);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchQuery, currentPage]);

  useEffect(() => {
    loadTrainees();
  }, [loadTrainees, debouncedSearchQuery]);

  // Simplified search change handler - just updates the state, debouncing handles the rest
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSaveTrainee = async (
    formData: CreateTraineeForm | UpdateTraineeForm
  ) => {
    setIsSubmitting(true);
    try {
      if (mode === ModalMode.CREATE_MODE) {
        const createData = formData as CreateTraineeForm;
        const response = await createTraineeService({
          reportRemark: createData.reportRemark,
          challenge: createData.challenge,
          recommend: createData.recommend,
        });

        // Optimistic update
        setTrainees((prev: any) =>
          prev
            ? {
              ...prev,
              content: [response, ...prev.content],
              totalElements: prev.totalElements + 1,
            }
            : {
              content: [response],
              pageNo: 1,
              pageSize: 10,
              totalElements: 1,
              totalPages: 1,
              last: true,
            }
        );

        startTransition(() => {
          AppToast({
            type: "success",
            message: "Trainee report created successfully",
            description: "New Trainee Report",
          });
        });
      } else if (mode === ModalMode.UPDATE_MODE) {
        const updateTraineeForm = formData as UpdateTraineeForm;
        if (!updateTraineeForm.id) {
          console.error("Missing trainee id in update form");
          return;
        }
        const response = await updateTraineeService(updateTraineeForm.id, {
          reportRemark: updateTraineeForm.reportRemark,
          challenge: updateTraineeForm.challenge || "",
          recommend: updateTraineeForm.recommend || "",
        });

        setTrainees((prev) =>
          prev
            ? {
              ...prev,
              content: prev.content.map((trainee) =>
                trainee.id === updateTraineeForm.id ? response : trainee
              ),
            }
            : prev
        );

        startTransition(() => {
          AppToast({
            type: "success",
            message: "Trainee report updated successfully",
            description: "Updated Trainee Report",
          });
        });
      }
      setIsModalOpen(false);
      setSelectedTrainee(null);
      loadTrainees();
    } catch (err: any) {
      toast.error(err?.errorMessage || "Failed to save trainee report");
      AppToast({
        type: "error",
        message: "Failed to save trainee report",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteTrainee = async () => {
    if (!selectedTrainee) return;
    setIsSubmitting(true);

    try {
      const response = await deleteTraineeService(selectedTrainee.id);

      if (response) {
        setTrainees((prev) =>
          prev
            ? {
              ...prev,
              content: prev.content.filter(
                (trainee) => trainee.id !== selectedTrainee.id
              ),
              totalElements: prev.totalElements - 1,
            }
            : prev
        );

        AppToast({
          type: "success",
          message: "Trainee report deleted successfully",
        });
      }

      setIsDeleteDialogOpen(false);
      setSelectedTrainee(null);
    } catch (err: any) {
      AppToast({
        type: "error",
        message: "Failed to delete trainee report",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

const handleExportToExcel = async () => {
  setIsSubmitting(true);

  try {
    setIsExportingToExcel(true);

    // Create filter object for API call
    const exportFilter = {
      search: debouncedSearchQuery,
    };

    // Fetch all data for export using the Excel service
    const allDataResponse = await getAllExcelTraineeService(exportFilter);

    // The API returns data in response.data array
    const traineeData = allDataResponse?.data || [];
    const totalCount = traineeData.length;

    if (totalCount === 0) {
      toast.warning("No data available to export.");
      setIsSubmitting(false);
      return;
    }

    // Check Excel limit
    const EXCEL_LIMIT = 10000; // Adjust based on your Constants
    if (totalCount > EXCEL_LIMIT) {
      toast.info(
        `Only ${EXCEL_LIMIT} items can be exported. Too many records. Please filter the data.`
      );
      setIsSubmitting(false);
      return;
    }

    if (!Array.isArray(traineeData) || traineeData.length === 0) {
      toast.warning("No data available to export.");
      setIsSubmitting(false);
      return;
    }

    // Create workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Trainee Reports");

    // Define columns
    const columns: string[] = [
      "No",
      "Report Remark",
      "Challenge",
      "Recommend",
      "Created Date",
      "Updated Date",
    ];

    // Add title row at Row 1
    worksheet.mergeCells(1, 1, 1, columns.length);
    const titleCell = worksheet.getCell("A1");
    titleCell.value = "Trainee Report Management";
    titleCell.font = { size: 16, bold: true, color: { argb: "FFFFFFFF" } };
    titleCell.alignment = { vertical: "middle", horizontal: "center" };
    titleCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF1F4E78" },
    };

    // Add total count row at Row 2
    worksheet.mergeCells(2, 1, 2, columns.length);
    const totalCell = worksheet.getCell("A2");
    totalCell.value = `Total Trainee Reports: ${totalCount}`;
    totalCell.font = { size: 12, bold: true, color: { argb: "FF000000" } };
    totalCell.alignment = { vertical: "middle", horizontal: "center" };
    totalCell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FFDDDDDD" },
    };

    // Add header row at Row 4
    const headerRow = worksheet.getRow(4);
    columns.forEach((text: string, idx: number) => {
      const cell = headerRow.getCell(idx + 1);
      cell.value = text;
      cell.font = { bold: true, color: { argb: "FFFFFFFF" } };
      cell.alignment = { vertical: "middle", horizontal: "center" };
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF007ACC" },
      };
      cell.border = {
        top: { style: "thin" },
        bottom: { style: "thin" },
        left: { style: "thin" },
        right: { style: "thin" },
      };

      // Adjust column widths
      const columnWidths = [5, 40, 40, 40, 18, 18];
      worksheet.getColumn(idx + 1).width = columnWidths[idx];
    });

    // Add data rows starting at row 5
    traineeData.forEach((item: TraineeModel, i: number) => {
      const row = worksheet.addRow([
        i + 1,
        item.reportRemark || "---",
        item.challenge || "---",
        item.recommend || "---",
        item.createdAt || "---",
        item.updatedAt || "---",
      ]);

      // Zebra striping
      row.eachCell((cell) => {
        cell.fill = {
          type: "pattern",
          pattern: "solid",
          fgColor: { argb: i % 2 === 0 ? "FFF3F3F3" : "FFFFFFFF" },
        };
        cell.border = {
          top: { style: "thin" },
          bottom: { style: "thin" },
          left: { style: "thin" },
          right: { style: "thin" },
        };
        cell.alignment = { vertical: "middle", horizontal: "left" };
      });

      // Center align the No column (1st column)
      row.getCell(1).alignment = { vertical: "middle", horizontal: "center" };
    });

    // Format date columns (5th and 6th columns)
    [5, 6].forEach((colIndex) => {
      worksheet.getColumn(colIndex).eachCell((cell, rowNumber: number) => {
        if (rowNumber > 4 && cell.value) {
          try {
            const dateValue = new Date(cell.value as string);
            if (!isNaN(dateValue.getTime())) {
              cell.value = dateValue;
              cell.numFmt = "dd-mm-yyyy";
            }
          } catch (error) {
            console.warn("Date parsing failed for:", cell.value);
          }
        }
      });
    });

    // Generate and save file
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });

    const fileName = `trainee_reports_${format(new Date(), "dd-MM-yyyy")}.xlsx`;
    saveAs(blob, fileName);

    const exportedCount = traineeData.length;
    toast.success(
      `Excel file exported successfully! Total records: ${exportedCount}`
    );
  } catch (error: unknown) {
    console.error("Error exporting to Excel:", error);
    toast.error("Error exporting to Excel. Please try again.");
  } finally {
    setIsSubmitting(false);
    setIsExportingToExcel(false);
  }
};

  const handleEditTrainee = (trainee: TraineeModel) => {
    setSelectedTrainee(trainee);
    setMode(ModalMode.UPDATE_MODE);
    setIsModalOpen(true);
  };

  const handleAddTrainee = () => {
    setSelectedTrainee(null);
    setMode(ModalMode.CREATE_MODE);
    setIsModalOpen(true);
  };

  const handleViewTraineeDetail = (trainee: TraineeModel) => {
    setSelectedTrainee(trainee);
    setIsTraineeDetailOpen(true);
  };

  const handleDeleteTrainee = (trainee: TraineeModel) => {
    setSelectedTrainee(trainee);
    setIsDeleteDialogOpen(true);
  };

  return (
    <Card>
      <CardContent className="space-y-6 p-6">
        <div className="flex justify-between">
          <div className="flex flex-wrap items-center justify-start gap-4 w-full">
            <div className="relative w-full md:w-[350px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                aria-label="search-trainee"
                autoComplete="search-trainee"
                type="search"
                placeholder={t("trainee.search-trainee")}
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-8 w-full min-w-[200px] text-xs md:min-w-[300px] h-9"
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="flex gap-4">
            <div>
              <Button
                onClick={handleExportToExcel}
                size="lg"
                variant="outline"
                className="gap-2 text-sm sm:text-base h-10 hover:bg-gray-200 duration-400 lg:text-lg px-3 sm:px-4 lg:px-6"
                disabled={isExportingToExcel}
              >
                <img
                  src={AppIcons.FILE.Excel}
                  alt="Excel Icon"
                  className="h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground flex-shrink-0"
                />
                <span className="text-sm gap-2">
                  {isExportingToExcel ? <Loading /> : "Export"}
                </span>
                <Download className="w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0" />
              </Button>
            </div>
            <Button className="h-10" onClick={handleAddTrainee}>
              {t("common.new")}
            </Button>
          </div>
        </div>

        <div className="w-full">
          <Separator className="bg-gray-300" />
        </div>
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 rounded-md border overflow-hidden flex flex-col">
            <div className="flex-1 overflow-x-auto">
              <DataTable
                data={trainees?.content || []}
                columns={createTraineeTableColumns({
                  data: trainees,
                  handlers: {
                    handleEditTrainee,
                    handleViewTraineeDetail,
                    handleDeleteTrainee,
                  },
                })}
                emptyMessage="No trainee report found"
                getRowKey={(trainee) => trainee.id}
              />

              {/* Pagination positioned to the right and outside the scrollable area */}
              <div className="border-t bg-background p-2 flex justify-end">
                <CustomPagination
                  currentPage={currentPage}
                  totalPages={trainees?.totalPages || 1}
                  onPageChange={handlePageChange}
                  size="md"
                />
              </div>
            </div>
          </div>
        </div>

        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setSelectedTrainee(null);
          }}
          onDelete={confirmDeleteTrainee}
          title="Delete Trainee Report"
          description={`Are you sure you want to delete this trainee report`}
          itemName={`Report #${selectedTrainee?.id}` || "N/A"}
          isSubmitting={isSubmitting}
        />

        <TraineeViewModal
          isOpen={isTraineeDetailOpen}
          onClose={() => {
            setIsTraineeDetailOpen(false);
            setSelectedTrainee(null);
          }}
          traineeId={selectedTrainee?.id ?? 0}
        />

        <ModalTrainee
          isOpen={isModalOpen}
          mode={mode}
          onClose={() => {
            setSelectedTrainee(null);
            setIsModalOpen(false);
          }}
          onSave={handleSaveTrainee}
          traineeId={selectedTrainee?.id ?? 0}
          isSubmitting={isSubmitting}
        />
      </CardContent>
    </Card>
  );
}

export default function TraineePage() {
  return (
    <Suspense fallback={<Loading />}>
      <TraineePageContent />
    </Suspense>
  );
}
