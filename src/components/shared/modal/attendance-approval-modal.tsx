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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "next-intl";
import { AttendanceModel } from "@/models/attendance/attendances.response";
import {
  AttendanceStatus,
  ATTENDANCE_STATUS_OPTIONS,
} from "@/constants/AppResource/filter/attendance";
import {
  approvalAttendanceService,
  cancelAttendanceService,
  getAttendancesByIdService,
} from "@/services/dashboard/attendance/attendance.service";
import { AttendanceApproveReq } from "@/models/attendance/attendances.request";

type ModalApprovalProps = {
  isOpen: boolean;
  onClose: () => void;
  attendanceId: number;
  onSuccess?: () => void;
};

type ApprovalForm = {
  status: AttendanceStatus;
  approvalNotes: string;
};

export default function ModalAttendanceApprovalOrCancel({
  isOpen,
  onClose,
  attendanceId,
  onSuccess,
}: ModalApprovalProps) {
  const t = useTranslations("attendance.modal");
  const [attendance, setAttendance] = useState<AttendanceModel | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ApprovalForm>({
    defaultValues: {
      status: AttendanceStatus.APPROVED,
      approvalNotes: "",
    },
  });

  const { control, handleSubmit, reset } = form;

  const loadAttendance = useCallback(async () => {
    if (!attendanceId) return;
    try {
      const data = await getAttendancesByIdService(attendanceId);
      setAttendance(data);
    } catch (err) {
      console.error("Failed to fetch attendance:", err);
    }
  }, [attendanceId]);

  useEffect(() => {
    if (isOpen) {
      loadAttendance();
      reset({ status: AttendanceStatus.APPROVED, approvalNotes: "" });
    }
  }, [isOpen, loadAttendance, reset]);

  const handleApproval = async (data: ApprovalForm) => {
    if (!attendance) return;
    setIsSubmitting(true);
    try {
      await approvalAttendanceService(attendance.id, {
        status: data.status,
        approvalNotes: data.approvalNotes,
      } as AttendanceApproveReq);
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancelAttendance = async () => {
    if (!attendance) return;
    setIsSubmitting(true);
    try {
      await cancelAttendanceService(attendance.id);
      onSuccess?.();
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-full p-6 rounded-lg shadow-lg">
        <DialogHeader className="pb-4 border-b">
          <DialogTitle className="text-lg font-semibold">
            {t("approvalOrCancelTitle")}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground">
            {t("approvalOrCancelDesc")}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(handleApproval)}
          className="mt-4 space-y-4"
        >
          {/* Status */}
          <div className="space-y-1">
            <Label htmlFor="status">{t("status")}</Label>
            <Controller
              control={control}
              name="status"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                  disabled={isSubmitting}
                >
                  <SelectTrigger id="status">
                    <SelectValue placeholder={t("selectStatus")} />
                  </SelectTrigger>
                  <SelectContent>
                    {ATTENDANCE_STATUS_OPTIONS.filter(
                      (s) =>
                        s.value === AttendanceStatus.APPROVED ||
                        s.value === AttendanceStatus.REJECTED
                    ).map((s) => (
                      <SelectItem key={s.value} value={s.value}>
                        {s.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>

          {/* Approval Notes */}
          <div className="space-y-1">
            <Label htmlFor="approvalNotes">{t("approvalNotes")}</Label>
            <Controller
              control={control}
              name="approvalNotes"
              render={({ field }) => (
                <Textarea
                  {...field}
                  id="approvalNotes"
                  disabled={isSubmitting}
                  placeholder={t("approvalNotesPlaceholder")}
                  className="resize-none"
                  rows={4}
                />
              )}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => onClose()}
              disabled={
                isSubmitting ||
                !attendance ||
                attendance.status === AttendanceStatus.CANCELLED
              }
            >
              {t("discard")}
            </Button>
            <Button
              variant="destructive"
              type="button"
              onClick={handleCancelAttendance}
              disabled={
                isSubmitting ||
                !attendance ||
                attendance.status === AttendanceStatus.CANCELLED
              }
            >
              {t("reject")}
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {t("approval")}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
