import { Button } from "@/components/ui/button";
import { indexDisplay } from "@/utils/common/common";
import { DateTimeFormat } from "@/utils/date/date-time-format";
import { Edit, Eye, Trash } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTranslations } from "next-intl";
import {
  AllAttendanceModel,
  AttendanceModel,
} from "@/models/attendance/attendances.response";
import { Badge } from "@/components/ui/badge";
import { TableColumn } from "./data-table";

interface AttendanceTableHandlers {
  handleViewAttendanceDetail: (attendance: AttendanceModel) => void;
}

interface AttendanceTableOptions {
  data: AllAttendanceModel | null;
  handlers: AttendanceTableHandlers;
}

export const createAttendanceTableColumns = ({
  data,
  handlers,
}: AttendanceTableOptions): TableColumn<AttendanceModel>[] => {
  const { handleViewAttendanceDetail } = handlers;

  const t = useTranslations("attendance.table-header-attendance");
  const tCommon = useTranslations("common");

  return [
    {
      key: "index",
      label: "#",
      className: "w-[60px]",
      truncate: true,
      maxWidth: "400px",
      minWidth: "200px",
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
      key: "reason",
      label: t("reason"),
      truncate: true,
      maxWidth: "400px",
      minWidth: "200px",
      render: (attendance) => (
        <div className="flex flex-col">
          <span className="font-medium">{attendance.reason || "---"}</span>
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
      key: "userPosition",
      label: t("position"),
      truncate: true,
      maxWidth: "400px",
      minWidth: "200px",
      render: (attendance) => (
        <span className="font-medium">{attendance.userPosition || "---"}</span>
      ),
    },
    {
      key: "type",
      label: t("type"),
      truncate: true,
      maxWidth: "400px",
      minWidth: "200px",
      render: (attendance) => (
        <Badge variant="outline" className="capitalize">
          {attendance.type || "---"}
        </Badge>
      ),
    },
    {
      key: "leaveRequest",
      label: t("leaveRequest"),
      truncate: true,
      maxWidth: "400px",
      minWidth: "200px",
      render: (attendance) => (
        <Badge variant="outline" className="capitalize">
          {attendance.leaveRequest || "---"}
        </Badge>
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
      key: "totalDays",
      label: t("totalDays"),
      truncate: true,
      maxWidth: "400px",
      minWidth: "200px",
      render: (attendance) => (
        <span className="font-medium">{attendance.totalDays || 0}</span>
      ),
    },
    {
      key: "approvedBy",
      label: t("approvedBy"),
      truncate: true,
      maxWidth: "400px",
      minWidth: "200px",
      render: (attendance) => (
        <span className="font-medium">
          {attendance.approvedByFullName || "---"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: t("createdAt"),
      truncate: true,
      maxWidth: "400px",
      minWidth: "200px",
      render: (attendance) => (
        <span className="text-muted-foreground">
          {DateTimeFormat(attendance.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      label: t("actions"),
      truncate: true,
      maxWidth: "400px",
      minWidth: "200px",
      className: "w-[160px]",
      render: (attendance) => (
        <div className="flex items-center gap-2">
          <TooltipProvider>
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
};
