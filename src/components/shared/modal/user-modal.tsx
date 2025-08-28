import React, { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
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

// Configuration - Customize these for your needs
export const STATUS_USER_OPTIONS = [
  { value: Status.ACTIVE, label: "Active" },
  { value: Status.INACTIVE, label: "Inactive" },
];

export const DATA_ROLE_OPTIONS = [
  { value: "ADMIN", label: "Admin" },
  { value: "USER", label: "User" },
  { value: "DEVELOPER", label: "Developer" },
];

// Validation Schemas
const baseSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  status: z.string("Status is required"),
});

const createUserSchema = baseSchema.extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.string("Role is required"),
});

const updateUserSchema = baseSchema;

// Types
export enum ModalMode {
  CREATE_MODE = "create",
  UPDATE_MODE = "update",
}

interface CreateUsers {
  name: string;
  email: string | undefined;
  password: string | undefined;
  role: string | undefined;
  status: string | undefined;
}

export interface UpdateUsers {
  id?: string;
  name?: string;
  email?: string;
  role?: string;
  status?: string | undefined;
}

export type UserForm = z.infer<typeof createUserSchema>;

export type UserFormData = Partial<CreateUsers> &
  Partial<UpdateUsers> & {
    id?: string;
    userRole?: string;
    userStatus?: string;
  };

type Props = {
  mode: ModalMode;
  userId: string | null;
  onClose: () => void;
  isOpen: boolean;
  isSubmitting?: boolean;
  onSave: (data: Partial<CreateUsers> | Partial<UpdateUsers>) => void;
};

// Utility functions
const getActiveStatusValue = () => {
  const activeStatus = STATUS_USER_OPTIONS.find(
    (status) =>
      status.label.toLowerCase() === "active" ||
      status.value.toLowerCase() === "active"
  );
  return activeStatus?.value || STATUS_USER_OPTIONS[0]?.value || "";
};

const getDefaultRoleValue = () => {
  return DATA_ROLE_OPTIONS[0]?.value || "";
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
  const schema = isCreate ? createUserSchema : updateUserSchema;
  const activeStatusValue = getActiveStatusValue();
  const [showPassword, setShowPassword] = useState(false);
  const [userDetail, setUserDetail] = useState<UserModel | null>(null);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormData>({
    // resolver: zodResolver(schema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      role: getDefaultRoleValue(),
      status: activeStatusValue,
    },
  });

  const loadUserById = useCallback(() => {
    if (!userId) return;
    try {
      const response = getUserByIdService(userId);
      if (response) {
        setUserDetail(response);
      }
    } catch (error) {
      console.log("Fail to fetch user by id", userId);
    }
  }, [userId, isOpen, reset, isCreate]);

  useEffect(() => {
    loadUserById();
  }, [loadUserById]);

  // Reset form when modal opens or data changes
  useEffect(() => {
    if (isOpen) {
      reset({
        id: userId || "",
        name: isCreate ? "" : userDetail?.name ?? "",
        email: isCreate ? "" : userDetail?.email ?? "",
        password: "",
        role: isCreate
          ? getDefaultRoleValue()
          : userDetail?.role ?? getDefaultRoleValue(),
        status: isCreate
          ? activeStatusValue
          : userDetail?.status ?? activeStatusValue,
      });
    }
  }, [userDetail, reset, isCreate, isOpen, activeStatusValue]);

  // Form submission handler
  const onSubmit = (data: UserFormData) => {
    if (isCreate) {
      const payload = {
        id: data?.id,
        email: data?.email?.trim(),
        name: data?.name?.trim() || "",
        password: data?.password?.trim(),
        role: data.role,
        status: data.status,
      };
      onSave(payload);
    } else {
      const payload: UpdateUsers = {
        id: data.id, // ✅ include id!
        name: data.name,
        email: data.email,
        role: data.role, // if you allow editing role
        status: data.status,
      };
      onSave(payload);
    }
    onClose();
  };

  const handleClose = () => {
    onClose();
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full max-w-lg md:max-w-xl lg:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isCreate ? "Create User" : "Edit User"}</DialogTitle>
          <DialogDescription>
            {isCreate
              ? "Fill out the form to create a new user."
              : "Update user information below."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2 pt-4">
          {/* Email Field */}
          <div className="space-y-1">
            <Label htmlFor="name">
              Name <span className="text-red-500">*</span>
            </Label>
            <Controller
              control={control}
              name="name"
              render={({ field }) => (
                <Input
                  {...field}
                  id="name"
                  type="text"
                  placeholder="john doe"
                  disabled={isSubmitting}
                  autoComplete="off"
                  className={errors.name ? "border-red-500" : ""}
                />
              )}
            />
            {errors.name && (
              <p className="text-sm text-destructive">{errors.name.message}</p>
            )}
          </div>

          {/* Email Field */}
          <div className="space-y-1">
            <Label htmlFor="email">
              Email <span className="text-red-500">*</span>
            </Label>
            <Controller
              control={control}
              name="email"
              render={({ field }) => (
                <Input
                  {...field}
                  id="email"
                  type="email"
                  placeholder="email@example.com"
                  disabled={isSubmitting}
                  autoComplete="off"
                  className={errors.email ? "border-red-500" : ""}
                />
              )}
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          {/* Password Field - Create Mode Only */}
          {isCreate && (
            <div className="space-y-1">
              <Label htmlFor="password">
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
                      placeholder="••••••••"
                      disabled={isSubmitting}
                      autoComplete="new-password"
                      className={
                        errors.password ? "border-red-500 pr-10" : "pr-10"
                      }
                    />
                  )}
                />
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="absolute inset-y-0 right-0 flex items-center pr-3"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-gray-500" />
                  ) : (
                    <Eye className="h-4 w-4 text-gray-500" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-destructive">
                  {errors.password.message}
                </p>
              )}
            </div>
          )}

          {/* Role Field - Create Mode Only */}
          {!isCreate && (
            <div className="space-y-1">
              <Label htmlFor="role-select">
                Role <span className="text-red-500">*</span>
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
                      id="role-select"
                      className={`bg-white dark:bg-inherit ${
                        errors.role ? "border-red-500" : ""
                      }`}
                    >
                      <SelectValue placeholder="Select role" />
                    </SelectTrigger>
                    <SelectContent>
                      {DATA_ROLE_OPTIONS.map((role) => (
                        <SelectItem key={role.value} value={role.value}>
                          {role.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.role && (
                <p className="text-sm text-destructive">
                  {errors.role.message}
                </p>
              )}
            </div>
          )}

          {/* Status Field */}
          {!isCreate && (
            <div className="space-y-1">
              <Label htmlFor="status-select">
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
                      id="status-select"
                      className={`bg-white dark:bg-inherit ${
                        errors.status ? "border-red-500" : ""
                      }`}
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
              {errors.status && (
                <p className="text-sm text-destructive">
                  {errors.status.message}
                </p>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
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
