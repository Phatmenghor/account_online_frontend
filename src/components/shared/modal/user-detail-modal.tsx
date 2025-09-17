"use client";

import { Dialog, DialogContent, DialogFooter } from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  User,
  Mail,
  Calendar,
  Shield,
  Badge,
  Briefcase,
  Hash,
  X,
} from "lucide-react";
import { UserModel } from "@/models/user/user.response";

export default function UserViewModal({
  user,
  isOpen = true,
  onClose = () => {},
}: {
  user?: UserModel;
  isOpen?: boolean;
  onClose?: () => void;
}) {
  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "active":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "inactive":
        return "bg-slate-100 text-slate-600 border-slate-200";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "developer":
        return "bg-rose-100 text-rose-800 border-rose-200";
      case "admin":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "user":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-auto rounded-2xl shadow-xl bg-white p-0 overflow-y-auto h-screen border border-slate-200">
        <div className="flex flex-col">
          {/* Header */}
          <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-4 text-center relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-20 h-20 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3 overflow-hidden">
              {user?.profileUrl ? (
                <img
                  src={user.profileUrl}
                  alt={user.fullName || "User"}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <User className="w-10 h-10 text-white" />
              )}
            </div>

            <DialogTitle className="text-xl font-bold text-white mb-1">
              {user?.fullName || "User Profile"}
            </DialogTitle>
            <p className="text-slate-300 text-sm">View user details</p>
          </div>

          {/* User Details */}
          <div className="p-6 space-y-5">
            {/* Status & Role */}
            <div className="flex justify-center gap-3">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                  user?.userStatus || ""
                )}`}
              >
                <div
                  className={`w-2 h-2 rounded-full mr-2 ${
                    user?.userStatus?.toLowerCase() === "active"
                      ? "bg-emerald-500"
                      : "bg-slate-400"
                  }`}
                />
                {user?.userStatus || "ACTIVE"}
              </span>

              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getRoleColor(
                  user?.userRole || ""
                )}`}
              >
                <Shield className="w-3 h-3 mr-1" />
                {user?.userRole || "USER"}
              </span>
            </div>

            <Separator className="bg-slate-200" />

            {/* Contact Info */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-slate-700">
                Contact Info
              </h4>

              <InfoRow
                icon={<Mail className="w-4 h-4 text-slate-600" />}
                label="Email"
                value={user?.email || "N/A"}
              />
              <InfoRow
                icon={<Calendar className="w-4 h-4 text-slate-600" />}
                label="Created At"
                value={formatDate(user?.createdAt || "")}
              />
              <InfoRow
                icon={<Calendar className="w-4 h-4 text-slate-600" />}
                label="Updated At"
                value={formatDate(user?.updatedAt || "")}
              />
              <InfoRow
                icon={<Briefcase className="w-4 h-4 text-slate-600" />}
                label="Position"
                value={user?.position || "N/A"}
              />
              <InfoRow
                icon={<Hash className="w-4 h-4 text-slate-600" />}
                label="ID Card"
                value={user?.idCard || "N/A"}
              />
            </div>

            <Separator className="bg-slate-200" />

            {/* Account Summary */}
            <div className="bg-slate-50 rounded-xl p-3">
              <h4 className="text-sm font-semibold text-slate-700 mb-3">
                Account Summary
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                    <Badge className="w-4 h-4 text-emerald-600" />
                  </div>
                  <p className="text-xs text-slate-500">Access Level</p>
                  <p className="text-sm font-semibold text-slate-900">
                    Full Access
                  </p>
                </div>
              </div>
            </div>

            {/* Footer Button */}
            <DialogFooter className="flex justify-center">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Reusable info row component
const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) => (
  <div className="flex items-center gap-3">
    <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
      {icon}
    </div>
    <div className="flex-1 min-w-0">
      <p className="text-xs font-medium text-slate-500 mb-1">{label}</p>
      <p className="text-sm text-slate-900 break-all">{value}</p>
    </div>
  </div>
);
