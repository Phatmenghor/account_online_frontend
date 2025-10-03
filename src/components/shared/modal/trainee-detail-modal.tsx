"use client";

import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Calendar,
  AlertCircle,
  ThumbsUp,
} from "lucide-react";
import { TraineeModel } from "@/models/trainee/trainee.response";
import { getTraineeByIdService } from "@/services/dashboard/trainee/trainee.service";

interface TraineeViewModalProps {
  traineeId: number;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function TraineeViewModal({
  traineeId,
  isOpen = true,
  onClose = () => {},
}: TraineeViewModalProps) {
  const [trainee, setTrainee] = useState<TraineeModel | null>(null);
  const [loading, setLoading] = useState(false);

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  useEffect(() => {
    if (!isOpen) return;

    const fetchTrainee = async () => {
      setLoading(true);
      try {
        const data = await getTraineeByIdService(traineeId);
        setTrainee(data);
      } catch (error) {
        console.error("Failed to fetch trainee:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrainee();
  }, [traineeId, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl min-h-screen h-screen rounded-2xl shadow-lg p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="bg-muted/50 p-6 border-b">
          <DialogTitle className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <FileText className="w-6 h-6 text-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                Trainee Report Details
              </h2>
              <p className="text-xs text-muted-foreground">
                Trainee report overview & details
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="text-center text-muted-foreground">
              Loading trainee report...
            </div>
          ) : (
            <>
              {/* Report Information */}
              <Section title="Report Information">
                <InfoGrid
                  rows={[
                    {
                      icon: <FileText />,
                      label: "Report Remark",
                      value: trainee?.reportRemark,
                      isLongText: true,
                    },
                  ]}
                />
              </Section>

              <Separator />

              {/* Challenges & Recommendations */}
              <Section title="Challenges & Recommendations">
                <InfoGrid
                  rows={[
                    {
                      icon: <AlertCircle />,
                      label: "Challenge",
                      value: trainee?.challenge,
                      isLongText: true,
                    },
                    {
                      icon: <ThumbsUp />,
                      label: "Recommend",
                      value: trainee?.recommend,
                      isLongText: true,
                    },
                  ]}
                />
              </Section>

              <Separator />

              {/* Timestamps */}
              <Section title="Timestamps">
                <InfoGrid
                  rows={[
                    {
                      icon: <Calendar />,
                      label: "Created At",
                      value: formatDate(trainee?.createdAt || ""),
                    },
                    {
                      icon: <Calendar />,
                      label: "Updated At",
                      value: formatDate(trainee?.updatedAt || ""),
                    },
                  ]}
                />
              </Section>
            </>
          )}
        </div>

        {/* Footer */}
        <DialogFooter className="p-4 border-t flex justify-end bg-background">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="text-sm font-semibold text-foreground mb-3">{title}</h3>
      {children}
    </div>
  );
}

function InfoGrid({
  rows,
  useVerticalLayout = false,
}: {
  rows: {
    icon: React.ReactNode;
    label: string;
    value?: string;
    isLongText?: boolean;
  }[];
  useVerticalLayout?: boolean;
}) {
  // Use vertical layout if explicitly requested OR if any row has isLongText
  const shouldUseVertical =
    useVerticalLayout || rows.some((row) => row.isLongText);

  if (shouldUseVertical) {
    return (
      <div className="space-y-4">
        {rows.map((row, idx) => (
          <div
            key={idx}
            className={`flex gap-3 items-start ${
              row.isLongText ? "flex-col sm:flex-row" : ""
            }`}
          >
            <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
              {row.icon}
            </div>
            <div className={`flex-1 min-w-0 ${row.isLongText ? "w-full" : ""}`}>
              <p className="text-xs text-muted-foreground mb-1">{row.label}</p>
              <p
                className={`text-sm text-foreground ${
                  row.isLongText
                    ? "whitespace-pre-wrap break-words leading-relaxed"
                    : "break-words"
                }`}
              >
                {row.value || "N/A"}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Use grid layout for normal fields
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {rows.map((row, idx) => (
        <div key={idx} className="flex gap-2 items-start">
          <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center flex-shrink-0">
            {row.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-muted-foreground">{row.label}</p>
            <p className="text-sm text-foreground break-words">
              {row.value || "N/A"}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}