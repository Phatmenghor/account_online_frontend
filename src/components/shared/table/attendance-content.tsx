import { TableColumn } from "@/components/shared/table/table";
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

interface AttendanceTableHandlers {
  handleEditAttendance: (attendance: AttendanceModel) => void;
  handleViewAttendanceDetail: (attendance: AttendanceModel) => void;
  handleDeleteAttendance: (attendance: AttendanceModel) => void;
}

interface AttendanceTableOptions {
  data: AllAttendanceModel | null;
  handlers: AttendanceTableHandlers;
}

export const createAttendanceTableColumns = ({
  data,
  handlers,
}: AttendanceTableOptions): TableColumn<AttendanceModel>[] => {
  const {
    handleEditAttendance,
    handleViewAttendanceDetail,
    handleDeleteAttendance,
  } = handlers;

  const t = useTranslations("attendance.table");
  const tCommon = useTranslations("common");

  return [
    {
      key: "index",
      label: "#",
      className: "w-[60px]",
      render: (_, index) => (
        <span className="font-medium">
          {indexDisplay(data?.pageNo || 1, data?.pageSize || 10, index)}
        </span>
      ),
    },
    {
      key: "userFullName",
      label: t("userFullName"),
      render: (attendance) => (
        <div className="flex flex-col">
          <span className="font-medium">
            {attendance.userFullName || "---"}
          </span>
          <span className="text-xs text-muted-foreground">
            {attendance.userIdCard || attendance.userEmail || ""}
          </span>
        </div>
      ),
    },
    {
      key: "userPosition",
      label: t("position"),
      render: (attendance) => (
        <span className="font-medium">{attendance.userPosition || "---"}</span>
      ),
    },
    {
      key: "type",
      label: t("type"),
      render: (attendance) => (
        <Badge variant="outline" className="capitalize">
          {attendance.type || "---"}
        </Badge>
      ),
    },
    {
      key: "status",
      label: t("status"),
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
      render: (attendance) => (
        <span className="font-medium">{attendance.totalDays || 0}</span>
      ),
    },
    {
      key: "approvedBy",
      label: t("approvedBy"),
      render: (attendance) => (
        <span className="font-medium">
          {attendance.approvedByFullName || "---"}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: t("createdAt"),
      render: (attendance) => (
        <span className="text-muted-foreground">
          {DateTimeFormat(attendance.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      label: tCommon("actions"),
      className: "w-[160px]",
      render: (attendance) => (
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditAttendance(attendance)}
                >
                  <Edit className="h-4 w-4" />
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

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteAttendance(attendance)}
                >
                  <Trash className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{tCommon("delete")}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
    },
  ];
};
