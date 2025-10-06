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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ClipboardCheck,
  Loader2,
  AlertCircle,
  CheckCircle,
  XCircle,
} from "lucide-react";
import Loading from "@/components/shared/common/loading";

type ModalApprovalProps = {
  isOpen: boolean;
  onClose: () => void;
  attendanceId: number;
  onSuccess?: () => void;
  error?: string | null;
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
  error = null,
}: ModalApprovalProps) {
  const t = useTranslations("attendance.modal");
  const [attendance, setAttendance] = useState<AttendanceModel | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const form = useForm<ApprovalForm>({
    defaultValues: {
      status: AttendanceStatus.APPROVED,
      approvalNotes: "",
    },
  });

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { isDirty },
  } = form;
  const selectedStatus = watch("status");

  const loadAttendance = useCallback(async () => {
    if (!attendanceId) return;

    setIsLoadingData(true);
    try {
      const data = await getAttendancesByIdService(attendanceId);
      setAttendance(data);
    } catch (err) {
      console.error("Failed to fetch attendance:", err);
    } finally {
      setIsLoadingData(false);
    }
  }, [attendanceId]);

  useEffect(() => {
    if (isOpen) {
      loadAttendance();
      reset({ status: AttendanceStatus.APPROVED, approvalNotes: "" });
    } else {
      setAttendance(null);
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

  const handleClose = () => {
    reset();
    setAttendance(null);
    onClose();
  };

  const isCancelled = attendance?.status === AttendanceStatus.CANCELLED;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl h-[90vh] p-0 gap-0 flex flex-col">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
          <div className="flex items-center gap-4 pr-8">
            <div className="p-2 rounded-full bg-purple-100">
              <ClipboardCheck className="h-5 w-5 text-purple-600" />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold">
                {t("approvalOrCancelTitle")}
              </DialogTitle>
              <DialogDescription className="text-base text-muted-foreground">
                {attendance
                  ? `Review and process attendance request for ${attendance.type}`
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
            ) : !attendance ? (
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

                {/* Warning if cancelled */}
                {isCancelled && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-md flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-orange-900">
                        Request Already Cancelled
                      </p>
                      <p className="text-xs text-orange-700 mt-1">
                        This attendance request has been cancelled and cannot be
                        processed.
                      </p>
                    </div>
                  </div>
                )}

                {/* Attendance Details Card */}
                <div className="p-4 bg-muted/30 rounded-lg border border-border">
                  <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 bg-primary rounded-full"></div>
                    Attendance Request Details
                  </h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Employee:</span>
                      <p className="font-medium">
                        {attendance.userIdCard || "N/A"}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Type:</span>
                      <p className="font-medium">{attendance.type}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Leave Request:
                      </span>
                      <p className="font-medium">{attendance.leaveRequest}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">
                        Current Status:
                      </span>
                      <p className="font-medium">
                        <span
                          className={`inline-flex items-center gap-1 ${
                            attendance.status === AttendanceStatus.APPROVED
                              ? "text-green-600"
                              : attendance.status === AttendanceStatus.REJECTED
                              ? "text-red-600"
                              : attendance.status === AttendanceStatus.CANCELLED
                              ? "text-gray-600"
                              : "text-orange-600"
                          }`}
                        >
                          {attendance.status}
                        </span>
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Start Date:</span>
                      <p className="font-medium">{attendance.startDate}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">End Date:</span>
                      <p className="font-medium">{attendance.endDate}</p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-muted-foreground">Reason:</span>
                      <p className="font-medium mt-1">{attendance.reason}</p>
                    </div>
                  </div>
                </div>

                {/* Approval Form */}
                <div className="space-y-4">
                  {/* Status */}
                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-sm font-medium">
                      Decision <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      control={control}
                      name="status"
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isSubmitting || isCancelled}
                        >
                          <SelectTrigger
                            id="status"
                            className="transition-colors focus:border-green-500"
                          >
                            <SelectValue placeholder={t("selectStatus")} />
                          </SelectTrigger>
                          <SelectContent>
                            {ATTENDANCE_STATUS_OPTIONS.filter(
                              (s) =>
                                s.value === AttendanceStatus.APPROVED ||
                                s.value === AttendanceStatus.REJECTED
                            ).map((s) => (
                              <SelectItem key={s.value} value={s.value}>
                                <div className="flex items-center gap-2">
                                  {s.value === AttendanceStatus.APPROVED ? (
                                    <CheckCircle className="h-4 w-4 text-green-600" />
                                  ) : (
                                    <XCircle className="h-4 w-4 text-red-600" />
                                  )}
                                  {s.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>

                  {/* Approval Notes */}
                  <div className="space-y-2">
                    <Label
                      htmlFor="approvalNotes"
                      className="text-sm font-medium"
                    >
                      Notes
                    </Label>
                    <Controller
                      control={control}
                      name="approvalNotes"
                      render={({ field }) => (
                        <Textarea
                          {...field}
                          id="approvalNotes"
                          disabled={isSubmitting || isCancelled}
                          placeholder={t("approvalNotesPlaceholder")}
                          className="transition-colors focus:border-green-500 resize-y"
                          rows={3}
                        />
                      )}
                    />
                  </div>
                </div>
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
                Processing request...
              </>
            ) : isCancelled ? (
              <>
                <AlertCircle className="h-3 w-3 text-orange-500" />
                Request already cancelled
              </>
            ) : isDirty ? (
              <>
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                You have unsaved changes
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Ready to process
              </>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              {t("discard")}
            </Button>
            <Button
              variant="destructive"
              type="button"
              onClick={handleCancelAttendance}
              disabled={isSubmitting || !attendance || isCancelled}
              className="min-w-[100px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Cancelling...
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Cancel Request
                </>
              )}
            </Button>
            <Button
              onClick={handleSubmit(handleApproval)}
              disabled={isSubmitting || isCancelled}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : selectedStatus === AttendanceStatus.APPROVED ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Approve
                </>
              ) : (
                <>
                  <XCircle className="mr-2 h-4 w-4" />
                  Reject
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
