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
  Image as ImageIcon,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import { axiosClientWithAuth } from "@/utils/axios";
import { DialogTrigger } from "@/components/ui/dialog";

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

import { HistoryModel } from "@/models/aml/history/response/history-response.model";
import { getAmlHistoryByIdService } from "@/services/dashboard/aml/aml-history.service";
import { DateTimeFormat } from "@/utils/date/date-time-format";
import AmlStatusBadge from "../badge/aml-badge";
import { getRoleDisplayName } from "@/utils/role-display";

interface HistoryDetailModalProps {
  history?: HistoryModel;
  historyId?: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function AmlHistoryDetailModal({
  history: initialHistory,
  historyId,
  isOpen,
  onClose,
}: HistoryDetailModalProps) {
  const [history, setHistory] = useState<HistoryModel | undefined>(
    initialHistory
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (initialHistory) {
      setHistory(initialHistory);
      return;
    }

    if (historyId) {
      const fetchHistory = async () => {
        setLoading(true);
        try {
          const data = await getAmlHistoryByIdService(historyId);
          setHistory(data);
        } catch (err) {
          console.error("Failed to fetch AML history:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchHistory();
    }
  }, [historyId, initialHistory, isOpen]);

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
                AML History Details
              </DialogTitle>

              <DialogDescription className="text-base text-muted-foreground">
                Record ID: {historyId ?? "Unknown"}
              </DialogDescription>

              {history && (
                <div className="mt-2">
                  <AmlStatusBadge status={history.status} />
                </div>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Body */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-6 space-y-8">
            {loading ? (
              <div className="text-center text-muted-foreground">
                Loading history...
              </div>
            ) : !history ? (
              <div className="text-center text-muted-foreground">
                No history data available
              </div>
            ) : (
              <>
                {/* 1. Customer Info */}
                <Section title="Customer Information" color="blue">
                  <InfoRow
                    label="Legal ID"
                    value={history.customerInfo.legalId}
                    icon={<User />}
                  />
                  <InfoRow
                    label="Full Name"
                    value={`${history.customerInfo.givenName} ${history.customerInfo.familyName}`}
                    icon={<User />}
                  />
                  <InfoRow
                    label="Phone"
                    value={history.customerInfo.phoneNumber}
                    icon={<Phone />}
                  />
                  <InfoRow
                    label="Gender"
                    value={history.customerInfo.gender}
                    icon={<Tag />}
                  />
                  <InfoRow
                    label="Date of Birth"
                    value={history.customerInfo.dateOfBirth}
                    icon={<Calendar />}
                  />
                  <InfoRow
                    label="Nationality"
                    value={history.customerInfo.nationality}
                    icon={<Globe />}
                  />
                  <InfoRow
                    label="Legal Address"
                    value={history.customerInfo.legalAddress}
                    icon={<MapPin />}
                  />
                  <InfoRow
                    label="Issued Date"
                    value={history.customerInfo.issuedDate}
                    icon={<FileClock />}
                  />
                  <InfoRow
                    label="Expired Date"
                    value={history.customerInfo.expiredDate}
                    icon={<FileClock />}
                  />
                </Section>

                {/* 2. KYC & Personal */}
                <Section title="KYC & Personal Info" color="orange">
                  <InfoRow
                    label="Current Address Name"
                    value={history.currentAddressName}
                    icon={<Home />}
                  />
                  <InfoRow
                    label="Current Address Code"
                    value={history.currentAddressCode}
                    icon={<Tag />}
                  />
                  <InfoRow
                    label="Place of Birth Name"
                    value={history.placeOfBirthName}
                    icon={<MapPin />}
                  />
                  <InfoRow
                    label="Place of Birth Code"
                    value={history.placeOfBirthCode}
                    icon={<Tag />}
                  />
                  <InfoRow
                    label="Marital Status"
                    value={history.maritalStatus}
                    icon={<Tag />}
                  />
                  <InfoRow
                    label="Occupation Code"
                    value={history.occupationCode}
                    icon={<Briefcase />}
                  />
                  <InfoRow
                    label="Occupation Status"
                    value={history.occupationStatus}
                    icon={<ClipboardCheck />}
                  />
                  <InfoRow
                    label="Remarks"
                    value={history.remarks}
                    icon={<FileText />}
                  />
                </Section>

                {/* 3. Screening */}
                <Section title="Screening Information" color="red">
                  <InfoRow
                    label="Risk Level"
                    value={history.riskLevel}
                    icon={<Activity />}
                  />
                  <InfoRow
                    label="Action Taken"
                    value={history.actionTaken}
                    icon={<ClipboardList />}
                  />
                  <InfoRow
                    label="Service Name"
                    value={history.serviceName}
                    icon={<Tag />}
                  />
                  <InfoRow
                    label="Total Rule Score"
                    value={history.totalRulesScore}
                    icon={<Layers />}
                  />
                </Section>

                {/* 4. Rules Triggered */}
                <Section title="Rules Triggered" color="purple">
                  {history.rulesTriggered ? (
                    history.rulesTriggered.split(",").map((rule, i) => (
                      <div key={i} className="flex justify-between text-sm">
                        <span>{rule.trim()}</span>
                        <Badge variant="secondary">Triggered</Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No rules triggered</p>
                  )}
                </Section>

                {/* 5. Changed By */}
                <Section title="Changed By" color="green">
                  {history.approvedBy && (
                    <ChangeCard title="Approved By" color="green">
                      <UserInfoRows data={history.approvedBy} />
                    </ChangeCard>
                  )}

                  {history.rejectedBy && (
                    <ChangeCard title="Rejected By" color="red">
                      <UserInfoRows data={history.rejectedBy} />
                    </ChangeCard>
                  )}

                  {!history.approvedBy && !history.rejectedBy && (
                    <p className="text-muted-foreground">No change history</p>
                  )}
                </Section>

                {/* 6. Audit */}
                <Section title="Audit Information" color="gray">
                  <InfoRow
                    label="Created At"
                    value={DateTimeFormat(history.createdAt)}
                    icon={<Calendar />}
                  />
                  <InfoRow
                    label="Updated At"
                    value={DateTimeFormat(history.updatedAt)}
                    icon={<Calendar />}
                  />
                </Section>

                {/* 7. Customer Documents */}
                <Section title="Customer Documents" color="purple">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <DocumentCard
                      title="National ID"
                      imageName={history.nidImageName}
                      imageType="nid"
                    />
                    <DocumentCard
                      title="Selfie"
                      imageName={history.selfieImageName}
                      imageType="selfie"
                    />
                  </div>
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
 * USER INFO SET
 * -------------------------------------------*/
function UserInfoRows({ data }: { data: any }) {
  return (
    <>
      <InfoRow label="Full Name" value={data.fullName} icon={<User />} />
      <InfoRow label="Email" value={data.email} icon={<Tag />} />
      <InfoRow label="Role" value={getRoleDisplayName(data.userRole)} icon={<Tag />} />
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
 * ROW COMPONENT
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
    <div className="flex justify-between items-start">
      <Label className="text-sm font-medium text-muted-foreground">
        {label}:
      </Label>

      <div className="flex items-center gap-2 max-w-[60%] text-right">
        <span className="text-sm">{value ?? "N/A"}</span>
      </div>
    </div>
  );
}

/* ---------------------------------------------
 * DOCUMENT CARD
 * -------------------------------------------*/
function DocumentCard({
  title,
  imageName,
  imageType,
}: {
  title: string;
  imageName?: string;
  imageType: string;
}) {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!imageName) return;

    const fetchImage = async () => {
      setLoading(true);
      setError(false);
      try {
        const response = await axiosClientWithAuth.get(
          `/api/images/download?filename=${imageName}&type=${imageType}`,
          { responseType: "blob" }
        );
        const url = URL.createObjectURL(response.data);
        setImageUrl(url);
      } catch (err) {
        console.error(`Failed to load ${title} image:`, err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchImage();

    return () => {
      if (imageUrl) URL.revokeObjectURL(imageUrl);
    };
  }, [imageName, imageType, title]);

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-semibold text-sm">{title}</h4>
      </div>

      <Dialog>
        <div className="aspect-video bg-muted rounded-md relative overflow-hidden flex items-center justify-center group">
          {loading ? (
            <div className="flex flex-col items-center gap-2 text-muted-foreground animate-pulse">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-xs">Loading...</span>
            </div>
          ) : imageUrl ? (
            <div className="relative w-full h-full cursor-pointer">
              <Image
                src={imageUrl}
                alt={title}
                fill
                className="object-cover transition-transform hover:scale-105"
              />
              {/* Trigger for the preview dialog */}
              <DialogTrigger asChild>
                <div className="absolute inset-0 z-10 bg-black/0 hover:bg-black/10 transition-colors flex items-center justify-center cursor-pointer">
                  <span className="sr-only">View full image</span>
                </div>
              </DialogTrigger>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <ImageIcon className="w-8 h-8 opacity-50" />
              <span className="text-xs">{error ? "Failed to load" : "No Image"}</span>
            </div>
          )}
        </div>

        {/* Preview Content */}
        {imageUrl && (
          <DialogContent className="max-w-[90vw] max-h-[90vh] p-0 border-none bg-transparent shadow-none flex items-center justify-center">
            <div className="relative w-auto h-auto max-w-full max-h-full">
              <DialogTitle className="sr-only">Preview {title}</DialogTitle>
              <DialogDescription className="sr-only">Full size view of {title}</DialogDescription>
              {/* Close button is provided by DialogContent usually, but we can style the image directly */}
              <img
                src={imageUrl}
                alt={`Preview ${title}`}
                className="max-w-[90vw] max-h-[90vh] object-contain rounded-md shadow-2xl"
              />
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
