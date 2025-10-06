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
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, FilePenLine, Loader2 } from "lucide-react";
import Loading from "@/components/shared/common/loading";
import { ModalMode } from "@/constants/AppResource/display-list/enum/mode";

type Props = {
  mode: ModalMode;
  traineeId: number | null;
  onClose: () => void;
  isOpen: boolean;
  isSubmitting?: boolean;
  error?: string | null;
  onSave: (data: CreateTraineeForm | UpdateTraineeForm) => void;
};

export default function ModalTrainee({
  isOpen,
  onClose,
  traineeId,
  mode,
  onSave,
  isSubmitting = false,
  error = null,
}: Props) {
  const isCreate = mode === ModalMode.CREATE_MODE;
  const schema = isCreate ? CreateTraineeSchema : UpdateTraineeSchema;

  const [traineeDetail, setTraineeDetail] = useState<UpdateTraineeForm | null>(
    null
  );
  const [isLoadingData, setIsLoadingData] = useState(false);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
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

    setIsLoadingData(true);
    try {
      const response = await getTraineeByIdService(traineeId);
      setTraineeDetail(response);
    } catch (error) {
      console.error("Failed to fetch trainee by id", traineeId, error);
    } finally {
      setIsLoadingData(false);
    }
  }, [traineeId, isCreate]);

  useEffect(() => {
    if (isOpen && !isCreate) {
      loadTraineeById();
    }
  }, [isOpen, isCreate, loadTraineeById]);

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

  const handleClose = () => {
    reset();
    setTraineeDetail(null);
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
                <FileText className="h-5 w-5 text-green-600" />
              ) : (
                <FilePenLine className="h-5 w-5 text-blue-600" />
              )}
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold">
                {isCreate ? "Create Trainee Report" : "Edit Trainee Report"}
              </DialogTitle>
              <DialogDescription className="text-base text-muted-foreground">
                {isCreate
                  ? "Fill out the form to create a new trainee report"
                  : traineeDetail
                  ? "Update trainee report information"
                  : "Loading trainee report..."}
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
            ) : !isCreate && !traineeDetail ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No trainee data available
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

                {/* Report Remark */}
                <div className="space-y-2">
                  <Label htmlFor="reportRemark" className="text-sm font-medium">
                    Report Remark{" "}
                    {isCreate && <span className="text-red-500">*</span>}
                  </Label>
                  <Controller
                    control={control}
                    name="reportRemark"
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        id="reportRemark"
                        disabled={isSubmitting}
                        rows={4}
                        placeholder="Enter your report remark here..."
                        className={`transition-colors focus:border-green-500 resize-y ${
                          errors.reportRemark ? "border-red-500" : ""
                        }`}
                      />
                    )}
                  />
                  {errors.reportRemark && (
                    <p className="text-sm text-red-600">
                      {errors.reportRemark.message as string}
                    </p>
                  )}
                </div>

                {/* Challenge */}
                <div className="space-y-2">
                  <Label htmlFor="challenge" className="text-sm font-medium">
                    Challenge
                  </Label>
                  <Controller
                    control={control}
                    name="challenge"
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        id="challenge"
                        disabled={isSubmitting}
                        rows={4}
                        placeholder="Enter challenges faced during training..."
                        className={`transition-colors focus:border-green-500 resize-y ${
                          errors.challenge ? "border-red-500" : ""
                        }`}
                      />
                    )}
                  />
                  {errors.challenge && (
                    <p className="text-sm text-red-600">
                      {errors.challenge.message as string}
                    </p>
                  )}
                </div>

                {/* Recommend */}
                <div className="space-y-2">
                  <Label htmlFor="recommend" className="text-sm font-medium">
                    Recommendation
                  </Label>
                  <Controller
                    control={control}
                    name="recommend"
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        id="recommend"
                        disabled={isSubmitting}
                        rows={4}
                        placeholder="Enter recommendations for improvement..."
                        className={`transition-colors focus:border-green-500 resize-y ${
                          errors.recommend ? "border-red-500" : ""
                        }`}
                      />
                    )}
                  />
                  {errors.recommend && (
                    <p className="text-sm text-red-600">
                      {errors.recommend.message as string}
                    </p>
                  )}
                </div>

                {/* Trainee Info Card - Read Only (edit mode only) */}
                {!isCreate && traineeDetail && (
                  <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border">
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      Report Information (Read Only)
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">
                          Report ID:
                        </span>
                        <p className="font-medium">{traineeDetail.id}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Status:</span>
                        <p className="font-medium">
                          {(traineeDetail as any).status || "Active"}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Created:</span>
                        <p className="font-medium">
                          {(traineeDetail as any).createdAt || "N/A"}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Last Updated:
                        </span>
                        <p className="font-medium">
                          {(traineeDetail as any).updatedAt || "N/A"}
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
                {isCreate ? "Creating report..." : "Updating report..."}
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
                "Create Report"
              ) : (
                "Update Report"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
