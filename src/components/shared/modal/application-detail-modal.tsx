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
  Briefcase,
  Calendar,
  Users,
  StickyNote,
  Building2,
  Link as LinkIcon,
  Activity,
} from "lucide-react";
import { ApplicationModel } from "@/models/application/app.response";
import { getAppByIdService } from "@/services/dashboard/application/app.service";

interface ApplicationViewModalProps {
  applicationId: number;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function ApplicationViewModal({
  applicationId,
  isOpen = true,
  onClose = () => {},
}: ApplicationViewModalProps) {
  const [application, setApplication] = useState<ApplicationModel | null>(null);
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

    const fetchApplication = async () => {
      setLoading(true);
      try {
        const data = await getAppByIdService(applicationId);
        setApplication(data);
      } catch (error) {
        console.error("Failed to fetch application:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchApplication();
  }, [applicationId, isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl min-h-screen h-screen rounded-2xl shadow-lg p-0 overflow-hidden">
        {/* Header */}
        <DialogHeader className="bg-muted/50 p-6 border-b">
          <DialogTitle className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <Briefcase className="w-6 h-6 text-foreground" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">
                {application?.projectName || "Application Details"}
              </h2>
              <p className="text-xs text-muted-foreground">
                Application overview & details
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="text-center text-muted-foreground">
              Loading application...
            </div>
          ) : (
            <>
              {/* Application Info */}
              <Section title="Application Info">
                <InfoGrid
                  rows={[
                    {
                      icon: <Briefcase />,
                      label: "Project Name",
                      value: application?.projectName,
                    },
                    {
                      icon: <Building2 />,
                      label: "Department",
                      value: application?.department,
                    },
                    {
                      icon: <Calendar />,
                      label: "Year",
                      value: application?.year,
                    },
                    {
                      icon: <Activity />,
                      label: "Application Status",
                      value: application?.applicationStatus,
                    },
                    {
                      icon: <LinkIcon />,
                      label: "URL Link",
                      value: application?.urlLink,
                    },
                    {
                      icon: <Calendar />,
                      label: "Created At",
                      value: formatDate(application?.createdAt || ""),
                    },
                  ]}
                />
              </Section>

              <Separator />

              {/* Additional Info */}
              <Section title="Additional Info">
                <InfoGrid
                  rows={[
                    {
                      icon: <Users />,
                      label: "Members Involved",
                      value: application?.memberInvolved,
                    },
                    {
                      icon: <StickyNote />,
                      label: "Remark",
                      value: application?.remark,
                      isLongText: true,
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