import { Button } from "@/components/ui/button";
import { indexDisplay } from "@/utils/common/common";
import { DateTimeFormat } from "@/utils/date/date-time-format";
import { Edit, Eye, RotateCcw, Trash } from "lucide-react";
import { CustomAvatar } from "../image/custom-avatar";
import { RoleBadge } from "../badge/role-badge";
import { AllUserModel, UserModel } from "@/models/user/user.response";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTranslations } from "next-intl";
import { TableColumn } from "./data-table";

interface userTableHandlers {
  handleEditUser: (user: UserModel) => void;
  handleViewUserDetail: (user: UserModel) => void;
  handleDeleteUser: (user: UserModel) => void;
  handleResetPassword: (user: UserModel) => void;
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
      label: "Profile",
      truncate: true,
      maxWidth: "300px",
      minWidth: "150px",
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
      label: "Username",
      truncate: true,
      maxWidth: "300px",
      minWidth: "150px",
      render: (user) => (
        <span className="font-medium">{user.idCard || "---"}</span>
      ),
    },
    {
      key: "fullName",
      label: "Full Name",
      truncate: true,
      maxWidth: "300px",
      minWidth: "150px",
      render: (user) => (
        <span className="font-medium">{user.fullName || "---"}</span>
      ),
    },
    {
      key: "email",
      label: "Email",
      truncate: true,
      maxWidth: "300px",
      minWidth: "150px",
      render: (user) => (
        <span className="font-medium">{user.email || "---"}</span>
      ),
    },

    {
      key: "userRole",
      truncate: true,
      maxWidth: "300px",
      minWidth: "150px",
      label: "Role",
      render: (user) => <RoleBadge role={user.userRole} />,
    },
    {
      key: "createdAt",
      truncate: true,
      maxWidth: "300px",
      minWidth: "150px",
      label: "Created At",
      render: (user) => (
        <span className="text-muted-foreground">
          {DateTimeFormat(user.createdAt)}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      truncate: true,
      maxWidth: "300px",
      minWidth: "150px",
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
