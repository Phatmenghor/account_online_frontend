"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useForm, Controller, FieldErrors } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  CreateProjectSchema,
  UpdateProjectSchema,
  CreateProjectForm,
  UpdateProjectForm,
} from "@/models/project/project.schema";
import { getProjectByIdService } from "@/services/dashboard/project/project.service";
import { ModalMode } from "@/constants/AppResource/display-list/status/status";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FolderPlus, FolderEdit, Loader2 } from "lucide-react";
import Loading from "@/components/shared/common/loading";

type Props = {
  mode: ModalMode;
  projectId: number | null;
  onClose: () => void;
  isOpen: boolean;
  isSubmitting?: boolean;
  error?: string | null;
  onSave: (data: CreateProjectForm | UpdateProjectForm) => void;
};

export default function ModalProject({
  isOpen,
  onClose,
  projectId,
  mode,
  onSave,
  isSubmitting = false,
  error = null,
}: Props) {
  const isCreate = mode === ModalMode.CREATE_MODE;
  const schema = isCreate ? CreateProjectSchema : UpdateProjectSchema;

  const [projectDetail, setProjectDetail] = useState<UpdateProjectForm | null>(
    null
  );
  const [isLoadingData, setIsLoadingData] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<CreateProjectForm | UpdateProjectForm>({
    resolver: zodResolver(schema as any),
    defaultValues: {
      id: undefined,
      projectName: "",
      type: "",
      hostServer: "",
      hostPort: "",
      dbName: "",
      memberInvolved: "",
      dbType: "",
      dbServer: "",
      remark: "",
      projectStatus: "",
      gitUrl: "",
      gitBranch: "",
    } as any,
  });

  // Load project if editing
  const loadProjectById = useCallback(async () => {
    if (!projectId || isCreate) return;

    setIsLoadingData(true);
    try {
      const response = await getProjectByIdService(projectId);
      setProjectDetail(response);
    } catch (error) {
      console.error("Failed to fetch project by id", projectId, error);
    } finally {
      setIsLoadingData(false);
    }
  }, [projectId, isCreate]);

  useEffect(() => {
    if (isOpen && !isCreate) {
      loadProjectById();
    }
  }, [isOpen, isCreate, loadProjectById]);

  // Reset form on open
  useEffect(() => {
    if (isOpen) {
      reset(
        isCreate
          ? {
              projectName: "",
              type: "",
              hostServer: "",
              hostPort: undefined,
              dbName: "",
              memberInvolved: "",
              dbType: "",
              dbServer: "",
              remark: "",
              projectStatus: "",
              gitUrl: "",
              gitBranch: "",
            }
          : projectDetail ?? {}
      );
    }
  }, [isOpen, isCreate, projectDetail, reset]);

  const onSubmit = (data: CreateProjectForm | UpdateProjectForm) => {
    onSave(data);
  };

  const handleClose = () => {
    reset();
    setProjectDetail(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl h-[90vh] p-0 gap-0 flex flex-col">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
          <div className="flex items-center gap-4 pr-8">
            <div
              className={`p-2 rounded-full ${
                isCreate ? "bg-green-100" : "bg-blue-100"
              }`}
            >
              {isCreate ? (
                <FolderPlus className="h-5 w-5 text-green-600" />
              ) : (
                <FolderEdit className="h-5 w-5 text-blue-600" />
              )}
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold">
                {isCreate ? "Create New Project" : "Edit Project"}
              </DialogTitle>
              <DialogDescription className="text-base text-muted-foreground">
                {isCreate
                  ? "Fill out the form to create a new project"
                  : projectDetail
                  ? `Update information for "${projectDetail.projectName}"`
                  : "Loading project information..."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-6">
            {/* Loading State */}
            {isLoadingData ? (
              <Loading />
            ) : !isCreate && !projectDetail ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No project data available
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Error Display */}
                {error && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                    <p className="text-sm text-destructive font-medium">
                      {error}
                    </p>
                  </div>
                )}

                {/* Project Name */}
                <div className="space-y-2">
                  <Label htmlFor="projectName" className="text-sm font-medium">
                    Project Name{" "}
                    {isCreate && <span className="text-red-500">*</span>}
                  </Label>
                  <Controller
                    control={control}
                    name="projectName"
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="projectName"
                        placeholder="My Awesome Project"
                        disabled={isSubmitting}
                        className={`transition-colors focus:border-green-500 ${
                          errors.projectName ? "border-red-500" : ""
                        }`}
                      />
                    )}
                  />
                  {errors.projectName && (
                    <p className="text-sm text-red-600">
                      {errors.projectName.message as string}
                    </p>
                  )}
                </div>

                {/* Type & Project Status */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-sm font-medium">
                      Type
                    </Label>
                    <Controller
                      control={control}
                      name="type"
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={isSubmitting}
                        >
                          <SelectTrigger
                            id="type"
                            className={`transition-colors focus:border-green-500 ${
                              errors.type ? "border-red-500" : ""
                            }`}
                          >
                            <SelectValue placeholder="Select type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Frontend">Frontend</SelectItem>
                            <SelectItem value="Backend">Backend</SelectItem>
                            <SelectItem value="Full Stack">
                              Full Stack
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.type && (
                      <p className="text-sm text-red-600">
                        {errors.type.message as string}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="projectStatus"
                      className="text-sm font-medium"
                    >
                      Project Status
                    </Label>
                    <Controller
                      control={control}
                      name="projectStatus"
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={isSubmitting}
                        >
                          <SelectTrigger
                            id="projectStatus"
                            className={`transition-colors focus:border-green-500 ${
                              errors.projectStatus ? "border-red-500" : ""
                            }`}
                          >
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="UAT">UAT</SelectItem>
                            <SelectItem value="PRODUCTION">
                              PRODUCTION
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.projectStatus && (
                      <p className="text-sm text-red-600">
                        {errors.projectStatus.message as string}
                      </p>
                    )}
                  </div>
                </div>

                {/* Host Server & Host Port */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="hostServer" className="text-sm font-medium">
                      Host Server
                    </Label>
                    <Controller
                      control={control}
                      name="hostServer"
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="hostServer"
                          placeholder="192.168.1.1"
                          disabled={isSubmitting}
                          className={`transition-colors focus:border-green-500 ${
                            errors.hostServer ? "border-red-500" : ""
                          }`}
                        />
                      )}
                    />
                    {errors.hostServer && (
                      <p className="text-sm text-red-600">
                        {errors.hostServer.message as string}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="hostPort" className="text-sm font-medium">
                      Host Port
                    </Label>
                    <Controller
                      control={control}
                      name="hostPort"
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="hostPort"
                          type="text"
                          placeholder="8080"
                          disabled={isSubmitting}
                          className={`transition-colors focus:border-green-500 ${
                            errors.hostPort ? "border-red-500" : ""
                          }`}
                        />
                      )}
                    />
                    {errors.hostPort && (
                      <p className="text-sm text-red-600">
                        {errors.hostPort.message as string}
                      </p>
                    )}
                  </div>
                </div>

                {/* Git URL & Git Branch */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="gitUrl" className="text-sm font-medium">
                      Git URL
                    </Label>
                    <Controller
                      control={control}
                      name="gitUrl"
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="gitUrl"
                          placeholder="https://github.com/user/repo"
                          disabled={isSubmitting}
                          className={`transition-colors focus:border-green-500 ${
                            errors.gitUrl ? "border-red-500" : ""
                          }`}
                        />
                      )}
                    />
                    {errors.gitUrl && (
                      <p className="text-sm text-red-600">
                        {errors.gitUrl.message as string}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gitBranch" className="text-sm font-medium">
                      Git Branch
                    </Label>
                    <Controller
                      control={control}
                      name="gitBranch"
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="gitBranch"
                          placeholder="main"
                          disabled={isSubmitting}
                          className={`transition-colors focus:border-green-500 ${
                            errors.gitBranch ? "border-red-500" : ""
                          }`}
                        />
                      )}
                    />
                    {errors.gitBranch && (
                      <p className="text-sm text-red-600">
                        {errors.gitBranch.message as string}
                      </p>
                    )}
                  </div>
                </div>

                {/* Database Fields */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dbName" className="text-sm font-medium">
                      Database Name
                    </Label>
                    <Controller
                      control={control}
                      name="dbName"
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="dbName"
                          placeholder="mydb"
                          disabled={isSubmitting}
                          className={`transition-colors focus:border-green-500 ${
                            errors.dbName ? "border-red-500" : ""
                          }`}
                        />
                      )}
                    />
                    {errors.dbName && (
                      <p className="text-sm text-red-600">
                        {errors.dbName.message as string}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dbType" className="text-sm font-medium">
                      Database Type
                    </Label>
                    <Controller
                      control={control}
                      name="dbType"
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="dbType"
                          placeholder="PostgreSQL"
                          disabled={isSubmitting}
                          className={`transition-colors focus:border-green-500 ${
                            errors.dbType ? "border-red-500" : ""
                          }`}
                        />
                      )}
                    />
                    {errors.dbType && (
                      <p className="text-sm text-red-600">
                        {errors.dbType.message as string}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dbServer" className="text-sm font-medium">
                      Database Server
                    </Label>
                    <Controller
                      control={control}
                      name="dbServer"
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="dbServer"
                          placeholder="localhost"
                          disabled={isSubmitting}
                          className={`transition-colors focus:border-green-500 ${
                            errors.dbServer ? "border-red-500" : ""
                          }`}
                        />
                      )}
                    />
                    {errors.dbServer && (
                      <p className="text-sm text-red-600">
                        {errors.dbServer.message as string}
                      </p>
                    )}
                  </div>
                </div>

                {/* Members Involved */}
                <div className="space-y-2">
                  <Label
                    htmlFor="memberInvolved"
                    className="text-sm font-medium"
                  >
                    Members Involved
                  </Label>
                  <Controller
                    control={control}
                    name={"memberInvolved" as keyof CreateProjectForm}
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="memberInvolved"
                        placeholder="John, Jane, Bob"
                        disabled={isSubmitting}
                        className={`transition-colors focus:border-green-500 ${
                          (errors as Partial<FieldErrors<CreateProjectForm>>)
                            .memberInvolved
                            ? "border-red-500"
                            : ""
                        }`}
                      />
                    )}
                  />
                  {(errors as Partial<FieldErrors<CreateProjectForm>>)
                    .memberInvolved && (
                    <p className="text-sm text-red-600">
                      {(errors as any).memberInvolved?.message as string}
                    </p>
                  )}
                </div>

                {/* Remark */}
                <div className="space-y-2">
                  <Label htmlFor="remark" className="text-sm font-medium">
                    Remark
                  </Label>
                  <Controller
                    control={control}
                    name="remark"
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        id="remark"
                        disabled={isSubmitting}
                        rows={3}
                        placeholder="Additional notes about the project..."
                        className={`transition-colors focus:border-green-500 resize-y ${
                          errors.remark ? "border-red-500" : ""
                        }`}
                      />
                    )}
                  />
                  {errors.remark && (
                    <p className="text-sm text-red-600">
                      {errors.remark.message as string}
                    </p>
                  )}
                </div>

                {/* Project Info Card - Read Only (edit mode only) */}
                {!isCreate && projectDetail && (
                  <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border">
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      Project Information (Read Only)
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">
                          Project ID:
                        </span>
                        <p className="font-medium">{projectDetail.id}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Created:</span>
                        <p className="font-medium">
                          {(projectDetail as any).createdAt || "N/A"}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Last Updated:
                        </span>
                        <p className="font-medium">
                          {(projectDetail as any).updatedAt || "N/A"}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Status:</span>
                        <p className="font-medium">
                          {projectDetail.projectStatus || "Not set"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t bg-muted/30 flex-shrink-0">
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            {isSubmitting ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                {isCreate ? "Creating project..." : "Updating project..."}
              </>
            ) : isDirty ? (
              <>
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                You have unsaved changes
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                {isCreate ? "Ready to create" : "No changes made"}
              </>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting || (!isCreate && !isDirty)}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isCreate ? "Creating..." : "Updating..."}
                </>
              ) : isCreate ? (
                "Create Project"
              ) : (
                "Update Project"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
