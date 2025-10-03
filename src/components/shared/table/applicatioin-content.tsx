import { AllAppModel, ApplicationModel } from "@/models/application/app.response";
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
import { formatStatusApp } from "@/utils/format/ProjectStatus";

interface ApplicationTableHandlers {
  handleEditApplication: (application: ApplicationModel) => void;
  handleViewApplicationDetail: (application: ApplicationModel) => void;
  handleDeleteApplication: (application: ApplicationModel) => void;
}

interface ApplicationTableOptions {
  data: AllAppModel | null;
  handlers: ApplicationTableHandlers;
}

export const createApplicationTableColumns = ({
  data,
  handlers,
}: ApplicationTableOptions): TableColumn<ApplicationModel>[] => {
  const { handleEditApplication, handleViewApplicationDetail, handleDeleteApplication } = handlers;

  const tApplication = useTranslations("application");
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
      key: "projectName",
      label: tApplication("projectName"),
      render: (application) => (
        <span className="font-medium">{application.projectName || "---"}</span>
      ),
    },
    {
      key: "department",
      label: tApplication("department"),
      render: (application) => (
        <span className="font-medium">{application.department || "---"}</span>
      ),
    },
    {
      key: "year",
      label: tApplication("year"),
      render: (application) => (
        <span className="font-medium">{application.year || "---"}</span>
      ),
    },
    {
      key: "applicationStatus",
      label: tApplication("applicationStatus"),
      render: (application) => (
        <span className="font-medium">
          {formatStatusApp(application.applicationStatus) || "---"}
        </span>
      ),
    },
    {
      key: "urlLink",
      label: tApplication("urlLink"),
      render: (application) => (
        <span className="font-medium">{application.urlLink || "---"}</span>
      ),
    },
    {
      key: "memberInvolved",
      label: tApplication("memberInvolved"),
      render: (application) => (
        <span className="font-medium">{application.memberInvolved || "---"}</span>
      ),
    },
    {
      key: "remark",
      label: tApplication("remark"),
      render: (application) => (
        <span className="font-medium">{application.remark || "---"}</span>
      ),
    },
    {
      key: "createdAt",
      label: tApplication("createdAt"),
      render: (application) => (
        <span className="text-muted-foreground">
          {DateTimeFormat(application.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      label: tApplication("actions"),
      className: "w-[160px]",
      render: (application) => (
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditApplication(application)}
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
                  onClick={() => handleViewApplicationDetail(application)}
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
                  onClick={() => handleDeleteApplication(application)}
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