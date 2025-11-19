"use client";

import {
  FileText,
  User,
  Shield,
  Globe,
  Tag,
  Phone,
  Calendar,
  MapPin,
  Activity,
  Layers,
  ClipboardList,
} from "lucide-react";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { ManagementModel } from "@/models/aml/management/respone/management-response";
import { getAmlManagementByIdService } from "@/services/dashboard/aml/aml-management.service";

interface AmlAlertViewModalProps {
  alert?: ManagementModel;
  alertId?: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function AmlAlertViewModal({
  alert: initialAlert,
  alertId,
  isOpen,
  onClose,
}: AmlAlertViewModalProps) {
  const [alert, setAlert] = useState<ManagementModel | undefined>(initialAlert);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (initialAlert) {
      setAlert(initialAlert);
      return;
    }

    if (alertId) {
      const fetchAlert = async () => {
        setLoading(true);
        try {
          const data = await getAmlManagementByIdService(alertId);
          setAlert(data);
        } catch (err) {
          console.error("Failed to fetch AML alert:", err);
        } finally {
          setLoading(false);
        }
      };

      fetchAlert();
    }
  }, [alertId, initialAlert, isOpen]);

  const getStatusColor = (status: string) => {
    switch (status?.toUpperCase()) {
      case "PENDING":
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case "APPROVED":
        return "bg-green-100 text-green-800 border-green-200";
      case "REJECTED":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleClose = () => onClose();

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl h-[90vh] p-0 gap-0 flex flex-col">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Shield className="w-6 h-6 text-foreground" />
            </div>

            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold">
                AML Alert Details
              </DialogTitle>

              <DialogDescription className="text-base text-muted-foreground">
                Transaction: {alert?.trxnID ?? "Unknown"}
              </DialogDescription>

              {alert && (
                <Badge className={getStatusColor(alert.status)}>
                  <Activity className="h-3 w-3" />
                  <span className="ml-1">{alert.status}</span>
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-6 space-y-8">
            {loading ? (
              <div className="text-center text-muted-foreground">
                Loading AML alert...
              </div>
            ) : !alert ? (
              <div className="text-center text-muted-foreground">
                No AML alert data available
              </div>
            ) : (
              <>
                {/* 1. Customer Information */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                    <h3 className="text-lg font-semibold">
                      Customer Information
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <InfoRow
                      label="Legal ID"
                      icon={<User />}
                      value={alert.customerInfo.legalId}
                    />
                    <InfoRow
                      label="Name"
                      icon={<User />}
                      value={`${alert.customerInfo.givenName} ${alert.customerInfo.familyName}`}
                    />
                    <InfoRow
                      label="Phone"
                      icon={<Phone />}
                      value={alert.customerInfo.phoneNumber}
                    />
                    <InfoRow
                      label="Gender"
                      icon={<Tag />}
                      value={alert.customerInfo.gender}
                    />
                    <InfoRow
                      label="Date of Birth"
                      icon={<Calendar />}
                      value={alert.customerInfo.dateOfBirth}
                    />
                    <InfoRow
                      label="Nationality"
                      icon={<Globe />}
                      value={alert.customerInfo.nationality}
                    />
                    <InfoRow
                      label="Address"
                      icon={<MapPin />}
                      value={alert.customerInfo.legalAddress}
                    />
                  </div>
                </section>

                {/* 2. Screening & Risk Info */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-red-600 rounded-full"></div>
                    <h3 className="text-lg font-semibold">
                      Screening Information
                    </h3>
                  </div>

                  <div className="space-y-3">
                    <InfoRow
                      label="Screening Result"
                      icon={<Shield />}
                      value={alert.screeningResult}
                    />
                    <InfoRow
                      label="Risk Level"
                      icon={<Activity />}
                      value={alert.riskLevel}
                    />
                    <InfoRow
                      label="Total Rule Score"
                      icon={<Layers />}
                      value={alert.totalRulesScore}
                    />
                    <InfoRow
                      label="Action Taken"
                      icon={<ClipboardList />}
                      value={alert.actionTaken}
                    />
                    <InfoRow
                      label="Service Name"
                      icon={<Tag />}
                      value={alert.serviceName}
                    />
                  </div>
                </section>

                {/* 3. Rules Triggered */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-purple-600 rounded-full"></div>
                    <h3 className="text-lg font-semibold">Rules Triggered</h3>
                  </div>

                  <div className="space-y-3 text-sm">
                    {Array.isArray(alert.rulesTriggered) &&
                    alert.rulesTriggered.length > 0 ? (
                      alert.rulesTriggered.map((rule, i) => (
                        <div key={i} className="flex justify-between">
                          <span>Rule {i + 1}</span>
                          <Badge variant="secondary">Triggered</Badge>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground">
                        No rules triggered
                      </p>
                    )}
                  </div>
                </section>

                {/* 4. Changed By Information */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-green-600 rounded-full"></div>
                    <h3 className="text-lg font-semibold">Changed By</h3>
                  </div>

                  {/* Approved By */}
                  {alert.approvedBy && (
                    <div className="space-y-3 border p-4 rounded-lg">
                      <h4 className="font-semibold text-green-700">
                        Approved By
                      </h4>

                      <InfoRow
                        label="Full Name"
                        icon={<User />}
                        value={alert.approvedBy.fullName}
                      />
                      <InfoRow
                        label="Email"
                        icon={<Tag />}
                        value={alert.approvedBy.email}
                      />
                      <InfoRow
                        label="Role"
                        icon={<Tag />}
                        value={alert.approvedBy.userRole}
                      />
                      <InfoRow
                        label="Position"
                        icon={<Tag />}
                        value={alert.approvedBy.position}
                      />
                      <InfoRow
                        label="Permission"
                        icon={<Shield />}
                        value={alert.approvedBy.userPermission}
                      />
                    </div>
                  )}

                  {/* Rejected By */}
                  {alert.rejectedBy && (
                    <div className="space-y-3 border p-4 rounded-lg">
                      <h4 className="font-semibold text-red-700">
                        Rejected By
                      </h4>

                      <InfoRow
                        label="Full Name"
                        icon={<User />}
                        value={alert.rejectedBy.fullName}
                      />
                      <InfoRow
                        label="Email"
                        icon={<Tag />}
                        value={alert.rejectedBy.email}
                      />
                      <InfoRow
                        label="Role"
                        icon={<Tag />}
                        value={alert.rejectedBy.userRole}
                      />
                      <InfoRow
                        label="Position"
                        icon={<Tag />}
                        value={alert.rejectedBy.position}
                      />
                      <InfoRow
                        label="Permission"
                        icon={<Shield />}
                        value={alert.rejectedBy.userPermission}
                      />
                    </div>
                  )}

                  {!alert.approvedBy && !alert.rejectedBy && (
                    <p className="text-muted-foreground">No change history</p>
                  )}
                </section>
              </>
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

/* ---------------------------------------------
 * REUSABLE ROW COMPONENT
 * -------------------------------------------*/
function InfoRow({
  label,
  icon,
  value,
}: {
  label: string;
  icon?: React.ReactNode;
  value: string | number | undefined;
}) {
  return (
    <div className="flex justify-between">
      <Label className="text-sm font-medium text-muted-foreground">
        {label}:
      </Label>
      <span className="text-sm flex items-center gap-2">
        {icon}
        {value || "N/A"}
      </span>
    </div>
  );
}
