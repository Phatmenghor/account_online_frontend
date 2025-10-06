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
  CreateAppSchema,
  UpdateAppSchema,
  CreateAppForm,
  UpdateAppForm,
} from "@/models/application/app.schema";
import { getAppByIdService } from "@/services/dashboard/application/app.service";
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
import { AppWindow, PenSquare, Loader2 } from "lucide-react";
import Loading from "@/components/shared/common/loading";

type Props = {
  mode: ModalMode;
  applicationId: number | null;
  onClose: () => void;
  isOpen: boolean;
  isSubmitting?: boolean;
  error?: string | null;
  onSave: (data: CreateAppForm | UpdateAppForm) => void;
};

export default function ModalApplication({
  isOpen,
  onClose,
  applicationId,
  mode,
  onSave,
  isSubmitting = false,
  error = null,
}: Props) {
  const isCreate = mode === ModalMode.CREATE_MODE;
  const schema = isCreate ? CreateAppSchema : UpdateAppSchema;

  const [applicationDetail, setApplicationDetail] =
    useState<UpdateAppForm | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<CreateAppForm | UpdateAppForm>({
    resolver: zodResolver(schema as any),
    defaultValues: {
      id: undefined,
      projectName: "",
      memberInvolved: "",
      remark: "",
      department: "",
      year: "",
      urlLink: "",
      applicationStatus: "",
    } as any,
  });

  // Load application if editing
  const loadApplicationById = useCallback(async () => {
    if (!applicationId || isCreate) return;

    setIsLoadingData(true);
    try {
      const response = await getAppByIdService(applicationId);
      setApplicationDetail(response);
    } catch (error) {
      console.error("Failed to fetch application by id", applicationId, error);
    } finally {
      setIsLoadingData(false);
    }
  }, [applicationId, isCreate]);

  useEffect(() => {
    if (isOpen && !isCreate) {
      loadApplicationById();
    }
  }, [isOpen, isCreate, loadApplicationById]);

  // Reset form on open
  useEffect(() => {
    if (isOpen) {
      reset(
        isCreate
          ? {
              projectName: "",
              memberInvolved: "",
              remark: "",
              department: "",
              year: "",
              urlLink: "",
              applicationStatus: "",
            }
          : applicationDetail ?? {}
      );
    }
  }, [isOpen, isCreate, applicationDetail, reset]);

  const onSubmit = (data: CreateAppForm | UpdateAppForm) => {
    onSave(data);
  };

  const handleClose = () => {
    reset();
    setApplicationDetail(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl h-[90vh] p-0 gap-0 flex flex-col">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
          <div className="flex items-center gap-4 pr-8">
            <div
              className={`p-2 rounded-full ${
                isCreate ? "bg-green-100" : "bg-blue-100"
              }`}
            >
              {isCreate ? (
                <AppWindow className="h-5 w-5 text-green-600" />
              ) : (
                <PenSquare className="h-5 w-5 text-blue-600" />
              )}
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold">
                {isCreate ? "Create New Application" : "Edit Application"}
              </DialogTitle>
              <DialogDescription className="text-base text-muted-foreground">
                {isCreate
                  ? "Fill out the form to create a new application"
                  : applicationDetail
                  ? `Update information for "${applicationDetail.projectName}"`
                  : "Loading application information..."}
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
            ) : !isCreate && !applicationDetail ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No application data available
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
                        placeholder="My Application"
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

                {/* Department & Year */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="department" className="text-sm font-medium">
                      Department
                    </Label>
                    <Controller
                      control={control}
                      name="department"
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="department"
                          placeholder="IT Department"
                          disabled={isSubmitting}
                          className={`transition-colors focus:border-green-500 ${
                            errors.department ? "border-red-500" : ""
                          }`}
                        />
                      )}
                    />
                    {errors.department && (
                      <p className="text-sm text-red-600">
                        {errors.department.message as string}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="year" className="text-sm font-medium">
                      Year
                    </Label>
                    <Controller
                      control={control}
                      name="year"
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="year"
                          placeholder="2024"
                          disabled={isSubmitting}
                          className={`transition-colors focus:border-green-500 ${
                            errors.year ? "border-red-500" : ""
                          }`}
                        />
                      )}
                    />
                    {errors.year && (
                      <p className="text-sm text-red-600">
                        {errors.year.message as string}
                      </p>
                    )}
                  </div>
                </div>

                {/* Application Status & URL Link */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="applicationStatus"
                      className="text-sm font-medium"
                    >
                      Application Status
                    </Label>
                    <Controller
                      control={control}
                      name="applicationStatus"
                      render={({ field }) => (
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={isSubmitting}
                        >
                          <SelectTrigger
                            id="applicationStatus"
                            className={`transition-colors focus:border-green-500 ${
                              errors.applicationStatus ? "border-red-500" : ""
                            }`}
                          >
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="UAT">UAT</SelectItem>
                            <SelectItem value="PRODUCTION">
                              Production
                            </SelectItem>
                            <SelectItem value="ACTIVE">Active</SelectItem>
                            <SelectItem value="INACTIVE">Inactive</SelectItem>
                            <SelectItem value="DEVELOPMENT">
                              Development
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.applicationStatus && (
                      <p className="text-sm text-red-600">
                        {errors.applicationStatus.message as string}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="urlLink" className="text-sm font-medium">
                      URL Link
                    </Label>
                    <Controller
                      control={control}
                      name="urlLink"
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="urlLink"
                          placeholder="https://example.com"
                          disabled={isSubmitting}
                          className={`transition-colors focus:border-green-500 ${
                            errors.urlLink ? "border-red-500" : ""
                          }`}
                        />
                      )}
                    />
                    {errors.urlLink && (
                      <p className="text-sm text-red-600">
                        {errors.urlLink.message as string}
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
                    name="memberInvolved"
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="memberInvolved"
                        placeholder="John, Jane, Bob"
                        disabled={isSubmitting}
                        className={`transition-colors focus:border-green-500 ${
                          errors.memberInvolved ? "border-red-500" : ""
                        }`}
                      />
                    )}
                  />
                  {errors.memberInvolved && (
                    <p className="text-sm text-red-600">
                      {errors.memberInvolved.message as string}
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
                        placeholder="Additional notes about the application..."
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

                {/* Application Info Card - Read Only (edit mode only) */}
                {!isCreate && applicationDetail && (
                  <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border">
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      Application Information (Read Only)
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">
                          Application ID:
                        </span>
                        <p className="font-medium">{applicationDetail.id}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Status:</span>
                        <p className="font-medium">
                          {applicationDetail.applicationStatus || "Not set"}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Created:</span>
                        <p className="font-medium">
                          {(applicationDetail as any).createdAt || "N/A"}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Last Updated:
                        </span>
                        <p className="font-medium">
                          {(applicationDetail as any).updatedAt || "N/A"}
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
                {isCreate
                  ? "Creating application..."
                  : "Updating application..."}
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
                "Create Application"
              ) : (
                "Update Application"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
