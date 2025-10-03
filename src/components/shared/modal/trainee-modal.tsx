"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  CreateTraineeSchema,
  UpdateTraineeSchema,
  CreateTraineeForm,
  UpdateTraineeForm,
} from "@/models/trainee/trainee.schema";
import { getTraineeByIdService } from "@/services/dashboard/trainee/trainee.service";
import { ModalMode } from "@/constants/AppResource/display-list/status/status";
import { Textarea } from "@/components/ui/textarea";

type Props = {
  mode: ModalMode;
  traineeId: number | null;
  onClose: () => void;
  isOpen: boolean;
  isSubmitting?: boolean;
  onSave: (data: CreateTraineeForm | UpdateTraineeForm) => void;
};

export default function ModalTrainee({
  isOpen,
  onClose,
  traineeId,
  mode,
  onSave,
  isSubmitting = false,
}: Props) {
  const isCreate = mode === ModalMode.CREATE_MODE;
  const schema = isCreate ? CreateTraineeSchema : UpdateTraineeSchema;

  const [traineeDetail, setTraineeDetail] = useState<UpdateTraineeForm | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateTraineeForm | UpdateTraineeForm>({
    resolver: zodResolver(schema as any),
    defaultValues: {
      id: undefined,
      reportRemark: "",
      challenge: "",
      recommend: "",
    } as any,
  });

  // Load trainee if editing
  const loadTraineeById = useCallback(async () => {
    if (!traineeId || isCreate) return;
    try {
      const response = await getTraineeByIdService(traineeId);
      setTraineeDetail(response);
    } catch (error) {
      console.error("Failed to fetch trainee by id", traineeId, error);
    }
  }, [traineeId, isCreate]);

  useEffect(() => {
    loadTraineeById();
  }, [loadTraineeById]);

  // Reset form on open
  useEffect(() => {
    if (isOpen) {
      reset(
        isCreate
          ? {
              reportRemark: "",
              challenge: "",
              recommend: "",
            }
          : traineeDetail ?? {}
      );
    }
  }, [isOpen, isCreate, traineeDetail, reset]);

  const onSubmit = (data: CreateTraineeForm | UpdateTraineeForm) => {
    onSave(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isCreate ? "Create Trainee Report" : "Edit Trainee Report"}
          </DialogTitle>
          <DialogDescription>
            {isCreate
              ? "Fill out the form to create a new trainee report."
              : "Update trainee report information below."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2 pt-4">
          {/* Report Remark */}
          <div className="space-y-1 w-full">
            <Label htmlFor="reportRemark">
              Report Remark{" "}
              {isCreate ? <span className="text-red-700">*</span> : ""}
            </Label>
            <Controller
              control={control}
              name="reportRemark"
              render={({ field }) => (
                <Textarea
                  {...field}
                  id="reportRemark"
                  disabled={isSubmitting}
                  className={`w-full min-h-[100px] resize-y ${
                    errors.reportRemark ? "border-red-500" : ""
                  }`}
                  placeholder="Enter your report remark here..."
                />
              )}
            />
            {errors.reportRemark && (
              <p className="text-sm text-destructive">
                {errors.reportRemark.message as string}
              </p>
            )}
          </div>

          {/* Challenge */}
          <div className="space-y-1 w-full">
            <Label htmlFor="challenge">Challenge</Label>
            <Controller
              control={control}
              name="challenge"
              render={({ field }) => (
                <Textarea
                  {...field}
                  id="challenge"
                  disabled={isSubmitting}
                  className={`w-full min-h-[100px] resize-y ${
                    errors.challenge ? "border-red-500" : ""
                  }`}
                  placeholder="Enter challenges faced..."
                />
              )}
            />
            {errors.challenge && (
              <p className="text-sm text-destructive">
                {errors.challenge.message as string}
              </p>
            )}
          </div>

          {/* Recommend */}
          <div className="space-y-1 w-full">
            <Label htmlFor="recommend">Recommend</Label>
            <Controller
              control={control}
              name="recommend"
              render={({ field }) => (
                <Textarea
                  {...field}
                  id="recommend"
                  disabled={isSubmitting}
                  className={`w-full min-h-[100px] resize-y ${
                    errors.recommend ? "border-red-500" : ""
                  }`}
                  placeholder="Enter recommendations..."
                />
              )}
            />
            {errors.recommend && (
              <p className="text-sm text-destructive">
                {errors.recommend.message as string}
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