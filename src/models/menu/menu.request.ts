import { RoleEnum } from "./menu.types";

export interface MenuCreateRequestDto {
    title: string;
    icon?: string;
    href?: string;
    parentId?: number;
    displayOrder: number;
    roles?: RoleEnum[];
    allowedUserIds?: number[];
    isActive?: boolean;
}

export interface MenuUpdateRequestDto {
    title?: string;
    icon?: string;
    href?: string;
    parentId?: number;
    displayOrder?: number;
    roles?: RoleEnum[];
    allowedUserIds?: number[];
    isActive?: boolean;
}

export interface GetAllMenuRequestDto {
    pageNo?: number;
    pageSize?: number;
    search?: string;
    isActive?: boolean;
    parentId?: number;
}

export interface AssignMenuToUserRequestDto {
    userIds: number[];
}
