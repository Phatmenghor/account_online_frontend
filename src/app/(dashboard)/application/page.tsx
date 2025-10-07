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
  AllAppModel,
  ApplicationModel,
} from "@/models/application/app.response";
import { CreateAppForm, UpdateAppForm } from "@/models/application/app.schema";
import {
  createAppService,
  deleteAppService,
  getAllAppExcelService,
  getAllAppService,
  updateAppService,
} from "@/services/dashboard/application/app.service";
import ModalApplication from "@/components/shared/modal/application-modal";
import Loading from "@/components/shared/common/loading";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createApplicationTableColumns } from "@/components/shared/table/applicatioin-content";
import ApplicationViewModal from "@/components/shared/modal/application-detail-modal";
import { format } from "date-fns";
import { ModalMode } from "@/constants/AppResource/display-list/enum/mode";
import { STATUS_APPLICATION } from "@/constants/AppResource/filter/application";

function ApplicationPageContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [applicationStatus, setApplicationStatus] = useState<string>("all");
  const [applications, setApplications] = useState<AllAppModel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExportingToExcel, setIsExportingToExcel] = useState(false);
  const [selectedApplication, setSelectedApplication] =
    useState<ApplicationModel | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [mode, setMode] = useState<ModalMode>(ModalMode.CREATE_MODE);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isApplicationDetailOpen, setIsApplicationDetailOpen] = useState(false);

  const t = useTranslations();

  const searchParams = useSearchParams();

  // Debounced search query - Optimized api performance when search
  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  const { currentPage, updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.DASHBOARD.APPLICATION,
    defaultPageSize: 10,
  });

  useEffect(() => {
    const pageParam = searchParams.get("pageNo");
    if (!pageParam) {
      updateUrlWithPage(1, true);
    }
  }, [searchParams, updateUrlWithPage]);

  const loadApplications = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getAllAppService({
        search: debouncedSearchQuery,
        pageNo: currentPage,
        pageSize: 15,
        applicationStatus:
          applicationStatus !== "all" ? applicationStatus : undefined,
      });
      setApplications(response);
    } catch (error: any) {
      console.log("Failed to fetch applications: ", error);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchQuery, currentPage, applicationStatus]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications, debouncedSearchQuery, applicationStatus]);

  // Simplified search change handler - just updates the state, debouncing handles the rest
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleStatusChange = (value: string) => {
    setApplicationStatus(value);
    // Reset to first page when filter changes
    updateUrlWithPage(1, true);
  };

  const handleSaveApplication = async (
    formData: CreateAppForm | UpdateAppForm
  ) => {
    setIsSubmitting(true);
    try {
      if (mode === ModalMode.CREATE_MODE) {
        const createData = formData as CreateAppForm;
        const response = await createAppService({
          projectName: createData.projectName,
          memberInvolved: createData.memberInvolved,
          remark: createData.remark || "",
          department: createData.department,
          year: createData.year,
          urlLink: createData.urlLink,
          applicationStatus: createData.applicationStatus || "",
        });

        // Optimistic update
        setApplications((prev: any) =>
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
            message: "Application created successfully",
            description: "New Application",
          });
        });
      } else if (mode === ModalMode.UPDATE_MODE) {
        const updateAppForm = formData as UpdateAppForm;
        if (!updateAppForm.id) {
          console.error("Missing application id in update form");
          return;
        }
        const response = await updateAppService(updateAppForm.id, {
          projectName: updateAppForm.projectName,
          memberInvolved: updateAppForm.memberInvolved || "",
          remark: updateAppForm.remark || "",
          department: updateAppForm.department,
          year: updateAppForm.year,
          urlLink: updateAppForm.urlLink,
          applicationStatus: updateAppForm.applicationStatus || "",
        });

        setApplications((prev) =>
          prev
            ? {
                ...prev,
                content: prev.content.map((app) =>
                  app.id === updateAppForm.id ? response : app
                ),
              }
            : prev
        );

        startTransition(() => {
          AppToast({
            type: "success",
            message: "Application updated successfully",
            description: "Updated Application",
          });
        });
      }
      setIsModalOpen(false);
      setSelectedApplication(null);
      loadApplications();
    } catch (err: any) {
      toast.error(err?.errorMessage || "Failed to save application");
      AppToast({
        type: "error",
        message: "Failed to save application",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteApplication = async () => {
    if (!selectedApplication) return;
    setIsSubmitting(true);

    try {
      const response = await deleteAppService(selectedApplication.id);

      if (response) {
        setApplications((prev) =>
          prev
            ? {
                ...prev,
                content: prev.content.filter(
                  (app) => app.id !== selectedApplication.id
                ),
                totalElements: prev.totalElements - 1,
              }
            : prev
        );

        AppToast({
          type: "success",
          message: "Application deleted successfully",
        });
      }

      setIsDeleteDialogOpen(false);
      setSelectedApplication(null);
    } catch (err: any) {
      AppToast({
        type: "error",
        message: "Failed to delete application",
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
        search: debouncedSearchQuery, // Large number to get all records
        applicationStatus:
          applicationStatus !== "all" ? applicationStatus : undefined,
      };

      // Fetch all data for export using the Excel service
      const allDataResponse = await getAllAppExcelService(exportFilter);

      console.log("Export response:", allDataResponse);

      // The API returns data in response.data array
      const applicationData = allDataResponse?.data || [];
      const totalCount = applicationData.length;

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

      if (!Array.isArray(applicationData) || applicationData.length === 0) {
        toast.warning("No data available to export.");
        setIsSubmitting(false);
        return;
      }

      // Create workbook
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Applications");

      // Define columns
      const columns: string[] = [
        "No",
        "Project Name",
        "Department",
        "Year",
        "Application Status",
        "URL Link",
        "Members Involved",
        "Remark",
        "Created Date",
        "Updated Date",
      ];

      // Add title row at Row 1
      worksheet.mergeCells(1, 1, 1, columns.length);
      const titleCell = worksheet.getCell("A1");
      titleCell.value = "Application Management Report";
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
      totalCell.value = `Total Applications: ${totalCount}`;
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
        cell.alignment = { vertical: "middle", horizontal: "left" };
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
        const columnWidths = [5, 25, 15, 10, 20, 30, 25, 30, 18, 18];
        worksheet.getColumn(idx + 1).width = columnWidths[idx];
      });

      // Add data rows starting at row 5
      applicationData.forEach((item: ApplicationModel, i: number) => {
        const row = worksheet.addRow([
          i + 1,
          item.projectName || "---",
          item.department || "---",
          item.year || "---",
          item.applicationStatus || "---",
          item.urlLink || "---",
          item.memberInvolved || "---",
          item.remark || "---",
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

        // Color the "Application Status" column (5th column)
        const statusCell = row.getCell(5);
        const statusValue = item.applicationStatus?.toLowerCase();

        if (statusValue === "inactive" || statusValue === "suspended") {
          statusCell.font = { color: { argb: "FFFF0000" }, bold: true };
        } else if (statusValue === "active") {
          statusCell.font = { color: { argb: "FF00AA00" }, bold: true };
        }
      });

      // Format date columns (9th and 10th columns)
      [9, 10].forEach((colIndex) => {
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

      const fileName = `applications_${format(new Date(), "dd-MM-yyyy")}.xlsx`;
      saveAs(blob, fileName);

      const exportedCount = applicationData.length;
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

  const handleEditApplication = (app: ApplicationModel) => {
    setSelectedApplication(app);
    setMode(ModalMode.UPDATE_MODE);
    setIsModalOpen(true);
  };

  const handleAddApplication = () => {
    setSelectedApplication(null);
    setMode(ModalMode.CREATE_MODE);
    setIsModalOpen(true);
  };

  const handleViewApplicationDetail = (app: ApplicationModel) => {
    setSelectedApplication(app);
    setIsApplicationDetailOpen(true);
  };

  const handleDeleteApplication = (app: ApplicationModel) => {
    setSelectedApplication(app);
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
                aria-label="search-application"
                autoComplete="search-application"
                type="search"
                placeholder={t("application.search-application")}
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-8 w-full min-w-[200px] text-xs md:min-w-[300px] h-9"
                disabled={isSubmitting}
              />
            </div>

            {/* Status Filter Dropdown */}
            <Select
              value={applicationStatus}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {STATUS_APPLICATION.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-4">
            <div>
              <Button
                // onClick={() => handleExportToExcel(applications?.content ?? [])}
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
            <Button className="h-10" onClick={handleAddApplication}>
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
                data={applications?.content || []}
                columns={createApplicationTableColumns({
                  data: applications,
                  handlers: {
                    handleEditApplication,
                    handleViewApplicationDetail,
                    handleDeleteApplication,
                  },
                })}
                emptyMessage="No application found"
                getRowKey={(application) => application.id}
              />

              {/* Pagination positioned to the right and outside the scrollable area */}
              <div className="border-t bg-background p-2 flex justify-end">
                <CustomPagination
                  currentPage={currentPage}
                  totalPages={applications?.totalPages || 1}
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
            setSelectedApplication(null);
          }}
          onDelete={confirmDeleteApplication}
          title="Delete Application"
          description={`Are you sure you want to delete the application`}
          itemName={selectedApplication?.projectName || "N/A"}
          isSubmitting={isSubmitting}
        />

        <ApplicationViewModal
          isOpen={isApplicationDetailOpen}
          onClose={() => {
            setIsApplicationDetailOpen(false);
            setSelectedApplication(null);
          }}
          applicationId={selectedApplication?.id ?? 0}
        />

        <ModalApplication
          isOpen={isModalOpen}
          mode={mode}
          onClose={() => {
            setSelectedApplication(null);
            setIsModalOpen(false);
          }}
          onSave={handleSaveApplication}
          applicationId={selectedApplication?.id ?? 0}
          isSubmitting={isSubmitting}
        />
      </CardContent>
    </Card>
  );
}

export default function ApplicationPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ApplicationPageContent />
    </Suspense>
  );
}
