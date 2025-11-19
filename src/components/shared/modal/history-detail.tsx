"use client";

import {
  FileText,
  User,
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

import { HistoryModel } from "@/models/aml/management/respone/history-respones.model";
import { getAllAmlHistoryService } from "@/services/dashboard/aml/aml-history.service";

interface HistoryDetailModalProps {
  history?: HistoryModel;
  historyId?: number;
  isOpen: boolean;
  onClose: () => void;
}

export default function HistoryDetailModal({
  history: initialHistory,
  historyId,
  isOpen,
  onClose,
}: HistoryDetailModalProps) {
  const [history, setHistory] = useState<HistoryModel | undefined>(initialHistory);
  const [loading, setLoading] = useState(false);

  const getStatusColor = (status?: string) => {
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

  useEffect(() => {
    if (!isOpen) return;

    if (initialHistory) {
      setHistory(initialHistory);
      return;
    }

    if (historyId) {
      const fetchData = async () => {
        setLoading(true);
        try {
          const data = await getAllAmlHistoryService(historyId);
          setHistory(data);
        } catch (err) {
          console.error("Failed to fetch history record:", err);
        } finally {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [historyId, initialHistory, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl h-[90vh] p-0 flex flex-col gap-0">

        {/* HEADER */}
        <DialogHeader className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <FileText className="w-6 h-6 text-foreground" />
            </div>

            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold">
                History Details
              </DialogTitle>

              <DialogDescription className="text-base text-muted-foreground">
                History ID: {historyId ?? "Unknown"}
              </DialogDescription>

              {history && (
                <Badge className={getStatusColor(history.status)}>
                  <Activity className="h-3 w-3" />
                  <span className="ml-1">{history.status}</span>
                </Badge>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* CONTENT */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-6 space-y-8">

            {loading ? (
              <div className="text-center text-muted-foreground">Loading history...</div>
            ) : !history ? (
              <div className="text-center text-muted-foreground">No history data available</div>
            ) : (
              <>

                {/* CUSTOMER INFO */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-blue-600 rounded-full"></div>
                    <h3 className="text-lg font-semibold">Customer Information</h3>
                  </div>

                  <div className="space-y-3">
                    <InfoRow label="Legal ID" value={history.customerInfo.legalId} icon={<User />} />
                    <InfoRow
                      label="Name"
                      value={`${history.customerInfo.givenName} ${history.customerInfo.familyName}`}
                      icon={<User />}
                    />
                    <InfoRow label="Phone" value={history.customerInfo.phoneNumber} icon={<Phone />} />
                    <InfoRow label="Gender" value={history.customerInfo.gender} icon={<Tag />} />
                    <InfoRow label="Date of Birth" value={history.customerInfo.dateOfBirth} icon={<Calendar />} />
                    <InfoRow label="Nationality" value={history.customerInfo.nationality} icon={<Globe />} />
                    <InfoRow label="Address" value={history.customerInfo.legalAddress} icon={<MapPin />} />
                  </div>
                </section>

                {/* SCREENING & RISK INFO */}
                <section className="space-y-4">
                  <div className="flex items-center gap-2">
                    <div className="w-1 h-6 bg-red-600 rounded-full"></div>
                    <h3 className="text-lg font-semibold">Screening Information</h3>
                  </div>

                  <div className="space-y-3">
                    <InfoRow label="Screening Result" value={history.screeningResult} icon={<Activity />} />
                    <InfoRow label="Risk Level" value={history.riskLevel} icon={<Activity />} />
                    <InfoRow label="Rule Score" value={history.totalRulesScore} icon={<Layers />} />
                    <InfoRow label="Action Taken" value={history.actionTaken} icon={<ClipboardList />} />
                  </div>
                </section>

              </>
            )}

          </div>
        </ScrollArea>

        {/* FOOTER */}
        <DialogFooter className="px-6 py-4 border-t bg-muted/30 flex-shrink-0">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>

      </DialogContent>
    </Dialog>
  );
}

/* ---------------------------------------------
 * REUSABLE INFO ROW COMPONENT
 ---------------------------------------------*/
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
