import { AllTraineeModel, TraineeModel } from "@/models/trainee/trainee.response";
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
  const { handleEditTrainee, handleViewTraineeDetail, handleDeleteTrainee } = handlers;

  const tTrainee = useTranslations("trainee");
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
      key: "reportRemark",
      label: tTrainee("reportRemark"),
      render: (trainee) => (
        <span className="font-medium">{trainee.reportRemark || "---"}</span>
      ),
    },
    {
      key: "challenge",
      label: tTrainee("challenge"),
      render: (trainee) => (
        <span className="font-medium">{trainee.challenge || "---"}</span>
      ),
    },
    {
      key: "recommend",
      label: tTrainee("recommend"),
      render: (trainee) => (
        <span className="font-medium">{trainee.recommend || "---"}</span>
      ),
    },
    {
      key: "createdAt",
      label: tTrainee("createdAt"),
      render: (trainee) => (
        <span className="text-muted-foreground">
          {DateTimeFormat(trainee.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      label: tTrainee("actions"),
      className: "w-[160px]",
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