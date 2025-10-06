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
import {
  ModalMode,
  STATUS_PROJECT,
} from "@/constants/AppResource/display-list/status/status";
import Loading from "@/components/shared/common/loading";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getMyAttendanceService } from "@/services/dashboard/attendance/attendance.service";
import { AllAttendanceModel } from "@/models/attendance/attendances.response";

function HomePageContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [projectStatus, setProjectStatus] = useState<string>("all");

  const [projects, setProjects] = useState<AllProjectModel | null>(null);
  const [attendance, setAttendances] = useState<AllAttendanceModel | null>(
    null
  );

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

  const loadAttendance = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getMyAttendanceService({
        search: debouncedSearchQuery,
        pageNo: currentPage,
        pageSize: 100,
      });
      setAttendances(response);
    } catch (error: any) {
      console.log("Failed to fetch projects: ", error);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchQuery, currentPage]);

  useEffect(() => {
    loadAttendance();
  }, [loadAttendance, debouncedSearchQuery, projectStatus]);

  // Simplified search change handler - just updates the state, debouncing handles the rest
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleStatusChange = (value: string) => {
    setProjectStatus(value);
    // Reset to first page when filter changes
    updateUrlWithPage(1, true);
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

        <ProjectViewModal
          isOpen={isProjectDetailOpen}
          onClose={() => {
            setIsProjectDetailOpen(false);
            setSelectedProject(null);
          }}
          projectId={selectedProject?.id ?? 0}
        />
      </CardContent>
    </Card>
  );
}

export default function ProjectPage() {
  return (
    <Suspense fallback={<Loading />}>
      <HomePageContent />
    </Suspense>
  );
}
