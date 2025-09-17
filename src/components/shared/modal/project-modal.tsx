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

type Props = {
  mode: ModalMode;
  projectId: number | null;
  onClose: () => void;
  isOpen: boolean;
  isSubmitting?: boolean;
  onSave: (data: CreateProjectForm | UpdateProjectForm) => void;
};

export default function ModalProject({
  isOpen,
  onClose,
  projectId,
  mode,
  onSave,
  isSubmitting = false,
}: Props) {
  const isCreate = mode === ModalMode.CREATE_MODE;
  const schema = isCreate ? CreateProjectSchema : UpdateProjectSchema;

  const [projectDetail, setProjectDetail] = useState<UpdateProjectForm | null>(
    null
  );

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
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
    } as any,
  });

  // Load project if editing
  const loadProjectById = useCallback(async () => {
    if (!projectId) return;
    try {
      const response = await getProjectByIdService(projectId);
      setProjectDetail(response);
    } catch (error) {
      console.error("Failed to fetch project by id", projectId, error);
    }
  }, [projectId, isCreate]);

  useEffect(() => {
    loadProjectById();
  }, [loadProjectById]);

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
            }
          : projectDetail ?? {}
      );
    }
  }, [isOpen, isCreate, projectDetail, reset]);

  const onSubmit = (data: CreateProjectForm | UpdateProjectForm) => {
    onSave(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isCreate ? "Create Project" : "Edit Project"}
          </DialogTitle>
          <DialogDescription>
            {isCreate
              ? "Fill out the form to create a new project."
              : "Update project information below."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2 pt-4">
          {/* Project Name */}
          <div className="space-y-1">
            <Label htmlFor="projectName">Project Name *</Label>
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

          {/* Type */}
          <div className="space-y-1">
            <Label htmlFor="type">Type *</Label>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Input
                  {...field}
                  id="type"
                  disabled={isSubmitting}
                  className={errors.type ? "border-red-500" : ""}
                />
              )}
            />
            {errors.type && (
              <p className="text-sm text-destructive">
                {errors.type.message as string}
              </p>
            )}
          </div>

          {/* Host Server */}
          <div className="space-y-1">
            <Label htmlFor="hostServer">Host Server *</Label>
            <Controller
              control={control}
              name="hostServer"
              render={({ field }) => (
                <Input
                  {...field}
                  id="hostServer"
                  disabled={isSubmitting}
                  className={errors.hostServer ? "border-red-500" : ""}
                />
              )}
            />
            {errors.hostServer && (
              <p className="text-sm text-destructive">
                {errors.hostServer.message as string}
              </p>
            )}
          </div>

          {/* Host Port */}
          <div className="space-y-1">
            <Label htmlFor="hostPort">Host Port *</Label>
            <Controller
              control={control}
              name="hostPort"
              render={({ field }) => (
                <Input
                  {...field}
                  id="hostPort"
                  type="text" // keep as text
                  disabled={isSubmitting}
                  className={errors.hostPort ? "border-red-500" : ""}
                />
              )}
            />

            {errors.hostPort && (
              <p className="text-sm text-destructive">
                {errors.hostPort.message as string}
              </p>
            )}
          </div>

          {/* DB Name */}
          <div className="space-y-1">
            <Label htmlFor="dbName">Database Name *</Label>
            <Controller
              control={control}
              name="dbName"
              render={({ field }) => (
                <Input
                  {...field}
                  id="dbName"
                  disabled={isSubmitting}
                  className={errors.dbName ? "border-red-500" : ""}
                />
              )}
            />
            {errors.dbName && (
              <p className="text-sm text-destructive">
                {errors.dbName.message as string}
              </p>
            )}
          </div>

          {/* DB Type */}
          <div className="space-y-1">
            <Label htmlFor="dbType">Database Type *</Label>
            <Controller
              control={control}
              name="dbType"
              render={({ field }) => (
                <Input
                  {...field}
                  id="dbType"
                  disabled={isSubmitting}
                  className={errors.dbType ? "border-red-500" : ""}
                />
              )}
            />
            {errors.dbType && (
              <p className="text-sm text-destructive">
                {errors.dbType.message as string}
              </p>
            )}
          </div>

          {/* DB Server */}
          <div className="space-y-1">
            <Label htmlFor="dbServer">Database Server *</Label>
            <Controller
              control={control}
              name="dbServer"
              render={({ field }) => (
                <Input
                  {...field}
                  id="dbServer"
                  disabled={isSubmitting}
                  className={errors.dbServer ? "border-red-500" : ""}
                />
              )}
            />
            {errors.dbServer && (
              <p className="text-sm text-destructive">
                {errors.dbServer.message as string}
              </p>
            )}
          </div>

          {/* Member Involved */}
          {isCreate && (
            <div className="space-y-1">
              <Label htmlFor="memberInvolved">Members Involved *</Label>
              <Controller
                control={control}
                name={"memberInvolved" as keyof CreateProjectForm}
                render={({ field }) => (
                  <Input
                    {...field}
                    id="memberInvolved"
                    disabled={isSubmitting}
                    className={
                      (errors as Partial<FieldErrors<CreateProjectForm>>)
                        .memberInvolved
                        ? "border-red-500"
                        : ""
                    }
                  />
                )}
              />

              {(errors as Partial<FieldErrors<CreateProjectForm>>)
                .memberInvolved && (
                <p className="text-sm text-destructive">
                  {(errors as any).memberInvolved?.message as string}
                </p>
              )}
            </div>
          )}

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
                  className={`w-full min-h-[100px] resize-y ${
                    errors.remark ? "border-red-500" : ""
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
