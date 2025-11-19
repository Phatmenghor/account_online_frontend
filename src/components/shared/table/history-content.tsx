import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTranslations } from "next-intl";
import { TableColumn } from "./data-table";
import { AllHistoryModel, HistoryModel } from "@/models/aml/management/respone/history-respones.model";

interface HistoryTableHandlers {
  handleViewHistoryDetail: (history: HistoryModel) => void;
}

interface HistoryTableOptions {
  data: AllHistoryModel | null;
  handlers: HistoryTableHandlers;
}

export const createHistoryTableColumns = ({
  data,
  handlers,
}: HistoryTableOptions): TableColumn<HistoryModel>[] => {
  const { handleViewHistoryDetail } = handlers;
  const tCommon = useTranslations("common");
  const tMaster = useTranslations("master");

  return [
    {
      key: "index",
      label: "#",
      maxWidth: "60px",
      minWidth: "60px",
      render: (_, index) => <span className="font-medium">{index + 1}</span>,
    },
    {
      key: "idNumber",
      label: tMaster("idNumber"), // translated
      truncate: true,
      maxWidth: "250px",
      minWidth: "150px",
      render: (history) => (
        <span className="font-medium">{history.id|| "-"}</span>
      ),
    },
    {
      key: "fullName",
      label: tMaster("fullName"), // translated
      truncate: true,
      maxWidth: "250px",
      minWidth: "150px",
      render: (history) => (
        <span className="font-medium">{history.fullName || "-"}</span>
      ),
    },
    {
      key: "status",
      label: tMaster("status"), // translated
      truncate: true,
      maxWidth: "200px",
      minWidth: "150px",
      render: (history) => (
        <span className="font-medium">{history.status || "-"}</span>
      ),
    },
    {
      key: "createdAt",
      label: tMaster("createdAt"), // translated
      truncate: true,
      maxWidth: "200px",
      minWidth: "150px",
      render: (history) =>
        history.createdAt ? (
          <span className="font-medium">{new Date(history.createdAt).toLocaleString()}</span>
        ) : (
          "-"
        ),
    },
    {
      key: "actions",
      label: tMaster("actions"),
      maxWidth: "120px",
      minWidth: "100px",
      render: (history) => (
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewHistoryDetail(history)}
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
