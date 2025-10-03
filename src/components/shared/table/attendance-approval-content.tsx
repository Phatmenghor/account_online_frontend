import { Button } from "@/components/ui/button";
import { indexDisplay } from "@/utils/common/common";
import { DateTimeFormat } from "@/utils/date/date-time-format";
import { Eye, Pencil } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTranslations } from "next-intl";
import { Badge } from "@/components/ui/badge";
import {
  AllAttendanceModel,
  AttendanceModel,
} from "@/models/attendance/attendances.response";
import { TableColumn } from "./data-table";

interface AttendanceTableHandlers {
  handleOpenApprovalModal: (attendance: AttendanceModel) => void;
  handleViewAttendanceDetail: (attendance: AttendanceModel) => void;
  handleEditAttendance: (attendance: AttendanceModel) => void;
}

interface AttendanceApprovalTableOptions {
  data: AllAttendanceModel | null;
  handlers: AttendanceTableHandlers;
  visibleColumns?: string[];
}

export const createAttendanceApprovalTableColumns = ({
  data,
  handlers,
  visibleColumns,
}: AttendanceApprovalTableOptions): TableColumn<AttendanceModel>[] => {
  const {
    handleOpenApprovalModal,
    handleViewAttendanceDetail,
    handleEditAttendance,
  } = handlers;

  const t = useTranslations("attendance.table-header-attendance");
  const tCommon = useTranslations("common");

  const allColumns: TableColumn<AttendanceModel>[] = [
    {
      key: "index",
      label: "#",
      truncate: true,
      maxWidth: "400px",
      minWidth: "200px",
      className: "w-[60px]",
      render: (_, index) => (
        <span className="font-medium">
          {indexDisplay(data?.pageNo || 1, data?.pageSize || 10, index)}
        </span>
      ),
    },
    {
      key: "idCard",
      label: t("userIdCard"),
      truncate: true,
      maxWidth: "400px",
      minWidth: "200px",
      render: (attendance) => (
        <div className="flex flex-col">
          <span className="text-xs text-muted-foreground">
            {attendance.userIdCard || attendance.userEmail || ""}
          </span>
        </div>
      ),
    },
    {
      key: "userFullName",
      label: t("userFullName"),
      truncate: true,
      maxWidth: "400px",
      minWidth: "200px",
      render: (attendance) => (
        <div className="flex flex-col">
          <span className="font-medium">
            {attendance.userFullName || "---"}
          </span>
        </div>
      ),
    },
    {
      key: "status",
      label: t("status"),
      truncate: true,
      maxWidth: "400px",
      minWidth: "200px",
      render: (attendance) => {
        const status = attendance.status?.toLowerCase();
        const statusConfig: Record<string, string> = {
          approved: "bg-green-100 text-green-700 border-green-200",
          pending: "bg-yellow-100 text-yellow-700 border-yellow-200",
          rejected: "bg-red-100 text-red-700 border-red-200",
          cancelled: "bg-gray-100 text-gray-700 border-gray-200",
        };
        return (
          <Badge
            className={`capitalize border ${
              statusConfig[status || "pending"] || ""
            }`}
          >
            {attendance.status || "---"}
          </Badge>
        );
      },
    },
    {
      key: "period",
      label: t("period"),
      truncate: true,
      maxWidth: "400px",
      minWidth: "200px",
      render: (attendance) => (
        <span className="font-medium">
          {DateTimeFormat(attendance.startDate)} →{" "}
          {DateTimeFormat(attendance.endDate)}
        </span>
      ),
    },
    {
      key: "actions",
      label: t("actions"),
      truncate: true,
      maxWidth: "400px",
      minWidth: "200px",
      className: "w-[180px]",
      render: (attendance) => (
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={attendance.status !== "PENDING"} // Only pending can be approved/cancelled
                  onClick={() => handleOpenApprovalModal(attendance)}
                >
                  {attendance.status === "PENDING" ? "Approve/Cancel" : "View"}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {attendance.status === "PENDING"
                  ? "Approve or Cancel this request"
                  : "View details"}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditAttendance(attendance)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{tCommon("edit")}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewAttendanceDetail(attendance)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{tCommon("view")}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
    },
  ];

  // Filter visible columns if provided
  return visibleColumns && visibleColumns.length > 0
    ? allColumns.filter((col) => visibleColumns.includes(col.key))
    : allColumns;
};
