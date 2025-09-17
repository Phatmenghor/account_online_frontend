"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Eye, EyeOff } from "lucide-react";
import { getUserByIdService } from "@/services/dashboard/user/user.service";
import { UserModel } from "@/models/user/user.response";
import { ROLE_FILTER } from "@/constants/AppResource/display-list/role/role";
import {
  CreateUserSchema,
  UpdateUserSchema,
  CreateUserForm,
  UpdateUserForm,
} from "@/models/user/user.schema";
import {
  ModalMode,
  STATUS_USER_OPTIONS,
} from "@/constants/AppResource/display-list/status/status";
import { CreateUserReq, UpdateUserReq } from "@/models/user/user.request";
import { Status } from "@/constants/AppResource/filter/filter";

type ModalUserProps = {
  isOpen: boolean;
  onClose: () => void;
  mode: ModalMode;
  userId?: number;
  isSubmitting?: boolean;
  onSave: (
    data: CreateUserReq | { id: number; updates: UpdateUserReq }
  ) => void;
};

export default function ModalUser({
  isOpen,
  onClose,
  mode,
  userId,
  onSave,
  isSubmitting = false,
}: ModalUserProps) {
  const isCreate = mode === ModalMode.CREATE_MODE;

  const [showPassword, setShowPassword] = useState(false);
  const [userDetail, setUserDetail] = useState<UserModel | null>(null);

  const form = useForm<CreateUserForm | UpdateUserForm>({
    resolver: zodResolver(isCreate ? CreateUserSchema : UpdateUserSchema),
    defaultValues: isCreate
      ? {
          username: "",
          email: "",
          password: "",
          fullName: "",
          role: ROLE_FILTER[0]?.value || "",
          position: "",
          profileUrl: "",
          status: Status.ACTIVE,
        }
      : undefined, // will set later after fetching user
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = form;

  const loadUserById = useCallback(async () => {
    if (!userId || isCreate) return;
    try {
      const user = await getUserByIdService(userId);
      setUserDetail(user);
      reset({
        id: user.id,
        username: user.idCard || "",
        email: user.email || "",
        fullName: user.fullName || "",
        status: user.userStatus || STATUS_USER_OPTIONS[0]?.value,
        position: user.position || "",
        profileUrl: user.profileUrl || "",
      });
    } catch (err) {
      console.error("Failed to fetch user:", err);
    }
  }, [userId, isCreate, reset]);

  useEffect(() => {
    if (isOpen && !isCreate) loadUserById();
    if (isOpen && isCreate) {
      reset({
        username: "",
        email: "",
        password: "",
        fullName: "",
        role: ROLE_FILTER[0]?.value || "",
        position: "",
        profileUrl: "",
        status: Status.ACTIVE,
      });
    }
  }, [isOpen, isCreate, loadUserById, reset]);

  const onSubmit = (data: CreateUserForm | UpdateUserForm) => {
    if (isCreate) {
      const payload: CreateUserReq = data as CreateUserForm;
      onSave(payload);
    } else {
      const updateData = data as UpdateUserForm;
      if (!updateData.id) return console.error("Missing ID for update");

      const payload: UpdateUserReq = {
        username: updateData.username?.trim(),
        email: updateData.email?.trim(),
        fullName: updateData.fullName?.trim(),
        status: updateData.status,
        position: updateData.position?.trim(),
        profileUrl: updateData.profileUrl?.trim(),
      };
      onSave({ id: updateData.id, updates: payload });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg w-full max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isCreate ? "Create User" : "Edit User"}</DialogTitle>
          <DialogDescription>
            {isCreate
              ? "Fill in the details to create a new user."
              : "Update the user information below."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 mt-2">
          {!isCreate && (
            <Controller
              control={control}
              name="id"
              render={({ field }) => <input type="hidden" {...field} />}
            />
          )}

          {/* Username */}
          <div className="space-y-1">
            <Label htmlFor="username">Username {isCreate ? "*" : ""}</Label>
            <Controller
              control={control}
              name="username"
              render={({ field }) => (
                <Input
                  {...field}
                  id="username"
                  disabled={isSubmitting}
                  className={errors.username ? "border-red-500" : ""}
                />
              )}
            />
            {errors.username && (
              <p className="text-destructive text-sm">
                {errors.username.message as string}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1">
            <Label htmlFor="email">Email {isCreate ? "*" : ""}</Label>
            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <Input
                  {...field}
                  id="email"
                  type="email"
                  disabled={isSubmitting}
                  className={errors.email ? "border-red-500" : ""}
                />
              )}
            />
            {errors.email && (
              <p className="text-destructive text-sm">
                {errors.email.message as string}
              </p>
            )}
          </div>

          {/* Password (create only) */}
          {isCreate && (
            <div className="space-y-1 relative">
              <Label htmlFor="password">Password *</Label>
              <Controller
                control={control}
                name="password"
                render={({ field }) => (
                  <Input
                    {...field}
                    id="password"
                    type={showPassword ? "text" : "password"}
                    disabled={isSubmitting}
                    className={errors.root?.message ? "border-red-500" : ""}
                  />
                )}
              />
              <button
                type="button"
                className="absolute right-2 top-9"
                onClick={() => setShowPassword((p) => !p)}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              {errors.root?.message && (
                <p className="text-destructive text-sm">
                  {errors.root.message as string}
                </p>
              )}
            </div>
          )}

          {/* Full Name */}
          <div className="space-y-1">
            <Label htmlFor="fullName">Full Name</Label>
            <Controller
              control={control}
              name="fullName"
              render={({ field }) => (
                <Input {...field} id="fullName" disabled={isSubmitting} />
              )}
            />
          </div>

          {/* Position */}
          <div className="space-y-1">
            <Label htmlFor="position">Position</Label>
            <Controller
              control={control}
              name="position"
              render={({ field }) => (
                <Input {...field} id="position" disabled={isSubmitting} />
              )}
            />
          </div>

          {/* Role (create only) */}
          {isCreate && (
            <div className="space-y-1">
              <Label htmlFor="role">Role</Label>
              <Controller
                control={control}
                name="role"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="role">
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {ROLE_FILTER.map((r) => (
                        <SelectItem key={r.value} value={r.value}>
                          {r.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}

          {/* Status (update only) */}
          {!isCreate && (
            <div className="space-y-1">
              <Label htmlFor="status">Status</Label>
              <Controller
                control={control}
                name="status"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_USER_OPTIONS.map((s) => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
          )}

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isCreate ? "Create" : "Update"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
