"use client";

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
import ProjectViewModal from "@/components/shared/modal/project-detail-modal";
import { ModalMode } from "@/constants/AppResource/display-list/status/status";
import Loading from "@/components/shared/common/loading";
import {
  AllAttendanceModel,
  AttendanceModel,
} from "@/models/attendance/attendances.response";
import {
  createAttendanceService,
  deleteAttendanceService,
  getAllListingAttendanceService,
  getAttendanceService,
  updateAttendanceService,
} from "@/services/dashboard/attendance/attendance.service";
import { createAttendanceTableColumns } from "@/components/shared/table/attendance-content";
import {
  AttendanceCreateForm,
  AttendanceUpdateForm,
} from "@/models/attendance/attendance.schema";
import ModalAttendance from "@/components/shared/modal/attendance-modal";
import { AttendanceDetailModal } from "@/components/shared/modal/attendance-detail-modal";
import {
  ExcelColumn,
  ExcelExporter,
  ExcelSheet,
} from "@/utils/export-file/excel";
import LoadingSpinner from "@/components/shared/common/excel-loading";

function AttendancePageContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [attendances, setAttendances] = useState<AllAttendanceModel | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExportingToExcel, setIsExportingToExcel] = useState(false);
  const [selectedAttendance, setSelectedAttendance] =
    useState<AttendanceModel | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [mode, setMode] = useState<ModalMode>(ModalMode.CREATE_MODE);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAttendanceDetailOpen, setIsAttendanceDetailOpen] = useState(false);

  const t = useTranslations();

  const searchParams = useSearchParams();

  // Debounced search query - Optimized api performance when search
  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  const { currentPage, updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.DASHBOARD.ATTENDANCE.HISTORY,
    defaultPageSize: 10,
  });

  useEffect(() => {
    const pageParam = searchParams.get("pageNo");
    if (!pageParam) {
      updateUrlWithPage(1, true);
    }
  }, [searchParams, updateUrlWithPage]);

  const loadAttendances = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getAttendanceService({
        search: debouncedSearchQuery,
        pageNo: currentPage,
        pageSize: 10,
      });
      setAttendances(response);
    } catch (error: any) {
      console.log("Failed to fetch attendance: ", error);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchQuery, currentPage]);

  useEffect(() => {
    loadAttendances();
  }, [loadAttendances, debouncedSearchQuery]);

  // Simplified search change handler - just updates the state, debouncing handles the rest
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleSaveAttendance = async (
    formData: AttendanceCreateForm | AttendanceUpdateForm
  ) => {
    setIsSubmitting(true);
    try {
      if (mode === ModalMode.CREATE_MODE) {
        const createData = formData as AttendanceCreateForm;
        const response = await createAttendanceService(createData);

        // Optimistic update
        setAttendances((prev: any) =>
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
                hasNext: false,
                hasPrevious: false,
                first: true,
                last: true,
              }
        );

        startTransition(() => {
          AppToast({
            type: "success",
            message: "Attendance created successfully",
            description: "New Attendance",
          });
        });
      } else if (mode === ModalMode.UPDATE_MODE) {
        const attendanceFormData = formData as AttendanceUpdateForm;
        if (!attendanceFormData.id) {
          console.error("Missing attendances id in update form");
          return;
        }
        const response = await updateAttendanceService(attendanceFormData.id, {
          leaveRequest: attendanceFormData.leaveRequest,
          endDate: attendanceFormData.endDate,
          reason: attendanceFormData.reason,
          startDate: attendanceFormData.startDate,
          type: attendanceFormData.type,
        });

        setAttendances((prev) =>
          prev
            ? {
                ...prev,
                content: prev.content.map((proj) =>
                  proj.id === attendanceFormData.id ? response : proj
                ),
              }
            : prev
        );

        startTransition(() => {
          AppToast({
            type: "success",
            message: "Attendance updated successfully",
            description: "Updated Project",
          });
        });
      }
      setIsModalOpen(false);
      setSelectedAttendance(null);
      loadAttendances();
    } catch (err: any) {
      toast.error(err?.errorMessage || "Failed to save attendance");
      AppToast({
        type: "error",
        message: "Failed to save attendance",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteAttendance = async () => {
    if (!selectedAttendance) return;
    setIsSubmitting(true);

    try {
      const response = await deleteAttendanceService(selectedAttendance.id);

      if (response) {
        setAttendances((prev) =>
          prev
            ? {
                ...prev,
                content: prev.content.filter(
                  (proj) => proj.id !== selectedAttendance.id
                ),
                totalElements: prev.totalElements - 1,
              }
            : prev
        );

        AppToast({
          type: "success",
          message: "Project deleted successfully",
        });
      }

      setIsDeleteDialogOpen(false);
      setSelectedAttendance(null);
    } catch (err: any) {
      AppToast({
        type: "error",
        message: "Failed to delete project",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportToExcel = async () => {
    setIsExportingToExcel(true);
    try {
      // Define columns based on AttendanceModel
      const columns: ExcelColumn[] = [
        { header: "ID", key: "id", width: 8, type: "number" },
        { header: "User ID", key: "userId", width: 10, type: "number" },
        { header: "ID Card", key: "userIdCard", width: 15, type: "text" },
        { header: "Full Name", key: "userFullName", width: 25, type: "text" },
        { header: "Email", key: "userEmail", width: 30, type: "text" },
        { header: "Position", key: "userPosition", width: 20, type: "text" },
        { header: "Type", key: "type", width: 15, type: "text" },
        { header: "Status", key: "status", width: 12, type: "text" },
        {
          header: "Start Date",
          key: "startDate",
          width: 18,
          type: "date",
          format: "mm/dd/yyyy",
        },
        {
          header: "End Date",
          key: "endDate",
          width: 18,
          type: "date",
          format: "mm/dd/yyyy",
        },
        {
          header: "Leave Request",
          key: "leaveRequest",
          width: 20,
          type: "text",
        },
        { header: "Total Days", key: "totalDays", width: 12, type: "number" },
        { header: "Reason", key: "reason", width: 30, type: "text" },
        {
          header: "Approved By (ID Card)",
          key: "approvedByIdCard",
          width: 20,
          type: "text",
        },
        {
          header: "Approved By (Name)",
          key: "approvedByFullName",
          width: 25,
          type: "text",
        },
        {
          header: "Approved At",
          key: "approvedAt",
          width: 18,
          type: "date",
          format: "mm/dd/yyyy",
        },
        {
          header: "Approval Notes",
          key: "approvalNotes",
          width: 30,
          type: "text",
        },
        {
          header: "Created Date",
          key: "createdAt",
          width: 18,
          type: "date",
          format: "mm/dd/yyyy",
        },
        {
          header: "Updated Date",
          key: "updatedAt",
          width: 18,
          type: "date",
          format: "mm/dd/yyyy",
        },
      ];

      // Create Excel exporter
      const exporter = new ExcelExporter({
        filename: "attendance.xlsx",
        title: "Attendance Report",
        author: "HR Department",
        useAlternateRows: true,
        protection: {
          password: "88889999",
          deleteRows: false,
          selectLockedCells: true,
          selectUnlockedCells: true,
        },
      });

      const response = await getAllListingAttendanceService({});

      // Configure sheet
      const sheetConfig: ExcelSheet = {
        name: "Attendance",
        data: response ?? [],
        columns,
        autoFilter: true,
        freezeRows: 1,
        sortBy: [{ key: "id", order: "asc" }],
      };

      exporter.addSheet(sheetConfig);
      await exporter.export();

      AppToast({
        type: "success",
        message: "Successfully exported attendance to Excel",
      });
    } catch (error: any) {
      AppToast({ type: "error", message: "Failed to export attendance" });
      console.error("Error exporting attendance to Excel:", error);
    } finally {
      setIsExportingToExcel(false);
    }
  };

  const handleEditAttendance = (proj: AttendanceModel) => {
    setSelectedAttendance(proj);
    setMode(ModalMode.UPDATE_MODE);
    setIsModalOpen(true);
  };

  const handleAddAttendance = () => {
    setSelectedAttendance(null);
    setMode(ModalMode.CREATE_MODE);
    setIsModalOpen(true);
  };

  const handleViewAttendanceDetail = (proj: AttendanceModel) => {
    setSelectedAttendance(proj);
    setIsAttendanceDetailOpen(true);
  };

  const handleDeleteAttendance = (proj: AttendanceModel) => {
    setSelectedAttendance(proj);
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
                aria-label="search-attendance"
                autoComplete="search-attendance"
                type="search"
                placeholder={t("attendance.search-attendance")}
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
                onClick={() => handleExportToExcel()}
                size="lg"
                variant="outline"
                className="gap-2 text-sm sm:text-base h-10 hover:bg-gray-200 duration-400 lg:text-lg px-3 sm:px-4 lg:px-6"
                disabled={isExportingToExcel}
              >
                {isExportingToExcel ? (
                  <>
                    <LoadingSpinner size={20} />
                    <span className="text-sm lg:text-base">Exporting…</span>
                  </>
                ) : (
                  <>
                    <img
                      src={AppIcons.FILE.Excel}
                      alt="Excel Icon"
                      className="h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground flex-shrink-0"
                    />
                    <span className="text-sm lg:text-base">Export</span>
                    <Download className="w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0" />
                  </>
                )}
              </Button>
            </div>

            <Button className="h-10" onClick={handleAddAttendance}>
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
                data={attendances?.content || []}
                columns={createAttendanceTableColumns({
                  data: attendances,
                  handlers: {
                    handleEditAttendance,
                    handleViewAttendanceDetail,
                    handleDeleteAttendance,
                  },
                })}
                loading={isLoading}
                emptyMessage="No attendance found"
                getRowKey={(attendance) => attendance.id}
              />

              {/* Pagination positioned to the right and outside the scrollable area */}
              <div className="border-t bg-background p-2 flex justify-end">
                <CustomPagination
                  currentPage={currentPage}
                  totalPages={attendances?.totalPages || 1}
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
            setSelectedAttendance(null);
          }}
          onDelete={confirmDeleteAttendance}
          title="Delete Project"
          description={`Are you sure you want to delete the attendance`}
          itemName={selectedAttendance?.userFullName || "N/A"}
          isSubmitting={isSubmitting}
        />

        <AttendanceDetailModal
          isOpen={isAttendanceDetailOpen}
          onClose={() => {
            setIsAttendanceDetailOpen(false);
            setSelectedAttendance(null);
          }}
          attendance={selectedAttendance}
        />

        <ModalAttendance
          isOpen={isModalOpen}
          mode={mode}
          onClose={() => {
            setSelectedAttendance(null);
            setIsModalOpen(false);
          }}
          onSave={handleSaveAttendance}
          attendanceId={selectedAttendance?.id ?? 0}
          isSubmitting={isSubmitting}
        />
      </CardContent>
    </Card>
  );
}

export default function AttendancePageContentPage() {
  return (
    <Suspense fallback={<Loading />}>
      <AttendancePageContent />
    </Suspense>
  );
}
