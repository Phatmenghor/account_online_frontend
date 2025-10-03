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
import {
  AllAppModel,
  ApplicationModel,
} from "@/models/application/app.response";
import {
  CreateAppForm,
  UpdateAppForm,
} from "@/models/application/app.schema";
import {
  createAppService,
  deleteAppService,
  getAppService,
  updateAppService,
} from "@/services/dashboard/application/app.service";
import ModalApplication from "@/components/shared/modal/application-modal";
import { ModalMode, STATUS_APPLICATION } from "@/constants/AppResource/display-list/status/status";
import Loading from "@/components/shared/common/loading";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createApplicationTableColumns } from "@/components/shared/table/applicatioin-content";
import ApplicationViewModal from "@/components/shared/modal/application-detail-modal";

function ApplicationPageContent() {
  const [searchQuery, setSearchQuery] = useState("");
  const [applicationStatus, setApplicationStatus] = useState<string>("all");
  const [applications, setApplications] = useState<AllAppModel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExportingToExcel, setIsExportingToExcel] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<ApplicationModel | null>(
    null
  );
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [mode, setMode] = useState<ModalMode>(ModalMode.CREATE_MODE);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isApplicationDetailOpen, setIsApplicationDetailOpen] = useState(false);

  const t = useTranslations();

  const searchParams = useSearchParams();

  // Debounced search query - Optimized api performance when search
  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  const { currentPage, updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.DASHBOARD.APPLICATION,
    defaultPageSize: 10,
  });

  useEffect(() => {
    const pageParam = searchParams.get("pageNo");
    if (!pageParam) {
      updateUrlWithPage(1, true);
    }
  }, [searchParams, updateUrlWithPage]);

  const loadApplications = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getAppService({
        search: debouncedSearchQuery,
        pageNo: currentPage,
        pageSize: 100,
        applicationStatus: applicationStatus !== "all" ? applicationStatus : undefined,
      });
      setApplications(response);
    } catch (error: any) {
      console.log("Failed to fetch applications: ", error);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchQuery, currentPage, applicationStatus]);

  useEffect(() => {
    loadApplications();
  }, [loadApplications, debouncedSearchQuery, applicationStatus]);

  // Simplified search change handler - just updates the state, debouncing handles the rest
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleStatusChange = (value: string) => {
    setApplicationStatus(value);
    // Reset to first page when filter changes
    updateUrlWithPage(1, true);
  };

  const handleSaveApplication = async (
    formData: CreateAppForm | UpdateAppForm
  ) => {
    setIsSubmitting(true);
    try {
      if (mode === ModalMode.CREATE_MODE) {
        const createData = formData as CreateAppForm;
        const response = await createAppService({
          projectName: createData.projectName,
          memberInvolved: createData.memberInvolved,
          remark: createData.remark || "",
          department: createData.department,
          year: createData.year,
          urlLink: createData.urlLink,
          applicationStatus: createData.applicationStatus || "",
        });

        // Optimistic update
        setApplications((prev: any) =>
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
                last: true,
              }
        );

        startTransition(() => {
          AppToast({
            type: "success",
            message: "Application created successfully",
            description: "New Application",
          });
        });
      } else if (mode === ModalMode.UPDATE_MODE) {
        const updateAppForm = formData as UpdateAppForm;
        if (!updateAppForm.id) {
          console.error("Missing application id in update form");
          return;
        }
        const response = await updateAppService(updateAppForm.id, {
          projectName: updateAppForm.projectName,
          memberInvolved: updateAppForm.memberInvolved || "",
          remark: updateAppForm.remark || "",
          department: updateAppForm.department,
          year: updateAppForm.year,
          urlLink: updateAppForm.urlLink,
          applicationStatus: updateAppForm.applicationStatus || "",
        });

        setApplications((prev) =>
          prev
            ? {
                ...prev,
                content: prev.content.map((app) =>
                  app.id === updateAppForm.id ? response : app
                ),
              }
            : prev
        );

        startTransition(() => {
          AppToast({
            type: "success",
            message: "Application updated successfully",
            description: "Updated Application",
          });
        });
      }
      setIsModalOpen(false);
      setSelectedApplication(null);
      loadApplications();
    } catch (err: any) {
      toast.error(err?.errorMessage || "Failed to save application");
      AppToast({
        type: "error",
        message: "Failed to save application",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteApplication = async () => {
    if (!selectedApplication) return;
    setIsSubmitting(true);

    try {
      const response = await deleteAppService(selectedApplication.id);

      if (response) {
        setApplications((prev) =>
          prev
            ? {
                ...prev,
                content: prev.content.filter(
                  (app) => app.id !== selectedApplication.id
                ),
                totalElements: prev.totalElements - 1,
              }
            : prev
        );

        AppToast({
          type: "success",
          message: "Application deleted successfully",
        });
      }

      setIsDeleteDialogOpen(false);
      setSelectedApplication(null);
    } catch (err: any) {
      AppToast({
        type: "error",
        message: "Failed to delete application",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportToExcel = async (data: ApplicationModel[] | null) => {
    setIsExportingToExcel(true);
    try {
      // Define columns based on ApplicationModel
      const columns: ExcelColumn[] = [
        { header: "ID", key: "id", width: 8, type: "number" },
        { header: "Project Name", key: "projectName", width: 25, type: "text" },
        { header: "Department", key: "department", width: 15, type: "text" },
        { header: "Year", key: "year", width: 10, type: "text" },
        {
          header: "Application Status",
          key: "applicationStatus",
          width: 20,
          type: "text",
        },
        { header: "URL Link", key: "urlLink", width: 30, type: "text" },
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
        filename: "applications.xlsx",
        title: "Application Management Report",
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
        name: "Applications",
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

  const handleEditApplication = (app: ApplicationModel) => {
    setSelectedApplication(app);
    setMode(ModalMode.UPDATE_MODE);
    setIsModalOpen(true);
  };

  const handleAddApplication = () => {
    setSelectedApplication(null);
    setMode(ModalMode.CREATE_MODE);
    setIsModalOpen(true);
  };

  const handleViewApplicationDetail = (app: ApplicationModel) => {
    setSelectedApplication(app);
    setIsApplicationDetailOpen(true);
  };

  const handleDeleteApplication = (app: ApplicationModel) => {
    setSelectedApplication(app);
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
                aria-label="search-application"
                autoComplete="search-application"
                type="search"
                placeholder={t("project.search-project")}
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-8 w-full min-w-[200px] text-xs md:min-w-[300px] h-9"
                disabled={isSubmitting}
              />
            </div>
            
            {/* Status Filter Dropdown */}
            <Select value={applicationStatus} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-[180px] h-9">
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                {STATUS_APPLICATION.map((status) => (
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
                onClick={() => handleExportToExcel(applications?.content ?? [])}
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
            <Button className="h-10" onClick={handleAddApplication}>
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
                data={applications?.content || []}
                columns={createApplicationTableColumns({
                  data: applications,
                  handlers: {
                    handleEditApplication,
                    handleViewApplicationDetail,
                    handleDeleteApplication,
                  },
                })}
                emptyMessage="No application found"
                getRowKey={(application) => application.id}
              />

              {/* Pagination positioned to the right and outside the scrollable area */}
              <div className="border-t bg-background p-2 flex justify-end">
                <CustomPagination
                  currentPage={currentPage}
                  totalPages={applications?.totalPages || 1}
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
            setSelectedApplication(null);
          }}
          onDelete={confirmDeleteApplication}
          title="Delete Application"
          description={`Are you sure you want to delete the application`}
          itemName={selectedApplication?.projectName || "N/A"}
          isSubmitting={isSubmitting}
        />

        <ApplicationViewModal
          isOpen={isApplicationDetailOpen}
          onClose={() => {
            setIsApplicationDetailOpen(false);
            setSelectedApplication(null);
          }}
          applicationId={selectedApplication?.id ?? 0}
        />

        <ModalApplication
          isOpen={isModalOpen}
          mode={mode}
          onClose={() => {
            setSelectedApplication(null);
            setIsModalOpen(false);
          }}
          onSave={handleSaveApplication}
          applicationId={selectedApplication?.id ?? 0}
          isSubmitting={isSubmitting}
        />
      </CardContent>
    </Card>
  );
}

export default function ApplicationPage() {
  return (
    <Suspense fallback={<Loading />}>
      <ApplicationPageContent />
    </Suspense>
  );
}