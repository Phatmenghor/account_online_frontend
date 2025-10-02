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
import { AttendanceReq } from "@/models/attendance/attendances.request";
import { ATTENDANCE_TYPE_OPTIONS } from "@/constants/AppResource/filter/attendance";

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
    defaultValues: isCreate
      ? { type: "", startDate: "", endDate: "", reason: "" }
      : undefined,
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
        type: data.type,
        startDate: data.startDate,
        endDate: data.endDate,
        reason: data.reason,
      });
    } catch (err) {
      console.error("Failed to fetch attendance:", err);
    }
  }, [attendanceId, isCreate, reset]);

  useEffect(() => {
    if (isOpen && !isCreate) loadAttendanceById();
    if (isOpen && isCreate) {
      reset({ type: "", startDate: "", endDate: "", reason: "" });
    }
  }, [isOpen, isCreate, loadAttendanceById, reset]);

  const onSubmit = (data: AttendanceCreateForm | AttendanceUpdateForm) => {
    if (isCreate) {
      const payload: AttendanceReq = data as AttendanceCreateForm;
      onSave(payload);
    } else {
      const updateData = data as AttendanceUpdateForm;
      if (!updateData.id) return console.error("Missing ID for update");

      const payload: Partial<AttendanceReq> = {
        type: updateData.type,
        startDate: updateData.startDate,
        endDate: updateData.endDate,
        reason: updateData.reason,
      };
      onSave({ id: updateData.id, updates: payload });
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
          {!isCreate && (
            <Controller
              control={control}
              name="id"
              render={({ field }) => <input type="hidden" {...field} />}
            />
          )}

          {/* Type */}
          <div className="space-y-1">
            <Label htmlFor="type">Type *</Label>
            <Controller
              control={control}
              name="type"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder="Select status" />
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

          {/* Start Date */}
          <div className="space-y-1">
            <Label htmlFor="startDate">Start Date *</Label>
            <Controller
              control={control}
              name="startDate"
              render={({ field }) => (
                <Input
                  type="date"
                  {...field}
                  id="startDate"
                  disabled={isSubmitting}
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
            <Label htmlFor="endDate">End Date *</Label>
            <Controller
              control={control}
              name="endDate"
              render={({ field }) => (
                <Input
                  type="date"
                  {...field}
                  id="endDate"
                  disabled={isSubmitting}
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
            <Label htmlFor="reason">Reason *</Label>
            <Controller
              control={control}
              name="reason"
              render={({ field }) => (
                <Textarea
                  {...field}
                  id="reason"
                  disabled={isSubmitting}
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
