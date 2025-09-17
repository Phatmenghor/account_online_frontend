"use client";

import ConfirmDialog from "@/components/shared/dialog/dialog-confirm";
import { DeleteConfirmationDialog } from "@/components/shared/dialog/dialog-delete";
import ResetPasswordModal from "@/components/shared/dialog/dialog-reset-password";
import UserViewModal from "@/components/shared/modal/user-detail-modal";
import { CustomPagination } from "@/components/shared/pagination/custom-pagination";
import { DataTable } from "@/components/shared/table/data-table";
import { createUserTableColumns } from "@/components/shared/table/table-content";
import { AppToast } from "@/components/shared/toast/app-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ROUTES } from "@/constants/AppRoutes/routes";
import { usePagination } from "@/hooks/use-pagination";
import { AllUserModel, UserModel } from "@/models/user/user.response";
import {
  createUserService,
  deleteUserService,
  getUsersService,
  updateUserService,
} from "@/services/dashboard/user/user.service";
import { useDebounce } from "@/utils/debounce/debounce";

import { Download, Search } from "lucide-react";
import { useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { startTransition, useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import StatusFilter from "@/constants/AppResource/display-list/status/status-filter";
import { AppIcons } from "@/constants/AppResource/icons/app-icons";
import {
  ExcelColumn,
  ExcelExporter,
  ExcelSheet,
} from "@/utils/export-file/excel";
import { ModalMode } from "@/constants/AppResource/display-list/status/status";
import ModalUser from "@/components/shared/modal/user-modal";
import { CreateUserReq, UpdateUserReq } from "@/models/user/user.request";

export default function UserPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [users, setUsers] = useState<AllUserModel | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isExportingToExcel, setIsExportingToExcel] = useState(false);
  const [statusFilter, setStatusFilter] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserModel | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [mode, setMode] = useState<ModalMode>(ModalMode.CREATE_MODE);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUserDetailOpen, setIsUserDetailOpen] = useState(false);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isResetPasswordDialogOpen, setIsResetPasswordDialogOpen] =
    useState(false);
  const [selectedUserToggle, setSelectedUserToggle] =
    useState<UserModel | null>(null);
  const [isToggleStatusDialogOpen, setIsToggleStatusDialogOpen] =
    useState(false);

  const t = useTranslations();

  const searchParams = useSearchParams();

  // Debounced search query - Optimized api performance when search
  const debouncedSearchQuery = useDebounce(searchQuery, 400);

  const { currentPage, updateUrlWithPage, handlePageChange } = usePagination({
    baseRoute: ROUTES.DASHBOARD.INDEX,
    defaultPageSize: 10,
  });

  useEffect(() => {
    const pageParam = searchParams.get("pageNo");
    if (!pageParam) {
      updateUrlWithPage(1, true);
    }
  }, [searchParams, updateUrlWithPage]);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await getUsersService({
        search: debouncedSearchQuery,
        pageNo: currentPage,
        pageSize: 5,
        status: statusFilter === "" ? undefined : statusFilter,
      });
      setUsers(response);
    } catch (error: any) {
      console.log("Failed to fetch users: ", error);
    } finally {
      setIsLoading(false);
    }
  }, [debouncedSearchQuery, statusFilter, currentPage]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers, debouncedSearchQuery, statusFilter]);

  // Simplified search change handler - just updates the state, debouncing handles the rest
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleUserStatusToggle = (user: UserModel) => {
    setSelectedUserToggle(user);
    setIsToggleStatusDialogOpen(true);
  };

  const handleStatusToggle = async (user: UserModel | null) => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const newStatus =
        user.userStatus.toUpperCase() === "ACTIVE" ? "INACTIVE" : "ACTIVE";

      // Optimistic update
      setUsers((prev) => {
        if (!prev) return null;
        const updatedContent = prev.content.map((item) =>
          item.id === user.id ? { ...item, status: newStatus } : item
        );
        return { ...prev, content: updatedContent };
      });

      await updateUserService(user.id, {
        status: newStatus,
      });

      AppToast({
        type: "success",
        message: "User status updated successfully",
      });
      setSelectedUserToggle(null);
      setIsToggleStatusDialogOpen(false);
    } catch (error: any) {
      AppToast({
        type: "error",
        message: "An error occurred while updating user status",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveUser = async (
    formData: CreateUserReq | { id: number; updates: UpdateUserReq }
  ) => {
    setIsSubmitting(true);
    try {
      if (mode === ModalMode.CREATE_MODE) {
        const createData = formData as CreateUserReq;

        const response = await createUserService({
          email: createData.email,
          fullName: createData.fullName,
          password: createData.password,
          role: createData.role,
          username: createData.username,
          position: createData.position,
        });

        // Optimistic update
        setUsers((prev: any) =>
          prev
            ? {
                ...prev,
                content: [response, ...prev.content],
                totalElements: prev.totalElements + 1,
              }
            : {
                content: [response],
                pageNo: 1,
                pageSize: itemsPerPage,
                totalElements: 1,
                totalPages: 1,
                hasNext: false,
                hasPrevious: false,
                first: true,
                last: true,
              }
        );

        startTransition(() => {
          AppToast({
            type: "success",
            message: "User created successfully",
            description: "New User",
          });
        });
      } else if (mode === ModalMode.UPDATE_MODE) {
        const updateData = formData as { id: number; updates: UpdateUserReq };

        if (!updateData.id) {
          console.error("Missing user id in update form");
          setIsSubmitting(false);
          return;
        }

        const response = await updateUserService(
          updateData.id,
          updateData.updates
        );

        setUsers((prev) =>
          prev
            ? {
                ...prev,
                content: prev.content.map((user) =>
                  user.id === updateData.id ? response : user
                ),
              }
            : prev
        );

        startTransition(() => {
          AppToast({
            type: "success",
            message: "User updated successfully",
            description: "Updated User",
          });
        });
      }

      setIsModalOpen(false);
      setSelectedUser(null);
      loadUsers();
    } catch (err: any) {
      toast.error(err?.errorMessage || "Failed to save user");
      AppToast({
        type: "error",
        message: "Failed to save user",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDeleteUser = async () => {
    if (!selectedUser) return;
    setIsSubmitting(true);
    try {
      await deleteUserService(selectedUser.id);
      AppToast({
        type: "success",
        message: "User deleted successfully",
      });
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      loadUsers();
    } catch (err: any) {
      AppToast({
        type: "error",
        message: "Failed to delete user",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // FIXED EXCEL EXPORT FUNCTION
  const handleExportToExcel = async (data: AllUserModel | null) => {
    setIsExportingToExcel(true);
    try {
      // Define columns with proper types and styling
      const columns: ExcelColumn[] = [
        {
          header: "ID",
          key: "id",
          width: 8,
          type: "number",
        },
        {
          header: "Name",
          key: "name",
          width: 25,
          type: "text",
        },
        {
          header: "Email",
          key: "email",
          width: 35,
          type: "text",
        },
        {
          header: "Role",
          key: "role",
          width: 15,
          type: "text",
        },
        {
          header: "Status",
          key: "status",
          width: 12,
          type: "text",
        },
        {
          header: "Created Date",
          key: "createdAt",
          width: 18,
          type: "date",
          format: "mm/dd/yyyy",
        },
      ];

      // Create exporter with professional settings
      const exporter = new ExcelExporter({
        filename: "users.xlsx",
        title: "User Management Report",
        author: "IT Department",
        useAlternateRows: true,
        protection: {
          password: "UserData2024",
          deleteRows: false,
          selectLockedCells: true,
          selectUnlockedCells: true,
        },
      });

      // Configure sheet with user data
      const sheetConfig: ExcelSheet = {
        name: "Users",
        data: data?.content ?? [],
        columns,
        autoFilter: true,
        freezeRows: 1,
        sortBy: [{ key: "id", order: "asc" }],
      };

      // Generate and export
      exporter.addSheet(sheetConfig);
      await exporter.export();

      AppToast({
        type: "success",
        message: "Successfully exported to Excel",
      });
    } catch (error: any) {
      AppToast({
        type: "error",
        message: "Failed to export to Excel",
      });
      console.log("Error exporting to Excel: ", error);
    } finally {
      setIsExportingToExcel(false);
    }
  };

  // Handle status filter change - directly updates the filter value
  const handleStatusChange = (status: string) => {
    setStatusFilter(status);
  };

  const handleEditUser = (user: UserModel) => {
    setSelectedUser(user);
    setMode(ModalMode.UPDATE_MODE);
    setIsModalOpen(true);
  };

  const handleAddUser = () => {
    setSelectedUser(null);
    setMode(ModalMode.CREATE_MODE);
    setIsModalOpen(true);
  };

  const handleViewUserDetail = (user: UserModel) => {
    setSelectedUser(user);
    setIsUserDetailOpen(true);
  };

  const handleDeleteUser = (user: UserModel) => {
    setSelectedUser(user);
    setIsDeleteDialogOpen(true);
  };

  const handleResetPassword = (user: UserModel) => {
    setSelectedUser(user);
    setIsResetPasswordDialogOpen(true);
  };

  return (
    <Card>
      <CardContent className="space-y-6 p-6">
        <div className="flex flex-wrap items-center justify-start gap-4 w-full">
          <div className="relative w-full md:w-[350px]">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              aria-label="search-user"
              autoComplete="search-user"
              type="search"
              placeholder={t("user.search-user")}
              value={searchQuery}
              onChange={handleSearchChange}
              className="pl-8 w-full min-w-[200px] text-xs md:min-w-[300px] h-9"
              disabled={isSubmitting}
            />
          </div>
          <div>
            {/* FIXED BUTTON WITH PROPER LOADING STATE AND TEXT */}
            <Button
              onClick={() => handleExportToExcel(users)}
              size="lg"
              variant="outline"
              className="gap-2 text-sm sm:text-base hover:bg-gray-200 duration-400 lg:text-lg px-3 sm:px-4 lg:px-6 py-2 lg:py-4"
              disabled={isExportingToExcel}
            >
              <img
                src={AppIcons.FILE.Excel}
                alt="Excel Icon"
                className="h-4 w-4 lg:h-5 lg:w-5 text-muted-foreground flex-shrink-0"
              />
              <span className="text-sm gap-2">
                {isExportingToExcel ? "Exporting..." : "Export"}
              </span>
              <Download className="w-4 h-4 lg:w-5 lg:h-5 flex-shrink-0" />
            </Button>
          </div>
          <div className="flex items-center gap-2">
            <StatusFilter
              setStatusFilter={setStatusFilter}
              statusFilter={statusFilter}
            />
          </div>
          <div>
            <Button onClick={handleAddUser}>{t("common.new")}</Button>
          </div>
        </div>

        <div className="w-full">
          <Separator className="bg-gray-300" />
        </div>

        <div>
          <div className="rounded-md border overflow-x-auto whitespace-nowrap">
            <DataTable
              data={users?.content || []}
              columns={createUserTableColumns({
                data: users,
                handlers: {
                  handleUserStatusToggle,
                  handleEditUser,
                  handleResetPassword,
                  handleViewUserDetail,
                  handleDeleteUser,
                },
              })}
              loading={isLoading}
              emptyMessage="No user found"
              getRowKey={(user) => user.id}
            />

            <CustomPagination
              currentPage={currentPage}
              totalPages={users?.totalPages || 1}
              onPageChange={handlePageChange}
              size="md"
            />
          </div>
        </div>

        <DeleteConfirmationDialog
          isOpen={isDeleteDialogOpen}
          onClose={() => {
            setIsDeleteDialogOpen(false);
            setSelectedUser(null);
          }}
          onDelete={confirmDeleteUser}
          title="Delete Admin"
          description={`Are you sure you want to delete the admin`}
          itemName={selectedUser?.fullName || selectedUser?.email}
          isSubmitting={isSubmitting}
        />

        <ResetPasswordModal
          isOpen={isResetPasswordDialogOpen}
          userName={selectedUser?.fullName || selectedUser?.email}
          onClose={() => {
            setIsResetPasswordDialogOpen(false);
            setSelectedUser(null);
          }}
          userId={selectedUser?.id ?? 0}
        />

        <UserViewModal
          isOpen={isUserDetailOpen}
          onClose={() => {
            setIsUserDetailOpen(false);
            setSelectedUser(null);
          }}
          user={selectedUser ?? undefined}
        />

        <ModalUser
          isOpen={isModalOpen}
          mode={mode}
          onClose={() => {
            setSelectedUser(null);
            setIsModalOpen(false);
          }}
          onSave={handleSaveUser}
          userId={selectedUser?.id ?? 0}
          isSubmitting={isSubmitting}
        />

        {/* Confirm Dialog */}
        <ConfirmDialog
          isOpen={isToggleStatusDialogOpen}
          onClose={() => {
            setIsToggleStatusDialogOpen(false);
            setSelectedUserToggle(null);
          }}
          title="Change user status"
          description={`Are you sure you want to ${
            selectedUserToggle?.userStatus === "ACTIVE" ? "disable" : "enable"
          } this user: ${selectedUserToggle?.fullName}?`}
          cancelLabel="Cancel"
          onConfirm={() => handleStatusToggle(selectedUserToggle)}
          variant="warning"
          size="md"
        />
      </CardContent>
    </Card>
  );
}
