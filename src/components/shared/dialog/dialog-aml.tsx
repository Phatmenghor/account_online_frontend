"use client";

import { AmlStatusEnum } from "@/constants/AppResource/filter/status";
import { CheckCircle, XCircle, Clock, Info } from "lucide-react";
import React from "react";

interface AmlConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  status: AmlStatusEnum;
  onConfirm: () => Promise<void> | void;
  title?: string;
  description?: string;
  amlDetails?: {
    id: string;
    name: string;
    riskScore: number;
    flaggedDate: string;
    source?: string;
    country?: string;
  };
}

type DialogVariant = "info" | "danger" | "warning";

interface DialogProps {
  variant: DialogVariant;
  confirmLabel: string;
  confirmButtonIcon: React.ReactNode;
  icon: React.ReactNode;
  defaultTitle: string;
  defaultDescription: string;
}

const AmlConfirmDialog = ({
  isOpen,
  onClose,
  status,
  onConfirm,
  title,
  description,
  amlDetails,
}: AmlConfirmDialogProps) => {
  if (!isOpen) return null;

  const getDialogProps = (): DialogProps => {
    switch (status) {
      case AmlStatusEnum.APPROVE:
        return {
          variant: "info",
          confirmLabel: "Approve",
          confirmButtonIcon: <CheckCircle className="h-4 w-4 mr-1" />,
          icon: <CheckCircle className="h-14 w-14 text-orange-500" />,
          defaultTitle: "Approve AML Record",
          defaultDescription:
            "You are about to approve this AML record. This action cannot be undone.",
        };
      case AmlStatusEnum.REJECT:
        return {
          variant: "danger",
          confirmLabel: "Reject",
          confirmButtonIcon: <XCircle className="h-4 w-4 mr-1" />,
          icon: <XCircle className="h-14 w-14 text-red-500" />,
          defaultTitle: "Reject AML Record",
          defaultDescription:
            "You are about to reject this AML record. This action cannot be undone.",
        };
      case AmlStatusEnum.PENDING:
      default:
        return {
          variant: "warning",
          confirmLabel: "Mark as Pending",
          confirmButtonIcon: <Clock className="h-4 w-4 mr-1" />,
          icon: <Clock className="h-14 w-14 text-yellow-500" />,
          defaultTitle: "Set AML to Pending",
          defaultDescription:
            "You are about to mark this AML record as pending.",
        };
    }
  };

  const dialogProps = getDialogProps();

  const getButtonColor = () => {
    switch (dialogProps.variant) {
      case "info":
        return "bg-orange-500 hover:bg-orange-600 text-white";
      case "danger":
        return "bg-red-500 hover:bg-red-600 text-white";
      case "warning":
        return "bg-yellow-500 hover:bg-yellow-600 text-white";
      default:
        return "bg-gray-500";
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case AmlStatusEnum.APPROVE:
        return (
          <span className="bg-orange-100 text-orange-800 px-3 py-1 rounded-full text-sm font-medium">
            Approved
          </span>
        );
      case AmlStatusEnum.REJECT:
        return (
          <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
            Rejected
          </span>
        );
      case AmlStatusEnum.PENDING:
      default:
        return (
          <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            {dialogProps.icon}
            <h2 className="text-xl font-semibold">
              {title || dialogProps.defaultTitle}
            </h2>
          </div>
          {getStatusBadge()}
        </div>

        {/* Description */}
        <p className="text-gray-600 mb-6">
          {description || dialogProps.defaultDescription}
        </p>

        {/* AML Details Section */}
        {amlDetails && (
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 mb-6 space-y-2">
            <DetailRow label="AML ID" value={amlDetails.id} />
            <DetailRow label="Name" value={amlDetails.name} />
            <DetailRow label="Risk Score" value={amlDetails.riskScore} />
            <DetailRow label="Flagged Date" value={amlDetails.flaggedDate} />
            {amlDetails.source && (
              <DetailRow label="Source" value={amlDetails.source} />
            )}
            {amlDetails.country && (
              <DetailRow label="Country" value={amlDetails.country} />
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg flex items-center justify-center gap-1 ${getButtonColor()} transition-colors`}
          >
            {dialogProps.confirmButtonIcon}
            {dialogProps.confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper component for detail rows
const DetailRow = ({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) => (
  <div className="flex justify-between text-gray-700">
    <span className="font-medium">{label}:</span>
    <span>{value}</span>
  </div>
);

export default AmlConfirmDialog;
