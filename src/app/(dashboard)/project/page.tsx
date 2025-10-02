"use client";

import { Suspense } from "react";
import { DeleteConfirmationDialog } from "@/components/shared/dialog/dialog-delete";
import { CustomPagination } from "@/components/shared/pagination/custom-pagination";
import { DataTable } from "@/components/shared/table/data-table";
import { AppToast } from "@/components/shared/toast/app-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ROUTES } from "@/constants/AppRoutes/routes";
import { usePagination } from "@/hooks/use-pagination";
import { useDebounce } from "@/utils/debounce/debounce";
import { Download, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { startTransition, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { AppIcons } from "@/constants/AppResource/icons/app-icons";
import {
  ExcelColumn,
  ExcelExporter,
  ExcelSheet,
} from "@/utils/export-file/excel";
import { createProjectTableColumns } from "@/components/shared/table/project-content";
import {
  AllProjectModel,
  ProjectModel,
} from "@/models/project/project.response";
import ProjectViewModal from "@/components/shared/modal/project-detail-modal";
import {
  CreateProjectForm,
  UpdateProjectForm,
} from "@/models/project/project.schema";
import {
  createProjectService,
  deleteProjectService,
  getProjectService,
  updateProjectService,
} from "@/services/dashboard/project/project.service";
import ModalProject from "@/components/shared/modal/project-modal";
import { ModalMode, STATUS_PROJECT } from "@/constants/AppResource/display-list/status/status";
import Loading from "@/components/shared/common/loading";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function ProjectPageContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [projectStatus, setProjectStatus] = useState<string>("all");
  const [projects, setProjects] = useState<AllProjectModel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExportingToExcel, setIsExportingToExcel] = useState(false);
  const [selectedProject, setSelectedProject] = useState<ProjectModel | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [mode, setMode] = useState<ModalMode>(ModalMode.CREATE_MODE);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProjectDetailOpen, setIsProjectDetailOpen] = useState(false);

  const t = useTranslations();

  const searchParams = useSearchParams();

  // Debounced search query - Optimized api performance when search
  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  const { currentPage, updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.DASHBOARD.PROJECT,
    defaultPageSize: 10,
  });

  useEffect(() => {
    const pageParam = searchParams.get("pageNo");
    if (!pageParam) {
      updateUrlWithPage(1, true);
    }
  }, [searchParams, updateUrlWithPage]);

  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getProjectService({
        search: debouncedSearchQuery,
        pageNo: currentPage,
        pageSize: 10,
        projectStatus: projectStatus !== "all" ? projectStatus : undefined,
      });
      setProjects(response);
    } catch (error: any) {
      console.log("Failed to fetch projects: ", error);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchQuery, currentPage, projectStatus]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects, debouncedSearchQuery, projectStatus]);

  // Simplified search change handler - just updates the state, debouncing handles the rest
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleStatusChange = (value: string) => {
    setProjectStatus(value);
    // Reset to first page when filter changes
    updateUrlWithPage(1, true);
  };

  const handleSaveProject = async (
    formData: CreateProjectForm | UpdateProjectForm
  ) => {
    setIsSubmitting(true);
    try {
      if (mode === ModalMode.CREATE_MODE) {
        const createData = formData as CreateProjectForm;
        const response = await createProjectService({
          hostPort: Number(createData.hostPort),
          hostServer: createData.hostServer,
          memberInvolved: createData.memberInvolved,
          projectName: createData.projectName,
          remark: createData.remark || "",
          projectStatus: createData.projectStatus || "",
          gitUrl: createData.gitUrl || "",
          gitBranch: createData.gitBranch || "",
          type: createData.type,
          dbType: createData.dbType,
          dbServer: createData.dbServer,
          dbName: createData.dbName,
        });

        // Optimistic update
        setProjects((prev: any) =>
          prev
            ? {
                ...prev,
                content: [response, ...prev.content],
                totalElements: prev.totalElements + 1,
              }
            : {
                content: [response],
                pageNo: 1,
                pageSize: 10,
                totalElements: 1,
                totalPages: 1,
                hasNext: false,
                hasPrevious: false,
                first: true,
                last: true,
              }
        );

        startTransition(() => {
          AppToast({
            type: "success",
            message: "Project created successfully",
            description: "New Project",
          });
        });
      } else if (mode === ModalMode.UPDATE_MODE) {
        const updateProjectForm = formData as UpdateProjectForm;
        if (!updateProjectForm.id) {
          console.error("Missing projects id in update form");
          return;
        }
        const response = await updateProjectService(updateProjectForm.id, {
          hostPort: updateProjectForm.hostPort,
          hostServer: updateProjectForm.hostServer,
          projectName: updateProjectForm.projectName,
          remark: updateProjectForm.remark || "",
          projectStatus: updateProjectForm.projectStatus || "",
          gitUrl: updateProjectForm.gitUrl || "",
          gitBranch: updateProjectForm.gitBranch || "",
          type: updateProjectForm.type,
          memberInvolved: updateProjectForm?.memberInvolved || "",
          dbType: updateProjectForm.dbType,
          dbServer: updateProjectForm.dbServer,
          dbName: updateProjectForm.dbName,
        });

        setProjects((prev) =>
          prev
            ? {
                ...prev,
                content: prev.content.map((proj) =>
                  proj.id === updateProjectForm.id ? response : proj
                ),
              }
            : prev
        );

        startTransition(() => {
          AppToast({
            type: "success",
            message: "Project updated successfully",
            description: "Updated Project",
          });
        });
      }
      setIsModalOpen(false);
      setSelectedProject(null);
      loadProjects();
    } catch (err: any) {
      toast.error(err?.errorMessage || "Failed to save project");
      AppToast({
        type: "error",
        message: "Failed to save project",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteProject = async () => {
    if (!selectedProject) return;
    setIsSubmitting(true);

    try {
      const response = await deleteProjectService(selectedProject.id);

      if (response) {
        setProjects((prev) =>
          prev
            ? {
                ...prev,
                content: prev.content.filter(
                  (proj) => proj.id !== selectedProject.id
                ),
                totalElements: prev.totalElements - 1,
              }
            : prev
        );

        AppToast({
          type: "success",
          message: "Project deleted successfully",
        });
      }

      setIsDeleteDialogOpen(false);
      setSelectedProject(null);
    } catch (err: any) {
      AppToast({
        type: "error",
        message: "Failed to delete project",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportToExcel = async (data: ProjectModel[] | null) => {
    setIsExportingToExcel(true);
    try {
      // Define columns based on ProjectModel
      const columns: ExcelColumn[] = [
        { header: "ID", key: "id", width: 8, type: "number" },
        { header: "Project Name", key: "projectName", width: 25, type: "text" },
        { header: "Type", key: "type", width: 15, type: "text" },
        { header: "Host Server", key: "hostServer", width: 20, type: "text" },
        { header: "Host Port", key: "hostPort", width: 10, type: "number" },
        { header: "Database Name", key: "dbName", width: 20, type: "text" },
        { header: "Database Type", key: "dbType", width: 15, type: "text" },
        { header: "Database Server", key: "dbServer", width: 20, type: "text" },
        {
          header: "Project Status",
          key: "projectStatus",
          width: 20,
          type: "text",
        },
        { header: "Git Url", key: "gitUrl", width: 20, type: "text" },
        { header: "Git Branch", key: "gitBranch", width: 20, type: "text" },
        {
          header: "Members Involved",
          key: "memberInvolved",
          width: 25,
          type: "text",
        },
        { header: "Remark", key: "remark", width: 30, type: "text" },
        {
          header: "Created Date",
          key: "createdAt",
          width: 18,
          type: "date",
          format: "mm/dd/yyyy",
        },
        {
          header: "Updated Date",
          key: "updatedAt",
          width: 18,
          type: "date",
          format: "mm/dd/yyyy",
        },
      ];

      // Create Excel exporter
      const exporter = new ExcelExporter({
        filename: "projects.xlsx",
        title: "Project Management Report",
        author: "IT Department",
        useAlternateRows: true,
        protection: {
          password: "88889999",
          deleteRows: false,
          selectLockedCells: true,
          selectUnlockedCells: true,
        },
      });

      // Configure sheet
      const sheetConfig: ExcelSheet = {
        name: "Projects",
        data: data ?? [],
        columns,
        autoFilter: true,
        freezeRows: 1,
        sortBy: [{ key: "id", order: "asc" }],
      };

      exporter.addSheet(sheetConfig);
      await exporter.export();

      AppToast({ type: "success", message: "Successfully exported to Excel" });
    } catch (error: any) {
      AppToast({ type: "error", message: "Failed to export to Excel" });
      console.error("Error exporting to Excel:", error);
    } finally {
      setIsExportingToExcel(false);
    }
  };

  const handleEditProject = (proj: ProjectModel) => {
    setSelectedProject(proj);
    setMode(ModalMode.UPDATE_MODE);
    setIsModalOpen(true);
  };

  const handleAddProject = () => {
    setSelectedProject(null);
    setMode(ModalMode.CREATE_MODE);
    setIsModalOpen(true);
  };

  const handleViewProjectDetail = (proj: ProjectModel) => {
    setSelectedProject(proj);
    setIsProjectDetailOpen(true);
  };

  const handleDeleteProject = (proj: ProjectModel) => {
    setSelectedProject(proj);
    setIsDeleteDialogOpen(true);
  };

  return (
    <Card>
      <CardContent className="space-y-6 p-6">
        <div className="flex justify-between">
          <div className="flex flex-wrap items-center justify-start gap-4 w-full">
            <div className="relative w-full md:w-[350px]">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                aria-label="search-project"
                autoComplete="search-project"
                type="search"
                placeholder={t("project.search-project")}
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-8 w-full min-w-[200px] text-xs md:min-w-[300px] h-9"
                disabled={isSubmitting}
              />
            </div>
            
            {/* Status Filter Dropdown */}
            <Select value={projectStatus} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {STATUS_PROJECT.map((status) => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-4">
            <div>
              <Button
                onClick={() => handleExportToExcel(projects?.content ?? [])}
                size="lg"
                variant="outline"
                className="gap-2 text-sm sm:text-base h-10 hover:bg-gray-200 duration-400 lg:text-lg px-3 sm:px-4 lg:px-6"
                disabled={isExportingToExcel}
              >
                <img
                  src={AppIcons.FILE.Excel}
                  alt="Excel Icon"
                  className="h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground flex-shrink-0"
                />
                <span className="text-sm gap-2">
                  {isExportingToExcel ? <Loading /> : "Export"}
                </span>
                <Download className="w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0" />
              </Button>
            </div>
            <Button className="h-10" onClick={handleAddProject}>
              {t("common.new")}
            </Button>
          </div>
        </div>

        <div className="w-full">
          <Separator className="bg-gray-300" />
        </div>
        <div className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 rounded-md border overflow-hidden flex flex-col">
            <div className="flex-1 overflow-x-auto">
              <DataTable
                data={projects?.content || []}
                columns={createProjectTableColumns({
                  data: projects,
                  handlers: {
                    handleEditProject,
                    handleViewProjectDetail,
                    handleDeleteProject,
                  },
                })}
                // loading={isLoading}
                emptyMessage="No project found"
                getRowKey={(project) => project.id}
              />

              {/* Pagination positioned to the right and outside the scrollable area */}
              <div className="border-t bg-background p-2 flex justify-end">
                <CustomPagination
                  currentPage={currentPage}
                  totalPages={projects?.totalPages || 1}
                  onPageChange={handlePageChange}
                  size="md"
                />
              </div>
            </div>
          </div>
        </div>

        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setSelectedProject(null);
          }}
          onDelete={confirmDeleteProject}
          title="Delete Project"
          description={`Are you sure you want to delete the project`}
          itemName={selectedProject?.projectName || "N/A"}
          isSubmitting={isSubmitting}
        />

        <ProjectViewModal
          isOpen={isProjectDetailOpen}
          onClose={() => {
            setIsProjectDetailOpen(false);
            setSelectedProject(null);
          }}
          projectId={selectedProject?.id ?? 0}
        />

        <ModalProject
          isOpen={isModalOpen}
          mode={mode}
          onClose={() => {
            setSelectedProject(null);
            setIsModalOpen(false);
          }}
          onSave={handleSaveProject}
          projectId={selectedProject?.id ?? 0}
          isSubmitting={isSubmitting}
        />
      </CardContent>
    </Card>
  );
}

export default function ProjectPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ProjectPageContent />
    </Suspense>
  );
}