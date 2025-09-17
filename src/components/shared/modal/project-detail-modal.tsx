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
  Database,
  Server,
  Calendar,
  Users,
  StickyNote,
} from "lucide-react";
import { ProjectModel } from "@/models/project/project.response";
import { getProjectByIdService } from "@/services/dashboard/project/project.service";

interface ProjectViewModalProps {
  projectId: number;
  isOpen?: boolean;
  onClose?: () => void;
}

export default function ProjectViewModal({
  projectId,
  isOpen = true,
  onClose = () => {},
}: ProjectViewModalProps) {
  const [project, setProject] = useState<ProjectModel | null>(null);
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

    const fetchProject = async () => {
      setLoading(true);
      try {
        const data = await getProjectByIdService(projectId);
        setProject(data);
      } catch (error) {
        console.error("Failed to fetch project:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId, isOpen]);

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
                {project?.projectName || "Project Details"}
              </h2>
              <p className="text-xs text-muted-foreground">
                Project overview & details
              </p>
            </div>
          </DialogTitle>
        </DialogHeader>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {loading ? (
            <div className="text-center text-muted-foreground">
              Loading project...
            </div>
          ) : (
            <>
              {/* Project Info */}
              <Section title="Project Info">
                <InfoGrid
                  rows={[
                    {
                      icon: <Briefcase />,
                      label: "Type",
                      value: project?.type,
                    },
                    {
                      icon: <Calendar />,
                      label: "Created At",
                      value: formatDate(project?.createdAt || ""),
                    },
                    {
                      icon: <Calendar />,
                      label: "Updated At",
                      value: formatDate(project?.updatedAt || ""),
                    },
                  ]}
                />
              </Section>

              <Separator />

              {/* Database Info */}
              <Section title="Database Info">
                <InfoGrid
                  rows={[
                    {
                      icon: <Database />,
                      label: "Database Name",
                      value: project?.dbName,
                    },
                    {
                      icon: <Database />,
                      label: "Database Type",
                      value: project?.dbType,
                    },
                    {
                      icon: <Server />,
                      label: "DB Server",
                      value: project?.dbServer,
                    },
                    {
                      icon: <Server />,
                      label: "Host Server",
                      value: project?.hostServer,
                    },
                    {
                      icon: <Server />,
                      label: "Host Port",
                      value: project?.hostPort?.toString(),
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
                      value: project?.memberInvolved,
                    },
                    {
                      icon: <StickyNote />,
                      label: "Remark",
                      value: project?.remark,
                      isLongText: true, // Mark this as a long text field
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
