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

type Props = {
  mode: ModalMode;
  applicationId: number | null;
  onClose: () => void;
  isOpen: boolean;
  isSubmitting?: boolean;
  onSave: (data: CreateAppForm | UpdateAppForm) => void;
};

export default function ModalApplication({
  isOpen,
  onClose,
  applicationId,
  mode,
  onSave,
  isSubmitting = false,
}: Props) {
  const isCreate = mode === ModalMode.CREATE_MODE;
  const schema = isCreate ? CreateAppSchema : UpdateAppSchema;

  const [applicationDetail, setApplicationDetail] =
    useState<UpdateAppForm | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
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
    if (!applicationId) return;
    try {
      const response = await getAppByIdService(applicationId);
      setApplicationDetail(response);
    } catch (error) {
      console.error("Failed to fetch application by id", applicationId, error);
    }
  }, [applicationId, isCreate]);

  useEffect(() => {
    loadApplicationById();
  }, [loadApplicationById]);

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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isCreate ? "Create Application" : "Edit Application"}
          </DialogTitle>
          <DialogDescription>
            {isCreate
              ? "Fill out the form to create a new application."
              : "Update application information below."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2 pt-4">
          {/* Project Name */}
          <div className="space-y-1">
            <Label htmlFor="projectName">
              Project Name{" "}
              {isCreate ? <span className="text-red-700">*</span> : ""}
            </Label>
            <Controller
              control={control}
              name="projectName"
              render={({ field }) => (
                <Input
                  {...field}
                  id="projectName"
                  disabled={isSubmitting}
                  className={errors.projectName ? "border-red-500" : ""}
                />
              )}
            />
            {errors.projectName && (
              <p className="text-sm text-destructive">
                {errors.projectName.message as string}
              </p>
            )}
          </div>

          {/* Department */}
          <div className="space-y-1">
            <Label htmlFor="department">Department</Label>
            <Controller
              control={control}
              name="department"
              render={({ field }) => (
                <Input
                  {...field}
                  id="department"
                  disabled={isSubmitting}
                  className={errors.department ? "border-red-500" : ""}
                />
              )}
            />
            {errors.department && (
              <p className="text-sm text-destructive">
                {errors.department.message as string}
              </p>
            )}
          </div>

          {/* Year */}
          <div className="space-y-1">
            <Label htmlFor="year">Year</Label>
            <Controller
              control={control}
              name="year"
              render={({ field }) => (
                <Input
                  {...field}
                  id="year"
                  disabled={isSubmitting}
                  className={errors.year ? "border-red-500" : ""}
                  placeholder="e.g., 2024"
                />
              )}
            />
            {errors.year && (
              <p className="text-sm text-destructive">
                {errors.year.message as string}
              </p>
            )}
          </div>

          {/* Application Status */}
          <div className="space-y-1">
            <Label htmlFor="applicationStatus">Application Status</Label>
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
                    className={errors.applicationStatus ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UAT">UAT</SelectItem>
                    <SelectItem value="PRODUCTION">Production</SelectItem>
                    <SelectItem value="ACTIVE">Active</SelectItem>
                    <SelectItem value="INACTIVE">Inactive</SelectItem>
                    <SelectItem value="DEVELOPMENT">Development</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
            {errors.applicationStatus && (
              <p className="text-sm text-destructive">
                {errors.applicationStatus.message as string}
              </p>
            )}
          </div>

          {/* URL Link */}
          <div className="space-y-1">
            <Label htmlFor="urlLink">URL Link</Label>
            <Controller
              control={control}
              name="urlLink"
              render={({ field }) => (
                <Input
                  {...field}
                  id="urlLink"
                  disabled={isSubmitting}
                  className={errors.urlLink ? "border-red-500" : ""}
                  placeholder="https://example.com"
                />
              )}
            />
            {errors.urlLink && (
              <p className="text-sm text-destructive">
                {errors.urlLink.message as string}
              </p>
            )}
          </div>

          {/* Member Involved */}
          <div className="space-y-1">
            <Label htmlFor="memberInvolved">Members Involved</Label>
            <Controller
              control={control}
              name="memberInvolved"
              render={({ field }) => (
                <Input
                  {...field}
                  id="memberInvolved"
                  disabled={isSubmitting}
                  className={errors.memberInvolved ? "border-red-500" : ""}
                />
              )}
            />
            {errors.memberInvolved && (
              <p className="text-sm text-destructive">
                {errors.memberInvolved.message as string}
              </p>
            )}
          </div>

          {/* Remark */}
          <div className="space-y-1 w-full">
            <Label htmlFor="remark">Remark</Label>
            <Controller
              control={control}
              name="remark"
              render={({ field }) => (
                <Textarea
                  {...field}
                  id="remark"
                  disabled={isSubmitting}
                  className={`w-full min-h-[100px] resize-y ${errors.remark ? "border-red-500" : ""
                    }`}
                  placeholder="Enter your remark here..."
                />
              )}
            />
            {errors.remark && (
              <p className="text-sm text-destructive">
                {errors.remark.message as string}
              </p>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : isCreate ? "Create" : "Update"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}