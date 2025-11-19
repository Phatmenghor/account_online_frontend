import { Button } from "@/components/ui/button";
import { indexDisplay } from "@/utils/common/common";
import { CheckCircle, Eye, XCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTranslations } from "next-intl";
import { TableColumn } from "./data-table";
import { AmlStatusEnum } from "@/constants/AppResource/filter/status";
import { AllManagementModel, ManagementModel } from "@/models/aml/management/respone/management-response";

interface ManagementTableHandlers {
  handleViewManagementDetail: (management: ManagementModel) => void;
  openConfirmAmlDialog: (
    management: ManagementModel,
    status: AmlStatusEnum
  ) => void;
}

interface ManagementTableOptions {
  data: AllManagementModel | null;
  handlers: ManagementTableHandlers;
}

export const createManagementTableColumns = ({
  data,
  handlers,
}: ManagementTableOptions): TableColumn<ManagementModel>[] => {
  const { handleViewManagementDetail, openConfirmAmlDialog } = handlers;

  const tCommon = useTranslations("common");
  const tMaster = useTranslations("master");

  return [
    {
      key: "index",
      label: "#",
      maxWidth: "60px",
      minWidth: "60px",
      render: (_, index) => <span className="font-medium"></span>,
    },
    {
      key: "idNumber",
      label: "Id Number",
      truncate: true,
      maxWidth: "300px",
      minWidth: "150px",
      render: (management) => <span className="font-medium"></span>,
    },
    {
      key: "status",
      label: "Status",
      truncate: true,
      maxWidth: "300px",
      minWidth: "150px",
      render: (management) => (
        <span className="font-medium">{management.status || "---"}</span>
      ),
    },
    {
      key: "actions",
      label: tMaster("actions"),
      maxWidth: "180px",
      minWidth: "160px",
      render: (management) => (
        <div className="flex items-center gap-2">
          {/* View */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewManagementDetail(management)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{tCommon("view")}</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Approve */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    openConfirmAmlDialog(management, AmlStatusEnum.APPROVE)
                  }
                  className="border-white-500 text-orange-500 hover:bg-orange-50"
                >
                  <CheckCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Approve</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Reject */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    openConfirmAmlDialog(management, AmlStatusEnum.REJECT)
                  }
                  className="border-red-500 text-red-500 hover:bg-red-50"
                >
                  <XCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Reject</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
    },
  ];
};
