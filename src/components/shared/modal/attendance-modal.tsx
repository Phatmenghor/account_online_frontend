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

type ModalAttendanceProps = {
  isOpen: boolean;
  onClose: () => void;
  mode: ModalMode;
  attendanceId?: number;
  isSubmitting?: boolean;
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
}: ModalAttendanceProps) {
  const isCreate = mode === ModalMode.CREATE_MODE;

  const [attendanceDetail, setAttendanceDetail] =
    useState<AttendanceModel | null>(null);

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
      ...(isCreate ? {} : { id: 0 }), // Only include id for update mode
    },
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = form;

  // Load attendance by ID in update mode
  const loadAttendanceById = useCallback(async () => {
    if (!attendanceId || isCreate) return;
    try {
      const data = await getAttendancesByIdService(attendanceId);
      setAttendanceDetail(data);

      reset({
        id: data.id,
        type: data.type || "",
        leaveRequest: data.leaveRequest || LeaveRequest.FULL_DAY,
        startDate: data.startDate || "",
        endDate: data.endDate || "",
        reason: data.reason || "",
      });
    } catch (err) {
      console.error("Failed to fetch attendance:", err);
    }
  }, [attendanceId, isCreate, reset]);

  const isPending = attendanceDetail?.status === AttendanceStatus.PENDING;

  // check if we are creating or pending update
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

      // Validate that we have an ID
      if (!updateData.id) {
        console.error("Missing ID for update. Full data:", updateData);
        return;
      }

      // Build the update payload with proper typing
      const updatePayload: Partial<AttendanceReq> = {
        type: data.type ?? attendanceDetail?.type,
        leaveRequest: data.leaveRequest ?? attendanceDetail?.leaveRequest,
        startDate: data.startDate ?? attendanceDetail?.startDate,
        endDate: data.endDate ?? attendanceDetail?.endDate,
        reason: data.reason ?? attendanceDetail?.reason,
      };

      console.log("Update payload:", updatePayload);
      onSave({ id: updateData.id, updates: updatePayload });
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isCreate ? "Create Attendance" : "Edit Attendance"}
          </DialogTitle>
          <DialogDescription>
            {isCreate
              ? "Fill in the details to create a new attendance record."
              : "Update the attendance details below."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          {/* Hidden ID field for update mode */}
          {!isCreate && (
            <Controller
              control={control}
              name="id"
              render={({ field }) => (
                <input
                  type="hidden"
                  {...field}
                  value={field.value || attendanceId || 0}
                />
              )}
            />
          )}

          {/* Type */}
          <div className="space-y-1">
            <Label htmlFor="type">
              Type {isCreate && <span className="text-red-700">*</span>}
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
                  <SelectTrigger id="type">
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
              <p className="text-destructive text-sm">{errors.type.message}</p>
            )}
          </div>

          {/* Leave request */}
          <div className="space-y-1">
            <Label htmlFor="leaveRequest">
              Leave Request{" "}
              {isCreate && <span className="text-red-700">*</span>}
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
                  <SelectTrigger id="leaveRequest">
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
              <p className="text-destructive text-sm">
                {errors.leaveRequest.message}
              </p>
            )}
          </div>

          {/* Start Date */}
          <div className="space-y-1">
            <Label htmlFor="startDate">
              Start Date {isCreate && <span className="text-red-700">*</span>}
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
                  className={errors.startDate ? "border-red-500" : ""}
                />
              )}
            />
            {errors.startDate && (
              <p className="text-destructive text-sm">
                {errors.startDate.message}
              </p>
            )}
          </div>

          {/* End Date */}
          <div className="space-y-1">
            <Label htmlFor="endDate">
              End Date {isCreate && <span className="text-red-700">*</span>}
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
                  className={errors.endDate ? "border-red-500" : ""}
                />
              )}
            />
            {errors.endDate && (
              <p className="text-destructive text-sm">
                {errors.endDate.message}
              </p>
            )}
          </div>

          {/* Reason */}
          <div className="space-y-1">
            <Label htmlFor="reason">
              Reason {isCreate && <span className="text-red-700">*</span>}
            </Label>
            <Controller
              control={control}
              name="reason"
              render={({ field }) => (
                <Textarea
                  {...field}
                  value={field.value || ""}
                  id="reason"
                  disabled={!canEdit || isSubmitting}
                  className={errors.reason ? "border-red-500" : ""}
                />
              )}
            />
            {errors.reason && (
              <p className="text-destructive text-sm">
                {errors.reason.message}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isCreate ? "Create" : "Update"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
