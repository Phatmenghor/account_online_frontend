"use client";

import {
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
  Home,
  Briefcase,
  ClipboardCheck,
  FileText,
  FileClock,
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

import { AmlManagementModel } from "@/models/aml/management/respone/aml-management.response";
import { getAmlManagementByIdService } from "@/services/dashboard/aml/aml-management.service";
import { DateTimeFormat } from "@/utils/date/date-time-format";

interface AmlAlertViewModalProps {
  alert?: AmlManagementModel;
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
  const [alert, setAlert] = useState<AmlManagementModel | undefined>(
    initialAlert
  );
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

        {/* Content Body */}
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
                <Section title="Customer Information" color="blue">
                  <InfoRow
                    label="Legal ID"
                    value={alert.customerInfo.legalId}
                    icon={<User />}
                  />
                  <InfoRow
                    label="Given Name"
                    value={alert.customerInfo.givenName}
                    icon={<User />}
                  />
                  <InfoRow
                    label="Family Name"
                    value={alert.customerInfo.familyName}
                    icon={<User />}
                  />
                  <InfoRow
                    label="Khmer Name"
                    value={`${alert.customerInfo.firstNameKh} ${alert.customerInfo.lastNameKh}`}
                    icon={<User />}
                  />
                  <InfoRow
                    label="Phone"
                    value={alert.customerInfo.phoneNumber}
                    icon={<Phone />}
                  />
                  <InfoRow
                    label="Gender"
                    value={alert.customerInfo.gender}
                    icon={<Tag />}
                  />
                  <InfoRow
                    label="Date of Birth"
                    value={alert.customerInfo.dateOfBirth}
                    icon={<Calendar />}
                  />
                  <InfoRow
                    label="Nationality"
                    value={alert.customerInfo.nationality}
                    icon={<Globe />}
                  />
                  <InfoRow
                    label="Legal Address"
                    value={alert.customerInfo.legalAddress}
                    icon={<MapPin />}
                  />
                  <InfoRow
                    label="Issued Date"
                    value={alert.customerInfo.issuedDate}
                    icon={<FileClock />}
                  />
                  <InfoRow
                    label="Expired Date"
                    value={alert.customerInfo.expiredDate}
                    icon={<FileClock />}
                  />
                </Section>

                {/* 2. KYC & Personal */}
                <Section title="KYC & Personal Info" color="orange">
                  <InfoRow
                    label="Current Address Name"
                    value={alert.currentAddressName}
                    icon={<Home />}
                  />
                  <InfoRow
                    label="Current Address Code"
                    value={alert.currentAddressCode}
                    icon={<Tag />}
                  />
                  <InfoRow
                    label="Place of Birth Name"
                    value={alert.placeOfBirthName}
                    icon={<MapPin />}
                  />
                  <InfoRow
                    label="Place of Birth Code"
                    value={alert.placeOfBirthCode}
                    icon={<Tag />}
                  />
                  <InfoRow
                    label="Marital Status"
                    value={alert.maritalStatus}
                    icon={<Tag />}
                  />
                  <InfoRow
                    label="Occupation Code"
                    value={alert.occupationCode}
                    icon={<Briefcase />}
                  />
                  <InfoRow
                    label="Occupation Status"
                    value={alert.occupationStatus}
                    icon={<ClipboardCheck />}
                  />
                  <InfoRow
                    label="Remarks"
                    value={alert.remarks}
                    icon={<FileText />}
                  />
                </Section>

                {/* 3. Screening & Risk */}
                <Section title="Screening Information" color="red">
                  <InfoRow
                    label="Risk Level"
                    value={alert.riskLevel}
                    icon={<Activity />}
                  />
                  <InfoRow
                    label="Action Taken"
                    value={alert.actionTaken}
                    icon={<ClipboardList />}
                  />
                  <InfoRow
                    label="Service Name"
                    value={alert.serviceName}
                    icon={<Tag />}
                  />
                  <InfoRow
                    label="Total Rule Score"
                    value={alert.totalRulesScore}
                    icon={<Layers />}
                  />
                </Section>

                {/* 4. Rules Triggered */}
                <Section title="Rules Triggered" color="purple">
                  {alert.rulesTriggered ? (
                    alert.rulesTriggered.split(",").map((rule, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span>{rule.trim()}</span>
                        <Badge variant="secondary">Triggered</Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No rules triggered</p>
                  )}
                </Section>

                {/* 5. Change History */}
                <Section title="Changed By" color="green">
                  {alert.approvedBy && (
                    <ChangeCard title="Approved By" color="green">
                      <UserInfoRows data={alert.approvedBy} />
                    </ChangeCard>
                  )}

                  {alert.rejectedBy && (
                    <ChangeCard title="Rejected By" color="red">
                      <UserInfoRows data={alert.rejectedBy} />
                    </ChangeCard>
                  )}

                  {!alert.approvedBy && !alert.rejectedBy && (
                    <p className="text-muted-foreground">No change history</p>
                  )}
                </Section>

                {/* 6. Audit */}
                <Section title="Audit Information" color="gray">
                  <InfoRow
                    label="Created At"
                    value={DateTimeFormat(alert.createdAt)}
                    icon={<Calendar />}
                  />
                  <InfoRow
                    label="Updated At"
                    value={DateTimeFormat(alert.updatedAt)}
                    icon={<Calendar />}
                  />
                </Section>
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
 * SECTION WRAPPER
 * -------------------------------------------*/
function Section({
  title,
  color,
  children,
}: {
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  const colorMap: any = {
    blue: "bg-blue-600",
    red: "bg-red-600",
    green: "bg-green-600",
    purple: "bg-purple-600",
    orange: "bg-orange-600",
    gray: "bg-gray-600",
  };

  return (
    <section className="space-y-4">
      <div className="flex items-center gap-2">
        <div className={`w-1 h-6 rounded-full ${colorMap[color]}`}></div>
        <h3 className="text-lg font-semibold">{title}</h3>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

/* ---------------------------------------------
 * CHANGE CARD
 * -------------------------------------------*/
function ChangeCard({
  title,
  color,
  children,
}: {
  title: string;
  color: string;
  children: React.ReactNode;
}) {
  const colorMap: any = {
    green: "text-green-700",
    red: "text-red-700",
  };

  return (
    <div className="space-y-3 border p-4 rounded-lg">
      <h4 className={`font-semibold ${colorMap[color]}`}>{title}</h4>
      {children}
    </div>
  );
}

/* ---------------------------------------------
 * USER INFO ROW GROUP
 * -------------------------------------------*/
function UserInfoRows({ data }: { data: any }) {
  return (
    <>
      <InfoRow label="Full Name" value={data.fullName} icon={<User />} />
      <InfoRow label="Email" value={data.email} icon={<Tag />} />
      <InfoRow label="Role" value={data.userRole} icon={<Tag />} />
      <InfoRow label="Position" value={data.position} icon={<Tag />} />
      <InfoRow
        label="Permission"
        value={data.userPermission}
        icon={<Shield />}
      />
    </>
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
        {value ?? "N/A"}
      </span>
    </div>
  );
}
