import {
  AllTraineeModel,
  TraineeModel,
} from "@/models/trainee/trainee.response";
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
import { TableColumn } from "./data-table";

interface TraineeTableHandlers {
  handleEditTrainee: (trainee: TraineeModel) => void;
  handleViewTraineeDetail: (trainee: TraineeModel) => void;
  handleDeleteTrainee: (trainee: TraineeModel) => void;
}

interface TraineeTableOptions {
  data: AllTraineeModel | null;
  handlers: TraineeTableHandlers;
}

export const createTraineeTableColumns = ({
  data,
  handlers,
}: TraineeTableOptions): TableColumn<TraineeModel>[] => {
  const { handleEditTrainee, handleViewTraineeDetail, handleDeleteTrainee } =
    handlers;

  const tTrainee = useTranslations("trainee");
  const tCommon = useTranslations("common");

  return [
    {
      key: "index",
      label: "#",
      maxWidth: "60px",
      minWidth: "60px",
      render: (_, index) => (
        <span className="font-medium">
          {indexDisplay(data?.pageNo || 1, data?.pageSize || 10, index)}
        </span>
      ),
    },
    {
      key: "reportRemark",
      label: tTrainee("reportRemark"),
      truncate: true,
      maxWidth: "400px",
      minWidth: "200px",
      render: (trainee) => (
        <span className="font-medium">{trainee.reportRemark || "---"}</span>
      ),
    },
    {
      key: "challenge",
      label: tTrainee("challenge"),
      truncate: true,
      maxWidth: "300px",
      minWidth: "150px",
      render: (trainee) => (
        <span className="font-medium">{trainee.challenge || "---"}</span>
      ),
    },
    {
      key: "recommend",
      label: tTrainee("recommend"),
      truncate: true,
      maxWidth: "300px",
      minWidth: "150px",
      render: (trainee) => (
        <span className="font-medium">{trainee.recommend || "---"}</span>
      ),
    },
    {
      key: "createdAt",
      truncate: true,
      label: tTrainee("createdAt"),
      maxWidth: "380px",
      minWidth: "150px",
      render: (trainee) => (
        <span className="text-muted-foreground">
          {DateTimeFormat(trainee.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      label: tTrainee("actions"),
      maxWidth: "180px",
      minWidth: "160px",
      render: (trainee) => (
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditTrainee(trainee)}
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
                  onClick={() => handleViewTraineeDetail(trainee)}
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
                  onClick={() => handleDeleteTrainee(trainee)}
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
