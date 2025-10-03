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
import {
  AllProjectModel,
  ProjectModel,
} from "@/models/project/project.response";
import { useTranslations } from "next-intl";
import { formatStatus } from "@/utils/format/ProjectStatus";
import { TableColumn } from "./data-table";

interface ProjectTableHandlers {
  handleEditProject: (project: ProjectModel) => void;
  handleViewProjectDetail: (project: ProjectModel) => void;
  handleDeleteProject: (project: ProjectModel) => void;
}

interface ProjectTableOptions {
  data: AllProjectModel | null;
  handlers: ProjectTableHandlers;
}

export const createProjectTableColumns = ({
  data,
  handlers,
}: ProjectTableOptions): TableColumn<ProjectModel>[] => {
  const { handleEditProject, handleViewProjectDetail, handleDeleteProject } =
    handlers;

  const tProject = useTranslations("project.table-header-project");
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
      label: tProject("projectName"),
      render: (project) => (
        <span className="font-medium">{project.projectName || "---"}</span>
      ),
    },
    {
      key: "type",
      label: tProject("type"),
      render: (project) => (
        <span className="font-medium">{project.type || "---"}</span>
      ),
    },
    {
      key: "projectStatus",
      label: tProject("projectStatus"),
      render: (project) => (
        <span className="font-medium">
          {formatStatus(project.projectStatus) || "---"}
        </span>
      ),
    },
    {
      key: "hostServer",
      label: tProject("hostServer"),
      render: (project) => (
        <span className="font-medium">{project.hostServer || "---"}</span>
      ),
    },
    {
      key: "dbName",
      label: tProject("dbName"),
      render: (project) => (
        <span className="font-medium">{project.dbName || "---"}</span>
      ),
    },
    {
      key: "hostPort",
      label: tProject("hostPort"),
      render: (project) => (
        <span className="font-medium">{project.hostPort || "---"}</span>
      ),
    },
    {
      key: "memberInvolved",
      label: tProject("memberInvolved"),
      render: (project) => (
        <span className="font-medium">{project.memberInvolved || "---"}</span>
      ),
    },
    {
      key: "createdAt",
      label: tProject("createdAt"),
      render: (project) => (
        <span className="text-muted-foreground">
          {DateTimeFormat(project.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      label: tProject("actions"),
      className: "w-[160px]",
      render: (project) => (
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditProject(project)}
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
                  onClick={() => handleViewProjectDetail(project)}
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
                  onClick={() => handleDeleteProject(project)}
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
