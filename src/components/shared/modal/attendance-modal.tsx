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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AttendanceReqCreateSchema,
  AttendanceReqUpdateSchema,
  AttendanceCreateForm,
  AttendanceUpdateForm,
} from "@/models/attendance/attendance.schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ModalMode } from "@/constants/AppResource/display-list/status/status";
import { AttendanceModel } from "@/models/attendance/attendances.response";
import { getAttendancesByIdService } from "@/services/dashboard/attendance/attendance.service";
import {
  ATTENDANCE_TYPE_OPTIONS,
  AttendanceStatus,
  LEAVE_REQUEST_OPTIONS,
  LeaveRequest,
} from "@/constants/AppResource/filter/attendance";
import { AttendanceReq } from "@/models/attendance/attendances.request";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  CalendarPlus,
  CalendarCheck,
  Loader2,
  AlertCircle,
} from "lucide-react";
import Loading from "@/components/shared/common/loading";

type ModalAttendanceProps = {
  isOpen: boolean;
  onClose: () => void;
  mode: ModalMode;
  attendanceId?: number;
  isSubmitting?: boolean;
  error?: string | null;
  onSave: (
    data: AttendanceCreateForm | { id: number; updates: AttendanceUpdateForm }
  ) => void;
};

export default function ModalAttendance({
  isOpen,
  onClose,
  mode,
  attendanceId,
  onSave,
  isSubmitting = false,
  error = null,
}: ModalAttendanceProps) {
  const isCreate = mode === ModalMode.CREATE_MODE;

  const [attendanceDetail, setAttendanceDetail] =
    useState<AttendanceModel | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const form = useForm<AttendanceCreateForm | AttendanceUpdateForm>({
    resolver: zodResolver(
      isCreate ? AttendanceReqCreateSchema : AttendanceReqUpdateSchema
    ),
    defaultValues: {
      type: "",
      startDate: "",
      endDate: "",
      reason: "",
      leaveRequest: LeaveRequest.FULL_DAY,
      ...(isCreate ? {} : { id: 0 }),
    },
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = form;

  // Load attendance by ID in update mode
  const loadAttendanceById = useCallback(async () => {
    if (!attendanceId || isCreate) return;

    setIsLoadingData(true);
    try {
      const data = await getAttendancesByIdService(attendanceId);
      setAttendanceDetail(data);

      reset({
        type: data.type || "",
        leaveRequest: data.leaveRequest || LeaveRequest.FULL_DAY,
        startDate: data.startDate || "",
        endDate: data.endDate || "",
        reason: data.reason || "",
      });
    } catch (err) {
      console.error("Failed to fetch attendance:", err);
    } finally {
      setIsLoadingData(false);
    }
  }, [attendanceId, isCreate, reset]);

  const isPending = attendanceDetail?.status === AttendanceStatus.PENDING;
  const canEdit = isCreate || isPending;

  useEffect(() => {
    if (isOpen && !isCreate) {
      loadAttendanceById();
    }
    if (isOpen && isCreate) {
      reset({
        type: "",
        startDate: "",
        leaveRequest: LeaveRequest.FULL_DAY,
        endDate: "",
        reason: "",
      });
      setAttendanceDetail(null);
    }
  }, [isOpen, isCreate, loadAttendanceById, reset]);

  const onSubmit = (data: AttendanceCreateForm | AttendanceUpdateForm) => {
    console.log("Form submitted with data:", data);

    if (isCreate) {
      const formData = data as AttendanceCreateForm;
      const payload: AttendanceReq = {
        type: formData.type,
        leaveRequest: formData.leaveRequest ?? LeaveRequest.FULL_DAY,
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason,
      };
      console.log("Create payload:", payload);
      onSave(payload);
      onClose();
    } else {
      const updateData = data as AttendanceUpdateForm;

      if (!attendanceDetail?.id) {
        console.error("Missing ID for update. Full data:", updateData);
        return;
      }

      const updatePayload: Partial<AttendanceReq> = {
        type: data.type ?? attendanceDetail?.type,
        leaveRequest: data.leaveRequest ?? attendanceDetail?.leaveRequest,
        startDate: data.startDate ?? attendanceDetail?.startDate,
        endDate: data.endDate ?? attendanceDetail?.endDate,
        reason: data.reason ?? attendanceDetail?.reason,
      };

      console.log("Update payload:", updatePayload);
      onSave({ id: attendanceDetail.id, updates: updatePayload });
      onClose();
    }
  };

  const handleClose = () => {
    reset();
    setAttendanceDetail(null);
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
                <CalendarPlus className="h-5 w-5 text-green-600" />
              ) : (
                <CalendarCheck className="h-5 w-5 text-blue-600" />
              )}
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold">
                {isCreate
                  ? "Create Attendance Request"
                  : "Edit Attendance Request"}
              </DialogTitle>
              <DialogDescription className="text-base text-muted-foreground">
                {isCreate
                  ? "Fill in the details to create a new attendance record"
                  : attendanceDetail
                  ? `Update attendance request (${attendanceDetail.type})`
                  : "Loading attendance information..."}
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
            ) : !isCreate && !attendanceDetail ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  No attendance data available
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

                {/* Warning if not editable */}
                {!canEdit && !isCreate && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-md flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-orange-900">
                        Read-Only Mode
                      </p>
                      <p className="text-xs text-orange-700 mt-1">
                        This attendance request cannot be edited because it has
                        been {attendanceDetail?.status?.toLowerCase()}.
                      </p>
                    </div>
                  </div>
                )}

                {/* Hidden ID field for update mode */}
                {!isCreate && attendanceId && (
                  <input type="hidden" value={attendanceId} />
                )}

                {/* Type & Leave Request */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type" className="text-sm font-medium">
                      Type {isCreate && <span className="text-red-500">*</span>}
                    </Label>
                    <Controller
                      control={control}
                      name="type"
                      render={({ field }) => (
                        <Select
                          value={field.value || ""}
                          onValueChange={field.onChange}
                          disabled={!canEdit || isSubmitting}
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
                            {ATTENDANCE_TYPE_OPTIONS.map((s) => (
                              <SelectItem key={s.value} value={s.value}>
                                {s.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.type && (
                      <p className="text-sm text-red-600">
                        {errors.type.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label
                      htmlFor="leaveRequest"
                      className="text-sm font-medium"
                    >
                      Leave Request{" "}
                      {isCreate && <span className="text-red-500">*</span>}
                    </Label>
                    <Controller
                      control={control}
                      name="leaveRequest"
                      render={({ field }) => (
                        <Select
                          value={field.value || LeaveRequest.FULL_DAY}
                          onValueChange={field.onChange}
                          disabled={!canEdit || isSubmitting}
                        >
                          <SelectTrigger
                            id="leaveRequest"
                            className={`transition-colors focus:border-green-500 ${
                              errors.leaveRequest ? "border-red-500" : ""
                            }`}
                          >
                            <SelectValue placeholder="Select request" />
                          </SelectTrigger>
                          <SelectContent>
                            {LEAVE_REQUEST_OPTIONS.map((s) => (
                              <SelectItem key={s.value} value={s.value}>
                                {s.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.leaveRequest && (
                      <p className="text-sm text-red-600">
                        {errors.leaveRequest.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Start Date & End Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="text-sm font-medium">
                      Start Date{" "}
                      {isCreate && <span className="text-red-500">*</span>}
                    </Label>
                    <Controller
                      control={control}
                      name="startDate"
                      render={({ field }) => (
                        <Input
                          type="date"
                          {...field}
                          value={field.value || ""}
                          id="startDate"
                          disabled={!canEdit || isSubmitting}
                          className={`transition-colors focus:border-green-500 ${
                            errors.startDate ? "border-red-500" : ""
                          }`}
                        />
                      )}
                    />
                    {errors.startDate && (
                      <p className="text-sm text-red-600">
                        {errors.startDate.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate" className="text-sm font-medium">
                      End Date{" "}
                      {isCreate && <span className="text-red-500">*</span>}
                    </Label>
                    <Controller
                      control={control}
                      name="endDate"
                      render={({ field }) => (
                        <Input
                          type="date"
                          {...field}
                          value={field.value || ""}
                          id="endDate"
                          disabled={!canEdit || isSubmitting}
                          className={`transition-colors focus:border-green-500 ${
                            errors.endDate ? "border-red-500" : ""
                          }`}
                        />
                      )}
                    />
                    {errors.endDate && (
                      <p className="text-sm text-red-600">
                        {errors.endDate.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Reason */}
                <div className="space-y-2">
                  <Label htmlFor="reason" className="text-sm font-medium">
                    Reason {isCreate && <span className="text-red-500">*</span>}
                  </Label>
                  <Controller
                    control={control}
                    name="reason"
                    render={({ field }) => (
                      <Textarea
                        {...field}
                        value={field.value || ""}
                        id="reason"
                        rows={3}
                        disabled={!canEdit || isSubmitting}
                        placeholder="Please provide the reason for your leave request..."
                        className={`transition-colors focus:border-green-500 resize-y ${
                          errors.reason ? "border-red-500" : ""
                        }`}
                      />
                    )}
                  />
                  {errors.reason && (
                    <p className="text-sm text-red-600">
                      {errors.reason.message}
                    </p>
                  )}
                </div>

                {/* Attendance Info Card - Read Only (edit mode only) */}
                {!isCreate && attendanceDetail && (
                  <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border">
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      Attendance Information (Read Only)
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">
                          Attendance ID:
                        </span>
                        <p className="font-medium">{attendanceDetail.id}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Status:</span>
                        <p className="font-medium">
                          <span
                            className={`inline-flex items-center gap-1 ${
                              attendanceDetail.status ===
                              AttendanceStatus.APPROVED
                                ? "text-green-600"
                                : attendanceDetail.status ===
                                  AttendanceStatus.REJECTED
                                ? "text-red-600"
                                : "text-orange-600"
                            }`}
                          >
                            {attendanceDetail.status || "Pending"}
                          </span>
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Created:</span>
                        <p className="font-medium">
                          {(attendanceDetail as any).createdAt || "N/A"}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Last Updated:
                        </span>
                        <p className="font-medium">
                          {(attendanceDetail as any).updatedAt || "N/A"}
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
                {isCreate ? "Creating request..." : "Updating request..."}
              </>
            ) : !canEdit && !isCreate ? (
              <>
                <AlertCircle className="h-3 w-3 text-orange-500" />
                Cannot edit {attendanceDetail?.status?.toLowerCase()} request
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
              disabled={isSubmitting || (!isCreate && (!isDirty || !canEdit))}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isCreate ? "Creating..." : "Updating..."}
                </>
              ) : isCreate ? (
                "Create Request"
              ) : (
                "Update Request"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
