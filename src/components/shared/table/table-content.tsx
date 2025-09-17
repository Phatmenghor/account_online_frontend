import { TableColumn } from "@/components/shared/table/table";
import { Button } from "@/components/ui/button";
import { indexDisplay } from "@/utils/common/common";
import { DateTimeFormat } from "@/utils/date/date-time-format";
import { Check, Edit, Eye, RotateCcw, Trash } from "lucide-react";
import { CustomAvatar } from "../image/custom-avatar";
import { RoleBadge } from "../badge/role-badge";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { AllUserModel, UserModel } from "@/models/user/user.response";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTranslations } from "next-intl";

interface userTableHandlers {
  handleEditUser: (user: UserModel) => void;
  handleViewUserDetail: (user: UserModel) => void;
  handleDeleteUser: (user: UserModel) => void;
  handleResetPassword: (user: UserModel) => void;
  handleUserStatusToggle: (user: UserModel) => void;
}

interface userTableOptions {
  data: AllUserModel | null;
  handlers: userTableHandlers;
}

export const createUserTableColumns = ({
  data,
  handlers,
}: userTableOptions): TableColumn<UserModel>[] => {
  const {
    handleEditUser,
    handleViewUserDetail,
    handleDeleteUser,
    handleUserStatusToggle,
    handleResetPassword,
  } = handlers;

  const tUser = useTranslations("user.table-header-user");
  const tCommon = useTranslations("common");

  return [
    {
      key: "index",
      label: "#",
      className: "w-[60px]",
      render: (_, index) => (
        <span className="font-medium">
          {indexDisplay(data?.pageNo || 1, data?.pageSize || 10, index)}
        </span>
      ),
    },
    {
      key: "avatar",
      label: tUser("profile"),
      className: "w-[80px]",
      render: (user) => (
        <CustomAvatar
          imageUrl={user.profileUrl}
          name={user.fullName}
          size="md"
        />
      ),
    },
    {
      key: "idCard",
      label: tUser("idCard"),
      render: (user) => (
        <span className="font-medium">{user.idCard || "---"}</span>
      ),
    },
    {
      key: "fullName",
      label: tUser("fullName"),
      render: (user) => (
        <span className="font-medium">{user.fullName || "---"}</span>
      ),
    },
    {
      key: "email",
      label: tUser("email"),
      render: (user) => (
        <span className="font-medium">{user.email || "---"}</span>
      ),
    },
    {
      key: "userStatus",
      label: tUser("userStatus"),
      render: (user) => (
        <Switch
          checked={user.userStatus === "ACTIVE"}
          aria-label="Toggle user status"
          onCheckedChange={() => handleUserStatusToggle(user)}
          className={cn(
            "relative inline-flex h-5 w-9 items-center rounded-full transition-colors",
            "bg-gray-300 dark:bg-gray-600 data-[state=checked]:bg-orange-500 dark:data-[state=checked]:bg-orange-400"
          )}
        >
          <div
            className={cn(
              "inline-block h-6 w-11 transform rounded-full bg-white dark:bg-gray-100 shadow-md transition-transform",
              "translate-x-1 data-[state=checked]:translate-x-5"
            )}
          >
            {user.userStatus === "ACTIVE" && (
              <Check className="h-6 m-auto text-orange-600 dark:text-orange-300" />
            )}
          </div>
        </Switch>
      ),
    },
    {
      key: "userRole",
      label: tUser("userRole"),
      render: (user) => <RoleBadge role={user.userRole} />,
    },
    {
      key: "createdAt",
      label: tUser("createdAt"),
      render: (user) => (
        <span className="text-muted-foreground">
          {DateTimeFormat(user.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      label: tUser("actions"),
      className: "w-[160px]",
      render: (user) => (
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleEditUser(user)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{tCommon("edit")}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleResetPassword(user)}
                >
                  <RotateCcw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{tCommon("reset-password")}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleViewUserDetail(user)}
                >
                  <Eye className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{tCommon("view")}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteUser(user)}
                >
                  <Trash className="h-3 w-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{tCommon("delete")}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      ),
    },
  ];
};
