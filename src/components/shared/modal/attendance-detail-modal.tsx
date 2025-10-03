"use client";

import React from "react";
import {
  User,
  Mail,
  Calendar,
  Shield,
  Briefcase,
  Award,
  Crown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
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
import { AttendanceModel } from "@/models/attendance/attendances.response";
import { AttendanceStatus } from "@/constants/AppResource/filter/attendance";

interface AttendanceDetailModalProps {
  attendance?: AttendanceModel | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AttendanceDetailModal({
  attendance,
  isOpen,
  onClose,
}: AttendanceDetailModalProps) {
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

  const getStatusColor = (status?: string) => {
    switch (status) {
      case AttendanceStatus.APPROVED:
        return "bg-green-100 text-green-800 border-green-200";
      case AttendanceStatus.PENDING:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case AttendanceStatus.REJECTED:
        return "bg-red-100 text-red-800 border-red-200";
      case AttendanceStatus.CANCELLED:
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl h-[90vh] p-0 gap-0 flex flex-col">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
          <div className="flex items-center gap-4 pr-8">
            <Avatar className="h-12 w-12">
              <AvatarFallback className="text-lg bg-primary/10 text-primary">
                {attendance?.userFullName?.[0] ||
                  attendance?.userEmail?.[0] ||
                  "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold">
                Attendance Details
              </DialogTitle>
              <DialogDescription className="text-base text-muted-foreground">
                {attendance
                  ? `Details for ${
                      attendance.userFullName || attendance.userEmail
                    }`
                  : "Attendance information"}
              </DialogDescription>
              <Badge className={getStatusColor(attendance?.status)}>
                {attendance?.status || "N/A"}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-6 space-y-6">
            {attendance ? (
              <>
                {/* User Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">User Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Email:</Label>
                      <span className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {attendance.userEmail || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <Label>Full Name:</Label>
                      <span className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {attendance.userFullName || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <Label>Position:</Label>
                      <span className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        {attendance.userPosition || "N/A"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <Label>ID Card:</Label>
                      <span>{attendance.userIdCard || "N/A"}</span>
                    </div>
                  </div>
                </div>

                {/* Attendance Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    Attendance Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Type:</Label>
                      <span>{attendance.type.replace(/_/g, " ")}</span>
                    </div>
                    <div className="flex justify-between">
                      <Label>Leave Request:</Label>
                      <span>{attendance.leaveRequest.replace(/_/g, " ")}</span>
                    </div>
                    <div className="flex justify-between">
                      <Label>Total Days:</Label>
                      <span>{attendance.totalDays}</span>
                    </div>
                    <div className="flex justify-between">
                      <Label>Reason:</Label>
                      <span>{attendance.reason || "N/A"}</span>
                    </div>
                  </div>
                </div>

                {/* Approval Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    Approval Information
                  </h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Approved By:</Label>
                      <span>{attendance.approvedByFullName || "N/A"}</span>
                    </div>
                    <div className="flex justify-between">
                      <Label>Approved At:</Label>
                      <span>{formatDate(attendance.approvedAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <Label>Approval Notes:</Label>
                      <span>{attendance.approvalNotes || "N/A"}</span>
                    </div>
                  </div>
                </div>

                {/* System Info */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">System Information</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <Label>Created At:</Label>
                      <span>{formatDate(attendance.createdAt)}</span>
                    </div>
                    <div className="flex justify-between">
                      <Label>Updated At:</Label>
                      <span>{formatDate(attendance.updatedAt)}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                No attendance data available
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <DialogFooter className="px-6 py-4 border-t bg-muted/30 flex-shrink-0">
          <Button variant="outline" onClick={handleClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
