import React, { useCallback, useEffect, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { getUserByIdService } from "@/services/dashboard/user/user.service";
import { UserModel } from "@/models/user/user.response";
import { Status } from "@/constants/AppResource/filter/filter";
import {
  CreateUserSchema,
  UpdateUserSchema,
  CreateUserForm,
  UpdateUserForm,
} from "@/models/user/user.schema";
import { CreateUserReq, UpdateUserReq } from "@/models/user/user.request";
import { ROLE_FILTER } from "@/constants/AppResource/display-list/role/role";

// Config
export const STATUS_USER_OPTIONS = [
  { value: Status.ACTIVE, label: "Active" },
  { value: Status.INACTIVE, label: "Inactive" },
];

// Types
export enum ModalMode {
  CREATE_MODE = "create",
  UPDATE_MODE = "update",
}
type Props = {
  mode: ModalMode;
  userId: number | null;
  onClose: () => void;
  isOpen: boolean;
  isSubmitting?: boolean;
  onSave: (data: UpdateUserForm | CreateUserForm) => void;
};

function ModalUser({
  isOpen,
  onClose,
  userId,
  mode,
  onSave,
  isSubmitting = false,
}: Props) {
  const isCreate = mode === ModalMode.CREATE_MODE;
  const schema = isCreate ? CreateUserSchema : UpdateUserSchema;

  const [showPassword, setShowPassword] = useState(false);
  const [userDetail, setUserDetail] = useState<UserModel | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserForm | UpdateUserForm>({
    resolver: zodResolver(schema),
    defaultValues: {
      id: 0,
      username: "",
      fullName: "",
      email: "",
      password: "",
      role: ROLE_FILTER[0]?.value ?? "",
      status: STATUS_USER_OPTIONS[0]?.value ?? "",
      position: "",
      profileUrl: "",
    } as any,
  });

  // Load user detail if editing
  const loadUserById = useCallback(async () => {
    if (!userId) return;
    try {
      const response = await getUserByIdService(userId);
      setUserDetail(response);
    } catch (error) {
      console.log("Fail to fetch user by id", userId);
    }
  }, [userId]);

  useEffect(() => {
    loadUserById();
  }, [loadUserById]);

  // Reset form when opening
  useEffect(() => {
    if (isOpen) {
      reset(
        isCreate
          ? {
              username: "",
              email: "",
              password: "",
              fullName: "",
              role: ROLE_FILTER[0]?.value ?? "",
              status: STATUS_USER_OPTIONS[0]?.value ?? "",
              position: "",
            }
          : {
              id: userDetail?.id ?? 0,
              username: userDetail?.idCard ?? "",
              email: userDetail?.email ?? "",
              fullName: userDetail?.fullName ?? "",
              role: userDetail?.userRole ?? ROLE_FILTER[0]?.value ?? "",
              status:
                userDetail?.userStatus ?? STATUS_USER_OPTIONS[0]?.value ?? "",
              position: userDetail?.position ?? "",
              profileUrl: userDetail?.profileUrl ?? "",
            }
      );
    }
  }, [isOpen, isCreate, userDetail, reset]);

  // Submit
  const onSubmit = (data: CreateUserForm | UpdateUserForm) => {
    if (isCreate) {
      const createData = data as CreateUserForm;
      const payload: CreateUserForm = {
        username: createData?.username?.trim() || "",
        email: createData?.email?.trim() || "",
        password: createData?.password!,
        fullName: createData.fullName,
        role: createData.role,
        position: createData.position,
      };
      onSave(payload);
    } else {
      const updateData = data as UpdateUserForm;

      const payload: UpdateUserForm = {
        id: updateData.id || 0,
        username: updateData.username,
        email: updateData.email,
        fullName: updateData.fullName,
        status: updateData.status,
        profileUrl: updateData.profileUrl,
        position: updateData.position,
      };
      onSave(payload);
    }
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isCreate ? "Create User" : "Edit User"}</DialogTitle>
          <DialogDescription>
            {isCreate
              ? "Fill out the form to create a new user."
              : "Update user information below."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2 pt-4">
          {/* Username */}
          <div className="space-y-1">
            <Label htmlFor="username">Username *</Label>
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
              <p className="text-sm text-destructive">
                {errors.username.message as string}
              </p>
            )}
          </div>

          {/* Email */}
          <div className="space-y-1">
            <Label htmlFor="email">Email *</Label>
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
              <p className="text-sm text-destructive">
                {errors.email.message as string}
              </p>
            )}
          </div>

          {/* Password (Create only) */}
          {isCreate && (
            <div className="space-y-1">
              <Label htmlFor="password">Password *</Label>
              <div className="relative">
                <Controller
                  control={control}
                  name="password"
                  render={({ field }) => (
                    <Input
                      {...field}
                      id="password"
                      type={showPassword ? "text" : "password"}
                      disabled={isSubmitting}
                      className={
                        errors.root?.message ? "border-red-500 pr-10" : ""
                      }
                    />
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((p) => !p)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.root?.message && (
                <p className="text-sm text-destructive">
                  {errors.root.message as string}
                </p>
              )}
            </div>
          )}

          {/* Role (always required in schema, but optional in update) */}
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
                  <SelectTrigger
                    id="role"
                    className={errors.root?.message ? "border-red-500" : ""}
                  >
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLE_FILTER.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
            {errors.root?.message && (
              <p className="text-sm text-destructive">
                {errors.root.message as string}
              </p>
            )}
          </div>

          {/* Status (Update only) */}
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
                    <SelectTrigger
                      id="status"
                      className={errors.root?.message ? "border-red-500" : ""}
                    >
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_USER_OPTIONS.map((status) => (
                        <SelectItem key={status.value} value={status.value}>
                          {status.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.root?.message && (
                <p className="text-sm text-destructive">
                  {errors.root.message as string}
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Processing..." : isCreate ? "Create" : "Update"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default ModalUser;
