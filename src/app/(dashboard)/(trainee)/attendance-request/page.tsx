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
import { AppIcons } from "@/constants/AppResource/icons/app-icons";
import {
  ExcelColumn,
  ExcelExporter,
  ExcelSheet,
} from "@/utils/export-file/excel";
import { ModalMode } from "@/constants/AppResource/display-list/status/status";
import Loading from "@/components/shared/common/loading";
import {
  AllAttendanceModel,
  AttendanceModel,
} from "@/models/attendance/attendances.response";
import {
  createAttendanceService,
  deleteAttendanceService,
  getAttendanceService,
  updateAttendanceService,
} from "@/services/dashboard/attendance/attendance.service";
import {
  AttendanceCreateForm,
  AttendanceUpdateForm,
} from "@/models/attendance/attendance.schema";
import {
  AttendanceStatus,
  AttendanceType,
} from "@/constants/AppResource/filter/attendance";
import { createAttendanceApprovalTableColumns } from "@/components/shared/table/attendance-approval-content";
import ModalAttendanceApprovalOrCancel from "@/components/shared/modal/attendance-approval-modal";
import { AttendanceApprovalViewModal } from "@/components/shared/modal/attendance-approval-detail-modal";

function AttendanceRequestPageContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [attendances, setAttendances] = useState<AllAttendanceModel | null>(
    null
  );

  const [isApprovalModalOpen, setIsApprovalModalOpen] = useState(false);

  const [attendancesStatusFilter, setAttendancesStatusFilter] =
    useState<AttendanceStatus | null>(AttendanceStatus.PENDING);
  const [attendancesTypeFilter, setAttendancesTypeFilter] =
    useState<AttendanceType | null>(null);
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
    baseRoute: ROUTES.DASHBOARD.ATTENDANCE.REQUEST,
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
        status: attendancesStatusFilter || AttendanceStatus.PENDING,
        type:
          attendancesTypeFilter !== null ? attendancesTypeFilter : undefined,
      });
      setAttendances(response);
    } catch (error: any) {
      console.log("Failed to fetch attendance: ", error);
      AppToast({
        type: "error",
        message: error?.errorMessage || "Failed to fetch attendance requests",
      });
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

  const handleOpenApprovalModal = (attendance: AttendanceModel) => {
    setSelectedAttendance(attendance);
    setIsApprovalModalOpen(true);
  };

  const handleApprovalSuccess = () => {
    setSelectedAttendance(null);
    setIsApprovalModalOpen(false);
    loadAttendances();
    AppToast({
      type: "success",
      message: "Attendance updated successfully",
    });
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
            message: "Attendance request created successfully",
            description: "New Attendance Request",
          });
        });
      } else if (mode === ModalMode.UPDATE_MODE) {
        const updateAttendanceForm = formData as AttendanceUpdateForm;
        if (!updateAttendanceForm.id) {
          console.error("Missing attendance id in update form");
          return;
        }
        const response = await updateAttendanceService(
          updateAttendanceForm.id,
          {
            endDate: updateAttendanceForm.endDate,
            reason: updateAttendanceForm.reason,
            startDate: updateAttendanceForm.startDate,
            type: updateAttendanceForm.type,
            leaveRequest: updateAttendanceForm.leaveRequest,
          }
        );

        setAttendances((prev) =>
          prev
            ? {
                ...prev,
                content: prev.content.map((attendance) =>
                  attendance.id === updateAttendanceForm.id
                    ? response
                    : attendance
                ),
              }
            : prev
        );

        startTransition(() => {
          AppToast({
            type: "success",
            message: "Attendance request updated successfully",
            description: "Updated Attendance Request",
          });
        });
      }
      setIsModalOpen(false);
      setSelectedAttendance(null);
      loadAttendances();
    } catch (err: any) {
      AppToast({
        type: "error",
        message: err?.errorMessage || "Failed to save attendance request",
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
                  (attendance) => attendance.id !== selectedAttendance.id
                ),
                totalElements: prev.totalElements - 1,
              }
            : prev
        );

        AppToast({
          type: "success",
          message: "Attendance request deleted successfully",
        });
      }

      setIsDeleteDialogOpen(false);
      setSelectedAttendance(null);
    } catch (err: any) {
      AppToast({
        type: "error",
        message: err?.errorMessage || "Failed to delete attendance request",
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
        { header: "User ID Card", key: "userIdCard", width: 15, type: "text" },
        { header: "Full Name", key: "userFullName", width: 25, type: "text" },
        { header: "Email", key: "userEmail", width: 30, type: "text" },
        { header: "Position", key: "userPosition", width: 20, type: "text" },
        { header: "Type", key: "type", width: 15, type: "text" },
        { header: "Status", key: "status", width: 12, type: "text" },
        {
          header: "Start Date",
          key: "startDate",
          width: 15,
          type: "date",
          format: "mm/dd/yyyy",
        },
        {
          header: "End Date",
          key: "endDate",
          width: 15,
          type: "date",
          format: "mm/dd/yyyy",
        },
        { header: "Total Days", key: "totalDays", width: 12, type: "number" },
        { header: "Reason", key: "reason", width: 35, type: "text" },
        {
          header: "Approved By ID",
          key: "approvedByIdCard",
          width: 15,
          type: "text",
        },
        {
          header: "Approved By",
          key: "approvedByFullName",
          width: 25,
          type: "text",
        },
        {
          header: "Approved At",
          key: "approvedAt",
          width: 18,
          type: "date",
          format: "mm/dd/yyyy hh:mm",
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
          format: "mm/dd/yyyy hh:mm",
        },
        {
          header: "Updated Date",
          key: "updatedAt",
          width: 18,
          type: "date",
          format: "mm/dd/yyyy hh:mm",
        },
      ];

      // Create Excel exporter
      const exporter = new ExcelExporter({
        filename: "attendance_requests.xlsx",
        title: "Attendance Request Report",
        author: "HR Department",
        useAlternateRows: true,
        protection: {
          password: "88889999",
          deleteRows: false,
          selectLockedCells: true,
          selectUnlockedCells: true,
        },
      });

      // Configure sheet
      const sheetConfig: ExcelSheet = {
        name: "Attendance Requests",
        data: attendances?.content ?? [],
        columns,
        autoFilter: true,
        freezeRows: 1,
        sortBy: [{ key: "id", order: "desc" }],
      };

      exporter.addSheet(sheetConfig);
      await exporter.export();

      AppToast({ type: "success", message: "Successfully exported to Excel" });
    } catch (error: any) {
      AppToast({ type: "error", message: "Failed to export to Excel" });
      console.error("Error exporting to Excel:", error);
    } finally {
      setIsExportingToExcel(false);
    }
  };

  const handleEditAttendance = (attendance: AttendanceModel) => {
    setSelectedAttendance(attendance);
    setMode(ModalMode.UPDATE_MODE);
    setIsModalOpen(true);
  };

  const handleAddAttendance = () => {
    setSelectedAttendance(null);
    setMode(ModalMode.CREATE_MODE);
    setIsModalOpen(true);
  };

  const handleViewAttendanceDetail = (attendance: AttendanceModel) => {
    setSelectedAttendance(attendance);
    setIsAttendanceDetailOpen(true);
  };

  const handleDeleteAttendance = (attendance: AttendanceModel) => {
    setSelectedAttendance(attendance);
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
                placeholder={
                  t("attendance.search-attendance") ||
                  "Search attendance requests..."
                }
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
                disabled={isExportingToExcel || !attendances?.content?.length}
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
                columns={createAttendanceApprovalTableColumns({
                  data: attendances,
                  handlers: {
                    handleOpenApprovalModal,
                    handleViewAttendanceDetail,
                    handleDeleteAttendance,
                  },
                })}
                loading={isLoading}
                emptyMessage="No attendance requests found"
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
          title="Delete Attendance Request"
          description={`Are you sure you want to delete the attendance request for`}
          itemName={selectedAttendance?.userFullName || "N/A"}
          isSubmitting={isSubmitting}
        />

        <AttendanceApprovalViewModal
          attendance={selectedAttendance}
          isOpen={isAttendanceDetailOpen}
          onClose={() => {
            setIsAttendanceDetailOpen(false);
            setSelectedAttendance(null);
          }}
        />
        {/* New Approval / Cancel Modal */}
        {selectedAttendance && (
          <ModalAttendanceApprovalOrCancel
            isOpen={isApprovalModalOpen}
            attendanceId={selectedAttendance.id}
            onClose={() => {
              setSelectedAttendance(null);
              setIsApprovalModalOpen(false);
            }}
            onSuccess={handleApprovalSuccess}
          />
        )}
      </CardContent>
    </Card>
  );
}

export default function AttendanceRequestPage() {
  return (
    <Suspense fallback={<Loading />}>
      <AttendanceRequestPageContent />
    </Suspense>
  );
}
