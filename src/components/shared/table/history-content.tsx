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
import {
  AllHistoryModel,
  HistoryModel,
} from "@/models/aml/history/response/history-respones.model";

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
    /** Index */
    {
      key: "index",
      label: "#",
      maxWidth: "60px",
      minWidth: "60px",
      render: (_, index) => <span className="font-medium">{index + 1}</span>,
    },

    /** Legal ID */
    {
      key: "legalId",
      label: tMaster("idNumber"),
      minWidth: "150px",
      truncate: true,
      render: (h) => <span>{h.customerInfo?.legalId || "-"}</span>,
    },

    /** Full Name */
    {
      key: "fullName",
      label: tMaster("fullName"),
      minWidth: "200px",
      truncate: true,
      render: (h) => (
        <span>
          {h.customerInfo?.familyName} {h.customerInfo?.givenName}
        </span>
      ),
    },

    /** Risk Level */
    {
      key: "riskLevel",
      label: tMaster("riskLevel"),
      minWidth: "150px",
      render: (h) => (
        <span
          className={`font-medium ${
            h.riskLevel === "HIGH"
              ? "text-red-600"
              : h.riskLevel === "MEDIUM"
              ? "text-yellow-600"
              : "text-green-600"
          }`}
        >
          {h.riskLevel}
        </span>
      ),
    },

    /** Status */
    {
      key: "status",
      label: tMaster("status"),
      minWidth: "150px",
      render: (h) => (
        <span className="font-medium capitalize">
          {h.status?.toLowerCase() || "-"}
        </span>
      ),
    },

    /** Service Name */
    {
      key: "serviceName",
      label: tMaster("serviceName"),
      minWidth: "180px",
      truncate: true,
      render: (h) => <span>{h.serviceName || "-"}</span>,
    },

    /** Total Rules Score */
    {
      key: "totalRulesScore",
      label: tMaster("score"),
      minWidth: "120px",
      render: (h) => (
        <span className="font-semibold text-gray-700">{h.totalRulesScore}</span>
      ),
    },

    /** Created At */
    {
      key: "createdAt",
      label: tMaster("createdAt"),
      minWidth: "180px",
      truncate: true,
      render: (h) =>
        h.createdAt ? (
          <span>{new Date(h.createdAt).toLocaleString()}</span>
        ) : (
          "-"
        ),
    },

    /** Actions */
    {
      key: "actions",
      label: tMaster("actions"),
      minWidth: "100px",
      maxWidth: "100px",
      render: (history) => (
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
      ),
    },
  ];
};
