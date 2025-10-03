"use client";

import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Label } from "@/components/ui/label";
import { useTranslations } from "next-intl";
import { AttendanceModel } from "@/models/attendance/attendances.response";

interface AttendanceApprovalViewModalProps {
  attendance?: AttendanceModel | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AttendanceApprovalViewModal({
  attendance,
  isOpen,
  onClose,
}: AttendanceApprovalViewModalProps) {
  const t = useTranslations("attendance");

  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "approved":
        return "bg-green-100 text-green-800 border-green-200";
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "rejected":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl h-[90vh] p-0 flex flex-col">
        <DialogHeader className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
          <div className="flex-1">
            <DialogTitle className="text-xl font-semibold">
              {t("modal.viewTitle") || "Attendance Request"}
            </DialogTitle>
            <DialogDescription className="text-base text-muted-foreground">
              {attendance
                ? `${t("modal.viewDesc") || "Attendance request details for"} ${
                    attendance.userFullName || attendance.userIdCard
                  }`
                : t("modal.noUserData") || "No attendance data available"}
            </DialogDescription>
            {attendance && (
              <Badge
                className={`capitalize ${getStatusColor(attendance.status)}`}
              >
                {attendance.status || "N/A"}
              </Badge>
            )}
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 min-h-0">
          <div className="p-6 space-y-6">
            {attendance ? (
              <>
                {/* User Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    {t("modal.personalInfo") || "User Information"}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label className="text-sm font-medium text-muted-foreground">
                        {t("table-header-attendance.userFullName") ||
                          "Full Name:"}
                      </Label>
                      <span>{attendance.userFullName || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <Label className="text-sm font-medium text-muted-foreground">
                        {t("table-header-attendance.userIdCard") || "ID Card:"}
                      </Label>
                      <span>{attendance.userIdCard || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <Label className="text-sm font-medium text-muted-foreground">
                        {t("table-header-attendance.userEmail") || "Email:"}
                      </Label>
                      <span>{attendance.userEmail || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <Label className="text-sm font-medium text-muted-foreground">
                        {t("table-header-attendance.position") || "Position:"}
                      </Label>
                      <span>{attendance.userPosition || "N/A"}</span>
                    </div>
                  </div>
                </div>

                {/* Attendance Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    {t("modal.attendanceInfo") || "Attendance Information"}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label className="text-sm font-medium text-muted-foreground">
                        {t("table-header-attendance.type") || "Type:"}
                      </Label>
                      <span>{attendance.type || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <Label className="text-sm font-medium text-muted-foreground">
                        {t("table-header-attendance.leaveRequest") ||
                          "Leave Request:"}
                      </Label>
                      <span>{attendance.leaveRequest || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <Label className="text-sm font-medium text-muted-foreground">
                        {t("table-header-attendance.period") || "Period:"}
                      </Label>
                      <span>{`${formatDate(
                        attendance.startDate
                      )} → ${formatDate(attendance.endDate)}`}</span>
                    </div>
                    <div className="flex justify-between">
                      <Label className="text-sm font-medium text-muted-foreground">
                        {t("table-header-attendance.totalDays") ||
                          "Total Days:"}
                      </Label>
                      <span>{attendance.totalDays}</span>
                    </div>
                    <div className="flex justify-between">
                      <Label className="text-sm font-medium text-muted-foreground">
                        {t("table-header-attendance.reason") || "Reason:"}
                      </Label>
                      <span>{attendance.reason || "N/A"}</span>
                    </div>
                  </div>
                </div>

                {/* Approval Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    {t("modal.approvalInfo") || "Approval Information"}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <Label className="text-sm font-medium text-muted-foreground">
                        {t("table-header-attendance.approvedBy") ||
                          "Approved By:"}
                      </Label>
                      <span>{attendance.approvedByFullName || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <Label className="text-sm font-medium text-muted-foreground">
                        {t("table-header-attendance.approvedAt") ||
                          "Approved At:"}
                      </Label>
                      <span>{formatDate(attendance.approvedAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <Label className="text-sm font-medium text-muted-foreground">
                        {t("table-header-attendance.approvalNotes") ||
                          "Approval Notes:"}
                      </Label>
                      <span>{attendance.approvalNotes || "N/A"}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  {t("modal.noUserData") || "No attendance data available"}
                </p>
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t bg-muted/30 flex-shrink-0">
          <Button variant="outline" onClick={onClose}>
            {t("modal.close") || "Close"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
