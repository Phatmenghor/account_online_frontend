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
import { ScrollArea } from "@/components/ui/scroll-area";
import { Eye, EyeOff, UserPlus, UserCog, Loader2 } from "lucide-react";
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
import Loading from "@/components/shared/common/loading";

type ModalUserProps = {
  isOpen: boolean;
  onClose: () => void;
  mode: ModalMode;
  userId?: number;
  isSubmitting?: boolean;
  error?: string | null;
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
  error = null,
}: ModalUserProps) {
  const isCreate = mode === ModalMode.CREATE_MODE;

  const [showPassword, setShowPassword] = useState(false);
  const [userDetail, setUserDetail] = useState<UserModel | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(false);

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
      : undefined,
  });

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = form;

  const loadUserById = useCallback(async () => {
    if (!userId || isCreate) return;

    setIsLoadingData(true);
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
    } finally {
      setIsLoadingData(false);
    }
  }, [userId, isCreate, reset]);

  useEffect(() => {
    if (isOpen && !isCreate) {
      loadUserById();
    }
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
      setUserDetail(null);
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

  const handleClose = () => {
    reset();
    setUserDetail(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl h-[90vh] p-0 gap-0 flex flex-col">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b bg-muted/30 flex-shrink-0">
          <div className="flex items-center gap-4 pr-8">
            <div
              className={`p-2 rounded-full ${
                isCreate ? "bg-green-100" : "bg-blue-100"
              }`}
            >
              {isCreate ? (
                <UserPlus className="h-5 w-5 text-green-600" />
              ) : (
                <UserCog className="h-5 w-5 text-blue-600" />
              )}
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl font-semibold">
                {isCreate ? "Create New User" : "Edit User"}
              </DialogTitle>
              <DialogDescription className="text-base text-muted-foreground">
                {isCreate
                  ? "Fill in the details to create a new user account"
                  : userDetail
                  ? `Update information for "${
                      userDetail.fullName || userDetail.email
                    }"`
                  : "Loading user information..."}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Content */}
        <ScrollArea className="flex-1 min-h-0">
          <div className="p-6">
            {/* Loading State */}
            {isLoadingData ? (
              <Loading />
            ) : !isCreate && !userDetail ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">No user data available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Error Display */}
                {error && (
                  <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                    <p className="text-sm text-destructive font-medium">
                      {error}
                    </p>
                  </div>
                )}

                {/* Hidden ID field for update mode */}
                {!isCreate && (
                  <Controller
                    control={control}
                    name="id"
                    render={({ field }) => <input type="hidden" {...field} />}
                  />
                )}

                {/* Username & Email */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="text-sm font-medium">
                      Username{" "}
                      {isCreate && <span className="text-red-500">*</span>}
                    </Label>
                    <Controller
                      control={control}
                      name="username"
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="username"
                          placeholder="johndoe"
                          disabled={isSubmitting}
                          className={`transition-colors focus:border-green-500 ${
                            errors.username ? "border-red-500" : ""
                          }`}
                        />
                      )}
                    />
                    {errors.username && (
                      <p className="text-sm text-red-600">
                        {errors.username.message as string}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-sm font-medium">
                      Email{" "}
                      {isCreate && <span className="text-red-500">*</span>}
                    </Label>
                    <Controller
                      control={control}
                      name="email"
                      render={({ field }) => (
                        <Input
                          {...field}
                          id="email"
                          type="email"
                          placeholder="john@example.com"
                          disabled={isSubmitting}
                          className={`transition-colors focus:border-green-500 ${
                            errors.email ? "border-red-500" : ""
                          }`}
                        />
                      )}
                    />
                    {errors.email && (
                      <p className="text-sm text-red-600">
                        {errors.email.message as string}
                      </p>
                    )}
                  </div>
                </div>

                {/* Password (create only) */}
                {isCreate && (
                  <div className="space-y-2">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <Controller
                        control={control}
                        name="password"
                        render={({ field }) => (
                          <Input
                            {...field}
                            id="password"
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter secure password"
                            disabled={isSubmitting}
                            className={`transition-colors focus:border-green-500 pr-10 ${
                              (errors as any).password ? "border-red-500" : ""
                            }`}
                          />
                        )}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => setShowPassword((p) => !p)}
                        tabIndex={-1}
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {(errors as any).password && (
                      <p className="text-sm text-red-600">
                        {(errors as any).password.message as string}
                      </p>
                    )}
                  </div>
                )}

                {/* Full Name */}
                <div className="space-y-2">
                  <Label htmlFor="fullName" className="text-sm font-medium">
                    Full Name
                  </Label>
                  <Controller
                    control={control}
                    name="fullName"
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="fullName"
                        placeholder="John Doe"
                        disabled={isSubmitting}
                        className="transition-colors focus:border-green-500"
                      />
                    )}
                  />
                </div>

                {/* Position */}
                <div className="space-y-2">
                  <Label htmlFor="position" className="text-sm font-medium">
                    Position
                  </Label>
                  <Controller
                    control={control}
                    name="position"
                    render={({ field }) => (
                      <Input
                        {...field}
                        id="position"
                        placeholder="Software Engineer"
                        disabled={isSubmitting}
                        className="transition-colors focus:border-green-500"
                      />
                    )}
                  />
                </div>

                {/* Role (create only) */}
                {isCreate && (
                  <div className="space-y-2">
                    <Label htmlFor="role" className="text-sm font-medium">
                      Role
                    </Label>
                    <Controller
                      control={control}
                      name="role"
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isSubmitting}
                        >
                          <SelectTrigger
                            id="role"
                            className="transition-colors focus:border-green-500"
                          >
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
                  <div className="space-y-2">
                    <Label htmlFor="status" className="text-sm font-medium">
                      Status <span className="text-red-500">*</span>
                    </Label>
                    <Controller
                      control={control}
                      name="status"
                      render={({ field }) => (
                        <Select
                          value={field.value}
                          onValueChange={field.onChange}
                          disabled={isSubmitting}
                        >
                          <SelectTrigger
                            id="status"
                            className="transition-colors focus:border-green-500"
                          >
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                          <SelectContent>
                            {STATUS_USER_OPTIONS.map((s) => (
                              <SelectItem key={s.value} value={s.value}>
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`w-2 h-2 rounded-full ${
                                      s.value === Status.ACTIVE
                                        ? "bg-green-500"
                                        : "bg-gray-400"
                                    }`}
                                  ></div>
                                  {s.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                    />
                    {errors.status && (
                      <p className="text-sm text-red-600">
                        {errors.status.message as string}
                      </p>
                    )}
                  </div>
                )}

                {/* User Info Card - Read Only (edit mode only) */}
                {!isCreate && userDetail && (
                  <div className="mt-6 p-4 bg-muted/30 rounded-lg border border-border">
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 bg-primary rounded-full"></div>
                      User Information (Read Only)
                    </h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">User ID:</span>
                        <p className="font-medium">{userDetail.id}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">ID Card:</span>
                        <p className="font-medium">
                          {userDetail.idCard || "Not provided"}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Current Status:
                        </span>
                        <p className="font-medium">
                          {userDetail.userStatus || "Unknown"}
                        </p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">
                          Profile URL:
                        </span>
                        <p className="font-medium truncate">
                          {userDetail.profileUrl || "Not provided"}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="flex justify-between items-center p-6 border-t bg-muted/30 flex-shrink-0">
          <div className="text-sm text-muted-foreground flex items-center gap-2">
            {isSubmitting ? (
              <>
                <Loader2 className="h-3 w-3 animate-spin" />
                {isCreate ? "Creating user..." : "Updating user..."}
              </>
            ) : isDirty ? (
              <>
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                You have unsaved changes
              </>
            ) : (
              <>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                {isCreate ? "Ready to create" : "No changes made"}
              </>
            )}
          </div>
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit(onSubmit)}
              disabled={isSubmitting || (!isCreate && !isDirty)}
              className="min-w-[120px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isCreate ? "Creating..." : "Updating..."}
                </>
              ) : isCreate ? (
                "Create User"
              ) : (
                "Update User"
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
