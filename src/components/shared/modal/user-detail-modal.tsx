"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { User, Mail, Calendar, Shield, Badge, X, Edit3 } from "lucide-react";
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
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "ACTIVE":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "INACTIVE":
        return "bg-slate-100 text-slate-600 border-slate-200";
      default:
        return "bg-slate-100 text-slate-600 border-slate-200";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "DEVELOPER":
        return "bg-rose-100 text-rose-800 border-rose-200";
      case "ADMIN":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "USER":
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
          <div className="bg-gradient-to-r from-slate-700 to-slate-800 p-2 text-center relative">
            <button
              onClick={onClose}
              className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="w-16 h-16 bg-white/10 rounded-full flex items-center justify-center mx-auto mb-3 backdrop-blur-sm overflow-hidden">
              {user?.profileUrl ? (
                <img
                  src={user?.profileUrl || ""}
                  alt={user?.name || "User"}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <User className="w-8 h-8 text-white" />
              )}
            </div>

            <DialogTitle className="text-xl font-bold text-white mb-1">
              User Profile
            </DialogTitle>
            <p className="text-slate-300 text-sm">
              View user information and details
            </p>
          </div>

          {/* User Content */}
          <div className="p-6 space-y-5">
            {/* User Basic Info */}
            <div className="text-center">
              <h3 className="text-xl font-bold text-slate-900 mb-1">
                {user?.name}
              </h3>

              {/* Status and Role Badges */}
              <div className="flex justify-center gap-2 mb-4">
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                    user?.status || ""
                  )}`}
                >
                  <div
                    className={`w-2 h-2 rounded-full mr-2 ${
                      user?.status.toLowerCase() === "active"
                        ? "bg-emerald-500"
                        : "bg-slate-400"
                    }`}
                  />
                  {user?.status || "ACTIVE"}
                </span>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${getRoleColor(
                    user?.role || ""
                  )}`}
                >
                  <Shield className="w-3 h-3 mr-1" />
                  {user?.role}
                </span>
              </div>
            </div>

            <Separator className="bg-slate-200" />

            {/* Contact Information */}
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-slate-700 mb-3">
                Contact Information
              </h4>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="w-4 h-4 text-slate-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-slate-500 mb-1">
                      Email Address
                    </p>
                    <p className="text-sm text-slate-900 break-all">
                      {user?.email || "N/A"}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-slate-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Calendar className="w-4 h-4 text-slate-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-medium text-slate-500 mb-1">
                      Created Date
                    </p>
                    <p className="text-sm text-slate-900">
                      {formatDate(user?.createdAt || "")}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="bg-slate-200" />

            {/* Quick Stats */}
            <div className="bg-slate-50 rounded-xl p-2">
              <h4 className="text-sm font-semibold text-slate-700 mb-3">
                Account Summary
              </h4>
              <div className="grid grid-cols-2 gap-2">
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

            {/* Action Buttons */}
            <DialogFooter className="flex justify-between gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1 border-slate-300 text-slate-700 hover:bg-slate-50 font-medium py-2"
              >
                Close
              </Button>
            </DialogFooter>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
