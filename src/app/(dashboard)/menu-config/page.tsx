"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Loader2,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Users,
  Search,
  UserCog,
} from "lucide-react";
import { AppToast } from "@/components/shared/toast/app-toast";
import { menuService } from "@/services/menu/menu.service";
import { MenuItemDto } from "@/models/menu/menu.types";
import {
  MenuCreateRequestDto,
  MenuUpdateRequestDto,
} from "@/models/menu/menu.request";
import { MenuFormModal } from "@/components/app/menu-config/menu-form-modal";
import { AssignUsersModal } from "@/components/app/menu-config/assign-users-modal";
import { UserMenuConfigModal } from "@/components/app/menu-config/user-menu-config-modal";
import ConfirmDialog from "@/components/shared/dialog/dialog-confirm";
import { ModalMode } from "@/constants/AppResource/display-list/enum/mode";

export default function MenuConfigPage() {
  const [menus, setMenus] = useState<MenuItemDto[]>([]);
  const [allMenusForModal, setAllMenusForModal] = useState<MenuItemDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [pageNo, setPageNo] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");

  // Modals state
  const [isMenuFormModalOpen, setIsMenuFormModalOpen] = useState(false);
  const [isAssignUsersModalOpen, setIsAssignUsersModalOpen] = useState(false);
  const [isUserMenuConfigModalOpen, setIsUserMenuConfigModalOpen] =
    useState(false);

  const [selectedMenu, setSelectedMenu] = useState<MenuItemDto | null>(null);

  // Delete confirmation state
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [menuToDelete, setMenuToDelete] = useState<number | null>(null);

  const fetchMenus = async () => {
    setLoading(true);
    try {
      const response = await menuService.getAllMenus({
        pageNo,
        pageSize,
        search,
        isActive: true,
      });
      setMenus(response.content);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error("Failed to fetch menus:", error);
      AppToast({ type: "error", message: "Failed to fetch menus" });
    } finally {
      setLoading(false);
    }
  };

  const fetchAllMenusForModal = async () => {
    try {
      const response = await menuService.getAllMenus({
        pageNo: 1,
        pageSize: 1000, // Large number to get all menus
        search: "",
        isActive: true,
      });
      setAllMenusForModal(response.content);
    } catch (error) {
      console.error("Failed to fetch all menus:", error);
      AppToast({ type: "error", message: "Failed to fetch all menus" });
    }
  };

  useEffect(() => {
    fetchMenus();
  }, [pageNo, search]);

  const handleCreateMenu = async (values: any): Promise<void> => {
    try {
      const payload: MenuCreateRequestDto = {
        ...values,
        parentId: values.parentId,
        roles: values.roles || [],
      };
      await menuService.createMenu(payload);
      AppToast({ type: "success", message: "Menu created successfully" });
      setIsMenuFormModalOpen(false);
      setSelectedMenu(null);
      fetchMenus();
    } catch (error) {
      console.error("Failed to create menu:", error);
      AppToast({ type: "error", message: "Failed to create menu" });
    }
  };

  const handleUpdateMenu = async (values: any): Promise<void> => {
    if (!selectedMenu) return;
    try {
      const payload: MenuUpdateRequestDto = {
        ...values,
        parentId: values.parentId,
        roles: values.roles || [],
      };
      await menuService.updateMenu(selectedMenu.id, payload);
      AppToast({ type: "success", message: "Menu updated successfully" });
      setIsMenuFormModalOpen(false);
      setSelectedMenu(null);
      fetchMenus();
    } catch (error) {
      console.error("Failed to update menu:", error);
      AppToast({ type: "error", message: "Failed to update menu" });
    }
  };

  const handleDeleteMenu = (id: number) => {
    setMenuToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteMenu = async () => {
    if (!menuToDelete) return;
    try {
      await menuService.deleteMenu(menuToDelete);
      AppToast({ type: "success", message: "Menu deleted successfully" });
      fetchMenus();
    } catch (error) {
      console.error("Failed to delete menu:", error);
      AppToast({ type: "error", message: "Failed to delete menu" });
    } finally {
      setIsDeleteConfirmOpen(false);
      setMenuToDelete(null);
    }
  };

  const handleRemoveUserFromMenu = async (userId: number) => {
    if (!selectedMenu) return;
    try {
      await menuService.removeUsersFromMenu(selectedMenu.id, [userId]);
      AppToast({ type: "success", message: "User removed successfully" });
      // Refresh menu
      const updatedMenu = await menuService.getMenuById(selectedMenu.id);
      setSelectedMenu(updatedMenu);
      setMenus(menus.map((m) => (m.id === updatedMenu.id ? updatedMenu : m)));
    } catch (error) {
      console.error("Failed to remove user:", error);
      AppToast({ type: "error", message: "Failed to remove user" });
    }
  };

  // User Menu Configuration (Assign multiple menus to user)
  const handleFetchUserMenus = async (
    userId: number
  ): Promise<MenuItemDto[]> => {
    try {
      const menus: MenuItemDto[] = await menuService.getUserMenus(userId);

      // Return the full menu items, no flattening to IDs
      return menus;
    } catch (error) {
      console.error("Failed to fetch user menus:", error);
      AppToast({ type: "error", message: "Failed to fetch user menus" });
      throw error;
    }
  };

  const handleSaveUserMenus = async (userId: number, menuIds: number[]) => {
    try {
      console.log("##menu request: ", menuIds);

      const response = await menuService.assignMenusToUser({
        userId,
        menuIds,
      });
      console.log("##menu saved: ", response);
      if (response) {
        AppToast({
          type: "success",
          message: "User menus updated successfully",
        });
        setIsUserMenuConfigModalOpen(false);
      }
    } catch (error) {
      console.error("Failed to save user menus:", error);
      AppToast({ type: "error", message: "Failed to save user menus" });
    }
  };

  const openEditModal = (menu: MenuItemDto) => {
    setSelectedMenu(menu);
    setIsMenuFormModalOpen(true);
  };

  const openAssignUsersModal = (menu: MenuItemDto) => {
    setSelectedMenu(menu);
    setIsAssignUsersModalOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Menus</CardTitle>
              <CardDescription>
                Manage application menus, roles, and user access.
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={async () => {
                  await fetchAllMenusForModal();
                  setIsUserMenuConfigModalOpen(true);
                }}
                className="gap-2"
              >
                <UserCog className="h-4 w-4" /> User Menus
              </Button>
              <Button
                onClick={() => {
                  setSelectedMenu(null);
                  setIsMenuFormModalOpen(true);
                }}
                className="gap-2"
              >
                <Plus className="h-4 w-4" /> Create Menu
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-6">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search menus..."
                className="pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Icon</TableHead>
                  <TableHead>Href</TableHead>
                  <TableHead>Parent ID</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Order</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                    </TableCell>
                  </TableRow>
                ) : menus.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No menus found.
                    </TableCell>
                  </TableRow>
                ) : (
                  menus.map((menu) => (
                    <TableRow key={menu.id}>
                      <TableCell className="font-medium">
                        {menu.title}
                      </TableCell>
                      <TableCell>{menu.icon}</TableCell>
                      <TableCell>{menu.href}</TableCell>
                      <TableCell>{menu.parentId || "-"}</TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {menu.roles.map((role) => (
                            <Badge
                              key={role}
                              variant="secondary"
                              className="text-xs"
                            >
                              {role}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>{menu.displayOrder}</TableCell>
                      <TableCell>
                        <Badge
                          variant={menu.isActive ? "default" : "destructive"}
                        >
                          {menu.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuItem
                              onClick={() => openEditModal(menu)}
                            >
                              <Pencil className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              className="text-red-600"
                              onClick={() => handleDeleteMenu(menu.id)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-end space-x-2 py-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageNo((p) => Math.max(1, p - 1))}
              disabled={pageNo === 1}
            >
              Previous
            </Button>
            <div className="text-sm text-muted-foreground">
              Page {pageNo} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPageNo((p) => Math.min(totalPages, p + 1))}
              disabled={pageNo === totalPages}
            >
              Next
            </Button>
          </div>
        </CardContent>
      </Card>

      <MenuFormModal
        isOpen={isMenuFormModalOpen}
        onClose={() => {
          setIsMenuFormModalOpen(false);
          setSelectedMenu(null);
        }}
        mode={selectedMenu ? ModalMode.UPDATE_MODE : ModalMode.CREATE_MODE}
        menuData={selectedMenu}
        allMenus={menus}
        onSubmit={selectedMenu ? handleUpdateMenu : handleCreateMenu}
      />

      <UserMenuConfigModal
        isOpen={isUserMenuConfigModalOpen}
        onClose={() => setIsUserMenuConfigModalOpen(false)}
        allMenus={allMenusForModal}
        onFetchUserMenus={handleFetchUserMenus}
        onSaveUserMenus={handleSaveUserMenus}
      />

      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => {
          setIsDeleteConfirmOpen(false);
          setMenuToDelete(null);
        }}
        onConfirm={confirmDeleteMenu}
        title="Delete Menu"
        description="Are you sure you want to delete this menu? This action cannot be undone."
        variant="danger"
        confirmLabel="Delete"
      />
    </div>
  );
}
